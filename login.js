"use strict";
(() => {
  const config = window.TM_AUTH_CONFIG || {};
  const base = String(config.apiBase || "").replace(/\/+$/, "");
  const active = config.enabled === true && Boolean(base);
  const $ = id => document.getElementById(id);
  const loginForm = $("login-form"), registerForm = $("register-form");
  const loginBtn = $("login-submit"), registerBtn = $("register-submit");
  const loginEmail = $("login-email"), registerEmail = $("register-email");
  const loginPass = $("login-password"), registerPass = $("register-password");
  const status = (id, text, ok = false) => {
    const node = $(id);
    node.textContent = text;
    node.classList.toggle("ok", ok);
    node.hidden = !text;
  };
  const setBusy = (button, busy, normal, pending) => {
    button.disabled = busy || !active;
    button.querySelector("span").textContent = busy ? pending : normal;
  };

  function showMode(next, focus = true) {
    const register = next === "register";
    loginForm.hidden = register;
    registerForm.hidden = !register;
    $("login-intro").hidden = register;
    $("register-intro").hidden = !register;
    $("help-login").hidden = register;
    $("help-register").hidden = !register;
    $("tab-login").classList.toggle("active", !register);
    $("tab-register").classList.toggle("active", register);
    $("tab-login").setAttribute("aria-pressed", String(!register));
    $("tab-register").setAttribute("aria-pressed", String(register));
    status("login-status", "");
    status("register-status", "");
    if (focus) (register ? $("register-name") : loginEmail).focus();
    if (location.hash !== "#" + next) history.replaceState(null, "", "#" + next);
  }

  const togglePassword = (input, button) => {
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Sembunyi" : "Lihat";
      button.setAttribute("aria-pressed", String(show));
      button.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
    });
  };
  togglePassword(loginPass, $("toggle-password"));
  togglePassword(registerPass, $("toggle-register-password"));

  $("tab-login").addEventListener("click", () => showMode("login"));
  $("tab-register").addEventListener("click", () => showMode("register"));
  $("switch-to-login").addEventListener("click", () => showMode("login"));
  $("switch-to-register").addEventListener("click", () => showMode("register"));

  const notice = $("configuration-note");
  if (!active) {
    notice.hidden = false;
    loginBtn.disabled = true;
    registerBtn.disabled = true;
  } else {
    fetch(base + "/api/me", {credentials:"include", cache:"no-store"})
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data && data.user) location.replace("index.html"); })
      .catch(() => {});
  }

  async function post(path, data) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(base + path, {
        method:"POST",
        credentials:"include",
        cache:"no-store",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
        signal:controller.signal
      });
      const result = await response.json().catch(() => ({}));
      return {ok:response.ok, data:result};
    } finally { clearTimeout(timer); }
  }

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!active) return;
    if (!loginEmail.checkValidity() || !loginPass.value) {
      status("login-status", "Masukkan email dan password yang valid.");
      return;
    }
    status("login-status", "");
    setBusy(loginBtn, true, "Masuk ke Workspace", "Memverifikasi akun…");
    try {
      const result = await post("/api/login", {
        email:loginEmail.value.trim(), password:loginPass.value
      });
      if (!result.ok) {
        status("login-status", result.data.message || "Email atau password salah.");
        return;
      }
      loginPass.value = "";
      status("login-status", "Login berhasil. Membuka workspace…", true);
      location.replace("index.html");
    } catch {
      status("login-status", "Koneksi ke layanan login gagal. Periksa jaringan dan konfigurasi server.");
    } finally { setBusy(loginBtn, false, "Masuk ke Workspace", "Memverifikasi akun…"); }
  });

  registerForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!active) return;
    const name = $("register-name").value.trim();
    const email = registerEmail.value.trim();
    const password = registerPass.value;
    if (name.length < 2 || name.length > 80 || !registerEmail.checkValidity() ||
        password.length < 12 || password.length > 128) {
      status("register-status", "Isi nama, email yang valid, dan password minimal 12 karakter.");
      return;
    }
    status("register-status", "");
    setBusy(registerBtn, true, "Buat Akun Sekarang", "Menyimpan akun…");
    try {
      const result = await post("/api/register", {name,email,password});
      if (!result.ok) {
        status("register-status", result.data.message || "Pendaftaran belum berhasil.");
        return;
      }
      registerPass.value = "";
      loginEmail.value = email;
      showMode("login", false);
      status("login-status", "Akun berhasil dibuat! Silakan masuk dengan email dan password yang tadi didaftarkan.", true);
      loginPass.focus();
    } catch {
      status("register-status", "Gagal terhubung ke layanan pendaftaran. Silakan coba lagi.");
    } finally { setBusy(registerBtn, false, "Buat Akun Sekarang", "Menyimpan akun…"); }
  });

  showMode(location.hash === "#register" ? "register" : "login", false);
})();
