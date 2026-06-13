import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Globe, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  Edit,
  Share2,
  Copy,
  Lock,
  Crown,
  History,
  Users,
  FlaskConical
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PLAN_FEATURES = {
  free: {
    name: "Free",
    max_websites: 3,
    can_download: false,
    can_share: false,
    ai_edits_per_month: 5
  },
  starter: {
    name: "Starter",
    max_websites: 10,
    can_download: true,
    can_share: false,
    ai_edits_per_month: 20
  },
  pro: {
    name: "Pro",
    max_websites: 50,
    can_download: true,
    can_share: true,
    ai_edits_per_month: 100
  },
  enterprise: {
    name: "Enterprise",
    max_websites: -1,
    can_download: true,
    can_share: true,
    ai_edits_per_month: -1
  }
};

export default function Projects() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [sharingProject, setSharingProject] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(project => project.category === filterCategory);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, filterCategory]);

  const loadData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Only list websites the user owns; admins can see all
      const userProjects = currentUser?.role === 'admin'
        ? await base44.entities.Website.list("-created_date")
        : await base44.entities.Website.filter({ created_by: currentUser.email }, "-created_date");

      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    }
    setIsLoading(false);
  };

  const getUserPlan = () => {
    return user?.subscription_plan || 'free';
  };

  const getPlanFeatures = () => {
    const plan = getUserPlan();
    return PLAN_FEATURES[plan];
  };

  const canDownload = () => {
    const features = getPlanFeatures();
    return features.can_download;
  };

  const canShare = () => {
    const features = getPlanFeatures();
    return features.can_share;
  };

  // Helper to check manage permissions
  const canManageProject = (project) => {
    if (!user || !project) return false;
    return user.role === 'admin' || project.created_by === user.email;
  };

  const downloadWebsite = (project) => {
    // No canManageProject check here, as any user should be able to download their own project if they pay for it.
    // The restriction is by plan, not by ownership per se, assuming only owned projects are listed.
    if (!canDownload()) {
      setUpgradeFeature("download");
      setShowUpgradeDialog(true);
      return;
    }

    const htmlContent = project.html_content;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareProject = async (project) => {
    if (!canManageProject(project)) {
      setError("You can only share websites you created.");
      return;
    }

    if (!canShare()) {
      setUpgradeFeature("share");
      setShowUpgradeDialog(true);
      return;
    }

    try {
      let updatedProject = project;
      
      if (!project.share_token) {
        // Generate unique share token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        updatedProject = await base44.entities.Website.update(project.id, {
          is_public: true,
          share_token: token
        });
        
        // Update local state
        setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
      }
      
      const shareLink = `${window.location.origin}/share/${updatedProject.share_token}`;
      setShareUrl(shareLink);
      setSharingProject(updatedProject);
    } catch (error) {
      console.error("Error sharing project:", error);
      setError("Failed to generate share link.");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    if (!canManageProject(projectToDelete)) {
      setError("You can only delete websites you created.");
      setProjectToDelete(null);
      return;
    }
    
    setError(null);
    setDeletingProjectId(projectToDelete.id);
    try {
      await base44.entities.Website.delete(projectToDelete.id);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
      
      if (selectedProject && selectedProject.id === projectToDelete.id) {
        setSelectedProject(null);
      }
      
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      // If not found or already removed, refresh list to sync UI
      const msg = String(error?.message || error);
      if (msg.toLowerCase().includes("not found")) {
        await loadData();
        setProjectToDelete(null);
        setError("That project was already removed or is not accessible.");
      } else {
        setError("Failed to delete project. Please try again.");
      }
    } finally {
      setDeletingProjectId(null);
    }
  };

  const categories = [
    "all", "business", "portfolio", "blog", "ecommerce", "landing",
    "restaurant", "agency", "startup", "nonprofit", "education",
    "spa", "plumbing", "landscape", "hvac", "electrical", "roofing"
  ];

  const colorSchemeColors = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    pink: "bg-pink-500",
    teal: "bg-teal-500",
    gray: "bg-gray-500"
  };

  const planFeatures = getPlanFeatures();

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
              <p className="text-gray-300">Manage and view all your AI-generated websites</p>
            </div>
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">{planFeatures.name} Plan</span>
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>• {planFeatures.max_websites === -1 ? 'Unlimited' : planFeatures.max_websites} websites</div>
                  <div>• {planFeatures.ai_edits_per_month === -1 ? 'Unlimited' : planFeatures.ai_edits_per_month} AI edits/mo</div>
                  <div>• Download: {planFeatures.can_download ? '✓' : '✗'}</div>
                  <div>• Share: {planFeatures.can_share ? '✓' : '✗'}</div>
                </div>
                {getUserPlan() === 'free' && (
                  <Link to={createPageUrl("Pricing")}>
                    <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-500">
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Global Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-3 rounded-md flex items-center gap-2 mb-6"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-white/20 rounded mb-3"></div>
                  <div className="h-3 bg-white/10 rounded mb-4"></div>
                  <div className="h-8 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20">
            <CardContent className="p-12 text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-300">
                {searchTerm || filterCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first AI-generated website to get started"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProjects.map((project, index) => {
                const manageDisabled = !canManageProject(project);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white text-lg font-semibold mb-1 truncate">
                              {project.title}
                            </CardTitle>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {project.color_scheme && colorSchemeColors[project.color_scheme] && (
                              <div className={`w-3 h-3 rounded-full ${colorSchemeColors[project.color_scheme]} flex-shrink-0`} />
                            )}
                            {project.is_public && (
                              <Globe className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {project.category && (
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                {project.category}
                              </Badge>
                            )}
                            {project.theme && (
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                {project.theme}
                              </Badge>
                            )}
                            {project.is_public && project.view_count > 0 && (
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                <Eye className="w-3 h-3 mr-1" />
                                {project.view_count}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-gray-400 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(project.created_date), "MMM d, yyyy")}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Link to={`${createPageUrl("Editor")}?id=${project.id}`} className="col-span-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-purple-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                              disabled={manageDisabled}
                              title={manageDisabled ? "You can only edit your own projects" : undefined}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedProject(project)}
                            className="text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Link to={`${createPageUrl("VersionHistory")}?id=${project.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-yellow-400 hover:text-white hover:bg-yellow-500/20"
                            >
                              <History className="w-4 h-4 mr-1" />
                              History
                            </Button>
                          </Link>
                          <Link to={`${createPageUrl("WebsiteCloner")}?id=${project.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-pink-400 hover:text-white hover:bg-pink-500/20"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Clone
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShareProject(project)}
                            disabled={manageDisabled}
                            title={manageDisabled ? "You can only share your own projects" : undefined}
                            className={`text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors ${manageDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {canShare() ? <Share2 className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
                            Share
                            {!canShare() && (
                              <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                            )}
                          </Button>
                          <Link to={`${createPageUrl("ExportHub")}?id=${project.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-green-400 hover:text-white hover:bg-green-500/20"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </Link>
                          <Link to={`${createPageUrl("TeamManager")}?id=${project.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-teal-400 hover:text-white hover:bg-teal-500/20"
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Team
                            </Button>
                          </Link>
                          <Link to={`${createPageUrl("ABTesting")}?id=${project.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-orange-400 hover:text-white hover:bg-orange-500/20"
                            >
                              <FlaskConical className="w-4 h-4 mr-1" />
                              A/B Test
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setProjectToDelete(project)}
                            className={`col-span-3 text-red-400 hover:text-white hover:bg-red-500/20 transition-colors ${manageDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={deletingProjectId === project.id || manageDisabled}
                            title={manageDisabled ? "You can only delete your own projects" : undefined}
                          >
                            {deletingProjectId === project.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedProject.title}</h3>
                    <p className="text-gray-600 text-sm">{selectedProject.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <div className="h-[70vh] overflow-auto">
                  <iframe
                    srcDoc={selectedProject.html_content}
                    className="w-full h-full"
                    title="Website Preview"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Dialog */}
        <AlertDialog open={!!sharingProject} onOpenChange={() => setSharingProject(null)}>
          <AlertDialogContent className="bg-slate-900 border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                Share "{sharingProject?.title}"
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Anyone with this link can view your website. The link will remain active until you disable sharing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-white/5 p-4 rounded-lg">
              <Label className="text-white text-sm mb-2 block">Share Link:</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-white/10 border-white/20 text-white text-sm"
                />
                <Button
                  onClick={copyShareLink}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {sharingProject?.view_count > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Viewed {sharingProject.view_count} times
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Upgrade Dialog */}
        <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <AlertDialogContent className="bg-slate-900 border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Upgrade to {upgradeFeature === 'download' ? 'Download' : 'Share'} Websites
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                {upgradeFeature === 'download' 
                  ? "Download your websites as HTML files to host them anywhere. Available on Starter plan and above."
                  : "Share your websites with anyone via a public link. Track views and engagement. Available on Pro plan and above."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">
                  {upgradeFeature === 'download' ? 'Starter Plan' : 'Pro Plan'} Includes:
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {upgradeFeature === 'download' ? (
                    <>
                      <li>• Download all your websites</li>
                      <li>• 10 websites per month</li>
                      <li>• 20 AI edits per month</li>
                      <li>• Priority email support</li>
                    </>
                  ) : (
                    <>
                      <li>• Share websites publicly</li>
                      <li>• Track view analytics</li>
                      <li>• 50 websites per month</li>
                      <li>• 100 AI edits per month</li>
                      <li>• Download websites</li>
                      <li>• Priority support</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Maybe Later
              </AlertDialogCancel>
              <Link to={createPageUrl("Pricing")}>
                <AlertDialogAction className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  View Plans
                </AlertDialogAction>
              </Link>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent className="bg-slate-900 border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Project?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!!deletingProjectId}
              >
                {deletingProjectId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}