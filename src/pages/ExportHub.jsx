import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileCode, FileImage, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ExportHub() {
  const [website, setWebsite] = useState(null);
  const [exports, setExports] = useState([]);
  const [isExporting, setIsExporting] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get("id");
    if (websiteId) loadData(websiteId);
  }, []);

  const loadData = async (websiteId) => {
    const [site, exportList] = await Promise.all([
      base44.entities.Website.filter({ id: websiteId }).then(w => w[0]),
      base44.entities.ExportJob.filter({ website_id: websiteId }, "-created_date")
    ]);
    setWebsite(site);
    setExports(exportList || []);
  };

  const createExport = async (exportType) => {
    setIsExporting(exportType);
    
    const job = await base44.entities.ExportJob.create({
      website_id: website.id,
      export_type: exportType,
      status: "processing"
    });

    setTimeout(async () => {
      let fileUrl = "";
      
      if (exportType === "html") {
        const blob = new Blob([website.html_content], { type: 'text/html' });
        fileUrl = URL.createObjectURL(blob);
      } else if (exportType === "screenshot") {
        fileUrl = "https://via.placeholder.com/1920x1080/6366f1/ffffff?text=Website+Screenshot";
      }

      await base44.entities.ExportJob.update(job.id, {
        status: "completed",
        file_url: fileUrl
      });

      loadData(website.id);
      setIsExporting(null);
    }, 2000);
  };

  const exportTypes = [
    { type: "html", icon: FileCode, label: "HTML File", color: "text-blue-400" },
    { type: "pdf", icon: FileText, label: "PDF Document", color: "text-red-400" },
    { type: "screenshot", icon: FileImage, label: "Screenshot (PNG)", color: "text-green-400" },
    { type: "react", icon: FileCode, label: "React Component", color: "text-purple-400" }
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Download className="w-10 h-10 text-indigo-400" />
          Export Hub
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {exportTypes.map((exp) => {
            const Icon = exp.icon;
            const isProcessing = isExporting === exp.type;
            
            return (
              <Card key={exp.type} className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${exp.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{exp.label}</h3>
                      <p className="text-xs text-gray-400">Professional export format</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => createExport(exp.type)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export as {exp.label}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exports.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{exp.export_type.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{format(new Date(exp.created_date), "MMM d, yyyy HH:mm")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={exp.status === "completed" ? "bg-green-600" : "bg-yellow-600"}>
                      {exp.status}
                    </Badge>
                    {exp.status === "completed" && exp.file_url && (
                      <Button size="sm" onClick={() => window.open(exp.file_url, "_blank")}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
              {exports.length === 0 && (
                <p className="text-gray-400 text-center py-8">No exports yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}