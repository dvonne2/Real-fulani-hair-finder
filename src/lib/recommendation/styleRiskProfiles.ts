export type StyleRiskProfile = {
  riskScore: number;
  tensionType: 'installation' | 'pulling' | 'chemical' | 'combined' | 'weight' | 'minimal' | 'protective' | 'none';
  affectedAreas: string[]; // e.g., ['edges','temples','crown']
  concerns: string[]; // e.g., ['edge_damage','traction_alopecia']
  damageType: 'extreme_tension' | 'constant_tension' | 'adhesive_damage' | 'tight_braiding' | 'weight_plus_tension' | 'moderate_tension' | 'gravitational_pull' | 'low_manipulation' | 'no_tension';
};

export const STYLE_RISK_PROFILES: Record<string, StyleRiskProfile> = {
  // High Tension Styles (8-10)
  micro_twists: {
    riskScore: 10,
    tensionType: 'installation',
    affectedAreas: ['edges', 'temples', 'crown'],
    concerns: ['edge_damage', 'traction_alopecia', 'breakage'],
    damageType: 'extreme_tension',
  },
  tight_ponytails: {
    riskScore: 9,
    tensionType: 'pulling',
    affectedAreas: ['edges', 'temples'],
    concerns: ['edge_damage', 'traction_alopecia', 'hairline_recession'],
    damageType: 'constant_tension',
  },
  wigs_glue: {
    riskScore: 9,
    tensionType: 'chemical',
    affectedAreas: ['edges', 'temples', 'hairline'],
    concerns: ['chemical_damage', 'edge_damage', 'scalp_irritation'],
    damageType: 'adhesive_damage',
  },
  allback_cornrows: {
    riskScore: 8,
    tensionType: 'installation',
    affectedAreas: ['edges', 'temples', 'crown'],
    concerns: ['traction_alopecia', 'edge_damage'],
    damageType: 'tight_braiding',
  },
  ghana_weaving: {
    riskScore: 8,
    tensionType: 'installation',
    affectedAreas: ['edges', 'temples'],
    concerns: ['traction_alopecia', 'edge_damage'],
    damageType: 'tight_braiding',
  },

  // Medium Tension (4-7)
  box_braids: {
    riskScore: 6,
    tensionType: 'installation',
    affectedAreas: ['crown', 'nape'],
    concerns: ['weight_stress', 'breakage'],
    damageType: 'moderate_tension',
  },
  faux_locs: {
    riskScore: 7,
    tensionType: 'combined',
    affectedAreas: ['edges', 'crown'],
    concerns: ['weight_stress', 'installation_tension'],
    damageType: 'weight_plus_tension',
  },
  weaves: {
    riskScore: 6,
    tensionType: 'installation',
    affectedAreas: ['crown', 'perimeter'],
    concerns: ['weight_stress', 'breakage'],
    damageType: 'moderate_tension',
  },
  crochet: {
    riskScore: 5,
    tensionType: 'installation',
    affectedAreas: ['crown'],
    concerns: ['breakage'],
    damageType: 'moderate_tension',
  },
  dreadlocs: {
    riskScore: 5,
    tensionType: 'weight',
    affectedAreas: ['crown', 'edges'],
    concerns: ['weight_stress', 'root_weakness'],
    damageType: 'gravitational_pull',
  },
  one_million_braids: {
    riskScore: 7,
    tensionType: 'combined',
    affectedAreas: ['edges', 'crown'],
    concerns: ['weight_stress', 'installation_tension', 'edge_damage'],
    damageType: 'weight_plus_tension',
  },

  // Low Tension (1-3)
  twists_senegalese: {
    riskScore: 3,
    tensionType: 'minimal',
    affectedAreas: [],
    concerns: ['minimal_risk'],
    damageType: 'low_manipulation',
  },
  wigs_no_glue: {
    riskScore: 2,
    tensionType: 'minimal',
    affectedAreas: [],
    concerns: ['minimal_risk'],
    damageType: 'low_manipulation',
  },
  threading_didi: {
    riskScore: 3,
    tensionType: 'protective',
    affectedAreas: [],
    concerns: ['minimal_risk'],
    damageType: 'low_manipulation',
  },
  natural_hair: {
    riskScore: 1,
    tensionType: 'none',
    affectedAreas: [],
    concerns: ['minimal_risk'],
    damageType: 'no_tension',
  },
};
