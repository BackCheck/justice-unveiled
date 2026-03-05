/**
 * Interactive HTML Presentation Generator
 * Creates shareable slide decks from case data for SlideShare/LinkedIn.
 */

interface SlideData {
  title: string;
  content: string;
  type: "cover" | "stats" | "timeline" | "entities" | "findings" | "text" | "closing";
}

interface PresentationOptions {
  caseTitle: string;
  caseNumber?: string;
  description?: string;
  severity?: string;
  location?: string;
  events?: { date: string; category: string; description: string }[];
  entities?: { name: string; entity_type: string; role?: string; category?: string }[];
  discrepancies?: { title: string; severity: string; description: string }[];
  stats?: { sources: number; events: number; entities: number; discrepancies: number };
}

function buildSlides(opts: PresentationOptions): SlideData[] {
  const slides: SlideData[] = [];
  const now = new Date();

  // Cover slide
  slides.push({
    title: "Cover",
    type: "cover",
    content: `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:60px;">
        <div style="font-size:14px;letter-spacing:6px;color:#94a3b8;text-transform:uppercase;margin-bottom:24px;">Human Rights Protection & Monitoring</div>
        <h1 style="font-size:48px;font-weight:800;color:#f8fafc;line-height:1.2;margin:0 0 16px;">${opts.caseTitle}</h1>
        ${opts.caseNumber ? `<div style="font-family:monospace;font-size:18px;color:#64748b;margin-bottom:32px;">${opts.caseNumber}</div>` : ""}
        <div style="width:80px;height:4px;background:linear-gradient(90deg,#0087C1,#06b6d4);border-radius:4px;margin-bottom:32px;"></div>
        <div style="font-size:16px;color:#94a3b8;">${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        ${opts.severity ? `<div style="margin-top:24px;padding:8px 24px;border-radius:999px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;${opts.severity === "critical" ? "background:#7f1d1d;color:#fca5a5;" : opts.severity === "high" ? "background:#7c2d12;color:#fed7aa;" : "background:#1e3a5f;color:#93c5fd;"}">${opts.severity} Severity</div>` : ""}
      </div>`,
  });

  // Stats slide
  if (opts.stats) {
    slides.push({
      title: "Case Overview",
      type: "stats",
      content: `
        <div style="padding:80px 60px;">
          <h2 style="font-size:36px;color:#f8fafc;margin:0 0 12px;">Case Overview</h2>
          <div style="width:60px;height:3px;background:#0087C1;border-radius:4px;margin-bottom:40px;"></div>
          <p style="font-size:18px;color:#94a3b8;max-width:700px;line-height:1.8;margin-bottom:48px;">${(opts.description || "").substring(0, 300)}${(opts.description || "").length > 300 ? "..." : ""}</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
            ${[
              { v: opts.stats.sources, l: "Evidence Sources", c: "#0087C1" },
              { v: opts.stats.events, l: "Timeline Events", c: "#06b6d4" },
              { v: opts.stats.entities, l: "Entities Identified", c: "#8b5cf6" },
              { v: opts.stats.discrepancies, l: "Discrepancies", c: "#ef4444" },
            ].map(s => `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:center;">
                <div style="font-size:48px;font-weight:800;color:${s.c};margin-bottom:8px;">${s.v}</div>
                <div style="font-size:14px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${s.l}</div>
              </div>
            `).join("")}
          </div>
        </div>`,
    });
  }

  // Timeline slides (chunk events into groups of 5)
  if (opts.events && opts.events.length > 0) {
    const chunks: typeof opts.events[] = [];
    for (let i = 0; i < opts.events.length; i += 5) {
      chunks.push(opts.events.slice(i, i + 5));
    }
    chunks.forEach((chunk, ci) => {
      slides.push({
        title: `Timeline ${ci + 1}/${chunks.length}`,
        type: "timeline",
        content: `
          <div style="padding:60px;">
            <h2 style="font-size:32px;color:#f8fafc;margin:0 0 8px;">Case Timeline</h2>
            <div style="font-size:14px;color:#64748b;margin-bottom:32px;">Page ${ci + 1} of ${chunks.length} · ${opts.events!.length} total events</div>
            <div style="display:flex;flex-direction:column;gap:16px;">
              ${chunk.map(e => `
                <div style="display:flex;gap:16px;align-items:flex-start;">
                  <div style="min-width:100px;font-family:monospace;font-size:14px;color:#0087C1;padding-top:4px;">${e.date}</div>
                  <div style="width:2px;background:rgba(0,135,193,0.3);min-height:40px;position:relative;">
                    <div style="width:10px;height:10px;background:#0087C1;border-radius:50%;position:absolute;top:4px;left:-4px;"></div>
                  </div>
                  <div style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;">
                    <div style="font-size:11px;color:#06b6d4;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${e.category}</div>
                    <div style="font-size:15px;color:#e2e8f0;line-height:1.5;">${e.description.substring(0, 150)}${e.description.length > 150 ? "..." : ""}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>`,
      });
    });
  }

  // Entities slide
  if (opts.entities && opts.entities.length > 0) {
    const grouped: Record<string, typeof opts.entities> = {};
    opts.entities.forEach(e => {
      const cat = e.category || e.entity_type || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(e);
    });

    slides.push({
      title: "Entity Network",
      type: "entities",
      content: `
        <div style="padding:60px;">
          <h2 style="font-size:32px;color:#f8fafc;margin:0 0 8px;">Entity Network</h2>
          <div style="font-size:14px;color:#64748b;margin-bottom:32px;">${opts.entities.length} entities identified</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;">
            ${Object.entries(grouped).slice(0, 6).map(([cat, ents]) => `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;">
                <div style="font-size:12px;color:#06b6d4;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">${cat}</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                  ${ents.slice(0, 8).map(e => `
                    <span style="padding:6px 14px;background:rgba(0,135,193,0.15);border:1px solid rgba(0,135,193,0.3);border-radius:999px;font-size:13px;color:#e2e8f0;">${e.name}</span>
                  `).join("")}
                  ${ents.length > 8 ? `<span style="padding:6px 14px;font-size:13px;color:#64748b;">+${ents.length - 8} more</span>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>`,
    });
  }

  // Discrepancies slide
  if (opts.discrepancies && opts.discrepancies.length > 0) {
    slides.push({
      title: "Key Findings",
      type: "findings",
      content: `
        <div style="padding:60px;">
          <h2 style="font-size:32px;color:#f8fafc;margin:0 0 8px;">Key Findings & Discrepancies</h2>
          <div style="font-size:14px;color:#64748b;margin-bottom:32px;">${opts.discrepancies.length} issues identified</div>
          <div style="display:flex;flex-direction:column;gap:16px;">
            ${opts.discrepancies.slice(0, 5).map(d => {
              const color = d.severity === "critical" ? "#ef4444" : d.severity === "high" ? "#f97316" : "#eab308";
              return `
                <div style="display:flex;gap:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;border-left:4px solid ${color};">
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                      <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:${color};letter-spacing:1px;">${d.severity}</span>
                    </div>
                    <div style="font-size:16px;font-weight:600;color:#f8fafc;margin-bottom:4px;">${d.title}</div>
                    <div style="font-size:14px;color:#94a3b8;line-height:1.5;">${d.description.substring(0, 200)}${d.description.length > 200 ? "..." : ""}</div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>`,
    });
  }

  // Closing slide
  slides.push({
    title: "Closing",
    type: "closing",
    content: `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:60px;">
        <div style="width:80px;height:4px;background:linear-gradient(90deg,#0087C1,#06b6d4);border-radius:4px;margin-bottom:40px;"></div>
        <h2 style="font-size:36px;color:#f8fafc;margin:0 0 16px;">Documenting Injustice.<br/>Demanding Accountability.</h2>
        <p style="font-size:18px;color:#94a3b8;margin-bottom:40px;">HRPM.org — Human Rights Protection & Monitoring</p>
        <div style="font-size:14px;color:#64748b;">
          <p>36 Robinson Road, #20-01 City House, Singapore 068877</p>
          <p>info@hrpm.org · hrpm.org</p>
        </div>
        <div style="margin-top:40px;padding:12px 32px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:12px;color:#64748b;">
          © ${new Date().getFullYear()} HRPM · All Rights Reserved · Public Interest Document
        </div>
      </div>`,
  });

  return slides;
}

export function generatePresentation(opts: PresentationOptions): string {
  const slides = buildSlides(opts);

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.caseTitle} — HRPM Presentation</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',system-ui,-apple-system,sans-serif; background:#0f172a; color:#e2e8f0; overflow:hidden; height:100vh; }
  .slide { width:100vw; height:100vh; display:none; position:relative; }
  .slide.active { display:block; }
  .slide-inner { width:100%; height:100%; background:#0f172a; }
  .nav-bar { position:fixed; bottom:0; left:0; right:0; height:48px; background:rgba(15,23,42,0.95); border-top:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between; padding:0 24px; z-index:100; backdrop-filter:blur(12px); }
  .nav-bar button { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); color:#e2e8f0; padding:6px 16px; border-radius:6px; cursor:pointer; font-size:13px; transition:all 0.2s; }
  .nav-bar button:hover { background:rgba(0,135,193,0.3); border-color:#0087C1; }
  .nav-bar button:disabled { opacity:0.3; cursor:not-allowed; }
  .slide-counter { font-size:13px; color:#64748b; font-family:monospace; }
  .progress-bar { position:fixed; top:0; left:0; height:3px; background:linear-gradient(90deg,#0087C1,#06b6d4); transition:width 0.3s ease; z-index:101; }
  .logo-watermark { position:fixed; top:16px; right:24px; font-size:12px; color:#334155; letter-spacing:2px; z-index:99; }
  @media print {
    .nav-bar, .progress-bar, .logo-watermark { display:none !important; }
    .slide { display:block !important; page-break-after:always; height:auto; min-height:100vh; }
    body { background:#0f172a; }
  }
</style>
</head><body>

<div class="progress-bar" id="progress"></div>
<div class="logo-watermark">HRPM.ORG</div>

${slides.map((s, i) => `
  <div class="slide${i === 0 ? " active" : ""}" data-slide="${i}">
    <div class="slide-inner">${s.content}</div>
  </div>
`).join("")}

<div class="nav-bar">
  <button id="prev" onclick="go(-1)">← Previous</button>
  <div>
    <span class="slide-counter" id="counter">1 / ${slides.length}</span>
    <button style="margin-left:16px;" onclick="toggleFullscreen()">⛶ Fullscreen</button>
    <button style="margin-left:8px;" onclick="window.print()">🖨 Print PDF</button>
  </div>
  <button id="next" onclick="go(1)">Next →</button>
</div>

<script>
let current = 0;
const total = ${slides.length};
const slides = document.querySelectorAll('.slide');

function go(dir) {
  const next = current + dir;
  if (next < 0 || next >= total) return;
  slides[current].classList.remove('active');
  current = next;
  slides[current].classList.add('active');
  update();
}

function update() {
  document.getElementById('counter').textContent = (current+1) + ' / ' + total;
  document.getElementById('prev').disabled = current === 0;
  document.getElementById('next').disabled = current === total - 1;
  document.getElementById('progress').style.width = ((current+1)/total*100) + '%';
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
  if (e.key === 'f' || e.key === 'F') toggleFullscreen();
});

update();
</script>
</body></html>`;
}

export type { PresentationOptions };
