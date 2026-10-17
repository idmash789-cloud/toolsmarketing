/* Tools Marketing — AI BYOK layer
 * Setiap visitor memasukkan API key-nya sendiri. Key disimpan HANYA di
 * browser-nya (localStorage), tidak pernah di kode/repo/server manapun. */

const TM_AI_KEY = "tm_ai_settings";

const PROVIDERS = {
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    defaultBase: "https://api.openai.com/v1",
    chatUrl: (s) => s.baseUrl.replace(/\/+$/, "") + "/chat/completions",
    openaiStyle: true,
    hint: "Contoh model: gpt-4o-mini, gpt-4o.",
  },
  openrouter: {
    label: "OpenRouter",
    defaultModel: "meta-llama/llama-3.3-70b-instruct",
    defaultBase: "https://openrouter.ai/api/v1",
    chatUrl: (s) => s.baseUrl.replace(/\/+$/, "") + "/chat/completions",
    openaiStyle: true,
    extraHeaders: () => ({
      "HTTP-Referer": location.origin,
      "X-Title": "Tools Marketing",
    }),
    hint: "Cari model gratis di openrouter.ai/models lalu tulis ID-nya di sini.",
  },
  groq: {
    label: "Groq",
    defaultModel: "openai/gpt-oss-120b",
    defaultBase: "https://api.groq.com/openai/v1",
    chatUrl: (s) => s.baseUrl.replace(/\/+$/, "") + "/chat/completions",
    openaiStyle: true,
    // Model lama Groq (llama-3.3-70b-versatile, llama-3.1-8b-instant) dinonaktifkan
    // untuk free/developer tier sejak 16 Agu 2026. Default resmi penggantinya:
    altModels: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3-32b"],
    hint: "Default resmi Groq: openai/gpt-oss-120b / gpt-oss-20b / qwen/qwen3-32b. Model llama-3.3/3.1 lama sudah dinonaktifkan untuk free tier.",
  },
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-2.0-flash",
    defaultBase: "https://generativelanguage.googleapis.com/v1beta",
    geminiStyle: true,
    hint: "Contoh model: gemini-2.0-flash, gemini-1.5-flash. Key diambil dari Google AI Studio.",
  },
  kie: {
    label: "Kie AI",
    defaultModel: "gemini-3-flash",
    defaultBase: "https://api.kie.ai",
    kieStyle: true,
    hint: "Key diambil dari kie.ai/api-key. Nama model otomatis dimasukkan ke jalur URL oleh aplikasi (tidak perlu ditulis di alamat). Klik '🔄 Ambil daftar model dari endpoint' untuk melihat model chat yang tersedia, lalu pilih satu. CATATAN: model keluarga Claude TIDAK bisa dipakai di jalur ini (format protokolnya berbeda — Anthropic Messages); pilih model Gemini atau model chat lainnya.",
  },
  router9: {
    label: "9Router (lokal)",
    defaultModel: "kr/claude-sonnet-4.5",
    defaultBase: "http://localhost:20128/v1",
    chatUrl: (s) => s.baseUrl.replace(/\/+$/, "") + "/chat/completions",
    openaiStyle: true,
    hint: "Model harus SAMA PERSIS dengan yang ada di dashboard 9Router-mu (mis. kr/claude-sonnet-4.5 atau nama combo). 9Router harus jalan di komputer yang SAMA dengan browser ini; kalau situs dibuka via HTTPS, pakai URL tunnel HTTPS (Cloudflare/Tailscale) sebagai Base URL. Jika panggilan langsung ke http://localhost:20128/v1 selalu gagal 'Failed to fetch' (masalah CORS 9Router), jalankan 'node server.js' di folder aplikasi, buka http://localhost:8090, dan isi Base URL dengan http://localhost:8090/proxy9/v1.",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    defaultModel: "",
    defaultBase: "",
    chatUrl: (s) => s.baseUrl.replace(/\/+$/, "") + "/chat/completions",
    openaiStyle: true,
    hint: "Isi Base URL endpoint OpenAI-compatible-mu + nama model yang tersedia di sana.",
  },
};

function tmLoadSettings() {
  try {
    const raw = localStorage.getItem(TM_AI_KEY);
    if (raw) return Object.assign(
      { provider: "groq", model: "", baseUrl: "", apiKey: "" },
      JSON.parse(raw)
    );
  } catch (e) { /* abaikan */ }
  return { provider: "groq", model: "", baseUrl: "", apiKey: "" };
}

