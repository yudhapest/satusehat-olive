// Shared renderer for the resource detail card shown at the bottom of every
// SATUSEHAT flow page. Keeping it in one place guarantees a consistent,
// modern look across Rajal, IGD, Ranap, Questionnaire, Immunization & Home.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getFieldIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('status')) return 'fa-clipboard-check';
  if (n.includes('intent')) return 'fa-bullseye';
  if (n.includes('class') || n.includes('type')) return 'fa-building';
  if (n.includes('subject') || n.includes('patient') || n.includes('receiver')) return 'fa-user-injured';
  if (
    n.includes('participant') || n.includes('practitioner') || n.includes('performer') ||
    n.includes('requester') || n.includes('assessor') || n.includes('recorder') || n.includes('author')
  ) return 'fa-user-doctor';
  if (n.includes('location') || n.includes('destination') || n.includes('bodysite')) return 'fa-location-dot';
  if (n.includes('period') || n.includes('date') || n.includes('time') || n.includes('when') || n.includes('onset')) return 'fa-clock';
  if (n.includes('medication')) return 'fa-pills';
  if (n.includes('dose') || n.includes('dosage') || n.includes('quantity') || n.includes('dispense')) return 'fa-prescription-bottle-medical';
  if (n.includes('specimen') || n.includes('collection') || n.includes('container')) return 'fa-vials';
  if (n.includes('observation') || n.includes('result') || n.includes('value') || n.includes('referencerange') || n.includes('interpretation')) return 'fa-vial';
  if (n.includes('modality') || n.includes('series') || n.includes('instance') || n.includes('endpoint')) return 'fa-photo-film';
  if (
    n.includes('reason') || n.includes('basedon') || n.includes('reference') || n.includes('prescription') ||
    n.includes('derivedfrom') || n.includes('request') || n.includes('imagingstudy') || n.includes('finding') ||
    n.includes('encounter') || n.includes('context') || n.includes('questionnaire') || n.includes('relationship')
  ) return 'fa-link';
  if (n.includes('code') || n.includes('category')) return 'fa-tags';
  if (n.includes('conclusion') || n.includes('summary') || n.includes('note') || n.includes('presentedform')) return 'fa-file-lines';
  return 'fa-circle-dot';
}

function getResourceIcon(title) {
  const t = title.toLowerCase();
  if (t.includes('encounter')) return 'fa-hospital-user';
  if (t.includes('allergy')) return 'fa-triangle-exclamation';
  if (t.includes('observation')) return 'fa-heart-pulse';
  if (t.includes('condition')) return 'fa-stethoscope';
  if (t.includes('procedure')) return 'fa-syringe';
  if (t.includes('medicationrequest') || t.includes('resep')) return 'fa-prescription';
  if (t.includes('medicationdispense')) return 'fa-prescription-bottle-medical';
  if (t.includes('medicationstatement')) return 'fa-tablets';
  if (t.includes('servicerequest') || t.includes('order')) return 'fa-clipboard-check';
  if (t.includes('specimen') || t.includes('sampel')) return 'fa-vial';
  if (t.includes('diagnosticreport') || t.includes('laporan')) return 'fa-file-waveform';
  if (t.includes('imagingstudy') || t.includes('dicom')) return 'fa-x-ray';
  if (t.includes('questionnaire') || t.includes('skrining') || t.includes('kajian') || t.includes('pengkajian')) return 'fa-clipboard-list';
  if (t.includes('familymemberhistory') || t.includes('keluarga')) return 'fa-people-roof';
  if (t.includes('clinicalimpression') || t.includes('soap') || t.includes('anamnesis')) return 'fa-notes-medical';
  if (t.includes('immunization') || t.includes('imunisasi') || t.includes('vaksin')) return 'fa-syringe';
  if (t.includes('episodeofcare')) return 'fa-folder-open';
  return 'fa-cube';
}

function deriveStatus(d) {
  const titleMatch = String(d.t || '').match(/\(status:\s*([^)]+)\)/i);
  if (titleMatch) return titleMatch[1].trim();
  const statusField = (d.fields || []).find((f) => f.toLowerCase().startsWith('status'));
  if (statusField) {
    const raw = statusField.split(':')[1] || '';
    const val = raw.trim().split(/[ |/(]/)[0];
    return val || null;
  }
  return null;
}

