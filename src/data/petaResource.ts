// Auto-generated from satusehat_fhir_payloads.html with SATUSEHAT corrections applied.
export type Priority = 'setup' | 'wajib' | 'penting';

export interface MappingRow { fhir: string; simrs: string; desc: string; }
export interface ResourceItem {
  id: string;
  icon: string;
  priority: Priority;
  label: string;
  sub: string;
  simrs: string[];
  method: string;
  endpoint: string;
  trigger: string;
  mapping: MappingRow[];
  note: string;
  json: string;
}
export interface Group { group: string; groupIcon: string; color: Priority; items: ResourceItem[]; }

export const priorityMeta: Record<Priority, { label: string }> = {
  setup: { label: 'Setup awal' },
  wajib: { label: 'Wajib Des 2026' },
  penting: { label: 'Penting' },
};

const raw: Omit<ResourceItem, 'icon'>[] = [
  {
    id:'Organization', priority:'setup', label:'Setup awal',
    sub:'Data fasyankes rumah sakit',
    method:'GET', endpoint:'GET /Organization?identifier=<kode_org>',
    trigger:'1x saat onboarding — tidak perlu POST',
    simrs:['— (data dari SatuSehat)'],
    mapping:[
      {fhir:'id',simrs:'—',desc:'Disimpan sebagai organization_ihs_id di config SIMRS'},
      {fhir:'identifier[0].value',simrs:'kode_fasyankes',desc:'Kode org dari Kemenkes, bukan dari SIMRS'},
      {fhir:'name',simrs:'nama_rs',desc:'Nama rumah sakit'},
    ],
    note:'Tidak perlu POST. Cukup GET sekali untuk ambil organization_id. Simpan di .env atau tabel config.',
    json:`{
  "resourceType": "Organization",
  "id": "org-rs-001",
  "identifier": [
    {
      "use": "official",
      "system": "http://sys-ids.kemkes.go.id/organization/5277013",
      "value": "5277013"
    }
  ],
  "active": true,
  "type": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/organization-type",
          "code": "prov",
          "display": "Healthcare Provider"
        }
      ]
    }
  ],
  "name": "RS Umum Daerah Pati",
  "telecom": [
    { "system": "phone", "value": "0295-381020" },
    { "system": "email", "value": "rsud@pati.go.id" }
  ],
  "address": [
    {
      "use": "work",
      "line": ["Jl. Ratu Kalinyamat No.16"],
      "city": "Pati",
      "postalCode": "59112",
      "country": "ID"
    }
  ]
}`
  },
  {
    id:'Location', priority:'setup', label:'Setup awal',
    sub:'Data poli, kamar, dan ruangan',
    method:'POST', endpoint:'POST /Location',
    trigger:'Setup awal per poli/kamar baru',
    simrs:['poli','kamar','ruangan'],
    mapping:[
      {fhir:'name',simrs:'poli.nama_poli',desc:'Nama poli atau ruangan'},
      {fhir:'description',simrs:'poli.keterangan',desc:'Deskripsi singkat'},
      {fhir:'mode',simrs:'—',desc:'Selalu "instance"'},
      {fhir:'type[0].coding[0].code',simrs:'poli.jenis',desc:'Kode jenis: EMER=IGD, AMB=Poli, IMP=Ranap'},
      {fhir:'physicalType',simrs:'—',desc:'Selalu "ro" (room)'},
      {fhir:'managingOrganization',simrs:'organization_ihs_id',desc:'ID fasyankes dari SatuSehat'},
    ],
    note:'Lakukan 1x per poli/kamar. Simpan location_ihs_id di tabel master poli untuk dipakai saat kirim Encounter.',
    json:`{
  "resourceType": "Location",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/location/5277013",
      "value": "LOC-POLI-ANAK-01"
    }
  ],
  "status": "active",
  "name": "Poli Anak",
  "description": "Poliklinik Anak Lantai 1",
  "mode": "instance",
  "type": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
          "code": "AMB",
          "display": "Ambulatory"
        }
      ]
    }
  ],
  "physicalType": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
        "code": "ro",
        "display": "Room"
      }
    ]
  },
  "position": {
    "longitude": 111.0432,
    "latitude": -6.7633
  },
  "managingOrganization": {
    "reference": "Organization/org-rs-001"
  }
}`
  },
  {
    id:'Practitioner', priority:'setup', label:'Setup awal',
    sub:'Data dokter & tenaga medis',
    method:'GET', endpoint:'GET /Practitioner?identifier=<NIK_dokter>',
    trigger:'Setup awal atau saat tambah dokter baru',
    simrs:['dokter','pegawai'],
    mapping:[
      {fhir:'identifier[0].value',simrs:'dokter.nik',desc:'NIK dokter untuk pencarian'},
      {fhir:'identifier[1].value',simrs:'dokter.no_str',desc:'Nomor STR dokter'},
      {fhir:'name[0].text',simrs:'dokter.nama',desc:'Nama lengkap dengan gelar'},
      {fhir:'id',simrs:'dokter.ihs_id (simpan)',desc:'Hasil GET — simpan kembali ke tabel dokter'},
    ],
    note:'Cari by NIK. Kalau ketemu simpan ihs_id di kolom dokter.ihs_id. Kalau tidak ketemu, dokter belum terdaftar di SatuSehat — koordinasi dengan HR/kredensial.',
    json:`{
  "resourceType": "Practitioner",
  "id": "N10000001",
  "meta": {
    "lastUpdated": "2024-01-15T08:00:00+07:00"
  },
  "identifier": [
    {
      "use": "official",
      "system": "https://fhir.kemkes.go.id/id/nik",
      "value": "3315012505850001"
    },
    {
      "use": "official",
      "system": "https://fhir.kemkes.go.id/id/nira",
      "value": "42024050112345678"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "text": "dr. Budi Santoso, Sp.PD"
    }
  ],
  "telecom": [
    { "system": "phone", "value": "081234567890" }
  ],
  "gender": "male",
  "birthDate": "1985-05-25",
  "qualification": [
    {
      "code": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0360",
            "code": "MD",
            "display": "Doctor of Medicine"
          }
        ]
      }
    }
  ]
}`
  },
  {
    id:'Patient', priority:'setup', label:'Setup awal',
    sub:'Data identitas pasien',
    method:'GET (cari by NIK)', endpoint:'GET /Patient?identifier=https://fhir.kemkes.go.id/id/nik|{nik}',
    trigger:'Saat pasien pertama kali daftar (patient.created)',
    simrs:['patient'],
    mapping:[
      {fhir:'identifier[0].system',simrs:'—',desc:'https://fhir.kemkes.go.id/id/nik (NIK)'},
      {fhir:'identifier[0].value',simrs:'patient.nik',desc:'16 digit NIK KTP'},
      {fhir:'identifier[1].value',simrs:'patient.no_bpjs',desc:'Nomor BPJS (jika ada)'},
      {fhir:'name[0].text',simrs:'patient.nama',desc:'Nama lengkap sesuai KTP'},
      {fhir:'birthDate',simrs:'patient.tgl_lahir',desc:'Format YYYY-MM-DD'},
      {fhir:'gender',simrs:'patient.jenis_kelamin',desc:'L→male, P→female'},
      {fhir:'address[0].line',simrs:'patient.alamat',desc:'Alamat lengkap'},
      {fhir:'telecom[0].value',simrs:'patient.no_hp',desc:'Nomor HP pasien'},
    ],
    note:'Fasyankes TIDAK mendaftarkan pasien dewasa baru — cukup GET by NIK untuk dapat IHS Number. POST Patient hanya untuk bayi baru lahir (Create Newborn by NIK ibu). Simpan mapping NIK ↔ IHS Number di patient.ihs_id.',
    json:`{
  "resourceType": "Patient",
  "meta": {
    "profile": [
      "https://fhir.kemkes.go.id/r4/StructureDefinition/Patient"
    ]
  },
  "identifier": [
    {
      "use": "official",
      "system": "https://fhir.kemkes.go.id/id/nik",
      "value": "3315012505920001"
    },
    {
      "use": "official",
      "system": "https://fhir.kemkes.go.id/id/bpjs-id",
      "value": "0001234567890"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "text": "Ahmad Fauzi"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "081298765432",
      "use": "mobile"
    }
  ],
  "gender": "male",
  "birthDate": "1992-05-25",
  "address": [
    {
      "use": "home",
      "line": ["Jl. Merdeka No. 10 RT 01/RW 02"],
      "city": "Pati",
      "postalCode": "59112",
      "country": "ID",
      "extension": [
        {
          "url": "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
          "extension": [
            {"url": "province", "valueCode": "33"},
            {"url": "city", "valueCode": "3315"},
            {"url": "district", "valueCode": "331502"},
            {"url": "village", "valueCode": "3315020001"}
          ]
        }
      ]
    }
  ],
  "multipleBirthInteger": 0
}`
  },
  {
    id:'Encounter', priority:'wajib', label:'Wajib Des 2026',
    sub:'Data kunjungan pasien (POST saat daftar, PUT saat update)',
    method:'POST → PUT', endpoint:'POST /Encounter | PUT /Encounter/<ihs_id>',
    trigger:'regpas.created (arrived) | regpas.status_changed',
    simrs:['regpas'],
    mapping:[
      {fhir:'identifier[0].value',simrs:'regpas.no_registrasi',desc:'Nomor registrasi SIMRS'},
      {fhir:'status',simrs:'regpas.status_kunjungan',desc:'arrived→in-progress→finished/cancelled'},
      {fhir:'class.code',simrs:'regpas.jenis_rawat',desc:'AMB=rajal, IMP=ranap, EMER=IGD'},
      {fhir:'subject.reference',simrs:'patient.ihs_id',desc:'Patient/{ihs_id} — wajib ada dulu'},
      {fhir:'participant[0].individual',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} dokter'},
      {fhir:'location[0].location',simrs:'poli.location_ihs_id',desc:'Location/{ihs_id} poli/kamar'},
      {fhir:'serviceProvider',simrs:'organization_ihs_id',desc:'Organization/{ihs_id} fasyankes'},
      {fhir:'period.start',simrs:'regpas.tgl_masuk + jam_masuk',desc:'Format ISO 8601 dengan timezone +07:00'},
      {fhir:'period.end',simrs:'regpas.tgl_keluar + jam_keluar',desc:'Diisi saat finished'},
      {fhir:'diagnosis[0].condition',simrs:'diagnosa.ihs_id',desc:'Diisi setelah Condition berhasil kirim'},
    ],
    note:'Ini resource paling kritis. Semua resource lain butuh Encounter ihs_id. Kirim 3 fase: (1) POST saat arrived, (2) PUT saat in-progress, (3) PUT saat finished dengan diagnosis.',
    json:`{
  "resourceType": "Encounter",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/encounter/5277013",
      "value": "IGD-2024-0001"
    }
  ],
  "status": "arrived",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "EMER",
    "display": "emergency"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "participant": [
    {
      "type": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "ATND",
              "display": "attender"
            }
          ]
        }
      ],
      "individual": {
        "reference": "Practitioner/N10000001",
        "display": "dr. Budi Santoso, Sp.PD"
      }
    }
  ],
  "period": {
    "start": "2024-01-15T08:00:00+07:00"
  },
  "location": [
    {
      "location": {
        "reference": "Location/LOC-IGD-01",
        "display": "Instalasi Gawat Darurat"
      },
      "status": "active"
    }
  ],
  "serviceProvider": {
    "reference": "Organization/org-rs-001"
  },
  "statusHistory": [
    {
      "status": "arrived",
      "period": {
        "start": "2024-01-15T08:00:00+07:00"
      }
    }
  ]
}`
  },
  {
    id:'Condition', priority:'wajib', label:'Wajib Des 2026',
    sub:'Diagnosa pasien (ICD-10)',
    method:'POST', endpoint:'POST /Condition',
    trigger:'diagnosa.created',
    simrs:['diagnosa'],
    mapping:[
      {fhir:'clinicalStatus.coding[0].code',simrs:'diagnosa.status',desc:'active / resolved / inactive'},
      {fhir:'category[0].coding[0].code',simrs:'diagnosa.jenis',desc:'encounter-diagnosis atau problem-list-item'},
      {fhir:'code.coding[0].system',simrs:'—',desc:'http://hl7.org/fhir/sid/icd-10 (selalu ini)'},
      {fhir:'code.coding[0].code',simrs:'diagnosa.kode_icd',desc:'Kode ICD-10, contoh: J06.9'},
      {fhir:'code.coding[0].display',simrs:'diagnosa.nama_diagnosa',desc:'Nama penyakit sesuai ICD-10'},
      {fhir:'subject.reference',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter.reference',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id} — wajib ada dulu'},
      {fhir:'onsetDateTime',simrs:'diagnosa.created_at',desc:'Kapan diagnosa ditegakkan'},
      {fhir:'recordedDate',simrs:'diagnosa.created_at',desc:'Kapan dicatat di sistem'},
    ],
    note:'1 kunjungan bisa punya banyak Condition — kirim 1 POST per baris diagnosa. Untuk diagnosa utama vs sekunder, update field diagnosis di Encounter setelah semua Condition terkirim.',
    json:`{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "verificationStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
        "code": "confirmed",
        "display": "Confirmed"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/condition-category",
          "code": "encounter-diagnosis",
          "display": "Encounter Diagnosis"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/sid/icd-10",
        "code": "J06.9",
        "display": "Acute upper respiratory infection, unspecified"
      }
    ],
    "text": "ISPA"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "onsetDateTime": "2024-01-15T08:30:00+07:00",
  "recordedDate": "2024-01-15T08:30:00+07:00",
  "recorder": {
    "reference": "Practitioner/N10000001"
  }
}`
  },
  {
    id:'Observation', priority:'penting', label:'Penting',
    sub:'Vital sign — 1 baris vitalsign = banyak Observation',
    method:'POST', endpoint:'POST /Observation (per parameter)',
    trigger:'vitalsign.created',
    simrs:['vitalsign'],
    mapping:[
      {fhir:'status',simrs:'—',desc:'Selalu "final" untuk vital sign yang sudah diinput'},
      {fhir:'category[0].coding[0].code',simrs:'—',desc:'vital-signs (selalu ini untuk vital sign)'},
      {fhir:'code.coding[0].code',simrs:'observation_code di satusehat_log',desc:'Kode LOINC per parameter (lihat tabel bawah)'},
      {fhir:'subject.reference',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter.reference',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'effectiveDateTime',simrs:'vitalsign.created_at',desc:'Waktu pengukuran'},
      {fhir:'valueQuantity.value',simrs:'vitalsign.suhu / nadi / dll',desc:'Nilai numerik'},
      {fhir:'valueQuantity.unit',simrs:'—',desc:'Satuan sesuai parameter: Cel, /min, %, mm[Hg]'},
      {fhir:'component',simrs:'vitalsign.tekanan_darah',desc:'KHUSUS tekanan darah: systolic + diastolic terpisah di component'},
    ],
    note:'PENTING: Tekanan darah TIDAK boleh pakai valueQuantity biasa. Wajib pakai component dengan dua nilai terpisah (systolic kode 8480-6, diastolic kode 8462-4). Contoh JSON di bawah adalah untuk suhu dan tekanan darah.',
    json:`// === Contoh 1: Suhu tubuh (LOINC 8310-5) ===
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "Vital Signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8310-5",
        "display": "Body temperature"
      }
    ],
    "text": "Suhu Tubuh"
  },
  "subject": { "reference": "Patient/N10000002" },
  "encounter": { "reference": "Encounter/enc-igd-999" },
  "effectiveDateTime": "2024-01-15T08:30:00+07:00",
  "valueQuantity": {
    "value": 38.5,
    "unit": "Cel",
    "system": "http://unitsofmeasure.org",
    "code": "Cel"
  }
}

// === Contoh 2: Tekanan darah (WAJIB pakai component) ===
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "55284-5",
        "display": "Blood pressure systolic and diastolic"
      }
    ],
    "text": "Tekanan Darah"
  },
  "subject": { "reference": "Patient/N10000002" },
  "encounter": { "reference": "Encounter/enc-igd-999" },
  "effectiveDateTime": "2024-01-15T08:30:00+07:00",
  "component": [
    {
      "code": {
        "coding": [{ "system": "http://loinc.org", "code": "8480-6", "display": "Systolic blood pressure" }]
      },
      "valueQuantity": { "value": 130, "unit": "mm[Hg]", "system": "http://unitsofmeasure.org", "code": "mm[Hg]" }
    },
    {
      "code": {
        "coding": [{ "system": "http://loinc.org", "code": "8462-4", "display": "Diastolic blood pressure" }]
      },
      "valueQuantity": { "value": 85, "unit": "mm[Hg]", "system": "http://unitsofmeasure.org", "code": "mm[Hg]" }
    }
  ]
}`
  },
  {
    id:'Procedure', priority:'penting', label:'Penting',
    sub:'Tindakan medis (ICD-9-CM)',
    method:'POST', endpoint:'POST /Procedure',
    trigger:'procedure.created',
    simrs:['procedure','tindakan'],
    mapping:[
      {fhir:'status',simrs:'procedure.status',desc:'preparation / in-progress / completed'},
      {fhir:'code.coding[0].system',simrs:'—',desc:'http://hl7.org/fhir/sid/icd-9-cm untuk ICD-9-CM'},
      {fhir:'code.coding[0].code',simrs:'procedure.kode_icd9',desc:'Kode tindakan ICD-9-CM'},
      {fhir:'subject.reference',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter.reference',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'performer[0].actor',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} yang melakukan tindakan'},
      {fhir:'performedDateTime',simrs:'procedure.tgl_tindakan',desc:'Waktu tindakan dilakukan'},
      {fhir:'reasonReference',simrs:'diagnosa.cond_ihs_id',desc:'Condition/{ihs_id} alasan tindakan'},
    ],
    note:'1 kunjungan bisa punya banyak Procedure. Kirim setelah Encounter dan Condition berhasil terkirim.',
    json:`{
  "resourceType": "Procedure",
  "status": "completed",
  "category": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "387713003",
        "display": "Surgical procedure"
      }
    ]
  },
  "code": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/sid/icd-9-cm",
        "code": "89.7",
        "display": "Application of wound dressing"
      }
    ],
    "text": "Perawatan Luka"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "performedDateTime": "2024-01-15T09:00:00+07:00",
  "performer": [
    {
      "actor": {
        "reference": "Practitioner/N10000001",
        "display": "dr. Budi Santoso, Sp.PD"
      }
    }
  ],
  "reasonReference": [
    {
      "reference": "Condition/cond-001"
    }
  ],
  "note": [
    {
      "text": "Perawatan luka pada kaki kanan, ganti balutan 2x sehari"
    }
  ]
}`
  },
  {
    id:'Medication', priority:'penting', label:'Penting',
    sub:'Data obat KFA — di dalam MedicationRequest.contained',
    method:'TIDAK POST terpisah', endpoint:'MedicationRequest.contained.medication (1 payload)',
    trigger:'Setup master obat atau saat tulis resep obat non-formularium',
    simrs:['master_obat','obat'],
    mapping:[
      {fhir:'identifier[0].value',simrs:'obat.kode_obat',desc:'Kode obat SIMRS atau kode KFA'},
      {fhir:'code.coding[0].code',simrs:'obat.kode_formularium',desc:'Kode KFA jika ada di formularium nasional'},
      {fhir:'code.text',simrs:'obat.nama_obat',desc:'Nama obat lengkap'},
      {fhir:'status',simrs:'obat.status',desc:'active / inactive'},
      {fhir:'form.coding[0].code',simrs:'obat.bentuk_sediaan',desc:'TAB=tablet, CAP=kapsul, INJ=injeksi, SYR=sirup'},
      {fhir:'ingredient[0].itemCodeableConcept',simrs:'obat.zat_aktif',desc:'Kandungan zat aktif'},
      {fhir:'ingredient[0].strength',simrs:'obat.kekuatan',desc:'Kekuatan sediaan, misal 500mg'},
    ],
    note:'PENTING: Medication TIDAK boleh dikirim sebagai resource terpisah. Contoh di bawah adalah struktur Medication di dalam MedicationRequest.contained / MedicationDispense.contained. Medication.code wajib untuk obat non-racikan (kode KFA dari dto.kemkes.go.id/kfa-browser).',
    json:`// Struktur Medication di dalam contained (BUKAN POST terpisah)
{
  "resourceType": "Medication",
  "id": "med",
  "code": {
    "coding": [
      {
        "system": "http://sys-ids.kemkes.go.id/kfa",
        "code": "93001019",
        "display": "Amoxicillin 500 mg Kaplet"
      }
    ],
    "text": "Amoxicillin 500 mg Kaplet"
  },
  "status": "active",
  "form": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
        "code": "TAB",
        "display": "Tablet"
      }
    ]
  }
}`
  },
  {
    id:'MedicationRequest', priority:'wajib', label:'Wajib Des 2026',
    sub:'Resep elektronik (e-resep)',
    method:'POST per item obat', endpoint:'POST /MedicationRequest (+ Medication di contained)',
    trigger:'resep.created (per item obat)',
    simrs:['resep','order_obat'],
    mapping:[
      {fhir:'status',simrs:'resep.status',desc:'active=aktif, completed=selesai, cancelled=batal'},
      {fhir:'intent',simrs:'—',desc:'Selalu "order"'},
      {fhir:'contained',simrs:'—',desc:'Medication (data obat KFA) — disertakan dalam payload yang sama'},{fhir:'medicationReference',simrs:'—',desc:'Reference ke #med di contained (bukan Medication/{id} terpisah)'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'requester',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} dokter penulis resep'},
      {fhir:'dosageInstruction[0].text',simrs:'resep.aturan_pakai',desc:'Teks aturan pakai: 3x1 sesudah makan'},
      {fhir:'dosageInstruction[0].doseAndRate',simrs:'resep.dosis',desc:'Dosis per pemberian'},
      {fhir:'dispenseRequest.quantity',simrs:'resep.jumlah',desc:'Total jumlah yang diminta'},
    ],
    note:'1 resep dengan 3 obat = 3 MedicationRequest (masing-masing membawa Medication di contained). Jangan kirim Medication terpisah. Kirim setelah Encounter berhasil.',
    json:`{
  "resourceType": "MedicationRequest",
  "contained": [
    {
      "resourceType": "Medication",
      "id": "med",
      "code": {
        "coding": [
          {
            "system": "http://sys-ids.kemkes.go.id/kfa",
            "code": "93001019",
            "display": "Amoxicillin 500 mg Kaplet"
          }
        ],
        "text": "Amoxicillin 500 mg Kaplet"
      },
      "status": "active",
      "form": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
            "code": "TAB",
            "display": "Tablet"
          }
        ]
      }
    }
  ],
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/prescription/5277013",
      "value": "RES-2024-0001-01"
    }
  ],
  "status": "active",
  "intent": "order",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
          "code": "outpatient",
          "display": "Outpatient"
        }
      ]
    }
  ],
  "medicationReference": {
    "reference": "#med",
    "display": "Amoxicillin 500 mg Kaplet"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "authoredOn": "2024-01-15T10:00:00+07:00",
  "requester": {
    "reference": "Practitioner/N10000001",
    "display": "dr. Budi Santoso, Sp.PD"
  },
  "dosageInstruction": [
    {
      "text": "3 kali sehari 1 kaplet sesudah makan",
      "timing": {
        "repeat": {
          "frequency": 3,
          "period": 1,
          "periodUnit": "d"
        }
      },
      "route": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
            "code": "PO",
            "display": "Oral"
          }
        ]
      },
      "doseAndRate": [
        {
          "doseQuantity": {
            "value": 1,
            "unit": "Kaplet",
            "system": "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
            "code": "CAP"
          }
        }
      ]
    }
  ],
  "dispenseRequest": {
    "quantity": {
      "value": 15,
      "unit": "Kaplet"
    },
    "expectedSupplyDuration": {
      "value": 5,
      "unit": "days",
      "system": "http://unitsofmeasure.org",
      "code": "d"
    }
  }
}`
  },
  {
    id:'MedicationDispense', priority:'wajib', label:'Wajib Des 2026',
    sub:'Penyerahan obat dari farmasi',
    method:'POST saat obat diserahkan', endpoint:'POST /MedicationDispense (+ Medication di contained)',
    trigger:'penyerahan_obat.created (farmasi serahkan obat)',
    simrs:['penyerahan_obat','farmasi'],
    mapping:[
      {fhir:'status',simrs:'penyerahan.status',desc:'completed = sudah diserahkan'},
      {fhir:'contained',simrs:'—',desc:'Medication (kode KFA — turunan dari MedicationRequest)'},{fhir:'medicationReference',simrs:'—',desc:'Reference ke #med di contained'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'context',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'authorizingPrescription',simrs:'resep.mr_ihs_id',desc:'MedicationRequest/{ihs_id} — resep yang diotorisasi'},
      {fhir:'quantity',simrs:'penyerahan.jumlah_diserahkan',desc:'Jumlah obat yang diserahkan'},
      {fhir:'whenHandedOver',simrs:'penyerahan.tgl_serah',desc:'Waktu obat diserahkan ke pasien'},
      {fhir:'performer[0].actor',simrs:'apoteker.ihs_id',desc:'Practitioner/{ihs_id} apoteker'},
    ],
    note:'authorizingPrescription WAJIB merujuk MedicationRequest ID. Data obat di MedicationDispense.contained (bukan resource terpisah). Kirim setelah obat benar-benar diserahkan ke pasien.',
    json:`{
  "resourceType": "MedicationDispense",
  "contained": [
    {
      "resourceType": "Medication",
      "id": "med",
      "code": {
        "coding": [
          {
            "system": "http://sys-ids.kemkes.go.id/kfa",
            "code": "93001019",
            "display": "Amoxicillin 500 mg Kaplet"
          }
        ]
      },
      "status": "active"
    }
  ],
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/dispensing/5277013",
      "value": "DISP-2024-0001"
    }
  ],
  "status": "completed",
  "category": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category",
        "code": "outpatient",
        "display": "Outpatient"
      }
    ]
  },
  "medicationReference": {
    "reference": "#med",
    "display": "Amoxicillin 500 mg Kaplet"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "context": {
    "reference": "Encounter/enc-igd-999"
  },
  "authorizingPrescription": [
    {
      "reference": "MedicationRequest/mr-001"
    }
  ],
  "quantity": {
    "value": 15,
    "system": "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
    "code": "CAP"
  },
  "daysSupply": {
    "value": 5,
    "unit": "Day",
    "system": "http://unitsofmeasure.org",
    "code": "d"
  },
  "whenPrepared": "2024-01-15T10:30:00+07:00",
  "whenHandedOver": "2024-01-15T10:45:00+07:00",
  "performer": [
    {
      "actor": {
        "reference": "Practitioner/N10000010",
        "display": "Apt. Siti Rahayu, S.Farm"
      }
    }
  ],
  "dosageInstruction": [
    {
      "text": "3 kali sehari 1 kaplet sesudah makan"
    }
  ]
}`
  },
  {
    id:'ServiceRequest', priority:'penting', label:'Penting',
    sub:'Order pemeriksaan lab / radiologi',
    method:'POST', endpoint:'POST /ServiceRequest',
    trigger:'order_lab.created | order_radiologi.created',
    simrs:['order_lab','order_radiologi'],
    mapping:[
      {fhir:'status',simrs:'order.status',desc:'active=aktif, completed=selesai, revoked=dibatalkan'},
      {fhir:'intent',simrs:'—',desc:'Selalu "order"'},
      {fhir:'category[0].coding[0].code',simrs:'order.jenis',desc:'108252007=lab, 363679005=imaging (SNOMED)'},
      {fhir:'code.coding[0].code',simrs:'order.kode_pemeriksaan',desc:'Kode LOINC atau kode lokal pemeriksaan'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'requester',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} dokter pengirim'},
      {fhir:'performer',simrs:'lab.org_ihs_id',desc:'Organization laboratorium tujuan'},
      {fhir:'reasonReference',simrs:'diagnosa.cond_ihs_id',desc:'Condition/{ihs_id} indikasi pemeriksaan'},
    ],
    note:'ServiceRequest adalah "surat pengantar" ke lab. Kirim sebelum Specimen dan DiagnosticReport. sr_ihs_id diperlukan di kedua resource tersebut.',
    json:`{
  "resourceType": "ServiceRequest",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/servicerequest/5277013",
      "value": "LAB-2024-0001"
    }
  ],
  "status": "active",
  "intent": "order",
  "category": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "108252007",
          "display": "Laboratory procedure"
        }
      ]
    }
  ],
  "priority": "routine",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "58410-2",
        "display": "CBC panel - Blood by Automated count"
      }
    ],
    "text": "Darah Lengkap"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "occurrenceDateTime": "2024-01-15T09:00:00+07:00",
  "authoredOn": "2024-01-15T08:45:00+07:00",
  "requester": {
    "reference": "Practitioner/N10000001",
    "display": "dr. Budi Santoso, Sp.PD"
  },
  "performer": [
    {
      "reference": "Organization/org-lab-001",
      "display": "Laboratorium RSUD Pati"
    }
  ],
  "reasonReference": [
    {
      "reference": "Condition/cond-001",
      "display": "ISPA"
    }
  ]
}`
  },
  {
    id:'Specimen', priority:'wajib', label:'Wajib Des 2026',
    sub:'Spesimen yang diambil dari pasien',
    method:'POST', endpoint:'POST /Specimen',
    trigger:'spesimen_lab.created',
    simrs:['spesimen_lab'],
    mapping:[
      {fhir:'identifier[0].value',simrs:'spesimen.no_spesimen',desc:'Nomor label spesimen SIMRS'},
      {fhir:'type.coding[0].code',simrs:'spesimen.jenis',desc:'Kode SNOMED: 119297000=darah, 122575003=urin'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'request[0]',simrs:'order_lab.sr_ihs_id',desc:'ServiceRequest/{ihs_id}'},
      {fhir:'collection.collectedDateTime',simrs:'spesimen.tgl_ambil',desc:'Waktu pengambilan spesimen'},
      {fhir:'collection.collector',simrs:'perawat.ihs_id',desc:'Practitioner/{ihs_id} petugas pengambil'},
      {fhir:'collection.method',simrs:'spesimen.metode_ambil',desc:'Cara pengambilan: venipuncture, dll'},
      {fhir:'container[0].type',simrs:'spesimen.wadah',desc:'Jenis tabung/wadah spesimen'},
    ],
    note:'Kirim setelah ServiceRequest. Specimen ihs_id diperlukan di DiagnosticReport sebagai bukti spesimen yang digunakan untuk pemeriksaan.',
    json:`{
  "resourceType": "Specimen",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/specimen/5277013",
      "value": "SPEC-2024-0001"
    }
  ],
  "status": "available",
  "type": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "119297000",
        "display": "Blood specimen"
      }
    ],
    "text": "Darah Vena"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "request": [
    {
      "reference": "ServiceRequest/sr-lab-001"
    }
  ],
  "collection": {
    "collector": {
      "reference": "Practitioner/N10000005",
      "display": "Ns. Dewi Sartika"
    },
    "collectedDateTime": "2024-01-15T09:15:00+07:00",
    "method": {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "28520004",
          "display": "Venipuncture for blood test"
        }
      ]
    },
    "bodySite": {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "7311008",
          "display": "Anterior surface of arm"
        }
      ]
    }
  },
  "container": [
    {
      "type": {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "702280004",
            "display": "EDTA blood collection tube"
          }
        ]
      }
    }
  ]
}`
  },
  {
    id:'DiagnosticReport', priority:'penting', label:'Penting',
    sub:'Hasil pemeriksaan lab / radiologi',
    method:'POST', endpoint:'POST /DiagnosticReport',
    trigger:'hasil_lab.created | hasil_radiologi.created',
    simrs:['hasil_lab','hasil_radiologi'],
    mapping:[
      {fhir:'status',simrs:'hasil.status',desc:'final=hasil final, preliminary=hasil sementara'},
      {fhir:'category[0].coding[0].code',simrs:'hasil.jenis',desc:'LAB=laboratorium, RAD=radiologi'},
      {fhir:'code.coding[0].code',simrs:'hasil.kode_pemeriksaan',desc:'Kode LOINC jenis pemeriksaan'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'basedOn[0]',simrs:'order_lab.sr_ihs_id',desc:'ServiceRequest/{ihs_id}'},
      {fhir:'specimen[0]',simrs:'spesimen.spec_ihs_id',desc:'Specimen/{ihs_id}'},
      {fhir:'result',simrs:'hasil_lab.obs_ihs_ids',desc:'Array Observation/{ihs_id} hasil per parameter'},
      {fhir:'conclusion',simrs:'hasil.kesimpulan',desc:'Teks kesimpulan dari analis/radiolog'},
      {fhir:'effectiveDateTime',simrs:'hasil.tgl_hasil',desc:'Waktu hasil keluar'},
    ],
    note:'DiagnosticReport adalah "wrapper" dari semua Observation hasil lab. Kirim setelah semua Observation hasil lab berhasil dikirim dan punya ihs_id.',
    json:`{
  "resourceType": "DiagnosticReport",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/diagnosticreport/5277013",
      "value": "DR-2024-0001"
    }
  ],
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
          "code": "LAB",
          "display": "Laboratory"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "58410-2",
        "display": "CBC panel - Blood by Automated count"
      }
    ],
    "text": "Darah Lengkap"
  },
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "effectiveDateTime": "2024-01-15T11:00:00+07:00",
  "issued": "2024-01-15T11:30:00+07:00",
  "performer": [
    {
      "reference": "Practitioner/N10000008",
      "display": "dr. Citra Dewi, Sp.PK"
    }
  ],
  "basedOn": [
    { "reference": "ServiceRequest/sr-lab-001" }
  ],
  "specimen": [
    { "reference": "Specimen/spec-001" }
  ],
  "result": [
    { "reference": "Observation/obs-hb-001", "display": "Hemoglobin" },
    { "reference": "Observation/obs-wbc-001", "display": "Leukosit" },
    { "reference": "Observation/obs-plt-001", "display": "Trombosit" }
  ],
  "conclusion": "Hasil darah lengkap dalam batas normal. Leukosit sedikit meningkat, kemungkinan infeksi ringan.",
  "conclusionCode": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "281309003",
          "display": "Leukocytosis"
        }
      ]
    }
  ]
}`
  },
  {
    id:'Composition', priority:'penting', label:'Penting',
    sub:'Resume / ringkasan rekam medis',
    method:'POST', endpoint:'POST /Composition',
    trigger:'regpas.status = pulang (setelah semua resource terkirim)',
    simrs:['resume_medis','catatan_dokter'],
    mapping:[
      {fhir:'status',simrs:'resume.status',desc:'final=selesai, preliminary=draft'},
      {fhir:'type.coding[0].code',simrs:'—',desc:'34133-9 (Summary of episode) atau 11488-4 (Consult note)'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'author[0]',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} dokter penulis'},
      {fhir:'title',simrs:'—',desc:'Ringkasan Pelayanan Pasien Rawat Jalan / Rawat Inap'},
      {fhir:'section[0].title',simrs:'—',desc:'Anamnesis'},
      {fhir:'section[0].text',simrs:'catatan.anamnesis',desc:'Keluhan dan riwayat penyakit'},
      {fhir:'section[1].title',simrs:'—',desc:'Pemeriksaan Fisik'},
      {fhir:'section[2].title',simrs:'—',desc:'Diagnosa'},
      {fhir:'section[3].title',simrs:'—',desc:'Terapi / Tindakan'},
    ],
    note:'Kirim saat pasien pulang setelah semua resource lain (Condition, Observation, Procedure, dll) sudah terkirim. Ini "penutup" rekam medis kunjungan tersebut.',
    json:`{
  "resourceType": "Composition",
  "identifier": {
    "system": "http://sys-ids.kemkes.go.id/composition/5277013",
    "value": "RESUME-2024-0001"
  },
  "status": "final",
  "type": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "34133-9",
        "display": "Summary of episode note"
      }
    ]
  },
  "category": [
    {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "LP173421-1",
          "display": "Report"
        }
      ]
    }
  ],
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "date": "2024-01-15T12:00:00+07:00",
  "author": [
    {
      "reference": "Practitioner/N10000001",
      "display": "dr. Budi Santoso, Sp.PD"
    }
  ],
  "title": "Ringkasan Pelayanan Pasien Gawat Darurat",
  "section": [
    {
      "title": "Anamnesis",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "10164-2" }] },
      "text": {
        "status": "additional",
        "div": "<div>Pasien datang dengan keluhan demam 3 hari, batuk pilek, nyeri tenggorokan.</div>"
      }
    },
    {
      "title": "Pemeriksaan Fisik",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "29545-1" }] },
      "text": {
        "status": "additional",
        "div": "<div>TD: 130/85 mmHg, N: 88x/mnt, S: 38.5C, SpO2: 97%. Faring hiperemis.</div>"
      },
      "entry": [
        { "reference": "Observation/obs-suhu-001" },
        { "reference": "Observation/obs-td-001" }
      ]
    },
    {
      "title": "Diagnosa",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "29548-5" }] },
      "entry": [
        { "reference": "Condition/cond-001" }
      ]
    },
    {
      "title": "Terapi",
      "code": { "coding": [{ "system": "http://loinc.org", "code": "18776-5" }] },
      "entry": [
        { "reference": "MedicationRequest/mr-001" },
        { "reference": "Procedure/proc-001" }
      ]
    }
  ]
}`
  },
  {
    id:'AllergyIntolerance', priority:'penting', label:'Penting',
    sub:'Riwayat alergi pasien',
    method:'POST', endpoint:'POST /AllergyIntolerance',
    trigger:'alergi.created',
    simrs:['alergi'],
    mapping:[
      {fhir:'clinicalStatus.coding[0].code',simrs:'alergi.status',desc:'active = alergi aktif, resolved = sudah teratasi'},
      {fhir:'verificationStatus',simrs:'alergi.verifikasi',desc:'confirmed=terkonfirmasi, unconfirmed=belum pasti'},
      {fhir:'type',simrs:'alergi.tipe',desc:'allergy=alergi imunologis, intolerance=tidak toleran'},
      {fhir:'category[0]',simrs:'alergi.kategori',desc:'food=makanan, medication=obat, environment=lingkungan'},
      {fhir:'criticality',simrs:'alergi.keparahan',desc:'low=ringan, high=berat, unable-to-assess=tidak bisa dinilai'},
      {fhir:'code.coding[0].code',simrs:'alergi.kode_alergen',desc:'Kode SNOMED atau nama bebas di code.text'},
      {fhir:'patient',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'reaction[0].manifestation',simrs:'alergi.manifestasi',desc:'Gejala yang muncul (SNOMED)'},
      {fhir:'reaction[0].severity',simrs:'alergi.severity',desc:'mild / moderate / severe'},
    ],
    note:'Penting untuk keselamatan pasien terutama alergi obat. Kirim saat data alergi pertama kali dicatat. Tidak terikat ke Encounter tertentu.',
    json:`{
  "resourceType": "AllergyIntolerance",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/allergy/5277013",
      "value": "ALG-2024-0001"
    }
  ],
  "clinicalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "verificationStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
        "code": "confirmed",
        "display": "Confirmed"
      }
    ]
  },
  "type": "allergy",
  "category": ["medication"],
  "criticality": "high",
  "code": {
    "coding": [
      {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "code": "7980",
        "display": "Penicillin"
      }
    ],
    "text": "Penisilin"
  },
  "patient": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "recordedDate": "2024-01-15T08:20:00+07:00",
  "recorder": {
    "reference": "Practitioner/N10000001"
  },
  "reaction": [
    {
      "substance": {
        "coding": [
          {
            "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
            "code": "7980",
            "display": "Penicillin"
          }
        ]
      },
      "manifestation": [
        {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "247472004",
              "display": "Urticaria"
            }
          ],
          "text": "Gatal dan bentol di seluruh tubuh"
        }
      ],
      "severity": "severe",
      "onset": "2020-03-10T14:00:00+07:00"
    }
  ]
}`
  },
  {
    id:'QuestionnaireResponse', priority:'penting', label:'Penting',
    sub:'Isian skrining & assessment pasien',
    method:'POST', endpoint:'POST /QuestionnaireResponse',
    trigger:'skrining.completed | assessment.completed',
    simrs:['skrining','assessment','anamnesis'],
    mapping:[
      {fhir:'questionnaire',simrs:'skrining.kode_form',desc:'URL referensi form skrining dari SatuSehat'},
      {fhir:'status',simrs:'skrining.status',desc:'completed=selesai, in-progress=sedang diisi'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'authored',simrs:'skrining.tgl_isi',desc:'Waktu form diisi'},
      {fhir:'author',simrs:'perawat.ihs_id',desc:'Practitioner/{ihs_id} yang mengisi'},
      {fhir:'item[].linkId',simrs:'skrining.kode_pertanyaan',desc:'ID pertanyaan sesuai kode form'},
      {fhir:'item[].answer[].valueString',simrs:'skrining.jawaban',desc:'Jawaban teks atau valueBoolean, valueInteger, dll'},
    ],
    note:'Dipakai untuk skrining seperti PHQ-9 (depresi), AUDIT (alkohol), asesmen risiko jatuh, asesmen gizi, dll. linkId harus sesuai dengan form yang sudah terdaftar di SatuSehat.',
    json:`{
  "resourceType": "QuestionnaireResponse",
  "identifier": {
    "system": "http://sys-ids.kemkes.go.id/qr/5277013",
    "value": "QR-ASESMEN-2024-0001"
  },
  "questionnaire": "https://fhir.kemkes.go.id/Questionnaire/asesmen-awal-rawat-inap",
  "status": "completed",
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "authored": "2024-01-15T08:15:00+07:00",
  "author": {
    "reference": "Practitioner/N10000005",
    "display": "Ns. Dewi Sartika"
  },
  "item": [
    {
      "linkId": "1",
      "text": "Keluhan utama",
      "answer": [
        { "valueString": "Demam tinggi 3 hari disertai batuk dan pilek" }
      ]
    },
    {
      "linkId": "2",
      "text": "Skala nyeri (0-10)",
      "answer": [
        { "valueInteger": 4 }
      ]
    },
    {
      "linkId": "3",
      "text": "Riwayat alergi obat",
      "answer": [
        { "valueBoolean": true }
      ]
    },
    {
      "linkId": "3.1",
      "text": "Jika ya, sebutkan",
      "answer": [
        { "valueString": "Penisilin — gatal dan bentol" }
      ]
    },
    {
      "linkId": "4",
      "text": "Risiko jatuh (Morse Fall Scale)",
      "answer": [
        { "valueInteger": 25 }
      ]
    }
  ]
}`
  },
  {
    id:'ClinicalImpression', priority:'penting', label:'Penting',
    sub:'Penilaian klinis / catatan SOAP dokter',
    method:'POST', endpoint:'POST /ClinicalImpression',
    trigger:'catatan_soap.created | penilaian_klinis.created',
    simrs:['catatan_klinis','soap','catatan_dokter'],
    mapping:[
      {fhir:'status',simrs:'catatan.status',desc:'in-progress=sedang, completed=selesai'},
      {fhir:'description',simrs:'catatan.subjektif',desc:'Subjektif: keluhan pasien'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'assessor',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} dokter penilai'},
      {fhir:'effectiveDateTime',simrs:'catatan.tgl_catatan',desc:'Waktu penilaian dilakukan'},
      {fhir:'summary',simrs:'catatan.assessment',desc:'Assessment: penilaian klinis dokter'},
      {fhir:'finding[0].itemReference',simrs:'diagnosa.cond_ihs_id',desc:'Condition yang mendukung penilaian'},
      {fhir:'note[0].text',simrs:'catatan.plan',desc:'Plan: rencana tindak lanjut'},
    ],
    note:'Cocok untuk mendokumentasikan catatan SOAP. Subjektif di description, Objektif di finding, Assessment di summary, Plan di note.',
    json:`{
  "resourceType": "ClinicalImpression",
  "identifier": [
    {
      "system": "http://sys-ids.kemkes.go.id/clinicalimpression/5277013",
      "value": "CI-2024-0001"
    }
  ],
  "status": "completed",
  "description": "Pasien laki-laki 32 tahun datang dengan keluhan demam 3 hari, batuk berdahak, pilek, dan nyeri tenggorokan. Tidak ada sesak napas.",
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "effectiveDateTime": "2024-01-15T08:30:00+07:00",
  "assessor": {
    "reference": "Practitioner/N10000001",
    "display": "dr. Budi Santoso, Sp.PD"
  },
  "summary": "Pasien mengalami infeksi saluran pernafasan atas akut (ISPA). Kondisi stabil, tidak ada tanda-tanda komplikasi. Disarankan rawat jalan dengan medikamentosa.",
  "finding": [
    {
      "itemReference": {
        "reference": "Condition/cond-001",
        "display": "ISPA"
      }
    }
  ],
  "investigation": [
    {
      "code": {
        "text": "Pemeriksaan Fisik"
      },
      "item": [
        { "reference": "Observation/obs-suhu-001" },
        { "reference": "Observation/obs-td-001" }
      ]
    }
  ],
  "note": [
    {
      "text": "Plan: Amoxicillin 3x500mg 5 hari, Paracetamol 3x500mg jika demam, perbanyak minum air putih, istirahat cukup. Kontrol 5 hari jika tidak ada perbaikan."
    }
  ]
}`
  },
  {
    id:'ImagingStudy', priority:'wajib', label:'Wajib Des 2026',
    sub:'Data studi radiologi (DICOM)',
    method:'POST', endpoint:'POST /ImagingStudy',
    trigger:'hasil_radiologi.created (jika ada PACS)',
    simrs:['pacs','hasil_radiologi'],
    mapping:[
      {fhir:'identifier[0].value',simrs:'radiologi.study_uid',desc:'DICOM Study Instance UID'},
      {fhir:'status',simrs:'radiologi.status',desc:'available=tersedia, cancelled=dibatalkan'},
      {fhir:'subject',simrs:'patient.ihs_id',desc:'Patient/{ihs_id}'},
      {fhir:'encounter',simrs:'regpas.enc_ihs_id',desc:'Encounter/{ihs_id}'},
      {fhir:'started',simrs:'radiologi.tgl_studi',desc:'Waktu studi dimulai'},
      {fhir:'basedOn[0]',simrs:'order_radiologi.sr_ihs_id',desc:'ServiceRequest/{ihs_id}'},
      {fhir:'referrer',simrs:'dokter.ihs_id',desc:'Practitioner/{ihs_id} dokter pengirim'},
      {fhir:'series[0].uid',simrs:'radiologi.series_uid',desc:'DICOM Series Instance UID'},
      {fhir:'series[0].modality.code',simrs:'radiologi.modalitas',desc:'CR=Xray, CT=CT Scan, MR=MRI, US=USG'},
      {fhir:'series[0].numberOfInstances',simrs:'radiologi.jumlah_gambar',desc:'Jumlah gambar dalam seri'},
    ],
    note:'Hanya diperlukan jika RS memiliki PACS dan ingin mengirim metadata studi DICOM. Yang dikirim adalah METADATA, bukan file gambar DICOM-nya.',
    json:`{
  "resourceType": "ImagingStudy",
  "identifier": [
    {
      "system": "urn:dicom:uid",
      "value": "urn:oid:1.2.840.113619.2.5.1762583153.215519.978957063.78"
    }
  ],
  "status": "available",
  "modality": [
    {
      "system": "http://dicom.nema.org/resources/ontology/DCM",
      "code": "CR",
      "display": "Computed Radiography"
    }
  ],
  "subject": {
    "reference": "Patient/N10000002",
    "display": "Ahmad Fauzi"
  },
  "encounter": {
    "reference": "Encounter/enc-igd-999"
  },
  "started": "2024-01-15T09:30:00+07:00",
  "basedOn": [
    { "reference": "ServiceRequest/sr-rad-001" }
  ],
  "referrer": {
    "reference": "Practitioner/N10000001",
    "display": "dr. Budi Santoso, Sp.PD"
  },
  "numberOfSeries": 1,
  "numberOfInstances": 2,
  "description": "Thorax PA",
  "series": [
    {
      "uid": "1.2.840.113619.2.5.1762583153.215519.978957063.79",
      "number": 1,
      "modality": {
        "system": "http://dicom.nema.org/resources/ontology/DCM",
        "code": "CR"
      },
      "description": "Thorax PA view",
      "numberOfInstances": 2,
      "bodySite": {
        "system": "http://snomed.info/sct",
        "code": "51185008",
        "display": "Thoracic structure"
      },
      "instance": [
        {
          "uid": "1.2.840.113619.2.5.1762583153.215519.978957063.80",
          "sopClass": {
            "system": "urn:ietf:rfc:3986",
            "code": "urn:oid:1.2.840.10008.5.1.4.1.1.1"
          },
          "number": 1,
          "title": "PA View"
        }
      ]
    }
  ]
}`
  },
];

export const allResources: ResourceItem[] = raw.map((r) => ({ ...r, icon: {"Organization":"fa-hospital","Location":"fa-location-dot","Practitioner":"fa-user-doctor","Patient":"fa-user-injured","Encounter":"fa-hospital-user","Condition":"fa-stethoscope","Observation":"fa-heart-pulse","Procedure":"fa-syringe","Medication":"fa-capsules","MedicationRequest":"fa-prescription","MedicationDispense":"fa-prescription-bottle-medical","ServiceRequest":"fa-clipboard-check","Specimen":"fa-vial","DiagnosticReport":"fa-file-waveform","Composition":"fa-file-medical","AllergyIntolerance":"fa-triangle-exclamation","QuestionnaireResponse":"fa-clipboard-list","ClinicalImpression":"fa-notes-medical","ImagingStudy":"fa-x-ray"}[r.id] || 'fa-cube' }));

export const groups: Group[] = [
  { group: 'Prerequisites — setup awal (dilakukan 1x)', groupIcon: 'fa-gear', color: 'setup', items: allResources.filter(r => r.priority === 'setup') },
  { group: 'Wajib implementasi akhir 2026 — 6 modul interoperabilitas', groupIcon: 'fa-heart-pulse', color: 'wajib', items: allResources.filter(r => r.priority === 'wajib') },
  { group: 'Interoperabilitas — penting untuk kelengkapan data', groupIcon: 'fa-pills', color: 'penting', items: allResources.filter(r => r.priority === 'penting') },
];

export const tabs: { key: 'all' | Priority; label: string; icon: string }[] = [
  { key: 'all', label: 'Semua', icon: 'fa-border-all' },
  { key: 'setup', label: 'Setup awal', icon: 'fa-gear' },
  { key: 'wajib', label: 'Wajib Des 2026', icon: 'fa-heart-pulse' },
  { key: 'penting', label: 'Penting', icon: 'fa-pills' },
];
