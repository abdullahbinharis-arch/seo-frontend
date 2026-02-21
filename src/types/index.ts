export interface AuditRequest {
  keyword: string;
  target_url?: string;
  domain?: string;   // Alternative to target_url — triggers site-wide crawl
  location: string;
  business_name?: string;
  business_type?: string;
}

// ── Site Crawl ────────────────────────────────────────────────────────

export interface CrawledPage {
  url: string;
  title: string;
  meta_description: string;
  h1: string;
  word_count: number;
  issues: string[];
}

export interface SiteAggregate {
  pages_crawled: number;
  missing_title: number;
  missing_meta_description: number;
  missing_h1: number;
  avg_word_count: number;
  thin_content_count: number;
  thin_content_pages: string[];
  coverage_score: number;
}

// ── Keyword Research ─────────────────────────────────────────────────

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

// ── On-Page SEO ──────────────────────────────────────────────────────

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

// ── Local SEO ────────────────────────────────────────────────────────

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

// ── Rank Tracker ─────────────────────────────────────────────────────

export interface RankingData {
  organic_rank: number | null;
  organic_health: "not_ranking" | "excellent" | "good" | "improving" | "needs_work";
  map_pack_rank: number | null;
  map_pack_health: "not_ranking" | "excellent" | "good" | "improving" | "needs_work";
  in_top_10: boolean;
  in_map_pack: boolean;
  positions_to_page_1: number;
  positions_to_map_pack: number;
}

export interface LocalPackEntry {
  rank: number;
  title: string;
  rating?: number;
  reviews?: number;
  address: string;
  phone?: string;
  website?: string;
}

// ── GBP Audit ────────────────────────────────────────────────────────

export interface GbpCheckItem {
  status: "pass" | "warn" | "fail" | "unknown";
  note: string;
}

export interface GbpAnalysis {
  gbp_score: number;
  map_pack_status: {
    in_pack: boolean;
    current_rank: number | null;
    pack_competitors: string[];
  };
  completeness_audit: Record<string, GbpCheckItem>;
  nap_consistency: {
    name_on_website: string;
    address_on_website: string;
    phone_on_website: string;
    consistent: boolean;
    issues: string[];
  };
  review_strategy: {
    current_visibility: string;
    recommended_target: string;
    acquisition_tactics: string[];
  };
  priority_actions: Array<{
    action: string;
    impact: string;
    effort: string;
    reason: string;
    how_to: string;
  }>;
  competitor_insights: {
    what_competitors_do_better: string[];
    gaps_to_exploit: string[];
  };
  summary: {
    top_priority: string;
    estimated_pack_entry_timeline: string;
    score_after_fixes: number;
  };
}

// ── Citation Builder ──────────────────────────────────────────────────

export interface CitationRecommendation {
  name: string;
  submit_url: string;
  da: number;
  free: boolean;
  reason: string;
  time_to_list?: string;
  status: string;
}

export interface CitationPlan {
  citation_score: number;
  total_in_database: number;
  recommendations: {
    tier_1_critical: CitationRecommendation[];
    tier_2_important: CitationRecommendation[];
    tier_3_supplemental: CitationRecommendation[];
  };
  nap_template: {
    business_name: string;
    address: string;
    phone: string;
    website: string;
    categories: string[];
    description: string;
  };
  consistency_rules: string[];
  monthly_plan: Record<string, string[]>;
  summary: {
    tier_1_count: number;
    tier_2_count: number;
    tier_3_count: number;
    total_recommended: number;
    estimated_da_impact: string;
    time_to_complete: string;
  };
}

// ── Backlink Analysis ─────────────────────────────────────────────────

export interface BacklinkProfile {
  domain_authority: number;
  page_authority: number;
  data_source: "verified" | "estimated";
  spam_score?: number;
  linking_domains?: number;
  links?: number;
}

// ── Link Building ─────────────────────────────────────────────────────

export interface LinkBuildingOpportunity {
  name: string;
  url: string;
  link_type: string;
  difficulty: string;
  expected_da: number;
  reason?: string;
  topic_idea?: string;
  angle?: string;
  opportunity_type?: string;
  competitor_linked?: string;
  contact_method?: string;
  outreach_template?: {
    subject: string;
    body: string;
  };
}

export interface LinkBuildingRecommendations {
  quick_wins: LinkBuildingOpportunity[];
  guest_posting: LinkBuildingOpportunity[];
  resource_pages: LinkBuildingOpportunity[];
  local_opportunities: LinkBuildingOpportunity[];
  competitor_gaps: LinkBuildingOpportunity[];
  summary?: {
    total_opportunities: number;
    estimated_da_gain_3mo: string;
    priority_order: string[];
    monthly_link_target: number;
  };
}

// ── AI SEO ────────────────────────────────────────────────────────────

export interface AiSeoAnalysis {
  ai_visibility_score: number;
  score_breakdown: {
    schema_markup: number;
    faq_content: number;
    eeat_signals: number;
    content_depth: number;
    local_signals: number;
  };
  ai_mention_likelihood: "low" | "medium" | "high";
  ai_answer_preview: string;
  current_gaps: string[];
  priority_actions: Array<{
    action: string;
    impact: string;
    effort: string;
    why: string;
    how: string;
  }>;
  schema_templates: Array<{
    type: string;
    priority: string;
    description: string;
    json_ld: string;
  }>;
  faq_content: Array<{
    question: string;
    answer: string;
    ai_intent: string;
  }>;
  summary: {
    top_priority: string;
    estimated_score_after_fixes: number;
    time_to_implement: string;
  };
}

