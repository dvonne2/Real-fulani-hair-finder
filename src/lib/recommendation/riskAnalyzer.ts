import { STYLE_RISK_PROFILES } from './styleRiskProfiles';

export type RiskScore = {
  totalScore: number;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'minimal' | 'unknown';
  maxIndividualRisk: number;
  averageRisk: number;
};

export type Concerns = {
  primaryConcerns: { concern: string; frequency: number }[];
  affectedAreas: string[];
  tensionTypes: string[];
  damageTypes: string[];
};

export type Pattern = {
  type: string;
  severity: 'critical' | 'positive' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export class RiskAnalyzer {
  calculateRiskScore(selectedStyles: string[] = []): RiskScore {
    if (!selectedStyles.length) {
      return { totalScore: 0, riskLevel: 'unknown', maxIndividualRisk: 0, averageRisk: 0 };
    }
    const scores = selectedStyles.map((id) => STYLE_RISK_PROFILES[id]?.riskScore || 0);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const totalScore = maxScore * 0.7 + avgScore * 0.3;
    return {
      totalScore: Math.round(totalScore * 10) / 10,
      riskLevel: this.getRiskLevel(totalScore),
      maxIndividualRisk: maxScore,
      averageRisk: Math.round(avgScore * 10) / 10,
    };
  }

  getRiskLevel(score: number): RiskScore['riskLevel'] {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'moderate';
    if (score >= 2) return 'low';
    return 'minimal';
  }

  identifyPrimaryConcerns(selectedStyles: string[] = []): Concerns {
    const concernCounts: Record<string, number> = {};
    const affectedAreas = new Set<string>();
    const tensionTypes = new Set<string>();
    const damageTypes = new Set<string>();

    selectedStyles.forEach((id) => {
      const p = STYLE_RISK_PROFILES[id];
      if (!p) return;
      p.concerns.forEach((c) => (concernCounts[c] = (concernCounts[c] || 0) + 1));
      p.affectedAreas.forEach((a) => affectedAreas.add(a));
      tensionTypes.add(p.tensionType);
      damageTypes.add(p.damageType);
    });

    const primaryConcerns = Object.entries(concernCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([concern, frequency]) => ({ concern, frequency }));

    return {
      primaryConcerns,
      affectedAreas: Array.from(affectedAreas),
      tensionTypes: Array.from(tensionTypes),
      damageTypes: Array.from(damageTypes),
    };
  }

  detectPatterns(selectedStyles: string[] = []): Pattern[] {
    const patterns: Pattern[] = [];
    const highTension = selectedStyles.filter((id) => (STYLE_RISK_PROFILES[id]?.riskScore || 0) >= 8);
    if (highTension.length >= 2) {
      patterns.push({
        type: 'multiple_high_tension',
        severity: 'critical',
        message: 'You frequently wear multiple high-tension styles',
        recommendation: 'Rotate with low-tension protective styles',
      });
    }

    if (selectedStyles.includes('micro_twists') && selectedStyles.includes('tight_ponytails')) {
      patterns.push({
        type: 'extreme_edge_stress',
        severity: 'critical',
        message: 'This combination puts extreme stress on your hairline',
        recommendation: 'Give your edges a break for at least 3 months',
      });
    }

    if (selectedStyles.includes('wigs_glue') && selectedStyles.includes('tight_ponytails')) {
      patterns.push({
        type: 'chemical_plus_tension',
        severity: 'critical',
        message: 'Chemical damage + physical tension = severe edge damage',
        recommendation: 'Switch to glueless wigs and loose styles immediately',
      });
    }

    const weightBased = selectedStyles.filter((id) => ['dreadlocs', 'faux_locs', 'box_braids'].includes(id));
    const lowTension = selectedStyles.filter((id) => {
      const s = STYLE_RISK_PROFILES[id]?.riskScore || 0;
      return s <= 3;
    });
    if (weightBased.length > 0 && lowTension.length > 0) {
      patterns.push({
        type: 'balanced_approach',
        severity: 'positive',
        message: 'Good! You balance protective styles with low-manipulation options',
        recommendation: 'Continue this approach and focus on scalp massage',
      });
    }

    if (selectedStyles.length > 0 && selectedStyles.every((id) => (STYLE_RISK_PROFILES[id]?.riskScore || 0) <= 3)) {
      patterns.push({
        type: 'low_risk_styling',
        severity: 'positive',
        message: 'Excellent! Your styling habits are hair-healthy',
        recommendation: 'Maintain scalp health and nutrition',
      });
    }

    if (selectedStyles.length === 1 && selectedStyles.includes('natural_hair')) {
      patterns.push({
        type: 'natural_only',
        severity: 'positive',
        message: 'You wear your natural hair - minimal tension risk',
        recommendation: 'Focus on moisture retention and gentle handling',
      });
    }

    return patterns;
  }
}

export const riskAnalyzer = new RiskAnalyzer();
