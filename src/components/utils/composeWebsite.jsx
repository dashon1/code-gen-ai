/* Premium Website Composer and Assets Helper
   Exports:
   - getCategoryAssets(category)
   - composeWebsite({ title, description, category, colors, heroImage }, content, options)
*/

// PREMIUM ASSET LIBRARY: Curated, industry-specific visuals for agency-quality websites
export function getCategoryAssets(category) {
  const heroes = {
    roofing: 'https://images.unsplash.com/photo-1604014237800-1c9102c1d1d4?w=1920&q=80&auto=format&fit=crop', // Roofer on site
    landscape: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920&q=80&auto=format&fit=crop', // Landscaper working
    plumbing: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=80&auto=format&fit=crop', // Professional plumber
    spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=80&auto=format&fit=crop', // Spa treatment
    hvac: 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=1920&q=80&auto=format&fit=crop', // HVAC technician
    electrical: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=80&auto=format&fit=crop', // Electrician working
    restaurant: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80&auto=format&fit=crop', // Chef in action
    portfolio: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1920&q=80&auto=format&fit=crop', // Creative workspace
    blog: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920&q=80&auto=format&fit=crop', // Writer at work
    ecommerce: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80&auto=format&fit=crop', // Retail display
    landing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80&auto=format&fit=crop', // Product launch
    agency: 'https://images.unsplash.com/photo-1552664730-d307ca8849d1?w=1920&q=80&auto=format&fit=crop', // Creative team
    startup: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&q=80&auto=format&fit=crop', // Startup hustle
    nonprofit: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80&auto=format&fit=crop', // Community work
    education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80&auto=format&fit=crop', // Teaching
    business: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80&auto=format&fit=crop', // Business professional
    medical: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80&auto=format&fit=crop', // Medical care
    creative: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1920&q=80&auto=format&fit=crop'  // Creative studio
  };
  const galleryByCat = {
    restaurant: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80', // Food plating
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80', // Signature dish
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80', // Salad bowl
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80', // Pancakes
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', // Pasta
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=1200&q=80', // Dessert
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80', // Interior dining
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80', // Chef cooking
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', // Bar setup
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80'  // Restaurant ambiance
    ],
    medical: [
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80',
      'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&q=80',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80'
    ],
    agency: [
      'https://images.unsplash.com/photo-1552664730-d307ca8849d1?w=1200&q=80', // Team collab
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80', // Brainstorm
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80', // Strategy
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80', // Meeting
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80', // Office view
      'https://images.unsplash.com/photo-1519389950473-47ba03577432?w=1200&q=80', // Workspace
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80', // Team huddle
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'  // Collaboration
    ],
    landscape: [
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&q=80', // Landscaper working
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80', // Garden care
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80', // Beautiful garden
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&q=80', // Pathway
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', // Lawn mowing
      'https://images.unsplash.com/photo-1558293842-c0fd3db86157?w=1200&q=80', // Tree trimming
      'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1200&q=80', // Garden design
      'https://images.unsplash.com/photo-1455218873509-8097305ee378?w=1200&q=80', // Backyard oasis
      'https://images.unsplash.com/photo-1588861407826-1ac5b1b0fde7?w=1200&q=80', // Hedge sculpting
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80'  // Green lawn
    ],
    spa: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&q=80',
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200&q=80',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80',
      'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=1200&q=80',
      'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1200&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80'
    ],
    business: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca8849d1?w=1200&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80'
    ]
  };
  return {
    hero: heroes[category] || heroes.business,
    gallery: galleryByCat[category] || galleryByCat.agency
  };
}

