/** Interactive IGD flow simulation — satusehat_log with noreg as primary key.
 *  Covers the full SATUSEHAT clinical flow: registration, examination,
 *  pharmacy (Medication), and penunjang (laboratory + radiology). */

const NOREG = '2606060001';

const SRC = {
  patient: 'P-001234',
  ci: 'TRI-2201',
  vs: 'VS-5501',
  allergy: 'ALG-001',
  dx: 'DX-1201',
  proc: 'PRC-7701',
  medrq: 'RX-3301',
  meddisp: 'DSP-3301',
  srlab: 'SRL-9001',
  spec: 'SPC-4401',
  obslab: 'LAB-5501',
  drlab: 'DRL-6601',
  srrad: 'SRR-9101',
  img: 'IMG-7001',
  obsrad: 'RAD-5601',
  drrad: 'DRR-6701',
};

const PHASES = [
  { key: 'pendaftaran', label: 'Pendaftaran', icon: 'fa-id-card' },
  { key: 'pemeriksaan', label: 'Pemeriksaan & Diagnosa', icon: 'fa-stethoscope' },
  { key: 'farmasi', label: 'Farmasi / Obat', icon: 'fa-pills' },
  { key: 'lab', label: 'Penunjang Lab', icon: 'fa-vial' },
  { key: 'radiologi', label: 'Penunjang Radiologi', icon: 'fa-x-ray' },
  { key: 'selesai', label: 'Selesai', icon: 'fa-flag-checkered' },
];

