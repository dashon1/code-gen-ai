import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Copy, CheckCircle2, AlertCircle, Shield } from "lucide-react";

export default function DomainManager() {
  const [domains, setDomains] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [selectedWebsite, setSelectedWebsite] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const [domainList, siteList] = await Promise.all([
      base44.entities.CustomDomain.filter({ created_by: user.email }),
      base44.entities.Website.filter({ created_by: user.email })
    ]);
    setDomains(domainList || []);
    setWebsites(siteList || []);
  };

  const addDomain = async () => {
    if (!domainName.trim() || !selectedWebsite) {
      alert("Enter domain and select website");
      return;
    }

    const token = Math.random().toString(36).substring(2, 15);
    await base44.entities.CustomDomain.create({
      website_id: selectedWebsite,
      domain_name: domainName,
      verification_status: "pending",
      verification_token: token
    });

    alert(`Domain added! Add this TXT record to your DNS:\n\nName: _webcraft-verify\nValue: ${token}`);
    loadData();
    setShowAdd(false);
    setDomainName("");
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Globe className="w-10 h-10 text-indigo-400" />
            Custom Domains
          </h1>
          <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </div>

        {showAdd && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 mb-6">
            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="yourdomain.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 text-white rounded-lg"
              >
                <option value="">Select website</option>
                {websites.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={addDomain} className="bg-green-600">Add Domain</Button>
                <Button onClick={() => setShowAdd(false)} variant="outline" className="border-white/20 text-white">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{domain.domain_name}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge className={
                        domain.verification_status === "verified" ? "bg-green-600" :
                        domain.verification_status === "failed" ? "bg-red-600" : "bg-yellow-600"
                      }>
                        {domain.verification_status === "verified" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {domain.verification_status}
                      </Badge>
                      {domain.ssl_enabled && (
                        <Badge className="bg-blue-600">
                          <Shield className="w-3 h-3 mr-1" />
                          SSL
                        </Badge>
                      )}
                    </div>
                    {domain.verification_status === "pending" && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-xs text-yellow-300 mb-2">Add this TXT record to DNS:</p>
                        <div className="flex gap-2">
                          <code className="text-xs text-white bg-black/20 px-2 py-1 rounded">
                            _webcraft-verify = {domain.verification_token}
                          </code>
                          <Button
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(domain.verification_token);
                              alert("Token copied!");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {domains.length === 0 && (
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-12 text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Custom Domains</h3>
                <p className="text-gray-300">Connect your own domain to your websites (Pro plan required)</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}