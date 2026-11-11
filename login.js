"use strict";
(() => {
  const $=id=>document.getElementById(id),auth=window.TMLocalAuth;
  const form=$("login-form"),email=$("login-email"),password=$("login-password"),button=$("login-submit");
  const message=(value,ok=false)=>{const el=$("login-status");el.textContent=value;el.hidden=!value;el.classList.toggle("ok",ok);};
  if(auth.currentUser()){location.replace("index.html");return;}
  try {
    const newlyRegistered=sessionStorage.getItem("tm_registration_email");
    if(newlyRegistered){email.value=newlyRegistered;sessionStorage.removeItem("tm_registration_email");message("Akun berhasil dibuat! Masukkan password untuk login.",true);}
  }catch{}
  $("toggle-password").addEventListener("click",()=>{
    const show=password.type==="password";password.type=show?"text":"password";
    $("toggle-password").textContent=show?"Sembunyi":"Lihat";
    $("toggle-password").setAttribute("aria-pressed",String(show));
  });
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!email.checkValidity() || !password.value){message("Masukkan email dan password yang valid.");return;}
    button.disabled=true;button.firstElementChild.textContent="Memverifikasi akun…";message("");
    try{
      await auth.login(email.value,password.value);
      password.value="";
      message("Login berhasil. Membuka workspace…",true);
      location.replace("index.html");
    }catch(err){message(err.message||"Login gagal.");}
    finally{button.disabled=false;button.firstElementChild.textContent="Masuk ke Workspace";}
  });
})();
