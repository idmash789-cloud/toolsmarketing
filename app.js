/* Tools Marketing — logika aplikasi (semua konten original, ditulis dari nol) */

"use strict";

/* ---------- DATA: formula copywriting ---------- */
const FORMULAS = [
  { id: "aida",    name: "AIDA",      desc: "Klasik: tarik Perhatian → bangun Minat → tanamkan Keinginan → ajak Aksi." },
  { id: "aidca",   name: "AIDCA",     desc: "AIDA + Keyakinan: yakinkan pembeli lewat bukti sebelum diajak aksi." },
  { id: "pas",     name: "PAS",       desc: "Klasik: tusuk Masalah → aduk Agitasi → tawarkan Solusi." },
  { id: "bab",     name: "BAB",       desc: "Klasik: Sebelum (kondisi buruk) → Sesudah (kondisi ideal) → Jembatan (produkmu)." },
  { id: "fab",     name: "FAB",       desc: "Fitur → Kelebihan → Manfaat: ubah spesifikasi jadi alasan membeli." },
  { id: "quest",   name: "QUEST",     desc: "Kualifikasi pembaca → Pahami masalahnya → Edukasi → Stimulasi keinginan → Transisi ke penawaran." },
  { id: "pastor",  name: "PASTOR",    desc: "Masalah → Perbesar → Ceritakan → Tawarkan → Ubah jadi testimoni → Respon/CTA." },
  { id: "pppp",    name: "PPPP",      desc: "Janji (Promise) → Gambar (Picture) → Bukti (Proof) → Dorong (Push)." },
  { id: "4c",      name: "4C",        desc: "Jelas (Clear) → Ringkas (Concise) → Menarik (Compelling) → Kredibel (Credible)." },
  { id: "slap",    name: "SLAP",      desc: "Berhentikan scroll-nya → buat Lihat/Tertarik → Ajak Aksi → arahkan ke Pembelian." },
  { id: "star",    name: "STAR",      desc: "Situasi → Tugas/Tantangan → Aksi yang diambil → Hasil yang didapat." },
  { id: "5w1h",    name: "5W+1H",     desc: "Jawab tuntas: Apa, Siapa, Kapan, Di mana, Mengapa, + Bagaimana." },
  /* Racikan original Tools Marketing */
  { id: "lancar",  name: "L.A.N.C.A.R.", desc: "Racikan TM: Ledakkan hook → Angkat masalah → Narasikan solusi → Ceritakan bukti → Arahkan CTA → Rapatkan urgency." },
  { id: "gebrak",  name: "G.E.B.R.A.K.", desc: "Racikan TM: Guncang perhatian → Edukasi singkat → Bangun emosi → Runtuhkan keraguan → Ajak beli → Kunci dengan garansi." },
  { id: "siap",    name: "S.I.A.P.",  desc: "Racikan TM: Sapa pembeli → Identifikasi masalahnya → Arahkan ke solusi → Pancing aksi sekarang." },
  { id: "cekat",   name: "C.E.K.A.T.", desc: "Racikan TM: Curi perhatian → Emosikan → Kuatkan dengan bukti → Ajak bertindak → Tekankan batas waktu." },
  { id: "terbukti",name: "T.E.R.B.U.K.T.I.", desc: "Racikan TM: Tunjukkan hasil → Edukasi cara kerja → Runtuhkan mitos → Bangun kepercayaan → Ungkap penawaran → Tutup dengan ajakan → Ingatkan garansi." },
  { id: "menang",  name: "M.E.N.A.N.G.", desc: "Racikan TM: Masalah → Emosi → Narasi perubahan → Ajakan → Nilai plus → Garansi." },
];

/* ---------- DATA: pola hook ORIGINAL (tulis sendiri, bukan salinan situs mana pun) ---------- */
const HOOKS = [
  { id: "p1", group: "Penasaran", text: "Jujur, aku nggak nyangka [produk] bisa [hasil] secepat ini." },
  { id: "p2", group: "Penasaran", text: "Ada satu rahasia yang nggak banyak penjual [kategori] kasih tahu ke kamu…" },
  { id: "m1", group: "Masalah",   text: "Kalau kamu masih [masalah], berhenti scroll 30 detik dulu." },
  { id: "m2", group: "Masalah",   text: "Kenapa [cara lama] malah bikin kamu makin [masalah berulang]?" },
  { id: "d1", group: "Angka / Data", text: "[Angka]% pembeli [produk] menyesal nggak beli dari dulu. Alasannya sederhana." },
  { id: "d2", group: "Angka / Data", text: "Dari [angka] orang yang coba, [angka]% bilang mereka ngerasain [hasil]." },
  { id: "t1", group: "Pertanyaan", text: "Apa jadinya kalau [masalah] bisa beres dalam [waktu]?" },
  { id: "t2", group: "Pertanyaan", text: "Masih percaya [mitos]? Dengerin ini dulu sebelum kamu [keputusan salah]." },
  { id: "c1", group: "Cerita / Testimoni", text: "Awalnya aku skeptis… sampai [momen perubahan] terjadi." },
  { id: "c2", group: "Cerita / Testimoni", text: "Temanku [peran] pakai [produk] selama [waktu], dan ini yang dia bilang…" },
  { id: "f1", group: "FOMO",      text: "Stok [produk] tinggal sedikit, dan harganya naik minggu depan." },
  { id: "f2", group: "FOMO",      text: "Penawaran ini cuma sampai [waktu]. Setelah itu balik ke harga normal." },
  { id: "k1", group: "Kontras / Janji Hasil", text: "Dulu [kondisi lama], sekarang [kondisi baru]. Bedanya cuma satu keputusan." },
  { id: "k2", group: "Kontras / Janji Hasil", text: "Bayangin [hasil ideal] — dan kamu bisa mulai dari hari ini juga." },
];

