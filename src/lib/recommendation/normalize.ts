// Normalize quiz labels to stable IDs for backend/engine

export function normalizeProtectiveStyles(labels: string[] = []): string[] {
  return labels.map((l) => {
    const s = l.toLowerCase();
    if (/all[- ]?back|cornrows|weaving/.test(s)) return 'allback_cornrows';
    if (/\bbox braids\b/.test(s)) return 'box_braids';
    if (/million braids/.test(s)) return 'one_million_braids';
    if (/micro twists/.test(s)) return 'micro_twists';
    if (/ghana weaving|shuku/.test(s)) return 'ghana_weaving';
    if (/weaves.*sewn|fixing/.test(s)) return 'weaves';
    if (/wigs.*glue|frontal|lace/.test(s)) return 'wigs_glue';
    if (/wigs.*without|closure|headband/.test(s)) return 'wigs_no_glue';
    if (/crochet/.test(s)) return 'crochet';
    if (/twists.*senegalese|senegalese twists|^twists\b/.test(s)) return 'twists_senegalese';
    if (/dreadlocs|locs/.test(s)) return 'dreadlocs';
    if (/faux locs/.test(s)) return 'faux_locs';
    if (/threading|kiko|didi/.test(s)) return 'threading_didi';
    if (/tight ponytails|packing gel/.test(s)) return 'tight_ponytails';
    if (/natural hair/.test(s)) return 'natural_hair';
    return s.replace(/[^a-z0-9_]+/g, '_');
  });
}

export function normalizeScalpAreas(labels: string[] = []): string[] {
  return labels.map((l) => {
    const s = l.toLowerCase();
    if (/edge/.test(s)) return 'edges';
    if (/temple/.test(s)) return 'temples';
    if (/crown|top|center/.test(s)) return 'crown';
    if (/nape|back of neck/.test(s)) return 'nape';
    if (/patch/.test(s)) return 'patches';
    if (/even thinning|all over|overall/.test(s)) return 'overall';
    return s.replace(/[^a-z0-9_]+/g, '_');
  });
}

export function normalizeAnswers(input: {
  protectiveStyles?: string[];
  scalpAreas?: string[];
  ageRange?: string;
  whenNoticed?: string;
  primaryConcern?: string;
}) {
  return {
    protectiveStyles: normalizeProtectiveStyles(input.protectiveStyles || []),
    scalpAreas: normalizeScalpAreas(input.scalpAreas || []),
    ageRange: input.ageRange,
    whenNoticed: input.whenNoticed,
    primaryConcern: input.primaryConcern,
  };
}
