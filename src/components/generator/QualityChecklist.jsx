import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

export default function QualityChecklist({ report }) {
  const items = [
    { key: "hero", label: "Hero has strong headline + CTA" },
    { key: "services", label: "Services grid with pricing badges" },
    { key: "process", label: "Process timeline (4-6 steps)" },
    { key: "portfolio", label: "Portfolio/gallery with interactions" },
    { key: "testimonials", label: "Testimonials carousel" },
    { key: "stats", label: "Stats with animated counters" },
    { key: "faq", label: "FAQ accordion" },
    { key: "contact", label: "Contact form with validation" },
    { key: "mobile", label: "Mobile responsive containers" },
  ];

  if (!report) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Quality Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 text-sm">
          Generate a website to see quality checks here.
        </CardContent>
      </Card>
    );
  }

  const passes = items.filter(i => report[i.key]).length;

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Quality Checklist
        </CardTitle>
        <Badge variant="outline" className="border-white/20 text-gray-200">{passes}/{items.length} passed</Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map(i => (
          <div key={i.key} className="flex items-center gap-2 text-sm">
            {report[i.key] ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-gray-200">{i.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}