/* ---------- DATA: CTA ORIGINAL ---------- */
const CTAS = [
  "Klik tombol di bawah untuk pesan sekarang — stok terbatas.",
  "Chat admin sekarang, tanya-tanya dulu juga boleh kok.",
  "Klik link di bio untuk order hari ini juga.",
  "Amankan [produk] kamu sebelum kehabisan.",
  'Klik "Beli Sekarang" dan rasakan sendiri bedanya.',
  "Daftar sekarang, ada gratis ongkir khusus hari ini.",
  "Hubungi kami via WhatsApp — admin fast respon.",
  "Checkout sekarang, pembayaran bisa COD.",
  "Klik tombolnya, isi data, barang dikirim hari ini juga.",
  "Jangan tunggu nanti — klik dan pesan sekarang.",
  "Simpan video ini, lalu klik link untuk mulai.",
  'Ketik "MAU" di kolom komentar, admin kami akan menghubungimu.',
];

const GAYA_BAHASA = ["Informatif","Persuasif","Storytelling","Antusias","Santai","Profesional","Empati","Urgent"];

const FUNNELS = [
  { id: "tofu", name: "TOFU (Top of Funnel)", desc: "Audiens dingin: belum kenal produk. Fokus edukasi & awareness." },
  { id: "mofu", name: "MOFU (Middle of Funnel)", desc: "Audiens hangat: sudah kenal, sedang bandingkan. Fokus bukti & pembeda." },
  { id: "bofu", name: "BOFU (Bottom of Funnel)", desc: "Audiens panas: siap beli. Fokus penawaran, garansi & urgensi." },
];

const DURATIONS = {
  "15":  { label: "15 detik", sections: [["Hook","0–3 dtk"],["Pembuka","3–7 dtk"],["Isi","7–12 dtk"],["CTA","12–15 dtk"]], words: "±33–38 kata" },
  "20":  { label: "20 detik", sections: [["Hook","0–4 dtk"],["Pembuka","4–9 dtk"],["Isi","9–16 dtk"],["CTA","16–20 dtk"]], words: "±43–50 kata" },
  "30":  { label: "30 detik", sections: [["Hook","0–5 dtk"],["Pembuka","5–12 dtk"],["Isi","12–25 dtk"],["CTA","25–30 dtk"]], words: "±65–75 kata" },
  "60":  { label: "1 menit",  sections: [["Hook","0–8 dtk"],["Pembuka","8–20 dtk"],["Isi","20–50 dtk"],["CTA","50–60 dtk"]], words: "±130–150 kata" },
};

/* ---------- PROMPT BUILDERS (Mode Prompt: output = prompt siap-copy, Bahasa Indonesia) ---------- */

function esc(v){ return (v || "").trim(); }

function buildPromptPersona(i){
  let s = "Buatkan PROFIL BUYER PERSONA yang lengkap dan detail untuk produk berikut.\n\n";
  s += "Nama Produk: " + i.nama + "\n";
  s += "Rencana Iklan: " + i.rencana + "\n";
  if (esc(i.harga)) s += "Kisaran Harga: " + i.harga + "\n";
  if (esc(i.target)) s += "Target Awal (bayangan penjual): " + i.target + "\n";
  s += "\nSusun hasilnya dalam format berikut:\n";
  s += "1. DEMOGRAFI: usia, jenis kelamin, domisili, pekerjaan, penghasilan, status keluarga.\n";
  s += "2. PSIKOGRAFI: gaya hidup, nilai yang dipegang, minat, kebiasaan belanja online.\n";
  s += "3. PAIN POINTS: 5 masalah nyata yang mereka rasakan terkait kategori produk ini.\n";
  s += "4. KEINGINAN & IMPIAN: 5 hal yang mereka harapkan setelah masalahnya beres.\n";
  s += "5. KEBERATAN (objections): 5 alasan yang bikin mereka ragu membeli + cara menjawab tiap keberatan.\n";
  s += "6. PEMICU BELI (buying triggers): momen/situasi apa yang membuat mereka akhirnya checkout.\n";
  s += "7. MEREKA NONGKRONG DI MANA: platform, komunitas, dan jenis konten yang mereka konsumsi.\n";
  s += "8. SEGMENTASI: bagi menjadi 2-3 segmen (mis. pemula vs berpengalaman, atau berdasarkan daya beli), dan untuk tiap segmen berikan 1 ANGLE IKLAN yang paling nendang beserta contoh hook-nya.\n";
  s += "\nGunakan Bahasa Indonesia yang natural, spesifik (hindari jawaban generik), dan langsung bisa dipakai untuk menyusun strategi iklan Meta Ads.";
  return s;
}

