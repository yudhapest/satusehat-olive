/** Interactive Rawat Inap (Ranap) flow simulation — satusehat_log with noreg as primary key.
 *  Mensimulasikan alur SATUSEHAT rawat inap LENGKAP & multi-hari: pasien masuk dari IGD
 *  (admitSource: emergency-room) → admisi (EpisodeOfCare + Encounter class IMP) → asesmen awal →
 *  perawatan harian (loop: vital, obat berulang, diagnosa sekunder, tindakan) → penunjang lab &
 *  radiologi → mutasi bed (PUT location) → discharge (Composition resume medis → Encounter finished).
 *  Beda utama vs rajal/IGD: class IMP + status in-progress, hospitalization.admitSource dari IGD,
 *  resource EpisodeOfCare + CarePlan + Composition, MedicationDispense berulang, dan mutasi bed. */

const NOREG = '2606060108';

const SRC = {
  patient: 'P-006108',
  eoc: 'EOC-101',
  vs: 'VS-9912',
  allergy: 'ALG-771',
  careplan: 'CP-540',
  dx: 'DX-3310',
  dx2: 'DX-3311',
  proc: 'PRC-9920',
  medrq: 'RX-7710',
  meddisp: 'DSP-7710',
  mutasi: 'MUT-220',
  composition: 'CMP-880',
  srlab: 'SRL-9801',
  spec: 'SPC-5210',
  obslab: 'LAB-6620',
  drlab: 'DRL-7720',
  srrad: 'SRR-9901',
  img: 'IMG-7810',
  obsrad: 'RAD-6610',
  drrad: 'DRR-7730',
};

const PHASES = [
  { key: 'admisi', label: 'Admisi (dari IGD)', icon: 'fa-hospital-user' },
  { key: 'asesmen', label: 'Asesmen Awal', icon: 'fa-stethoscope' },
  { key: 'harian', label: 'Perawatan Harian', icon: 'fa-calendar-day' },
  { key: 'lab', label: 'Penunjang Lab', icon: 'fa-vial' },
  { key: 'radiologi', label: 'Penunjang Radiologi', icon: 'fa-x-ray' },
  { key: 'mutasi', label: 'Mutasi Bed', icon: 'fa-bed' },
  { key: 'discharge', label: 'Discharge', icon: 'fa-person-walking-arrow-right' },
];

