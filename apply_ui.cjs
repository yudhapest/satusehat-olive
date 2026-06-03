const fs = require('fs');

const jsTemplate = `
function getFieldIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('status')) return 'fa-clipboard-check';
  if (n.includes('class') || n.includes('type')) return 'fa-building';
  if (n.includes('subject') || n.includes('patient')) return 'fa-user-injured';
  if (n.includes('participant') || n.includes('practitioner') || n.includes('assessor') || n.includes('recorder')) return 'fa-user-doctor';
  if (n.includes('location')) return 'fa-location-dot';
  if (n.includes('period') || n.includes('date') || n.includes('time')) return 'fa-clock';
  if (n.includes('code') || n.includes('category')) return 'fa-tags';
  if (n.includes('medication')) return 'fa-pills';
  if (n.includes('observation') || n.includes('result')) return 'fa-vial';
  return 'fa-layer-group';
}

document.querySelectorAll('.rn').forEach(el => {
  const id = el.dataset.id, d = D[id];
  if (!d) return;
  el.addEventListener('click', () => {
    let statusBadge = '';
    const statusField = d.fields.find(f => f.toLowerCase().startsWith('status'));
    if (statusField) {
      let statusVal = statusField.split(':')[1].trim().split(' ')[0];
      statusBadge = \`<span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #bbf7d0;"><div style="width:6px;height:6px;border-radius:50%;background:#16a34a;"></div> Status: \${statusVal.charAt(0).toUpperCase() + statusVal.slice(1)}</span>\`;
    }

    const tags = '<div class="fields-grid">' + d.fields.map(f => {
      const colon = f.indexOf(':');
      if (colon > -1) {
        const name = f.slice(0, colon).trim();
        const val = f.slice(colon + 1).trim();
        const icon = getFieldIcon(name);
        return \`<div class="modern-field-card">
          <div class="mfc-check"><i class="fa-solid fa-check-circle"></i></div>
          <div class="mfc-name-box">
            <i class="fa-solid \${icon}"></i> <span>\${name}</span>
          </div>
          <span class="mfc-sep">:</span>
          <span class="mfc-val">\${val}</span>
        </div>\`;
      }
      return \`<div class="modern-field-card">
        <div class="mfc-check"><i class="fa-solid fa-check-circle"></i></div>
        <span class="mfc-val" style="font-weight:600; color:#1e293b;">\${f}</span>
      </div>\`;
    }).join('') + '</div>';

    // Highlight efek untuk kotak yang diklik
    document.querySelectorAll('.rn rect').forEach(r => {
      r.style.strokeWidth = r.getAttribute('stroke-width'); // reset
    });
    const rect = el.querySelector('rect');
    if (rect) rect.style.strokeWidth = '3px';

    const panel = document.getElementById('info');
    panel.innerHTML = \`
      <div class="modern-panel">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="width: 54px; height: 54px; background: \${d.c}; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-size: 26px; box-shadow: 0 4px 12px \${d.c}50; flex-shrink: 0;">
              <i class="fa-solid fa-cube"></i>
            </div>
            
            <div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px; flex-wrap: wrap;">
                <h3 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">\${d.t}</h3>
                \${statusBadge}
              </div>
              
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <span style="display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 8px; font-size: 13px; color: #475569; font-weight: 600;">
                  <i class="fa-solid fa-layer-group" style="color: \${d.c};"></i> Fase: <span style="color: #0f172a;">\${d.phase}</span>
                </span>
                <span style="display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 8px; font-size: 13px; color: #475569; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                  <i class="fa-solid fa-arrow-right-to-bracket" style="color: \${d.c};"></i> \${d.m}
                </span>
              </div>
            </div>
          </div>
          
          <div style="background: \${d.s === 'WAJIB' ? '#dc2626' : '#64748b'}; color: white; padding: 8px 16px; border-radius: 24px; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px \${d.s === 'WAJIB' ? '#dc262650' : '#64748b50'}; flex-shrink: 0; letter-spacing: 0.5px;">
            <i class="fa-solid \${d.s === 'WAJIB' ? 'fa-star' : 'fa-circle-info'}"></i> \${d.s}
          </div>
        </div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; display: flex; gap: 16px; align-items: flex-start; margin-bottom: 28px;">
          <div style="width: 24px; height: 24px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; flex-shrink: 0; margin-top: 2px; box-shadow: 0 2px 4px #3b82f640;">
            <i class="fa-solid fa-info"></i>
          </div>
          <p style="margin: 0; font-size: 14.5px; color: #1e3a8a; line-height: 1.6; font-weight: 500;">
            \${d.desc}
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 32px; height: 32px; background: #e0e7ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #4f46e5; font-size: 16px;">
            <i class="fa-solid fa-clipboard-list"></i>
          </div>
          <h4 style="margin: 0; font-size: 17px; font-weight: 800; color: #1e293b;">Field Penting</h4>
        </div>

        \${tags}

        <div style="background: #fefce8; border-radius: 12px; padding: 16px 20px; display: flex; gap: 16px; align-items: flex-start; position: relative; overflow: hidden; border: 1px solid #fef08a; margin-top: 24px;">
          <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 120px; background-image: radial-gradient(#fde047 2px, transparent 2px); background-size: 12px 12px; opacity: 0.4;"></div>
          <div style="width: 32px; height: 32px; background: #fde047; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ca8a04; font-size: 16px; flex-shrink: 0; z-index: 1;">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <p style="margin: 0; font-size: 14px; color: #854d0e; line-height: 1.6; font-weight: 500; z-index: 1; padding-top: 4px;">
            \${d.note ? d.note.replace('⚠️', '').replace('💡', '').replace('🔴', '').replace('🔶', '').trim() : ''}
          </p>
        </div>
      </div>\`;

    // Scroll smoothly to info panel
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
`;

