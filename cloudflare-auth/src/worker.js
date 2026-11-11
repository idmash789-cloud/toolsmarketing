/* Tools Marketing Studio — Cloudflare Worker authentication API.
   Spreadsheet has exactly three columns: Nama | Email | Password.
   Password column always stores PBKDF2 hashes. Never store raw passwords. */
const textEncoder = new TextEncoder();
const COOKIE = "__Host-tm_session";
const SESSION_TTL = 7 * 24 * 60 * 60; // seven days
const HASH_ITERATIONS = 260000;
let googleTokenCache = null;

const encode = value => textEncoder.encode(value);
const b64url = input => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const unb64url = input => {
  const base = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base + "=".repeat((4 - base.length % 4) % 4));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
};
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff",
      ...extra
    }
  });

function corsHeaders(env, request) {
  const origin = request.headers.get("Origin");
  return origin === env.SITE_ORIGIN
    ? {"Access-Control-Allow-Origin":env.SITE_ORIGIN,
       "Access-Control-Allow-Credentials":"true",
       "Vary":"Origin"}
    : {};
}
function respond(env, request, data, status = 200, extra = {}) {
  return json(data, status, {...corsHeaders(env,request), ...extra});
}
function browserOriginAllowed(request, env) {
  return request.headers.get("Origin") === env.SITE_ORIGIN;
}
function sessionCookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
function readCookie(request) {
  const cookie = request.headers.get("Cookie") || "";
  const matched = cookie.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]*)"));
  return matched ? matched[1] : "";
}
function cleanEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function credentialsPresent(env) {
  return Boolean(env.SHEET_ID && env.GOOGLE_CLIENT_EMAIL &&
    env.GOOGLE_PRIVATE_KEY && env.SESSION_SECRET &&
    env.ADMIN_SETUP_TOKEN && env.OWNER_EMAIL && env.SITE_ORIGIN);
}
async function safeJson(request) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 15000) throw new Error("Payload too large");
  const raw = await request.text();
  if (raw.length > 15000) throw new Error("Payload too large");
  return JSON.parse(raw);
}
function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}
async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw",encode(password),"PBKDF2",false,["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits(
    {name:"PBKDF2", hash:"SHA-256", salt, iterations},key,256
  ));
}
async function passwordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt, HASH_ITERATIONS);
  return "pbkdf2$" + HASH_ITERATIONS + "$" + b64url(salt) + "$" + b64url(derived);
}
async function passwordMatches(password, saved) {
  if (typeof saved !== "string") return false;
  const parts = saved.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 150000 || iterations > 1000000) return false;
  try {
    const salt = unb64url(parts[2]);
    const expected = unb64url(parts[3]);
    if (salt.length !== 16 || expected.length !== 32) return false;
    return sameBytes(await pbkdf2(password, salt, iterations), expected);
  } catch { return false; }
}
async function passwordVersion(saved) {
  return b64url(await crypto.subtle.digest("SHA-256", encode(saved || "")));
}