function ts(h, m, day = 6) {
  return `2026-06-${String(day).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function statusPill(s) {
  const map = { pending: 'sim-pill--pending', sent: 'sim-pill--sent', failed: 'sim-pill--failed', retrying: 'sim-pill--retrying' };
  return `<span class="sim-pill ${map[s] || ''}">${s}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* Reference IDs — consistent with the rawat inap scenario */
const REF = {
  patient: 'Patient/N10000610',
  patientDisplay: 'Slamet Riyadi',
  episodeOfCare: 'EpisodeOfCare/eoc-ranap-001',
  encounter: 'Encounter/enc-ranap-2606060108',
  condition: 'Condition/cond-ranap-001',
  practitioner: 'Practitioner/N10000001',
  practitionerDisplay: 'dr. Andi Wijaya, Sp.PD',
  apoteker: 'Practitioner/N10000010',
  apotekerDisplay: 'Apt. Siti Rahayu, S.Farm',
  org: 'Organization/org-rs-001',
  orgLab: 'Organization/org-lab-001',
  locAwal: 'Location/LOC-MAWAR-301',
  locBaru: 'Location/LOC-VIP-205',
  srLab: 'ServiceRequest/sr-lab-rn-001',
  srRad: 'ServiceRequest/sr-rad-rn-001',
  specimen: 'Specimen/spec-rn-001',
  medrq: 'MedicationRequest/medrq-ranap-001',
  imaging: 'ImagingStudy/imgstudy-rn-001',
};

/* '2026-06-06 08:31' -> '2026-06-06T08:31:00+07:00' */
function dt(value) {
  if (!value) return '2026-06-06T08:00:00+07:00';
  return `${value.replace(' ', 'T')}:00+07:00`;
}

const OBS_CATALOG = {
  '8310-5': { display: 'Body temperature', text: 'Suhu Tubuh', value: 38.6, unit: 'Cel' },
  '8867-4': { display: 'Heart rate', text: 'Denyut Nadi', value: 98, unit: '/min' },
  '9279-1': { display: 'Respiratory rate', text: 'Laju Pernapasan', value: 24, unit: '/min' },
  '59408-5': { display: 'Oxygen saturation in Arterial blood by Pulse oximetry', text: 'Saturasi Oksigen (SpO2)', value: 95, unit: '%' },
  // Penunjang lab — darah perifer lengkap (DPL) untuk evaluasi infeksi/pneumonia
  '718-7': { display: 'Hemoglobin [Mass/volume] in Blood', text: 'Hemoglobin', value: 12.8, unit: 'g/dL' },
  '6690-2': { display: 'Leukocytes [#/volume] in Blood', text: 'Leukosit', value: 14.5, unit: '10*3/uL' },
  '777-3': { display: 'Platelets [#/volume] in Blood', text: 'Trombosit', value: 230, unit: '10*3/uL' },
};

function obsCode(row) { return (row?.obs_code || '8310-5').split(' ')[0]; }

function endpointInfo(resourceType, row) {
  if (resourceType === 'Encounter' && (row?.enc_status === 'finished' || row?.enc_status === 'mutasi')) return { method: 'PUT', endpoint: '/Encounter/enc-ranap-2606060108' };
  if (resourceType === 'EpisodeOfCare' && row?.enc_status === 'finished') return { method: 'PUT', endpoint: '/EpisodeOfCare/eoc-ranap-001' };
  if (resourceType === 'ImagingStudy') return { method: 'POST', endpoint: '/ImagingStudy (DICOM Router → NIDR)' };
  return { method: 'POST', endpoint: `/${resourceType}` };
}

/* Build a SATUSEHAT-accurate request body, consistent with petaResource.ts */
function buildRequest(resourceType, row) {
  const subject = { reference: REF.patient, display: REF.patientDisplay };
  const encounter = { reference: REF.encounter };
  const when = dt(row?.created_at);

  switch (resourceType) {
    case 'Patient':
      return {
        resourceType: 'Patient',
        identifier: [{ use: 'official', system: 'https://fhir.kemkes.go.id/id/nik', value: '3315011503690003' }],
        active: true,
        name: [{ use: 'official', text: REF.patientDisplay }],
        gender: 'male',
        birthDate: '1969-03-15',
      };

    case 'EpisodeOfCare':
      if (row?.enc_status === 'finished') {
        return {
          resourceType: 'EpisodeOfCare',
          identifier: [{ system: 'http://sys-ids.kemkes.go.id/episodeofcare/5277013', value: 'EOC-2026-0108' }],
          status: 'finished',
          patient: subject,
          managingOrganization: { reference: REF.org },
          period: { start: '2026-06-06T08:30:00+07:00', end: dt(row?.sent_at || '2026-06-08 11:00') },
        };
      }
      return {
        resourceType: 'EpisodeOfCare',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/episodeofcare/5277013', value: 'EOC-2026-0108' }],
        status: 'active',
        patient: subject,
        managingOrganization: { reference: REF.org },
        period: { start: '2026-06-06T08:30:00+07:00' },
        diagnosis: [{ condition: { reference: REF.condition, display: 'Pneumonia' }, role: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role', code: 'AD', display: 'Admission diagnosis' }] } }],
      };

    case 'Encounter':
      if (row?.enc_status === 'finished') {
        return {
          resourceType: 'Encounter',
          identifier: [{ system: 'http://sys-ids.kemkes.go.id/encounter/5277013', value: 'RI-2026-0108' }],
          status: 'finished',
          class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'IMP', display: 'inpatient encounter' },
          subject,
          episodeOfCare: [{ reference: REF.episodeOfCare }],
          period: { start: '2026-06-06T08:30:00+07:00', end: dt(row?.sent_at || '2026-06-08 11:00') },
          // SATUSEHAT mewajibkan riwayat status lengkap saat update finished (ranap langsung in-progress, tanpa arrived)
          statusHistory: [
            { status: 'in-progress', period: { start: '2026-06-06T08:30:00+07:00', end: dt(row?.sent_at || '2026-06-08 11:00') } },
            { status: 'finished', period: { start: dt(row?.sent_at || '2026-06-08 11:00') } },
          ],
          // Riwayat lokasi lengkap termasuk mutasi bed — semua di-completed saat pulang
          location: [
            { location: { reference: REF.locAwal, display: 'Bangsal Mawar Kamar 301 (Kelas 3)' }, status: 'completed', period: { start: '2026-06-06T08:30:00+07:00', end: '2026-06-08T08:00:00+07:00' } },
            { location: { reference: REF.locBaru, display: 'Ruang VIP 205' }, status: 'completed', period: { start: '2026-06-08T08:00:00+07:00', end: dt(row?.sent_at || '2026-06-08 11:00') } },
          ],
          diagnosis: [{ condition: { reference: REF.condition, display: 'Pneumonia' }, use: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role', code: 'DD', display: 'Discharge diagnosis' }] }, rank: 1 }],
          hospitalization: {
            admitSource: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/admit-source', code: 'emd', display: 'From accident/emergency department' }], text: 'Masuk dari IGD' },
            dischargeDisposition: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/discharge-disposition', code: 'home', display: 'Home' }], text: 'Pulang dalam keadaan membaik' },
          },
          serviceProvider: { reference: REF.org },
        };
      }
      if (row?.enc_status === 'mutasi') {
        return {
          resourceType: 'Encounter',
          identifier: [{ system: 'http://sys-ids.kemkes.go.id/encounter/5277013', value: 'RI-2026-0108' }],
          status: 'in-progress',
          class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'IMP', display: 'inpatient encounter' },
          subject,
          episodeOfCare: [{ reference: REF.episodeOfCare }],
          period: { start: '2026-06-06T08:30:00+07:00' },
          // location array: kamar lama di-completed, kamar baru active (riwayat mutasi bed)
          location: [
            { location: { reference: REF.locAwal, display: 'Bangsal Mawar Kamar 301 (Kelas 3)' }, status: 'completed', period: { start: '2026-06-06T08:30:00+07:00', end: dt(row?.created_at || '2026-06-08 08:00') } },
            { location: { reference: REF.locBaru, display: 'Ruang VIP 205' }, status: 'active', period: { start: dt(row?.created_at || '2026-06-08 08:00') } },
          ],
          serviceProvider: { reference: REF.org },
        };
      }
      return {
        resourceType: 'Encounter',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/encounter/5277013', value: 'RI-2026-0108' }],
        status: 'in-progress',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'IMP', display: 'inpatient encounter' },
        subject,
        episodeOfCare: [{ reference: REF.episodeOfCare }],
        participant: [{ type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }], individual: { reference: REF.practitioner, display: REF.practitionerDisplay } }],
        period: { start: '2026-06-06T08:30:00+07:00' },
        location: [{ location: { reference: REF.locAwal, display: 'Bangsal Mawar Kamar 301 (Kelas 3)' }, status: 'active', period: { start: '2026-06-06T08:30:00+07:00' } }],
        hospitalization: { admitSource: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/admit-source', code: 'emd', display: 'From accident/emergency department' }], text: 'Masuk dari IGD' } },
        serviceProvider: { reference: REF.org },
        statusHistory: [{ status: 'in-progress', period: { start: '2026-06-06T08:30:00+07:00' } }],
      };

    case 'AllergyIntolerance':
      return {
        resourceType: 'AllergyIntolerance',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }] },
        code: { coding: [{ system: 'http://snomed.info/sct', code: '716186003', display: 'No known allergy' }], text: 'Tidak ada alergi (NKA)' },
        patient: subject,
        encounter,
        recordedDate: when,
        recorder: { reference: REF.practitioner },
      };

    case 'Condition': {
      const isSekunder = row?.source_table === 'diagnosa_sekunder';
      const isPulang = row?.source_table === 'diagnosa_pulang';
      const dx = isSekunder
        ? { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications', text: 'Diabetes Melitus tipe 2 (komorbid)' }
        : { code: 'J18.9', display: 'Pneumonia, unspecified organism', text: 'Pneumonia' };
      return {
        resourceType: 'Condition',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: isPulang ? 'resolved' : 'active', display: isPulang ? 'Resolved' : 'Active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis', display: 'Encounter Diagnosis' }] }],
        code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: dx.code, display: dx.display }], text: dx.text },
        subject,
        encounter,
        onsetDateTime: when,
        recordedDate: when,
        recorder: { reference: REF.practitioner },
      };
    }

    case 'Procedure':
      return {
        resourceType: 'Procedure',
        status: 'completed',
        category: { coding: [{ system: 'http://snomed.info/sct', code: '387713003', display: 'Surgical procedure' }] },
        code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-9-cm', code: '93.94', display: 'Respiratory medication administered by nebulizer' }], text: 'Nebulizer & fisioterapi dada' },
        subject,
        encounter,
        performedDateTime: when,
        performer: [{ actor: { reference: REF.practitioner, display: REF.practitionerDisplay } }],
        reasonReference: [{ reference: REF.condition, display: 'Pneumonia' }],
      };

    case 'MedicationRequest':
      // Ranap: order obat IV harian dari DPJP (antibiotik injeksi)
      return {
        resourceType: 'MedicationRequest',
        contained: [{ resourceType: 'Medication', id: 'med', code: { coding: [{ system: 'http://sys-ids.kemkes.go.id/kfa', code: '93001234', display: 'Ceftriaxone 1 g Serbuk Injeksi' }], text: 'Ceftriaxone 1 g Injeksi' }, status: 'active', form: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm', code: 'INJ', display: 'Injection' }] } }],
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/prescription/5277013', value: 'RES-2026-0108-01' }],
        status: 'active',
        intent: 'order',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category', code: 'inpatient', display: 'Inpatient' }] }],
        medicationReference: { reference: '#med', display: 'Ceftriaxone 1 g Injeksi' },
        subject,
        encounter,
        authoredOn: when,
        requester: { reference: REF.practitioner, display: REF.practitionerDisplay },
        dosageInstruction: [{ text: '2 kali sehari 1 gram IV (tiap 12 jam)', timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } }, route: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration', code: 'IV', display: 'Intravenous' }] }, doseAndRate: [{ doseQuantity: { value: 1, unit: 'g', system: 'http://unitsofmeasure.org', code: 'g' } }] }],
        dispenseRequest: { quantity: { value: 6, unit: 'Vial' }, expectedSupplyDuration: { value: 3, unit: 'days', system: 'http://unitsofmeasure.org', code: 'd' } },
      };

    case 'MedicationDispense':
      // Ranap: tiap pemberian dosis dicatat sebagai 1 MedicationDispense (bisa berulang)
      return {
        resourceType: 'MedicationDispense',
        contained: [{ resourceType: 'Medication', id: 'med', code: { coding: [{ system: 'http://sys-ids.kemkes.go.id/kfa', code: '93001234', display: 'Ceftriaxone 1 g Serbuk Injeksi' }] }, status: 'active' }],
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/dispensing/5277013', value: `DISP-2026-0108-${row?.source_id || '01'}` }],
        status: 'completed',
        category: { coding: [{ system: 'http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category', code: 'inpatient', display: 'Inpatient' }] },
        medicationReference: { reference: '#med', display: 'Ceftriaxone 1 g Injeksi' },
        subject,
        context: encounter,
        authorizingPrescription: [{ reference: REF.medrq }],
        quantity: { value: 1, system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm', code: 'VIAL' },
        whenHandedOver: when,
        performer: [{ actor: { reference: REF.practitioner, display: 'Ns. Rina, S.Kep (perawat shift)' } }],
        receiver: [subject],
      };

    case 'CarePlan':
      return {
        resourceType: 'CarePlan',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/careplan/5277013', value: 'CP-2026-0108' }],
        status: 'active',
        intent: 'plan',
        title: 'Rencana Perawatan Pneumonia',
        subject,
        encounter,
        period: { start: '2026-06-06T09:00:00+07:00' },
        created: when,
        author: { reference: REF.practitioner, display: REF.practitionerDisplay },
        addresses: [{ reference: REF.condition, display: 'Pneumonia' }],
        activity: [
          { detail: { kind: 'MedicationRequest', status: 'in-progress', description: 'Antibiotik IV Ceftriaxone 2x1 g' } },
          { detail: { kind: 'ServiceRequest', status: 'scheduled', description: 'Cek DPL & Rontgen thorax kontrol' } },
        ],
      };

    case 'Composition':
      // Resume medis rawat inap — dokumen yang merangkum seluruh resource (khas ranap)
      return {
        resourceType: 'Composition',
        identifier: { system: 'http://sys-ids.kemkes.go.id/composition/5277013', value: 'CMP-2026-0108' },
        status: 'final',
        type: { coding: [{ system: 'http://loinc.org', code: '18842-5', display: 'Discharge summary' }], text: 'Resume Medis Rawat Inap' },
        subject,
        encounter,
        date: when,
        author: [{ reference: REF.practitioner, display: REF.practitionerDisplay }],
        title: 'Resume Medis Rawat Inap',
        section: [
          { title: 'Diagnosa', code: { coding: [{ system: 'http://loinc.org', code: '11535-2', display: 'Hospital discharge Dx' }] }, entry: [{ reference: REF.condition, display: 'Pneumonia' }, { reference: 'Condition/cond-ranap-002', display: 'DM tipe 2' }] },
          { title: 'Tindakan', code: { coding: [{ system: 'http://loinc.org', code: '29554-3', display: 'Procedure note' }] }, entry: [{ reference: 'Procedure/proc-ranap-001' }] },
          { title: 'Obat', code: { coding: [{ system: 'http://loinc.org', code: '10160-0', display: 'History of Medication use' }] }, entry: [{ reference: REF.medrq }] },
          { title: 'Penunjang', code: { coding: [{ system: 'http://loinc.org', code: '30954-2', display: 'Relevant diagnostic tests' }] }, entry: [{ reference: 'DiagnosticReport/dr-lab-rn-001' }, { reference: 'DiagnosticReport/dr-rad-rn-001' }] },
        ],
      };

    case 'ServiceRequest': {
      const isRad = row?.source_table === 'order_radiologi';
      return {
        resourceType: 'ServiceRequest',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/servicerequest/5277013', value: isRad ? 'RAD-2026-0001' : 'LAB-2026-0001' }],
        status: 'active',
        intent: 'order',
        category: [{ coding: isRad
          ? [{ system: 'http://snomed.info/sct', code: '363679005', display: 'Imaging' }]
          : [{ system: 'http://snomed.info/sct', code: '108252007', display: 'Laboratory procedure' }] }],
        priority: 'routine',
        code: { coding: isRad
          ? [{ system: 'http://loinc.org', code: '39154-9', display: 'Chest X-ray PA' }]
          : [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC panel - Blood by Automated count' }], text: isRad ? 'Thorax PA' : 'Darah Perifer Lengkap (DPL)' },
        subject,
        encounter,
        occurrenceDateTime: when,
        authoredOn: when,
        requester: { reference: REF.practitioner, display: REF.practitionerDisplay },
        performer: [{ reference: isRad ? 'Organization/org-rad-001' : REF.orgLab, display: isRad ? 'Radiologi RSUD Pati' : 'Laboratorium RSUD Pati' }],
        reasonReference: [{ reference: REF.condition, display: 'Pneumonia' }],
      };
    }

    case 'Specimen':
      return {
        resourceType: 'Specimen',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/specimen/5277013', value: 'SPC-2026-0001' }],
        status: 'available',
        type: { coding: [{ system: 'http://snomed.info/sct', code: '119297000', display: 'Blood specimen' }], text: 'Darah' },
        subject,
        request: [{ reference: REF.srLab }],
        collection: { collectedDateTime: when, collector: { reference: REF.practitioner }, method: { coding: [{ system: 'http://snomed.info/sct', code: '129300006', display: 'Puncture - action' }] } },
      };

    case 'Observation': {
      const code = obsCode(row);
      const base = {
        resourceType: 'Observation',
        status: 'final',
        subject,
        encounter,
        effectiveDateTime: when,
      };
      // Vital sign — blood pressure uses component (NOT valueQuantity)
      if (code === '55284-5') {
        return {
          ...base,
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '55284-5', display: 'Blood pressure systolic and diastolic' }], text: 'Tekanan Darah' },
          component: [
            { code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] }, valueQuantity: { value: 130, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' } },
            { code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] }, valueQuantity: { value: 85, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' } },
          ],
        };
      }
      // Radiology reading — narrative valueString, derivedFrom ImagingStudy
      if (row?.source_table === 'bacaan_radiologi') {
        return {
          ...base,
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'imaging', display: 'Imaging' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '18782-3', display: 'Radiology study observation (narrative)' }], text: 'Bacaan Radiologi' },
          performer: [{ reference: REF.practitioner, display: 'dr. Radiolog, Sp.Rad' }],
          derivedFrom: [{ reference: REF.imaging }],
          valueString: 'Tampak infiltrat pada lapangan paru kanan bawah. Cor dalam batas normal. Sinus dan diafragma baik. Kesan: pneumonia paru kanan bawah.',
        };
      }
      // Lab result — basedOn ServiceRequest, specimen, valueQuantity + referenceRange
      const isLab = row?.source_table === 'hasil_lab';
      const meta = OBS_CATALOG[code] || { display: 'Observation', text: 'Observation', value: 0, unit: '' };
      return {
        ...base,
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: isLab ? 'laboratory' : 'vital-signs', display: isLab ? 'Laboratory' : 'Vital Signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code, display: meta.display }], text: meta.text },
        ...(isLab ? { basedOn: [{ reference: REF.srLab }], specimen: { reference: REF.specimen } } : {}),
        valueQuantity: { value: meta.value, unit: meta.unit, system: 'http://unitsofmeasure.org', code: meta.unit },
      };
    }

    case 'DiagnosticReport': {
      const isRad = row?.source_table === 'laporan_radiologi';
      return {
        resourceType: 'DiagnosticReport',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/diagnostic/5277013', value: isRad ? 'DRAD-2026-0001' : 'DLAB-2026-0001' }],
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: isRad ? 'RAD' : 'LAB', display: isRad ? 'Radiology' : 'Laboratory' }] }],
        code: { coding: isRad
          ? [{ system: 'http://loinc.org', code: '18748-4', display: 'Diagnostic imaging study' }]
          : [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC panel - Blood by Automated count' }], text: isRad ? 'Laporan Radiologi Thorax' : 'Hasil Darah Perifer Lengkap (DPL)' },
        subject,
        encounter,
        effectiveDateTime: when,
        issued: when,
        basedOn: [{ reference: isRad ? REF.srRad : REF.srLab }],
        performer: [{ reference: isRad ? 'Organization/org-rad-001' : REF.orgLab }],
        result: isRad
          ? [{ reference: 'Observation/obs-rad-rn-001' }]
          : [{ reference: 'Observation/obs-lab-rn-001' }, { reference: 'Observation/obs-lab-rn-002' }, { reference: 'Observation/obs-lab-rn-003' }],
        ...(isRad ? { imagingStudy: [{ reference: REF.imaging }] } : {}),
        conclusion: isRad ? 'Tampak infiltrat di lapangan paru kanan bawah, sesuai gambaran pneumonia.' : 'Leukositosis (14.5 ribu/uL) mendukung proses infeksi. Hb & trombosit normal.',
      };
    }

    case 'ImagingStudy':
      return {
        resourceType: 'ImagingStudy',
        identifier: [{ system: 'urn:dicom:uid', value: 'urn:oid:1.2.840.113619.2.5.1762583153.215519.978957063.78' }],
        status: 'available',
        modality: [{ system: 'http://dicom.nema.org/resources/ontology/DCM', code: 'CR', display: 'Computed Radiography' }],
        subject,
        encounter,
        started: when,
        basedOn: [{ reference: REF.srRad }],
        referrer: { reference: REF.practitioner, display: REF.practitionerDisplay },
        numberOfSeries: 1,
        numberOfInstances: 2,
        description: 'Thorax PA',
        // endpoint = Wado URL yang dikembalikan NIDR setelah DICOM Router push citra ke PACS
        endpoint: [{ reference: 'Endpoint/wado-nidr-001' }],
        series: [{
          uid: '1.2.840.113619.2.5.1762583153.215519.978957063.79',
          number: 1,
          modality: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: 'CR' },
          description: 'Thorax PA view',
          numberOfInstances: 2,
          bodySite: { system: 'http://snomed.info/sct', code: '51185008', display: 'Thoracic structure' },
          endpoint: [{ reference: 'Endpoint/wado-nidr-001' }],
          instance: [{ uid: '1.2.840.113619.2.5.1762583153.215519.978957063.80', sopClass: { system: 'urn:ietf:rfc:3986', code: 'urn:oid:1.2.840.10008.5.1.4.1.1.1' }, number: 1, title: 'PA View' }],
        }],
      };

    default:
      return { resourceType, subject, encounter };
  }
}

