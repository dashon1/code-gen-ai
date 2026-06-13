import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Zap, TrendingUp, AlertTriangle, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const PLAN_LIMITS = {
  free: { websites: 3, ai_edits: 5 },
  starter: { websites: 10, ai_edits: 20 },
  pro: { websites: 50, ai_edits: 100 },
  enterprise: { websites: -1, ai_edits: -1 }
};

export default function UsageTracking() {
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState({ websites: 0, ai_edits_this_month: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    const websites = await base44.entities.Website.filter({ created_by: currentUser.email });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const logs = await base44.entities.UsageLog.filter({ user_email: currentUser.email }, "-created_date", 50);
    const thisMonthEdits = logs.filter(log => 
      log.action_type === "ai_edit" && new Date(log.created_date) >= startOfMonth
    ).length;

    setUsage({ websites: websites.length, ai_edits_this_month: thisMonthEdits });
    setRecentActivity(logs.slice(0, 20));
    setIsLoading(false);
  };

  const plan = user?.subscription_plan || 'free';
  const limits = PLAN_LIMITS[plan];
  const websitePercent = limits.websites === -1 ? 0 : (usage.websites / limits.websites) * 100;
  const editsPercent = limits.ai_edits === -1 ? 0 : (usage.ai_edits_this_month / limits.ai_edits) * 100;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <BarChart className="w-10 h-10 text-indigo-400" />
          Usage Dashboard
        </h1>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                {plan.toUpperCase()} Plan Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white">Websites</span>
                  <span className="text-white font-semibold">
                    {usage.websites} / {limits.websites === -1 ? '∞' : limits.websites}
                  </span>
                </div>
                <Progress value={websitePercent} className="h-2" />
                {websitePercent > 80 && limits.websites !== -1 && (
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Approaching limit
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-white">AI Edits (This Month)</span>
                  <span className="text-white font-semibold">
                    {usage.ai_edits_this_month} / {limits.ai_edits === -1 ? '∞' : limits.ai_edits}
                  </span>
                </div>
                <Progress value={editsPercent} className="h-2" />
                {editsPercent > 80 && limits.ai_edits !== -1 && (
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Approaching limit
                  </p>
                )}
              </div>

              {(websitePercent > 90 || editsPercent > 90) && plan !== 'enterprise' && (
                <Link to={createPageUrl("Pricing")}>
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-gray-300">Websites Generated</span>
                <span className="text-2xl font-bold text-white">{usage.websites}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-gray-300">AI Edits This Month</span>
                <span className="text-2xl font-bold text-white">{usage.ai_edits_this_month}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-gray-300">Total Actions</span>
                <span className="text-2xl font-bold text-white">{recentActivity.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {log.action_type.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">{format(new Date(log.created_date), "MMM d, yyyy HH:mm")}</p>
                    </div>
                  </div>
                  <Badge className={log.success ? "bg-green-600" : "bg-red-600"}>
                    {log.success ? "Success" : "Failed"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}