function buildPromptVPC(i){
  let s = "Susunkan VALUE PROPOSITION CANVAS yang lengkap untuk produk berikut.\n\n";
  s += "Nama Produk: " + i.nama + "\n";
  s += "Rencana Iklan: " + i.rencana + "\n";
  s += "Deskripsi Produk: " + i.deskripsi + "\n";
  s += "\nSusun hasilnya dalam format berikut:\n";
  s += "A. PRODUK (sisi penawaran)\n";
  s += "   1. FITUR: daftar fitur/fakta produk (minimal 7).\n";
  s += "   2. BENEFIT FUNGSIONAL: tiap fitur diubah menjadi manfaat nyata yang dirasakan pembeli.\n";
  s += "   3. BENEFIT EMOSIONAL: perasaan/status apa yang didapat pembeli (percaya diri, tenang, bangga, dsb).\n";
  s += "   4. PENGALAMAN YANG DIJUAL: gambarkan 'transformasi' — kondisi sebelum vs sesudah memakai produk.\n";
  s += "B. PELANGGAN (sisi pembeli)\n";
  s += "   5. KEBUTUHAN: kebutuhan mendasar yang dipenuhi produk ini.\n";
  s += "   6. KEINGINAN: keinginan tersembunyi/aspirasional mereka.\n";
  s += "   7. KEKHAWATIRAN: 5 hal yang mereka takutkan sebelum membeli + kalimat penenang untuk tiap kekhawatiran.\n";
  s += "C. RINGKASAN\n";
  s += "   8. VALUE PROPOSITION 1 KALIMAT: satu kalimat tajam yang menjelaskan kenapa produk ini layak dibeli.\n";
  s += "   9. 3 ANGLE IKLAN terbaik yang lahir dari kanvas ini (dengan contoh hook per angle).\n";
  s += "\nGunakan Bahasa Indonesia yang natural dan spesifik, hindari jawaban template yang generik.";
  return s;
}

function buildPromptCopy(i){
  let s = "Buatkan COPYWRITING IKLAN yang siap pakai untuk produk berikut.\n\n";
  s += "Nama Produk: " + i.nama + "\n";
  s += "Target Market: " + i.target + "\n";
  s += "Gaya Bahasa: " + i.gaya + "\n";
  s += "Jenis Produk: " + (i.jenis === "digital" ? "Produk Digital" : "Produk Fisik") + "\n";
  s += "Value Proposition / Bahan: " + i.vpc + "\n";
  s += "\nSusun hasilnya dalam format berikut:\n";
  s += "1. 5 PILIHAN HEADLINE: pendek, nendang, masing-masing maksimal 10 kata.\n";
  s += "2. PRIMARY TEXT (versi panjang): susun dengan alur Hook → Masalah → Solusi → Bukti → CTA. Panjang 80-120 kata.\n";
  s += "3. PRIMARY TEXT (versi pendek): maksimal 40 kata, tetap ada hook + CTA.\n";
  s += "4. 3 VARIASI ANGLE: tulis ulang primary text dari 3 sudut pandang berbeda (masalah, hasil, bukti sosial).\n";
  s += "5. SARAN CTA: 3 pilihan kalimat ajakan yang cocok untuk tombol iklan.\n";
  if (i.jenis === "digital") s += "\nCatatan: ini produk DIGITAL — tonjolkan akses instan, tidak ada ongkir, dan garansi kepuasan.";
  s += "\nGunakan Bahasa Indonesia yang natural sesuai gaya bahasa yang diminta. Hindari kata-kata lebay yang melanggar kebijakan iklan (mis. klaim medis mutlak, janji kaya instan).";
  return s;
}

function buildPromptNarasi(i){
  const dur = DURATIONS[i.durasi];
  const formula = FORMULAS.find(f => f.id === i.formula);
  const hook = HOOKS.find(h => h.id === i.hook);
  const funnel = FUNNELS.find(f => f.id === i.funnel);
  let s = "Buatkan NARASI / SKRIP VIDEO IKLAN yang siap dibacakan voice-over untuk produk berikut.\n\n";
  s += "Nama Produk: " + i.nama + "\n";
  s += "Kategori: " + i.kategori + "\n";
  s += "Value Proposition / Bahan: " + i.vpc + "\n";
  s += "Durasi Video: " + dur.label + "\n";
  s += "Formula Struktur: " + formula.name + " — " + formula.desc + "\n";
  s += "Pola Hook yang dipakai: [" + hook.group + "] \"" + hook.text + "\" (sesuaikan isi kurung sikunya dengan produk ini)\n";
  s += "CTA yang dipakai: \"" + i.cta + "\"\n";
  s += "Gaya Bahasa: " + i.gaya.join(", ") + "\n";
  s += "Tahap Funnel: " + funnel.name + " — " + funnel.desc + "\n";
  if (esc(i.catatan)) s += "Catatan Tambahan: " + i.catatan + "\n";
  s += "\nATURAN NASKAH:\n";
  s += "- Total naskah voice-over " + dur.words + " (kecepatan baca Bahasa Indonesia ±130-150 kata per menit).\n";
  s += "- Bagi naskah per segmen waktu berikut:\n";
  dur.sections.forEach(sec => { s += "  * " + sec[0] + " (" + sec[1] + ")\n"; });
  s += "- Segmen Hook WAJIB memakai pola hook di atas, ditulis ulang agar mulus dibacakan.\n";
  s += "- Segmen CTA WAJIB memakai CTA di atas.\n";
  s += "- Ikuti formula " + formula.name + " dalam alur ceritanya.\n";
  s += "\nFORMAT OUTPUT:\n";
  s += "1. NASKAH VOICE-OVER per segmen waktu (tulis teks yang dibacakan, dengan label waktunya).\n";
  s += "2. TEKS DI LAYAR (on-screen text): 3-5 teks singkat yang muncul bergantian, maksimal 6 kata per teks.\n";
  s += "3. SARAN VISUAL / B-ROLL per segmen: deskripsikan 1 kalimat adegan yang cocok.\n";
  s += "4. JUDUL + CAPTION singkat untuk postingan video ini.\n";
  s += "\nGunakan Bahasa Indonesia lisan yang natural (bukan bahasa tulisan kaku).";
  return s;
}

