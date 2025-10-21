import { riskAnalyzer } from './riskAnalyzer';

export type QuizAnswers = {
  protectiveStyles: string[]; // style IDs
  scalpAreas: string[]; // e.g., ['edges','temples']
  ageRange?: string;
  whenNoticed?: string;
  primaryConcern?: string;
  scalpIssues?: string[];
};

export async function generateRecommendations(quizAnswers: QuizAnswers) {
  const { protectiveStyles, scalpAreas = [] } = quizAnswers;
  const riskScore = riskAnalyzer.calculateRiskScore(protectiveStyles);
  const concerns = riskAnalyzer.identifyPrimaryConcerns(protectiveStyles);
  const patterns = riskAnalyzer.detectPatterns(protectiveStyles);

  const affectedAreaMatch = matchAffectedAreas(concerns.affectedAreas, scalpAreas);
  const products = recommendProducts(riskScore, concerns, patterns);
  const education = generateEducation(patterns, concerns);
  const actionPlan = createActionPlan(riskScore, patterns, concerns);
  const summary = generateSummary(riskScore, patterns, affectedAreaMatch);

  return { riskScore, concerns, patterns, affectedAreaMatch, products, education, actionPlan, summary };
}

function matchAffectedAreas(predicted: string[], reported: string[]) {
  const matches = predicted.filter((a) => reported.includes(a));
  const unexpected = reported.filter((a) => !predicted.includes(a));
  return {
    matches,
    matchRate: reported.length ? matches.length / reported.length : 0,
    unexpected,
    insight: matches.length && !unexpected.length
      ? 'Your hair loss pattern matches your styling habits.'
      : unexpected.length
      ? 'Some affected areas are not explained by styling alone.'
      : 'Analysis complete',
  };
}

function recommendProducts(riskScore: ReturnType<typeof riskAnalyzer.calculateRiskScore>, concerns: any, patterns: any[]) {
  const products = { essential: [] as any[], recommended: [] as any[], optional: [] as any[] };

  if (concerns.affectedAreas.includes('edges') || concerns.affectedAreas.includes('temples')) {
    products.essential.push({ category: 'edge_repair', name: 'Fulani Edge Growth Serum', reason: 'Repairs damage from tight styling and restores hairline', priority: 'high' });
  }
  if (riskScore.riskLevel === 'critical' || riskScore.riskLevel === 'high') {
    products.essential.push({ category: 'scalp_treatment', name: 'Fulani Scalp Recovery Oil', reason: 'Reduces inflammation from tension and promotes blood flow', priority: 'high' });
  }
  if (concerns.damageTypes?.includes?.('adhesive_damage')) {
    products.essential.push({ category: 'chemical_repair', name: 'Fulani Detox & Repair Treatment', reason: 'Removes adhesive residue and repairs chemical damage', priority: 'high' });
  }
  if (concerns.tensionTypes?.includes?.('weight')) {
    products.recommended.push({ category: 'strengthening', name: 'Fulani Root Strengthening Serum', reason: 'Strengthens roots to handle weight of locs/braids', priority: 'medium' });
  }
  products.recommended.push({ category: 'growth', name: 'Fulani Hair Growth System', reason: 'Promotes new growth and thicker hair density', priority: 'medium' });
  return products;
}

function generateEducation(patterns: any[], concerns: any) {
  const lessons: any[] = [];
  patterns.filter((p) => p.severity === 'critical').forEach((p) => {
    lessons.push({ title: getEducationTitle(p.type), content: getEducationContent(p.type), urgency: 'high', readTime: '3 min' });
  });
  (concerns.primaryConcerns || []).slice(0, 2).forEach(({ concern }: any) => {
    lessons.push({ title: getEducationTitle(concern), content: getEducationContent(concern), urgency: 'medium', readTime: '4 min' });
  });
  return lessons;
}

function getEducationTitle(type: string) {
  const titles: Record<string, string> = {
    extreme_edge_stress: 'Why Your Edges Are Disappearing (And How to Save Them)',
    chemical_plus_tension: 'The Hidden Danger of Glue + Tight Styles',
    edge_damage: 'Understanding Traction Alopecia in Nigerian Women',
    traction_alopecia: 'Reversing Traction Alopecia: A Step-by-Step Guide',
  };
  return titles[type] || 'Understanding Your Hair Loss';
}

function getEducationContent(type: string) {
  return `Educational content for ${type}...`;
}

function createActionPlan(riskScore: ReturnType<typeof riskAnalyzer.calculateRiskScore>, patterns: any[], concerns: any) {
  const plan = { immediate: [] as any[], shortTerm: [] as any[], longTerm: [] as any[] };
  if (riskScore.riskLevel === 'critical') {
    plan.immediate.push({ action: 'Stop all high-tension styles immediately', why: 'Prevent further damage to hair follicles', duration: 'Start today' });
    plan.immediate.push({ action: 'Begin using edge repair serum 2x daily', why: 'Start repair process immediately', duration: 'Ongoing' });
  }
  plan.shortTerm.push({ action: 'Switch to low-tension protective styles', why: 'Give your hair time to recover', duration: '30-60 days' });
  plan.shortTerm.push({ action: 'Scalp massage 3x per week', why: 'Increase blood flow to follicles', duration: 'Ongoing' });
  plan.longTerm.push({ action: 'Rotate protective styles every 6-8 weeks', why: 'Prevent tension buildup', duration: 'Permanent habit' });
  plan.longTerm.push({ action: 'Take monthly progress photos', why: 'Track regrowth and adjust treatment', duration: 'Next 6 months' });
  return plan;
}

function generateSummary(riskScore: ReturnType<typeof riskAnalyzer.calculateRiskScore>, patterns: any[], area: any) {
  let summary = '';
  if (riskScore.riskLevel === 'critical') summary = `Your styling habits are putting your hair at critical risk. `;
  else if (riskScore.riskLevel === 'high') summary = `Your hair is experiencing significant tension-related stress. `;
  else if (riskScore.riskLevel === 'moderate') summary = `You have some styling habits that could be improved for better hair health. `;
  else summary = `Great news! Your styling habits are relatively hair-healthy. `;
  if (area.matchRate > 0.7) summary += `The good news: your hair loss pattern matches your styling habits, which means it's reversible with the right changes.`;
  else summary += `Not all affected areas match your styling patterns - we should also look at hormonal or nutritional factors.`;
  return summary;
}
