"use strict";
/* Browser-only visual gate. The static site's source files remain public. */
(() => {
  const auth=window.TMLocalAuth;
  const user=auth && auth.currentUser();
  if(!user){location.replace("login.html");return;}
  const guestLink=document.querySelector(".header-auth-link");
  if(guestLink)guestLink.remove();
  const nav=document.querySelector(".topbar-right");
  if(nav){
    const profile=document.createElement("div");
    profile.className="member-nav";
    const avatar=document.createElement("span");avatar.className="member-avatar";
    avatar.textContent=(user.name||"M").trim().slice(0,1).toUpperCase();
    const label=document.createElement("span");label.className="member-nav-name";label.textContent=user.name;
    const logout=document.createElement("button");logout.className="member-logout";logout.type="button";logout.textContent="Keluar";
    logout.addEventListener("click",()=>{auth.logout();location.replace("login.html");});
    profile.append(avatar,label,logout);
    nav.appendChild(profile);
  }
  const hero=document.querySelector(".hero-copy");
  if(hero){
    const welcome=document.createElement("p");
    welcome.className="member-welcome";
    welcome.textContent="SELAMAT DATANG, "+user.name.toUpperCase();
    hero.insertBefore(welcome,hero.firstChild);
  }
})();