/* ---------- KONFIGURASI 4 TOOLS ---------- */
const TOOLS = [
  {
    id: "persona",
    emoji: "🎯",
    title: "Buyer Persona",
    desc: "Kenali siapa pembelimu: demografi, masalah, keinginan, keberatan, dan angle iklan per segmen.",
    label: "Buyer Persona",
    build: buildPromptPersona,
    saveKey: "tm_persona_last",
    fields: [
      { name: "nama",    label: "Nama Produk",    type: "text",     required: true,  ph: "Contoh: Serum Brightening Glowing" },
      { name: "rencana", label: "Rencana Iklan",  type: "text",     required: true,  ph: "Contoh: Instagram & Facebook Ads, budget 100rb/hari" },
      { name: "harga",   label: "Kisaran Harga",  type: "text",     required: false, ph: "Contoh: 75rb – 150rb" },
      { name: "target",  label: "Target Awal",    type: "textarea", required: false, ph: "Bayanganmu tentang calon pembeli (opsional)" },
    ],
  },
  {
    id: "vpc",
    emoji: "💎",
    title: "Value Proposition Canvas",
    desc: "Petakan fitur → benefit → emosi → kebutuhan → kekhawatiran pembeli dalam satu kanvas.",
    label: "Value Proposition Canvas",
    build: buildPromptVPC,
    saveKey: "tm_vpc_last",
    fields: [
      { name: "nama",      label: "Nama Produk",     type: "text",     required: true,  ph: "Contoh: Nutriflakes Sereal Sehat" },
      { name: "rencana",   label: "Rencana Iklan",   type: "text",     required: true,  ph: "Contoh: Meta Ads ke landing page" },
      { name: "deskripsi", label: "Deskripsi Produk",type: "textarea", required: true,  ph: "Jelaskan produkmu: isi, cara pakai, keunggulan…" },
    ],
  },
  {
    id: "copywriting",
    emoji: "✍️",
    title: "Copywriting",
    desc: "Hasilkan headline, primary text panjang & pendek, variasi angle, dan saran CTA.",
    label: "Copywriting",
    build: buildPromptCopy,
    fields: [
      { name: "nama",   label: "Nama Produk",   type: "text",     required: true,  ph: "Contoh: E-book Fiqih Modern" },
      { name: "target", label: "Target Market", type: "text",     required: true,  ph: "Contoh: Pasangan muda usia 25-35 tahun" },
      { name: "gaya",   label: "Gaya Bahasa",   type: "select",   required: true,
        options: GAYA_BAHASA, ph: "Pilih gaya bahasa" },
      { name: "jenis",  label: "Jenis Produk",  type: "radio",    required: true,
        options: [{v:"fisik",l:"Produk Fisik"},{v:"digital",l:"Produk Digital"}] },
      { name: "vpc",    label: "Value Proposition Canvas / Bahan", type: "textarea", required: true,
        ph: "Tempel hasil VPC / poin jualan produkmu di sini…",
        fillFrom: "tm_vpc_last", fillLabel: "Pakai VPC terakhir" },
    ],
  },
  {
    id: "narasi",
    emoji: "🎬",
    title: "Narasi Konten",
    desc: "Skrip video iklan berdurasi pas: hook, naskah VO per segmen waktu, teks layar, dan saran visual.",
    label: "Narasi Konten",
    build: buildPromptNarasi,
    fields: [
      { name: "nama",     label: "Nama Produk",   type: "text",     required: true,  ph: "Contoh: Kopi Susu Gula Aren" },
      { name: "kategori", label: "Kategori",      type: "text",     required: true,  ph: "Contoh: Minuman / Skincare / E-book" },
      { name: "vpc",      label: "Value Proposition Canvas / Bahan", type: "textarea", required: true,
        ph: "Tempel hasil VPC / poin jualan produkmu di sini…",
        fillFrom: "tm_vpc_last", fillLabel: "Pakai VPC terakhir" },
      { name: "durasi",   label: "Durasi Video",  type: "select",   required: true,
        options: Object.keys(DURATIONS).map(k => ({v:k,l:DURATIONS[k].label})), ph: "Pilih durasi" },
      { name: "formula",  label: "Formula / Struktur", type: "select", required: true,
        options: FORMULAS.map(f => ({v:f.id, l:f.name + " — " + f.desc})), ph: "Pilih formula" },
      { name: "hook",     label: "Hook",          type: "select",   required: true,
        options: HOOKS.map(h => ({v:h.id, l:"[" + h.group + "] " + h.text})), ph: "Pilih pola hook" },
      { name: "cta",      label: "CTA (Call to Action)", type: "select", required: true,
        options: CTAS.map((c,ix) => ({v:String(ix), l:c})), ph: "Pilih CTA" },
      { name: "gaya",     label: "Gaya Bahasa (bisa pilih lebih dari 1)", type: "check", required: true,
        options: GAYA_BAHASA },
      { name: "funnel",   label: "Tahap Funnel",  type: "select",   required: true,
        options: FUNNELS.map(f => ({v:f.id, l:f.name + " — " + f.desc})), ph: "Pilih tahap funnel" },
      { name: "catatan",  label: "Catatan Tambahan", type: "textarea", required: false,
        ph: "Opsional: mis. hindari kata 'termurah', target ibu-ibu…" },
    ],
  },
];

