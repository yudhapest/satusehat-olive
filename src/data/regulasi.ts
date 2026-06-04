/**
 * regulasi.ts
 * Data dasar hukum & regulasi per resource FHIR SATUSEHAT
 *
 * ── Sumber Link Regulasi ─────────────────────────────────────────────────
 *  • peraturan.bpk.go.id  — Basis Data Peraturan Resmi BPK RI
 *                           (UU, PP, Perpres — sumber primer hukum nasional)
 *  • jdih.kemkes.go.id    — JDIH Kementerian Kesehatan RI
 *                           (PMK, KMK, SE — peraturan teknis kesehatan)
 *  • satusehat.kemkes.go.id — Dokumentasi resmi Platform SATUSEHAT Kemenkes
 *                             (panduan teknis implementasi FHIR R4)
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface Regulasi {
  /** Nomor/kode regulasi, mis. "PMK No. 24 Tahun 2022" */
  nomor: string;
  /** Judul lengkap regulasi */
  judul: string;
  /** Pasal/ayat yang relevan */
  pasal?: string;
  /** Kutipan singkat isi pasal (opsional) */
  kutipan?: string;
  /** Jenis regulasi */
  jenis: "UU" | "PP" | "Perpres" | "PMK" | "Permenkes" | "KMK" | "SE" | "Kepmenkes";
  /** Tahun terbit */
  tahun: number;
  /** Link ke sumber resmi (BPK atau JDIH Kemenkes) */
  link?: string;
}

export interface RegulasiResource {
  /** Kewajiban: wajib / opsional */
  status: "WAJIB" | "OPSIONAL" | "WAJIB (IGD) / OPSIONAL (Rajal)" | "WAJIB (jika layanan imunisasi)";
  /** Penjelasan singkat mengapa resource ini diwajibkan */
  alasan: string;
  /** Daftar regulasi yang mewajibkan atau mengatur resource ini */
  regulasi: Regulasi[];
}

// ============================================================
// REGULASI UMUM SATUSEHAT (berlaku untuk semua resource)
// ============================================================
export const regulasiUmum: Regulasi[] = [
  {
    nomor: "UU No. 17 Tahun 2023",
    judul: "Undang-Undang Kesehatan",
    pasal: "Pasal 4, 86, 172 & 189",
    kutipan:
      "Setiap orang berhak atas data kesehatan pribadinya. Pemerintah wajib menyelenggarakan sistem informasi kesehatan nasional yang terintegrasi. Fasilitas kesehatan wajib melaporkan data pelayanan kepada sistem informasi nasional.",
    jenis: "UU",
    tahun: 2023,
    link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
  },
  {
    nomor: "PMK No. 24 Tahun 2022",
    judul: "Rekam Medis",
    pasal: "Pasal 1, 3, 7, 11 & 13",
    kutipan:
      "Rekam medis wajib memuat identitas pasien, tanggal kunjungan, diagnosis, tindakan medis, dan hasil pemeriksaan. Dapat berbentuk elektronik (Rekam Medis Elektronik/RME) dan wajib terintegrasi dengan sistem informasi kesehatan nasional.",
    jenis: "PMK",
    tahun: 2022,
    link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
  },
  {
    nomor: "PP No. 46 Tahun 2014",
    judul: "Sistem Informasi Kesehatan",
    pasal: "Pasal 6, 8, 14 & 22",
    kutipan:
      "Sistem informasi kesehatan nasional wajib diselenggarakan secara terintegrasi. Setiap fasilitas pelayanan kesehatan wajib mengelola, menyimpan, dan melaporkan data kesehatan individu secara elektronik kepada sistem informasi kesehatan nasional.",
    jenis: "PP",
    tahun: 2014,
    link: "https://peraturan.bpk.go.id/Details/5406/pp-no-46-tahun-2014",
  },
  {
    nomor: "PP No. 47 Tahun 2021",
    judul: "Penyelenggaraan Bidang Perumahsakitan",
    pasal: "Pasal 52–55",
    kutipan:
      "Rumah sakit wajib menyelenggarakan sistem informasi manajemen rumah sakit (SIMRS) yang terintegrasi dengan sistem informasi kesehatan nasional dan mendukung pelaporan data kesehatan secara elektronik.",
    jenis: "PP",
    tahun: 2021,
    link: "https://peraturan.bpk.go.id/Details/166373/pp-no-47-tahun-2021",
  },
  {
    nomor: "PMK No. 72 Tahun 2016",
    judul: "Standar Pelayanan Kefarmasian di Rumah Sakit",
    pasal: "Pasal 6 & 8",
    kutipan:
      "Pelayanan farmasi klinik wajib didokumentasikan, termasuk pengkajian resep, penelusuran riwayat penggunaan obat, rekonsiliasi obat, dan dispensing.",
    jenis: "PMK",
    tahun: 2016,
    link: "https://peraturan.bpk.go.id/Details/111564/permenkes-no-72-tahun-2016",
  },
  {
    nomor: "PMK No. 3 Tahun 2020",
    judul: "Klasifikasi dan Perizinan Rumah Sakit",
    pasal: "Pasal 12 & Lampiran",
    kutipan:
      "Rumah sakit wajib menyelenggarakan sistem informasi manajemen rumah sakit (SIMRS) yang terintegrasi dengan sistem pelaporan nasional sesuai dengan klasifikasinya.",
    jenis: "PMK",
    tahun: 2020,
    link: "https://peraturan.bpk.go.id/Details/132839/permenkes-no-3-tahun-2020",
  },
  {
    nomor: "PMK No. 1171 Tahun 2011",
    judul: "Sistem Informasi Rumah Sakit (SIRS)",
    pasal: "Pasal 3–5",
    kutipan:
      "Setiap rumah sakit wajib melaksanakan SIRS dan menyampaikan laporan data rumah sakit secara elektronik kepada Kemenkes menggunakan format dan mekanisme yang ditetapkan.",
    jenis: "PMK",
    tahun: 2011,
    link: "https://jdih.kemkes.go.id/arsip-peraturan/",
  },
  {
    nomor: "PMK No. 11 Tahun 2017",
    judul: "Keselamatan Pasien",
    pasal: "Pasal 5 & Lampiran (6 SKP)",
    kutipan:
      "Rumah sakit wajib menerapkan standar keselamatan pasien (SKP) meliputi identifikasi pasien, komunikasi efektif, pengamanan obat, ketepatan tindakan, pencegahan infeksi, dan pencegahan jatuh—yang semuanya harus terdokumentasi.",
    jenis: "PMK",
    tahun: 2017,
    link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
  },
];