function ts(h, m) {
  return `2026-06-06 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

/* Reference IDs — consistent with the simulation scenario */
const REF = {
  patient: 'Patient/N10000099',
  patientDisplay: 'Ahmad Fauzi',
  encounter: 'Encounter/enc-igd-2606060001',
  condition: 'Condition/cond-igd-001',
  practitioner: 'Practitioner/N10000001',
  practitionerDisplay: 'dr. Budi Santoso, Sp.PD',
  apoteker: 'Practitioner/N10000010',
  apotekerDisplay: 'Apt. Siti Rahayu, S.Farm',
  org: 'Organization/org-rs-001',
  orgLab: 'Organization/org-lab-001',
  srLab: 'ServiceRequest/sr-lab-001',
  srRad: 'ServiceRequest/sr-rad-001',
  specimen: 'Specimen/spec-001',
  medrq: 'MedicationRequest/medrq-igd-001',
  imaging: 'ImagingStudy/imgstudy-001',
};

/* '2026-06-06 08:31' -> '2026-06-06T08:31:00+07:00' */
function dt(value) {
  if (!value) return '2026-06-06T08:00:00+07:00';
  return `${value.replace(' ', 'T')}:00+07:00`;
}

const OBS_CATALOG = {
  '8310-5': { display: 'Body temperature', text: 'Suhu Tubuh', value: 38.5, unit: 'Cel' },
  '2708-6': { display: 'Oxygen saturation in Arterial blood', text: 'Saturasi Oksigen (SpO2)', value: 97, unit: '%' },
  '8867-4': { display: 'Heart rate', text: 'Denyut Nadi', value: 92, unit: '/min' },
  '9279-1': { display: 'Respiratory rate', text: 'Laju Pernapasan', value: 20, unit: '/min' },
  '718-7': { display: 'Hemoglobin [Mass/volume] in Blood', text: 'Hemoglobin', value: 13.5, unit: 'g/dL' },
  '6690-2': { display: 'Leukocytes [#/volume] in Blood', text: 'Leukosit', value: 9.2, unit: '10*3/uL' },
  '777-3': { display: 'Platelets [#/volume] in Blood', text: 'Trombosit', value: 250, unit: '10*3/uL' },
};

function obsCode(row) { return (row?.obs_code || '8310-5').split(' ')[0]; }

function endpointInfo(resourceType, row) {
  if (resourceType === 'Encounter' && row?.enc_status === 'finished') return { method: 'PUT', endpoint: '/Encounter/enc-igd-2606060001' };
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
        identifier: [{ use: 'official', system: 'https://fhir.kemkes.go.id/id/nik', value: '3315012505920001' }],
        active: true,
        name: [{ use: 'official', text: REF.patientDisplay }],
        gender: 'male',
        birthDate: '1992-05-25',
      };

    case 'Encounter':
      if (row?.enc_status === 'finished') {
        return {
          resourceType: 'Encounter',
          identifier: [{ system: 'http://sys-ids.kemkes.go.id/encounter/5277013', value: 'IGD-2026-0001' }],
          status: 'finished',
          class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER', display: 'emergency' },
          subject,
          participant: [{ type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }], individual: { reference: REF.practitioner, display: REF.practitionerDisplay } }],
          period: { start: '2026-06-06T08:00:00+07:00', end: dt(row?.sent_at || '2026-06-06 11:00') },
          // SATUSEHAT mewajibkan riwayat status lengkap (arrived → in-progress → finished) saat update finished
          statusHistory: [
            { status: 'arrived', period: { start: '2026-06-06T08:00:00+07:00', end: '2026-06-06T08:15:00+07:00' } },
            { status: 'in-progress', period: { start: '2026-06-06T08:15:00+07:00', end: dt(row?.sent_at || '2026-06-06 11:00') } },
            { status: 'finished', period: { start: dt(row?.sent_at || '2026-06-06 11:00') } },
          ],
          location: [{ location: { reference: 'Location/LOC-IGD-01', display: 'Instalasi Gawat Darurat' }, status: 'completed', period: { start: '2026-06-06T08:00:00+07:00', end: dt(row?.sent_at || '2026-06-06 11:00') } }],
          diagnosis: [{ condition: { reference: REF.condition, display: 'ISPA' }, use: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/diagnosis-role', code: 'DD', display: 'Discharge diagnosis' }] }, rank: 1 }],
          serviceProvider: { reference: REF.org },
        };
      }
      return {
        resourceType: 'Encounter',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/encounter/5277013', value: 'IGD-2026-0001' }],
        status: 'arrived',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER', display: 'emergency' },
        subject,
        participant: [{ type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }], individual: { reference: REF.practitioner, display: REF.practitionerDisplay } }],
        period: { start: '2026-06-06T08:00:00+07:00' },
        location: [{ location: { reference: 'Location/LOC-IGD-01', display: 'Instalasi Gawat Darurat' }, status: 'active' }],
        serviceProvider: { reference: REF.org },
        statusHistory: [{ status: 'arrived', period: { start: '2026-06-06T08:00:00+07:00' } }],
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

    case 'Condition':
      return {
        resourceType: 'Condition',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis', display: 'Encounter Diagnosis' }] }],
        code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'J06.9', display: 'Acute upper respiratory infection, unspecified' }], text: 'ISPA' },
        subject,
        encounter,
        onsetDateTime: when,
        recordedDate: when,
        recorder: { reference: REF.practitioner },
      };

    case 'Procedure':
      return {
        resourceType: 'Procedure',
        status: 'completed',
        category: { coding: [{ system: 'http://snomed.info/sct', code: '387713003', display: 'Surgical procedure' }] },
        code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-9-cm', code: '89.7', display: 'General physical examination' }], text: 'Pemeriksaan & tindakan IGD' },
        subject,
        encounter,
        performedDateTime: when,
        performer: [{ actor: { reference: REF.practitioner, display: REF.practitionerDisplay } }],
        reasonReference: [{ reference: REF.condition }],
      };

    case 'MedicationRequest':
      return {
        resourceType: 'MedicationRequest',
        contained: [{ resourceType: 'Medication', id: 'med', code: { coding: [{ system: 'http://sys-ids.kemkes.go.id/kfa', code: '93001019', display: 'Amoxicillin 500 mg Kaplet' }], text: 'Amoxicillin 500 mg Kaplet' }, status: 'active', form: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm', code: 'TAB', display: 'Tablet' }] } }],
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/prescription/5277013', value: 'RES-2026-0001-01' }],
        status: 'active',
        intent: 'order',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category', code: 'outpatient', display: 'Outpatient' }] }],
        medicationReference: { reference: '#med', display: 'Amoxicillin 500 mg Kaplet' },
        subject,
        encounter,
        authoredOn: when,
        requester: { reference: REF.practitioner, display: REF.practitionerDisplay },
        dosageInstruction: [{ text: '3 kali sehari 1 kaplet sesudah makan', timing: { repeat: { frequency: 3, period: 1, periodUnit: 'd' } }, route: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration', code: 'PO', display: 'Oral' }] } }],
        dispenseRequest: { quantity: { value: 15, unit: 'Kaplet' }, expectedSupplyDuration: { value: 5, unit: 'days', system: 'http://unitsofmeasure.org', code: 'd' } },
      };

    case 'MedicationDispense':
      return {
        resourceType: 'MedicationDispense',
        contained: [{ resourceType: 'Medication', id: 'med', code: { coding: [{ system: 'http://sys-ids.kemkes.go.id/kfa', code: '93001019', display: 'Amoxicillin 500 mg Kaplet' }] }, status: 'active' }],
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/dispensing/5277013', value: 'DISP-2026-0001' }],
        status: 'completed',
        category: { coding: [{ system: 'http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category', code: 'outpatient', display: 'Outpatient' }] },
        medicationReference: { reference: '#med', display: 'Amoxicillin 500 mg Kaplet' },
        subject,
        context: encounter,
        authorizingPrescription: [{ reference: REF.medrq }],
        quantity: { value: 15, system: 'http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm', code: 'CAP' },
        whenHandedOver: when,
        performer: [{ actor: { reference: REF.apoteker, display: REF.apotekerDisplay } }],
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
          : [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC panel - Blood by Automated count' }], text: isRad ? 'Thorax PA' : 'Darah Lengkap' },
        subject,
        encounter,
        occurrenceDateTime: when,
        authoredOn: when,
        requester: { reference: REF.practitioner, display: REF.practitionerDisplay },
        performer: [{ reference: isRad ? 'Organization/org-rad-001' : REF.orgLab, display: isRad ? 'Radiologi RSUD Pati' : 'Laboratorium RSUD Pati' }],
        reasonReference: [{ reference: REF.condition, display: 'ISPA' }],
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
          valueString: 'Cor dan pulmo dalam batas normal. Tidak tampak infiltrat maupun efusi pleura.',
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
          : [{ system: 'http://loinc.org', code: '58410-2', display: 'CBC panel - Blood by Automated count' }], text: isRad ? 'Laporan Radiologi Thorax' : 'Hasil Darah Lengkap' },
        subject,
        encounter,
        effectiveDateTime: when,
        issued: when,
        basedOn: [{ reference: isRad ? REF.srRad : REF.srLab }],
        performer: [{ reference: isRad ? 'Organization/org-rad-001' : REF.orgLab }],
        result: isRad
          ? [{ reference: 'Observation/obs-rad-001' }]
          : [{ reference: 'Observation/obs-lab-001' }, { reference: 'Observation/obs-lab-002' }, { reference: 'Observation/obs-lab-003' }],
        ...(isRad ? { imagingStudy: [{ reference: REF.imaging }] } : {}),
        conclusion: isRad ? 'Foto thorax dalam batas normal.' : 'Hasil darah lengkap dalam batas normal.',
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

    case 'ClinicalImpression':
      return {
        resourceType: 'ClinicalImpression',
        identifier: [{ system: 'http://sys-ids.kemkes.go.id/clinicalimpression/10000004', value: 'CI-IGD-2026-0001' }],
        status: 'completed',
        description: 'Triase IGD: pasien laki-laki 34 th, demam 3 hari, batuk berdahak, nyeri tenggorokan. Tidak ada sesak. Kategori triase P3 (kuning) — gawat tidak darurat.',
        subject,
        encounter,
        effectiveDateTime: when,
        assessor: { reference: REF.practitioner, display: REF.practitionerDisplay },
        summary: 'Kesan awal: ISPA. Hemodinamik stabil, tidak ada tanda kegawatan napas. Rencana rawat jalan + medikamentosa.',
        finding: [{ itemReference: { reference: REF.condition, display: 'ISPA' } }],
        investigation: [{ code: { text: 'Pemeriksaan Fisik & Tanda Vital' }, item: [{ reference: 'Observation/obs-001' }, { reference: 'Observation/obs-ret-001' }] }],
        note: [{ text: 'Plan: Amoxicillin 3x500mg 5 hari, Paracetamol 3x500mg prn demam, perbanyak minum, kontrol 5 hari bila tidak membaik.' }],
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

export function initSimulasiIgd() {
  const page = document.getElementById('sim-page');
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
      module: 'igd',
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
    // ---------- PENDAFTARAN ----------
    {
      phase: 'pendaftaran',
      label: 'PatientObserver → insert Patient (pending)',
      run: () => {
        insert({ type: 'Patient', noreg: null, src_table: 'patient', src_id: SRC.patient, at: ts(8, 0) });
        addActivity('fa-user-plus', 'PatientObserver → insert Patient ke log (status: pending). noreg NULL karena Patient belum terikat kunjungan.');
      },
    },
    {
      phase: 'pendaftaran',
      label: 'KirimPatientJob → POST /Patient (sent)',
      run: () => {
        send((l) => l.resource_type === 'Patient', { ihs: 'N10000099', at: ts(8, 1), label: 'Patient' });
        addActivity('fa-check', 'KirimPatientJob → GET /Patient by NIK → tidak ditemukan → POST /Patient → 201 Created', 'success');
        addActivity('fa-database', 'satusehat_log Patient: pending → sent, ihs_id = N10000099', 'success');
      },
    },
    {
      phase: 'pendaftaran',
      label: 'RegpasObserver → insert Encounter arrived (pending)',
      run: () => {
        insert({ type: 'Encounter', src_table: 'regpas', src_id: NOREG, enc_status: 'arrived', at: ts(8, 1) });
        addActivity('fa-calendar-plus', 'RegpasObserver → insert Encounter arrived ke log (status: pending)');
      },
    },
    {
      phase: 'pendaftaran',
      label: 'KirimEncounterJob → POST /Encounter (sent)',
      run: () => {
        send((l) => l.resource_type === 'Encounter' && l.enc_status === 'arrived', { ihs: 'enc-igd-2606060001', at: ts(8, 2), label: 'Encounter' });
        addActivity('fa-check', 'KirimEncounterJob → cek Patient ihs_id = N10000099 ✓ → POST /Encounter → 201 Created', 'success');
        addActivity('fa-database', 'Encounter arrived: pending → sent, ihs_id = enc-igd-2606060001', 'success');
      },
    },

    // ---------- PEMERIKSAAN & DIAGNOSA ----------
    {
      phase: 'pemeriksaan',
      label: 'TriaseObserver → insert ClinicalImpression triase (pending)',
      run: () => {
        insert({ type: 'ClinicalImpression', src_table: 'triase', src_id: SRC.ci, at: ts(8, 5) });
        addActivity('fa-notes-medical', 'TriaseObserver → insert ClinicalImpression triase ke log. Di IGD WAJIB karena memuat kategori kegawatan (P1–P4) — beda dari rajal/ranap yang opsional.');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'KirimClinicalImpressionJob → POST /ClinicalImpression (sent)',
      run: () => {
        send((l) => l.resource_type === 'ClinicalImpression', { ihs: 'ci-igd-001', at: ts(8, 6), label: 'ClinicalImpression (triase)' });
        addActivity('fa-check', 'KirimClinicalImpressionJob → cek Encounter sudah sent ✓ → POST /ClinicalImpression → 201 Created → ihs_id = ci-igd-001', 'success');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'VitalSignObserver → 5 Observation vital (pending)',
      run: () => {
        const codes = [
          { code: '8310-5', lbl: 'suhu' },
          { code: '55284-5', lbl: 'tekanan darah' },
          { code: '2708-6', lbl: 'saturasi' },
          { code: '8867-4', lbl: 'nadi' },
          { code: '9279-1', lbl: 'respirasi' },
        ];
        codes.forEach((c) => insert({ type: 'Observation', src_table: 'vitalsign', src_id: SRC.vs, obs_code: `${c.code} (${c.lbl})`, at: ts(8, 30) }));
        addActivity('fa-heart-pulse', 'VitalSignObserver → 1 baris vitalsign dipecah jadi 5 Observation pending di log');
        addActivity('fa-circle-info', `noreg = ${NOREG}, source_table = vitalsign, source_id = ${SRC.vs}`);
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'KirimObservationJob → 2 gagal (422), 3 sent',
      run: () => {
        const obs = logs.filter((l) => l.resource_type === 'Observation' && l.source_table === 'vitalsign' && l.status === 'pending');
        if (obs[0]) obs[0].status = 'failed';
        if (obs[1]) obs[1].status = 'failed';
        recordAttempt(obs[0], { label: 'Observation (suhu)', resourceType: 'Observation', http: 422, error: 'Invalid LOINC code 8310-9', at: ts(8, 31) });
        recordAttempt(obs[1], { label: 'Observation (tek.darah)', resourceType: 'Observation', http: 422, error: 'component required for blood pressure', at: ts(8, 31) });
        addActivity('fa-xmark', 'KirimObservationJob → suhu gagal: kode LOINC salah (8310-9 harusnya 8310-5)', 'danger');
        addActivity('fa-xmark', 'KirimObservationJob → tekanan darah gagal: harus pakai component, bukan valueQuantity', 'danger');
        const rem = logs.filter((l) => l.resource_type === 'Observation' && l.source_table === 'vitalsign' && l.status === 'pending');
        rem.forEach((o, i) => {
          o.status = 'sent';
          o.ihs_id = `obs-00${String(i + 1).padStart(3, '0')}`;
          o.sent_at = ts(8, 31);
          recordAttempt(o, { label: 'Observation', resourceType: 'Observation', http: 201, ihs: o.ihs_id, at: ts(8, 31) });
        });
        addActivity('fa-check', '3 Observation lainnya (saturasi, nadi, respirasi) → sent', 'success');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'RetryService → 2 Observation retry (sent)',
      run: () => {
        const failed = logs.filter((l) => l.resource_type === 'Observation' && l.status === 'failed');
        failed.forEach((o, i) => {
          o.status = 'sent';
          o.ihs_id = `obs-ret-00${i + 1}`;
          o.sent_at = ts(8, 45);
          recordAttempt(o, { label: 'Observation (retry)', resourceType: 'Observation', attempt: 2, http: 201, ihs: o.ihs_id, at: ts(8, 45) });
        });
        addActivity('fa-rotate-right', 'RetryService (tiap 15 menit) → dispatch ulang 2 Observation yang failed');
        addActivity('fa-check', 'Retry berhasil → suhu dan tekanan darah sekarang status: sent (attempt 2)', 'success');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'AlergiObserver → insert AllergyIntolerance (pending)',
      run: () => {
        insert({ type: 'AllergyIntolerance', src_table: 'alergi', src_id: SRC.allergy, at: ts(8, 35) });
        addActivity('fa-triangle-exclamation', 'AlergiObserver → insert AllergyIntolerance ke log. Tidak ada alergi → pakai kode NKA (716186003).');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'KirimAllergyJob → POST /AllergyIntolerance (sent)',
      run: () => {
        send((l) => l.resource_type === 'AllergyIntolerance', { ihs: 'alg-igd-001', at: ts(8, 36), label: 'AllergyIntolerance' });
        addActivity('fa-check', 'KirimAllergyJob → POST /AllergyIntolerance (NKA) → 201 Created → ihs_id = alg-igd-001', 'success');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'DiagnosaObserver → insert Condition (pending)',
      run: () => {
        insert({ type: 'Condition', src_table: 'diagnosa', src_id: SRC.dx, at: ts(9, 0) });
        addActivity('fa-stethoscope', 'DiagnosaObserver → insert Condition J06.9 (ISPA) ke log (status: pending)');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'KirimConditionJob → POST /Condition (sent)',
      run: () => {
        send((l) => l.resource_type === 'Condition', { ihs: 'cond-igd-001', at: ts(9, 1), label: 'Condition' });
        addActivity('fa-check', 'KirimConditionJob → POST /Condition → 201 Created → ihs_id = cond-igd-001', 'success');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'TindakanObserver → insert Procedure (pending)',
      run: () => {
        insert({ type: 'Procedure', src_table: 'tindakan', src_id: SRC.proc, at: ts(9, 10) });
        addActivity('fa-syringe', 'TindakanObserver → insert Procedure (ICD-9-CM) ke log. reasonReference → Condition cond-igd-001.');
      },
    },
    {
      phase: 'pemeriksaan',
      label: 'KirimProcedureJob → POST /Procedure (sent)',
      run: () => {
        send((l) => l.resource_type === 'Procedure', { ihs: 'proc-igd-001', at: ts(9, 11), label: 'Procedure' });
        addActivity('fa-check', 'KirimProcedureJob → cek Condition sudah sent ✓ → POST /Procedure → 201 Created', 'success');
      },
    },

    // ---------- FARMASI / OBAT ----------
    {
      phase: 'farmasi',
      label: 'ResepObserver → insert MedicationRequest (pending)',
      run: () => {
        insert({ type: 'MedicationRequest', src_table: 'resep', src_id: SRC.medrq, at: ts(9, 30) });
        addActivity('fa-prescription', 'ResepObserver → insert MedicationRequest (e-resep) ke log (status: pending)');
        addActivity('fa-capsules', 'Medication (kode KFA) dikirim di dalam MedicationRequest.contained — TIDAK di-POST terpisah.');
      },
    },
    {
      phase: 'farmasi',
      label: 'KirimMedicationRequestJob → POST /MedicationRequest (sent)',
      run: () => {
        send((l) => l.resource_type === 'MedicationRequest', { ihs: 'medrq-igd-001', at: ts(9, 31), label: 'MedicationRequest' });
        addActivity('fa-check', 'KirimMedicationRequestJob → POST /MedicationRequest (+ Medication contained) → 201 Created', 'success');
      },
    },
    {
      phase: 'farmasi',
      label: 'PenyerahanObatObserver → insert MedicationDispense (pending)',
      run: () => {
        insert({ type: 'MedicationDispense', src_table: 'penyerahan_obat', src_id: SRC.meddisp, at: ts(10, 0) });
        addActivity('fa-prescription-bottle-medical', 'PenyerahanObatObserver → insert MedicationDispense ke log saat obat diserahkan ke pasien.');
      },
    },
    {
      phase: 'farmasi',
      label: 'KirimMedicationDispenseJob → POST /MedicationDispense (sent)',
      run: () => {
        send((l) => l.resource_type === 'MedicationDispense', { ihs: 'meddisp-igd-001', at: ts(10, 1), label: 'MedicationDispense' });
        addActivity('fa-check', 'KirimMedicationDispenseJob → authorizingPrescription = medrq-igd-001 ✓ → POST → 201 Created', 'success');
      },
    },

    // ---------- PENUNJANG LABORATORIUM ----------
    {
      phase: 'lab',
      label: 'OrderLabObserver → insert ServiceRequest lab (pending)',
      run: () => {
        insert({ type: 'ServiceRequest', src_table: 'order_lab', src_id: SRC.srlab, at: ts(9, 15) });
        addActivity('fa-clipboard-check', 'OrderLabObserver → insert ServiceRequest lab (panel darah lengkap) ke log.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimServiceRequestJob → POST /ServiceRequest lab (sent)',
      run: () => {
        send((l) => l.resource_type === 'ServiceRequest' && l.source_table === 'order_lab', { ihs: 'sr-lab-001', at: ts(9, 16), label: 'ServiceRequest (lab)' });
        addActivity('fa-check', 'KirimServiceRequestJob → POST /ServiceRequest → 201 → ihs_id = sr-lab-001', 'success');
      },
    },
    {
      phase: 'lab',
      label: 'SpesimenObserver → insert Specimen (pending)',
      run: () => {
        insert({ type: 'Specimen', src_table: 'spesimen_lab', src_id: SRC.spec, at: ts(9, 20) });
        addActivity('fa-vial', 'SpesimenObserver → insert Specimen (darah) ke log. request → ServiceRequest sr-lab-001.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimSpecimenJob → POST /Specimen (sent)',
      run: () => {
        send((l) => l.resource_type === 'Specimen', { ihs: 'spec-001', at: ts(9, 21), label: 'Specimen' });
        addActivity('fa-check', 'KirimSpecimenJob → POST /Specimen → 201 Created → ihs_id = spec-001', 'success');
      },
    },
    {
      phase: 'lab',
      label: 'HasilLabObserver → 3 Observation hasil lab (pending)',
      run: () => {
        const codes = [
          { code: '718-7', lbl: 'hemoglobin' },
          { code: '6690-2', lbl: 'leukosit' },
          { code: '777-3', lbl: 'trombosit' },
        ];
        codes.forEach((c) => insert({ type: 'Observation', src_table: 'hasil_lab', src_id: SRC.obslab, obs_code: `${c.code} (${c.lbl})`, at: ts(9, 50) }));
        addActivity('fa-flask', 'HasilLabObserver → 3 Observation hasil lab pending (Hb, leukosit, trombosit). basedOn → sr-lab-001, specimen → spec-001.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimObservationJob → POST /Observation lab (sent)',
      run: () => {
        const obs = logs.filter((l) => l.resource_type === 'Observation' && l.source_table === 'hasil_lab' && l.status === 'pending');
        obs.forEach((o, i) => {
          o.status = 'sent';
          o.ihs_id = `obs-lab-00${i + 1}`;
          o.sent_at = ts(9, 51);
          recordAttempt(o, { label: 'Observation (lab)', resourceType: 'Observation', http: 201, ihs: o.ihs_id, at: ts(9, 51) });
        });
        addActivity('fa-check', 'KirimObservationJob → 3 Observation hasil lab → 201 Created', 'success');
      },
    },
    {
      phase: 'lab',
      label: 'LaporanLabObserver → insert DiagnosticReport lab (pending)',
      run: () => {
        insert({ type: 'DiagnosticReport', src_table: 'laporan_lab', src_id: SRC.drlab, at: ts(10, 5) });
        addActivity('fa-file-waveform', 'LaporanLabObserver → insert DiagnosticReport lab. result → 3 Observation, basedOn → sr-lab-001.');
      },
    },
    {
      phase: 'lab',
      label: 'KirimDiagnosticReportJob → POST /DiagnosticReport lab (sent)',
      run: () => {
        send((l) => l.resource_type === 'DiagnosticReport' && l.source_table === 'laporan_lab', { ihs: 'dr-lab-001', at: ts(10, 6), label: 'DiagnosticReport (lab)' });
        addActivity('fa-check', 'KirimDiagnosticReportJob → POST /DiagnosticReport → 201 → ihs_id = dr-lab-001', 'success');
      },
    },

    // ---------- PENUNJANG RADIOLOGI ----------
    {
      phase: 'radiologi',
      label: 'OrderRadObserver → insert ServiceRequest radiologi (pending)',
      run: () => {
        insert({ type: 'ServiceRequest', src_table: 'order_radiologi', src_id: SRC.srrad, at: ts(9, 25) });
        addActivity('fa-clipboard-check', 'OrderRadObserver → insert ServiceRequest radiologi (Thorax PA) ke log.');
      },
    },
    {
      phase: 'radiologi',
      label: 'KirimServiceRequestJob → POST /ServiceRequest radiologi (sent)',
      run: () => {
        send((l) => l.resource_type === 'ServiceRequest' && l.source_table === 'order_radiologi', { ihs: 'sr-rad-001', at: ts(9, 26), label: 'ServiceRequest (rad)' });
        addActivity('fa-check', 'KirimServiceRequestJob → POST /ServiceRequest → 201 → ihs_id = sr-rad-001', 'success');
      },
    },
    {
      phase: 'radiologi',
      label: 'DICOM Router → insert ImagingStudy (pending)',
      run: () => {
        insert({ type: 'ImagingStudy', src_table: 'pacs', src_id: SRC.img, at: ts(10, 10) });
        addActivity('fa-x-ray', 'Modalitas → PACS → DICOM Router. ImagingStudy disiapkan oleh DICOM Router, BUKAN dari SIMRS.');
      },
    },
    {
      phase: 'radiologi',
      label: 'DICOM Router → POST /ImagingStudy ke NIDR (sent)',
      run: () => {
        send((l) => l.resource_type === 'ImagingStudy', { ihs: 'imgstudy-001', at: ts(10, 12), label: 'ImagingStudy' });
        addActivity('fa-check', 'DICOM Router → dapat Wado URL dari NIDR → POST /ImagingStudy → 201 → ihs_id = imgstudy-001', 'success');
      },
    },
    {
      phase: 'radiologi',
      label: 'BacaanRadObserver → insert Observation bacaan (pending)',
      run: () => {
        insert({ type: 'Observation', src_table: 'bacaan_radiologi', src_id: SRC.obsrad, obs_code: '18782-3 (radiology study)', at: ts(10, 30) });
        addActivity('fa-notes-medical', 'BacaanRadObserver → insert Observation bacaan radiologi. derivedFrom → imgstudy-001.');
      },
    },
    {
      phase: 'radiologi',
      label: 'KirimObservationJob → POST /Observation radiologi (sent)',
      run: () => {
        send((l) => l.resource_type === 'Observation' && l.source_table === 'bacaan_radiologi', { ihs: 'obs-rad-001', at: ts(10, 31), label: 'Observation (rad)' });
        addActivity('fa-check', 'KirimObservationJob → POST /Observation bacaan → 201 → ihs_id = obs-rad-001', 'success');
      },
    },
    {
      phase: 'radiologi',
      label: 'LaporanRadObserver → insert DiagnosticReport radiologi (pending)',
      run: () => {
        insert({ type: 'DiagnosticReport', src_table: 'laporan_radiologi', src_id: SRC.drrad, at: ts(10, 40) });
        addActivity('fa-file-medical', 'LaporanRadObserver → insert DiagnosticReport radiologi. imagingStudy → imgstudy-001, result → obs-rad-001.');
      },
    },
    {
      phase: 'radiologi',
      label: 'KirimDiagnosticReportJob → POST /DiagnosticReport radiologi (sent)',
      run: () => {
        send((l) => l.resource_type === 'DiagnosticReport' && l.source_table === 'laporan_radiologi', { ihs: 'dr-rad-001', at: ts(10, 41), label: 'DiagnosticReport (rad)' });
        addActivity('fa-check', 'KirimDiagnosticReportJob → POST /DiagnosticReport → 201 → ihs_id = dr-rad-001', 'success');
      },
    },

    // ---------- SELESAI ----------
    {
      phase: 'selesai',
      label: 'RegpasObserver → insert Encounter finished (pending)',
      run: () => {
        insert({ type: 'Encounter', src_table: 'regpas', src_id: NOREG, enc_status: 'finished', at: ts(11, 0) });
        addActivity('fa-door-open', 'RegpasObserver → status pasien berubah pulang → insert Encounter finished ke log (pending)');
        addActivity('fa-circle-info', 'Job akan PUT /Encounter/enc-igd-2606060001 dengan status finished + diagnosis reference');
      },
    },
    {
      phase: 'selesai',
      label: 'KirimEncounterJob → PUT /Encounter finished (sent)',
      run: () => {
        send((l) => l.resource_type === 'Encounter' && l.enc_status === 'finished', { ihs: 'enc-igd-2606060001', at: ts(11, 1), label: 'Encounter finished', http: 200 });
        addActivity('fa-check', 'KirimEncounterJob → ambil ihs_id dari baris arrived yang sudah sent', 'success');
        addActivity('fa-check', 'PUT /Encounter/enc-igd-2606060001 (status: finished, diagnosis: cond-igd-001) → 200 OK', 'success');
        addActivity('fa-flag-checkered', 'Kunjungan noreg 2606060001 SELESAI — semua resource terkirim ke SatuSehat', 'success');
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
    tb.innerHTML = logs.map((r) => `
      <tr>
        <td class="sim-mono">${r.id}</td>
        <td style="font-weight:600;color:var(--color-text-main);">${r.resource_type}${r.enc_status ? `<br><span style="font-size:11px;font-weight:400;color:var(--color-text-muted);">${r.enc_status}</span>` : ''}</td>
        <td class="sim-mono sim-info">${r.noreg || 'NULL'}</td>
        <td class="sim-mono">${r.source_table}</td>
        <td class="sim-mono">${r.source_id}</td>
        <td style="font-size:11px;color:var(--color-text-muted);">${r.obs_code || '—'}</td>
        <td style="font-size:11px;color:var(--color-text-muted);">${r.enc_status || '—'}</td>
        <td>${statusPill(r.status)}</td>
        <td class="sim-mono" style="font-size:11px;color:var(--s-sent);">${r.ihs_id || '—'}</td>
        <td class="sim-mono" style="font-size:11px;text-align:center;">${r.retry_count || 0}</td>
        <td style="font-size:11px;color:${r.last_error ? '#c0392b' : 'var(--color-text-muted)'};">${r.last_error ? escapeHtml(r.last_error) : '—'}</td>
      </tr>
    `).join('');
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

document.addEventListener('astro:page-load', initSimulasiIgd);