// escape HTML
const esc = (s) => String(s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

// helpers to build sections
function buildServicesHtml(services = []) {
  const list = services.slice(0, 6);
  if (list.length === 0) {
    // Fallback with reveal so it's definitely shown (and animated if IO runs)
    return `
      <div class="card reveal"><div class="icon-badge">A</div><h3>Consultation</h3><p>Book a call to discuss your needs.</p><span class="price-badge">Free</span></div>
      <div class="card reveal"><div class="icon-badge">B</div><h3>Implementation</h3><p>We deliver high-quality work on time.</p><span class="price-badge">From $499</span></div>
      <div class="card reveal"><div class="icon-badge">C</div><h3>Support</h3><p>Ongoing help to ensure success.</p><span class="price-badge">Custom</span></div>
    `;
  }
  return list.map(s => `
    <div class="card reveal">
      <div class="icon-badge">${esc((s.icon || '').slice(0,2) || '★')}</div>
      <h3 style="margin:0 0 6px">${esc(s.title)}</h3>
      <p style="color:#374151;margin:0">${esc(s.description)}</p>
      ${s.price ? `<span class="price-badge">${esc(s.price)}</span>` : ''}
    </div>
  `).join("");
}

function buildStepsHtml(steps = []) {
  const list = steps.slice(0, 6);
  if (list.length === 0) {
    return [ "Discovery","Plan","Build","Launch","Grow" ].map((t,i)=>`
      <div class="step reveal">
        <div class="bubble">${i+1}</div>
        <div>
          <strong>${esc(t)}</strong>
          <p style="margin:.25rem 0 0;color:#374151">Step ${i+1} of our process.</p>
        </div>
      </div>
    `).join("");
  }
  return list.map((s,i)=>`
    <div class="step reveal">
      <div class="bubble">${i+1}</div>
      <div>
        <strong>${esc(s.title)}</strong>
        <p style="margin:.25rem 0 0;color:#374151">${esc(s.description)}</p>
      </div>
    </div>
  `).join("");
}

function buildStatsHtml(stats = []) {
  const list = stats.slice(0,4);
  const fallback = [
    {label:"Projects Completed", value:1000},
    {label:"Years Experience", value:15},
    {label:"Client Satisfaction", value:98, suffix:"%"},
    {label:"Clients", value:100}
  ];
  const items = list.length ? list : fallback;
  return items.map(s => `
    <div class="stat reveal">
      <div class="counter" data-target="${Number(s.value) || 0}">0</div>
      <div style="color:#374151">${esc(s.label)}${s.suffix ? esc(s.suffix) : ""}</div>
    </div>
  `).join("");
}

function buildGalleryHtml(gallery = {}) {
  const items = Array.isArray(gallery.items) ? gallery.items : [];
  const cats = Array.isArray(gallery.categories) ? gallery.categories : [];
  let html = "";
  if (items.length === 0) {
    // no items; caller will inject fallback
    return "";
  }
  html = items.map((it,idx)=>{
    if (typeof it === "string") {
      return `<div class="grid-item" data-cat="${esc(cats[idx % (cats.length || 1)] || 'featured')}"><img src="${esc(it)}" alt="Gallery ${idx+1}"/></div>`;
    }
    const src = it.image || it.src || it.url || "";
    const cat = it.category || (cats[idx % (cats.length || 1)] || "featured");
    const alt = it.alt || it.title || "Gallery";
    return `<div class="grid-item" data-cat="${esc(cat)}"><img src="${esc(src)}" alt="${esc(alt)}"/></div>`;
  }).join("");
  return html;
}

function buildTestimonialsHtml(testimonials = []) {
  if (!Array.isArray(testimonials) || testimonials.length === 0) return "";
  return testimonials.slice(0,5).map(t => `
    <div class="testimonial">
      <p class="quote">“${esc(t.quote || t.text || '')}”</p>
      <div class="author">${esc(t.author || 'Verified Client')}</div>
    </div>
  `).join("");
}

function buildFaqsHtml(faqs = []) {
  const list = faqs.slice(0,6);
  if (list.length === 0) {
    return [
      {q:"What do you offer?", a:"We provide tailored services to fit your goals."},
      {q:"How do we start?", a:"Book a consultation and we’ll guide you."},
      {q:"Do you offer support?", a:"Yes, with flexible plans."}
    ].map(f => `
      <div class="faq-item reveal">
        <button class="faq-q" aria-expanded="false">${esc(f.q)}</button>
        <div class="faq-a">${esc(f.a)}</div>
      </div>
    `).join("");
  }
  return list.map(f => `
    <div class="faq-item reveal">
      <button class="faq-q" aria-expanded="false">${esc(f.q || f.question)}</button>
      <div class="faq-a">${esc(f.a || f.answer)}</div>
    </div>
  `).join("");
}

export function composeWebsite(
  { title, description, category, colors, heroImage },
  content = {},
  options = {}
) {
  const theme = {
    primary: (colors && colors.primary) || '#6366f1',
    dark: (colors && colors.dark) || '#0b1220',
    light: (colors && colors.light) || '#e5e7eb'
  };

  // Section html
  const servicesHtml = buildServicesHtml(content.services);
  const stepsHtml = buildStepsHtml(content.process);
  const statsHtml = buildStatsHtml(content.stats);
  const galleryHtmlFromContent = buildGalleryHtml(content.gallery);
  const testimonialsHtml = buildTestimonialsHtml(content.testimonials);
  const faqsHtml = buildFaqsHtml(content.faqs);

  // gallery fallback by category
  const assets = getCategoryAssets(category);
  const galleryFallback = (assets.gallery || []).map((src, i) =>
    `<div class="grid-item" data-cat="${['featured','recent','top'][i%3]}"><img src="${esc(src)}" alt="Portfolio ${i+1}"/></div>`
  ).join("");

  const galleryHtml = galleryHtmlFromContent || galleryFallback;

  const hero = heroImage || assets.hero;
  const fallbackImageForRuntime = (assets.gallery && assets.gallery[0]) || hero;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--primary:${theme.primary};--dark:${theme.dark};--light:${theme.light};--gradient:linear-gradient(135deg,var(--primary),var(--dark));--shadow-sm:0 4px 12px rgba(0,0,0,.08);--shadow-md:0 12px 32px rgba(0,0,0,.12);--shadow-lg:0 20px 60px rgba(0,0,0,.15);--radius-sm:8px;--radius-md:16px;--radius-lg:24px}
*{box-sizing:border-box} 
html{scroll-behavior:smooth}
html,body{margin:0;padding:0;font-family:Poppins,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0b1220;font-size:16px;line-height:1.6}
a{text-decoration:none;color:inherit;transition:all .3s ease}
.container{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}
.nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.85);backdrop-filter:blur(16px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.08);box-shadow:var(--shadow-sm)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;padding:16px 0}
.nav ul{display:flex;gap:clamp(12px,2vw,24px);list-style:none;margin:0;padding:0;font-size:clamp(14px,1.5vw,16px);font-weight:500}
.nav a{position:relative}
.nav a:after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:var(--primary);transition:width .3s ease}
.nav a:hover:after{width:100%}
.cta{padding:clamp(.7rem,1.5vw,1rem) clamp(1rem,2vw,1.5rem);border-radius:999px;background:var(--gradient);color:#fff;box-shadow:var(--shadow-md);transition:all .3s cubic-bezier(.4,0,.2,1);font-weight:600;border:none;cursor:pointer;position:relative;overflow:hidden}
.cta:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);opacity:0;transition:opacity .3s}
.cta:hover{transform:translateY(-2px) scale(1.02);box-shadow:var(--shadow-lg)}
.cta:hover:before{opacity:1}
.cta:active{transform:translateY(0) scale(0.98)}
/* Aurora hero with animated blobs */
.hero{min-height:clamp(600px,85vh,1000px);display:grid;place-items:center;position:relative;overflow:hidden;background-image:url('${esc(hero)}');background-size:cover;background-position:center;background-attachment:fixed}
.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,0,0,.7) 0%,rgba(99,102,241,.3) 50%,rgba(0,0,0,.6) 100%);mix-blend-mode:multiply}
.aurora{position:absolute;inset:-20%; filter: blur(64px); opacity:.75; pointer-events:none}
.aurora span{position:absolute;border-radius:999px;mix-blend:screen}
.aurora .a1{background:radial-gradient( circle at center, rgba(99,102,241,.75), transparent 60%); width:45vw;height:45vw; top:10%; left:10%; animation:float1 18s ease-in-out infinite}
.aurora .a2{background:radial-gradient( circle at center, rgba(56,189,248,.65), transparent 60%); width:55vw;height:55vw; bottom:-10%; right:15%; animation:float2 22s ease-in-out infinite}
.aurora .a3{background:radial-gradient( circle at center, rgba(16,185,129,.55), transparent 60%); width:35vw;height:35vw; top:30%; right:35%; animation:float3 26s ease-in-out infinite}
@keyframes float1{0%{transform:translate(0,0)}50%{transform:translate(8%, -6%)}100%{transform:translate(0,0)}}
@keyframes float2{0%{transform:translate(0,0)}50%{transform:translate(-10%, 8%)}100%{transform:translate(0,0)}}
@keyframes float3{0%{transform:translate(0,0)}50%{transform:translate(6%, 6%)}100%{transform:translate(0,0)}}
.hero .inner{position:relative;text-align:center;color:#fff;z-index:1;padding:0 clamp(16px,4vw,32px);max-width:1100px;margin:0 auto}
.hero h1{font-size:clamp(40px,7vw,84px);margin:0 0 clamp(16px,2vw,24px);letter-spacing:-.03em;font-weight:800;line-height:1.1;text-shadow:0 4px 24px rgba(0,0,0,.3)}
.hero p{max-width:820px;margin:0 auto clamp(24px,3vw,32px);font-size:clamp(17px,2.3vw,22px);opacity:.95;line-height:1.7;text-shadow:0 2px 12px rgba(0,0,0,.2)}
.btns{display:flex;gap:clamp(12px,2vw,16px);justify-content:center;flex-wrap:wrap}
.section{padding:clamp(60px,10vw,120px) 0;position:relative}
.section h2{font-size:clamp(28px,4vw,48px);margin:0 0 clamp(16px,2vw,24px);text-align:center;font-weight:700;letter-spacing:-.02em;background:linear-gradient(135deg,var(--dark),var(--primary));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.section p.subtitle{text-align:center;max-width:720px;margin:0 auto clamp(32px,4vw,48px);color:#374151;font-size:clamp(16px,2vw,19px);line-height:1.7}
.text-center{text-align:center}
.grid{display:grid;gap:20px}
.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:1024px){.grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:768px){.grid-3,.grid-4{grid-template-columns:1fr}}
.card{background:#fff;border-radius:var(--radius-md);border:1px solid rgba(0,0,0,.06);padding:clamp(20px,3vw,28px);box-shadow:var(--shadow-md);position:relative;overflow:hidden;transition:all .4s cubic-bezier(.4,0,.2,1)}
.card:before{content:'';position:absolute;inset:-2px;border-radius:inherit;background:conic-gradient(from 180deg at 50% 50%, var(--primary), #3b82f6, #06b6d4, var(--primary));opacity:0;transition:opacity .4s;z-index:-1}
.card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:rgba(99,102,241,.2)}
.card:hover:before{opacity:.15}
.icon-badge{width:44px;height:44px;border-radius:12px;background:rgba(99,102,241,.12);display:grid;place-items:center;color:var(--primary);font-weight:700;margin-bottom:12px}
.price-badge{display:inline-block;margin-top:10px;padding:.35rem .6rem;border-radius:999px;background:rgba(16,185,129,.12);color:#065f46;font-size:.85rem}
.timeline{max-width:980px;margin:0 auto;display:grid;gap:16px}
.step{display:grid;grid-template-columns:52px 1fr;gap:12px;align-items:start;background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:16px;padding:18px}
.bubble{width:42px;height:42px;border-radius:999px;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:700;box-shadow:0 8px 24px rgba(99,102,241,.25)}
.stats{display:grid;gap:14px}
.stat{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:18px;padding:24px;text-align:center}
.stat .counter{font-size:34px;color:var(--primary);font-weight:700}
.filters{display:flex;gap:8px;justify-content:center;margin-bottom:16px;flex-wrap:wrap}
.filter-btn{border:1px solid rgba(0,0,0,.12);border-radius:999px;padding:.45rem .8rem;background:#fff}
.filter-btn.active, .filter-btn:hover{background:var(--primary);color:#fff;border-color:transparent}
.gallery{columns:3 280px;column-gap:14px}
.gallery .grid-item{break-inside:avoid;margin-bottom:14px;overflow:hidden;border-radius:14px;border:1px solid rgba(0,0,0,.06);background:#fff}
.gallery img{width:100%;height:auto;display:block;transition:transform .4s ease}
.gallery img:hover{transform:scale(1.03)}
.carousel{position:relative;overflow:hidden;border-radius:16px}
.carousel .track{display:flex;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.carousel .testimonial{min-width:100%;padding:22px}
.quote{font-size:18px;line-height:1.6}
.author{margin-top:10px;font-weight:600;color:#374151}
.faq{max-width:980px;margin:0 auto}
.faq-item{border:1px solid rgba(0,0,0,.08);border-radius:14px;margin-bottom:10px;overflow:hidden;background:#fff}
.faq-q{width:100%;text-align:left;padding:16px 18px;background:#fff;font-weight:600;border:0}
.faq-a{display:none;padding:0 18px 16px;background:#fff;color:#374151}
.contact{max-width:980px;margin:0 auto;display:grid;gap:20px;grid-template-columns:1.2fr .9fr}
@media (max-width:980px){.contact{grid-template-columns:1fr}}
.input{width:100%;padding:.9rem;border:1px solid rgba(0,0,0,.12);border-radius:12px}
.footer{background:#0b1220;color:#cbd5e1;padding:44px 0}
.footer a{color:#cbd5e1;opacity:.9}
.reveal{opacity:0;transform:translateY(14px);transition:all .7s cubic-bezier(.2,.8,.2,1)}
.reveal.visible{opacity:1;transform:none}
.video-hero{position:absolute;inset:0;object-fit:cover;filter:brightness(.65);z-index:0}
/* NEW: AI Edit spinner, AI hero generator button */
.ai-edit-spinner{border:3px solid #f3f3f3;border-top:3px solid var(--primary);border-radius:50%;width:20px;height:20px;animation:spin 1s linear infinite;display:inline-block;vertical-align:middle;margin-left:8px}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.ai-hero-gen{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:10px;align-items:center}
.ai-hero-btn{background:var(--primary);color:#fff;border:none;padding:10px 20px;border-radius:999px;cursor:pointer;font-weight:500;transition:opacity .3s}
.ai-hero-btn:disabled{opacity:.6;cursor:not-allowed}
.ai-hero-spinner{margin-left:10px;display:none}
.ai-hero-spinner.active{display:inline-block}
</style>
</head>
<body>
  <nav class="nav">
    <div class="container wrap">
      <div style="font-weight:700">${esc(title)}</div>
      <ul>
        <li><a href="#services">Services</a></li>
        <li><a href="#process">Process</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#portfolio">Portfolio</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="#contact" class="cta">Get a Quote</a>
    </div>
  </nav>

  <header class="hero">
    ${options?.allowVideoHero ? `
      <video class="video-hero" autoplay muted loop playsinline>
        <source src="https://cdn.coverr.co/videos/coverr-coffee-shop-people-2399/1080p.mp4" type="video/mp4" />
      </video>
    ` : ``}
    <div class="aurora" aria-hidden="true">
      <span class="a1"></span>
      <span class="a2"></span>
      <span class="a3"></span>
    </div>
    <div class="inner container">
      <h1>${esc(title)}</h1>
      <p>${esc(description)}</p>
      <div class="btns">
        <a href="#services" class="cta">Explore Services</a>
        <a href="#contact" class="cta" style="background:linear-gradient(135deg,#111827,var(--primary))">Contact Us</a>
      </div>
    </div>
    ${options?.allowAIHeroGenerator ? `
      <div class="ai-hero-gen">
        <button id="ai-hero-button" class="ai-hero-btn">Generate AI Hero</button>
        <span id="ai-hero-spinner" class="ai-edit-spinner ai-hero-spinner"></span>
      </div>
    ` : ``}
  </header>

  <section id="services" class="section">
    <div class="container">
      <h2>Our Services</h2>
      <div class="grid grid-3">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <section id="process" class="section" style="background:linear-gradient(180deg,#f8fafc,#fff)">
    <div class="container">
      <h2>How It Works</h2>
      <div class="timeline">
        ${stepsHtml}
      </div>
    </div>
  </section>

  <section id="about" class="section">
    <div class="container">
      <h2>Why Choose Us</h2>
      <div class="grid" style="grid-template-columns:1.1fr .9fr">
        <div class="reveal">
          <p style="font-size:18px;line-height:1.8">${esc((content?.about?.text || description || "We are a dedicated team focused on quality, reliability, and results. Our process is transparent, our craftsmanship is meticulous, and our support is ongoing."))}</p>
          <ul style="margin-top:14px;color:#374151">
            ${(content?.about?.bullets && content.about.bullets.length ? content.about.bullets : ["Expert team", "On-time delivery", "Premium quality", "Customer satisfaction", "Transparent pricing"]).map(b => `<li>• ${esc(b)}</li>`).join("")}
          </ul>
        </div>
        <div class="card reveal">
          <div class="grid grid-4 stats">
            ${statsHtml}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="portfolio" class="section" style="background:linear-gradient(180deg,#fff,#f8fafc)">
    <div class="container">
      <h2>Portfolio</h2>
      <div class="filters" id="filters">
        ${(content?.gallery?.categories || ['featured','recent','top']).map((c,i)=>`<button class="filter-btn ${i===0?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}
        <button class="filter-btn" data-filter="all">All</button>
      </div>
      <div class="gallery" id="gallery">
        ${galleryHtml}
      </div>
    </div>
  </section>

  <section id="testimonials" class="section">
    <div class="container">
      <h2>What Clients Say</h2>
      <div class="carousel" id="carousel">
        <div class="track">
          ${testimonialsHtml || `
            <div class="testimonial"><p class="quote">“Fantastic experience from start to finish.”</p><div class="author">Verified Client</div></div>
            <div class="testimonial"><p class="quote">“Professional, responsive, and high quality.”</p><div class="author">Verified Client</div></div>
          `}
        </div>
      </div>
    </div>
  </section>

  <section id="faq" class="section" style="background:linear-gradient(180deg,#f8fafc,#fff)">
    <div class="container">
      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        ${faqsHtml}
      </div>
    </div>
  </section>

  <section id="contact" class="section">
    <div class="container">
      <h2>Contact Us</h2>
      <div class="contact">
        <form class="card" onsubmit="event.preventDefault(); alert('Thank you! We will reach out soon.')">
          <input class="input" placeholder="Full Name" required/>
          <input class="input" placeholder="Email" type="email" required/>
          <input class="input" placeholder="Phone" />
          <textarea class="input" placeholder="Tell us about your project" rows="5"></textarea>
          <button class="cta" type="submit">Send Message</button>
        </form>
        <div class="card">
          <h3 style="margin-top:0">Get in touch</h3>
          <p>${esc(title)} — ${esc(category)}</p>
          <p>Email: contact@example.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Hours: Mon–Fri 9am–6pm</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px">
      <div><strong>${esc(title)}</strong><p style="opacity:.8;margin-top:8px">${esc(description)}</p></div>
      <div><strong>Company</strong><ul style="list-style:none;padding:0;margin-top:8px"><li><a href="#about">About</a></li><li><a href="#services">Services</a></li><li><a href="#portfolio">Work</a></li></ul></div>
      <div><strong>Resources</strong><ul style="list-style:none;padding:0;margin-top:8px"><li><a href="#faq">FAQ</a></li><li><a href="#contact">Contact</a></li></ul></div>
      <div><strong>Follow</strong><ul style="list-style:none;padding:0;margin-top:8px"><li><a href="#">Instagram</a></li><li><a href="#">LinkedIn</a></li></ul></div>
    </div>
  </footer>

<script>
window.__FALLBACK_IMG = ${JSON.stringify(fallbackImageForRuntime)};
window.__CATEGORY = ${JSON.stringify(category || "business")};

// SAFE REVEAL: if IntersectionObserver is missing or delayed, reveal everything
(function(){
  function revealAll(){ document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); }); }
  if (!('IntersectionObserver' in window)) {
    revealAll();
  } else {
    // normal reveal + fallback timer to avoid blank sections
    const io = new IntersectionObserver(function(e){e.forEach(function(x){ if(x.isIntersecting) x.target.classList.add('visible'); });},{threshold:.15});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
    setTimeout(function(){
      const anyVisible = document.querySelector('.reveal.visible');
      if (!anyVisible) revealAll();
    }, 900);
  }
})();

// Also observe cards/sections lightly (non-blocking visual polish)
(function(){
  if (!('IntersectionObserver' in window)) return;
  const io2 = new IntersectionObserver(function(e){e.forEach(function(x){ if(x.isIntersecting) x.target.classList.add('visible'); });},{threshold:.1});
  document.querySelectorAll('.card, section').forEach(function(el){ io2.observe(el); });
})();

// Counters
const seen=new WeakSet();
const co=new IntersectionObserver(function(e){e.forEach(function(x){
  if(!x.isIntersecting||seen.has(x.target)) return; seen.add(x.target);
  const el=x.target; const target=parseInt(el.getAttribute('data-target'))||0;
  var cur=0, inc=Math.max(1,Math.floor(target/120)); var t=setInterval(function(){cur+=inc;if(cur>=target){cur=target;clearInterval(t)} el.textContent=cur.toLocaleString();},16);
});},{threshold:.4});
document.querySelectorAll('.counter').forEach(function(el){co.observe(el);});

// Gallery filters
const filters=document.getElementById('filters');
if(filters){
  filters.addEventListener('click', function(e){
    const btn=e.target.closest('.filter-btn'); if(!btn) return;
    filters.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    const f=btn.dataset.filter; document.querySelectorAll('#gallery .grid-item').forEach(function(it){
      it.style.display = f==='all' || it.dataset.cat===f ? '' : 'none';
    });
  });
}

// Testimonials carousel
(function(){
  const wrap=document.querySelector('#carousel .track'); if(!wrap) return;
  var idx=0;
  setInterval(function(){
    idx=(idx+1)%wrap.children.length;
    wrap.style.transform = 'translateX(' + (-idx*100) + '%)';
  }, 3800);
})();

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(function(it){
  const q=it.querySelector('.faq-q'), a=it.querySelector('.faq-a');
  q.addEventListener('click', function(){
    const open=q.getAttribute('aria-expanded')==='true';
    q.setAttribute('aria-expanded', String(!open));
    a.style.display = open ? 'none' : 'block';
  });
});

// Replace obviously bad stock images and fix missing/invalid src
const bad=/(laptop|keyboard|desk|workspace)/i;
(function(){
  const fallback = window.__FALLBACK_IMG || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80&auto=format&fit=crop';
  document.querySelectorAll('img').forEach(function(img){
    const s = img.getAttribute('src');
    if (!s || !s.trim() || /undefined|null/.test(s)) {
      img.setAttribute('src', fallback);
      if (!img.getAttribute('alt') || !img.getAttribute('alt').trim()) {
        img.setAttribute('alt', 'Portfolio item');
      }
    } else if (bad.test(s)) {
      img.setAttribute('src','https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80&auto=format&fit=crop');
    }
  });
})();

// Guard hero image relevance: avoid scenic mountains/deserts for service categories
(function(){
  const heroEl = document.querySelector('.hero');
  if (!heroEl) return;
  const bg = getComputedStyle(heroEl).backgroundImage || "";
  const scenic = /(mountain|alps|peak|glacier|snow|canyon|desert|cliff|rocky|forest|lake|nature|outdoor)/i;
  const serviceCats = /landscape|plumbing|hvac|electrical|roofing|restaurant|business|spa|medical|agency|startup|nonprofit|education|creative|ecommerce|blog|portfolio|landing/;
  if (window.__CATEGORY && serviceCats.test(window.__CATEGORY) && scenic.test(bg)) {
    const fb = window.__FALLBACK_IMG || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1920&q=80&auto=format&fit=crop';
    heroEl.style.backgroundImage = "linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.25)), url('"+fb+"')";
  }
})();

// AI Hero Generator Script (no backticks inside)
(function(){
  const aiHeroButton = document.getElementById('ai-hero-button');
  const aiHeroSpinner = document.getElementById('ai-hero-spinner');
  const heroEl = document.querySelector('.hero');
  if (!aiHeroButton || !aiHeroSpinner || !heroEl) return;

  aiHeroButton.addEventListener('click', function(){
    aiHeroButton.disabled = true;
    aiHeroSpinner.classList.add('active');

    const prompt = 'a professional website hero image for a business named "' + ${JSON.stringify(title)} + '" specializing in "' + ${JSON.stringify(category || "general business")} + '"';
    const mockImages = [
      'https://images.unsplash.com/photo-1521737711867-ee1d099665a6?auto=format&q=80&w=1920',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&q=80&w=1920',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&q=80&w=1920',
      'https://images.unsplash.com/photo-1588661609101-729c66ce78d2?auto=format&q=80&w=1920'
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];

    setTimeout(function(){
      heroEl.style.backgroundImage = "linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.25)), url('" + randomImage + "')";
      aiHeroButton.disabled = false;
      aiHeroSpinner.classList.remove('active');
    }, 1200);
  });
})();

// Subtle parallax on hero content
(function(){
  const heroInner=document.querySelector('.hero .inner');
  if(!heroInner) return;
  document.addEventListener('mousemove', function(e){
    const x=(e.clientX/window.innerWidth - .5) * 6;
    const y=(e.clientY/window.innerHeight - .5) * 6;
    heroInner.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  });
})();
</script>
</body>
</html>`;
}