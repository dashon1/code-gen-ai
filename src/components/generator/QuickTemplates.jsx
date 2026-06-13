
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const templates = [
  {
    title: "Luxury Spa & Wellness",
    description: "Immersive spa website with animated particle background, exit-intent booking popup, scroll-triggered testimonials carousel, and floating navigation.",
    category: "spa",
    theme: "elegant",
    color_scheme: "teal"
  },
  {
    title: "Professional Plumbing Service",
    description: "Emergency plumbing website with 24/7 call button, animated service cards, real-time booking, trust badges, and interactive pricing calculator.",
    category: "plumbing",
    theme: "corporate",
    color_scheme: "blue"
  },
  {
    title: "Premium Landscaping Services",
    description: "Beautiful landscaping website with before/after image sliders, service showcase, seasonal promotions, and instant quote calculator.",
    category: "landscape",
    theme: "modern",
    color_scheme: "green"
  },
  {
    title: "Expert HVAC Services",
    description: "Professional HVAC website with emergency service booking, maintenance plans, energy calculator, and customer testimonials.",
    category: "hvac",
    theme: "corporate",
    color_scheme: "blue"
  },
  {
    title: "Licensed Electrical Services",
    description: "Electrical contractor website with safety certifications, service areas map, emergency contact, and project portfolio.",
    category: "electrical",
    theme: "corporate",
    color_scheme: "orange"
  },
  {
    title: "Professional Roofing Company",
    description: "Roofing services website with warranty information, material options, free inspection booking, and customer reviews.",
    category: "roofing",
    theme: "bold",
    color_scheme: "red"
  },
  {
    title: "Modern Restaurant & Bar",
    description: "Interactive dining experience with menu showcase carousel, reservation popup, animated food gallery, chef profiles, and online ordering.",
    category: "restaurant",
    theme: "elegant",
    color_scheme: "orange"
  },
  {
    title: "Premium Real Estate Agency",
    description: "Sophisticated property listings with 3D card flips, interactive map, lead magnet for buyer's guide, property tours, and advanced filters.",
    category: "business",
    theme: "modern",
    color_scheme: "gray"
  },
  {
    title: "Boutique Law Firm",
    description: "Professional legal services with case results counter animations, free consultation popup, attorney bio cards with flip effects.",
    category: "business",
    theme: "corporate",
    color_scheme: "blue"
  },
  {
    title: "High-End Salon & Beauty",
    description: "Luxury beauty website with before/after sliders, service menu with animated icons, stylist portfolio carousel, and online booking.",
    category: "spa",
    theme: "elegant",
    color_scheme: "pink"
  },
  {
    title: "Creative Design Agency",
    description: "Award-winning portfolio site with 3D project showcases, parallax scrolling, case study reveals, and animated team section.",
    category: "agency",
    theme: "creative",
    color_scheme: "purple"
  },
  {
    title: "Modern SaaS Product",
    description: "Tech startup landing page with product demos, interactive pricing calculator, feature comparison table, animated statistics.",
    category: "startup",
    theme: "modern",
    color_scheme: "blue"
  },
  {
    title: "Fitness & Gym Studio",
    description: "Energetic fitness website with class schedule, trainer profiles with video intros, membership tiers, and transformation gallery.",
    category: "business",
    theme: "bold",
    color_scheme: "red"
  },
  {
    title: "Boutique E-Commerce Store",
    description: "Premium online shop with product quick-view, animated cart, wishlist functionality, size guide popup, and customer reviews.",
    category: "ecommerce",
    theme: "elegant",
    color_scheme: "pink"
  },
  {
    title: "Medical Practice",
    description: "Professional healthcare website with appointment booking, insurance verification, patient portal access, and doctor bios.",
    category: "business",
    theme: "corporate",
    color_scheme: "blue"
  },
  {
    title: "Nonprofit Organization",
    description: "Impactful charity website with donation forms, volunteer signup, impact statistics with animations, and success stories carousel.",
    category: "nonprofit",
    theme: "modern",
    color_scheme: "green"
  },
  {
    title: "Auto Repair & Detailing",
    description: "Car service center with appointment booking, service menu with pricing, customer testimonials, loyalty program, and live chat.",
    category: "business",
    theme: "bold",
    color_scheme: "red"
  },
  {
    title: "Wedding Photography",
    description: "Romantic photography portfolio with stunning galleries, package pricing, client testimonials, booking calendar, and cinematic animations.",
    category: "portfolio",
    theme: "elegant",
    color_scheme: "pink"
  },
  {
    title: "Pet Grooming & Care",
    description: "Adorable pet service site with grooming packages, pet gallery, online booking, loyalty rewards, and pet care tips blog.",
    category: "business",
    theme: "creative",
    color_scheme: "purple"
  },
  {
    title: "Dental Practice",
    description: "Modern dental clinic with service details, dentist profiles, insurance accepted, patient forms, appointment booking, and virtual tours.",
    category: "business",
    theme: "corporate",
    color_scheme: "blue"
  },
  {
    title: "Coffee Shop & Café",
    description: "Cozy café website with menu showcase, daily specials, online ordering, rewards program, event calendar, and location map.",
    category: "restaurant",
    theme: "modern",
    color_scheme: "orange"
  },
  {
    title: "Yoga & Meditation Studio",
    description: "Serene wellness site with class schedules, instructor bios, membership options, mindfulness blog, and meditation timer.",
    category: "spa",
    theme: "elegant",
    color_scheme: "teal"
  },
  {
    title: "Home Renovation Contractor",
    description: "Construction company with project portfolio, service areas, free estimate forms, timeline visualizer, and financing options.",
    category: "business",
    theme: "bold",
    color_scheme: "gray"
  },
  {
    title: "Fashion E-Commerce",
    description: "Trendy online fashion store with lookbooks, size guides, virtual try-on, style quiz, wish lists, and influencer collaborations.",
    category: "ecommerce",
    theme: "elegant",
    color_scheme: "pink"
  },
  {
    title: "Financial Advisor",
    description: "Professional financial services with investment calculator, retirement planning tools, client portal, market insights, and consultation booking.",
    category: "business",
    theme: "corporate",
    color_scheme: "blue"
  },
  {
    title: "Interior Design Studio",
    description: "Sophisticated design portfolio with 3D room visualizer, style quiz, project galleries, testimonials, and consultation scheduling.",
    category: "business",
    theme: "elegant",
    color_scheme: "gray"
  },
  {
    title: "Moving & Storage Company",
    description: "Relocation service with instant quote calculator, packing services, storage units, moving checklist, and customer reviews.",
    category: "business",
    theme: "modern",
    color_scheme: "blue"
  },
  {
    title: "Accounting & Tax Services",
    description: "Professional CPA firm with service offerings, tax calculator, document upload portal, appointment booking, and tax tips blog.",
    category: "business",
    theme: "corporate",
    color_scheme: "green"
  },
  {
    title: "Event Venue & Catering",
    description: "Elegant event space with 3D venue tours, package pricing, availability calendar, menu options, testimonials, and inquiry forms.",
    category: "business",
    theme: "elegant",
    color_scheme: "purple"
  },
  {
    title: "Tutoring & Education Center",
    description: "Learning center with subject offerings, tutor profiles, scheduling system, progress tracking, resources library, and parent testimonials.",
    category: "education",
    theme: "modern",
    color_scheme: "blue"
  },
  {
    title: "Pest Control Services",
    description: "Extermination company with pest identification guide, treatment plans, emergency booking, service guarantees, and prevention tips.",
    category: "business",
    theme: "corporate",
    color_scheme: "green"
  },
  {
    title: "Jewelry Store",
    description: "Luxury jewelry site with product zoom, custom design tool, appointment booking, care guides, certification details, and engagement rings.",
    category: "ecommerce",
    theme: "elegant",
    color_scheme: "pink"
  },
  {
    title: "Marketing Agency",
    description: "Digital marketing firm with case studies, ROI calculator, service packages, team showcase, client logos, and free audit offer.",
    category: "agency",
    theme: "modern",
    color_scheme: "purple"
  },
  {
    title: "Senior Living Community",
    description: "Retirement community with virtual tours, amenities showcase, care levels, resident stories, event calendar, and inquiry forms.",
    category: "business",
    theme: "elegant",
    color_scheme: "blue"
  },
  {
    title: "Craft Brewery & Taproom",
    description: "Artisan brewery with beer menu, tasting notes, food pairings, tour booking, merchandise shop, and upcoming events.",
    category: "restaurant",
    theme: "creative",
    color_scheme: "orange"
  },
  {
    title: "Dog Training Services",
    description: "Professional dog training with class schedules, trainer certifications, training methods, success stories, and behavioral tips blog.",
    category: "business",
    theme: "creative",
    color_scheme: "purple"
  }
];

