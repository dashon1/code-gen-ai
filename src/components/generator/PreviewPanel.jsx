import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Download, Sparkles, Loader2, Send, MessageSquare, Wand2, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { trackUsage, checkQuota } from "@/components/features/UsageTracker";

// Timeout helper to avoid endless spinners
const withTimeout = (p, ms = 25000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("AI request timed out")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });

export default function PreviewPanel({ website, onDownload, isGenerating, onWebsiteUpdate }) {
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]); // NEW: reference images
  const [isUploading, setIsUploading] = useState(false); // NEW: upload state
  const [isGenHero, setIsGenHero] = useState(false); // NEW: AI hero generation state

  // Initialize chat history when website is available or showChat is toggled
  useEffect(() => {
    if (showChat && chatHistory.length === 0) {
      setChatHistory([{ role: "assistant", content: "How can I help you refine your website?" }]);
    }
  }, [website, showChat, chatHistory.length]);

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return { file_url, name: file.name };
        })
      );
      setUploadedImages((prev) => [...prev, ...uploads]);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `✓ Uploaded ${uploads.length} image(s). I'll use them as visual context for edits.` },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = (idx) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // NEW: Generate a hero image via Core.GenerateImage and inject into hero background
  const handleGenerateHeroImage = async () => {
    if (!website) {
      alert("Please generate a website first.");
      return;
    }
    setIsGenHero(true);
    setChatHistory((prev) => [...prev, { role: "assistant", content: "Generating a new hero image based on your website's topic..." }]);

    try {
      // Build a concise prompt using available info (title/category appear in saved website fields)
      const title = website.title || "Business";
      const category = website.category || "business";
      const desc = (website.description || "").slice(0, 220); // Limit description length

      const genPrompt = `Create a high-quality, photo-realistic hero background image for a ${category} website.
Focus on the actual service subject (e.g., for landscaping: manicured lawns, hedges, gardeners at work; for roofing: roof inspection/repair crews).
Avoid generic stock photos of mountains, deserts, beaches, laptops, or generic office scenes.
Mood: premium, clean, professional; composition suited for a full-bleed website header with space for headline overlays.
Business context: "${title}". Brief description: "${desc}"`;

      const { url } = await withTimeout(
        base44.integrations.Core.GenerateImage({ prompt: genPrompt }),
        30000 // Increased timeout for image generation
      );

      if (!url) throw new Error("Image generation returned no URL.");

      // Replace hero background-image URL in CSS; if not found, inject an override <style> before </head>
      let html = website.html_content || "";
      const cssBgRegex = /(background-image:\s*url\(['"]?)([^'")]+)(['"]?\))/gi; // Use global flag for multiple occurrences
      let updatedHtml = html;
      let replaced = false;

      // Try to replace existing background-image in .hero or similar sections
      // This is a simplified approach, a more robust solution might involve parsing CSS
      if (cssBgRegex.test(html)) {
        updatedHtml = html.replace(cssBgRegex, (_, p1, _old, p3) => {
          replaced = true;
          return `${p1}${url}${p3}`;
        });
      }

      // If no background-image was found or replaced, inject a new style rule
      if (!replaced) {
        // Look for common hero section identifiers, add a class if missing, or target existing one
        // This is a basic example; ideally, the AI-generated HTML should have a consistent hero class
        const headEndTag = /<\/head>/i;
        if (headEndTag.test(updatedHtml)) {
          // Attempt to find a hero section and add a class if not present
          const bodyStartTag = /<body[^>]*>/i;
          if (bodyStartTag.test(updatedHtml)) {
            // Check for a section that looks like a hero, e.g., first section after body
            const firstSectionRegex = /(<body[^>]*>\s*)(<section[^>]*>)/i;
            if (firstSectionRegex.test(updatedHtml)) {
              updatedHtml = updatedHtml.replace(firstSectionRegex, (match, bodyTag, sectionTag) => {
                if (!/class="[^"]*hero[^"]*"/.test(sectionTag)) {
                  return `${bodyTag}${sectionTag.replace(/>/, ' class="hero">')}`;
                }
                return match;
              });
            } else {
              // If no section found, might need a more aggressive injection
              // For this simple case, we'll just target a generic .hero class
              // A better solution would involve AI ensuring a .hero class exists.
            }
          }
          updatedHtml = updatedHtml.replace(
            headEndTag,
            `<style>.hero { background-image:url('${url}') !important; background-size: cover !important; background-position: center !important; }</style></head>`
          );
        } else {
          // If no </head>, this HTML is malformed, handle gracefully
          console.warn("HTML missing </head> tag, cannot inject style for hero image.");
          throw new Error("Invalid HTML structure: missing </head> tag.");
        }
      }

      const updated = await base44.entities.Website.update(website.id, { html_content: updatedHtml });
      setChatHistory((prev) => [...prev, { role: "assistant", content: "✅ New hero image generated and applied. The preview has been updated!" }]);
      if (onWebsiteUpdate) {
        onWebsiteUpdate(updated);
      }
    } catch (e) {
      console.error("Error generating hero image:", e);
      setChatHistory((prev) => [...prev, { role: "assistant", content: `Sorry, I couldn't generate the hero image: ${e.message}.` }]);
    } finally {
      setIsGenHero(false);
    }
  };

  const handleQuickEdit = async () => {
    if (!editPrompt.trim() || !website) {
      alert("Please enter your edit instructions.");
      return;
    }

    const quotaCheck = await checkQuota("ai_edit");
    if (!quotaCheck.allowed) {
      alert(quotaCheck.reason + " Upgrade to continue.");
      return;
    }
    
    setIsEditing(true);
    const userMessage = { role: "user", content: editPrompt };
    setChatHistory(prev => [...prev, userMessage]);
    const currentPrompt = editPrompt;
    setEditPrompt(""); // Clear input immediately

    try {
      let imageContext = "";
      if (uploadedImages.length > 0) {
        imageContext = `\n\nUser provided ${uploadedImages.length} reference image(s) for visual guidance:\n` + 
          uploadedImages.map((img, i) => `Image ${i + 1}: ${img.file_url} (${img.name || "reference"})`).join("\n") +
          "\nUse these only as inspiration for styling/structure and to identify sections to modify. Do NOT embed base64 images, use the provided URLs as references or for direct image replacement if contextually appropriate.";
      }

      const prompt = `You are a SENIOR CREATIVE TECHNOLOGIST at a world-class digital agency (Fantasy, AKQA, Huge) implementing client-requested changes to a premium website.

🎨 CLIENT REQUEST:
"${currentPrompt}"
${imageContext}

📄 CURRENT WEBSITE:
${website.html_content}

⚡ PREMIUM EXECUTION STANDARDS:

1. **Surgical Precision**:
   - Change ONLY what's explicitly requested
   - Preserve all existing animations, interactions, forms, and JavaScript
   - Maintain brand consistency (colors, fonts, tone)

2. **Modern CSS Excellence**:
   - Use cutting-edge techniques: backdrop-filter, clamp(), CSS Grid, Flexbox, custom properties
   - Add premium touches: subtle shadows (box-shadow: 0 20px 60px rgba(0,0,0,.15)), smooth transitions (300-500ms cubic-bezier)
   - Implement micro-interactions on hover/active states
   - Ensure flawless responsiveness (mobile-first, fluid typography)

3. **Visual Sophistication**:
   - If adding sections: use modern card designs with gradient borders, glassmorphism effects
   - If changing colors: maintain 60-30-10 rule, ensure WCAG AA contrast
   - If adding animations: use IntersectionObserver for scroll-triggered reveals, keep under 600ms duration
   - If modifying buttons: add gradient backgrounds, hover lift effects (transform: translateY(-2px))

4. **Interactive Enhancement**:
   - All clickable elements must have hover/active/focus states
   - Forms need validation feedback and loading states
   - Carousels/sliders need smooth easing and navigation dots
   - Accordions need smooth expand/collapse with CSS transitions

5. **Industry-Specific Assets**:
   - If adding images: MUST be contextually relevant (NO generic office/mountain/sunset photos)
   - Use Unsplash URLs with proper search terms matching the business category
   - Ensure alt text is descriptive and SEO-friendly

6. **FORBIDDEN ACTIONS**:
   - ❌ Breaking existing JavaScript functionality
   - ❌ Removing content not mentioned in request
   - ❌ Adding lorem ipsum or [placeholder] text
   - ❌ Using outdated CSS patterns (floats for layout, !important spam)
   - ❌ Introducing accessibility regressions

RESPONSE (STRICT JSON):
{
  "html_content": "Complete, production-ready HTML document with modern CSS and functional JavaScript—should look like a $40K agency deliverable",
  "explanation": "Friendly 1-2 sentence summary in plain English of what was improved"
}

🎯 OUTCOME: Client should say "WOW, this looks amazing!" not "it's okay I guess".`;

      const invokeParams = {
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            html_content: { type: "string" },
            explanation: { type: "string" }
          },
          required: ["html_content", "explanation"]
        }
      };

      // NEW: pass files to LLM
      if (uploadedImages.length > 0) {
        invokeParams.file_urls = uploadedImages.map(img => img.file_url);
      }

      const result = await withTimeout(
        base44.integrations.Core.InvokeLLM(invokeParams),
        30000 // Increased timeout for LLM
      );

      if (!result || !result.html_content) {
        throw new Error("Invalid AI response: Missing HTML content.");
      }

      // Validate that html_content doesn't contain obvious error messages or is too short
      if (
        result.html_content.length < 100 ||
        !result.html_content.includes("<body") ||
        !result.html_content.includes("</body")
      ) {
        throw new Error("AI returned invalid or malformed HTML.");
      }

      const updatedWebsite = await base44.entities.Website.update(website.id, {
        html_content: result.html_content
      });

      const assistantMessage = { 
        role: "assistant", 
        content: result.explanation || "Changes applied successfully!" 
      };
      setChatHistory(prev => [...prev, assistantMessage]);

      if (onWebsiteUpdate) {
        onWebsiteUpdate(updatedWebsite);
      }

      await trackUsage("ai_edit", website.id, 2000);

      // NEW: clear images after successful application
      setUploadedImages([]);
    } catch (error) {
      console.error("Error editing website:", error);
      const errorMessage = { 
        role: "assistant", 
        content: `Sorry, I couldn't apply those changes. Error: ${error.message}. Please try rephrasing your request or making it more specific.` 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsEditing(false);
    }
  };

  const quickSuggestions = [
    "Make the hero section taller",
    "Change the color scheme to purple",
    "Add a pricing section",
    "Make the buttons bigger and more prominent",
    "Add more animations to the page",
    "Change the headline to be more exciting",
    "Make the text easier to read",
    "Add a video section"
  ];

  if (isGenerating) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/20">
        <CardContent className="p-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Crafting Your Professional Website...
          </h3>
          <p className="text-gray-300 mb-4">
            Building an industry-specific website with advanced features, animations, and professional design.
          </p>
          <div className="mt-6 space-y-3 text-left bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">Creating animated hero with particle system...</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">Adding exit-intent popups & scroll triggers...</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">Implementing interactive carousels & forms...</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">Adding scroll animations & micro-interactions...</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">Polishing with gradients, shadows & advanced CSS...</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!website) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/20">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Professional Website Preview</h3>
          <p className="text-gray-300 mb-6">
            Your industry-specific website will appear here in real-time.
          </p>
          <div className="bg-white/5 rounded-lg p-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="text-sm font-medium text-white">Animated Backgrounds</p>
                <p className="text-xs text-gray-400">Particle systems & canvas effects</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-medium text-white">Lead Capture System</p>
                <p className="text-xs text-gray-400">Exit-intent, scroll triggers, inline forms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-sm font-medium text-white">Interactive Elements</p>
                <p className="text-xs text-gray-400">Carousels, accordions, counters</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="text-sm font-medium text-white">Scroll Animations</p>
                <p className="text-xs text-gray-400">Fade-ins, parallax, micro-interactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-medium text-white">Fully Responsive</p>
                <p className="text-xs text-gray-400">Touch-optimized for all devices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Preview Card */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowChat(!showChat)}
              size="sm"
              variant={showChat ? "default" : "outline"}
              className={showChat ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "border-white/20 text-white hover:bg-white/10"}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {showChat ? "Hide Chat" : "Edit with AI"}
            </Button>
            <Button
              onClick={onDownload}
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white rounded-lg overflow-hidden border-4 border-white/10">
            <div className="h-96 lg:h-[500px] overflow-auto">
              <iframe
                key={website.updated_date}
                srcDoc={website.html_content}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-scripts allow-forms allow-modals"
              />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-b-lg border-t border-white/10">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Agency Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Professional Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Fully Responsive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Edit Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  AI Editor - Make Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-3 mb-4">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-indigo-500/20 border border-indigo-500/30 ml-8"
                            : "bg-white/10 border border-white/20 mr-8"
                        }`}
                      >
                        <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* NEW: Image Upload + AI Generate Hero */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Upload reference images (optional)
                  </label>
                  <input
                    type="file"
                    id="ai-image-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('ai-image-upload').click()}
                      disabled={isUploading || isGenHero || isEditing}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Add Images"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateHeroImage}
                      disabled={isGenHero || isUploading || isEditing}
                      className="border-white/20 text-white hover:bg-white/10"
                      title="Generate a new, subject-relevant hero background"
                    >
                      {isGenHero ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      AI Generate Hero Image
                    </Button>
                    {uploadedImages.length > 0 && (
                      <span className="text-xs text-gray-400 self-center">
                        {uploadedImages.length} image(s) attached
                      </span>
                    )}
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img.file_url}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            onClick={() => removeUploadedImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-[10px] text-gray-400 mt-1 truncate">{img.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Suggestions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickSuggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditPrompt(suggestion)}
                      className="text-xs text-left justify-start h-auto p-2 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isEditing && handleQuickEdit()}
                    placeholder="Describe the changes you want... (e.g., 'Make the hero section blue and add a video')"
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                    disabled={isEditing || isGenHero || isUploading}
                  />
                  <Button
                    onClick={handleQuickEdit}
                    disabled={isEditing || isGenHero || isUploading || !editPrompt.trim()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    {isEditing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-400">
                  💡 Tip: Be specific! Instead of "make it better", try "make the buttons larger and add a gradient background"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}