const cssTemplate = `
/* Modern Panel Styles */
.modern-panel {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03);
  padding: 32px;
  border: 1px solid #f1f5f9;
  margin-top: 10px;
}

@media (max-width: 640px) {
  .modern-panel {
    padding: 20px;
  }
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .fields-grid {
    grid-template-columns: 1fr;
  }
}

.modern-field-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  min-width: 0; /* allows text truncation/wrapping */
}

.modern-field-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.mfc-check {
  color: #10b981;
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
}

.mfc-name-box {
  background: #f0fdf4;
  color: #1e293b;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 130px;
}

.mfc-name-box i {
  color: #3b82f6;
  font-size: 13px;
  width: 14px;
  text-align: center;
}

.mfc-sep {
  color: #94a3b8;
  font-weight: 700;
  flex-shrink: 0;
}

.mfc-val {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.4;
  word-break: break-word;
}
`;

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Replace the JS part
  const scriptStart = content.indexOf('const panel = document.getElementById');
  const scriptEndStr = '});\n});'; // where the click listener ends
  const scriptEnd = content.indexOf(scriptEndStr, scriptStart);
  
  if (scriptStart > -1 && scriptEnd > scriptStart) {
    content = content.slice(0, scriptStart) + jsTemplate + content.slice(scriptEnd + scriptEndStr.length);
  }

  // 2. Replace the CSS part
  // Before replacing CSS, make sure we only replace .fields-grid and below, up to </style>
  const cssStart = content.indexOf('.fields-grid');
  
  if (cssStart > -1) {
    const endBoundary = content.indexOf('</style>', cssStart);
    if (endBoundary > -1) {
      content = content.slice(0, cssStart) + cssTemplate + '\n' + content.slice(endBoundary);
    }
  }

  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
}

processFile('/Users/yudhairmawan/Herd/satusehat/src/pages/igd.astro');
processFile('/Users/yudhairmawan/Herd/satusehat/src/pages/ranap.astro');
processFile('/Users/yudhairmawan/Herd/satusehat/src/pages/index.astro');
processFile('/Users/yudhairmawan/Herd/satusehat/src/pages/rajal.astro');
processFile('/Users/yudhairmawan/Herd/satusehat/src/pages/immunization.astro');
processFile('/Users/yudhairmawan/Herd/satusehat/src/pages/questionnaire.astro');
