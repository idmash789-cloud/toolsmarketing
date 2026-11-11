"use strict";
/* Browser-only account system for a cosmetic premium login experience.
   It is NOT secure license enforcement or a server-side paywall. */
window.TMLocalAuth = (() => {
  const USERS = "tm_local_accounts_v1";
  const SESSION = "tm_local_session_v1";
  const ROUNDS = 180000;
  const encoder = new TextEncoder();
  const normalizedEmail = input => String(input || "").trim().toLowerCase();
  function accounts() {
    try {
      const value = JSON.parse(localStorage.getItem(USERS) || "[]");
      return Array.isArray(value) ? value.filter(u => u && typeof u.email === "string" && typeof u.salt === "string" && typeof u.hash === "string") : [];
    } catch { return []; }
  }
  function base64(bytes) {
    let str = "";
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str);
  }
  const unbase64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
  async function hashPassword(password, salt) {
    if (!crypto.subtle) throw Error("Browser harus memakai HTTPS agar akun bisa disimpan.");
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits(
      {name:"PBKDF2",hash:"SHA-256",salt,iterations:ROUNDS}, key, 256
    ));
  }
  function equalBytes(a,b) {
    if (a.length!==b.length) return false;
    let differences=0;
    for(let i=0;i<a.length;i++) differences |= a[i]^b[i];
    return differences===0;
  }
  async function register(nameValue,emailValue,password) {
    const name=String(nameValue||"").trim();
    const email=normalizedEmail(emailValue);
    if(name.length<2 || name.length>80) throw Error("Nama harus 2–80 karakter.");
    if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error("Alamat email tidak valid.");
    if(typeof password!=="string" || password.length<8 || password.length>128) throw Error("Password harus 8–128 karakter.");
    const data=accounts();
    if(data.some(user=>user.email===email)) throw Error("Email sudah terdaftar di browser ini. Silakan login.");
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const hash=await hashPassword(password,salt);
    data.push({name,email,salt:base64(salt),hash:base64(hash)});
    try {localStorage.setItem(USERS,JSON.stringify(data));}
    catch {throw Error("Penyimpanan browser tidak tersedia. Periksa pengaturan privasi.");}
    return {name,email};
  }
  async function login(emailValue,password) {
    const email=normalizedEmail(emailValue);
    const user=accounts().find(u=>u.email===email);
    if(!user) throw Error("Akun tidak ditemukan di browser ini. Gunakan tautan konfirmasi untuk aktivasi.");
    let valid=false;
    try {
      const actual=await hashPassword(password,unbase64(user.salt));
      valid=equalBytes(actual,unbase64(user.hash));
    } catch {throw Error("Tidak dapat memverifikasi password.");}
    if(!valid) throw Error("Password salah.");
    localStorage.setItem(SESSION,JSON.stringify({email,expires:Date.now()+30*86400000}));
    return {name:user.name,email};
  }
  function currentUser(){
    let s;
    try {s=JSON.parse(localStorage.getItem(SESSION)||"null");} catch {return null;}
    if(!s || !s.email || !Number.isFinite(s.expires) || s.expires<Date.now())return null;
    const user=accounts().find(u=>u.email===s.email);
    return user?{name:user.name,email:user.email}:null;
  }
  function logout(){localStorage.removeItem(SESSION);}
  return Object.freeze({register,login,currentUser,logout});
})();
