import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Eye, User, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function VersionHistory() {
  const [website, setWebsite] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get("id");
    if (websiteId) loadData(websiteId);
  }, []);

  const loadData = async (websiteId) => {
    setIsLoading(true);
    const [site, versionList] = await Promise.all([
      base44.entities.Website.filter({ id: websiteId }).then(w => w[0]),
      base44.entities.WebsiteVersion.filter({ website_id: websiteId }, "-created_date")
    ]);
    setWebsite(site);
    setVersions(versionList || []);
    setIsLoading(false);
  };

  const restoreVersion = async (version) => {
    if (!window.confirm(`Restore to version ${version.version_number}? Current version will be saved.`)) return;
    
    setIsRestoring(true);
    // Save current as new version first
    await base44.entities.WebsiteVersion.create({
      website_id: website.id,
      version_number: (versions[0]?.version_number || 0) + 1,
      html_content: website.html_content,
      css_content: website.css_content,
      change_description: "Before restore",
      is_auto_save: false
    });

    // Restore selected version
    await base44.entities.Website.update(website.id, {
      html_content: version.html_content,
      css_content: version.css_content
    });

    alert("Version restored successfully!");
    loadData(website.id);
    setIsRestoring(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`${createPageUrl("Editor")}?id=${website?.id}`}>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <History className="w-8 h-8 text-indigo-400" />
              Version History
            </h1>
            <p className="text-gray-300">{website?.title}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">All Versions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {versions.map((version, idx) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedVersion(version)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedVersion?.id === version.id
                        ? 'bg-indigo-500/20 border-indigo-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={version.is_auto_save ? "bg-gray-600" : "bg-blue-600"}>
                        v{version.version_number}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {format(new Date(version.created_date), "MMM d, HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-white">{version.change_description || "Auto-saved"}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <User className="w-3 h-3" />
                      {version.created_by}
                    </div>
                  </motion.div>
                ))}
                {versions.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No version history yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedVersion ? (
              <Card className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Version {selectedVersion.version_number} Preview</CardTitle>
                    <Button
                      onClick={() => restoreVersion(selectedVersion)}
                      disabled={isRestoring}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      {isRestoring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                      Restore This Version
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-white rounded-lg overflow-hidden border-4 border-white/10">
                    <div className="h-[600px] overflow-auto">
                      <iframe
                        srcDoc={selectedVersion.html_content}
                        className="w-full h-full"
                        title="Version Preview"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardContent className="p-12 text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Version</h3>
                  <p className="text-gray-300">Click a version on the left to preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}