import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Copy, Trash2, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function SavedTemplates() {
  const [templates, setTemplates] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const [myTemplates, myWebsites] = await Promise.all([
      base44.entities.SavedTemplate.filter({ created_by: user.email }, "-created_date"),
      base44.entities.Website.filter({ created_by: user.email }, "-created_date")
    ]);
    setTemplates(myTemplates || []);
    setWebsites(myWebsites || []);
  };

  const createTemplate = async () => {
    if (!templateName.trim() || !selectedWebsite) {
      alert("Select a website and enter a name");
      return;
    }

    const website = websites.find(w => w.id === selectedWebsite);
    await base44.entities.SavedTemplate.create({
      name: templateName,
      source_website_id: website.id,
      html_content: website.html_content,
      css_content: website.css_content,
      category: website.category,
      is_public: false
    });

    alert("Template saved!");
    loadData();
    setShowCreate(false);
    setTemplateName("");
  };

  const cloneTemplate = async (template) => {
    const newWebsite = await base44.entities.Website.create({
      title: `${template.name} (Copy)`,
      description: "Cloned from template",
      category: template.category || "business",
      html_content: template.html_content,
      css_content: template.css_content,
      status: "completed"
    });

    await base44.entities.SavedTemplate.update(template.id, {
      use_count: (template.use_count || 0) + 1
    });

    alert("Template cloned!");
    window.location.href = `${createPageUrl("Editor")}?id=${newWebsite.id}`;
  };

  const togglePublic = async (template) => {
    await base44.entities.SavedTemplate.update(template.id, {
      is_public: !template.is_public
    });
    loadData();
  };

  const deleteTemplate = async (template) => {
    if (!confirm(`Delete "${template.name}"?`)) return;
    await base44.entities.SavedTemplate.delete(template.id);
    loadData();
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Layers className="w-10 h-10 text-indigo-400" />
            My Templates
          </h1>
          <Button onClick={() => setShowCreate(!showCreate)} className="bg-gradient-to-r from-indigo-500 to-purple-500">
            <Plus className="w-4 h-4 mr-2" />
            Save New Template
          </Button>
        </div>

        {showCreate && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Save Website as Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-lg"
              >
                <option value="">Select a website</option>
                {websites.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={createTemplate} className="bg-gradient-to-r from-green-500 to-teal-500">
                  Save Template
                </Button>
                <Button onClick={() => setShowCreate(false)} variant="outline" className="border-white/20 text-white">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                      {template.category}
                    </Badge>
                    {template.is_public && (
                      <Badge className="bg-green-600">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    )}
                    {template.use_count > 0 && (
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                        {template.use_count} uses
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => cloneTemplate(template)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => togglePublic(template)}
                      variant="outline"
                      className="flex-1 border-white/20 text-white text-xs"
                    >
                      {template.is_public ? "Make Private" : "Share Public"}
                    </Button>
                    <Button
                      onClick={() => deleteTemplate(template)}
                      variant="outline"
                      className="border-white/20 text-red-400 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-12 text-center">
              <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Templates Saved</h3>
              <p className="text-gray-300">Save your favorite websites as reusable templates</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}