/* ---------- STATE & UTIL ---------- */
let currentTool = null;
let formValues = {};
let lastOutput = "";
function $(id){ return document.getElementById(id); }

function toast(msg, kind){
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast" + (kind ? " " + kind : "");
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), 4200);
}

function renderMode(){
  const btn = $("btn-generate");
  if (btn) btn.textContent = "Generate Prompt";
}
function updateGenerateLabel(){ $("btn-generate").textContent = "Generate Prompt"; }

/* ---------- DASHBOARD ---------- */
function renderDashboard(){
  $("view-dashboard").classList.remove("hidden");
  $("view-tool").classList.add("hidden");
  const grid = $("tool-cards");
  grid.innerHTML = "";

  // Presentation metadata only; tool definitions, forms and prompt generation remain unchanged.
  const design = {
    persona: {
      number: "01", category: "AUDIENCE INTELLIGENCE",
      benefit: "Bantu iklan lebih relevan, tepat sasaran, dan efisien.",
      features: [["♙","Demografi"],["◎","Masalah & Keinginan"],["◇","Angle Iklan"]],
      focus: "Riset Audiens", output: "Profil & Segmen Audiens"
    },
    vpc: {
      number: "02", category: "VALUE STRATEGY",
      benefit: "Perjelas nilai unik produk dan alasan kuat untuk membeli.",
      features: [["◇","Fitur & Benefit"],["♡","Emosi & Kebutuhan"],["◎","Kekhawatiran"]],
      focus: "Value Proposition", output: "Peta Nilai Produk"
    },
    copywriting: {
      number: "03", category: "AD CREATIVE",
      benefit: "Bangun pesan iklan persuasif yang siap dikembangkan dan diuji.",
      features: [["✎","Headline"],["▤","Primary Text"],["↗","CTA & Variasi"]],
      focus: "Copy Iklan", output: "Headline, Teks & CTA"
    },
    narasi: {
      number: "04", category: "CONTENT PRODUCTION",
      benefit: "Ubah strategi menjadi narasi visual yang runtut dan menarik.",
      features: [["▣","Hook & Alur"],["◉","Naskah VO"],["▧","Saran Visual"]],
      focus: "Skrip Video", output: "Naskah & Panduan Konten"
    }
  };

  TOOLS.forEach(t => {
    const d = design[t.id];
    if (!d) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tool-card tool-card--" + t.id;
    card.setAttribute("aria-label", "Buka tool " + t.title);
    const chips = d.features.map(([symbol, label]) =>
      '<span class="card-chip"><span aria-hidden="true">' + symbol + '</span>' + label + '</span>'
    ).join("");

    card.innerHTML =
      '<div class="card-top">' +
        '<div class="card-top-left"><span class="tool-number">' + d.number + ' / 04</span>' +
          '<span class="card-progress" aria-hidden="true"><i></i><i></i><i></i></span></div>' +
        '<span class="card-icon" aria-hidden="true">' + t.emoji + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="tool-category">' + d.category + '</div>' +
        '<h3>' + t.title + '</h3>' +
        '<p class="card-desc">' + t.desc + '</p>' +
        '<div class="card-benefit"><span class="benefit-check" aria-hidden="true">✓</span>' + d.benefit + '</div>' +
        '<div class="card-chips">' + chips + '</div>' +
      '</div>' +
      '<div class="card-footer">' +
        '<div class="card-meta"><span class="meta-item"><span class="meta-symbol" aria-hidden="true">◇</span>' + d.focus + '</span>' +
          '<span class="meta-item"><span class="meta-symbol" aria-hidden="true">▤</span>Output: ' + d.output + '</span></div>' +
        '<span class="card-open">BUKA WORKSPACE <span class="card-arrow" aria-hidden="true">↗</span></span>' +
      '</div>';

    card.addEventListener("click", () => openTool(t.id));
    grid.appendChild(card);
  });
  renderMode();
}

/* ---------- TOOL VIEW ---------- */
function openTool(id){
  currentTool = TOOLS.find(t => t.id === id);
  formValues = {};
  lastOutput = "";
  $("view-dashboard").classList.add("hidden");
  $("view-tool").classList.remove("hidden");
  $("tool-title").textContent = currentTool.emoji + " " + currentTool.title;
  $("tool-desc").textContent = currentTool.desc;
  $("output-box").innerHTML = '<p class="placeholder">Isi form di kiri, lalu tekan <b>Generate</b>.</p>';
  $("btn-gemini").disabled = true;
  $("btn-chatgpt").disabled = true;
  renderForm();
  renderMode();
  window.scrollTo(0, 0);
}

