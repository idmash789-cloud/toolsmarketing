"use strict";
(() => {
  const config = window.TM_AUTH_CONFIG || {};
  const url = String(config.apiBase || "").replace(/\/+$/, "");
  const form = document.getElementById("login-form");
  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");
  const status = document.getElementById("login-status");
  const submit = document.getElementById("login-submit");
  const notice = document.getElementById("configuration-note");
  const toggle = document.getElementById("toggle-password");
  const message = (value, ok=false) => {
    status.textContent = value;
    status.classList.toggle("ok", ok);
    status.hidden = !value;
  };

  if (!config.enabled) {
    notice.hidden = false;
    submit.disabled = true;
    message("Akun belum dapat digunakan sebelum admin menghubungkan database Google Sheets.");
  } else if (url) {
    fetch(url + "/api/me", {credentials:"include", cache:"no-store"})
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.user) location.replace("index.html"); })
      .catch(() => {});
  }

  toggle.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    toggle.textContent = show ? "Sembunyi" : "Lihat";
    toggle.setAttribute("aria-pressed", String(show));
    toggle.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!config.enabled || !url) return;
    if (!email.validity.valid || !password.value) {
      message("Masukkan email dan password yang valid.");
      return;
    }
    message("");
    submit.disabled = true;
    submit.querySelector("span").textContent = "Memverifikasi akun…";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response;
      try {
        response = await fetch(url + "/api/login", {
          method:"POST",credentials:"include",cache:"no-store",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({email: email.value.trim(), password: password.value}),
          signal:controller.signal
        });
      } finally { clearTimeout(timeout); }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        message(data.message || "Login gagal. Periksa kembali email dan password.");
        return;
      }
      password.value = "";
      message("Login berhasil. Membuka workspace…", true);
      location.replace("index.html");
    } catch (err) {
      message("Server login belum tersedia atau koneksi terputus. Hubungi admin.");
    } finally {
      submit.disabled = false;
      submit.querySelector("span").textContent = "Masuk ke Workspace";
    }
  });
})();
