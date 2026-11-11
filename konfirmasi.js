"use strict";
(() => {
  const $=id=>document.getElementById(id),auth=window.TMLocalAuth;
  const form=$("register-form"),name=$("register-name"),email=$("register-email"),password=$("register-password");
  const button=$("register-submit"),message=$("register-status");
  const status=(text,ok=false)=>{message.textContent=text;message.hidden=!text;message.classList.toggle("ok",ok);};
  $("toggle-register-password").addEventListener("click",()=>{
    const show=password.type==="password";
    password.type=show?"text":"password";
    $("toggle-register-password").textContent=show?"Sembunyi":"Lihat";
    $("toggle-register-password").setAttribute("aria-pressed",String(show));
  });
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    if(name.value.trim().length<2||name.value.trim().length>80||!email.checkValidity()||
       password.value.length<8||password.value.length>128){
      status("Isi nama, email yang valid, dan password minimal 8 karakter.");return;
    }
    button.disabled=true;button.firstElementChild.textContent="Membuat akun…";status("");
    try{
      const user=await auth.register(name.value,email.value,password.value);
      password.value="";
      status("Akun berhasil dibuat. Membuka halaman login…",true);
      try{sessionStorage.setItem("tm_registration_email",user.email);}catch{}
      location.replace("login.html");
    }catch(err){status(err.message||"Akun belum dapat dibuat.");}
    finally{button.disabled=false;button.firstElementChild.textContent="Buat Akun Saya";}
  });
})();
