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
  router9: {
    label: "9Router (lokal)",
    defaultModel: "kr/claude-sonnet-4.5",
    defaultBase: "http://localhost:20128/v1",
    chatUrl: (s) => s.baseUrl.replace(/\/+$/, "") + "/chat/completions",
    openaiStyle: true,
    hint: "Model harus SAMA PERSIS dengan yang ada di dashboard 9Router-mu (mis. kr/claude-sonnet-4.5 atau nama combo). 9Router harus jalan di komputer yang SAMA dengan browser ini; kalau situs dibuka via HTTPS, pakai URL tunnel HTTPS (Cloudflare/Tailscale) sebagai Base URL.",
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

function tmEffective(settings) {
  const p = PROVIDERS[settings.provider] || PROVIDERS.groq;
  return {
    provider: settings.provider,
    label: p.label,
    model: (settings.model || "").trim() || p.defaultModel,
    baseUrl: (settings.baseUrl || "").trim() || p.defaultBase,
    apiKey: (settings.apiKey || "").trim(),
    def: p,
  };
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
      extra = " Pastikan aplikasi 9Router sedang jalan di komputer yang SAMA dengan browser ini, dan bila situs dibuka via HTTPS gunakan URL tunnel HTTPS sebagai Base URL.";
    }
    throw new Error("Tidak bisa menghubungi " + e.label + " (" + (netErr && netErr.message ? netErr.message : "network error") + ")." + extra);
  }

  let bodyText = "";
  try { bodyText = await res.text(); } catch (tErr) { /* abaikan */ }
  if (!res.ok) throw new Error(tmFriendlyError(res.status, bodyText, e));

  let json = null;
  try { json = JSON.parse(bodyText); } catch (jErr) {
    throw new Error("Respons " + e.label + " tidak bisa diparse: " + bodyText.slice(0, 200));
  }
  const out = tmParseResponse(json, e.provider);
  if (!out) throw new Error(e.label + " mengembalikan respons kosong. Coba lagi atau pakai Mode Prompt.");
  return out;
}