async function googleAccessToken(env) {
  const now = Math.floor(Date.now()/1000);
  if (googleTokenCache && googleTokenCache.exp > now + 90) return googleTokenCache.token;
  const header = b64url(encode(JSON.stringify({alg:"RS256",typ:"JWT"})));
  const claim = b64url(encode(JSON.stringify({
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope:"https://www.googleapis.com/auth/spreadsheets",
    aud:"https://oauth2.googleapis.com/token",
    iat:now,exp:now+3600
  })));
  const input = header + "." + claim;
  const pem = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,"\n").replace(/-----[^-]+-----/g,"").replace(/\s/g,"");
  const rsaKey = await crypto.subtle.importKey("pkcs8",unb64url(pem.replace(/\+/g,"-").replace(/\//g,"_")),
    {name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5",rsaKey,encode(input));
  const assertion = input + "." + b64url(signature);
  const res = await fetch("https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }).toString()
  });
  if (!res.ok) throw new Error("Google authentication is not configured");
  const obj = await res.json();
  googleTokenCache = {token:obj.access_token,exp:now+Math.min(Number(obj.expires_in||3600),3600)};
  return obj.access_token;
}
function sheetsValuesURL(env, range) {
  return "https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(env.SHEET_ID) + "/values/" + encodeURIComponent(range);
}
async function listUsers(env) {
  const name = env.SHEET_TAB || "Users";
  const range = "'" + name.replace(/'/g,"''") + "'!A2:C";
  const response = await fetch(sheetsValuesURL(env,range),{
    headers:{Authorization:"Bearer " + await googleAccessToken(env)},
    cf:{cacheTtl:0}
  });
  if (!response.ok) throw new Error("Unable to read the users spreadsheet");
  const result = await response.json();
  return (result.values || []).map((row, index) => ({
    row:index + 2,name:String(row[0] || "").trim(),
    email:cleanEmail(row[1] || ""),hash:String(row[2] || "")
  })).filter(row => row.email);
}
async function appendUser(env, name, email, hash) {
  const tab = env.SHEET_TAB || "Users";
  const range = "'" + tab.replace(/'/g,"''") + "'!A:C";
  const url = sheetsValuesURL(env,range) + ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS";
  const response = await fetch(url,{
    method:"POST",
    headers:{Authorization:"Bearer " + await googleAccessToken(env),"Content-Type":"application/json"},
    body:JSON.stringify({values:[[name,email,hash]]})
  });
  if (!response.ok) throw new Error("Unable to add user to Google Sheets");
}
async function overwritePassword(env, row, hash) {
  const tab = env.SHEET_TAB || "Users";
  const range = "'" + tab.replace(/'/g,"''") + "'!C" + row;
  const response = await fetch(sheetsValuesURL(env,range) + "?valueInputOption=RAW",{
    method:"PUT",
    headers:{Authorization:"Bearer " + await googleAccessToken(env),"Content-Type":"application/json"},
    body:JSON.stringify({range,majorDimension:"ROWS",values:[[hash]]})
  });
  if (!response.ok) throw new Error("Unable to update password");
}

async function sessionKey(env) {
  return crypto.subtle.importKey("raw",encode(env.SESSION_SECRET),"HMAC",
    {name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);
}
async function signSession(env,user) {
  const encoded = b64url(encode(JSON.stringify({
    em:user.email,n:user.name,pv:user.pv,exp:Math.floor(Date.now()/1000)+SESSION_TTL
  })));
  const mac = await crypto.subtle.sign("HMAC",await sessionKey(env),encode(encoded));
  return encoded+"."+b64url(mac);
}
async function verifySession(env, token) {
  if (!token || token.length > 2000) return null;
  const [data,mac,...extra]=token.split(".");
  if (!data || !mac || extra.length) return null;
  try {
    const verified = await crypto.subtle.verify("HMAC",await sessionKey(env),
      unb64url(mac),encode(data));
    if (!verified) return null;
    const payload = JSON.parse(new TextDecoder().decode(unb64url(data)));
    if (!payload.em || !validEmail(payload.em) ||
        !Number.isFinite(payload.exp) || payload.exp < Date.now()/1000) return null;
    return payload;
  } catch { return null; }
}
async function authenticatedUser(env,request) {
  const session = await verifySession(env,readCookie(request));
  if (!session) return null;
  const user=(await listUsers(env)).find(row => row.email === session.em);
  if (!user || !user.hash || await passwordVersion(user.hash) !== session.pv) return null;
  return {name:user.name,email:user.email,isOwner:user.email===cleanEmail(env.OWNER_EMAIL)};
}
async function adminAuthorized(env,request) {
  if (!env.ADMIN_SETUP_TOKEN || env.ADMIN_SETUP_TOKEN.length < 32) return false;
  const header=request.headers.get("Authorization") || "";
  const supplied=header.startsWith("Bearer ") ? header.slice(7) : "";
  return sameBytes(encode(supplied),encode(env.ADMIN_SETUP_TOKEN));
}
async function main(request,env) {
  const path=new URL(request.url).pathname;
  if (request.method === "OPTIONS") {
    if (!browserOriginAllowed(request,env)) return json({message:"Origin not allowed"},403);
    return new Response(null,{status:204,headers:{
      ...corsHeaders(env,request),
      "Access-Control-Allow-Methods":"GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type",
      "Access-Control-Max-Age":"600",
      "Cache-Control":"no-store"
    }});
  }
  if (path === "/api/health" && request.method === "GET")
    return respond(env,request,{ok:true,configured:credentialsPresent(env)});
  if (!credentialsPresent(env) || env.SESSION_SECRET.length < 32)
    return respond(env,request,{message:"Sistem login belum dikonfigurasi."},503);

  if (path === "/api/login" && request.method === "POST") {
    if (!browserOriginAllowed(request,env))
      return respond(env,request,{message:"Origin tidak diizinkan."},403);
    if (!env.LOGIN_LIMITER)
      return respond(env,request,{message:"Login rate limiter belum dikonfigurasi."},503);
    const rate=await env.LOGIN_LIMITER.limit({key:"login:"+(request.headers.get("CF-Connecting-IP")||"unknown")});
    if (!rate.success) return respond(env,request,{message:"Terlalu banyak percobaan. Coba lagi nanti."},429);
    let form;
    try {form=await safeJson(request);}catch{return respond(env,request,{message:"Data login tidak valid."},400);}
    const email=cleanEmail(form.email),password=form.password;
    if (!validEmail(email)||typeof password!=="string"||password.length>1024||!password)
      return respond(env,request,{message:"Email atau password salah."},401);
    const users=await listUsers(env);
    const user=users.find(entry=>entry.email===email);
    if (!user || !(await passwordMatches(password,user.hash)))
      return respond(env,request,{message:"Email atau password salah."},401);
    const token=await signSession(env,{name:user.name,email:user.email,pv:await passwordVersion(user.hash)});
    return respond(env,request,{ok:true,user:{name:user.name,email:user.email,isOwner:user.email===cleanEmail(env.OWNER_EMAIL)}},200,
      {"Set-Cookie":sessionCookie(token,SESSION_TTL)});
  }

  if (path === "/api/me" && request.method === "GET") {
    const user=await authenticatedUser(env,request);
    if (!user) return respond(env,request,{message:"Sesi tidak valid."},401,
      {"Set-Cookie":sessionCookie("",0)});
    return respond(env,request,{user});
  }

  if (path === "/api/logout" && request.method === "POST") {
    if (!browserOriginAllowed(request,env)) return respond(env,request,{message:"Origin tidak diizinkan."},403);
    return respond(env,request,{ok:true},200,{"Set-Cookie":sessionCookie("",0)});
  }

  /* Bootstrap first owner through server-side secret, not through public registration. */
  if(path==="/api/setup/owner" && request.method==="POST"){
    if(!(await adminAuthorized(env,request)))
      return respond(env,request,{message:"Unauthorized"},401);
    const ownerEmail=cleanEmail(env.OWNER_EMAIL);
    if(!validEmail(ownerEmail))return respond(env,request,{message:"OWNER_EMAIL invalid."},503);
    const users=await listUsers(env);
    if(users.some(u=>u.email===ownerEmail))
      return respond(env,request,{message:"Akun pemilik sudah tersedia."},409);
    let form;try{form=await safeJson(request);}catch{return respond(env,request,{message:"Data tidak valid."},400);}
    const name=typeof form.name==="string"?form.name.trim():"",password=form.password;
    if(name.length<2||name.length>80||typeof password!=="string"||password.length<12||password.length>128)
      return respond(env,request,{message:"Nama 2–80 karakter dan password 12–128 karakter diperlukan."},400);
    await appendUser(env,name,ownerEmail,await passwordHash(password));
    return respond(env,request,{ok:true,message:"Akun pemilik berhasil dibuat."},201);
  }

  /* All user management routes require valid owner session.
     Knowing the static confirmation page's URL does not authorize access. */
  if(path.startsWith("/api/admin/")){
    if(request.method!=="GET"&&request.method!=="POST")return respond(env,request,{message:"Method not allowed"},405);
    if(!browserOriginAllowed(request,env))return respond(env,request,{message:"Origin tidak diizinkan."},403);
    const owner=await authenticatedUser(env,request);
    if(!owner)return respond(env,request,{message:"Silakan login terlebih dahulu."},401);
    if(!owner.isOwner)return respond(env,request,{message:"Hanya pemilik yang boleh mengelola pengguna."},403);
    if(path==="/api/admin/users"&&request.method==="GET"){
      const users=(await listUsers(env)).map(row=>({
        name:row.name,email:row.email,isOwner:row.email===cleanEmail(env.OWNER_EMAIL)
      }));
      return respond(env,request,{users,count:users.length});
    }
    if((path==="/api/admin/users"||path==="/api/admin/reset-password")&&request.method==="POST"){
      let form;try{form=await safeJson(request);}catch{return respond(env,request,{message:"Data tidak valid."},400);}
      const email=cleanEmail(form.email),password=form.password;
      if(!validEmail(email)||typeof password!=="string"||password.length<12||password.length>128)
        return respond(env,request,{message:"Email valid dan password 12–128 karakter diperlukan."},400);
      const users=await listUsers(env),existing=users.find(row=>row.email===email);
      if(path==="/api/admin/users"){
        const name=typeof form.name==="string"?form.name.trim():"";
        if(name.length<2||name.length>80)return respond(env,request,{message:"Nama harus 2–80 karakter."},400);
        if(email===cleanEmail(env.OWNER_EMAIL))return respond(env,request,{message:"Email khusus pemilik tidak bisa ditambahkan di form."},403);
        if(existing)return respond(env,request,{message:"Email sudah terdaftar."},409);
        await appendUser(env,name,email,await passwordHash(password));
        return respond(env,request,{ok:true,message:"Pengguna berhasil disimpan ke Google Sheets.",user:{name,email}},201);
      }
      if(!existing)return respond(env,request,{message:"Pengguna tidak ditemukan."},404);
      if(email===cleanEmail(env.OWNER_EMAIL))
        return respond(env,request,{message:"Password pemilik tidak dapat diganti lewat endpoint ini."},403);
      await overwritePassword(env,existing.row,await passwordHash(password));
      return respond(env,request,{ok:true,message:"Password anggota diperbarui."});
    }
    return respond(env,request,{message:"Not found"},404);
  }
  return respond(env,request,{message:"Not found"},404);
}
export default {
  async fetch(request,env) {
    try {return await main(request,env);}
    catch(err) {
      console.error("Auth request failed:",err?.message||"unknown");
      return respond(env,request,{message:"Layanan login sedang bermasalah. Hubungi admin."},500);
    }
  }
};
