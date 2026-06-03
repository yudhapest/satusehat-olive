import fs from 'fs';
import path from 'path';

const files = ['rajal.html', 'igd.html', 'ranap.html', 'questionnaire.html', 'immunization.html'];

if (!fs.existsSync('src/pages')) {
  fs.mkdirSync('src/pages', { recursive: true });
}

files.forEach(file => {
  const content = fs.readFileSync(`legacy_html/${file}`, 'utf-8');
  
  // Extract body content
  let bodyContent = content;
  
  // Remove link stylesheet and styles (already in global.css)
  bodyContent = bodyContent.replace(/<link rel="stylesheet" href="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/font-awesome\/6.4.0\/css\/all.min.css">/g, '');
  
  // Remove font import
  bodyContent = bodyContent.replace(/@import url\('https:\/\/fonts.googleapis.com[^>]+'\);/g, '');
  
  // Find the content inside .wrap
  const wrapMatch = bodyContent.match(/<div class="wrap">([\s\S]*?)<\/script>/);
  if (!wrapMatch) {
    console.log(`Skipping ${file}, no wrap found`);
    return;
  }
  
  let htmlPartMatch = bodyContent.match(/<div class="wrap">([\s\S]*?)<script>/);
  if (!htmlPartMatch) {
    console.log(`Failed to match HTML for ${file}`);
    return;
  }
  let htmlPart = '<div class="wrap">' + htmlPartMatch[1];
  
  // Escape { and } in htmlPart to prevent Astro from evaluating them as JSX
  htmlPart = htmlPart.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
  
  // Replace showMod with showPhase in html so onclick calls the right function
  htmlPart = htmlPart.replace(/showMod/g, 'showPhase');
  
  let scriptPart = '';
  const scriptMatch = bodyContent.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    scriptPart = scriptMatch[1];
  }

  // Wrap script logic for View Transitions
  scriptPart = `
<script>
  document.addEventListener('astro:page-load', () => {
    ${scriptPart.trim()}
  });
</script>
`;

  // For Questionnaire and Immunization, replace showMod with showPhase
  scriptPart = scriptPart.replace(/function showMod/g, 'function showPhase');
  // Make showPhase global
  scriptPart = scriptPart.replace(/function showPhase\s*\((.*?)\)\s*\{/g, 'window.showPhase = function($1){');

  const pageTitle = file.replace('.html', '').toUpperCase();
  const titleMap = {
    'rajal': 'Rawat Jalan (Rajal)',
    'igd': 'IGD',
    'ranap': 'Rawat Inap (Ranap)',
    'questionnaire': 'Questionnaire',
    'immunization': 'Immunization'
  };
  const iconMap = {
    'rajal': 'fa-hospital-user',
    'igd': 'fa-truck-medical',
    'ranap': 'fa-bed-pulse',
    'questionnaire': 'fa-list-check',
    'immunization': 'fa-syringe'
  };

  const astroContent = `---
import Layout from '../layouts/Layout.astro';
---

<Layout title="${titleMap[file.replace('.html', '')]}" pageTitle="${titleMap[file.replace('.html', '')]}" icon="${iconMap[file.replace('.html', '')]}">
  ${htmlPart}
  ${scriptPart}
</Layout>

<style>
/* Scoped styles specific to diagram */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--color-border);
}

.leg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.leg-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  position: relative;
}

.leg-dot.pulse::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 50%;
  background: inherit;
  animation: pulseDot 2s infinite ease-out;
  z-index: -1;
}

@keyframes pulseDot {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}

.scroll {
  overflow-x: auto;
  padding: 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  margin-bottom: 24px;
  border: 1px solid var(--color-border);
}

#svg {
  width: 100%;
  min-width: 900px;
  height: auto;
  display: block;
}

.info {
  margin-top: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.6;
  min-height: 100px;
  box-shadow: var(--shadow-soft);
  transition: all 0.3s ease;
}

.info strong {
  color: var(--color-text-main);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.note {
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 14px;
  margin-top: 16px;
  color: #92400e;
  line-height: 1.5;
}

.tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  margin: 4px 6px 4px 0;
  color: var(--color-text-muted);
}

.hint {
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Hover effects */
.rn {
  transition: all 0.2s ease;
}
.rn:hover rect {
  stroke-width: 2px !important;
  opacity: 0.2 !important;
}

@keyframes dashAnim {
  to { stroke-dashoffset: -40; }
}
.animated-line {
  animation: dashAnim 1.5s linear infinite;
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.5);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.tab.on {
  border: 1px solid rgba(192, 57, 43, 0.2);
  background: var(--color-primary-light);
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(192, 57, 43, 0.1);
}

.header {
  display: none; /* Hide legacy header since we have Astro Layout header */
}
</style>
`;

  fs.writeFileSync('src/pages/' + file.replace('.html', '.astro'), astroContent);
  if (file === 'rajal.html') {
    fs.writeFileSync('src/pages/index.astro', astroContent);
  }
});

console.log('Migration complete');
