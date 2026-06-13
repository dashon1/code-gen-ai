import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Users, Clock, ArrowLeft, Globe, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.role !== 'admin') {
        window.location.href = createPageUrl("Dashboard");
        return;
      }

      const [allWebsites, allUsers] = await Promise.all([
        base44.entities.Website.list("-created_date"),
        base44.entities.User.list()
      ]);
      
      setWebsites(allWebsites);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-white">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-white">Access Denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalWebsites: websites.length,
    completedWebsites: websites.filter(w => w.status === 'completed').length,
    generatingWebsites: websites.filter(w => w.status === 'generating').length,
    errorWebsites: websites.filter(w => w.status === 'error').length,
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length
  };

  // Category breakdown
  const categoryStats = websites.reduce((acc, website) => {
    acc[website.category] = (acc[website.category] || 0) + 1;
    return acc;
  }, {});

  // Theme breakdown  
  const themeStats = websites.reduce((acc, website) => {
    acc[website.theme] = (acc[website.theme] || 0) + 1;
    return acc;
  }, {});

  // User activity - websites per user
  const userActivity = websites.reduce((acc, website) => {
    acc[website.created_by] = (acc[website.created_by] || 0) + 1;
    return acc;
  }, {});

  const topUsers = Object.entries(userActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <BarChart className="w-10 h-10 text-orange-400" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Comprehensive platform analytics and insights
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8 text-indigo-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalWebsites}</p>
              <p className="text-sm text-gray-400">Total Websites</p>
              <div className="mt-3 flex gap-2">
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  {stats.completedWebsites} Complete
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
              <p className="text-sm text-gray-400">Total Users</p>
              <div className="mt-3 flex gap-2">
                <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                  {stats.adminUsers} Admins
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                  {stats.regularUsers} Users
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.totalWebsites > 0 ? Math.round((stats.completedWebsites / stats.totalWebsites) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-400">Success Rate</p>
              <div className="mt-3">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalWebsites > 0 ? (stats.completedWebsites / stats.totalWebsites) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-pink-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">$25K</p>
              <p className="text-sm text-gray-400">Avg. Value/Site</p>
              <div className="mt-3">
                <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                  Premium Quality
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Websites by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                        <span className="text-gray-300 capitalize">{category}</span>
                      </div>
                      <Badge variant="outline" className="text-white border-white/20">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Websites by Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(themeStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([theme, count]) => (
                    <div key={theme} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-gray-300 capitalize">{theme}</span>
                      </div>
                      <Badge variant="outline" className="text-white border-white/20">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Users */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Most Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map(([email, count], index) => (
                <div key={email} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <span className="text-gray-300">{email}</span>
                  </div>
                  <Badge className="bg-indigo-500/20 text-indigo-400">
                    {count} websites
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Websites */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {websites.slice(0, 10).map((website) => (
                <div key={website.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-white">{website.title}</p>
                      <p className="text-sm text-gray-400">{website.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      website.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      website.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {website.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {website.created_by}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(website.created_date), 'MMM d, yyyy h:mm a')}
                    </span>
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                      {website.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                      {website.theme}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}