function renderForm(){
  const wrap = $("tool-form");
  wrap.innerHTML = "";
  currentTool.fields.forEach(f => {
    const div = document.createElement("div");
    div.className = "field";
    const label = document.createElement("span");
    label.innerHTML = f.label + (f.required ? ' <span class="req">*</span>' : "");
    div.appendChild(label);

    let input = null;
    if (f.type === "textarea") {
      input = document.createElement("textarea");
      input.placeholder = f.ph || "";
    } else if (f.type === "select") {
      input = document.createElement("select");
      const opt0 = document.createElement("option");
      opt0.value = ""; opt0.textContent = f.ph || "Pilih…";
      input.appendChild(opt0);
      f.options.forEach(o => {
        const o2 = document.createElement("option");
        if (typeof o === "string") { o2.value = o; o2.textContent = o; }
        else { o2.value = o.v; o2.textContent = o.l; }
        input.appendChild(o2);
      });
    } else if (f.type === "radio") {
      const row = document.createElement("div");
      row.className = "radio-row";
      f.options.forEach(o => {
        const lab = document.createElement("label");
        lab.className = "pill";
        const r = document.createElement("input");
        r.type = "radio"; r.name = "f_" + f.name; r.value = o.v;
        if (o.v === "fisik") r.checked = true;
        lab.appendChild(r);
        lab.appendChild(document.createTextNode(o.l));
        row.appendChild(lab);
      });
      div.appendChild(row);
      row.addEventListener("change", () => {
        const sel = row.querySelector('input[name="f_' + f.name + '"]:checked');
        formValues[f.name] = sel ? sel.value : "";
        validate();
      });
      formValues[f.name] = "fisik";
    } else if (f.type === "check") {
      const grid = document.createElement("div");
      grid.className = "check-grid";
      f.options.forEach(o => {
        const lab = document.createElement("label");
        lab.className = "pill";
        const c = document.createElement("input");
        c.type = "checkbox"; c.value = o;
        lab.appendChild(c);
        lab.appendChild(document.createTextNode(o));
        grid.appendChild(lab);
      });
      div.appendChild(grid);
      grid.addEventListener("change", () => {
        formValues[f.name] = Array.from(grid.querySelectorAll("input:checked")).map(c => c.value);
        validate();
      });
      formValues[f.name] = [];
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = f.ph || "";
    }

    if (input) {
      input.addEventListener("input", () => {
        formValues[f.name] = input.value;
        validate();
      });
      if (f.type === "text" || f.type === "textarea") {
        /* Bungkus agar dropdown riwayat bisa diposisikan relatif ke field. */
        const wrapEl = document.createElement("div");
        wrapEl.className = "hist-wrap";
        wrapEl.appendChild(input);
        div.appendChild(wrapEl);
        input.addEventListener("input", () => tmHistRefresh(input, f.name));
        input.addEventListener("focus", () => tmHistOpenDD(input, f.name));
        input.addEventListener("blur", () => tmHistAddOne(f.name, input.value));
        input.addEventListener("keydown", e => tmHistKey(e, input, f.name));
      } else {
        div.appendChild(input);
      }
    }

    if (f.fillFrom) {
      const fillBtn = document.createElement("button");
      fillBtn.type = "button";
      fillBtn.className = "fill-btn";
      fillBtn.textContent = "📥 " + f.fillLabel;
      fillBtn.addEventListener("click", () => fillFromSaved(f));
      div.appendChild(fillBtn);
      const hint = document.createElement("p");
      hint.className = "ph";
      hint.textContent = "Otomatis terisi dari hasil " + (f.fillFrom === "tm_vpc_last" ? "VPC" : "Persona") + " terakhirmu (tersimpan di browser ini).";
      div.appendChild(hint);
    } else if (f.ph && f.type !== "text") {
      /* placeholder sudah di elemen */
    }

    wrap.appendChild(div);
  });
  validate();
}

function fillFromSaved(field){
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(field.fillFrom) || "null"); } catch (e) {}
  if (!saved || !saved.text) {
    toast("Belum ada hasil tersimpan. Buat dulu di tool " +
      (field.fillFrom === "tm_vpc_last" ? "Value Proposition Canvas" : "Buyer Persona") + ", lalu kembali ke sini.", "err");
    return;
  }
  const wrap = $("tool-form");
  const areas = wrap.querySelectorAll("textarea");
  // textarea VPC adalah field ini; cari berdasarkan urutan field
  const idx = currentTool.fields.indexOf(field);
  const fieldsWrap = wrap.children[idx];
  const ta = fieldsWrap ? fieldsWrap.querySelector("textarea") : null;
  if (ta) {
    ta.value = saved.text;
    formValues[field.name] = saved.text;
    validate();
    toast("Terisi dari hasil " + (field.fillFrom === "tm_vpc_last" ? "VPC" : "Persona") + " terakhir ✔", "ok");
  }
}

function validate(){
  const ok = currentTool.fields.every(f => {
    if (!f.required) return true;
    const v = formValues[f.name];
    if (f.type === "check") return Array.isArray(v) && v.length > 0;
    return esc(v) !== "";
  });
  const btn = $("btn-generate");
  btn.disabled = !ok;
  $("generate-hint").style.display = ok ? "none" : "";
  if (ok) updateGenerateLabel();
}

function collectInputs(){
  const out = {};
  currentTool.fields.forEach(f => {
    let v = formValues[f.name];
    if (f.name === "cta") {
      const ix = parseInt(v, 10);
      v = isNaN(ix) ? v : CTAS[ix];
    }
    if (f.name === "durasi") v = String(v);
    out[f.name] = v;
  });
  return out;
}

function onGenerate(){
  const inputs = collectInputs();
  tmHistSaveToolInputs(currentTool, inputs);
  const prompt = currentTool.build(inputs);
  showOutput(prompt);
  if (currentTool.saveKey) {
    try { localStorage.setItem(currentTool.saveKey, JSON.stringify({inputs,text:lastOutput,mode:"prompt",at:Date.now()})); }
    catch(e){ /* storage may be unavailable */ }
  }
}