// ============================================================
// REGULASI PER RESOURCE FHIR
// ============================================================
export const regulasiPerResource: Record<string, RegulasiResource> = {

  // ── Patient ───────────────────────────────────────────────
  Patient: {
    status: "WAJIB",
    alasan:
      "Identitas pasien wajib terdaftar dalam sistem rekam medis elektronik. Sebelum mengirim data klinis apa pun ke SATUSEHAT, tim wajib memastikan pasien sudah memiliki IHS Number melalui proses Patient Matching.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf a",
        kutipan:
          "Rekam medis sekurang-kurangnya memuat identitas pasien mencakup nama lengkap, tanggal lahir, jenis kelamin, nomor rekam medis, alamat, dan nomor identitas resmi.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PP No. 46 Tahun 2014",
        judul: "Sistem Informasi Kesehatan",
        pasal: "Pasal 11 & 22",
        kutipan:
          "Sistem informasi kesehatan wajib memuat data individu pasien yang mencakup identitas, riwayat kesehatan, dan data pelayanan yang terintegrasi secara nasional dengan pengidentifikasi tunggal.",
        jenis: "PP",
        tahun: 2014,
        link: "https://peraturan.bpk.go.id/Details/5406/pp-no-46-tahun-2014",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 4 & Pasal 86",
        kutipan:
          "Setiap orang berhak atas data kesehatan pribadinya yang tersimpan dalam sistem informasi kesehatan nasional dengan jaminan kerahasiaan.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── Organization ──────────────────────────────────────────
  Organization: {
    status: "WAJIB",
    alasan:
      "Setiap fasyankes wajib terdaftar dengan Organization ID resmi dari SATUSEHAT/Kemenkes sebagai penanggungjawab seluruh data klinis yang dikirimkan. Tanpa Organization ID, Encounter tidak dapat dikirimkan.",
    regulasi: [
      {
        nomor: "PMK No. 3 Tahun 2020",
        judul: "Klasifikasi dan Perizinan Rumah Sakit",
        pasal: "Pasal 2–5 & Pasal 12",
        kutipan:
          "Setiap rumah sakit wajib memiliki perizinan dan terdaftar dalam sistem informasi rumah sakit nasional dengan nomor registrasi yang menjadi identitas dalam seluruh pelaporan kesehatan.",
        jenis: "PMK",
        tahun: 2020,
        link: "https://peraturan.bpk.go.id/Details/132839/permenkes-no-3-tahun-2020",
      },
      {
        nomor: "PMK No. 1171 Tahun 2011",
        judul: "Sistem Informasi Rumah Sakit (SIRS)",
        pasal: "Pasal 3 & Pasal 5",
        kutipan:
          "Setiap rumah sakit wajib melaksanakan SIRS dan menyampaikan laporan data secara elektronik menggunakan identitas rumah sakit yang telah ditetapkan oleh Kemenkes.",
        jenis: "PMK",
        tahun: 2011,
        link: "https://jdih.kemkes.go.id/arsip-peraturan/",
      },
      {
        nomor: "PP No. 46 Tahun 2014",
        judul: "Sistem Informasi Kesehatan",
        pasal: "Pasal 8 & Pasal 14",
        kutipan:
          "Fasilitas pelayanan kesehatan wajib melaporkan data penyelenggaraan pelayanan kepada sistem informasi kesehatan nasional menggunakan identitas resmi yang telah terdaftar.",
        jenis: "PP",
        tahun: 2014,
        link: "https://peraturan.bpk.go.id/Details/5406/pp-no-46-tahun-2014",
      },
    ],
  },

  // ── Location ──────────────────────────────────────────────
  Location: {
    status: "WAJIB",
    alasan:
      "Location wajib disiapkan sebagai master data poli, ruang, kamar, dan bed. Encounter yang dikirim ke SATUSEHAT harus mereferensikan Location yang valid.",
    regulasi: [
      {
        nomor: "PP No. 47 Tahun 2021",
        judul: "Penyelenggaraan Bidang Perumahsakitan",
        pasal: "Pasal 14 & Pasal 21",
        kutipan:
          "Setiap unit pelayanan rumah sakit harus tercatat dalam sistem informasi rumah sakit, termasuk identitas ruangan, bangsal, dan tempat tidur yang digunakan untuk pelayanan pasien.",
        jenis: "PP",
        tahun: 2021,
        link: "https://peraturan.bpk.go.id/Details/166373/pp-no-47-tahun-2021",
      },
      {
        nomor: "PMK No. 3 Tahun 2020",
        judul: "Klasifikasi dan Perizinan Rumah Sakit",
        pasal: "Lampiran — Sarana dan Prasarana",
        kutipan:
          "Rumah sakit wajib memiliki data kapasitas tempat tidur, jumlah ruangan, dan fasilitas pelayanan yang dilaporkan dan terdaftar dalam sistem informasi.",
        jenis: "PMK",
        tahun: 2020,
        link: "https://peraturan.bpk.go.id/Details/132839/permenkes-no-3-tahun-2020",
      },
    ],
  },

  // ── Practitioner ──────────────────────────────────────────
  Practitioner: {
    status: "WAJIB",
    alasan:
      "Identitas tenaga kesehatan wajib terdaftar dalam sistem informasi kesehatan nasional. SATUSEHAT menyediakan Practitioner ID (SATUSEHAT ID Nakes) yang harus dipakai di semua resource klinis.",
    regulasi: [
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 199–204",
        kutipan:
          "Tenaga kesehatan wajib terdaftar dan memiliki Surat Tanda Registrasi (STR) yang tercatat dalam sistem informasi tenaga kesehatan nasional terintegrasi.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
      {
        nomor: "UU No. 29 Tahun 2004",
        judul: "Praktik Kedokteran",
        pasal: "Pasal 29–31",
        kutipan:
          "Setiap dokter dan dokter gigi yang melakukan praktik kedokteran wajib memiliki STR dan SIP yang terdaftar secara resmi. Identitas dokter wajib dicantumkan dalam setiap rekam medis yang dibuat.",
        jenis: "UU",
        tahun: 2004,
        link: "https://peraturan.bpk.go.id/Details/40979/uu-no-29-tahun-2004",
      },
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 8 & Pasal 11",
        kutipan:
          "Rekam medis yang dibuat secara elektronik harus memuat identitas tenaga kesehatan yang membuat catatan, termasuk nama dan nomor registrasi/SIP.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
    ],
  },

  // ── PractitionerRole ──────────────────────────────────────
  PractitionerRole: {
    status: "WAJIB",
    alasan:
      "PractitionerRole menghubungkan Practitioner dengan Organization, role, specialty, dan Location tempat ia bertugas. Tanpa ini, validasi pengirim data klinis oleh SATUSEHAT akan gagal.",
    regulasi: [
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 199–207",
        kutipan:
          "Tenaga kesehatan yang berpraktik di fasilitas pelayanan kesehatan wajib memiliki SIP (Surat Izin Praktik) yang dikeluarkan oleh pemerintah daerah setempat sesuai dengan jenis dan tempat praktik.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
      {
        nomor: "UU No. 29 Tahun 2004",
        judul: "Praktik Kedokteran",
        pasal: "Pasal 36–38",
        kutipan:
          "Setiap dokter yang melakukan praktik kedokteran di suatu fasilitas kesehatan wajib memiliki SIP di fasilitas tersebut, dan identitas praktik harus tercatat secara resmi.",
        jenis: "UU",
        tahun: 2004,
        link: "https://peraturan.bpk.go.id/Details/40979/uu-no-29-tahun-2004",
      },
    ],
  },

  // ── Encounter ─────────────────────────────────────────────
  Encounter: {
    status: "WAJIB",
    alasan:
      "Setiap kunjungan pasien wajib tercatat sebagai data rekam medis elektronik dan dilaporkan ke platform SATUSEHAT. Encounter adalah resource induk yang mengikat semua data klinis kunjungan tersebut.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 3 & Pasal 7",
        kutipan:
          "Rekam medis memuat tanggal dan waktu kunjungan, jenis pelayanan (rawat jalan/rawat inap/gawat darurat), serta status pasien selama perawatan.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 172",
        kutipan:
          "Fasilitas pelayanan kesehatan wajib melaporkan data pelayanan kesehatan kepada sistem informasi kesehatan nasional.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
      {
        nomor: "PP No. 46 Tahun 2014",
        judul: "Sistem Informasi Kesehatan",
        pasal: "Pasal 22",
        kutipan:
          "Data pelayanan kesehatan termasuk kunjungan, jenis layanan, dan status pasien wajib dicatat dan dilaporkan ke sistem informasi kesehatan nasional secara elektronik.",
        jenis: "PP",
        tahun: 2014,
        link: "https://peraturan.bpk.go.id/Details/5406/pp-no-46-tahun-2014",
      },
    ],
  },

  // ── AllergyIntolerance ────────────────────────────────────
  AllergyIntolerance: {
    status: "WAJIB",
    alasan:
      "Riwayat alergi pasien merupakan bagian wajib asesmen medis untuk keselamatan pasien (patient safety), termasuk kasus tidak ada alergi (NKA).",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf e",
        kutipan:
          "Rekam medis rawat jalan sekurang-kurangnya memuat: riwayat alergi dan reaksi yang pernah dialami pasien.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Pasal 5 & Lampiran (SKP 1)",
        kutipan:
          "Standar keselamatan pasien mensyaratkan identifikasi riwayat alergi sebelum pemberian obat atau tindakan medis sebagai bagian dari ketepatan identifikasi pasien.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
      {
        nomor: "PMK No. 72 Tahun 2016",
        judul: "Standar Pelayanan Kefarmasian di Rumah Sakit",
        pasal: "Pasal 6 ayat (2) huruf b",
        kutipan:
          "Pengkajian resep wajib mempertimbangkan riwayat alergi dan reaksi obat yang tidak dikehendaki (ROTD) sebelumnya.",
        jenis: "PMK",
        tahun: 2016,
        link: "https://peraturan.bpk.go.id/Details/111564/permenkes-no-72-tahun-2016",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 189",
        kutipan:
          "Tenaga medis wajib menyusun rekam medis yang memuat data klinis yang lengkap termasuk riwayat medis dan alergi pasien.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── Observation (Tanda Vital) ─────────────────────────────
  Observation: {
    status: "WAJIB",
    alasan:
      "Pemeriksaan tanda vital adalah bagian wajib asesmen awal yang harus tercatat di rekam medis setiap kunjungan.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf c",
        kutipan:
          "Rekam medis sekurang-kurangnya memuat hasil pemeriksaan fisik dan penunjang termasuk tanda-tanda vital pasien.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PP No. 47 Tahun 2021",
        judul: "Penyelenggaraan Bidang Perumahsakitan",
        pasal: "Pasal 21",
        kutipan:
          "Asesmen pasien rawat inap wajib mencakup pemeriksaan fisik termasuk tanda vital (tekanan darah, nadi, suhu, pernapasan, dan saturasi oksigen).",
        jenis: "PP",
        tahun: 2021,
        link: "https://peraturan.bpk.go.id/Details/166373/pp-no-47-tahun-2021",
      },
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 1",
        kutipan:
          "Identifikasi pasien yang benar mencakup pengukuran tanda vital sebagai bagian dari asesmen awal untuk memastikan keselamatan pasien.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
    ],
  },

  // ── Condition (Diagnosa) ──────────────────────────────────
  Condition: {
    status: "WAJIB",
    alasan:
      "Diagnosis menggunakan kode ICD-10 wajib dicantumkan dalam rekam medis dan merupakan dasar pelaporan morbiditas nasional.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf d",
        kutipan:
          "Rekam medis wajib memuat diagnosis utama, diagnosis sekunder, dan kode penyakit menggunakan ICD (International Classification of Diseases) versi yang berlaku.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 172–173",
        kutipan:
          "Data penyakit wajib dilaporkan kepada sistem informasi kesehatan nasional menggunakan kodifikasi standar internasional.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
      {
        nomor: "KMK No. 274 Tahun 2008",
        judul: "Pedoman Diagnosis dan Prosedur Rekam Medis",
        pasal: "Bab II",
        kutipan:
          "Penggunaan ICD-10 (International Statistical Classification of Diseases and Related Health Problems Tenth Revision) diwajibkan pada seluruh fasilitas pelayanan kesehatan di Indonesia.",
        jenis: "KMK",
        tahun: 2008,
        link: "https://jdih.kemkes.go.id/arsip-peraturan/",
      },
    ],
  },

  // ── Procedure (Tindakan Medis) ────────────────────────────
  Procedure: {
    status: "WAJIB",
    alasan:
      "Tindakan medis yang dilakukan wajib didokumentasikan menggunakan kode ICD-9-CM sebagai bukti layanan dan dasar klaim BPJS/JKN.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf f",
        kutipan:
          "Rekam medis wajib memuat tindakan dan/atau prosedur yang diberikan kepada pasien beserta kode tindakan.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "Perpres No. 82 Tahun 2018",
        judul: "Jaminan Kesehatan (JKN)",
        pasal: "Pasal 47 & 52",
        kutipan:
          "Klaim pelayanan kesehatan kepada BPJS Kesehatan wajib disertai kode prosedur medis menggunakan ICD-9-CM yang sesuai dengan tindakan yang dilakukan.",
        jenis: "Perpres",
        tahun: 2018,
        link: "https://peraturan.bpk.go.id/Details/92221/perpres-no-82-tahun-2018",
      },
    ],
  },

  // ── MedicationRequest (E-Resep) ───────────────────────────
  MedicationRequest: {
    status: "WAJIB",
    alasan:
      "Resep elektronik (e-resep) wajib memuat informasi lengkap obat yang diresepkan dan harus terintegrasi dengan sistem farmasi nasional.",
    regulasi: [
      {
        nomor: "PMK No. 72 Tahun 2016",
        judul: "Standar Pelayanan Kefarmasian di Rumah Sakit",
        pasal: "Pasal 6 ayat (1) & Pasal 8",
        kutipan:
          "Resep wajib memuat nama obat, dosis, cara pemberian, frekuensi, durasi, dan identitas penulis resep. Rumah sakit dapat menggunakan resep elektronik yang terintegrasi dengan sistem informasi.",
        jenis: "PMK",
        tahun: 2016,
        link: "https://peraturan.bpk.go.id/Details/111564/permenkes-no-72-tahun-2016",
      },
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf g",
        kutipan:
          "Rekam medis wajib memuat pengobatan dan/atau tindakan yang diberikan termasuk jenis obat, dosis, dan cara pemberian.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 145–148",
        kutipan:
          "Penggunaan obat dalam pelayanan kesehatan wajib didokumentasikan dan dilaporkan secara elektronik untuk mendukung farmakovigilans nasional.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── MedicationDispense (Penyerahan Obat) ─────────────────
  MedicationDispense: {
    status: "WAJIB",
    alasan:
      "Penyerahan obat ke pasien wajib dicatat sebagai bukti dispensing farmasi dan untuk keperluan rekonsiliasi obat.",
    regulasi: [
      {
        nomor: "PMK No. 72 Tahun 2016",
        judul: "Standar Pelayanan Kefarmasian di Rumah Sakit",
        pasal: "Pasal 6 ayat (2) huruf d",
        kutipan:
          "Dispensing obat wajib didokumentasikan meliputi: nama pasien, nama obat, jumlah yang diserahkan, tanggal penyerahan, dan identitas tenaga farmasi yang menyerahkan.",
        jenis: "PMK",
        tahun: 2016,
        link: "https://peraturan.bpk.go.id/Details/111564/permenkes-no-72-tahun-2016",
      },
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 3",
        kutipan:
          "Penerapan keamanan obat yang perlu diwaspadai (high alert medication) wajib didokumentasikan, termasuk proses verifikasi sebelum pemberian.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
    ],
  },

  // ── MedicationAdministration ──────────────────────────────
  MedicationAdministration: {
    status: "WAJIB",
    alasan:
      "Pemberian obat langsung ke pasien (injeksi, infus, obat cito IGD) wajib didokumentasikan sebagai bagian dari keselamatan pemberian obat dan pembuktian asuhan farmasi.",
    regulasi: [
      {
        nomor: "PMK No. 72 Tahun 2016",
        judul: "Standar Pelayanan Kefarmasian di Rumah Sakit",
        pasal: "Pasal 6 ayat (2) huruf e",
        kutipan:
          "Pemberian obat kepada pasien wajib didokumentasikan mencakup: nama pasien, nama obat, dosis, waktu dan cara pemberian, serta identitas petugas yang memberikan.",
        jenis: "PMK",
        tahun: 2016,
        link: "https://peraturan.bpk.go.id/Details/111564/permenkes-no-72-tahun-2016",
      },
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 3 — Keamanan Obat",
        kutipan:
          "Rumah sakit wajib memastikan prinsip 5 Tepat (tepat pasien, tepat obat, tepat dosis, tepat waktu, tepat rute) dalam pemberian obat dan mendokumentasikannya.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
    ],
  },

  // ── ClinicalImpression (Asesmen SOAP / Triase) ───────────
  ClinicalImpression: {
    status: "WAJIB (IGD) / OPSIONAL (Rajal)",
    alasan:
      "Catatan klinis SOAP atau triase IGD merupakan dokumentasi proses berpikir klinis dokter yang dibutuhkan untuk kesinambungan asuhan dan pertanggungjawaban medis.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf b",
        kutipan:
          "Rekam medis wajib memuat anamnesis termasuk keluhan utama, riwayat penyakit sekarang, riwayat penyakit dahulu, dan riwayat keluarga.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 189 ayat (2)",
        kutipan:
          "Tenaga medis bertanggung jawab atas kelengkapan dan kebenaran isi rekam medis yang dibuatnya, termasuk catatan perkembangan pasien.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── FamilyMemberHistory ───────────────────────────────────
  FamilyMemberHistory: {
    status: "OPSIONAL",
    alasan:
      "Riwayat penyakit keluarga bersifat opsional namun dianjurkan untuk penyakit herediter dan faktor risiko kronik.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf b",
        kutipan:
          "Anamnesis dalam rekam medis dapat memuat riwayat penyakit keluarga yang relevan dengan kondisi pasien saat ini.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
    ],
  },

  // ── MedicationStatement ───────────────────────────────────
  MedicationStatement: {
    status: "OPSIONAL",
    alasan:
      "Rekonsiliasi obat yang sedang dikonsumsi penting untuk keselamatan pasien, terutama saat transisi perawatan.",
    regulasi: [
      {
        nomor: "PMK No. 72 Tahun 2016",
        judul: "Standar Pelayanan Kefarmasian di Rumah Sakit",
        pasal: "Pasal 6 ayat (2) huruf a",
        kutipan:
          "Rekonsiliasi obat wajib dilakukan pada setiap perpindahan layanan (transfer) untuk memastikan kesinambungan terapi dan mencegah medication error.",
        jenis: "PMK",
        tahun: 2016,
        link: "https://peraturan.bpk.go.id/Details/111564/permenkes-no-72-tahun-2016",
      },
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 3",
        kutipan:
          "Rumah sakit wajib menerapkan proses rekonsiliasi obat yang mendokumentasikan semua obat yang dibawa pasien dari luar.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
    ],
  },

  // ── ServiceRequest (Order Lab/Rad) ───────────────────────
  ServiceRequest: {
    status: "OPSIONAL",
    alasan:
      "Permintaan pemeriksaan laboratorium atau radiologi harus terdokumentasi sebagai bukti klinis order dan kebutuhan medis.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf h",
        kutipan:
          "Rekam medis memuat hasil pemeriksaan laboratorium dan pemeriksaan penunjang lainnya beserta permintaan pemeriksaannya.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PMK No. 43 Tahun 2013",
        judul: "Cara Penyelenggaraan Laboratorium Klinik yang Baik",
        pasal: "Pasal 10 & 14",
        kutipan:
          "Setiap pemeriksaan laboratorium harus berdasarkan permintaan tertulis/elektronik dari dokter yang mencantumkan identitas pasien, jenis pemeriksaan, dan diagnosis sementara.",
        jenis: "PMK",
        tahun: 2013,
        link: "https://peraturan.bpk.go.id/Details/14680/permenkes-no-43-tahun-2013",
      },
    ],
  },

  // ── Specimen ──────────────────────────────────────────────
  Specimen: {
    status: "OPSIONAL",
    alasan:
      "Data spesimen mendokumentasikan rantai pengambilan sampel biologis untuk menjamin validitas dan keterlacakan hasil laboratorium.",
    regulasi: [
      {
        nomor: "PMK No. 43 Tahun 2013",
        judul: "Cara Penyelenggaraan Laboratorium Klinik yang Baik",
        pasal: "Pasal 12",
        kutipan:
          "Laboratorium klinik wajib mendokumentasikan proses penerimaan, penanganan, dan penyimpanan spesimen termasuk jenis spesimen, waktu pengambilan, dan kondisi spesimen.",
        jenis: "PMK",
        tahun: 2013,
        link: "https://peraturan.bpk.go.id/Details/14680/permenkes-no-43-tahun-2013",
      },
    ],
  },

  // ── DiagnosticReport (Lab/Radiologi) ─────────────────────
  DiagnosticReport: {
    status: "OPSIONAL",
    alasan:
      "Laporan hasil pemeriksaan penunjang merupakan bagian dari rekam medis yang harus dapat diakses oleh pasien dan dokter perujuk.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf h",
        kutipan:
          "Rekam medis wajib memuat hasil pemeriksaan laboratorium, radiologi, dan pemeriksaan penunjang lainnya yang dilakukan selama kunjungan.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PMK No. 43 Tahun 2013",
        judul: "Cara Penyelenggaraan Laboratorium Klinik yang Baik",
        pasal: "Pasal 14 & 15",
        kutipan:
          "Hasil pemeriksaan laboratorium wajib dilaporkan secara tertulis/elektronik kepada dokter pengirim dan disimpan dalam rekam medis pasien.",
        jenis: "PMK",
        tahun: 2013,
        link: "https://peraturan.bpk.go.id/Details/14680/permenkes-no-43-tahun-2013",
      },
    ],
  },

  // ── DocumentReference ─────────────────────────────────────
  DocumentReference: {
    status: "OPSIONAL",
    alasan:
      "Dokumen klinis seperti PDF hasil lab, surat rujukan, consent scan, dan resume eksternal harus bisa diakses secara digital sebagai bagian dari rekam medis elektronik.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 11 & Pasal 12",
        kutipan:
          "Rekam medis elektronik wajib dapat diakses dan dipertukarkan antar fasilitas pelayanan kesehatan. Dokumen pendukung yang menjadi bagian rekam medis harus tersimpan dan dapat diakses secara digital.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 172",
        kutipan:
          "Data kesehatan termasuk dokumen klinis wajib tersimpan dalam sistem informasi yang memungkinkan akses, pertukaran, dan keberlangsungan data antar fasilitas kesehatan.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── ImagingStudy (DICOM/Radiologi) ───────────────────────
  ImagingStudy: {
    status: "OPSIONAL",
    alasan:
      "Data citra radiologi (DICOM) dikirim via DICOM Router ke NIDR dan terintegrasi ke SATUSEHAT untuk mendukung pertukaran data imaging nasional.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 & Pasal 12",
        kutipan:
          "Citra diagnostik (foto rontgen, CT scan, MRI, dll.) merupakan bagian dari rekam medis elektronik yang harus dapat diakses secara digital.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PMK No. 3 Tahun 2020",
        judul: "Klasifikasi dan Perizinan Rumah Sakit",
        pasal: "Lampiran — Standar Radiologi",
        kutipan:
          "Instalasi radiologi rumah sakit kelas B/A wajib memiliki sistem PACS (Picture Archiving and Communication System) untuk penyimpanan citra digital.",
        jenis: "PMK",
        tahun: 2020,
        link: "https://peraturan.bpk.go.id/Details/132839/permenkes-no-3-tahun-2020",
      },
    ],
  },

  // ── Consent (Persetujuan Tindakan) ───────────────────────
  Consent: {
    status: "WAJIB",
    alasan:
      "Informed consent (persetujuan tindakan medis) adalah hak pasien yang dilindungi undang-undang dan merupakan dokumen medikolegal wajib sebelum tindakan invasif, operasi, anestesi, atau tindakan berisiko tinggi.",
    regulasi: [
      {
        nomor: "PMK No. 290 Tahun 2008",
        judul: "Persetujuan Tindakan Kedokteran (Informed Consent)",
        pasal: "Pasal 2, 3, 7 & 14",
        kutipan:
          "Setiap tindakan kedokteran yang mengandung risiko tinggi harus mendapatkan persetujuan tertulis dari pasien atau walinya setelah mendapatkan penjelasan yang cukup. Persetujuan ini harus disimpan dalam rekam medis.",
        jenis: "PMK",
        tahun: 2008,
        link: "https://peraturan.bpk.go.id/Details/2744/permenkes-no-290-tahun-2008",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 4 ayat (1) & Pasal 276",
        kutipan:
          "Setiap orang berhak mendapatkan informasi tentang data kesehatannya dan memberikan persetujuan atau penolakan tindakan medis. Pelanggar ketentuan informed consent dapat dikenai sanksi pidana.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
      {
        nomor: "UU No. 29 Tahun 2004",
        judul: "Praktik Kedokteran",
        pasal: "Pasal 45–46",
        kutipan:
          "Setiap tindakan kedokteran yang akan dilakukan oleh dokter atau dokter gigi terhadap pasien harus mendapat persetujuan. Persetujuan diberikan setelah pasien mendapat penjelasan secara lengkap.",
        jenis: "UU",
        tahun: 2004,
        link: "https://peraturan.bpk.go.id/Details/40979/uu-no-29-tahun-2004",
      },
    ],
  },

  // ── Coverage (Asuransi / Penjamin) ────────────────────────
  Coverage: {
    status: "OPSIONAL",
    alasan:
      "Coverage mencatat penjamin pasien (BPJS/JKN, asuransi swasta, perusahaan, atau umum). Wajib ada jika tim menyiapkan alur klaim, verifikasi eligibilitas, atau integrasi BPJS.",
    regulasi: [
      {
        nomor: "Perpres No. 82 Tahun 2018",
        judul: "Jaminan Kesehatan (JKN)",
        pasal: "Pasal 6 & Pasal 47",
        kutipan:
          "Setiap peserta JKN wajib terdaftar dengan nomor identitas peserta yang digunakan dalam setiap pelayanan kesehatan dan pengajuan klaim ke BPJS Kesehatan.",
        jenis: "Perpres",
        tahun: 2018,
        link: "https://peraturan.bpk.go.id/Details/92221/perpres-no-82-tahun-2018",
      },
      {
        nomor: "UU No. 40 Tahun 2004",
        judul: "Sistem Jaminan Sosial Nasional (SJSN)",
        pasal: "Pasal 19–24",
        kutipan:
          "Jaminan kesehatan diselenggarakan secara nasional berdasarkan prinsip asuransi sosial dan ekuitas. Setiap peserta wajib memiliki kartu identitas sebagai bukti kepesertaan.",
        jenis: "UU",
        tahun: 2004,
        link: "https://peraturan.bpk.go.id/Details/40545/uu-no-40-tahun-2004",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 168–177",
        kutipan:
          "Pembiayaan kesehatan dilaksanakan melalui jaminan kesehatan nasional. Data kepesertaan dan pembiayaan wajib terintegrasi dengan sistem informasi kesehatan nasional.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── Composition (Resume / Discharge Summary) ──────────────
  Composition: {
    status: "OPSIONAL",
    alasan:
      "Ringkasan kunjungan (Composition) merupakan rekap dokumen klinis yang dibutuhkan untuk kesinambungan layanan, surat rujukan, dan discharge summary saat pasien pulang.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (2) & Pasal 11",
        kutipan:
          "Rekam medis rawat inap wajib memuat resume medis yang berisi ringkasan kondisi, diagnosis, tindakan, hasil pemeriksaan, dan rencana tindak lanjut saat pasien pulang.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 172",
        kutipan:
          "Data kesehatan harus dapat dipertukarkan antar fasilitas pelayanan kesehatan untuk mendukung kesinambungan layanan kepada pasien.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── CarePlan ──────────────────────────────────────────────
  CarePlan: {
    status: "OPSIONAL",
    alasan:
      "Rencana perawatan (CarePlan) mendokumentasikan target klinis, intervensi, dan jadwal tindak lanjut yang wajib ada untuk perawatan pasien kronik dan ranap.",
    regulasi: [
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 1 & Lampiran SNARS",
        kutipan:
          "Rumah sakit wajib menerapkan rencana asuhan yang terkoordinasi antara DPJP, perawat, dan tenaga kesehatan lain. Rencana asuhan harus terdokumentasi dalam rekam medis.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7 ayat (1) huruf i",
        kutipan:
          "Rekam medis wajib memuat rencana tindak lanjut yang akan diberikan kepada pasien, termasuk jadwal kontrol, rujukan, dan instruksi pasca layanan.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "PP No. 47 Tahun 2021",
        judul: "Penyelenggaraan Bidang Perumahsakitan",
        pasal: "Pasal 21 & 22",
        kutipan:
          "Pelayanan medis di rumah sakit harus berdasarkan rencana asuhan yang dibuat oleh DPJP, mencakup diagnosis, tujuan pengobatan, dan rencana tindak lanjut.",
        jenis: "PP",
        tahun: 2021,
        link: "https://peraturan.bpk.go.id/Details/166373/pp-no-47-tahun-2021",
      },
    ],
  },

  // ── EpisodeOfCare ─────────────────────────────────────────
  EpisodeOfCare: {
    status: "OPSIONAL",
    alasan:
      "EpisodeOfCare mengelompokkan beberapa kunjungan dalam satu episode penyakit yang berkesinambungan, penting untuk pasien kronik dan proses rujukan.",
    regulasi: [
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 11 & 12",
        kutipan:
          "Rekam medis harus memungkinkan penelusuran riwayat pelayanan pasien secara kronologis dan berkesinambungan antar kunjungan dan antar fasilitas.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 172 & 184",
        kutipan:
          "Sistem informasi kesehatan harus mendukung kesinambungan pelayanan kesehatan dan kemudahan akses riwayat pelayanan pasien antar fasilitas.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── Communication (Edukasi / Komunikasi Klinis) ───────────
  Communication: {
    status: "OPSIONAL",
    alasan:
      "Dokumentasi komunikasi dan edukasi kepada pasien/keluarga wajib ada sebagai bukti implementasi standar komunikasi efektif (SKP 2) dan edukasi pasien untuk akreditasi.",
    regulasi: [
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 2 — Komunikasi Efektif",
        kutipan:
          "Rumah sakit wajib menerapkan komunikasi efektif antar tenaga kesehatan dan kepada pasien/keluarga, serta mendokumentasikan semua komunikasi klinis yang signifikan dalam rekam medis.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 4 ayat (1) huruf d",
        kutipan:
          "Setiap orang berhak mendapatkan informasi yang benar dan jelas tentang tindakan medis yang akan diterimanya termasuk risiko dan alternatif tindakan.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── RiskAssessment ────────────────────────────────────────
  RiskAssessment: {
    status: "OPSIONAL",
    alasan:
      "Penilaian risiko klinis (jatuh, dekubitus, aspirasi, EWS) wajib terdokumentasi sebagai bagian dari standar patient safety dan akreditasi SNARS.",
    regulasi: [
      {
        nomor: "PMK No. 11 Tahun 2017",
        judul: "Keselamatan Pasien",
        pasal: "Standar SKP 6 — Pencegahan Pasien Jatuh",
        kutipan:
          "Rumah sakit wajib menerapkan asesmen risiko jatuh menggunakan instrumen terstandar (seperti Morse, Humpty Dumpty, Ontario) dan mendokumentasikan hasilnya dalam rekam medis.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/111686/permenkes-no-11-tahun-2017",
      },
      {
        nomor: "PP No. 47 Tahun 2021",
        judul: "Penyelenggaraan Bidang Perumahsakitan",
        pasal: "Pasal 25",
        kutipan:
          "Rumah sakit wajib melakukan pengkajian risiko klinis secara sistematis pada pasien rawat inap, termasuk risiko jatuh dan risiko infeksi.",
        jenis: "PP",
        tahun: 2021,
        link: "https://peraturan.bpk.go.id/Details/166373/pp-no-47-tahun-2021",
      },
    ],
  },

  // ── NutritionOrder ────────────────────────────────────────
  NutritionOrder: {
    status: "OPSIONAL",
    alasan:
      "Order diet dan terapi nutrisi wajib didokumentasikan oleh DPJP/ahli gizi sebagai tindak lanjut skrining gizi, terutama pada pasien ranap dengan risiko malnutrisi.",
    regulasi: [
      {
        nomor: "PMK No. 78 Tahun 2013",
        judul: "Pedoman Pelayanan Gizi Rumah Sakit",
        pasal: "Bab IV & V",
        kutipan:
          "Pelayanan gizi rawat inap meliputi skrining gizi, asesmen gizi, diagnosis gizi, intervensi gizi, dan monitoring evaluasi yang seluruhnya wajib didokumentasikan dalam rekam medis pasien.",
        jenis: "PMK",
        tahun: 2013,
        link: "https://jdih.kemkes.go.id/arsip-peraturan/",
      },
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7",
        kutipan:
          "Rekam medis rawat inap wajib memuat instruksi diet dan terapi gizi yang diberikan kepada pasien sebagai bagian dari rencana asuhan.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
    ],
  },

  // ── Immunization ─────────────────────────────────────────
  Immunization: {
    status: "WAJIB (jika layanan imunisasi)",
    alasan:
      "Data imunisasi wajib dilaporkan ke sistem informasi imunisasi nasional (SIAR/SMILE/PCare) dan terintegrasi SATUSEHAT.",
    regulasi: [
      {
        nomor: "PMK No. 12 Tahun 2017",
        judul: "Penyelenggaraan Imunisasi",
        pasal: "Pasal 31–33",
        kutipan:
          "Setiap fasilitas pelayanan kesehatan yang memberikan imunisasi wajib melaporkan data imunisasi secara elektronik kepada Dinas Kesehatan melalui aplikasi pencatatan imunisasi yang terintegrasi.",
        jenis: "PMK",
        tahun: 2017,
        link: "https://peraturan.bpk.go.id/Details/161852/permenkes-no-12-tahun-2017",
      },
      {
        nomor: "UU No. 17 Tahun 2023",
        judul: "Undang-Undang Kesehatan",
        pasal: "Pasal 163–165",
        kutipan:
          "Imunisasi program pemerintah bersifat wajib dan seluruh data pemberian imunisasi harus tercatat dalam sistem informasi kesehatan nasional.",
        jenis: "UU",
        tahun: 2023,
        link: "https://peraturan.bpk.go.id/Details/258993/uu-no-17-tahun-2023",
      },
    ],
  },

  // ── Questionnaire / QuestionnaireResponse ────────────────
  Questionnaire: {
    status: "OPSIONAL",
    alasan:
      "Formulir skrining dan asesmen terstandar (mis. PHQ-9, MMSE, Braden, MNA) mendukung standar mutu layanan dan akreditasi RS.",
    regulasi: [
      {
        nomor: "PMK No. 34 Tahun 2022",
        judul: "Akreditasi Pusat Kesehatan Masyarakat, Klinik, Laboratorium Kesehatan, Unit Transfusi Darah, Tempat Praktik Mandiri Dokter, dan Tempat Praktik Mandiri Dokter Gigi",
        pasal: "Standar PKPKM 3.4",
        kutipan:
          "Asesmen pasien harus menggunakan instrumen terstandar yang terdokumentasi dalam rekam medis.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://jdih.kemkes.go.id/arsip-peraturan/",
      },
      {
        nomor: "PMK No. 24 Tahun 2022",
        judul: "Rekam Medis",
        pasal: "Pasal 7",
        kutipan:
          "Formulir asesmen tambahan yang digunakan dalam pelayanan merupakan bagian tidak terpisahkan dari rekam medis pasien.",
        jenis: "PMK",
        tahun: 2022,
        link: "https://peraturan.bpk.go.id/Details/230516/permenkes-no-24-tahun-2022",
      },
    ],
  },
};

// ── Helper: ambil regulasi untuk resource tertentu ─────────
export function getRegulasiResource(resourceName: string): RegulasiResource | null {
  return regulasiPerResource[resourceName] ?? null;
}

// ── Badge warna jenis regulasi ─────────────────────────────
// Setiap warna merepresentasikan hierarki dan jenis peraturan dalam
// sistem hukum Indonesia (dari tertinggi ke teknis implementasi).
export const jenisBadgeColor: Record<string, string> = {
  UU:        "#dc2626", // merah tua  — Undang-Undang (tertinggi)
  PP:        "#b45309", // coklat     — Peraturan Pemerintah
  Perpres:   "#d97706", // amber      — Peraturan Presiden
  PMK:       "#2563eb", // biru       — Peraturan Menteri Kesehatan (paling umum)
  Permenkes: "#2563eb", // biru       — alias PMK (format lama)
  KMK:       "#7c3aed", // ungu       — Keputusan Menteri Kesehatan
  SE:        "#059669", // hijau      — Surat Edaran
  Kepmenkes: "#7c3aed", // ungu       — Keputusan Menteri Kesehatan (alias KMK)
};