function cleanNote(note) {
  if (!note) return '';
  // Strip leading decorative markers (emoji, asterisks) since the lightbulb
  // icon already conveys "tip / warning".
  return String(note).replace(/^[\s*⚠️💡🔴🔶🆕🟢ℹ️➡️•]+/u, '').trim();
}

export function renderResourceCard(d) {
  if (!d) return '';
  const accent = d.c || '#C0392B';
  const isReq = String(d.s || '').toUpperCase().includes('WAJIB');

  const titleDisplay = escapeHtml(String(d.t || '').replace(/\s*\(status:[^)]*\)/i, '').trim());

  const status = deriveStatus(d);
  const statusBadge = status
    ? `<span class="rc__status"><span class="rc__status-dot"></span> Status: ${escapeHtml(status.charAt(0).toUpperCase() + status.slice(1))}</span>`
    : '';

  const fields = (d.fields || []).map((f) => {
    const colon = f.indexOf(':');
    if (colon > -1) {
      const name = f.slice(0, colon).trim();
      const val = f.slice(colon + 1).trim();
      return `<div class="rc-field">
          <span class="rc-field__check"><i class="fa-solid fa-circle-check"></i></span>
          <span class="rc-field__name"><i class="fa-solid ${getFieldIcon(name)}"></i> ${escapeHtml(name)}</span>
          <span class="rc-field__sep">:</span>
          <span class="rc-field__val">${escapeHtml(val)}</span>
        </div>`;
    }
    return `<div class="rc-field">
        <span class="rc-field__check"><i class="fa-solid fa-circle-check"></i></span>
        <span class="rc-field__val rc-field__val--solo">${escapeHtml(f)}</span>
      </div>`;
  }).join('');

  const note = cleanNote(d.note);
  const noteHtml = note
    ? `<div class="rc__note">
        <span class="rc__note-ic"><i class="fa-solid fa-lightbulb"></i></span>
        <p>${escapeHtml(note)}</p>
      </div>`
    : '';

  return `<article class="rc" style="--accent: ${accent};">
    <header class="rc__head">
      <div class="rc__icon"><i class="fa-solid ${getResourceIcon(d.t || '')}"></i></div>
      <div class="rc__headtext">
        <h3 class="rc__title">${titleDisplay}</h3>
        ${statusBadge}
      </div>
      <span class="rc__badge ${isReq ? 'rc__badge--req' : 'rc__badge--opt'}">
        <i class="fa-solid ${isReq ? 'fa-star' : 'fa-circle-info'}"></i> ${escapeHtml(d.s || '')}
      </span>
    </header>

    <div class="rc__meta">
      <span class="rc__pill"><i class="fa-solid fa-layer-group"></i> Fase: <b>${escapeHtml(d.phase || '-')}</b></span>
      <span class="rc__pill rc__pill--mono"><i class="fa-solid fa-arrow-right-to-bracket"></i> ${escapeHtml(d.m || '')}</span>
    </div>

    <div class="rc__banner">
      <span class="rc__banner-ic"><i class="fa-solid fa-info"></i></span>
      <p>${escapeHtml(d.desc || '')}</p>
    </div>

    <div class="rc__section">
      <span class="rc__section-ic"><i class="fa-solid fa-clipboard-list"></i></span>
      <h4>Field Penting</h4>
    </div>

    <div class="rc__fields">${fields}</div>

    ${noteHtml}
  </article>`;
}

// Wires every .rn diagram node to render its card into #info on click,
// including the click highlight + smooth scroll behaviour.
export function attachResourceCards(D, options = {}) {
  const panelId = options.panelId || 'info';
  const panel = document.getElementById(panelId);
  if (!panel) return;

  document.querySelectorAll('.rn').forEach((el) => {
    const d = D[el.dataset.id];
    if (!d) return;
    el.addEventListener('click', () => {
      document.querySelectorAll('.rn rect').forEach((r) => {
        r.style.strokeWidth = r.getAttribute('stroke-width') || '';
      });
      const rect = el.querySelector('rect');
      if (rect) rect.style.strokeWidth = '2.5px';

      panel.innerHTML = renderResourceCard(d);
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}
