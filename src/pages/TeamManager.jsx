import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, Shield, Eye, Edit } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamManager() {
  const [website, setWebsite] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("viewer");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get("id");
    if (websiteId) loadData(websiteId);
  }, []);

  const loadData = async (websiteId) => {
    const [currentUser, site, members] = await Promise.all([
      base44.auth.me(),
      base44.entities.Website.filter({ id: websiteId }).then(w => w[0]),
      base44.entities.TeamMember.filter({ website_id: websiteId })
    ]);
    setUser(currentUser);
    setWebsite(site);
    setTeamMembers(members || []);
  };

  const inviteMember = async () => {
    if (!newMemberEmail.trim()) {
      alert("Enter an email address");
      return;
    }

    await base44.entities.TeamMember.create({
      website_id: website.id,
      user_email: newMemberEmail,
      role: newMemberRole,
      invited_by: user.email
    });

    await base44.integrations.Core.SendEmail({
      to: newMemberEmail,
      subject: `You've been invited to collaborate on ${website.title}`,
      body: `${user.full_name || user.email} has invited you to collaborate on their website "${website.title}" with ${newMemberRole} access. Sign in to WebCraft AI to view it.`
    });

    alert("Invitation sent!");
    loadData(website.id);
    setNewMemberEmail("");
  };

  const removeMember = async (member) => {
    if (!confirm(`Remove ${member.user_email}?`)) return;
    await base44.entities.TeamMember.delete(member.id);
    loadData(website.id);
  };

  const updateRole = async (member, newRole) => {
    await base44.entities.TeamMember.update(member.id, { role: newRole });
    loadData(website.id);
  };

  const roleIcons = { owner: Shield, editor: Edit, viewer: Eye };
  const roleColors = { owner: "bg-purple-600", editor: "bg-blue-600", viewer: "bg-gray-600" };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Users className="w-10 h-10 text-indigo-400" />
          Team Collaboration
        </h1>

        <Card className="bg-white/5 backdrop-blur-xl border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="email@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white"
              />
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={inviteMember} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Team Members ({teamMembers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member, idx) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.user_email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.user_email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={roleColors[member.role]}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          Invited by {member.invited_by}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {member.role !== 'owner' && (
                      <>
                        <Select value={member.role} onValueChange={(role) => updateRole(member, role)}>
                          <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => removeMember(member)}
                          variant="ghost"
                          className="text-red-400 hover:text-white hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {teamMembers.length === 0 && (
              <p className="text-gray-400 text-center py-8">No team members yet. Invite colleagues above!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}