// ── Agent wrappers ────────────────────────────────────────────────────

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

export interface RankTrackerAgent {
  agent: "rank_tracker";
  audit_id: string;
  status: string;
  keyword: string;
  location: string;
  target_url: string;
  rankings: RankingData;
  serp_features: string[];
  local_pack: LocalPackEntry[];
  top_10_organic: Array<{ rank: number; title: string; url: string }>;
  snapshot_date: string;
}

export interface GbpAuditAgent {
  agent: "gbp_audit";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  map_pack_rank: number | null;
  organic_rank: number | null;
  serp_features: string[];
  local_pack: LocalPackEntry[];
  analysis: GbpAnalysis;
  timestamp: string;
}

export interface CitationBuilderAgent {
  agent: "citation_builder";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  region: string;
  citations_in_database: number;
  plan: CitationPlan;
  timestamp: string;
}

export interface BacklinkAnalysisAgent {
  agent: "backlink_analysis";
  audit_id: string;
  status: string;
  target_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis: any;
  timestamp: string;
}

export interface LinkBuildingAgent {
  agent: "link_building";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  total_opportunities: number;
  recommendations: LinkBuildingRecommendations;
  timestamp: string;
}

export interface AiSeoAgent {
  agent: "ai_seo";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  signals_collected: {
    schema_types_found: string[];
    schema_types_missing: string[];
    paa_questions_found: number;
    has_faq_schema: boolean;
    has_author_bio: boolean;
    has_credentials: boolean;
    reviews_on_page: boolean;
    has_about_page: boolean;
  };
  analysis: AiSeoAnalysis;
  timestamp: string;
}

export interface ContentRewriterAgent {
  agent: "content_rewriter";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis: any;
  rewritten_content: string;
  word_count: number;
  timestamp: string;
}

export interface TechnicalSeoAgent {
  agent: "technical_seo";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  page_scraped: boolean;
  pagespeed_fetched: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pagespeed: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signals: any;
  crawl_aggregate?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations: any;
  timestamp: string;
}

export interface BlogWriterAgent {
  agent: "blog_writer";
  audit_id: string;
  status: string;
  keyword: string;
  target_url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brief: any;
  rewritten_content: string;
  word_count: number;
  timestamp: string;
}

// ── Dashboard Scores & Pillars ─────────────────────────────────────────

export interface AuditScores {
  overall: number;
  website_seo: number;
  backlinks: number;
  local_seo: number;
  ai_seo: number;
}

export interface QuickWin {
  rank: number;
  title: string;
  description: string;
  pillar: "website_seo" | "backlinks" | "local_seo" | "ai_seo";
  priority: "high" | "medium" | "low";
  impact: string;
  time_estimate: string;
}

export interface ImprovementStep {
  rank: number;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  impact: string;
  time_estimate: string;
}

export interface PillarData {
  score: number;
  title: string;
  subtitle: string;
  color: string;
  steps: ImprovementStep[];
}

export interface AuditPillars {
  website_seo: PillarData;
  backlinks: PillarData;
  local_seo: PillarData;
  ai_seo: PillarData;
}

// ── Score Details (sub-scores per pillar) ────────────────────────────

export interface ScoreDetails {
  website_seo: {
    page_speed: number;
    on_page: number;
    technical: number;
    issues_count: number;
  };
  backlinks: {
    estimated_da: number;
    estimated_backlinks: number;
    competitors_avg_da: number;
  };
  local_seo: {
    gbp_status: string;
    citations_found: number;
    citations_needed: number;
    review_count: number;
  };
  ai_seo: {
    faq_schema: boolean;
    eeat_signals: boolean;
    content_depth: string;
  };
}

// ── SEO Task (flat checklist item) ──────────────────────────────────

export interface SeoTask {
  id: string;
  title: string;
  pillar: "website_seo" | "backlinks" | "local_seo" | "ai_seo";
  priority: "high" | "medium" | "low";
  time_estimate: string;
  impact: string;
  status: "pending" | "completed";
  completed_at?: string;
}

// ── Full Audit Result ─────────────────────────────────────────────────

export interface AuditResult {
  audit_id: string;
  business_name?: string;
  business_type?: string;
  keyword: string;
  target_url: string;
  domain?: string;
  location: string;
  scores?: AuditScores;
  score_details?: ScoreDetails;
  local_seo_score?: number;  // backward compat
  quick_wins?: QuickWin[];   // new structured format
  pillars?: AuditPillars;
  seo_tasks?: SeoTask[];
  estimated_cost?: number;
  status: string;
  agents_executed: number;
  execution_time_seconds: number;
  timestamp: string;
  site_aggregate?: SiteAggregate;
  pages_crawled?: CrawledPage[];
  agents: {
    keyword_research: KeywordResearchAgent;
    on_page_seo: OnPageSeoAgent;
    local_seo: LocalSeoAgent;
    technical_seo?: TechnicalSeoAgent;
    rank_tracker?: RankTrackerAgent;
    gbp_audit?: GbpAuditAgent;
    citation_builder?: CitationBuilderAgent;
    backlink_analysis?: BacklinkAnalysisAgent;
    link_building?: LinkBuildingAgent;
    ai_seo?: AiSeoAgent;
    content_rewriter?: ContentRewriterAgent;
    blog_writer?: BlogWriterAgent;
  };
  summary: {
    quick_wins: string[];
    estimated_api_cost: number;
  };
}
