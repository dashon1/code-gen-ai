import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Trophy, Play, Pause } from "lucide-react";

export default function ABTesting() {
  const [website, setWebsite] = useState(null);
  const [tests, setTests] = useState([]);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [testName, setTestName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get("id");
    if (websiteId) loadData(websiteId);
  }, []);

  const loadData = async (websiteId) => {
    const [site, testList] = await Promise.all([
      base44.entities.Website.filter({ id: websiteId }).then(w => w[0]),
      base44.entities.ABTest.filter({ website_id: websiteId }, "-created_date")
    ]);
    setWebsite(site);
    setTests(testList || []);
  };

  const createTest = async () => {
    if (!testName.trim()) {
      alert("Enter a test name");
      return;
    }

    await base44.entities.ABTest.create({
      website_id: website.id,
      test_name: testName,
      variant_a_html: website.html_content,
      variant_b_html: website.html_content,
      status: "running"
    });

    alert("Test created! Now edit Variant B in the editor.");
    loadData(website.id);
    setTestName("");
    setShowCreateTest(false);
  };

  const declareWinner = async (test, winner) => {
    await base44.entities.ABTest.update(test.id, { winner, status: "completed" });
    loadData(website.id);
  };

  const toggleStatus = async (test) => {
    const newStatus = test.status === "running" ? "paused" : "running";
    await base44.entities.ABTest.update(test.id, { status: newStatus });
    loadData(website.id);
  };

  const getConversionRate = (variant) => {
    const rate = variant.views > 0 ? (variant.conversions / variant.views) * 100 : 0;
    return rate.toFixed(1);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <FlaskConical className="w-10 h-10 text-indigo-400" />
            A/B Testing Lab
          </h1>
          <Button onClick={() => setShowCreateTest(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500">
            Create New Test
          </Button>
        </div>

        {showCreateTest && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">New A/B Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Test name (e.g., 'Blue vs Purple CTA')"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white"
                />
                <Button onClick={createTest} className="bg-gradient-to-r from-green-500 to-teal-500">
                  Create Test
                </Button>
                <Button onClick={() => setShowCreateTest(false)} variant="outline" className="border-white/20 text-white">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {tests.map((test) => {
            const aRate = getConversionRate({ views: test.variant_a_views, conversions: test.variant_a_conversions });
            const bRate = getConversionRate({ views: test.variant_b_views, conversions: test.variant_b_conversions });

            return (
              <Card key={test.id} className="bg-white/5 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{test.test_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={test.status === "running" ? "bg-green-600" : "bg-gray-600"}>
                        {test.status}
                      </Badge>
                      {test.winner !== "none" && (
                        <Badge className="bg-yellow-600">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner: {test.winner.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-white font-semibold mb-3">Variant A (Original)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Views</span>
                          <span className="text-white font-semibold">{test.variant_a_views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Conversions</span>
                          <span className="text-white font-semibold">{test.variant_a_conversions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Rate</span>
                          <span className="text-white font-semibold">{aRate}%</span>
                        </div>
                      </div>
                      {test.winner === "none" && (
                        <Button
                          onClick={() => declareWinner(test, "a")}
                          className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Declare Winner
                        </Button>
                      )}
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-white font-semibold mb-3">Variant B (Test)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Views</span>
                          <span className="text-white font-semibold">{test.variant_b_views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Conversions</span>
                          <span className="text-white font-semibold">{test.variant_b_conversions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Rate</span>
                          <span className="text-white font-semibold">{bRate}%</span>
                        </div>
                      </div>
                      {test.winner === "none" && (
                        <Button
                          onClick={() => declareWinner(test, "b")}
                          className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Declare Winner
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => toggleStatus(test)} variant="outline" className="border-white/20 text-white">
                      {test.status === "running" ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {test.status === "running" ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {tests.length === 0 && (
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-12 text-center">
                <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tests Yet</h3>
                <p className="text-gray-300">Create your first A/B test to optimize conversions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}