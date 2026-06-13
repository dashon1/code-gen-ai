import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Eye, 
  Code, 
  Wand2, 
  ArrowLeft, 
  Download,
  Loader2,
  Sparkles,
  ImageIcon,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import VersionAutoSave from "../components/features/VersionAutoSave";
import CommentsPanel from "../components/features/CommentsPanel";
import { trackUsage, checkQuota } from "@/components/features/UsageTracker";

// Timeout helper to avoid endless spinners on AI edit
const withTimeout = (p, ms = 25000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("AI request timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });

export default function Editor() {
  const [website, setWebsite] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [chatHistory, setChatHistory] = useState([]);
  const [previewRenderKey, setPreviewRenderKey] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [missingId, setMissingId] = useState(false);
  const [loadError, setLoadError] = useState("");    

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get("id");
    if (!websiteId) {
      setMissingId(true);
      return;
    }
    loadWebsite(websiteId);
  }, []);

  const loadWebsite = async (id) => {
    try {
      // Prefer filtering by id; falls back to list if needed
      let sites = await base44.entities.Website.filter({ id }, "-created_date", 1);
      if (!sites || sites.length === 0) {
        sites = await base44.entities.Website.list();
      }
      const site = (sites || []).find((s) => s.id === id);
      if (site) {
        setWebsite(site);
        setHtmlContent(site.html_content || "");
        setCssContent(site.css_content || "");
        setChatHistory([{ role: "assistant", content: "Hello! How can I help you improve your website today?" }]);
      } else {
        setLoadError("Website not found or you don’t have access.");
      }
    } catch (error) {
      console.error("Error loading website:", error);
      setLoadError("Failed to load the website. Please try again from Projects.");
    }
  };

  const saveWebsite = async () => {
    if (!website) return;

    setIsSaving(true);
    try {
      const updatedWebsite = await base44.entities.Website.update(website.id, {
        html_content: htmlContent,
        css_content: cssContent
      });
      setWebsite(updatedWebsite);
      setPreviewRenderKey((prev) => prev + 1);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Website saved successfully!" }]);
    } catch (error) {
      console.error("Error saving website:", error);
      setChatHistory(prev => [...prev, { role: "assistant", content: "Failed to save website. Please try again." }]);
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { file_url, name: file.name };
      });

      const newImages = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...newImages]);
      
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `✓ Uploaded ${newImages.length} image(s) successfully. You can now reference these in your edit instructions.` 
        }
      ]);
    } catch (error) {
      console.error("Error uploading images:", error);
      setChatHistory((prev) => [...prev, { 
        role: "assistant", 
        content: "Failed to upload images. Please try again." 
      }]);
    }
    setIsUploading(false);
  };

  const removeUploadedImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const regenerateWithAI = async (instruction) => {
    if (!instruction.trim()) {
      alert("Please enter your edit instructions.");
      return;
    }

    const quotaCheck = await checkQuota("ai_edit");
    if (!quotaCheck.allowed) {
      alert(quotaCheck.reason + " Please upgrade your plan.");
      return;
    }
    
    setIsRegenerating(true);
    const userMessage = { role: "user", content: instruction };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentInstruction = instruction; 
    setEditInstructions(""); 

    try {
      // Build context about uploaded images
      let imageContext = "";
      if (uploadedImages.length > 0) {
        imageContext = `\n\n**User has uploaded ${uploadedImages.length} reference image(s):**\n`;
        uploadedImages.forEach((img, idx) => {
          imageContext += `Image ${idx + 1}: ${img.file_url} (${img.name})\n`;
        });
        imageContext += "\nThese images may highlight areas needing change, show desired styling, or provide visual inspiration. Consider them carefully when applying changes.\n";
      }

      const prompt = `You are a SENIOR FRONTEND ENGINEER at a top digital agency (Fantasy, AKQA, Huge) making surgical edits to a premium website.

🎨 USER REQUEST:
"${currentInstruction}"
${imageContext}

📄 CURRENT WEBSITE CODE:
HTML:
${htmlContent}

CSS:
<style>${cssContent}</style>

⚡ EXECUTION STANDARDS (STRICT):

1. **Precision Surgery**: Apply ONLY requested changes. Touch nothing else.

2. **Premium Visual Quality**:
   - Use modern CSS (backdrop-filter, clamp(), custom properties, grid, flexbox)
   - Add micro-interactions (hover effects, smooth transitions 300-500ms cubic-bezier)
   - Ensure perfect mobile responsiveness (test breakpoints 375px, 768px, 1024px, 1440px)
   - Use subtle animations (fade-ins, scale, slide-ups with IntersectionObserver)

3. **Design System Consistency**:
   - Maintain existing color palette and typography
   - Keep spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
   - Preserve brand voice and tone

4. **Technical Excellence**:
   - All JavaScript must remain functional (carousels, accordions, forms, filters)
   - Ensure accessibility (ARIA labels, keyboard navigation, focus states)
   - Optimize images (lazy loading, proper alt text)
   - Keep semantic HTML structure

5. **Modern Web Standards**:
   - Use CSS Grid & Flexbox for layouts
   - Implement smooth scroll behavior
   - Add loading states for interactive elements
   - Include hover/active/focus states for all interactive elements

6. **FORBIDDEN**:
   - ❌ Breaking existing functionality
   - ❌ Removing content not mentioned
   - ❌ Adding lorem ipsum or placeholder text
   - ❌ Using outdated CSS (float layouts, table-based grids)
   - ❌ Inline styles (use classes and CSS custom properties)

RESPONSE FORMAT (STRICT JSON):
{
  "html_content": "Complete, production-ready HTML with embedded modern CSS and JavaScript",
  "css_content": "Additional CSS if needed (prefer embedded)",
  "explanation": "Concise description of changes made and why (1-2 sentences, non-technical language)"
}

🎯 GOAL: Deliver agency-quality code that looks like a $40K custom build, not a template.`;

      const requestParams = {
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            html_content: { type: "string" },
            css_content: { type: "string" },
            explanation: { type: "string" }
          },
          required: ["html_content", "css_content", "explanation"]
        }
      };

      // Add uploaded images to the request if they exist
      if (uploadedImages.length > 0) {
        requestParams.file_urls = uploadedImages.map(img => img.file_url);
      }

      const result = await withTimeout(
        base44.integrations.Core.InvokeLLM(requestParams),
        25000
      );

      if (!result || !result.html_content || !result.html_content.includes("<body")) {
        throw new Error("Invalid AI response (missing or incomplete HTML).");
      }

      const updatedWebsite = await base44.entities.Website.update(website.id, {
        html_content: result.html_content,
        css_content: result.css_content || "" 
      });

      const assistantMessage = { 
        role: "assistant", 
        content: result.explanation || "Changes applied successfully!" 
      };
      setChatHistory((prev) => [...prev, assistantMessage]);

      setWebsite(updatedWebsite);
      setHtmlContent(result.html_content);
      setCssContent(result.css_content || ""); 
      setPreviewRenderKey((prev) => prev + 1);
      
      await trackUsage("ai_edit", website.id, 2000);
      
      // Clear uploaded images after successful edit
      setUploadedImages([]);
    } catch (error) {
      console.error("Error regenerating:", error);
      const errorMessage = { 
        role: "assistant", 
        content: `Sorry, I couldn't apply those changes. ${error.message}.` 
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsRegenerating(false);
    }
  };

  const downloadWebsite = () => {
    if (!website) return;

    // Combine HTML and CSS for download into a complete HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.title || "Website"}</title>
    <style>${cssContent}</style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;


    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${website.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (missingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-white mb-4">No website selected.</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
                Go to My Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-white">{loadError}</p>
            <div className="mt-4">
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
                  Back to Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
            <p className="text-white">Loading website editor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickEditSuggestions = [
    "Make the hero section taller",
    "Change the color scheme to blue and white",
    "Add a pricing table",
    "Make buttons more prominent",
    "Add more spacing between sections",
    "Change the font to something more modern",
    "Add a video background to hero",
    "Make the navigation transparent"
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <VersionAutoSave website={website} htmlContent={htmlContent} cssContent={cssContent} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{website.title}</h1>
              <p className="text-gray-400 text-sm">{website.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`${createPageUrl("VersionHistory")}?id=${website.id}`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Code className="w-4 h-4 mr-2" />
                Versions
              </Button>
            </Link>
            <Button
              onClick={downloadWebsite}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={saveWebsite}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  AI-Powered Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "ml-auto bg-indigo-500/20 border border-indigo-500/30 text-right"
                            : "mr-auto bg-white/10 border border-white/20 text-left"
                        } max-w-[90%]`} 
                      >
                        <p className="text-xs font-medium text-gray-400 mb-1">
                          {msg.role === "user" ? "You" : "AI Assistant"}
                        </p>
                        <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Upload Section */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Upload Reference Images (optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button
                      onClick={() => document.getElementById('image-upload').click()}
                      disabled={isUploading}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload Images to Show AI
                        </>
                      )}
                    </Button>
                    
                    {/* Display uploaded images */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={img.file_url} 
                              alt={img.name}
                              className="w-full h-24 object-cover rounded-lg border border-white/20"
                            />
                            <button
                              onClick={() => removeUploadedImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <p className="text-xs text-gray-400 mt-1 truncate">{img.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Quick actions:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickEditSuggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditInstructions(suggestion)}
                        className="text-xs text-left justify-start h-auto p-2 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Main Input */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Describe your changes
                  </label>
                  <Textarea
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    placeholder="E.g., 'Make the hero section background blue with animated particles', 'Add a testimonials carousel', 'Change all buttons to have gradient backgrounds'"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-24"
                  />
                </div>
                <Button
                  onClick={() => regenerateWithAI(editInstructions)}
                  disabled={isRegenerating || !editInstructions.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying Changes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Apply Changes with AI
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  💡 Upload images to show the AI exactly what you want changed!
                </p>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-white/10 border-white/20">
                    <TabsTrigger value="html" className="data-[state=active]:bg-white/20">
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="data-[state=active]:bg-white/20">
                      CSS
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="mt-4">
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="bg-white/5 border-white/20 text-white font-mono text-xs h-96"
                    />
                  </TabsContent>
                  <TabsContent value="css" className="mt-4">
                    <Textarea
                      value={cssContent}
                      onChange={(e) => setCssContent(e.target.value)}
                      className="bg-white/5 border-white/20 text-white font-mono text-xs h-96"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white rounded-lg overflow-hidden border-4 border-white/10">
                  <div className="h-[600px] overflow-auto">
                    <iframe
                      key={previewRenderKey} 
                      srcDoc={`<!DOCTYPE html>
                      <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>${website.title || "Website Preview"}</title>
                          <style>${cssContent}</style>
                      </head>
                      <body>
                          ${htmlContent}
                      </body>
                      </html>`}
                      className="w-full h-full border-0"
                      title="Website Preview"
                      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <CommentsPanel websiteId={website.id} />
          </div>
        </div>
      </div>
    </div>
  );
}