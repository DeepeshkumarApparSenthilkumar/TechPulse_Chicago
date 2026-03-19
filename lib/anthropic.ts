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

Phase 2 - Retrieval: Use web_search tool to execute ALL planned queries. Collect evidence with:
  - Confidence levels: High (official source), Medium (reputable community), Low (unverified)
  - Source types: Official (vendor docs, release notes), Community (blog posts, forums)
  - You MUST search for every platform before writing the newsletter. Do not skip any.

Phase 3 - Synthesis: Write the newsletter using ONLY retrieved evidence. Structure:

## Executive Summary
(3-4 bullets for exec audience — biggest changes, biggest savings opportunities)

## What Changed by Platform

### Snowflake
(changes, pricing updates, new cost features with sources)

### Databricks
(changes, pricing updates, new cost features with sources)

### BigQuery
(changes, pricing updates, new cost features with sources)

### Redshift
(changes, pricing updates, new cost features with sources)

### Azure Fabric / Synapse
(changes, pricing updates, new cost features with sources)

## Top Optimization Plays This Month
(3-5 concrete, actionable cost-saving plays with estimated impact)

## Risks & Watchouts
(pricing changes, deprecations, or cost traps to be aware of)

## Metrics to Track
(KPIs and metrics practitioners should watch this month)

## Action Checklist
(numbered list of specific actions to take this week)

Phase 4 - Quality Gate: Verify every claim against retrieved evidence. Remove unsupported claims. Ensure all citations are present. Never state anything you cannot back with a retrieved source.

HARD RULES:
- Evidence-only: Every claim must be supported by retrieved web evidence. NO hallucination.
- Mandatory citations: Every material bullet ends with (Source: URL)
- Recency: Prefer sources from last 45 days; fallback to 120 days if needed
- Prefer official sources: vendor docs, release notes, official blogs
- If no verified updates for a platform: write "No confirmed updates found for [Platform] this period — monitoring ongoing."
- Quality gate mandatory before final output
- Never repeat the same information twice across sections
- Be specific with numbers: actual prices, percentages, dollar amounts where available

OUTPUT FORMAT:
Return a JSON object wrapped in a markdown code block like this:
\`\`\`json
{
  "subject": "TechPulse FinOps Digest — [Month Year]",
  "preview_text": "...",
  "markdown_body": "...",
  "html_body": "...",
  "sources": { "Snowflake": ["url1"], "Databricks": ["url2"], "BigQuery": [], "Redshift": [], "AzureFabric": [] },
  "metadata": { "platforms_covered": [], "total_sources": 0, "confidence_summary": {} }
}
\`\`\`

The markdown_body must use the exact section structure from Phase 3 above. The html_body should be the same content with basic HTML tags (no CSS classes, use inline styles only).`;

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
    max_tokens: 16000,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      } as unknown as Anthropic.Messages.Tool,
    ],
    system: FINOPS_NEWSLETTER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate the FinOps newsletter for ${monthYear}.
Platforms: Snowflake, Databricks, BigQuery, Redshift, Azure Fabric/Synapse.
Recency window: 45 days (fallback: 120 days).
Audience: BOTH — executive summary (C-suite, 2-min read) + practitioner deep-dive (engineers, action items).

Instructions:
1. Run ALL search queries before writing anything
2. Search every platform — no skipping
3. Use the exact markdown section structure from your system prompt
4. Return the final newsletter as a JSON code block as specified

Return the JSON code block now.`,
      },
    ],
  });

  // Collect all text blocks from the response
  const textContent = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as Anthropic.Messages.TextBlock).text)
    .join('');

  // Try to extract JSON from ```json ... ``` code block first
  const jsonCodeBlock = textContent.match(/```json\s*([\s\S]*?)```/);
  if (jsonCodeBlock) {
    try {
      return JSON.parse(jsonCodeBlock[1].trim());
    } catch {
      // fall through
    }
  }

  // Try bare JSON object
  const jsonMatch = textContent.match(/\{[\s\S]*"subject"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // fall through
    }
  }

  // Fallback: use raw text as markdown body
  return {
    subject: `TechPulse FinOps Digest — ${monthYear}`,
    preview_text: `Monthly FinOps updates for Snowflake, Databricks, BigQuery, Redshift, and Azure Fabric.`,
    markdown_body: textContent,
    html_body: `<div>${textContent.replace(/\n/g, '<br/>')}</div>`,
    sources: {},
    metadata: { generated_at: new Date().toISOString(), month_year: monthYear, parse_fallback: true },
  };
}
