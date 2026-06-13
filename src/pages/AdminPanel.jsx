
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Trash2, Save, Download, Eye, Key, Database, Star, EyeOff, Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPanel() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  // Websites
  const [websites, setWebsites] = useState([]);
  const [siteSearch, setSiteSearch] = useState("");

  // Templates
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ title:"", description:"", category:"business", theme:"modern", color_scheme:"blue", hero_image_url:"" });

  // Generation Settings (single record)
  const [settings, setSettings] = useState({ preferred_model:"", animation_level:"rich", allow_video_hero:false, enforce_unique_hero:true, min_sections:8 });

  // Models
  const [models, setModels] = useState([]);
  const [modelSearch, setModelSearch] = useState("");
  const [newModel, setNewModel] = useState({
    name: "", provider: "OpenAI", type: "llm", model_id: "", enabled: true, preferred: false, cost_per_1k: "", notes: ""
  });

  // API Keys
  const [keys, setKeys] = useState([]);
  const [keySearch, setKeySearch] = useState("");
  const [newKey, setNewKey] = useState({
    name: "", provider: "OpenAI", key_value: "", scopes: [], enabled: true
  });

  useEffect(() => {
    const load = async () => {
      try {
        const current = await base44.auth.me();
        setMe(current);
        if (current?.role !== "admin") {
          alert("Admins only");
          return;
        }
        const [u, w, t, s, m, k] = await Promise.all([
          base44.entities.User.list(),
          base44.entities.Website.list("-created_date"),
          base44.entities.Template.list("-created_date"),
          base44.entities.GenerationSettings.list(),
          base44.entities.ModelRegistry.list(),
          base44.entities.IntegrationKey.list()
        ]);
        setUsers(u || []);
        setWebsites(w || []);
        setTemplates(t || []);
        if ((s || []).length > 0) setSettings(s[0]);
        setModels(m || []);
        setKeys(k || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredUsers = users.filter(u => (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) || (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase()));
  const filteredSites = websites.filter(s => (s.title || "").toLowerCase().includes(siteSearch.toLowerCase()) || (s.category || "").toLowerCase().includes(siteSearch.toLowerCase()));

  const updateUserPlan = async (user, plan) => {
    const updated = await base44.entities.User.update(user.id, { subscription_plan: plan });
    setUsers(users.map(u => u.id === user.id ? updated : u));
  };

  const updateUserRole = async (user, role) => {
    const updated = await base44.entities.User.update(user.id, { role });
    setUsers(users.map(u => u.id === user.id ? updated : u));
  };

  const deleteUser = async (user) => {
    await base44.entities.User.delete(user.id);
    setUsers(users.filter(u => u.id !== user.id));
  };

  const deleteSite = async (site) => {
    await base44.entities.Website.delete(site.id);
    setWebsites(websites.filter(w => w.id !== site.id));
  };

  const togglePublic = async (site) => {
    const updated = await base44.entities.Website.update(site.id, { is_public: !site.is_public });
    setWebsites(websites.map(w => w.id === site.id ? updated : w));
  };

  const addTemplate = async () => {
    if (!newTemplate.title || !newTemplate.category) {
      alert("Template requires title and category");
      return;
    }
    const t = await base44.entities.Template.create(newTemplate);
    setTemplates([t, ...templates]);
    setNewTemplate({ title:"", description:"", category:"business", theme:"modern", color_scheme:"blue", hero_image_url:"" });
  };

  const updateTemplate = async (tpl, patch) => {
    const updated = await base44.entities.Template.update(tpl.id, patch);
    setTemplates(templates.map(t => t.id === tpl.id ? updated : t));
  };

  const deleteTemplate = async (tpl) => {
    await base44.entities.Template.delete(tpl.id);
    setTemplates(templates.filter(t => t.id !== tpl.id));
  };

  const saveSettings = async () => {
    if (settings.id) {
      const updated = await base44.entities.GenerationSettings.update(settings.id, settings);
      setSettings(updated);
    } else {
      const created = await base44.entities.GenerationSettings.create(settings);
      setSettings(created);
    }
    alert("Settings saved");
  };

  // Model handlers
  const addModel = async () => {
    if (!newModel.name || !newModel.model_id) return alert("Name and Model ID are required");
    const created = await base44.entities.ModelRegistry.create(newModel);
    setModels([created, ...models]);
    setNewModel({ name:"", provider:"OpenAI", type:"llm", model_id:"", enabled:true, preferred:false, cost_per_1k:"", notes:"" });
  };
  const updateModel = async (model, patch) => {
    const updated = await base44.entities.ModelRegistry.update(model.id, patch);
    setModels(models.map(m => m.id === model.id ? updated : m));
  };
  const deleteModel = async (model) => {
    await base44.entities.ModelRegistry.delete(model.id);
    setModels(models.filter(m => m.id !== model.id));
  };
  const setPreferredModel = async (model) => {
    // unset others
    const updates = models.map(async m => {
      if (m.id === model.id) return base44.entities.ModelRegistry.update(m.id, { preferred: true });
      if (m.preferred) return base44.entities.ModelRegistry.update(m.id, { preferred: false });
    });
    await Promise.all(updates);
    const refreshed = await base44.entities.ModelRegistry.list();
    setModels(refreshed || []);
  };

  // API Key handlers
  const addKey = async () => {
    if (!newKey.name || !newKey.key_value) return alert("Key name and value are required");
    const created = await base44.entities.IntegrationKey.create(newKey);
    setKeys([created, ...keys]);
    setNewKey({ name:"", provider:"OpenAI", key_value:"", scopes:[], enabled:true });
  };
  const updateKey = async (keyItem, patch) => {
    const updated = await base44.entities.IntegrationKey.update(keyItem.id, patch);
    setKeys(keys.map(k => k.id === keyItem.id ? updated : k));
  };
  const deleteKey = async (keyItem) => {
    await base44.entities.IntegrationKey.delete(keyItem.id);
    setKeys(keys.filter(k => k.id !== keyItem.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (me?.role !== "admin") {
    return (
      <div className="min-h-screen p-8">
        <Card className="bg-white/5 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-white">Access restricted.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-400" />
              Admin Control Panel
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="users">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Generation Settings</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="integrations">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Search users by name or email"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-3">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{u.full_name || u.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-300">Role: {u.role}</Badge>
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-300">Plan: {u.subscription_plan || "free"}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select value={u.role} onValueChange={(val)=>updateUserRole(u, val)}>
                          <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={u.subscription_plan || "free"} onValueChange={(val)=>updateUserPlan(u, val)}>
                          <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">free</SelectItem>
                            <SelectItem value="starter">starter</SelectItem>
                            <SelectItem value="pro">pro</SelectItem>
                            <SelectItem value="enterprise">enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" className="text-red-400 hover:text-white hover:bg-red-500/20" onClick={()=>deleteUser(u)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && <p className="text-gray-300">No users found.</p>}
                </div>
                <p className="text-xs text-gray-400">Note: New users must be invited from the platform’s invite flow.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="websites" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Websites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search websites by title or category"
                  value={siteSearch}
                  onChange={e => setSiteSearch(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                <div className="grid md:grid-cols-2 gap-3">
                  {filteredSites.map(site => (
                    <div key={site.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{site.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-300">{site.category}</Badge>
                            {site.is_public && <Badge className="bg-green-600">Public</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" className="text-blue-400 hover:text-white hover:bg-white/10" onClick={()=>togglePublic(site)}>
                            <Eye className="w-4 h-4 mr-1" /> {site.is_public ? "Make Private" : "Make Public"}
                          </Button>
                          <Button variant="ghost" className="text-green-400 hover:text-white hover:bg-white/10" onClick={()=>{
                            const blob=new Blob([site.html_content||""],{type:"text/html"});
                            const url=URL.createObjectURL(blob);
                            const a=document.createElement("a"); a.href=url; a.download=`${site.title.replace(/\s+/g,'-').toLowerCase()}.html`;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                          }}>
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                          <Button variant="ghost" className="text-red-400 hover:text-white hover:bg-red-500/20" onClick={()=>deleteSite(site)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 lg:col-span-1">
                <CardHeader><CardTitle className="text-white">Add Template</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Label className="text-white text-sm">Title</Label>
                  <Input value={newTemplate.title} onChange={e=>setNewTemplate({...newTemplate, title:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Label className="text-white text-sm">Description</Label>
                  <Input value={newTemplate.description} onChange={e=>setNewTemplate({...newTemplate, description:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Label className="text-white text-sm">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(v)=>setNewTemplate({...newTemplate, category:v})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["business","portfolio","blog","ecommerce","landing","restaurant","agency","startup","nonprofit","education","spa","plumbing","landscape","hvac","electrical","roofing","medical"].map(c=>(
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white text-sm">Theme</Label>
                      <Select value={newTemplate.theme} onValueChange={(v)=>setNewTemplate({...newTemplate, theme:v})}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue/></SelectTrigger>
                        <SelectContent>
                          {["modern","minimal","corporate","creative","elegant","bold"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Color</Label>
                      <Select value={newTemplate.color_scheme} onValueChange={(v)=>setNewTemplate({...newTemplate, color_scheme:v})}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue/></SelectTrigger>
                        <SelectContent>
                          {["blue","purple","green","orange","red","pink","teal","gray"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Label className="text-white text-sm">Hero Image URL</Label>
                  <Input value={newTemplate.hero_image_url} onChange={e=>setNewTemplate({...newTemplate, hero_image_url:e.target.value})} className="bg-white/10 border-white/20 text-white" placeholder="https://images.unsplash.com/..." />
                  <Button onClick={addTemplate} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">Add Template</Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/20 lg:col-span-2">
                <CardHeader><CardTitle className="text-white">Existing Templates</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {templates.length === 0 && <p className="text-gray-300">No templates yet.</p>}
                  {templates.map(tpl=>(
                    <div key={tpl.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{tpl.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-300">{tpl.category}</Badge>
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-300">{tpl.theme}/{tpl.color_scheme}</Badge>
                            {tpl.enabled ? <Badge className="bg-green-600">Enabled</Badge> : <Badge className="bg-gray-600">Disabled</Badge>}
                            {tpl.is_featured && <Badge className="bg-purple-600">Featured</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" className="text-blue-400 hover:text-white hover:bg-white/10" onClick={()=>updateTemplate(tpl,{ enabled: !tpl.enabled })}>
                            {tpl.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button variant="ghost" className="text-purple-400 hover:text-white hover:bg-white/10" onClick={()=>updateTemplate(tpl,{ is_featured: !tpl.is_featured })}>
                            {tpl.is_featured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button variant="ghost" className="text-red-400 hover:text-white hover:bg-red-500/20" onClick={()=>deleteTemplate(tpl)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/20">
              <CardHeader><CardTitle className="text-white">Generation Settings</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-sm">Preferred Model (hint)</Label>
                  <Input value={settings.preferred_model || ""} onChange={e=>setSettings({...settings, preferred_model:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div>
                  <Label className="text-white text-sm">Animation Level</Label>
                  <Select value={settings.animation_level || "rich"} onValueChange={(v)=>setSettings({...settings, animation_level:v})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">none</SelectItem>
                      <SelectItem value="subtle">subtle</SelectItem>
                      <SelectItem value="rich">rich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-sm">Minimum Sections</Label>
                  <Input type="number" value={settings.min_sections ?? 8} onChange={e=>setSettings({...settings, min_sections: Number(e.target.value)})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="vid" type="checkbox" checked={!!settings.allow_video_hero} onChange={e=>setSettings({...settings, allow_video_hero: e.target.checked})} />
                  <Label htmlFor="vid" className="text-white text-sm">Allow Video Hero</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="uniq" type="checkbox" checked={!!settings.enforce_unique_hero} onChange={e=>setSettings({...settings, enforce_unique_hero: e.target.checked})} />
                  <Label htmlFor="uniq" className="text-white text-sm">Enforce Unique Industry Hero Images</Label>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={saveSettings} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Save className="w-4 h-4 mr-2" /> Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 lg:col-span-1">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Database className="w-5 h-5" />Add Model</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Name (e.g., GPT-4o-mini)" value={newModel.name} onChange={e=>setNewModel({...newModel, name:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Select value={newModel.provider} onValueChange={v=>setNewModel({...newModel, provider:v})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Provider" /></SelectTrigger>
                    <SelectContent>
                      {["OpenAI","Anthropic","Google","Mistral","Cohere","Other"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newModel.type} onValueChange={v=>setNewModel({...newModel, type:v})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {["llm","image","video","audio"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Model ID (e.g., gpt-4o-mini)" value={newModel.model_id} onChange={e=>setNewModel({...newModel, model_id:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                      <span className="text-white text-sm">Enabled</span>
                      <Switch checked={newModel.enabled} onCheckedChange={v=>setNewModel({...newModel, enabled:v})} />
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                      <span className="text-white text-sm">Preferred</span>
                      <Switch checked={newModel.preferred} onCheckedChange={v=>setNewModel({...newModel, preferred:v})} />
                    </div>
                  </div>
                  <Input type="number" placeholder="Cost per 1K tokens (optional)" value={newModel.cost_per_1k} onChange={e=>setNewModel({...newModel, cost_per_1k:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Textarea placeholder="Notes" value={newModel.notes} onChange={e=>setNewModel({...newModel, notes:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Button onClick={addModel} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">Add Model</Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/20 lg:col-span-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><Database className="w-5 h-5" />Registered Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <Input placeholder="Search models..." value={modelSearch} onChange={e=>setModelSearch(e.target.value)} className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-3">
                    {models
                      .filter(m => (m.name||"").toLowerCase().includes(modelSearch.toLowerCase()) || (m.provider||"").toLowerCase().includes(modelSearch.toLowerCase()) || (m.model_id||"").toLowerCase().includes(modelSearch.toLowerCase()))
                      .map(m => (
                      <div key={m.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {m.name}
                            {m.preferred && <Badge className="bg-green-600">Preferred</Badge>}
                          </p>
                          <p className="text-gray-300 text-sm">{m.provider} • {m.type} • <span className="text-gray-400">{m.model_id}</span></p>
                          {m.notes && <p className="text-xs text-gray-400 mt-1">{m.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1">
                            <span className="text-xs text-gray-300">Enabled</span>
                            <Switch checked={!!m.enabled} onCheckedChange={v=>updateModel(m, { enabled: v })} />
                          </div>
                          <Button variant="ghost" className="text-yellow-400 hover:text-white hover:bg-white/10" onClick={()=>setPreferredModel(m)}>
                            <Star className="w-4 h-4 mr-1" /> Set preferred
                          </Button>
                          <Button variant="ghost" className="text-blue-400 hover:text-white hover:bg-white/10" onClick={()=>updateModel(m, { notes: (m.notes||"") + "" })}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" className="text-red-400 hover:text-white hover:bg-red-500/20" onClick={()=>deleteModel(m)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {models.length === 0 && <p className="text-gray-300">No models registered yet.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border-white/20 lg:col-span-1">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Key className="w-5 h-5" />Add API Key</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Key name (e.g., OpenAI)" value={newKey.name} onChange={e=>setNewKey({...newKey, name:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Select value={newKey.provider} onValueChange={v=>setNewKey({...newKey, provider:v})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Provider" /></SelectTrigger>
                    <SelectContent>
                      {["OpenAI","Anthropic","Google","Mistral","ElevenLabs","Runway","Other"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Key value" value={newKey.key_value} onChange={e=>setNewKey({...newKey, key_value:e.target.value})} className="bg-white/10 border-white/20 text-white" />
                  <Input placeholder="Scopes (comma separated, e.g., generator,editor)" value={(newKey.scopes||[]).join(", ")} onChange={e=>setNewKey({...newKey, scopes:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} className="bg-white/10 border-white/20 text-white" />
                  <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                    <span className="text-white text-sm">Enabled</span>
                    <Switch checked={newKey.enabled} onCheckedChange={v=>setNewKey({...newKey, enabled:v})} />
                  </div>
                  <Button onClick={addKey} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">Save Key</Button>
                  <p className="text-xs text-gray-400">Keys are stored as plain strings for now; visible only to admins.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/20 lg:col-span-2">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><Key className="w-5 h-5" />External Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <Input placeholder="Search keys..." value={keySearch} onChange={e=>setKeySearch(e.target.value)} className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-3">
                    {keys
                      .filter(k => (k.name||"").toLowerCase().includes(keySearch.toLowerCase()) || (k.provider||"").toLowerCase().includes(keySearch.toLowerCase()))
                      .map(k => (
                      <div key={k.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{k.name} <span className="text-gray-400 text-sm">• {k.provider}</span></p>
                          <p className="text-gray-300 text-sm flex items-center gap-2">
                            <EyeOff className="w-4 h-4" /> ********{(k.key_value||"").slice(-4)}
                          </p>
                          {k.scopes && k.scopes.length > 0 && (
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {k.scopes.map((s,i)=><Badge key={i} variant="outline" className="text-xs border-white/20 text-gray-300">{s}</Badge>)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1">
                            <span className="text-xs text-gray-300">Enabled</span>
                            <Switch checked={!!k.enabled} onCheckedChange={v=>updateKey(k,{enabled:v})} />
                          </div>
                          <Button variant="ghost" className="text-blue-400 hover:text-white hover:bg-white/10" onClick={()=>updateKey(k,{})}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" className="text-red-400 hover:text-white hover:bg-red-500/20" onClick={()=>deleteKey(k)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    {keys.length === 0 && <p className="text-gray-300">No keys added yet.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