function tmSaveSettings(s) {
  localStorage.setItem(TM_AI_KEY, JSON.stringify(s));
}

function tmNormalizeBaseUrl(raw, providerKey) {
  let u = (raw || "").trim().replace(/\/+$/, "");
  if (!u) return u;
  // Kesalahan umum: skema http(s):// lupa ditulis (mis. "tamandata.cloud/v1").
  // Tanpa skema, browser menganggapnya alamat relatif dan request pasti gagal.
  if (!/^https?:\/\//i.test(u)) {
    u = (/^(localhost|127\.)/i.test(u) ? "http://" : "https://") + u;
  }
  // Kesalahan umum: user menyalin URL dari address bar dashboard 9Router
  // (http://localhost:20128/dashboard) — itu halaman web, BUKAN endpoint API.
  u = u.replace(/\/dashboard$/i, "").replace(/\/login$/i, "").replace(/\/+$/, "");
  // Kesalahan umum lain: user menempel alamat LENGKAP daftar model
  // (berakhiran /models) sebagai Base URL — Base URL adalah alamat dasarnya saja.
  u = u.replace(/\/models$/i, "").replace(/\/+$/, "");
  // Untuk 9Router, endpoint API selalu berakhiran /v1
  if (providerKey === "router9" && /^https?:\/\/[^\/]+$/.test(u)) {
    u += "/v1";
  }
  return u;
}

function tmEffective(settings) {
  const p = PROVIDERS[settings.provider] || PROVIDERS.groq;
  // Base URL tersimpan HANYA berlaku untuk provider yang kolom Base URL-nya
  // memang tampil & bisa diedit (Custom, 9Router). Untuk provider lain kolom
  // itu tersembunyi — memakai nilai lama dari provider sebelumnya (mis. sisa
  // alamat Kie /anthropic atau tamandata) akan merusak request tanpa terlihat.
  const editableBase = settings.provider === "custom" || settings.provider === "router9";
  const rawBase = editableBase ? ((settings.baseUrl || "").trim() || p.defaultBase) : p.defaultBase;
  return {
    provider: settings.provider,
    label: p.label,
    model: (settings.model || "").trim() || p.defaultModel,
    baseUrl: tmNormalizeBaseUrl(rawBase, settings.provider),
    apiKey: (settings.apiKey || "").trim(),
    def: p,
  };
}

/* Kie AI menempatkan nama model di JALUR URL, bukan di body request:
 * POST https://api.kie.ai/{model}/v1/chat/completions */
function tmKieRoot(baseUrl) {
  // Akar Kie selalu hanya skema + host (https://api.kie.ai) — jalur apa pun
  // yang terbawa di belakangnya (mis. /anthropic/v1 sisa pengaturan lama)
  // harus dibuang, kalau tidak URL-nya jadi dobel: /anthropic/api/v1/...
  const raw = (baseUrl || "").trim();
  try { return new URL(raw).origin; } catch (e) { /* lanjut ke fallback */ }
  const m = raw.match(/^(https?:\/\/[^\/]+)/i);
  return m ? m[1] : "https://api.kie.ai";
}

/* Instruksi pembungkus: AI diminta menghasilkan HASIL AKHIR, bukan prompt. */
function tmWrapSpec(specText, toolLabel) {
  return (
    "Kamu adalah asisten pemasaran berbahasa Indonesia.\n" +
    "Tugasmu: menghasilkan HASIL AKHIR untuk tool '" + toolLabel + "', " +
    "mengikuti spesifikasi di bawah ini persis. " +
    "Tulis LANGSUNG hasil akhirnya dalam Bahasa Indonesia yang natural dan siap pakai. " +
    "Jangan mengulang atau menampilkan spesifikasi/prompt-nya, jangan memberi prolog seperti " +
    "'Berikut hasilnya' — langsung ke isi.\n\n" +
    "=== SPESIFIKASI ===\n" + specText
  );
}

