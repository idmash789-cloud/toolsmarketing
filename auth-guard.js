"use strict";
/* Frontend navigation guard. For strong access control, deploy the
   site behind server-side access control as explained in SETUP-AUTH.md.
   JavaScript on a public static host is NOT a security boundary. */
(() => {
  const config = window.TM_AUTH_CONFIG || {};
  if (!config.enabled) return;
  document.documentElement.classList.add("auth-pending");
  const url = String(config.apiBase || "").replace(/\/+$/, "");
  if (!url) { location.replace("login.html"); return; }

  const req = fetch(url + "/api/me",{credentials:"include",cache:"no-store"})
    .then(async response => {
      if (!response.ok) throw new Error("Session expired");
      const data = await response.json();
      if (!data || !data.user || !data.user.email) throw new Error("No session");
      const user=data.user;
      const nav = document.querySelector(".topbar-right");
      if (nav) {
        const profile=document.createElement("div");
        profile.className="member-nav";
        const avatar=document.createElement("span");
        avatar.className="member-avatar";
        avatar.textContent=(user.name || user.email).trim().slice(0,1).toUpperCase();
        const label=document.createElement("span");
        label.className="member-nav-name";
        label.textContent=user.name || user.email;
        const logout=document.createElement("button");
        logout.className="member-logout";
        logout.type="button";
        logout.textContent="Keluar";
        logout.addEventListener("click",async () => {
          logout.disabled=true;
          try {await fetch(url + "/api/logout",{method:"POST",credentials:"include"});}
          finally {location.replace("login.html");}
        });
        profile.append(avatar,label,logout);
        nav.appendChild(profile);
      }
      const hero=document.querySelector(".hero-copy");
      if(hero){
        const welcome=document.createElement("p");
        welcome.className="member-welcome";
        welcome.textContent="SELAMAT DATANG, " + (user.name || "MEMBER").toUpperCase();
        hero.insertBefore(welcome,hero.firstChild);
      }
      document.documentElement.classList.remove("auth-pending");
    })
    .catch(()=>location.replace("login.html"));
  window.TM_SESSION_READY=req;
})();