/* ---------- RIWAYAT ISIAN (input history) ----------
 * Menyimpan teks yang pernah diisi di kolom input (per NAMA field, lintas
 * semua tool), lalu menampilkannya sebagai rekomendasi yang bisa diklik.
 * Penyimpanan: localStorage kunci TM_HIST_KEY = { namaField: [teks...] }.
 * Hanya field form tool (text/textarea). Field AI settings (khususnya
 * API key) TIDAK disentuh sama sekali.
 * Fungsi di bawah sengaja murni/parameterisasi (storage-like object)
 * agar bisa di-unit-test di node. */

const TM_HIST_KEY = "tm_input_history_v1";
const TM_HIST_MAX = 10;

function tmHistNorm(v){ return (v == null ? "" : String(v)).trim().toLowerCase(); }

function tmHistLoad(storage){
  try {
    const raw = storage.getItem(TM_HIST_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    if (o && typeof o === "object" && !Array.isArray(o)) return o;
  } catch (e) { /* JSON korup -> mulai dari kosong */ }
  return {};
}

function tmHistSave(storage, store){
  try { storage.setItem(TM_HIST_KEY, JSON.stringify(store)); }
  catch (e) { /* abaikan: localStorage penuh / diblokir */ }
}

/* Tambah nilai; terbaru di depan, dedup case-insensitive (casing terbaru
 * yang menang), max TM_HIST_MAX, abaikan nilai < 2 karakter. */
function tmHistAdd(store, field, value){
  const v = (value == null ? "" : String(value)).trim();
  if (!field || v.length < 2) return false;
  const n = tmHistNorm(v);
  const list = Array.isArray(store[field]) ? store[field] : [];
  const rest = list.filter(e => tmHistNorm(e) !== n);
  rest.unshift(v);
  store[field] = rest.slice(0, TM_HIST_MAX);
  return true;
}

function tmHistRemove(store, field, value){
  const list = store[field];
  if (!Array.isArray(list)) return false;
  const n = tmHistNorm(value);
  const rest = list.filter(e => tmHistNorm(e) !== n);
  if (rest.length === list.length) return false;
  if (rest.length === 0) delete store[field];
  else store[field] = rest;
  return true;
}

function tmHistClear(store, field){
  if (store && Object.prototype.hasOwnProperty.call(store, field)) {
    delete store[field];
    return true;
  }
  return false;
}

/* Filter substring case-insensitive; query kosong -> semua (salinan). */
function tmHistFilter(list, query){
  const q = tmHistNorm(query);
  const arr = Array.isArray(list) ? list : [];
  if (!q) return arr.slice();
  return arr.filter(e => tmHistNorm(e).indexOf(q) !== -1);
}

/* Helper runtime browser: baca-tambah-simpan satu nilai. */
function tmHistAddOne(field, value){
  const store = tmHistLoad(localStorage);
  if (tmHistAdd(store, field, value)) tmHistSave(localStorage, store);
}

/* Simpan semua field text/textarea dari inputs (dipanggil saat Generate). */
function tmHistSaveToolInputs(tool, inputs){
  if (!tool || !tool.fields || !inputs) return;
  const store = tmHistLoad(localStorage);
  let changed = false;
  tool.fields.forEach(f => {
    if (f.type === "text" || f.type === "textarea") {
      if (tmHistAdd(store, f.name, inputs[f.name])) changed = true;
    }
  });
  if (changed) tmHistSave(localStorage, store);
}

/* ---------- UI dropdown riwayat ---------- */
let tmHistOpen = null; /* { panel, input, field, hl, items, paint } */

function tmHistClose(){
  if (tmHistOpen && tmHistOpen.panel && tmHistOpen.panel.parentNode) {
    tmHistOpen.panel.parentNode.removeChild(tmHistOpen.panel);
  }
  tmHistOpen = null;
}

function tmHistOpenDD(input, field){
  const store = tmHistLoad(localStorage);
  const list = store[field] || [];
  if (!list.length) { tmHistClose(); return; }
  tmHistRenderDD(input, field, list, input.value);
}

function tmHistRenderDD(input, field, list, query){
  tmHistClose();
  const items = tmHistFilter(list, query);
  if (!items.length) return; /* tidak ada yang cocok -> jangan buka */
  const wrap = (input.closest && input.closest(".hist-wrap")) || input.parentNode;
  const panel = document.createElement("div");
  panel.className = "hist-dd";
  const st = { panel, input, field, hl: -1, items, paint: null, paintHl: null };
  tmHistOpen = st;

  /* Sorot baris TANPA membangun ulang DOM. Versi lama memanggil paint()
   * (innerHTML="") saat mouseenter — node yang sedang dihover/diklik hancur
   * di tengah gestur, sehingga event click tidak pernah tuntas di browser
   * (gejala: saran terlihat tapi tidak bisa diklik). */
  function paintHl(){
    const rows = panel.querySelectorAll(".hist-row");
    rows.forEach((r, i) => r.classList.toggle("hl", i === st.hl));
  }
  st.paintHl = paintHl;

  function paint(){
    panel.innerHTML = "";
    if (!st.items.length) { tmHistClose(); return; }
    st.items.forEach((txt, ix) => {
      const row = document.createElement("div");
      row.className = "hist-row" + (ix === st.hl ? " hl" : "");
      const sp = document.createElement("span");
      sp.className = "txt";
      sp.textContent = txt;
      sp.title = txt;
      const del = document.createElement("button");
      del.type = "button";
      del.className = "del";
      del.textContent = "✕";
      del.title = "Hapus isian ini dari riwayat";
      del.addEventListener("mousedown", e => e.preventDefault());
      del.addEventListener("click", e => {
        e.stopPropagation();
        const store2 = tmHistLoad(localStorage);
        if (tmHistRemove(store2, field, txt)) tmHistSave(localStorage, store2);
        const rest = store2[field] || [];
        st.items = tmHistFilter(rest, input.value);
        if (st.hl >= st.items.length) st.hl = st.items.length - 1;
        paint();
      });
      row.appendChild(sp);
      row.appendChild(del);
      /* Pilih langsung saat mousedown (bukan click): lebih kebal terhadap
       * perubahan DOM/fokus di antara tekan & lepas tombol mouse.
       * Tombol ✕ dikecualikan — klik di sana untuk menghapus, bukan memilih. */
      row.addEventListener("mousedown", e => {
        if (e.target && e.target.closest && e.target.closest(".del")) return;
        e.preventDefault();
        tmHistPick(st, ix);
      });
      row.addEventListener("mouseenter", () => { st.hl = ix; paintHl(); });
      panel.appendChild(row);
    });
    const foot = document.createElement("div");
    foot.className = "hist-foot";
    foot.textContent = "🧹 Bersihkan riwayat kolom ini";
    foot.addEventListener("mousedown", e => e.preventDefault());
    foot.addEventListener("click", e => {
      e.stopPropagation();
      const store3 = tmHistLoad(localStorage);
      tmHistClear(store3, field);
      tmHistSave(localStorage, store3);
      tmHistClose();
      input.focus();
    });
    panel.appendChild(foot);
  }
  st.paint = paint;
  paint();
  if (!tmHistOpen) return; /* paint() menutup karena daftar kosong */
  wrap.appendChild(panel);
}

function tmHistRefresh(input, field){
  const st = tmHistOpen;
  if (!st || st.input !== input) return;
  const store = tmHistLoad(localStorage);
  const items = tmHistFilter(store[field] || [], input.value);
  if (!items.length) { tmHistClose(); return; }
  st.items = items;
  if (st.hl >= items.length) st.hl = items.length - 1;
  st.paint();
}

function tmHistPick(st, ix){
  const txt = st.items[ix];
  if (txt == null) return;
  st.input.value = txt;
  tmHistClose();
  /* picu listener "input" bawaan form agar formValues + validasi ter-update */
  st.input.dispatchEvent(new Event("input", { bubbles: true }));
  st.input.focus();
}

function tmHistKey(e, input, field){
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;
  const st = tmHistOpen;
  if (!st || st.input !== input) {
    if (e.key === "ArrowDown") { tmHistOpenDD(input, field); e.preventDefault(); }
    return;
  }
  if (e.key === "ArrowDown") {
    st.hl = Math.min(st.hl + 1, st.items.length - 1);
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    st.hl = Math.max(st.hl - 1, 0);
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (st.hl >= 0 && st.items[st.hl] != null) {
      tmHistPick(st, st.hl);
      e.preventDefault();
    } else {
      tmHistClose(); /* biarkan Enter normal (newline di textarea) */
    }
    return;
  }
  if (st.paintHl) st.paintHl(); else st.paint();
}

function showOutput(text){
  lastOutput = text;
  const box = $("output-box");
  box.textContent = text;
  box.classList.remove("hidden");
  $("loading-box").classList.add("hidden");
  $("btn-chatgpt").disabled = false;
  $("btn-gemini").disabled = false;
  box.scrollTop = 0;
}

/* Prompt is copied as a reliable fallback before sending the visitor to an AI service. */
function copyPrompt(){
  if (!lastOutput) return Promise.resolve(false);
  if (navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(lastOutput).then(() => true).catch(fallbackCopy);
  }
  return Promise.resolve(fallbackCopy());
}
function fallbackCopy(){
  const el = document.createElement("textarea");
  el.value = lastOutput;
  el.style.position = "fixed"; el.style.left = "-9999px";
  document.body.appendChild(el); el.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch(e){}
  el.remove();
  return ok;
}
function onOpenChatGPT(){
  if (!lastOutput) return;
  // ChatGPT supports prefill with ?q=. Very long URLs can be rejected by browsers.
  const url = lastOutput.length < 5500 ? "https://chatgpt.com/?q=" + encodeURIComponent(lastOutput) : "https://chatgpt.com/";
  window.open(url, "_blank", "noopener,noreferrer");
  copyPrompt().then(ok => toast(ok ? "ChatGPT dibuka. Prompt juga disalin sebagai cadangan." : "ChatGPT dibuka. Jika prompt belum tampil, salin teks hasil secara manual.", ok ? "ok" : ""));
}
function onOpenGemini(){
  if (!lastOutput) return;
  // Gemini has no reliable built-in URL query prefill. Open and paste clipboard.
  window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
  copyPrompt().then(ok => toast(ok ? "Gemini dibuka. Tekan Ctrl+V untuk memasukkan prompt yang tersalin." : "Gemini dibuka. Salin prompt secara manual lalu tempel di Gemini.", ok ? "ok" : ""));
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("btn-home").addEventListener("click", renderDashboard);
  $("btn-back").addEventListener("click", renderDashboard);
  $("btn-generate").addEventListener("click", onGenerate);
  $("btn-chatgpt").addEventListener("click", onOpenChatGPT);
  $("btn-gemini").addEventListener("click", onOpenGemini);
  document.addEventListener("click", (e) => {
    if (tmHistOpen && !e.target.closest(".hist-dd") && !e.target.closest(".hist-wrap")) tmHistClose();
  }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") tmHistClose(); });
  renderDashboard();
});