function tmBuildRequest(specText, toolLabel, settings) {
  const e = tmEffective(settings);
  const fullPrompt = tmWrapSpec(specText, toolLabel);

  if (e.provider === "kie") {
    // Kie: nama model di jalur URL (mis. https://api.kie.ai/gemini-3-flash/v1/chat/completions),
    // tidak ada di body. Format request/response gaya OpenAI (messages / choices).
    const url = tmKieRoot(e.baseUrl) + "/" + encodeURIComponent(e.model) + "/v1/chat/completions";
    const headers = { "Content-Type": "application/json" };
    if (e.apiKey) headers["Authorization"] = "Bearer " + e.apiKey;
    return {
      provider: "kie",
      url,
      options: {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.7,
          stream: false,
        }),
      },
    };
  }

  if (e.provider === "gemini") {
    const url =
      e.baseUrl.replace(/\/+$/, "") +
      "/models/" + encodeURIComponent(e.model) +
      ":generateContent?key=" + encodeURIComponent(e.apiKey);
    return {
      provider: "gemini",
      url,
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      },
    };
  }

  // OpenAI-style (openai, openrouter, groq, router9, custom)
  const body = {
    model: e.model,
    messages: [{ role: "user", content: fullPrompt }],
    temperature: 0.7,
    stream: false, // minta jawaban utuh, bukan streaming (9Router tetap kadang streaming — ditangani tmSseToJson)
  };
  // Model gpt-oss Groq pakai reasoning token; batasi effort agar tidak memakan max_tokens
  if (e.provider === "groq" && e.model.indexOf("gpt-oss") !== -1) {
    body.reasoning_effort = "low";
  }
  const headers = { "Content-Type": "application/json" };
  if (e.apiKey) headers["Authorization"] = "Bearer " + e.apiKey;
  if (e.def.extraHeaders) Object.assign(headers, e.def.extraHeaders());
  return {
    provider: e.provider,
    url: e.def.chatUrl(e),
    options: { method: "POST", headers, body: JSON.stringify(body) },
  };
}

/* Ambil daftar model resmi dari endpoint (GET {baseUrl}/models, standar
 * OpenAI-compatible). Dijalankan dari browser user dengan key user sendiri,
 * jadi nama model tidak perlu ditebak-tebak. */
