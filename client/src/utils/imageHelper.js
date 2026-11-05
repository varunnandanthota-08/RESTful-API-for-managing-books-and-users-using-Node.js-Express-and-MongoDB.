// Dynamic title-specific book cover generator & image error handler

const CATEGORY_PALETTES = {
  'Fiction': { from: '#1e1b4b', to: '#4338ca', accent: '#f59e0b' },
  'Science Fiction': { from: '#022c22', to: '#0f766e', accent: '#38bdf8' },
  'Mystery': { from: '#18181b', to: '#450a0a', accent: '#f87171' },
  'Technology': { from: '#0f172a', to: '#312e81', accent: '#818cf8' },
  'Programming': { from: '#042f2e', to: '#115e59', accent: '#34d399' },
  'Artificial Intelligence': { from: '#2e1065', to: '#6b21a8', accent: '#c084fc' },
  'Data Science': { from: '#1e293b', to: '#0369a1', accent: '#38bdf8' },
  'Business': { from: '#172554', to: '#1e40af', accent: '#fbbf24' },
  'Self Improvement': { from: '#451a03', to: '#b45309', accent: '#fde047' },
  'History': { from: '#431407', to: '#7c2d12', accent: '#fdba74' },
  'Biography': { from: '#3b0764', to: '#701a75', accent: '#f472b6' },
  'Fantasy': { from: '#311042', to: '#581c87', accent: '#e879f9' }
};

const DEFAULT_PALETTE = { from: '#1e1b4b', to: '#4338ca', accent: '#c7d2fe' };

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(text, maxChars = 16, maxLines = 4) {
  if (!text) return ['PageTurn Book'];
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

export function generateTitleCoverSvg(title = 'PageTurn Book', author = 'PageTurn Edition', category = 'Literature') {
  const palette = CATEGORY_PALETTES[category] || DEFAULT_PALETTE;
  const lines = wrapTitle(title, 16, 4);
  const safeAuthor = escapeXml(author);
  const safeCategory = escapeXml((category || 'CLASSIC').toUpperCase());

  const titleLinesSvg = lines.map((line, i) => {
    const y = 160 + (i * 26);
    return `<text x="150" y="${y}" fill="#ffffff" font-family="Georgia, serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="-0.5">${escapeXml(line)}</text>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
    <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="70%" stop-color="rgba(255,255,255,0.15)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
    </linearGradient>
  </defs>

  <!-- Book Base Background -->
  <rect width="300" height="450" fill="url(#coverGrad)" rx="8" />

  <!-- Book Spine 3D Effect -->
  <rect x="0" y="0" width="22" height="450" fill="url(#spineGrad)" />
  <line x1="22" y1="0" x2="22" y2="450" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

  <!-- Embossed Outer Border Frame -->
  <rect x="36" y="24" width="238" height="402" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6" rx="4" />
  <rect x="42" y="30" width="226" height="390" fill="none" stroke="${palette.accent}" stroke-width="0.5" stroke-opacity="0.3" rx="2" />

  <!-- Category Pill at Top -->
  <rect x="70" y="48" width="160" height="20" rx="10" fill="rgba(255,255,255,0.12)" />
  <text x="150" y="62" fill="${palette.accent}" font-family="system-ui, sans-serif" font-size="9" font-weight="700" text-anchor="middle" letter-spacing="1.5">${safeCategory}</text>

  <!-- Title Lines -->
  ${titleLinesSvg}

  <!-- Separator Ornament -->
  <line x1="100" y1="285" x2="200" y2="285" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.7" />
  <polygon points="150,281 154,285 150,289 146,285" fill="${palette.accent}" />

  <!-- Author Name -->
  <text x="150" y="315" fill="rgba(255,255,255,0.75)" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="middle" letter-spacing="1.5">BY</text>
  <text x="150" y="335" fill="#ffffff" font-family="Georgia, serif" font-size="14" font-weight="600" text-anchor="middle">${safeAuthor}</text>

  <!-- PageTurn Logo Brand Badge at Bottom -->
  <circle cx="150" cy="385" r="14" fill="rgba(255,255,255,0.15)" />
  <path d="M144 382v-4a2 2 0 0 1 2-2h8v7h-8a2 2 0 0 1-2-1z" fill="none" stroke="#ffffff" stroke-width="1.5" />
  <path d="M144 388v-4a2 2 0 0 1 2-2h8v7h-8a2 2 0 0 1-2-1z" fill="none" stroke="#ffffff" stroke-width="1.5" />
  <text x="150" y="414" fill="rgba(255,255,255,0.85)" font-family="system-ui, sans-serif" font-size="9" font-weight="700" text-anchor="middle" letter-spacing="2">PAGETURN CLASSICS</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const BOOK_FALLBACK_IMAGE = generateTitleCoverSvg('PageTurn Library', 'Curated Edition', 'Bestseller');

export const handleImageError = (e) => {
  e.target.onerror = null;
  const title = e.target.getAttribute('data-title') || e.target.getAttribute('alt') || 'PageTurn Book';
  const author = e.target.getAttribute('data-author') || 'Curated Edition';
  const category = e.target.getAttribute('data-category') || 'Fiction';
  e.target.src = generateTitleCoverSvg(title, author, category);
};
