import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ShareView() {
  const [website, setWebsite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedWebsite();
  }, []);

  const loadSharedWebsite = async () => {
    try {
      // Extract share token from URL
      const path = window.location.pathname;
      const token = path.split('/share/')[1];

      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      // Find website by share token
      const websites = await base44.entities.Website.filter({ share_token: token, is_public: true });
      
      if (websites.length === 0) {
        setError("Website not found or no longer shared");
        setIsLoading(false);
        return;
      }

      const sharedWebsite = websites[0];
      
      // Increment view count
      await base44.entities.Website.update(sharedWebsite.id, {
        view_count: (sharedWebsite.view_count || 0) + 1
      });

      setWebsite(sharedWebsite);
    } catch (error) {
      console.error("Error loading shared website:", error);
      setError("Failed to load website");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
            <p className="text-white">Loading shared website...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{error || "Website Not Found"}</h2>
            <p className="text-gray-300 mb-6">This website is no longer available or the link is invalid.</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                Create Your Own Website
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">{website.title}</h1>
              <p className="text-gray-300 text-sm">{website.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Eye className="w-4 h-4" />
              <span>{website.view_count || 0} views</span>
            </div>
            <Link to={createPageUrl("Dashboard")}>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Website Content */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
            <iframe
              srcDoc={website.html_content}
              className="w-full h-[calc(100vh-160px)]"
              title={website.title}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 right-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-white text-sm font-semibold mb-2">Create websites like this with AI</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                Try WebCraft AI Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}