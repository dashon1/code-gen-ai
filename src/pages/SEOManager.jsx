
import React, { useState, useEffect } from "react";
import { Website } from "@/entities/Website";
import { Page } from "@/entities/Page";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  FileText,
  RefreshCw,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function SEOManager() {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [seoData, setSeoData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    canonical_url: "",
    robots: "index,follow"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoScore, setSeoScore] = useState(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      loadPages(selectedWebsite.id);
    }
  }, [selectedWebsite]);

  useEffect(() => {
    if (selectedPage) {
      setSeoData({
        meta_title: selectedPage.meta_title || "",
        meta_description: selectedPage.meta_description || "",
        meta_keywords: selectedPage.meta_keywords || "",
        og_image: selectedPage.og_image || "",
        canonical_url: selectedPage.canonical_url || "",
        robots: selectedPage.robots || "index,follow"
      });
    }
  }, [selectedPage]);

  const loadWebsites = async () => {
    const allWebsites = await Website.list("-created_date");
    setWebsites(allWebsites);
    if (allWebsites.length > 0) {
      setSelectedWebsite(allWebsites[0]);
    }
  };

  const loadPages = async (websiteId) => {
    const websitePages = await Page.filter({ website_id: websiteId });
    
    // If no pages exist, create a default homepage
    if (websitePages.length === 0) {
      await createDefaultHomepage(websiteId);
      return;
    }
    
    setPages(websitePages);
    if (websitePages.length > 0) {
      setSelectedPage(websitePages[0]);
    }
  };

  const createDefaultHomepage = async (websiteId) => {
    setIsCreatingPage(true);
    try {
      const website = websites.find(w => w.id === websiteId);
      const homePage = await Page.create({
        website_id: websiteId,
        title: "Home",
        slug: "home",
        html_content: website?.html_content || "",
        css_content: website?.css_content || "",
        meta_title: website?.title || "Home",
        meta_description: website?.description || "",
        is_homepage: true
      });
      
      setPages([homePage]);
      setSelectedPage(homePage);
    } catch (error) {
      console.error("Error creating default homepage:", error);
    }
    setIsCreatingPage(false);
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setIsSaving(true);
    try {
      const updatedPage = await Page.update(selectedPage.id, seoData);
      setSelectedPage(updatedPage);
      alert("SEO settings saved successfully!");
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      alert("Failed to save SEO settings.");
    }
    setIsSaving(false);
  };

  const analyzeSEO = async () => {
    if (!selectedPage) return;

    setIsAnalyzing(true);
    setSeoScore(null);

    try {
      const prompt = `You are an SEO expert analyzing a web page. 

**Page Details:**
Title: ${selectedPage.title}
Current Meta Title: ${seoData.meta_title || "Not set"}
Current Meta Description: ${seoData.meta_description || "Not set"}
Keywords: ${seoData.meta_keywords || "Not set"}

**Page Content (HTML):**
${selectedPage.html_content}

**Analysis Task:**
1. Provide an SEO score (0-100)
2. List critical issues
3. List recommendations
4. Suggest optimized meta title (55-60 characters)
5. Suggest optimized meta description (150-160 characters)
6. Suggest relevant keywords

Be specific and actionable.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            issues: { 
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            suggested_meta_title: { type: "string" },
            suggested_meta_description: { type: "string" },
            suggested_keywords: { type: "string" }
          }
        }
      });

      setSeoScore(result);
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      alert("Failed to analyze SEO.");
    }

    setIsAnalyzing(false);
  };

  const applySuggestions = () => {
    if (!seoScore) return;

    setSeoData({
      ...seoData,
      meta_title: seoScore.suggested_meta_title || seoData.meta_title,
      meta_description: seoScore.suggested_meta_description || seoData.meta_description,
      meta_keywords: seoScore.suggested_keywords || seoData.meta_keywords
    });
  };

  if (isCreatingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
            <p className="text-white">Creating default homepage for SEO management...</p>
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
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Search className="w-10 h-10 text-indigo-400" />
                SEO Manager
              </h1>
              <p className="text-gray-300 mt-2">
                Optimize your website's search engine performance
              </p>
            </div>
          </div>

          {/* Website & Page Selector */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-white mb-2 block">Select Website</Label>
              <Select 
                value={selectedWebsite?.id} 
                onValueChange={(val) => {
                  const website = websites.find(w => w.id === val);
                  setSelectedWebsite(website);
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose a website" />
                </SelectTrigger>
                <SelectContent>
                  {websites.map((website) => (
                    <SelectItem key={website.id} value={website.id}>
                      {website.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="text-white mb-2 block">Select Page</Label>
              <Select
                value={selectedPage?.id}
                onValueChange={(val) => {
                  const page = pages.find(p => p.id === val);
                  setSelectedPage(page);
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose a page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title} ({page.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {selectedPage ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SEO Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Meta Title</Label>
                    <Input
                      value={seoData.meta_title}
                      onChange={(e) => setSeoData({...seoData, meta_title: e.target.value})}
                      placeholder="Enter meta title (55-60 characters)"
                      className="bg-white/10 border-white/20 text-white"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {seoData.meta_title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Meta Description</Label>
                    <Textarea
                      value={seoData.meta_description}
                      onChange={(e) => setSeoData({...seoData, meta_description: e.target.value})}
                      placeholder="Enter meta description (150-160 characters)"
                      className="bg-white/10 border-white/20 text-white h-24"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {seoData.meta_description.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Keywords</Label>
                    <Input
                      value={seoData.meta_keywords}
                      onChange={(e) => setSeoData({...seoData, meta_keywords: e.target.value})}
                      placeholder="keyword1, keyword2, keyword3"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">OG Image URL</Label>
                    <Input
                      value={seoData.og_image}
                      onChange={(e) => setSeoData({...seoData, og_image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Canonical URL</Label>
                    <Input
                      value={seoData.canonical_url}
                      onChange={(e) => setSeoData({...seoData, canonical_url: e.target.value})}
                      placeholder="https://example.com/page"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Robots Directive</Label>
                    <Select value={seoData.robots} onValueChange={(val) => setSeoData({...seoData, robots: val})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index,follow">Index, Follow</SelectItem>
                        <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                        <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                        <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
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
                </CardContent>
              </Card>
            </div>

            {/* SEO Analysis */}
            <div className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    SEO Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={analyzeSEO}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Analyze SEO
                      </>
                    )}
                  </Button>

                  {seoScore && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Score */}
                      <div className="text-center p-6 bg-white/5 rounded-xl">
                        <div className="text-5xl font-bold text-white mb-2">
                          {seoScore.score}
                          <span className="text-2xl text-gray-400">/100</span>
                        </div>
                        <Badge 
                          className={
                            seoScore.score >= 80 ? "bg-green-500" :
                            seoScore.score >= 60 ? "bg-yellow-500" :
                            "bg-red-500"
                          }
                        >
                          {seoScore.score >= 80 ? "Excellent" :
                           seoScore.score >= 60 ? "Good" :
                           "Needs Improvement"}
                        </Badge>
                      </div>

                      {/* Issues */}
                      {seoScore.issues && seoScore.issues.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            Issues
                          </h4>
                          <ul className="space-y-2">
                            {seoScore.issues.map((issue, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-red-400">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {seoScore.recommendations && seoScore.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {seoScore.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-green-400">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Apply Suggestions */}
                      <Button
                        onClick={applySuggestions}
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        Apply Suggested Changes
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Page Selected</h3>
              <p className="text-gray-300">
                Select a website and page to manage SEO settings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
