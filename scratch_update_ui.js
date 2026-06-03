const fs = require('fs');
const path = require('path');

const files = [
  'igd.astro',
  'immunization.astro',
  'index.astro',
  'questionnaire.astro',
  'rajal.astro',
  'ranap.astro'
];

const jsTarget = `    const tags=d.fields.map(f=>\`<span class="tag"><i class="fa-solid fa-check" style="color: #64748b;"></i> \${f}</span>\`).join('');
    
    // Highlight efek untuk kotak yang diklik
    document.querySelectorAll('.rn rect').forEach(r => {
      r.style.strokeWidth = r.getAttribute('stroke-width'); // reset
    });
    const rect = el.querySelector('rect');
    if (rect) rect.style.strokeWidth = '2px';
    
    panel.innerHTML=\`<strong><i class="fa-solid fa-file-code" style="color: \${d.c}"></i> \${d.t}</strong>
      <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="background:\${d.c};color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;"><i class="fa-solid fa-circle-exclamation"></i> \${d.s}</span>
        <span style="color:var(--color-text-tertiary);font-size:12px;font-weight:500;"><i class="fa-solid fa-layer-group"></i> Fase: \${d.phase}</span>
        <span style="color:var(--color-text-tertiary);font-size:12px;font-weight:500;">|</span>
        <span style="color:var(--color-text-tertiary);font-size:12px;font-weight:500;"><i class="fa-solid fa-network-wired"></i> \${d.m}</span>
      </div>
      <div style="margin:12px 0 16px;font-size:14px;color:var(--color-text-secondary); line-height: 1.6;">\${d.desc}</div>
      <div style="margin-bottom:12px">\${tags}</div>
      <div class="note-box" style="border-left-color:\${d.c}"><i class="fa-solid fa-lightbulb"></i> \${d.note}</div>\`;`;

const jsReplacement = `    const tags = '<div class="fields-grid">' + d.fields.map(f => {
      const parts = f.split(':');
      if (parts.length > 1) {
        return \\\`<div class="field-item">
          <div class="field-icon"><i class="fa-solid fa-check-circle"></i></div>
          <div class="field-content">
            <span class="field-name">\\\${parts[0].trim()}</span>
            <span class="field-value">\\\${parts.slice(1).join(':').trim()}</span>
          </div>
        </div>\\\`;
      }
      return \\\`<div class="field-item">
        <div class="field-icon"><i class="fa-solid fa-check-circle"></i></div>
        <div class="field-content">
          <span class="field-value">\\\${f}</span>
        </div>
      </div>\\\`;
    }).join('') + '</div>';
    
    // Highlight efek untuk kotak yang diklik
    document.querySelectorAll('.rn rect').forEach(r => {
      r.style.strokeWidth = r.getAttribute('stroke-width'); // reset
    });
    const rect = el.querySelector('rect');
    if (rect) rect.style.strokeWidth = '2px';
    
    panel.innerHTML=\\\`
      <div class="info-header" style="border-bottom: 2px solid \\\${d.c}; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
          <strong style="margin-bottom: 0;"><i class="fa-solid fa-file-code" style="color: \\\${d.c}"></i> \\\${d.t}</strong>
          <span class="badge" style="background:\\\${d.c}; color:#fff; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600; white-space:nowrap;"><i class="fa-solid fa-circle-exclamation"></i> \\\${d.s}</span>
        </div>
        <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: var(--color-text-secondary);">
          <span><i class="fa-solid fa-layer-group" style="color: var(--color-text-muted);"></i> Fase: <b style="color: var(--color-text-main);">\\\${d.phase}</b></span>
          <span><i class="fa-solid fa-network-wired" style="color: var(--color-text-muted);"></i> Endpoint: <b style="color: var(--color-text-main); font-family: monospace;">\\\${d.m}</b></span>
        </div>
      </div>
      <div style="margin:0 0 20px; font-size:14px; color:var(--color-text-secondary); line-height: 1.6;">\\\${d.desc}</div>
      <div class="fields-section">
        <h4 style="margin: 0 0 12px; font-size: 14px; color: var(--color-text-main); font-weight: 600;">Atribut Mandatory & Penting</h4>
        \\\${tags}
      </div>
      <div class="note-box" style="border-left-color:\\\${d.c};">
        <i class="fa-solid fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i>
        <span>\\\${d.note}</span>
      </div>\\\`;`;

const cssTargetRegex = /\.note \{[\s\S]*?\}\s*\.tag \{[\s\S]*?\}/;

const cssReplacement = `.note-box {
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 14px;
  margin-top: 20px;
  color: #92400e;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.field-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: white;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}

.field-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.04);
}

.field-icon {
  color: #10b981;
  font-size: 14px;
  margin-top: 2px;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-main);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 4px;
  width: fit-content;
  border: 1px solid #e2e8f0;
}

.field-value {
  font-size: 13.5px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}`;

let successCount = 0;

for (const file of files) {
  const filePath = path.join('/Users/yudhairmawan/Herd/satusehat/src/pages', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace JS
    if (content.includes(jsTarget)) {
      content = content.replace(jsTarget, jsReplacement);
    } else {
      console.log(\`Warning: JS target not found in \${file}\`);
    }

    // Replace CSS
    if (cssTargetRegex.test(content)) {
      content = content.replace(cssTargetRegex, cssReplacement);
    } else {
      console.log(\`Warning: CSS target not found in \${file}\`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    successCount++;
    console.log(\`Updated \${file}\`);
  }
}

console.log(\`Completed updating \${successCount} files.\`);
