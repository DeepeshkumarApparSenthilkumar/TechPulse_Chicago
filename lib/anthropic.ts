import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const FINOPS_NEWSLETTER_SYSTEM_PROMPT = `You are an expert FinOps newsletter writer for TechPulse Chicago. Your job is to generate a comprehensive, evidence-backed monthly FinOps newsletter covering cloud cost optimization across Snowflake, Databricks, BigQuery, Redshift, and Azure Fabric/Synapse.

PIPELINE PHASES:
Phase 0 - Setup: You will receive a month/year and platform list. Focus on recency (last 45 days). FinOps keywords: pricing, billing, cost, credits, budgets, alerts, optimization, governance.

Phase 1 - Planning: For each platform, generate 4-6 web search queries:
  - 2 queries for release notes/changelog
  - 2 queries for pricing/billing documentation
  - 1-2 queries for cost controls/optimization

Phase 2 - Retrieval: Use web_search tool to execute queries. Collect evidence with:
  - Confidence levels: High (official source), Medium (reputable community), Low (unverified)
  - Source types: Official (vendor docs, release notes), Community (blog posts, forums)

Phase 3 - Synthesis: Write the newsletter using ONLY retrieved evidence. Structure:
  ## Executive Summary (3-4 bullets, exec audience)
  ## What Changed by Platform (per platform section)
  ## Top Optimization Plays This Month
  ## Risks & Watchouts
  ## Metrics to Track
  ## Action Checklist

Phase 4 - Quality Gate: Verify every claim against retrieved evidence. Remove unsupported claims. Ensure all citations present.

HARD RULES:
- Evidence-only: Every claim must be supported by retrieved web evidence. NO hallucination.
- Mandatory citations: Every bullet ends with (Source: URL)
- Recency: Prefer sources from last 45 days; fallback to 120 days
- Prefer official sources: vendor docs, release notes, official blogs
- If no verified updates for a platform: write "No confirmed updates found for [Platform] this period."
- Quality gate mandatory before final output

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "subject": "TechPulse FinOps Digest — [Month Year]",
  "preview_text": "...",
  "markdown_body": "...",
  "html_body": "...",
  "sources": { "platform": ["url1", "url2"] },
  "metadata": { "platforms_covered": [], "total_sources": 0, "confidence_summary": {} }
}`;

export async function generateNewsletterContent(monthYear: string): Promise<{
  subject: string;
  preview_text: string;
  markdown_body: string;
  html_body: string;
  sources: Record<string, string[]>;
  metadata: Record<string, unknown>;
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    tools: [
      {
        type: 'web_search_20250305' as 'web_search_20250305',
        name: 'web_search',
      } as Anthropic.Messages.Tool,
    ],
    system: FINOPS_NEWSLETTER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate the FinOps newsletter for ${monthYear}.
Platforms: Snowflake, Databricks, BigQuery, Redshift, Azure Fabric/Synapse.
Recency window: 45 days.
Audience: BOTH (exec summary + practitioner deep-dive).
Return the final newsletter as the JSON structure specified in your system prompt.`,
      },
    ],
  });

  // Extract text content from response
  const textContent = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as Anthropic.Messages.TextBlock).text)
    .join('');

  // Try to parse JSON from the response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Fall through to default
    }
  }

  // Fallback structure if JSON parsing fails
  return {
    subject: `TechPulse FinOps Digest — ${monthYear}`,
    preview_text: `Monthly FinOps updates for Snowflake, Databricks, BigQuery, Redshift, and Azure Fabric.`,
    markdown_body: textContent,
    html_body: `<div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">${textContent.replace(/\n/g, '<br/>')}</div>`,
    sources: {},
    metadata: { generated_at: new Date().toISOString(), month_year: monthYear },
  };
}