async function tmFetchModels(rawSettings, fetchImpl) {
  const fetchFn = fetchImpl || fetch;
  const e = tmEffective(rawSettings);
  if (e.def.geminiStyle) {
    throw new Error("Provider Gemini tidak memakai daftar /models seperti ini. Isi nama model manual, mis. gemini-2.0-flash.");
  }
  if (!e.baseUrl) throw new Error("Base URL belum diisi.");
  // Kie: katalog model ada di https://api.kie.ai/api/v1/models (bukan di jalur per-model)
  const isKie = e.provider === "kie";
  if (isKie && !e.apiKey) {
    throw new Error("API key Kie AI belum diisi. Isi dulu kolom API Key di panel ini (key dari kie.ai/api-key), lalu klik Ambil daftar model lagi — tanpa key, Kie menjawab kosong.");
  }
  const url = isKie
    ? tmKieRoot(e.baseUrl) + "/api/v1/models"
    : e.baseUrl.replace(/\/+$/, "") + "/models";
  const headers = {};
  if (e.apiKey) headers["Authorization"] = "Bearer " + e.apiKey;
  let res;
  try {
    res = await fetchFn(url, { method: "GET", headers });
  } catch (netErr) {
    if (e.provider === "router9") {
      throw new Error("Tidak bisa menghubungi 9Router dari browser (Failed to fetch) — ini batasan CORS 9Router untuk panggilan langsung dari browser (persis masalah Generate kemarin), bukan salah isian. Untuk 9Router daftar model TIDAK perlu diambil lewat tombol ini: isi kolom Model manual persis seperti nama di dashboard 9Router (default kr/claude-sonnet-4.5). Kalau mau daftar model + Generate langsung dari browser, jalankan aplikasi lewat server.js (Base URL http://localhost:8090/proxy9/v1), atau matikan 'Require API key' di 9Router lalu coba lagi.");
    }
    throw new Error("Tidak bisa menghubungi " + url + " (" + (netErr && netErr.message ? netErr.message : "network error") + "). Periksa Base URL (harus diawali https://) dan koneksi internet.");
  }
  const bodyText = await res.text().catch(() => "");
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(isKie
        ? "Daftar model tidak ditemukan (404) di " + url + ". Untuk provider Kie AI daftar diambil dari " + tmKieRoot(e.baseUrl) + "/api/v1/models — pastikan koneksi internet dan API key-mu valid."
        : "Daftar model tidak ditemukan (404) di " + url + ". Pastikan Base URL adalah alamat DASAR API yang berakhiran /v1 (contoh: https://api.kie.ai/anthropic/v1), bukan alamat halaman web atau alamat endpoint lengkap.");
    }
    throw new Error(tmFriendlyError(res.status, bodyText, e));
  }
  let json = null;
  try { json = JSON.parse(bodyText); } catch (jErr) {
    throw new Error("Respons daftar model tidak bisa diparse: " + bodyText.slice(0, 200));
  }
  // Sebagian endpoint (termasuk Kie) menjawab HTTP 200 tapi error di body: {"code":401,...}
  if (json && typeof json.code === "number" && json.code !== 200) {
    throw new Error(e.label + " menjawab code " + json.code + ": " + (json.msg || json.message || "error dari endpoint") + " — periksa kembali API key-mu.");
  }
  let items = [];
  if (Array.isArray(json.data)) items = json.data;
  else if (json.data && Array.isArray(json.data.models)) items = json.data.models; // Kie: { data: { models: [...] } }
  else if (json.data && Array.isArray(json.data.data)) items = json.data.data;
  else if (Array.isArray(json.models)) items = json.models;
  else if (Array.isArray(json)) items = json;
  // Kie: katalog besar bercampur model gambar/video/chat — ambil hanya
  // model chat, dari sinyal apa pun yang tersedia (taskType array/string,
  // type, category). Item tanpa sinyal apa pun tetap disimpan.
  if (isKie) {
    const signals = (m) => {
      if (!m || typeof m !== "object") return null;
      const out = [];
      if (Array.isArray(m.taskType)) out.push.apply(out, m.taskType.map((t) => String(t).toLowerCase()));
      if (typeof m.taskType === "string") out.push(m.taskType.toLowerCase());
      if (typeof m.type === "string") out.push(m.type.toLowerCase());
      if (typeof m.category === "string") out.push(m.category.toLowerCase());
      return out.length ? out : null;
    };
    if (items.some((m) => signals(m))) {
      items = items.filter((m) => {
        const s = signals(m);
        return !s || s.some((t) => t.indexOf("chat") !== -1 || t === "llm" || t === "language" || t === "text");
      });
    }
  }
  let ids = items
    .map((m) => (typeof m === "string" ? m : m && (m.id || m.model || m.name || m.modelId || m.slug)))
    .filter(Boolean);
  ids = Array.from(new Set(ids)).sort();
  if (!ids.length) throw new Error("Endpoint menjawab, tapi daftar modelnya kosong. Tanya daftar model ke penyedia endpoint-nya, lalu isi kolom Model manual.");
  return ids;
}

function tmParseResponse(json, provider) {
  if (provider === "gemini") {
    const c = json && json.candidates && json.candidates[0];
    const parts = c && c.content && c.content.parts;
    if (parts) return parts.map((p) => p.text || "").join("").trim();
    return "";
  }
  const c = json && json.choices && json.choices[0];
  const msg = c && c.message;
  if (msg && msg.content) return String(msg.content).trim();
  return "";
}

function tmFriendlyError(status, bodyText, eff) {
  const lower = (bodyText || "").toLowerCase();
  if (status === 401 || status === 403 || lower.indexOf("invalid api key") !== -1 ||
      lower.indexOf("incorrect api key") !== -1 || lower.indexOf("unauthorized") !== -1) {
    return "API key ditolak (" + status + ") oleh " + eff.label +
      ". Periksa kembali key-mu di Pengaturan AI. Atau pakai Mode Prompt (gratis) — hasil prompt tetap bisa kamu jalankan manual di ChatGPT/Gemini.";
  }
  if (status === 404 || lower.indexOf("model_not_found") !== -1 ||
      lower.indexOf("model not found") !== -1 || lower.indexOf("does not exist") !== -1) {
    return "Model '" + eff.model + "' tidak ditemukan di " + eff.label +
      ". Cek penulisan nama model di Pengaturan AI (untuk 9Router harus sama persis dengan dashboard-mu).";
  }
  if (status === 429) {
    return "Limit provider tercapai (429). Tunggu sebentar atau pakai Mode Prompt.";
  }
  return "Error dari " + eff.label + " (HTTP " + status + "): " + (bodyText || "tanpa detail").slice(0, 300);
}

