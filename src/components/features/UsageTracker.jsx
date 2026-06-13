import { base44 } from "@/api/base44Client";

export async function trackUsage(actionType, websiteId = null, tokensUsed = 0) {
  try {
    const user = await base44.auth.me();
    await base44.entities.UsageLog.create({
      user_email: user.email,
      action_type: actionType,
      website_id: websiteId,
      tokens_used: tokensUsed,
      success: true
    });
  } catch (error) {
    console.warn("Usage tracking failed:", error);
  }
}

export async function checkQuota(actionType) {
  const user = await base44.auth.me();
  const plan = user?.subscription_plan || 'free';
  
  const limits = {
    free: { websites: 3, ai_edits: 5 },
    starter: { websites: 10, ai_edits: 20 },
    pro: { websites: 50, ai_edits: 100 },
    enterprise: { websites: -1, ai_edits: -1 }
  };

  if (actionType === "website_generated") {
    const count = await base44.entities.Website.filter({ created_by: user.email }).then(w => w.length);
    if (limits[plan].websites !== -1 && count >= limits[plan].websites) {
      return { allowed: false, reason: `You've reached your plan limit of ${limits[plan].websites} websites.` };
    }
  }

  if (actionType === "ai_edit") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const logs = await base44.entities.UsageLog.filter({ user_email: user.email });
    const thisMonthEdits = logs.filter(log => 
      log.action_type === "ai_edit" && new Date(log.created_date) >= startOfMonth
    ).length;

    if (limits[plan].ai_edits !== -1 && thisMonthEdits >= limits[plan].ai_edits) {
      return { allowed: false, reason: `You've used all ${limits[plan].ai_edits} AI edits this month.` };
    }
  }

  return { allowed: true };
}

export default function UsageTracker() {
  return null;
}