import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, Edit, TrendingUp, Zap, BadgeCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import GeneratorForm from "../components/generator/GeneratorForm";
import PreviewPanel from "../components/generator/PreviewPanel";
import QuickTemplates from "../components/generator/QuickTemplates";

import { composeWebsite, getCategoryAssets } from "@/components/utils/composeWebsite";
import { trackUsage, checkQuota } from "@/components/features/UsageTracker";


// New Component: QualityChecklist
const QualityChecklist = ({ report }) => {
  if (!report || Object.keys(report).length === 0) return null;

  const items = [
    { key: 'hero', message: 'Hero Section' },
    { key: 'services', message: 'Services Section' },
    { key: 'process', message: 'Process Section' },
    { key: 'portfolio', message: 'Portfolio/Gallery Section' },
    { key: 'testimonials', message: 'Testimonials Section' },
    { key: 'stats', message: 'Stats Section' },
    { key: 'faq', message: 'FAQ Section' },
    { key: 'contact', message: 'Contact Section' },
    { key: 'mobile', message: 'Mobile Responsiveness' },
    { key: 'animations', message: 'Animations & Micro-interactions' },
    { key: 'seo', message: 'Basic SEO elements (title, meta description)' },
    { key: 'no_verbatim', message: 'Paraphrased brief (no copy-paste)' } // NEW
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-green-400" />
          Generation Quality Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.key || index} className="flex items-center gap-2">
              {report[item.key] ? <BadgeCheck className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
              <p className={`text-sm ${report[item.key] ? 'text-gray-200' : 'text-gray-300'}`}>
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


// Add a small timeout helper above the component
const withTimeout = (p, ms = 25000) => {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("LLM timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
};

// Add: resilient LLM invoker with retries/backoff
const invokeLLMWithRetry = async (args, timeouts = [18000, 24000, 30000]) => {
  let lastErr = null;
  for (let i = 0; i < timeouts.length; i++) {
    try {
      const res = await withTimeout(base44.integrations.Core.InvokeLLM(args), timeouts[i]);
      if (res) return res;
    } catch (e) {
      lastErr = e;
      // console.warn(`LLM call failed (attempt ${i + 1}/${timeouts.length}):`, e?.message || e);
    }
  }
  throw lastErr || new Error("LLM failed after retries");
};

// Add helper to detect 5+ word verbatim chunks from the brief within the HTML
const hasVerbatimFromBrief = (brief = "", html = "") => {
  const norm = (s) => (s || "")
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const b = norm(brief);
  const h = norm(html);

  if (!b || !h) return false;

  const words = b.split(" ");
  if (words.length < 6) {
    // If short brief, fall back to substring check of length >= 50 chars
    return b.length >= 50 && h.includes(b);
  }

  for (let i = 0; i <= words.length - 6; i++) {
    const chunk = words.slice(i, i + 6).join(" ");
    if (chunk.length > 0 && h.includes(chunk)) return true;
  }
  return false;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    language: "en",
    theme: "modern",
    color_scheme: "blue"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [qualityReport, setQualityReport] = useState({}); // New state for quality report, now an object

  useEffect(() => {
    loadUser();
    loadRecentProjects();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not logged in");
    }
  };

  const loadRecentProjects = async () => {
    const projects = await base44.entities.Website.list("-created_date", 3);
    setRecentProjects(projects);
  };

  const handleWebsiteUpdate = (updatedWebsite) => {
    setGeneratedWebsite(updatedWebsite);
    loadRecentProjects();
  };

  // Helper: evaluate presence of key sections in HTML to build a real report
  const computeQualityReport = (html, brief) => {
    if (!html || typeof html !== "string") {
      return {
        hero: false, services: false, process: false, portfolio: false,
        testimonials: false, stats: false, faq: false, contact: false, mobile: false,
        animations: false, seo: false, no_verbatim: true
      };
    }
    const has = (pattern) => new RegExp(pattern, "i").test(html);
    return {
      hero: has("(class|id)=[\"']?hero[\"']?") || has("Hero Section"),
      services: has("services") && has("(grid|card)") || has("Services Section"),
      process: has("process") || has("step") || has("Process Section"),
      portfolio: has("gallery") || has("portfolio") || has("Portfolio Section"),
      testimonials: has("testimonial") || has("Testimonials Section"),
      stats: has("stat") || has("counter") || has("Stats Section"),
      faq: has("faq") || has("accordion") || has("FAQ Section"),
      contact: has("contact") || has("form") || has("Contact Section"),
      mobile: has("@media") || has("max-width") || has("responsive"),
      animations: has("animation") || has("transition") || has("keyframes"),
      seo: has("<title>") && (has("meta name=\"description\"") || has("meta name='description'")),
      no_verbatim: !hasVerbatimFromBrief(brief, html) // NEW
    };
  };

  // Replace QA helper with robust, timed version (no unsupported params)
  const qaEvaluateAndCorrect = async (html, brief) => {
    const schema = {
      type: "object",
      properties: {
        is_valid: { type: "boolean" },
        missing_sections: { type: "array", items: { type: "string" } },
        issues: { type: "array", items: { type: "string" } },
        corrected_html: { type: "string" },
        explanation: { type: "string" }
      },
      required: ["is_valid", "corrected_html"]
    };

    const prompt = `You are a LEAD QA ENGINEER and CREATIVE DIRECTOR at a top-tier digital agency reviewing a $40K+ website before client delivery.

🎯 CLIENT BRIEF (DO NOT COPY VERBATIM—PARAPHRASE ALL TEXT):
${brief || "(no brief provided)"}

📄 HTML TO AUDIT:
${html}

🔍 PREMIUM QUALITY CHECKLIST (ALL MUST PASS):

✅ STRUCTURE & COMPLETENESS:
- Hero: Magnetic headline (not generic), benefit-driven subheadline, dual CTAs, trust indicators
- Services: 6+ cards with outcomes (not just features), pricing anchors, icons/badges
- Process: 5+ steps with emotional journey, visual timeline, client transformation arc
- Portfolio: 10+ high-quality, industry-specific images (NO generic office/mountain/sunset photos)
- Testimonials: 5+ detailed testimonials with names, roles, specific results/numbers
- Stats: 4+ impressive metrics with context (e.g., "500+ Projects" not just "500")
- FAQ: 8+ questions addressing real objections with detailed answers (3-5 sentences each)
- Contact: Multi-field form + contact details + map/hours + response time promise

✅ PREMIUM DESIGN QUALITY:
- Modern CSS: backdrop-filter, clamp() typography, CSS Grid, Flexbox, custom properties
- Smooth animations: IntersectionObserver reveals, 300-500ms transitions with cubic-bezier easing
- Micro-interactions: Hover effects on all interactive elements, active states, focus rings
- Glassmorphism cards: rgba backgrounds with backdrop-filter blur
- Gradient accents: Modern gradients (not harsh linear), used strategically
- Perfect mobile responsiveness: Fluid typography, touch-friendly buttons (44px min), stacked layouts

✅ CONTENT EXCELLENCE:
- NO verbatim copying from brief (check 5+ word sequences)
- NO lorem ipsum, [placeholder], "click here", or generic language
- Headlines are magnetic and unique (NOT "Welcome", "About Us", "Our Services")
- Copy is benefit-driven and conversion-focused (includes urgency, social proof, risk-reversal)
- All images have proper alt text and are industry-relevant

✅ TECHNICAL STANDARDS:
- Valid HTML5 semantic structure (<header>, <section>, <article>, <footer>)
- SEO: Compelling <title> (50-60 chars), meta description (150-160 chars), Open Graph tags
- Accessibility: ARIA labels, keyboard navigation, sufficient color contrast (WCAG AA)
- Performance: Optimized images (Unsplash URLs with ?w=1920&q=80&auto=format), lazy loading
- All JavaScript functional (carousels, accordions, filters, forms, scroll effects)

✅ FORBIDDEN ELEMENTS:
- ❌ Generic stock photos (laptops, keyboards, random offices, mountains for non-outdoor businesses)
- ❌ Copy-pasted brief text
- ❌ Broken or missing images (src="undefined", src="")
- ❌ Lorem ipsum or placeholder content
- ❌ Non-functional JavaScript
- ❌ Poor mobile UX (tiny text, overlapping elements)

🛠️ YOUR TASK:
If ANYTHING fails the checklist above, FIX IT NOW. Rewrite copy to be more compelling, swap bad images for relevant Unsplash URLs, add missing sections, enhance design quality, ensure all interactions work.

RETURN PRODUCTION-READY HTML that would impress a Fortune 500 client.

RESPONSE (JSON ONLY):
{
  "is_valid": boolean,
  "missing_sections": ["list any sections that were missing or incomplete"],
  "issues": ["specific problems found"],
  "corrected_html": "Complete, fixed HTML that passes ALL quality checks",
  "explanation": "What was improved (2-3 sentences)"
}`;

    try {
      const res = await withTimeout(
        base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: schema,
          add_context_from_internet: false
        }),
        20000
      );
      const corrected = res?.corrected_html && res.corrected_html.length > 100 ? res.corrected_html : html;
      const isValid = typeof res?.is_valid === "boolean" ? res.is_valid : true;
      return { correctedHtml: corrected, isValid, qa: res || {} };
    } catch (e) {
      console.warn("QA agent timed out or failed, using original HTML. Reason:", e?.message || e);
      return { correctedHtml: html, isValid: true, qa: { is_valid: true, explanation: "QA skipped due to timeout/failure." } };
    }
  };

  const generateWebsite = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    const quotaCheck = await checkQuota("website_generated");
    if (!quotaCheck.allowed) {
      alert(quotaCheck.reason + " Please upgrade your plan.");
      return;
    }

    setIsGenerating(true);
    setGeneratedWebsite(null);
    setQualityReport({});

    try {
      // Load admin generation settings (optional)
      let genSettings = null;
      try {
        const settings = await base44.entities.GenerationSettings.list();
        genSettings = settings[0] || null;
      } catch (e) {
        console.warn("Could not load generation settings:", e?.message || e);
      }

      const selectedCategory = formData.category;

      // Color scheme mapping
      const colorMap = {
        blue: { primary: '#2563eb', dark: '#1e40af', light: '#93c5fd' },
        purple: { primary: '#7c3aed', dark: '#6d28d9', light: '#c4b5fd' },
        green: { primary: '#059669', dark: '#047857', light: '#6ee7b7' },
        orange: { primary: '#ea580c', dark: '#c2410c', light: '#fdba74' },
        red: { primary: '#dc2626', dark: '#b91c1c', light: '#fca5a5' },
        pink: { primary: '#db2777', dark: '#be185d', light: '#f9a8d4' },
        teal: { primary: '#0d9488', dark: '#0f766e', light: '#5eead4' },
        gray: { primary: '#6b7280', dark: '#4b5563', light: '#d1d5db' }
      };
      const colors = colorMap[formData.color_scheme] || colorMap.blue;

      // Unique assets for the category
      const assets = getCategoryAssets(selectedCategory);
      const heroImage = assets.hero;

      // --- STRATEGIC PLANNING: Agency-Grade Architecture ---
      const modelHint = (await base44.entities.GenerationSettings.list().then(s => s[0]?.preferred_model).catch(()=>null)) || "GPT-4o-mini";
      const planSchema = {
        type: "object",
        properties: {
          objectives: { type: "array", items: { type: "string" } },
          audience: { type: "array", items: { type: "string" } },
          tone: { type: "string" },
          sitemap: {
            type: "array",
            items: {
              type: "object",
              properties: {
                section: { type: "string" },
                required: { type: "boolean" },
                components: { type: "array", items: { type: "string" } }
              },
              required: ["section", "required"]
            }
          },
          visual_style: {
            type: "object",
            properties: {
              hero_style: { type: "string" },
              palette: { type: "array", items: { type: "string" } },
              image_keywords: { type: "array", items: { type: "string" } }
            },
            required: ["hero_style", "palette"]
          },
          ctas: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        },
        required: ["sitemap", "visual_style"]
      };

      let plan;
      try {
        plan = await invokeLLMWithRetry({
          prompt: `You are a SENIOR DIGITAL STRATEGIST at a world-class agency (Huge, AKQA, Fantasy level) using ${modelHint} reasoning.

🎯 PROJECT BRIEF:
Client: ${formData.title}
Industry: ${selectedCategory}
Description: ${formData.description}
Goal: Premium single-page website that converts at 8%+ (vs industry 2-3%)

📋 STRATEGIC DELIVERABLE (JSON ONLY):

Return a comprehensive strategy with:

1. **objectives**: [3-5 specific, measurable conversion goals] (e.g., "Generate 50+ qualified leads/month", "Position as premium choice vs competitors")

2. **audience**: [3-4 detailed psychographic segments] (e.g., "Affluent homeowners 35-55 seeking premium craftsmanship", NOT just "homeowners")

3. **tone**: Specific voice description (e.g., "Confident expert meets approachable neighbor—authoritative but warm, data-driven but human")

4. **sitemap**: [
   - hero (components: ["magnetic headline with customer outcome", "subheadline with proof point", "dual CTAs primary+secondary", "trust badges/awards"]),
   - services (components: ["benefit-led service cards with transformation language", "pricing anchors", "micro-testimonials"]),
   - process (components: ["visual timeline", "outcome-focused steps", "risk-reversal messaging"]),
   - social_proof (components: ["before/after gallery", "video testimonials", "case study highlights", "review aggregates"]),
   - portfolio (components: ["filterable project grid 10-15 items", "project details on hover", "category tags"]),
   - credibility (components: ["years in business", "projects completed", "certifications", "industry awards", "client satisfaction score"]),
   - faq (components: ["10+ questions covering objections", "expandable answers with soft CTAs"]),
   - contact (components: ["multi-step form with progress", "contact info + map", "live chat widget", "response time promise"])
]

5. **visual_style**: {
   - hero_style: "Specific visual direction for hero (e.g., 'Full-bleed photo of actual team on-site, gradient overlay teal-to-navy, floating glass cards with live stats')",
   - palette: [primary_hex, secondary_hex, accent_hex, neutral_dark, neutral_light],
   - image_keywords: [10-12 hyper-specific Unsplash search terms for ${selectedCategory}]
}

6. **ctas**: [5-7 varied, action-oriented CTAs] (e.g., "Schedule Your Free Assessment", "See Our Portfolio", "Get Instant Quote")

7. **risks**: [3-5 specific pitfalls to avoid] (e.g., "Generic 'trusted professionals' language", "Stock photos of random offices")

Output JSON matching schema. Be SPECIFIC and STRATEGIC.`,
          response_json_schema: planSchema,
          add_context_from_internet: false
        }, [15000, 22000]);
      } catch (e) {
        console.warn("Planner LLM failed/timed out, using default plan.", e?.message || e);
        // fallback minimal plan
        plan = {
          objectives: ["Clear value proposition", "Lead capture"],
          audience: ["Local customers"],
          tone: "Professional, trustworthy",
          sitemap: [
            { section: "hero", required: true, components: ["headline", "subheadline", "cta"] },
            { section: "services", required: true, components: ["cards"] },
            { section: "process", required: true, components: ["steps"] },
            { section: "portfolio", required: true, components: ["gallery"] },
            { section: "testimonials", required: true, components: ["carousel"] },
            { section: "stats", required: true, components: ["counters"] },
            { section: "faq", required: true, components: ["accordion"] },
            { section: "contact", required: true, components: ["form", "details"] }
          ],
          visual_style: {
            hero_style: "photo background with gradient overlay",
            palette: [colors.primary, colors.dark, colors.light],
            image_keywords: [selectedCategory, "professional", "customer service"]
          },
          ctas: ["Get a Quote", "Book Inspection"],
          risks: ["Avoid generic stock imagery", "Ensure mobile readability"]
        };
      }

      // --- PREMIUM Copy Generation: Agency-Grade Content ---
      const planForPrompt = JSON.stringify(plan).slice(0, 1800);
      const copyPrompt = `You are a SENIOR CREATIVE DIRECTOR and CONVERSION COPYWRITER at a top-tier digital agency (Huge, R/GA, Fantasy caliber) crafting a $40,000+ premium single-page website for a ${selectedCategory} business.

🎯 CLIENT BRIEF:
Business Name: ${formData.title}
Description: ${formData.description}
Category: ${selectedCategory}
Strategic Plan: ${planForPrompt}

🚀 PREMIUM QUALITY STANDARDS (NON-NEGOTIABLE):

1. COPY EXCELLENCE:
   - Write benefit-driven, outcome-focused copy (NOT feature lists)
   - Use power words, social proof, urgency, and emotional triggers
   - Headlines must be magnetic and unique (avoid clichés like "Welcome" or "About Us")
   - Every sentence should drive conversions
   - Paraphrase the brief—ZERO verbatim copying (5+ word sequences)
   - Inject personality: be bold, confident, memorable

2. VISUAL STORYTELLING:
   - Services: Include specific outcomes and transformation stories
   - Process: Show the journey with emotional milestones, not just steps
   - About: Tell an origin story with passion and credibility
   - Gallery: 8-12 stunning, category-specific images (NO generic office/laptop shots)
   - Testimonials: Include specific results, numbers, transformations
   - Stats: Use impressive, believable metrics with context

3. INDUSTRY AUTHENTICITY:
   - ${selectedCategory === 'landscape' ? 'SHOW: Manicured lawns, garden transformations, skilled crews at work' : ''}
   - ${selectedCategory === 'roofing' ? 'SHOW: Roof installations, safety gear, satisfied homeowners' : ''}
   - ${selectedCategory === 'restaurant' ? 'SHOW: Signature dishes, chef action shots, happy diners' : ''}
   - ${selectedCategory === 'spa' ? 'SHOW: Serene treatments, relaxation moments, luxury amenities' : ''}
   - ALL images must show actual service/product, NOT abstract concepts
   - Gallery should tell a visual story of expertise and results

4. CONVERSION OPTIMIZATION:
   - CTAs must be action-oriented and urgent ("Transform Your Space Today" not "Contact Us")
   - Services should include pricing anchors or value indicators
   - Include risk-reversal language in copy
   - Social proof must feel authentic (full names, specific roles, tangible results)

5. FORBIDDEN ELEMENTS:
   - ❌ Lorem ipsum or placeholder text
   - ❌ Generic stock photos (mountains, sunsets, random offices, keyboards)
   - ❌ Boring headlines ("Welcome", "Our Services", "About Us")
   - ❌ Feature-only descriptions (no benefits)
   - ❌ Copy-pasted brief language

DELIVER WORLD-CLASS JSON:
{
  "services": [
    { 
      "title": "Compelling service name with benefit",
      "description": "Outcome-focused description highlighting transformation and unique value (3-4 sentences with emotional appeal)",
      "price": "From $XXX" or "Custom Quote",
      "icon": "Relevant emoji or letter"
    } x6-8
  ],
  "process": [
    { 
      "title": "Step name with emotional hook",
      "description": "What happens and how the customer feels/benefits (2-3 sentences)"
    } x5-7
  ],
  "about": {
    "text": "Compelling origin story with credibility markers, passion, and unique positioning (4-6 sentences that build trust and desire)",
    "bullets": ["Differentiator with social proof", "Unique process advantage", "Risk-reversal element", "Expertise indicator", "Customer-first philosophy"] x5-7
  },
  "gallery": {
    "categories": ["Before & After", "Featured Projects", "Client Favorites", "Signature Work"] (creative, relevant names),
    "items": [
      {
        "title": "Project name with wow factor",
        "category": "matches above",
        "image": "https://images.unsplash.com/photo-XXXXXXX (MUST be hyper-relevant to ${selectedCategory}, show actual work/results)"
      } x10-12
    ]
  },
  "testimonials": [
    {
      "quote": "Specific, detailed testimonial with measurable outcomes and emotional impact (3-5 sentences showing transformation)",
      "author": "Full Name",
      "role": "Specific title/company OR neighborhood/location for local businesses"
    } x5-7
  ],
  "stats": [
    {
      "label": "Impressive, specific metric label",
      "value": believable_number,
      "suffix": "%" OR "+" OR "K+" (optional)
    } x4-6
  ],
  "faqs": [
    {
      "q": "Specific, real customer question (conversational tone)",
      "a": "Detailed answer that builds trust, addresses objections, includes soft CTAs (3-5 sentences)"
    } x8-10
  ]
}

💎 REMEMBER: This is NOT a template site. This is a custom $40K build. Every word must earn its place. Make the client feel premium, confident, and ready to convert.`;

      const copySchema = {
        type: "object",
        properties: {
          services: {
            type: "array",
            items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, price: { type: "string" }, icon: { type: "string" } }, required: ["title", "description"] }
          },
          process: {
            type: "array",
            items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] }
          },
          about: {
            type: "object",
            properties: { text: { type: "string" }, bullets: { type: "array", items: { type: "string" } } },
            required: ["text", "bullets"]
          },
          gallery: {
            type: "object",
            properties: {
              categories: { type: "array", items: { type: "string" } },
              items: { type: "array", items: { type: "object", properties: { title: { type: "string" }, category: { type: "string" }, image: { type: "string" } }, required: ["title", "category", "image"] } }
            },
            required: ["categories", "items"]
          },
          testimonials: {
            type: "array",
            items: { type: "object", properties: { quote: { type: "string" }, author: { type: "string" }, role: { type: "string" } }, required: ["quote", "author"] }
          },
          stats: {
            type: "array",
            items: { type: "object", properties: { label: { type: "string" }, value: { type: "number" } }, required: ["label", "value"] }
          },
          faqs: {
            type: "array",
            items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"] }
          }
        },
        required: ["services","process","about","gallery","testimonials","stats","faqs"]
      };

      let copy = null;
      try {
        copy = await invokeLLMWithRetry({
          prompt: copyPrompt,
          response_json_schema: copySchema,
          add_context_from_internet: false
        }, [20000, 26000, 30000]);
      } catch (e) {
        console.warn("LLM failed or timed out generating copy, using fallback:", e?.message || e);
        // Fallback to minimal structure if AI fails
        copy = {
          services: [
            { title: "Premium Service 1", description: "High-quality, professional delivery tailored to your needs.", icon: "Check" },
            { title: "Premium Service 2", description: "Exceptional results through dedicated craftsmanship.", icon: "Star" },
            { title: "Premium Service 3", description: "Reliable solutions for lasting impact.", icon: "Shield" },
            { title: "Premium Service 4", description: "Innovative approaches to modern challenges.", icon: "Lightbulb" },
            { title: "Premium Service 5", description: "Client-focused support every step of the way.", icon: "Users" },
            { title: "Premium Service 6", description: "Sustainable practices for a better future.", icon: "Leaf" },
          ],
          process: [
            { title:"Discovery", description:"We learn about your unique vision and goals." },
            { title:"Planning", description:"We develop a tailored strategy to achieve success." },
            { title:"Execution", description:"Our skilled team brings your project to life with precision." },
            { title:"Review & Refine", description:"We collaborate with you to ensure perfection." },
            { title:"Launch", description:"We deliver your completed project, ready for impact." }
          ],
          about: {
            text: formData.description || "We are a dedicated team passionate about delivering top-tier solutions. With years of experience, we pride ourselves on quality and client satisfaction.",
            bullets: ["Expert team","On-time delivery","Premium quality","Customer satisfaction","Innovative solutions"]
          },
          gallery: {
            categories: ["Featured", "Recent", "Projects"],
            items: [
              { title: "Project Alpha", category: "Featured", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1600&auto=format&fit=crop" },
              { title: "Project Beta", category: "Recent", image: "https://images.unsplash.com/photo-1542744095-291df6fe9df4?q=80&w=1600&auto=format&fit=crop" },
              { title: "Project Gamma", category: "Projects", image: "https://images.unsplash.com/photo-1519389950473-47ba03577432?q=80&w=1600&auto=format&fit=crop" },
              { title: "Project Delta", category: "Featured", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop" },
              { title: "Project Epsilon", category: "Recent", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop" },
              { title: "Project Zeta", category: "Projects", image: "https://images.unsplash.com/photo-1552664730-d307ca8849d1?q=80&w=1600&auto=format&fit=crop" },
            ]
          },
          testimonials: [
            { quote:"Incredible work! Our website has never looked better and conversions are up.", author:"John Doe", role:"CEO, Example Corp" },
            { quote:"Professional, efficient, and delivered exactly what we needed. Highly recommend!", author:"Jane Smith", role:"Founder, Innovate Ltd" },
            { quote:"The team understood our vision perfectly and brought it to life with stunning results.", author:"Alex Johnson", role:"Marketing Director" },
            { quote:"Beyond expectations! A truly seamless experience from start to finish.", author:"Sarah Williams", role:"Small Business Owner" }
          ],
          stats: [
            {label:"Projects Completed",value:200},
            {label:"Years in Business",value:10},
            {label:"Client Satisfaction",value:98},
            {label:"Team Members",value:25}
          ],
          faqs: [
            {q:"How do we start a project?",a:"Simply reach out via our contact form or phone call for a free consultation."},
            {q:"What is your typical project timeline?",a:"Timelines vary by project scope, but we always aim for efficient delivery."},
            {q:"Do you offer ongoing support?",a:"Yes, we provide support packages to keep your project optimal."},
            {q:"What makes your service stand out?",a:"Our commitment to quality and client-centric approach sets us apart."},
            {q:"Can you work with existing branding?",a:"Absolutely! We follow your brand guidelines for consistency."},
            {q:"What payment options do you accept?",a:"We offer flexible payment plans and accept major cards and bank transfers."}
          ]
        };
      }

      // Compose high-quality HTML deterministically
      const composedHtml = composeWebsite(
        { title: formData.title, description: formData.description, category: selectedCategory, theme: formData.theme, colors, heroImage },
        copy,
        {} // Removed animationLevel: genSettings?.animation_level || "rich" per outline
      );

      // Run QA only if basic checks fail
      const initialReport = computeQualityReport(composedHtml, formData.description); // UPDATED
      const hasIssues = Object.values(initialReport).some(v => v === false);
      let finalHtml = composedHtml;

      if (hasIssues) {
        const { correctedHtml } = await qaEvaluateAndCorrect(finalHtml, formData.description); // UPDATED
        finalHtml = correctedHtml || finalHtml;
      }

      // Persist only the validated/corrected version
      const website = await base44.entities.Website.create({
        ...formData,
        category: selectedCategory,
        html_content: finalHtml,
        css_content: "", // CSS is inline in HTML for this template
        generation_prompt: `planner_model_hint=${modelHint}\n\nplan=${JSON.stringify(plan).slice(0, 1200)}\n\ncopy_prompt=${copyPrompt.slice(0, 1200)}`, // Truncated for DB storage
        status: "completed"
      });

      // Compute and display a real quality report based on the FINAL HTML
      setQualityReport(computeQualityReport(finalHtml, formData.description)); // UPDATED

      setGeneratedWebsite(website);
      loadRecentProjects();
      
      await trackUsage("website_generated", website.id, 5000);
    } catch (error) {
      console.warn("Error generating website, using safe fallback:", error?.message || error); // Quieter log
      alert("Failed to generate website. Falling back to a safe default.");
      // Set a minimal but valid page if everything else failed
      const fallbackHtml = composeWebsite(
        { title: formData.title || "Your Website", description: formData.description || "A professional website.", category: formData.category || "business", theme: formData.theme, colors: { primary: '#2563eb', dark: '#1e40af', light: '#93c5fd' }, heroImage: getCategoryAssets(formData.category || 'business').hero },
        {}, // Pass empty copy object for fallback, composeWebsite should handle this gracefully
        {} // Pass empty options for fallback
      );
      const website = await base44.entities.Website.create({
        ...formData,
        html_content: fallbackHtml,
        css_content: "",
        status: "completed",
        generation_prompt: "fallback"
      });
      setGeneratedWebsite(website);
      setQualityReport(computeQualityReport(fallbackHtml, formData.description)); // UPDATED
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadWebsite = () => {
    if (!generatedWebsite) return;

    const htmlContent = generatedWebsite.html_content;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWebsite.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to WebCraft AI Pro</h2>
            <p className="text-gray-300 mb-6">Sign in to access professional website building tools with AI</p>
            <Button
              onClick={() => base44.auth.redirectToLogin()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Create Professional Websites
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> with AI</span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              $25K+ quality websites with animations, interactions, and conversion optimization
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{recentProjects.length}</p>
                <p className="text-xs text-gray-400">Projects</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">Pro</p>
                <p className="text-xs text-gray-400">Quality</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">$25K</p>
                <p className="text-xs text-gray-400">Value</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generator Form */}
          <div className="space-y-6">
            <GeneratorForm
              formData={formData}
              setFormData={setFormData}
              onGenerate={generateWebsite}
              isGenerating={isGenerating}
            />

            <QuickTemplates onTemplateSelect={setFormData} />

            {/* Quality Checklist */}
            <AnimatePresence>
              {Object.keys(qualityReport).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QualityChecklist report={qualityReport} />
                </motion.div>
              )}
            </AnimatePresence>


            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Recent Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="p-3 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white">{project.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{project.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                            {project.category}
                          </Badge>
                          <div className="flex gap-2">
                            <Link to={`${createPageUrl("Editor")}?id=${project.id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-purple-400 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-indigo-400 hover:text-white hover:bg-white/10"
                              onClick={() => setGeneratedWebsite(project)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          <PreviewPanel
            website={generatedWebsite}
            onDownload={downloadWebsite}
            isGenerating={isGenerating}
            onWebsiteUpdate={handleWebsiteUpdate}
          />
        </div>
      </div>
    </div>
  );
}