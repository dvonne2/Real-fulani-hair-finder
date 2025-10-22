export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'slider' | 'date' | 'binary';
  title: string;
  description?: string;
  infoBox?: string;
  options?: string[];
  sliderConfig?: {
    min: number;
    max: number;
    labels: { [key: number]: string };
  };
  conditional?: {
    dependsOn: string;
    showWhen: any;
  };
}

export interface QuizResponse {
  questionId: string;
  answer: any;
}

export const quizQuestions: Question[] = [
  {
    id: 'age-range',
    type: 'single',
    title: 'What is your age range?',
    description: 'Age helps us understand hormonal factors',
    options: [
      '18-25 years',
      '26-35 years',
      '36-45 years',
      '46-55 years (perimenopause/menopause)',
      '56+ years'
    ]
  },
  {
    id: 'primary-concern',
    type: 'single',
    title: 'What brings you here today? (Select your PRIMARY concern)',
    description: 'Choose the ONE issue that concerns you most',
    options: [
      'Thinning edges or receding hairline',
      'Bald patches or areas with no hair growth',
      'Overall thinning across the scalp',
      'Excessive shedding (hair falls out in clumps)',
      'Breakage (hair snaps when styling/combing)',
      "Hair won't grow past a certain length",
      'Scalp issues (itching, flaking, sores)'
    ]
  },
  {
    id: 'noticed-when',
    type: 'single',
    title: 'When did you first notice these concerns?',
    options: [
      'Less than 3 months ago',
      '3-6 months ago',
      '6-12 months ago',
      '1-2 years ago',
      'More than 2 years ago',
      "I'm not sure"
    ]
  },
  {
    id: 'affected-areas',
    type: 'multiple',
    title: 'Which part of your scalp is most affected?',
    description: "Select all areas where you're experiencing issues",
    options: [
      'Edges (front hairline)',
      'Temples (sides of hairline)',
      'Crown (top/center of head)',
      'Nape (back of neck)',
      'Patches throughout scalp',
      'Even thinning all over'
    ]
  },
  {
    id: 'shedding-vs-breakage',
    type: 'single',
    title: "How would you describe what's happening to your hair?",
    description: "This helps us determine if it's shedding or breakage",
    options: [
      'Hair falls out from the root (long strands with white bulb at the end)',
      'Hair breaks off at different lengths (short pieces, no bulb, rough ends)',
      'Both falling out and breaking',
      "I'm not sure"
    ]
  },
  {
    id: 'length-distribution',
    type: 'single',
    title: 'Which part of your hair is the longest? Which is the shortest?',
    options: [
      'Crown is longest, edges are shortest',
      'Front/crown is longest, back/nape is shortest',
      'Back/nape is longest, front is shortest',
      'Sides are longest, middle is shortest',
      'All relatively the same length',
      'Hair is too short to tell'
    ]
  },
  // SECTION 3: Styling Habits & Traction (Q7-9)
  {
    id: 'protective-styles-often',
    type: 'multiple',
    title: 'What protective styles do you wear most often?',
    description: 'Select all that apply - this helps us understand tension on your hairline',
    options: [
      'All-back / Cornrows / Weaving',
      'Box braids',
      'Million braids (very small box braids)',
      'Micro twists',
      'Ghana weaving / Shuku',
      'Weaves (sewn-in / fixing)',
      'Wigs with glue (frontal, lace wigs)',
      'Wigs without glue (closure, headband)',
      'Crochet braids',
      'Twists / Senegalese twists',
      'Dreadlocs / Locs',
      'Faux locs',
      'Threading - Kiko / Didi',
      'Tight ponytails / Packing gel',
      'Natural hair out (afro/TWA)'
    ]
  },
  {
    id: 'covered-hair-effects',
    type: 'single',
    title: 'When your hair is covered (wig, scarf, bonnet), what happens?',
    options: [
      'My scalp gets itchy or irritated',
      'I notice more flaking or dandruff',
      'My scalp sweats excessively',
      'Scalp issues get worse',
      'No issues - my scalp feels fine',
      "I don't cover my hair regularly"
    ]
  },
  {
    id: 'sleep-bonnet',
    type: 'single',
    title: 'Do you sleep with a silk/satin bonnet or silk/ satin pillowcase?',
    options: [
      'Yes, always',
      'Sometimes',
      'No, I use cotton',
      'I sleep with nothing on my head',
      'I sleep with my wig/weave on'
    ]
  },
  // SECTION 4: Scalp Health (Q10-11)
  {
    id: 'scalp-issues-detailed',
    type: 'multiple',
    title: 'Are you experiencing any scalp issues?',
    description: 'Select all that apply',
    options: [
      'Dandruff (white flakes)',
      'Itchy scalp',
      'Painful or tender spots when pressed',
      'Ringworm or fungal infection',
      'Sores or scabs',
      'Excessive oiliness',
      'Very dry, tight scalp',
      'No scalp issues'
    ]
  },
  {
    id: 'wash-frequency',
    type: 'single',
    title: 'How often do you wash your hair?',
    options: [
      'Once a week or more',
      'Every 2 weeks',
      'Once a month',
      'Less than once a month',
      'Only when I take down my protective style'
    ]
  },
  // SECTION 5: Hormonal & Medical History (Q12-14)
  {
    id: 'life-events-2years',
    type: 'multiple',
    title: 'Have you experienced any of these life events in the past 2 years?',
    description: 'Select all that apply',
    options: [
      'Pregnancy',
      'Postpartum (after giving birth)',
      'Breastfeeding',
      'Menopause or perimenopause',
      'Hot flashes or night sweats',
      'Major surgery or illness',
      'Significant stress or trauma',
      'Started or stopped birth control',
      'None of these'
    ]
  },
  {
    id: 'family-history-detailed',
    type: 'single',
    title: 'Does hair loss run in your family?',
    options: [
      'Yes - my mother has thinning hair or thin edges',
      'Yes - my father is bald or has significant hair loss',
      'Yes - both parents',
      'Yes - siblings or other relatives',
      'No family history of hair loss',
      "I'm not sure"
    ]
  },
  {
    id: 'diagnosed-conditions',
    type: 'multiple',
    title: 'Have you been diagnosed with any of these conditions?',
    description: 'Select all that apply',
    options: [
      'Thyroid issues (hypo/hyperthyroidism)',
      'Anemia (low iron)',
      'PCOS (Polycystic Ovary Syndrome)',
      'Diabetes',
      'Autoimmune condition',
      'Vitamin/mineral deficiency',
      'None of these',
      "Not sure/haven't been tested"
    ]
  },
  // SECTION 6: Goals & Commitment (Q15)
  {
    id: 'primary-goal',
    type: 'single',
    title: 'What is your #1 hair goal right now?',
    options: [
      'Regrow my edges and hairline',
      'Stop hair from breaking and shedding',
      'Fill in bald patches',
      'Grow my hair longer and thicker',
      'Heal my scalp issues',
      'Maintain healthy hair and prevent future loss'
    ]
  }
];