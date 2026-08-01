import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = new URL(".", import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const W = 1920;
const H = 1080;

const slides = [
  {
    id: "01-title",
    eyebrow: "huzlr",
    title: "Management for the Age of AI",
    subtitle: "A new generation of work demands a new generation of management.",
    visual: "hero",
  },
  {
    id: "02-evolution",
    title: "Organizations Are Evolving.",
    subtitle: "The workforce itself has fundamentally changed.",
    visual: "evolution",
  },
  {
    id: "03-break",
    title: "Hybrid Organizations Break Existing Management.",
    body: [
      "Today's enterprise software was designed to coordinate humans.",
      "Tomorrow's organizations coordinate:",
    ],
    bullets: ["Humans", "AI Workers", "Enterprise Systems"],
    footer: "At the same time. That operating model doesn't exist today.",
    visual: "triad",
  },
  {
    id: "04-missing-layer",
    title: "The Missing Enterprise Layer",
    body: ["Organizations already have:"],
    bullets: ["Systems of Record", "Systems of Communication", "Systems of Planning"],
    footer: "But they lack a System of Execution. Execution remains fragmented across people, tools and meetings.",
    visual: "layers",
  },
  {
    id: "05-meet",
    title: "Meet huzlr",
    subtitle: "The System of Execution for Hybrid Organizations.",
    body: ["Built on two foundational innovations."],
    visual: "foundations",
  },
  {
    id: "06-now",
    title: "Why Now",
    body: [
      "AI workers are becoming part of every enterprise.",
      "As organizations become hybrid, coordination complexity grows exponentially.",
      "Every additional AI worker increases the need for orchestration.",
    ],
    footer: "The demand for a System of Execution becomes inevitable.",
    visual: "growth",
  },
  {
    id: "07-market",
    title: "Market Opportunity",
    bullets: ["Enterprise AI.", "Digital Transformation.", "Workflow Automation.", "Operational Intelligence."],
    footer: "These markets are converging into something larger: Management Infrastructure for Hybrid Organizations. Huzlr is building that infrastructure.",
    visual: "market",
  },
  {
    id: "08-vision",
    title: "Vision",
    body: [
      "Every company will become a hybrid organization.",
      "Every hybrid organization will require a System of Execution.",
      "Just as every modern enterprise relies on Systems of Record, every AI-native enterprise will rely on a System of Execution.",
    ],
    footer: "huzlr is building that future.",
    visual: "vision",
  },
];

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function tspans(lines, x, y, size, gap, weight = 400, color = "#d9e3ee") {
  return lines
    .map((line, i) => `<text x="${x}" y="${y + i * gap}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`)
    .join("\n");
}

function wrapText(text, max = 74) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function logo() {
  return `<text x="110" y="132" font-family="'Open Sans', Arial, sans-serif" font-size="84" font-weight="700" fill="#f8fbff">h</text>`;
}

function bg() {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#08111f"/>
      <stop offset="0.48" stop-color="#101a26"/>
      <stop offset="1" stop-color="#182319"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5fe1c8"/>
      <stop offset="1" stop-color="#f0c45a"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1650" cy="180" r="210" fill="#2e6f78" opacity="0.18" filter="url(#soft)"/>
  <circle cx="1500" cy="930" r="260" fill="#8a7932" opacity="0.16" filter="url(#soft)"/>
  <path d="M0 914 C350 790 650 1030 1010 880 C1325 750 1600 760 1920 650 L1920 1080 L0 1080 Z" fill="#ffffff" opacity="0.035"/>
  <g opacity="0.16" stroke="#c6d5df" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${240 + i * 135}" y1="0" x2="${-90 + i * 135}" y2="1080"/>`).join("")}
  </g>`;
}

function titleBlock(s, y = 330) {
  const sub = s.subtitle ? `<text x="150" y="${y + 132}" font-size="42" fill="#b9c6cf">${esc(s.subtitle)}</text>` : "";
  return `<text x="150" y="${y}" font-size="76" font-weight="750" fill="#f8fbff">${esc(s.title)}</text>${sub}`;
}

function chip(x, y, text) {
  return `<rect x="${x}" y="${y}" width="420" height="90" rx="18" fill="#f8fbff" opacity="0.08" stroke="#f8fbff" stroke-opacity="0.16"/>
  <text x="${x + 34}" y="${y + 57}" font-size="32" font-weight="650" fill="#f8fbff">${esc(text)}</text>`;
}

function visual(type) {
  if (type === "hero") return `<g transform="translate(1240 315)"><circle cx="210" cy="210" r="190" fill="none" stroke="url(#accent)" stroke-width="3" opacity="0.7"/><circle cx="210" cy="210" r="82" fill="url(#accent)" opacity="0.28"/><g stroke="#f8fbff" stroke-opacity="0.42" stroke-width="2">${[0,60,120,180,240,300].map(a=>`<line x1="210" y1="210" x2="${210+Math.cos(a*Math.PI/180)*275}" y2="${210+Math.sin(a*Math.PI/180)*275}"/>`).join("")}</g>${[0,60,120,180,240,300].map(a=>`<circle cx="${210+Math.cos(a*Math.PI/180)*275}" cy="${210+Math.sin(a*Math.PI/180)*275}" r="20" fill="#f0c45a"/>`).join("")}</g>`;
  if (type === "evolution") return `<g transform="translate(150 300)">${["Industrial Age","Digital Age","Connected Enterprise","AI-Native Hybrid Organizations"].map((t,i)=>`${chip(0+i*430,0,t)}${i<3?`<text x="${393+i*430}" y="57" font-size="42" fill="#5fe1c8">→</text>`:""}`).join("")}</g>`;
  if (type === "triad") return `<g transform="translate(1240 270)">${chip(0,0,"Humans")}${chip(220,175,"AI Workers")}${chip(0,350,"Enterprise Systems")}<path d="M210 90 L430 220 L210 395 Z" fill="none" stroke="url(#accent)" stroke-width="5" opacity="0.8"/></g>`;
  if (type === "layers") return `<g transform="translate(1160 250)">${["Systems of Record","Systems of Communication","Systems of Planning","System of Execution"].map((t,i)=>`<rect x="${i*42}" y="${i*110}" width="560" height="88" rx="16" fill="${i===3?"url(#accent)":"#f8fbff"}" opacity="${i===3?"0.86":"0.08"}"/><text x="${i*42+32}" y="${i*110+56}" font-size="30" font-weight="650" fill="${i===3?"#08111f":"#f8fbff"}">${t}</text>`).join("")}</g>`;
  if (type === "foundations") return `<g transform="translate(1040 250)">${chip(0,0,"Agent Experiences")}<text x="34" y="138" font-size="26" fill="#b9c6cf">Outcomes compound into expertise.</text>${chip(0,260,"Management Harness")}<text x="34" y="398" font-size="26" fill="#b9c6cf">Orchestrates AI, people and systems.</text></g>`;
  if (type === "growth") return `<g transform="translate(1110 260)" fill="none" stroke-width="5"><path d="M0 500 C170 480 230 350 350 330 C500 305 520 120 680 80" stroke="url(#accent)"/><g fill="#f0c45a" stroke="none">${[0,1,2,3,4].map((_,i)=>`<circle cx="${80+i*145}" cy="${465-i*i*18}" r="${16+i*6}"/>`).join("")}</g></g>`;
  if (type === "market") return `<g transform="translate(1095 225)">${["Enterprise AI","Digital Transformation","Workflow Automation","Operational Intelligence"].map((t,i)=>`<circle cx="${260+Math.cos((45+i*90)*Math.PI/180)*210}" cy="${260+Math.sin((45+i*90)*Math.PI/180)*210}" r="118" fill="#f8fbff" opacity="0.08" stroke="#f8fbff" stroke-opacity="0.16"/><text x="${260+Math.cos((45+i*90)*Math.PI/180)*210}" y="${260+Math.sin((45+i*90)*Math.PI/180)*210+8}" text-anchor="middle" font-size="24" font-weight="650" fill="#f8fbff">${t}</text>`).join("")}<circle cx="260" cy="260" r="122" fill="url(#accent)" opacity="0.82"/><text x="260" y="252" text-anchor="middle" font-size="27" font-weight="750" fill="#08111f">Management</text><text x="260" y="286" text-anchor="middle" font-size="27" font-weight="750" fill="#08111f">Infrastructure</text></g>`;
  return `<g transform="translate(1135 220)"><path d="M310 0 L590 162 L590 486 L310 648 L30 486 L30 162 Z" fill="none" stroke="url(#accent)" stroke-width="5"/><circle cx="310" cy="324" r="108" fill="url(#accent)" opacity="0.3"/><text x="310" y="342" text-anchor="middle" font-size="92" font-weight="750" fill="#f8fbff">h</text></g>`;
}

function slide(s) {
  const body = s.body ? tspans(s.body, 150, s.subtitle ? 535 : 360, 34, 56) : "";
  const bullets = s.bullets
    ? s.bullets.map((b, i) => `<text x="190" y="${(s.body ? 520 : 340) + i * 68}" font-size="38" font-weight="650" fill="#f8fbff">• ${esc(b)}</text>`).join("\n")
    : "";
  const footer = s.footer ? tspans(wrapText(s.footer), 150, 870, 32, 46, 600, "#f0c45a") : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bg()}
  ${logo()}
  ${titleBlock(s)}
  ${body}
  ${bullets}
  ${footer}
  ${visual(s.visual)}
</svg>
`;
}

for (const s of slides) {
  writeFileSync(join(outDir, `${s.id}.svg`), slide(s));
}

writeFileSync(join(outDir, "README.md"), `# huzlr slides

Eight 16:9 SVG slide images at 1920x1080.

The logo mark is a lowercase h using Open Sans first, with Arial/sans-serif fallbacks.
`);
