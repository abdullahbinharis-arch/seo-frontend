export interface AuditRequest {
  keyword: string;
  target_url: string;
  location: string;
  business_name?: string;
  business_type?: string;
}

// ── Keyword Research ────────────────────────────────────────────────

export interface HighIntentKeyword {
  keyword: string;
  intent: string;
  estimated_monthly_searches: number;
  difficulty: "low" | "medium" | "high";
  local_modifier?: string;
}

export interface KeywordCluster {
  theme: string;
  keywords: string[];
}

export interface KeywordRecommendations {
  primary_keyword: string;
  high_intent_keywords: HighIntentKeyword[];
  long_tail_keywords: string[];
  competitor_keywords_we_miss: string[];
  keyword_clusters: KeywordCluster[];
  content_gap_opportunities: string[];
  recommendation: string;
}

// ── On-Page SEO ─────────────────────────────────────────────────────

export interface CurrentAnalysis {
  title: string;
  meta_description: string;
  h1: string;
  word_count: number;
  seo_score: number;
  issues_found: string[];
}

export interface OnPageRecommendationDetails {
  meta_title: string;
  meta_description: string;
  h1: string;
  target_word_count: number;
  heading_structure: string[];
  keywords_to_add: string[];
  content_sections_to_add: string[];
  schema_markup: string;
}

export interface InternalLink {
  anchor_text: string;
  target_path: string;
  reason: string;
}

export interface OnPageRecommendations {
  current_analysis: CurrentAnalysis;
  recommendations: OnPageRecommendationDetails;
  internal_links: InternalLink[];
  priority_actions: string[];
  priority_score: number;
}

// ── Local SEO ───────────────────────────────────────────────────────

export interface ReviewStrategy {
  target_reviews_per_month: number;
  review_request_template: string;
  response_template: string;
}

export interface GbpOptimization {
  priority_attributes: string[];
  categories: string[];
  photo_strategy: string;
  post_strategy: string;
  review_strategy: ReviewStrategy;
  q_and_a: string[];
}

export interface Citation {
  site: string;
  url: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
}

export interface LinkOpportunity {
  name: string;
  url: string;
  link_type: string;
  reason: string;
  outreach_template: string;
}

export interface LocalContentStrategy {
  blog_topics: string[];
  service_area_pages: string[];
  faq_questions: string[];
}

export interface LocalRecommendations {
  local_seo_score?: number;
  gbp_optimization: GbpOptimization;
  citations: Citation[];
  link_opportunities: LinkOpportunity[];
  local_content_strategy: LocalContentStrategy;
  nap_checklist: string[];
  quick_wins: string[];
  estimated_impact: string;
}

// ── Agents ──────────────────────────────────────────────────────────

export interface KeywordResearchAgent {
  agent: "keyword_research";
  audit_id: string;
  status: string;
  keyword: string;
  competitors_analyzed: number;
  recommendations: KeywordRecommendations;
  timestamp: string;
}

export interface OnPageSeoAgent {
  agent: "on_page_seo";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  page_scraped: boolean;
  recommendations: OnPageRecommendations;
  timestamp: string;
}

export interface LocalSeoAgent {
  agent: "local_seo";
  audit_id: string;
  status: string;
  keyword: string;
  location: string;
  recommendations: LocalRecommendations;
  timestamp: string;
}

// ── Full Audit Result ────────────────────────────────────────────────

export interface AuditResult {
  audit_id: string;
  business_name?: string;
  business_type?: string;
  keyword: string;
  target_url: string;
  location: string;
  local_seo_score?: number;
  status: string;
  agents_executed: number;
  execution_time_seconds: number;
  timestamp: string;
  agents: {
    keyword_research: KeywordResearchAgent;
    on_page_seo: OnPageSeoAgent;
    local_seo: LocalSeoAgent;
  };
  summary: {
    quick_wins: string[];
    estimated_api_cost: number;
  };
}
