"use strict";
(() => {
  const cfg=window.TM_AUTH_CONFIG||{},base=String(cfg.apiBase||"").replace(/\/+$/,"");
  const enabled=cfg.enabled===true&&Boolean(base),$=id=>document.getElementById(id);
  const form=$("login-form"),email=$("login-email"),password=$("login-password"),button=$("login-submit");
  const message=(value,ok=false)=>{const e=$("login-status");e.textContent=value;e.hidden=!value;e.classList.toggle("ok",ok);};
  $("toggle-password").addEventListener("click",()=>{
    const show=password.type==="password";password.type=show?"text":"password";
    $("toggle-password").textContent=show?"Sembunyi":"Lihat";
    $("toggle-password").setAttribute("aria-pressed",String(show));
  });
  if(!enabled){$("configuration-note").hidden=false;button.disabled=true;}
  else fetch(base+"/api/me",{credentials:"include",cache:"no-store"})
    .then(r=>r.ok?r.json():null).then(d=>{if(d?.user)location.replace("index.html");}).catch(()=>{});
  form.addEventListener("submit",async e=>{
    e.preventDefault();if(!enabled)return;
    if(!email.checkValidity()||!password.value){message("Masukkan email dan password yang valid.");return;}
    button.disabled=true;button.firstElementChild.textContent="Memverifikasi akun…";message("");
    const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),20000);
    try{
      const response=await fetch(base+"/api/login",{method:"POST",credentials:"include",cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:email.value.trim(),password:password.value}),signal:ac.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){message(data.message||"Email atau password salah.");return;}
      password.value="";message("Login berhasil. Membuka workspace…",true);location.replace("index.html");
    }catch{message("Server login tidak tersedia. Coba kembali.");}
    finally{clearTimeout(timer);button.disabled=false;button.firstElementChild.textContent="Masuk ke Workspace";}
  });
})();