export default function QuickTemplates({ onTemplateSelect }) {
  const [remoteTemplates, setRemoteTemplates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const t = await base44.entities.Template.filter({ enabled: true }, "-created_date", 100);
        setRemoteTemplates(t || []);
      } catch (e) {
        // ignore, fallback to local list
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleTemplateSelect = (template) => {
    onTemplateSelect(prev => ({
      ...prev,
      ...template
    }));
  };

  const list = remoteTemplates.length > 0 ? remoteTemplates : templates;

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          {remoteTemplates.length > 0 ? "Admin Templates" : "Premium Templates"} ({list.length} Options)
        </CardTitle>
        <p className="text-sm text-gray-400 mt-2">
          {loading ? "Loading templates..." : "Start with a professionally designed template optimized for conversions"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {list.map((template, index) => (
            <Button
              key={template.id || index}
              variant="ghost"
              onClick={() => handleTemplateSelect({
                title: template.title,
                description: template.description || "",
                category: template.category,
                theme: template.theme || "modern",
                color_scheme: template.color_scheme || "blue"
              })}
              className="h-auto p-4 justify-start text-left hover:bg-white/10 border border-white/10 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 group"
            >
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 flex-shrink-0" />
                  <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-sm">
                    {template.title}
                  </p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {template.description || "High-converting, premium layout"}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </Card>
  );
}