function buildResponse(reqObj, row, opts) {
  if (opts.error) {
    return {
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: opts.http === 422 ? 'invalid' : 'processing',
        diagnostics: opts.error,
      }],
    };
  }
  // SATUSEHAT mengembalikan resource yang dibuat lengkap dengan id (ihs_id) + meta
  return {
    ...reqObj,
    id: opts.ihs,
    meta: { versionId: '1', lastUpdated: dt(row?.sent_at || opts.at) },
  };
}

export function initSimulasiRanap() {
  const page = document.getElementById('sim-ranap');
  if (!page) return;

  let logs = [];
  let details = [];
  let logId = 1;
  let detailId = 1;
  let activityLog = [];
  let cursor = 0;

  function addLog(obj) { logs.push({ ...obj, id: logId++ }); }

  // Deterministic latency so the demo stays stable across runs
  function latency(status, seed) {
    return status >= 400 ? 70 + ((seed * 13) % 60) : 180 + ((seed * 29) % 320);
  }

  // Record one send attempt into satusehat_log_detail (request + response audit trail)
  function recordAttempt(row, opts) {
    const resourceType = opts.resourceType || row?.resource_type || opts.label;
    const info = endpointInfo(resourceType, row);
    const request = buildRequest(resourceType, row);
    const status = opts.http || 201;
    if (row) {
      if (opts.error) row.last_error = opts.error;
      row.retry_count = Math.max(row.retry_count || 0, (opts.attempt || 1) - 1);
    }
    details.push({
      id: detailId++,
      log_id: row ? row.id : null,
      noreg: row ? row.noreg : NOREG,
      resource_type: opts.label || resourceType,
      attempt_no: opts.attempt || 1,
      http_method: info.method,
      endpoint: info.endpoint,
      request_body: request,
      response_status: status,
      response_body: buildResponse(request, row, opts),
      error_message: opts.error || null,
      duration_ms: latency(status, detailId),
      created_at: opts.at,
    });
  }
  function addActivity(icon, text, color = 'secondary') {
    const t = new Date();
    activityLog.unshift({
      icon,
      text,
      color,
      time: t.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  }

  // Insert a pending log row for a single resource
  function insert(opts) {
    addLog({
      module: 'ranap',
      resource_type: opts.type,
      noreg: opts.noreg === undefined ? NOREG : opts.noreg,
      source_table: opts.src_table,
      source_id: opts.src_id,
      obs_code: opts.obs_code || null,
      enc_status: opts.enc_status || null,
      status: 'pending',
      ihs_id: null,
      retry_count: 0,
      last_error: null,
      created_at: opts.at,
    });
  }

  // Mark the first matching pending row as sent + record an attempt detail
  function send(pred, opts) {
    const r = logs.find((l) => pred(l) && l.status !== 'sent');
    if (r) { r.status = 'sent'; r.ihs_id = opts.ihs; r.sent_at = opts.at; }
    recordAttempt(r, opts);
    return r;
  }

  const steps = [
    // ---------- ADMISI (pasien masuk dari IGD) ----------
    {
      phase: 'admisi',
      label: 'PatientObserver → insert Patient (pending)',
      run: () => {
        insert({ type: 'Patient', noreg: null, src_table: 'patient', src_id: SRC.patient, at: ts(8, 25) });
        addActivity('fa-user-plus', 'Pasien rujukan dari IGD diterima admisi ranap → insert Patient (status pending). noreg NULL karena Patient belum terikat kunjungan.');
      },
    },
    {
      phase: 'admisi',
      label: 'KirimPatientJob → POST /Patient (sent)',
      run: () => {
        send((l) => l.resource_type === 'Patient', { ihs: 'N10000610', at: ts(8, 26), label: 'Patient' });
        addActivity('fa-check', 'KirimPatientJob → GET /Patient by NIK → ditemukan → 200 (atau POST → 201)', 'success');
      },
    },
    {
      phase: 'admisi',
      label: 'AdmisiObserver → insert EpisodeOfCare (pending, opsional)',
      run: () => {
        insert({ type: 'EpisodeOfCare', src_table: 'episode_perawatan', src_id: SRC.eoc, enc_status: 'active', at: ts(8, 28) });
        addActivity('fa-folder-plus', 'AdmisiObserver → insert EpisodeOfCare (OPSIONAL tapi direkomendasikan) — payung yang menaungi seluruh Encounter ranap pasien ini.');
      },
    },
    {
      phase: 'admisi',
      label: 'KirimEpisodeOfCareJob → POST /EpisodeOfCare (sent)',
      run: () => {
        send((l) => l.resource_type === 'EpisodeOfCare' && l.enc_status === 'active', { ihs: 'eoc-ranap-001', at: ts(8, 29), label: 'EpisodeOfCare' });
        addActivity('fa-check', 'KirimEpisodeOfCareJob → POST /EpisodeOfCare → 201 → ihs_id = eoc-ranap-001. Encounter berikutnya mereferensikan id ini.', 'success');
      },
    },
    {
      phase: 'admisi',
      label: 'RegpasObserver → insert Encounter in-progress (IMP) (pending)',
      run: () => {
        insert({ type: 'Encounter', src_table: 'regpas', src_id: NOREG, enc_status: 'in-progress', at: ts(8, 30) });
        addActivity('fa-bed-pulse', 'RegpasObserver → insert Encounter (class IMP, status in-progress, admitSource: emergency = masuk dari IGD).');
        addActivity('fa-circle-info', 'Beda dari rajal/IGD: status in-progress (bukan arrived), class IMP, ada hospitalization.admitSource.');
      },
    },
    {
      phase: 'admisi',
      label: 'KirimEncounterJob → POST /Encounter (sent)',
      run: () => {
        send((l) => l.resource_type === 'Encounter' && l.enc_status === 'in-progress', { ihs: 'enc-ranap-2606060108', at: ts(8, 31), label: 'Encounter in-progress' });
        addActivity('fa-check', 'KirimEncounterJob → POST /Encounter (IMP) → 201 → ihs_id = enc-ranap-2606060108 (anchor seluruh ranap).', 'success');
      },
    },

    // ---------- ASESMEN AWAL ----------
    {
      phase: 'asesmen',
      label: 'AlergiObserver → insert AllergyIntolerance (pending)',
      run: () => {
        insert({ type: 'AllergyIntolerance', src_table: 'alergi', src_id: SRC.allergy, at: ts(8, 40) });
        addActivity('fa-triangle-exclamation', 'AlergiObserver → asesmen awal masuk: insert AllergyIntolerance. Tidak ada alergi → NKA (716186003). WAJIB.');
      },
    },
    {
      phase: 'asesmen',
      label: 'KirimAllergyJob → POST /AllergyIntolerance (sent)',
      run: () => {
        send((l) => l.resource_type === 'AllergyIntolerance', { ihs: 'alg-ranap-001', at: ts(8, 41), label: 'AllergyIntolerance' });
        addActivity('fa-check', 'KirimAllergyJob → POST /AllergyIntolerance (NKA) → 201 → ihs_id = alg-ranap-001', 'success');
      },
    },
    {
      phase: 'asesmen',
      label: 'VitalSignObserver → 5 Observation vital masuk (pending)',
      run: () => {
        const codes = [
          { code: '8310-5', lbl: 'suhu' },
          { code: '55284-5', lbl: 'tekanan darah' },
          { code: '8867-4', lbl: 'nadi' },
          { code: '9279-1', lbl: 'laju napas' },
          { code: '59408-5', lbl: 'saturasi' },
        ];
        codes.forEach((c) => insert({ type: 'Observation', src_table: 'vitalsign', src_id: SRC.vs, obs_code: `${c.code} (${c.lbl})`, at: ts(8, 45) }));
        addActivity('fa-heart-pulse', 'VitalSignObserver → tanda vital saat masuk: 5 Observation pending (suhu 38.6, TD, nadi 98, RR 24, SpO2 95).');
      },
    },
    {
      phase: 'asesmen',
      label: 'KirimObservationJob → 5 Observation vital masuk (sent)',
      run: () => {
        const obs = logs.filter((l) => l.resource_type === 'Observation' && l.source_table === 'vitalsign' && l.status === 'pending');
        obs.forEach((o, i) => {
          o.status = 'sent';
          o.ihs_id = `obs-rn-00${i + 1}`;
          o.sent_at = ts(8, 46);
          recordAttempt(o, { label: 'Observation', resourceType: 'Observation', http: 201, ihs: o.ihs_id, at: ts(8, 46) });
        });
        addActivity('fa-check', 'KirimObservationJob → 5 Observation tanda vital masuk → 201 Created (SpO2 95% & suhu 38.6 → tanda infeksi).', 'success');
      },
    },
    {
      phase: 'asesmen',
      label: 'DiagnosaObserver → insert Condition masuk (pending)',
      run: () => {
        insert({ type: 'Condition', src_table: 'diagnosa', src_id: SRC.dx, at: ts(9, 0) });
        addActivity('fa-stethoscope', 'DiagnosaObserver → diagnosa masuk (admission): Condition J18.9 (Pneumonia). Dikirim sebelum Procedure & CarePlan.');
      },
    },
    {
      phase: 'asesmen',
      label: 'KirimConditionJob → POST /Condition masuk (sent)',
      run: () => {
        send((l) => l.resource_type === 'Condition' && l.source_table === 'diagnosa', { ihs: 'cond-ranap-001', at: ts(9, 1), label: 'Condition (masuk)' });
        addActivity('fa-check', 'KirimConditionJob → POST /Condition → 201 → ihs_id = cond-ranap-001', 'success');
      },
    },
    {
      phase: 'asesmen',
      label: 'AsuhanObserver → insert CarePlan (pending, opsional)',
      run: () => {
        insert({ type: 'CarePlan', src_table: 'rencana_asuhan', src_id: SRC.careplan, at: ts(9, 10) });
        addActivity('fa-clipboard-list', 'AsuhanObserver → insert CarePlan (OPSIONAL) — rencana terapi: antibiotik IV, target lama rawat, kontrol DPL & rontgen.');
      },
    },
    {
      phase: 'asesmen',
      label: 'KirimCarePlanJob → POST /CarePlan (sent)',
      run: () => {
        send((l) => l.resource_type === 'CarePlan', { ihs: 'cp-ranap-001', at: ts(9, 11), label: 'CarePlan' });
        addActivity('fa-check', 'KirimCarePlanJob → POST /CarePlan → 201 → ihs_id = cp-ranap-001 (addresses → cond-ranap-001).', 'success');
      },
    },

    // ---------- PERAWATAN HARIAN (loop) ----------
    {
      phase: 'harian',
      label: 'ResepObserver → insert MedicationRequest (IV antibiotik) (pending)',
      run: () => {
        insert({ type: 'MedicationRequest', src_table: 'resep', src_id: SRC.medrq, at: ts(9, 30) });
        addActivity('fa-prescription', 'DPJP visite → order Ceftriaxone 1 g IV 2x/hari. insert MedicationRequest (Medication di contained, route IV).');
      },
    },
    {
      phase: 'harian',
      label: 'KirimMedicationRequestJob → POST /MedicationRequest (sent)',
      run: () => {
        send((l) => l.resource_type === 'MedicationRequest', { ihs: 'medrq-ranap-001', at: ts(9, 31), label: 'MedicationRequest' });
        addActivity('fa-check', 'KirimMedicationRequestJob → POST /MedicationRequest (+ Medication contained) → 201 Created', 'success');
      },
    },
    {
      phase: 'harian',
      label: 'PemberianObatObserver → insert MedicationDispense pagi (pending)',
      run: () => {
        insert({ type: 'MedicationDispense', src_table: 'penyerahan_obat', src_id: SRC.meddisp, at: ts(10, 0) });
        addActivity('fa-syringe', 'Perawat memberikan dosis pagi → insert MedicationDispense (pemberian #1). Di ranap, tiap dosis = 1 dispense.');
      },
    },
    {
      phase: 'harian',
      label: 'KirimMedicationDispenseJob → pemberian pagi GAGAL (500 transient)',
      run: () => {
        const d = logs.find((l) => l.resource_type === 'MedicationDispense' && l.source_id === SRC.meddisp && l.status === 'pending');
        if (d) d.status = 'failed';
        recordAttempt(d, { label: 'MedicationDispense (pagi)', resourceType: 'MedicationDispense', http: 500, error: 'Internal Server Error pada SatuSehat (transient)', at: ts(10, 1) });
        addActivity('fa-xmark', 'KirimMedicationDispenseJob → 500 Internal Server Error (transient). Status → failed, masuk antrian retry.', 'danger');
      },
    },
    {
      phase: 'harian',
      label: 'RetryService → pemberian pagi retry (sent)',
      run: () => {
        const d = logs.find((l) => l.resource_type === 'MedicationDispense' && l.status === 'failed');
        if (d) { d.status = 'sent'; d.ihs_id = 'meddisp-rn-001'; d.sent_at = ts(10, 6); }
        recordAttempt(d, { label: 'MedicationDispense (retry)', resourceType: 'MedicationDispense', attempt: 2, http: 201, ihs: 'meddisp-rn-001', at: ts(10, 6) });
        addActivity('fa-rotate-right', 'RetryService → kirim ulang dengan exponential backoff → 201 Created → ihs_id = meddisp-rn-001 (attempt 2).', 'success');
      },
    },
    {
      phase: 'harian',
      label: 'PemberianObatObserver → MedicationDispense malam (sent)',
      run: () => {
        insert({ type: 'MedicationDispense', src_table: 'penyerahan_obat', src_id: 'DSP-7711', at: ts(22, 0) });
        send((l) => l.resource_type === 'MedicationDispense' && l.source_id === 'DSP-7711', { ihs: 'meddisp-rn-002', at: ts(22, 1), label: 'MedicationDispense (malam)' });
        addActivity('fa-syringe', 'Dosis malam (pemberian #2) → insert + POST /MedicationDispense → 201 → ihs_id = meddisp-rn-002.', 'success');
      },
    },
    {
      phase: 'harian',
      label: 'VitalSignObserver → Observation vital harian hari-2 (sent)',
      run: () => {
        insert({ type: 'Observation', src_table: 'vitalsign', src_id: 'VS-9920', obs_code: '8310-5 (suhu hari-2)', at: ts(6, 0, 7) });
        const o = logs.find((l) => l.resource_type === 'Observation' && l.source_id === 'VS-9920' && l.status === 'pending');
        if (o) { o.status = 'sent'; o.ihs_id = 'obs-rn-006'; o.sent_at = ts(6, 1, 7); }
        recordAttempt(o, { label: 'Observation (vital hari-2)', resourceType: 'Observation', http: 201, ihs: 'obs-rn-006', at: ts(6, 1, 7) });
        addActivity('fa-calendar-day', 'Loop harian hari ke-2 (07 Jun): vital pagi → suhu turun 37.4. Encounter ID TETAP sama, tidak buat Encounter baru.', 'success');
      },
    },
    {
      phase: 'harian',
      label: 'DiagnosaObserver → insert Condition sekunder (komorbid DM) (pending)',
      run: () => {
        insert({ type: 'Condition', src_table: 'diagnosa_sekunder', src_id: SRC.dx2, at: ts(7, 30, 7) });
        addActivity('fa-notes-medical', 'Saat visite ditemukan komorbid → diagnosa sekunder baru (E11.9 DM tipe 2). POST Condition BARU, diagnosa lama tetap ada.');
      },
    },
    {
      phase: 'harian',
      label: 'KirimConditionJob → POST /Condition sekunder (sent)',
      run: () => {
        send((l) => l.resource_type === 'Condition' && l.source_table === 'diagnosa_sekunder', { ihs: 'cond-ranap-002', at: ts(7, 31, 7), label: 'Condition (sekunder)' });
        addActivity('fa-check', 'KirimConditionJob → POST /Condition → 201 → ihs_id = cond-ranap-002 (Encounter sama).', 'success');
      },
    },
    {
      phase: 'harian',
      label: 'TindakanObserver → insert Procedure (pending)',
      run: () => {
        insert({ type: 'Procedure', src_table: 'tindakan', src_id: SRC.proc, at: ts(8, 0, 7) });
        addActivity('fa-user-doctor', 'TindakanObserver → insert Procedure (nebulizer & fisioterapi dada). reasonReference → cond-ranap-001.');
      },
    },
    {
      phase: 'harian',
      label: 'KirimProcedureJob → POST /Procedure (sent)',
      run: () => {
        send((l) => l.resource_type === 'Procedure', { ihs: 'proc-ranap-001', at: ts(8, 1, 7), label: 'Procedure' });
        addActivity('fa-check', 'KirimProcedureJob → cek Condition sudah sent ✓ → POST /Procedure → 201 Created', 'success');
      },
    },

    // ---------- PENUNJANG LABORATORIUM ----------
    {
      phase: 'lab',
      label: 'OrderLabObserver → insert ServiceRequest lab (pending)',
      run: () => {
        insert({ type: 'ServiceRequest', src_table: 'order_lab', src_id: SRC.srlab, at: ts(6, 30, 7) });
        addActivity('fa-clipboard-check', 'OrderLabObserver → DPJP order DPL (darah perifer lengkap) untuk evaluasi infeksi. insert ServiceRequest lab.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimServiceRequestJob → POST /ServiceRequest lab (sent)',
      run: () => {
        send((l) => l.resource_type === 'ServiceRequest' && l.source_table === 'order_lab', { ihs: 'sr-lab-rn-001', at: ts(6, 31, 7), label: 'ServiceRequest (lab)' });
        addActivity('fa-check', 'KirimServiceRequestJob → POST /ServiceRequest → 201 → ihs_id = sr-lab-rn-001', 'success');
      },
    },
    {
      phase: 'lab',
      label: 'SpesimenObserver → insert Specimen (pending)',
      run: () => {
        insert({ type: 'Specimen', src_table: 'spesimen_lab', src_id: SRC.spec, at: ts(6, 40, 7) });
        addActivity('fa-vial', 'SpesimenObserver → insert Specimen (darah). request → sr-lab-rn-001.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimSpecimenJob → POST /Specimen (sent)',
      run: () => {
        send((l) => l.resource_type === 'Specimen', { ihs: 'spec-rn-001', at: ts(6, 41, 7), label: 'Specimen' });
        addActivity('fa-check', 'KirimSpecimenJob → POST /Specimen → 201 → ihs_id = spec-rn-001', 'success');
      },
    },
    {
      phase: 'lab',
      label: 'HasilLabObserver → 3 Observation hasil DPL (pending)',
      run: () => {
        const codes = [
          { code: '718-7', lbl: 'hemoglobin' },
          { code: '6690-2', lbl: 'leukosit' },
          { code: '777-3', lbl: 'trombosit' },
        ];
        codes.forEach((c) => insert({ type: 'Observation', src_table: 'hasil_lab', src_id: SRC.obslab, obs_code: `${c.code} (${c.lbl})`, at: ts(8, 30, 7) }));
        addActivity('fa-flask', 'HasilLabObserver → 3 Observation hasil DPL pending (Hb, Leukosit, Trombosit). basedOn → sr-lab-rn-001, specimen → spec-rn-001.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimObservationJob → POST /Observation lab (sent)',
      run: () => {
        const obs = logs.filter((l) => l.resource_type === 'Observation' && l.source_table === 'hasil_lab' && l.status === 'pending');
        obs.forEach((o, i) => {
          o.status = 'sent';
          o.ihs_id = `obs-lab-rn-00${i + 1}`;
          o.sent_at = ts(8, 31, 7);
          recordAttempt(o, { label: 'Observation (lab)', resourceType: 'Observation', http: 201, ihs: o.ihs_id, at: ts(8, 31, 7) });
        });
        addActivity('fa-check', 'KirimObservationJob → 3 Observation DPL → 201. Leukosit 14.5 ribu (tinggi) mendukung infeksi.', 'success');
      },
    },
    {
      phase: 'lab',
      label: 'LaporanLabObserver → insert DiagnosticReport lab (pending)',
      run: () => {
        insert({ type: 'DiagnosticReport', src_table: 'laporan_lab', src_id: SRC.drlab, at: ts(9, 0, 7) });
        addActivity('fa-file-waveform', 'LaporanLabObserver → insert DiagnosticReport lab. result → 3 Observation, basedOn → sr-lab-rn-001.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimDiagnosticReportJob → POST /DiagnosticReport lab (sent)',
      run: () => {
        send((l) => l.resource_type === 'DiagnosticReport' && l.source_table === 'laporan_lab', { ihs: 'dr-lab-rn-001', at: ts(9, 1, 7), label: 'DiagnosticReport (lab)' });
        addActivity('fa-check', 'KirimDiagnosticReportJob → POST /DiagnosticReport → 201 → ihs_id = dr-lab-rn-001', 'success');
      },
    },

    // ---------- PENUNJANG RADIOLOGI ----------
    {
      phase: 'radiologi',
      label: 'OrderRadObserver → insert ServiceRequest radiologi (pending)',
      run: () => {
        insert({ type: 'ServiceRequest', src_table: 'order_radiologi', src_id: SRC.srrad, at: ts(6, 35, 7) });
        addActivity('fa-clipboard-check', 'OrderRadObserver → DPJP order Rontgen Thorax PA. insert ServiceRequest radiologi.');
      },
    },
    {
      phase: 'radiologi',
      label: 'KirimServiceRequestJob → POST /ServiceRequest radiologi (sent)',
      run: () => {
        send((l) => l.resource_type === 'ServiceRequest' && l.source_table === 'order_radiologi', { ihs: 'sr-rad-rn-001', at: ts(6, 36, 7), label: 'ServiceRequest (rad)' });
        addActivity('fa-check', 'KirimServiceRequestJob → POST /ServiceRequest → 201 → ihs_id = sr-rad-rn-001', 'success');
      },
    },
    {
      phase: 'radiologi',
      label: 'DICOM Router → insert ImagingStudy (pending)',
      run: () => {
        insert({ type: 'ImagingStudy', src_table: 'pacs', src_id: SRC.img, at: ts(10, 0, 7) });
        addActivity('fa-x-ray', 'Modalitas → PACS → DICOM Router. ImagingStudy disiapkan DICOM Router, BUKAN SIMRS.');
      },
    },
    {
      phase: 'radiologi',
      label: 'DICOM Router → POST /ImagingStudy ke NIDR (sent)',
      run: () => {
        send((l) => l.resource_type === 'ImagingStudy', { ihs: 'imgstudy-rn-001', at: ts(10, 2, 7), label: 'ImagingStudy' });
        addActivity('fa-check', 'DICOM Router → dapat Wado URL dari NIDR → POST /ImagingStudy → 201 → ihs_id = imgstudy-rn-001', 'success');
      },
    },
    {
      phase: 'radiologi',
      label: 'BacaanRadObserver → insert Observation bacaan (pending)',
      run: () => {
        insert({ type: 'Observation', src_table: 'bacaan_radiologi', src_id: SRC.obsrad, obs_code: '18782-3 (radiology study)', at: ts(10, 30, 7) });
        addActivity('fa-notes-medical', 'BacaanRadObserver → ekspertise radiolog: tampak infiltrat paru kanan bawah. derivedFrom → imgstudy-rn-001.');
      },
    },
    {
      phase: 'radiologi',
      label: 'KirimObservationJob → POST /Observation radiologi (sent)',
      run: () => {
        send((l) => l.resource_type === 'Observation' && l.source_table === 'bacaan_radiologi', { ihs: 'obs-rad-rn-001', at: ts(10, 31, 7), label: 'Observation (rad)' });
        addActivity('fa-check', 'KirimObservationJob → POST /Observation bacaan → 201 → ihs_id = obs-rad-rn-001', 'success');
      },
    },
    {
      phase: 'radiologi',
      label: 'LaporanRadObserver → insert DiagnosticReport radiologi (pending)',
      run: () => {
        insert({ type: 'DiagnosticReport', src_table: 'laporan_radiologi', src_id: SRC.drrad, at: ts(11, 0, 7) });
        addActivity('fa-file-medical', 'LaporanRadObserver → insert DiagnosticReport radiologi. imagingStudy → imgstudy-rn-001, result → obs-rad-rn-001.');
      },
    },
    {
      phase: 'radiologi',
      label: 'KirimDiagnosticReportJob → POST /DiagnosticReport radiologi (sent)',
      run: () => {
        send((l) => l.resource_type === 'DiagnosticReport' && l.source_table === 'laporan_radiologi', { ihs: 'dr-rad-rn-001', at: ts(11, 1, 7), label: 'DiagnosticReport (rad)' });
        addActivity('fa-check', 'KirimDiagnosticReportJob → POST /DiagnosticReport → 201 → ihs_id = dr-rad-rn-001', 'success');
      },
    },

    // ---------- MUTASI BED (pindah kelas) ----------
    {
      phase: 'mutasi',
      label: 'MutasiBedObserver → insert Encounter mutasi (pending)',
      run: () => {
        insert({ type: 'Encounter', src_table: 'regpas', src_id: SRC.mutasi, enc_status: 'mutasi', at: ts(8, 0, 8) });
        addActivity('fa-bed', 'Hari ke-3 (08 Jun): pasien naik kelas ke VIP → insert baris mutasi. TIDAK buat Encounter baru, hanya update location array.');
      },
    },
    {
      phase: 'mutasi',
      label: 'KirimEncounterJob → PUT /Encounter (update location) (sent)',
      run: () => {
        send((l) => l.resource_type === 'Encounter' && l.enc_status === 'mutasi', { ihs: 'enc-ranap-2606060108', at: ts(8, 1, 8), label: 'Encounter mutasi', http: 200 });
        addActivity('fa-check', 'PUT /Encounter/enc-ranap-2606060108 → location[0] completed (Mawar 301), location[1] active (VIP 205) → 200 OK', 'success');
      },
    },

    // ---------- DISCHARGE / KEPULANGAN ----------
    {
      phase: 'discharge',
      label: 'DiagnosaObserver → insert Condition discharge (pending)',
      run: () => {
        insert({ type: 'Condition', src_table: 'diagnosa_pulang', src_id: 'DX-3399', at: ts(10, 0, 8) });
        addActivity('fa-clipboard-check', 'Pasien membaik → BLPL. insert Condition diagnosa kepulangan (J18.9 Pneumonia, clinicalStatus resolved, use: discharge).');
      },
    },
    {
      phase: 'discharge',
      label: 'KirimConditionJob → POST /Condition discharge (sent)',
      run: () => {
        send((l) => l.resource_type === 'Condition' && l.source_table === 'diagnosa_pulang', { ihs: 'cond-ranap-003', at: ts(10, 1, 8), label: 'Condition (discharge)' });
        addActivity('fa-check', 'KirimConditionJob → POST /Condition → 201 → ihs_id = cond-ranap-003. Kirim SEBELUM Composition.', 'success');
      },
    },
    {
      phase: 'discharge',
      label: 'ResumeObserver → insert Composition (resume medis) (pending)',
      run: () => {
        insert({ type: 'Composition', src_table: 'resume_medis', src_id: SRC.composition, at: ts(10, 30, 8) });
        addActivity('fa-file-lines', 'ResumeObserver → insert Composition (resume medis, LOINC 18842-5) — merangkum diagnosa, tindakan, obat, penunjang. Khas ranap.');
      },
    },
    {
      phase: 'discharge',
      label: 'KirimCompositionJob → POST /Composition (sent)',
      run: () => {
        send((l) => l.resource_type === 'Composition', { ihs: 'cmp-ranap-001', at: ts(10, 31, 8), label: 'Composition' });
        addActivity('fa-check', 'KirimCompositionJob → POST /Composition → 201 → ihs_id = cmp-ranap-001. Kirim setelah semua resource ada, sebelum Encounter finished.', 'success');
      },
    },
    {
      phase: 'discharge',
      label: 'RegpasObserver → insert Encounter finished (pending)',
      run: () => {
        insert({ type: 'Encounter', src_table: 'regpas', src_id: NOREG, enc_status: 'finished', at: ts(11, 0, 8) });
        addActivity('fa-door-open', 'RegpasObserver → insert Encounter finished. Akan PUT dengan period.end + hospitalization.dischargeDisposition (home).');
      },
    },
    {
      phase: 'discharge',
      label: 'KirimEncounterJob → PUT /Encounter finished (sent)',
      run: () => {
        send((l) => l.resource_type === 'Encounter' && l.enc_status === 'finished', { ihs: 'enc-ranap-2606060108', at: ts(11, 1, 8), label: 'Encounter finished', http: 200 });
        addActivity('fa-check', 'PUT /Encounter/enc-ranap-2606060108 (status finished, dischargeDisposition home) → 200 OK', 'success');
      },
    },
    {
      phase: 'discharge',
      label: 'KirimEpisodeOfCareJob → PUT /EpisodeOfCare finished (sent)',
      run: () => {
        insert({ type: 'EpisodeOfCare', src_table: 'episode_perawatan', src_id: SRC.eoc, enc_status: 'finished', at: ts(11, 5, 8) });
        send((l) => l.resource_type === 'EpisodeOfCare' && l.enc_status === 'finished', { ihs: 'eoc-ranap-001', at: ts(11, 6, 8), label: 'EpisodeOfCare finished', http: 200 });
        addActivity('fa-check', 'PUT /EpisodeOfCare/eoc-ranap-001 (status finished) → 200 OK', 'success');
        addActivity('fa-flag-checkered', 'Rawat inap noreg 2606060108 SELESAI (3 hari) — seluruh resource SATUSEHAT terkirim, termasuk resume medis.', 'success');
      },
    },
  ];

  const totalSteps = steps.length;

  // ---------- rendering ----------
  function renderLog() {
    const tb = page.querySelector('#log-tbody');
    if (!tb) return;
    if (!logs.length) {
      tb.innerHTML = '<tr><td colspan="11" class="sim-empty">Belum ada data — klik "Mulai simulasi" untuk menjalankan alur</td></tr>';
      return;
    }
    // encounter_status hanya untuk Encounter (ENUM arrived/in-progress/finished/cancelled).
    // EpisodeOfCare punya lifecycle sendiri → NULL; baris mutasi tetap in-progress (cuma update location).
    const encView = (r) => {
      if (r.resource_type !== 'Encounter') return null;
      return r.enc_status === 'mutasi' ? 'in-progress' : r.enc_status;
    };
    tb.innerHTML = logs.map((r) => {
      const enc = encView(r);
      return `
      <tr>
        <td class="sim-mono">${r.id}</td>
        <td style="font-weight:600;color:var(--color-text-main);">${r.resource_type}${enc ? `<br><span style="font-size:11px;font-weight:400;color:var(--color-text-muted);">${enc}</span>` : ''}</td>
        <td class="sim-mono sim-info">${r.noreg || 'NULL'}</td>
        <td class="sim-mono">${r.source_table}</td>
        <td class="sim-mono">${r.source_id}</td>
        <td style="font-size:11px;color:var(--color-text-muted);">${r.obs_code || '—'}</td>
        <td style="font-size:11px;color:var(--color-text-muted);">${enc || '—'}</td>
        <td>${statusPill(r.status)}</td>
        <td class="sim-mono" style="font-size:11px;color:var(--s-sent);">${r.ihs_id || '—'}</td>
        <td class="sim-mono" style="font-size:11px;text-align:center;">${r.retry_count || 0}</td>
        <td style="font-size:11px;color:${r.last_error ? '#c0392b' : 'var(--color-text-muted)'};">${r.last_error ? escapeHtml(r.last_error) : '—'}</td>
      </tr>
    `;
    }).join('');
  }

  function renderDetail() {
    const el = page.querySelector('#detail-body');
    if (!el) return;
    if (!details.length) {
      el.innerHTML = '<div class="sim-empty">Belum ada attempt — baris muncul di satusehat_log_detail saat job mengirim payload ke SatuSehat</div>';
      return;
    }
    el.innerHTML = details.map((d) => {
      const ok = d.response_status >= 200 && d.response_status < 300;
      return `
        <article class="sim-payload-card">
          <div class="sim-payload-head">
            <div class="sim-payload-title">
              #${d.id} ${d.resource_type}
              <span class="sim-mono">log_id: ${d.log_id || '—'} · noreg: ${d.noreg || 'NULL'} · attempt_no: ${d.attempt_no} · ${d.duration_ms} ms · ${d.created_at}</span>
              <span class="sim-payload-endpoint">${d.http_method} ${d.endpoint}</span>
            </div>
            <span class="sim-http ${ok ? 'sim-http--ok' : 'sim-http--err'}">${d.response_status}</span>
          </div>
          ${d.error_message ? `<div class="sim-payload-error"><i class="fa-solid fa-circle-exclamation"></i> error_message: ${escapeHtml(d.error_message)}</div>` : ''}
          <div class="sim-payload-grid">
            <div class="sim-payload-pane">
              <div class="sim-payload-label">request_body</div>
              <pre class="sim-payload-code">${escapeHtml(JSON.stringify(d.request_body, null, 2))}</pre>
            </div>
            <div class="sim-payload-pane">
              <div class="sim-payload-label">response_body</div>
              <pre class="sim-payload-code">${escapeHtml(JSON.stringify(d.response_body, null, 2))}</pre>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderActivity() {
    const el = page.querySelector('#activity-body');
    if (!el) return;
    if (!activityLog.length) {
      el.innerHTML = '<div class="sim-empty">Belum ada aktivitas</div>';
      return;
    }
    el.innerHTML = activityLog.map((a) => `
      <div class="sim-log-entry">
        <span class="sim-log-time">${a.time}</span>
        <span class="sim-log-text${a.color === 'success' ? ' sim-log-text--success' : a.color === 'danger' ? ' sim-log-text--danger' : ''}">
          <i class="fa-solid ${a.icon}"></i>${a.text}
        </span>
      </div>
    `).join('');
  }

  function renderStats() {
    const cnt = { sent: 0, pending: 0, failed: 0, retrying: 0 };
    logs.forEach((l) => { cnt[l.status] = (cnt[l.status] || 0) + 1; });
    const set = (id, v) => { const el = page.querySelector(id); if (el) el.textContent = v; };
    set('#cnt-sent', cnt.sent);
    set('#cnt-pending', cnt.pending);
    set('#cnt-failed', cnt.failed);
    set('#cnt-retrying', cnt.retrying || 0);
  }

  function renderPhases() {
    const el = page.querySelector('#sim-phases');
    if (!el) return;
    const nextPhase = cursor < totalSteps ? steps[cursor].phase : null;
    el.innerHTML = PHASES.map((p) => {
      const phaseSteps = steps.filter((s) => s.phase === p.key);
      const done = phaseSteps.filter((s) => steps.indexOf(s) < cursor).length;
      const total = phaseSteps.length;
      let state = 'todo';
      if (done === total) state = 'done';
      else if (done > 0 || nextPhase === p.key) state = 'active';
      return `
        <div class="sim-phase sim-phase--${state}">
          <span class="sim-phase-ic"><i class="fa-solid ${state === 'done' ? 'fa-check' : p.icon}"></i></span>
          <span class="sim-phase-txt">
            <span class="sim-phase-name">${p.label}</span>
            <span class="sim-phase-count">${done}/${total} langkah</span>
          </span>
        </div>
      `;
    }).join('');
  }

  function renderControls() {
    const fill = page.querySelector('#sim-progress-fill');
    const text = page.querySelector('#sim-progress-text');
    const nextBtn = page.querySelector('#sim-next');
    const nextLabel = page.querySelector('#sim-next-label');
    const runAllBtn = page.querySelector('#sim-run-all');
    const current = page.querySelector('#sim-current');

    if (fill) fill.style.width = `${Math.round((cursor / totalSteps) * 100)}%`;
    if (text) text.textContent = `Langkah ${cursor} dari ${totalSteps}`;

    const done = cursor >= totalSteps;
    if (nextBtn) nextBtn.disabled = done;
    if (runAllBtn) runAllBtn.disabled = done;

    if (nextLabel) {
      if (done) nextLabel.textContent = 'Selesai';
      else if (cursor === 0) nextLabel.textContent = 'Mulai simulasi';
      else nextLabel.textContent = 'Langkah berikutnya';
    }

    if (current) {
      if (done) {
        current.className = 'sim-current sim-current--done';
        current.innerHTML = '<span class="sim-current-step"><i class="fa-solid fa-circle-check"></i></span><span>Alur selesai — seluruh resource SATUSEHAT untuk kunjungan ini sudah terkirim. Klik <b>Reset</b> untuk mengulang.</span>';
      } else {
        const s = steps[cursor];
        const phase = PHASES.find((p) => p.key === s.phase);
        current.className = 'sim-current';
        current.innerHTML = `<span class="sim-current-step">${cursor + 1}/${totalSteps}</span><span><b>${phase ? phase.label : ''}</b> — ${s.label}</span>`;
      }
    }
  }

  function renderAll() {
    renderLog();
    renderDetail();
    renderActivity();
    renderStats();
    renderPhases();
    renderControls();
  }

  function runNext() {
    if (cursor >= totalSteps) return;
    steps[cursor].run();
    cursor += 1;
    renderAll();
  }

  function runAll() {
    while (cursor < totalSteps) {
      steps[cursor].run();
      cursor += 1;
    }
    renderAll();
  }

  function reset() {
    logs = [];
    details = [];
    logId = 1;
    detailId = 1;
    activityLog = [];
    cursor = 0;
    renderAll();
  }

  function showTab(tab, btn) {
    page.querySelectorAll('.sim-tab').forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    const set = (id, show) => { const el = page.querySelector(id); if (el) el.hidden = !show; };
    set('#tab-log', tab === 'log');
    set('#tab-detail', tab === 'detail');
    set('#tab-activity', tab === 'activity');
  }

  page.querySelector('#sim-next')?.addEventListener('click', runNext);
  page.querySelector('#sim-run-all')?.addEventListener('click', runAll);
  page.querySelector('#sim-reset')?.addEventListener('click', reset);

  page.querySelectorAll('.sim-tab[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab, btn));
  });

  renderAll();
}

document.addEventListener('astro:page-load', initSimulasiRanap);
