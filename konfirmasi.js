"use strict";
(() => {
 const cfg=window.TM_AUTH_CONFIG||{},api=String(cfg.apiBase||"").replace(/\/+$/,""),$=id=>document.getElementById(id);
 const showBlocked=msg=>{$("loading").hidden=true;$("owner-dashboard").hidden=true;$("blocked").hidden=false;$("blocked-message").textContent=msg;};
 if(cfg.enabled!==true||!api){showBlocked("Google Sheets dan Cloudflare Worker belum dikonfigurasi. Aktivasi integrasi terlebih dahulu.");return;}
 let owner=false;
 async function request(path,options={}){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
   try{const res=await fetch(api+path,{credentials:"include",cache:"no-store",signal:controller.signal,...options});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw Object.assign(new Error(data.message||"Server gagal merespons."),{status:res.status});
   return data;}finally{clearTimeout(timer);}
 }
 function status(msg,good=false){const el=$("form-status");el.textContent=msg;el.hidden=!msg;el.classList.toggle("success",good);}
 async function reload(){
   const body=$("user-rows");body.replaceChildren();
   const row=document.createElement("tr"),cell=document.createElement("td");cell.colSpan=3;cell.className="empty";cell.textContent="Memuat data…";row.appendChild(cell);body.appendChild(row);
   try{
     const result=await request("/api/admin/users");const users=result.users||[];
     $("total-users").textContent=String(users.length);
     $("total-members").textContent=String(users.filter(u=>!u.isOwner).length);
     body.replaceChildren();
     if(!users.length){cell.textContent="Belum ada pengguna.";body.appendChild(row);return;}
     for(const user of users){
       const tr=document.createElement("tr"),name=document.createElement("td"),email=document.createElement("td"),role=document.createElement("td"),tag=document.createElement("span");
       name.textContent=user.name;email.textContent=user.email;tag.className="tag"+(user.isOwner?" owner":"");tag.textContent=user.isOwner?"OWNER":"MEMBER";
       role.appendChild(tag);tr.append(name,email,role);body.appendChild(tr);
     }
   }catch(e){cell.textContent=e.message;body.replaceChildren();body.appendChild(row);}
 }
 async function init(){
   try{const d=await request("/api/me");
     if(!d.user){location.replace("login.html");return;}
     if(d.user.isOwner!==true){showBlocked("Akses ditolak. Hanya akun pemilik yang dapat mengakses halaman ini.");return;}
     owner=true;$("loading").hidden=true;$("owner-dashboard").hidden=false;$("logout-btn").hidden=false;await reload();
   }catch(e){if(e.status===401)location.replace("login.html");else showBlocked("Tidak dapat memverifikasi akses. Periksa konfigurasi dan login pemilik.");}
 }
 $("show-password").addEventListener("click",()=>{const f=$("password"),visible=f.type==="password";f.type=visible?"text":"password";$("show-password").textContent=visible?"Sembunyi":"Lihat";});
 $("refresh").addEventListener("click",reload);
 $("new-user").addEventListener("submit",async e=>{
   e.preventDefault();if(!owner)return;
   const name=$("name").value.trim(),email=$("email").value.trim(),password=$("password").value;
   if(name.length<2||name.length>80||!$("email").checkValidity()||password.length<12||password.length>128){status("Isi nama yang valid, email, dan password minimal 12 karakter.");return;}
   const btn=$("save-user");btn.disabled=true;status("");
   try{
     const result=await request("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
     $("new-user").reset();status(result.message||"Akun tersimpan.",true);await reload();
   }catch(err){status(err.message);}
   finally{btn.disabled=false;}
 });
 $("logout-btn").addEventListener("click",async()=>{try{await request("/api/logout",{method:"POST"});}catch{}location.replace("login.html");});
 init();
})();