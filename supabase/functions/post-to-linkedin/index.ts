import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LinkedInPostRequest {
  title: string;
  excerpt: string;
  slug: string;
  tags?: string[];
  category?: string;
  orgIds?: string[]; // Override default org IDs
}

function buildLinkedInPost(post: LinkedInPostRequest): string {
  const url = `https://hrpm.lovable.app/blog/${post.slug}`;
  const hashtags = (post.tags || [])
    .slice(0, 5)
    .map(t => `#${t.replace(/\s+/g, "")}`)
    .join(" ");

  let text = `🔍 ${post.title}\n\n`;
  if (post.excerpt) {
    text += `${post.excerpt}\n\n`;
  }
  if (post.category) {
    text += `📂 ${post.category}\n\n`;
  }
  text += `Read the full investigation:\n${url}\n\n`;
  text += `${hashtags} #HumanRights #HRPM #Justice #Accountability`;
  return text;
}

async function postToLinkedInOrg(
  accessToken: string,
  orgId: string,
  text: string,
  articleUrl: string,
  title: string,
): Promise<{ success: boolean; orgId: string; error?: string; postId?: string }> {
  const body = {
    author: `urn:li:organization:${orgId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            originalUrl: articleUrl,
            title: { text: title },
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LinkedIn API error for org ${orgId} [${response.status}]:`, errorText);
      return { success: false, orgId, error: `HTTP ${response.status}: ${errorText}` };
    }

    const postId = response.headers.get("x-restli-id") || "unknown";
    await response.text(); // consume body
    return { success: true, orgId, postId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`LinkedIn post failed for org ${orgId}:`, msg);
    return { success: false, orgId, error: msg };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
    if (!accessToken) throw new Error("LINKEDIN_ACCESS_TOKEN is not configured");

    const hrpmOrgId = Deno.env.get("LINKEDIN_HRPM_ORG_ID");
    const backcheckOrgId = Deno.env.get("LINKEDIN_BACKCHECK_ORG_ID");

    if (!hrpmOrgId && !backcheckOrgId) {
      throw new Error("No LinkedIn organization IDs configured");
    }

    const body: LinkedInPostRequest = await req.json();
    if (!body.title || !body.slug) {
      return new Response(
        JSON.stringify({ error: "title and slug are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const text = buildLinkedInPost(body);
    const articleUrl = `https://hrpm.lovable.app/blog/${body.slug}`;

    // Determine which orgs to post to
    const orgIds = body.orgIds || [hrpmOrgId, backcheckOrgId].filter(Boolean) as string[];

    const results = await Promise.allSettled(
      orgIds.map(orgId => postToLinkedInOrg(accessToken, orgId, text, articleUrl, body.title)),
    );

    const outcomes = results.map(r => r.status === "fulfilled" ? r.value : { success: false, error: "Promise rejected" });

    const successCount = outcomes.filter(o => o.success).length;
    console.log(`LinkedIn posting: ${successCount}/${orgIds.length} succeeded`);

    return new Response(
      JSON.stringify({ success: successCount > 0, results: outcomes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("LinkedIn posting error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "LinkedIn posting failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
