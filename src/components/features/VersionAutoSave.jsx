import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

export default function VersionAutoSave({ website, htmlContent, cssContent }) {
  const saveTimer = useRef(null);
  const lastSaved = useRef({ html: "", css: "" });

  useEffect(() => {
    if (!website || !htmlContent) return;

    // Clear existing timer
    if (saveTimer.current) clearTimeout(saveTimer.current);

    // Only save if content actually changed
    if (htmlContent === lastSaved.current.html && cssContent === lastSaved.current.css) {
      return;
    }

    // Auto-save after 3 seconds of no changes
    saveTimer.current = setTimeout(async () => {
      try {
        const versions = await base44.entities.WebsiteVersion.filter(
          { website_id: website.id },
          "-version_number",
          1
        );
        const nextVersion = (versions[0]?.version_number || 0) + 1;

        await base44.entities.WebsiteVersion.create({
          website_id: website.id,
          version_number: nextVersion,
          html_content: htmlContent,
          css_content: cssContent || "",
          change_description: "Auto-save",
          is_auto_save: true
        });

        lastSaved.current = { html: htmlContent, css: cssContent };
      } catch (error) {
        console.warn("Auto-save failed:", error);
      }
    }, 3000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [website, htmlContent, cssContent]);

  return null; // This is a headless component
}