/* Beberapa endpoint (terutama 9Router untuk model Antigravity) menjawab
 * STREAMING (SSE "data: {...}") walau tidak diminta. Rangkai potongan
 * delta.content-nya menjadi satu respons utuh agar bisa dibaca seperti biasa. */
function tmSseToJson(text){
  if (!text || text.indexOf("data:") === -1) return null;
  let content = "";
  let saw = false;
  text.split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (t.indexOf("data:") !== 0) return;
    const payload = t.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    try {
      const j = JSON.parse(payload);
      const ch = j && j.choices && j.choices[0];
      if (!ch) return;
      saw = true;
      if (ch.delta && typeof ch.delta.content === "string") content += ch.delta.content;
      else if (ch.message && typeof ch.message.content === "string") content += ch.message.content;
      else if (typeof ch.text === "string") content += ch.text;
    } catch (e) { /* potongan rusak -> lewati */ }
  });
  if (!saw) return null;
  return { choices: [{ message: { content } }] };
}

async function tmAiGenerate(specText, toolLabel, rawSettings, fetchImpl) {
  const fetchFn = fetchImpl || fetch;
  const e = tmEffective(rawSettings);

  if (e.provider === "custom" && !e.baseUrl) {
    throw new Error("Base URL belum diisi. Buka Pengaturan AI dan isi Base URL endpoint OpenAI-compatible-mu.");
  }
  if (e.provider !== "gemini" && !e.apiKey) {
    throw new Error("API key belum diisi. Buka Pengaturan AI (ikon ⚙️), pilih provider, masukkan key-mu, lalu Simpan. Key hanya tersimpan di browser ini. Atau pakai Mode Prompt (gratis).");
  }
  if (e.provider === "gemini" && !e.apiKey) {
    throw new Error("API key Gemini belum diisi. Buka Pengaturan AI dan isi key dari Google AI Studio.");
  }
  if (!e.model) {
    throw new Error("Nama model belum diisi di Pengaturan AI.");
  }

  const req = tmBuildRequest(specText, toolLabel, e);
  let res;
  try {
    res = await fetchFn(req.url, req.options);
  } catch (netErr) {
    let extra = "";
    if (e.provider === "router9") {
      extra = " Cek 3 hal: (1) aplikasi 9Router sedang jalan di komputer yang SAMA dengan browser ini; (2) Base URL harus persis http://localhost:20128/v1 — BUKAN /dashboard (itu alamat halaman web 9Router); (3) bila situs Tools Marketing ini dibuka dari alamat HTTPS (GitHub Pages), browser memblokir panggilan ke http://localhost — solusinya aktifkan Tunnel di dashboard 9Router (tombol Enable di baris Tunnel) lalu pakai URL tunnel HTTPS-nya sebagai Base URL, atau buka file aplikasi ini secara lokal di komputer yang sama.";
    }
    throw new Error("Tidak bisa menghubungi " + e.label + " (" + (netErr && netErr.message ? netErr.message : "network error") + ")." + extra);
  }

  let bodyText = "";
  try { bodyText = await res.text(); } catch (tErr) { /* abaikan */ }
  if (!res.ok) throw new Error(tmFriendlyError(res.status, bodyText, e));

  let json = null;
  try { json = JSON.parse(bodyText); } catch (jErr) {
    json = tmSseToJson(bodyText); // mungkin jawaban streaming (SSE) — rangkai dulu
    if (!json) throw new Error("Respons " + e.label + " tidak bisa diparse: " + bodyText.slice(0, 200));
  }
  const out = tmParseResponse(json, e.provider);
  // Kie kadang menjawab HTTP 200 dengan badan error, mis. {"code":422,"msg":"The model is not supported"}
  if (!out && json && typeof json.code === "number" && json.code !== 200) {
    const msg = json.msg || json.message || "";
    throw new Error(e.label + " menjawab code " + json.code + (msg ? ": " + msg : "") + ". Coba model lain atau pakai Mode Prompt.");
  }
  if (!out) throw new Error(e.label + " mengembalikan respons kosong. Coba lagi atau pakai Mode Prompt.");
  return out;
}
