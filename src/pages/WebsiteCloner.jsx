import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function WebsiteCloner() {
  const [website, setWebsite] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get("id");
    if (websiteId) loadWebsite(websiteId);
  }, []);

  const loadWebsite = async (id) => {
    const site = await base44.entities.Website.filter({ id }).then(w => w[0]);
    setWebsite(site);
    setNewTitle(`${site.title} (Copy)`);
  };

  const cloneWebsite = async () => {
    if (!newTitle.trim()) {
      alert("Enter a title for the cloned website");
      return;
    }

    setIsCloning(true);
    const cloned = await base44.entities.Website.create({
      title: newTitle,
      description: website.description,
      category: website.category,
      language: website.language,
      theme: website.theme,
      color_scheme: website.color_scheme,
      html_content: website.html_content,
      css_content: website.css_content,
      status: "completed"
    });

    alert("Website cloned successfully!");
    window.location.href = `${createPageUrl("Editor")}?id=${cloned.id}`;
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
      <Card className="bg-white/5 backdrop-blur-xl border-white/20 max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Clone Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Original: {website?.title}</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New website title"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <Button
            onClick={cloneWebsite}
            disabled={isCloning}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            {isCloning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Clone Website
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}