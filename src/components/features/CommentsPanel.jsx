import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function CommentsPanel({ websiteId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedSection, setSelectedSection] = useState("general");

  useEffect(() => {
    if (websiteId) loadComments();
  }, [websiteId]);

  const loadComments = async () => {
    const commentList = await base44.entities.Comment.filter({ website_id: websiteId }, "-created_date");
    setComments(commentList || []);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    await base44.entities.Comment.create({
      website_id: websiteId,
      section_id: selectedSection,
      comment_text: newComment,
      status: "open"
    });

    setNewComment("");
    loadComments();
  };

  const resolveComment = async (comment) => {
    await base44.entities.Comment.update(comment.id, { status: "resolved" });
    loadComments();
  };

  const deleteComment = async (comment) => {
    await base44.entities.Comment.delete(comment.id);
    loadComments();
  };

  const sections = ["general", "hero", "services", "portfolio", "contact"];

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments & Feedback ({comments.filter(c => c.status === "open").length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg"
          >
            {sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 border-white/20 text-white h-12"
          />
          <Button onClick={addComment} className="bg-gradient-to-r from-indigo-500 to-purple-500">
            Post
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className={`p-3 rounded-lg ${
              comment.status === "resolved" ? "bg-green-500/10 border border-green-500/20" : "bg-white/5 border border-white/10"
            }`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Badge variant="outline" className="text-xs border-white/20 text-gray-300 mb-1">
                    {comment.section_id}
                  </Badge>
                  <p className="text-sm text-white">{comment.comment_text}</p>
                </div>
                <div className="flex gap-1">
                  {comment.status === "open" && (
                    <Button size="sm" variant="ghost" onClick={() => resolveComment(comment)} className="text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteComment(comment)} className="text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400">{comment.created_by} • {format(new Date(comment.created_date), "MMM d, HH:mm")}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}