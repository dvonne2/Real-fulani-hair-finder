import React, { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeAnswers } from '@/lib/recommendation/normalize';
import { generateRecommendations } from '@/lib/recommendation/recommendationEngine';
import OrderFormModal from './OrderFormModal';
import { Button } from '@/components/ui/button';
import { Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuizResponse } from './quizData';
import { saveQuizResult } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Lightweight analytics helper
function trackEvent(name: string, data: Record<string, any> = {}) {
  try {
    // @ts-ignore
    if (typeof gtag !== 'undefined') { /* global gtag */ gtag('event', name, data); }
  } catch {}
  // eslint-disable-next-line no-console
  console.log('[event]', name, data);
}

interface ResultsPageProps {
  responses: QuizResponse[];
  onRestart: () => void;
}

const testimonials = [
  {
    name: "Ngozi P.",
    location: "Lagos",
    title: "Start of the journey",
    rating: 5,
    text: "I was skeptical at first, but after just 2 weeks I can see baby hairs growing along my edges. The serum doesn't feel heavy on my scalp.",
    timeframe: "After 2 weeks"
  },
  {
    name: "Bukola G.",
    location: "Abuja",
    title: "It works",
    rating: 5,
    text: "My hair dresser noticed the difference before I did! She said my hair looks thicker and healthier. I'm so happy I found this.",
    timeframe: "After 2 months"
  },
  {
    name: "Adaeze N.",
    location: "Lagos",
    title: "My hair is finally growing again",
    rating: 5,
    text: "For years I struggled with breakage from tight braids. This routine has completely changed my hair health. My edges are coming back!",
    timeframe: "After 4 months"
  },
  {
    name: "Kemi O.",
    location: "Abuja",
    title: "After 6 months, my edges are full",
    rating: 5,
    text: "I can't believe the transformation. My hairline is completely restored and my hair is growing longer than it ever has. Worth every naira!",
    timeframe: "After 6 months"
  }
];

const faqs = [
  {
    question: "What makes Fulani Hair Gro special?",
    answer: "Our products are specifically formulated for African hair types using natural ingredients like chebe powder, fenugreek, and black seed oil. We understand the unique needs of 4C hair and protective styling."
  },
  {
    question: "How long does it take to see results?",
    answer: "Most customers see new growth within 2-4 weeks. Significant improvements in hair thickness and length typically occur within 3-6 months of consistent use."
  },
  {
    question: "Is it safe for daily use?",
    answer: "Yes! Our products are made with gentle, natural ingredients that are safe for daily use. They're free from harsh chemicals like sulfates, parabens, and mineral oil."
  },
  {
    question: "Can I use it with other products?",
    answer: "Absolutely. Our products work well with your existing hair care routine. However, avoid using products with heavy silicones that can block the scalp."
  },
  {
    question: "What if I don't see results?",
    answer: "We offer a 150-day money-back guarantee. If you're not satisfied with your results, contact us for a full refund."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can skip, pause, or cancel your subscription anytime through your account dashboard or by contacting our customer service team."
  }
];

export const ResultsPage: React.FC<ResultsPageProps> = ({ responses, onRestart }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('1-month');
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const savedRef = useRef(false);
  const { toast } = useToast();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [stockLeft, setStockLeft] = useState(22);
  const [engineResult, setEngineResult] = useState<any | null>(null);

  // Lead contact fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stateResidence, setStateResidence] = useState('');

  // Build an answers map for easier access
  const answers = useMemo(() => {
    const map: Record<string, unknown> = {};
    for (const r of responses) map[r.questionId] = r.answer;
    return map;
  }, [responses]);

  // Safe getters to satisfy strict typing
  const getStr = (key: string): string | undefined => {
    const v = answers[key];
    return typeof v === 'string' ? v : undefined;
  };
  const getArr = (key: string): string[] => {
    const v = answers[key];
    return Array.isArray(v) ? (v as string[]) : [];
  };

  // Helper: string includes any of a set
  const includesAny = (val: string, patterns: RegExp[]) => patterns.some(rx => rx.test(val));
  const arrayIncludesAny = (arr: string[] = [], patterns: RegExp[]) => arr.some(v => includesAny(String(v), patterns));

  // Extract normalized fields from our actual IDs
  const ageRange = getStr('age-range');
  const primaryConcern = getStr('primary-concern');
  const whenNoticed = getStr('noticed-when');
  const affectedAreas = getArr('affected-areas');
  const hairBehavior = getStr('shedding-vs-breakage');
  const lengthComparison = getStr('length-distribution');
  const protectiveStyles = getArr('protective-styles-often');
  const coveredHairIssues = getStr('covered-hair-effects');
  const bonnetUse = getStr('sleep-bonnet');
  const scalpIssues = getArr('scalp-issues-detailed');
  const washFrequency = getStr('wash-frequency');
  const lifeEvents = getArr('life-events-2years');
  const familyHistory = getStr('family-history-detailed');
  const medicalConditions = getArr('diagnosed-conditions');
  const primaryGoal = getStr('primary-goal');

  

  // Compute diagnosis set with confidence
  const getDiagnosis = () => {
    const diagnoses: string[] = [];
    const confidence: Record<string, number> = {};

    // Traction Alopecia
    const tractionIndicators = [
      arrayIncludesAny(affectedAreas, [/edge/i, /temple/i]),
      arrayIncludesAny(protectiveStyles, [
        /box braids/i,
        /cornrows/i,
        /tight ponytails/i,
        /(frontal|full lace).*uses glue/i,
        /ghana weaving|shuku/i
      ]),
      includesAny(lengthComparison ?? '', [/edges.*short/i]),
      includesAny(hairBehavior ?? '', [/breaks|both/i])
    ];
    const tractionScore = tractionIndicators.filter(Boolean).length;
    if (tractionScore >= 2) { diagnoses.push('Traction Alopecia'); confidence['traction'] = tractionScore / tractionIndicators.length; }

    // Telogen Effluvium (stress/postpartum)
    const telogenIndicators = [
      arrayIncludesAny(lifeEvents, [/postpartum/i, /breastfeeding/i]),
      arrayIncludesAny(lifeEvents, [/stress|job change|relocation|loss/i, /surgery|illness/i]),
      includesAny(hairBehavior ?? '', [/falls out|shedding|both/i]),
      includesAny(whenNoticed ?? '', [/less than 3/i, /^3-6/i]),
      includesAny(primaryConcern ?? '', [/excessive shedding/i])
    ];
    const telogenScore = telogenIndicators.filter(Boolean).length;
    if (telogenScore >= 3) { diagnoses.push('Telogen Effluvium'); confidence['telogen'] = telogenScore / telogenIndicators.length; }

    // Androgenic Alopecia
    const androgenicIndicators = [
      includesAny(familyHistory ?? '', [/mother|both/i]),
      includesAny(ageRange ?? '', [/46-55|56\+/i]),
      arrayIncludesAny(lifeEvents, [/menopause|perimenopause/i]),
      arrayIncludesAny(affectedAreas, [/crown/i, /even thinning|overall/i]),
      includesAny(whenNoticed ?? '', [/1-2 years/i, /more than 2/i]),
      includesAny(primaryConcern ?? '', [/overall thinning/i])
    ];
    const androgenicScore = androgenicIndicators.filter(Boolean).length;
    if (androgenicScore >= 3) { diagnoses.push('Androgenic Alopecia'); confidence['androgenic'] = androgenicScore / androgenicIndicators.length; }

    // Cicatricial (scalp infection / scarring)
    const cicatricialIndicators = [
      arrayIncludesAny(scalpIssues, [/ringworm|infection|sores|painful/i]),
      includesAny(primaryConcern ?? '', [/bald patches/i]),
      arrayIncludesAny(affectedAreas, [/patch/i])
    ];
    const cicatricialScore = cicatricialIndicators.filter(Boolean).length;
    if (cicatricialScore >= 2) { diagnoses.push('Cicatricial (Scarring) Alopecia'); confidence['cicatricial'] = cicatricialScore / cicatricialIndicators.length; }

    // Nutritional deficiency
    const nutritionalIndicators = [
      arrayIncludesAny(medicalConditions, [/anemia|iron/i, /vitamin/i]),
      includesAny(hairBehavior ?? '', [/breaks/i]),
      includesAny(primaryConcern ?? '', [/breakage/i]),
      arrayIncludesAny(lifeEvents, [/breastfeeding/i])
    ];
    const nutritionalScore = nutritionalIndicators.filter(Boolean).length;
    if (nutritionalScore >= 2) { diagnoses.push('Nutritional Deficiency-Related Hair Loss'); confidence['nutritional'] = nutritionalScore / nutritionalIndicators.length; }

    // Alopecia Areata (autoimmune)
    const areataIndicators = [
      arrayIncludesAny(medicalConditions, [/autoimmune/i]),
      includesAny(primaryConcern ?? '', [/bald patches/i]),
      arrayIncludesAny(affectedAreas, [/patch/i]),
      arrayIncludesAny(lifeEvents, [/stress/i])
    ];
    const areataScore = areataIndicators.filter(Boolean).length;
    if (areataScore >= 2) { diagnoses.push('Alopecia Areata'); confidence['areata'] = areataScore / areataIndicators.length; }

    if (!diagnoses.length) return { primary: 'General Hair Thinning', secondary: [] as string[], confidence };

    const order = diagnoses.sort((a, b) => {
      const ka = a.toLowerCase().split(' ')[0];
      const kb = b.toLowerCase().split(' ')[0];
      return (confidence[kb] || 0) - (confidence[ka] || 0);
    });
    return { primary: order[0], secondary: order.slice(1), confidence };
  };

  const diagnosis = useMemo(() => getDiagnosis(), [ageRange, primaryConcern, whenNoticed, affectedAreas, hairBehavior, lengthComparison, protectiveStyles, coveredHairIssues, bonnetUse, scalpIssues, washFrequency, lifeEvents, familyHistory, medicalConditions]);

  // Product recommendation engine
  const getProductRecommendation = () => {
    let severityScore = 0;

    // Factor: duration
    if (includesAny(whenNoticed ?? '', [/more than 2/i])) severityScore += 3;
    else if (includesAny(whenNoticed ?? '', [/1-2 years/i])) severityScore += 2;
    else if (includesAny(whenNoticed ?? '', [/6-12 months/i])) severityScore += 1;

    // Factor: affected areas
    if (arrayIncludesAny(affectedAreas, [/even thinning|overall/i])) severityScore += 3;
    else if (arrayIncludesAny(affectedAreas, [/crown/i])) severityScore += 2;
    else if (arrayIncludesAny(affectedAreas, [/patch/i])) severityScore += 2;
    if (affectedAreas.length >= 3) severityScore += 1;

    // Factor: primary diagnosis
    if (diagnosis.primary === 'Cicatricial (Scarring) Alopecia') severityScore += 3;
    else if (diagnosis.primary === 'Androgenic Alopecia') severityScore += 2;
    else if (diagnosis.primary === 'Alopecia Areata') severityScore += 2;
    else if (diagnosis.primary === 'Traction Alopecia') severityScore += 2;

    // Factor: scalp health
    if (arrayIncludesAny(scalpIssues, [/ringworm|sores/i])) severityScore += 2;
    if (scalpIssues.length >= 2) severityScore += 1;

    // Factor: multiple diagnoses
    if (diagnosis.secondary.length >= 2) severityScore += 2;
    else if (diagnosis.secondary.length === 1) severityScore += 1;

    // Decide bundle (simplified):
    // - severityScore >= 5 -> SELF LOVE PLUS B2GOF (3-month intensive, includes conditioner)
    // - otherwise -> SELF LOVE PLUS (1-month starter)
    let bundle: 'SELF LOVE PLUS' | 'SELF LOVE PLUS B2GOF' = 'SELF LOVE PLUS';
    let months = 1;
    let reasoning = '';
    const usage: { shampoo: string; pomade: string; conditioner: string } = { shampoo: '', pomade: '', conditioner: '' };

    if (severityScore >= 5) {
      bundle = 'SELF LOVE PLUS B2GOF';
      months = 3;
      reasoning = `Your ${diagnosis.primary} needs a complete 3‑month protocol. The shampoo + pomade + conditioner system addresses both scalp health and breakage for sustained results.`;
      usage.shampoo = 'Wash 2x per week to prep scalp';
      usage.pomade = 'Apply to affected areas 2x daily (morning & night)';
      usage.conditioner = 'Use after every wash to prevent breakage';
    } else {
      bundle = 'SELF LOVE PLUS';
      months = 1;
      reasoning = `Start with our complete system for 1 month. Since you caught this early (${whenNoticed ?? 'recently'}), you may see results quickly.`;
      usage.shampoo = 'Wash 1–2x per week';
      usage.pomade = 'Apply 1–2x daily to problem areas';
      usage.conditioner = 'Use after washing to seal moisture';
    }

    // Special emphases
    if (arrayIncludesAny(scalpIssues, [/ringworm|sores|dandruff/i])) {
      usage.shampoo = '⚠️ CRITICAL: Wash 2-3x per week to clear scalp issues before pomade can work optimally';
    }
    if (arrayIncludesAny(lifeEvents, [/postpartum/i])) {
      reasoning += ' Postpartum hair loss typically reverses within 6-9 months with proper treatment.';
    }
    if (includesAny(hairBehavior ?? '', [/breaks/i]) || includesAny(primaryConcern ?? '', [/breakage/i])) {
      usage.conditioner = '⚠️ CRITICAL: Use after EVERY wash. Your hair is breaking, not just shedding — moisture is essential.';
    }

    return { bundle, months, reasoning, usage, severityScore };
  };

  const productRecommendation = useMemo(() => getProductRecommendation(), [diagnosis, whenNoticed, affectedAreas, scalpIssues, lifeEvents, hairBehavior, primaryConcern]);

  // Unified WhatsApp number (replace with real number)
  const WHATSAPP_NUMBER = '234XXXXXXXXXX';

  // Pricing helper derived from recommendation
  const priceForBundle = (bundle: string): string => {
    if (bundle === 'SELF LOVE PLUS B2GOF') return '66,750';
    return '32,750';
  };
  const price = priceForBundle(productRecommendation.bundle);
  const numericPrice = typeof price === 'string' ? parseInt(price.replace(/,/g, ''), 10) : (price as unknown as number);

  // Analytics: page view and bundle viewed
  useEffect(() => {
    trackEvent('page_view', { page: 'results', bundle_shown: productRecommendation.bundle });
    trackEvent('bundle_viewed', { bundle: productRecommendation.bundle, price: numericPrice, severity_score: productRecommendation.severityScore });
  }, [productRecommendation.bundle, numericPrice, productRecommendation.severityScore]);

  // Scarcity: gently decrease stock to minimum of 15
  useEffect(() => {
    let active = true;
    const minStock = 15;
    const id = setInterval(() => {
      if (!active) return;
      setStockLeft((prev) => (prev > minStock && Math.random() < 0.25 ? prev - 1 : prev));
    }, 7000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // Comparison Matrix Scroll Tracking (fires once at 50% visibility)
  useEffect(() => {
    const matrix = document.getElementById('comparison-matrix');
    if (!matrix) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) {
            trackEvent('comparison_matrix_viewed', {
              scroll_depth: '50%',
              bundle: productRecommendation.bundle,
              severity_score: productRecommendation.severityScore,
            });
            observer.disconnect();
          }
        });
      },
      { threshold: [0.5] }
    );
    observer.observe(matrix);
    return () => observer.disconnect();
  }, [productRecommendation.bundle, productRecommendation.severityScore]);

  // Social proof: daily persistence + midnight reset + avatar wiggle
  useEffect(() => {
    const el = document.getElementById('social-count');
    if (!el) return;
    const lsKey = 'fhg-social-daily';
    const today = new Date();
    const dayKey = today.toISOString().slice(0, 10);
    const base = parseInt(el.textContent || '0', 10) || 0;
    let data: { date: string; count: number; adds: number } = { date: dayKey, count: base, adds: 0 };
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === dayKey && typeof parsed.count === 'number') {
          data = { date: dayKey, count: parsed.count, adds: parsed.adds || 0 };
          el.textContent = String(data.count);
        } else {
          localStorage.setItem(lsKey, JSON.stringify(data));
        }
      } else {
        localStorage.setItem(lsKey, JSON.stringify(data));
      }
    } catch {}

    const dailyMaxAdds = 12;
    const persist = () => { try { localStorage.setItem(lsKey, JSON.stringify(data)); } catch {} };
    const scheduleIncrement = () => {
      if (data.adds >= dailyMaxAdds) return;
      const delay = 20000 + Math.random() * 20000; // 20–40s
      const id = setTimeout(() => {
        if (data.adds >= dailyMaxAdds) return;
        const inc = Math.random() < 0.75 ? 1 : 2;
        data.count += inc;
        data.adds += 1;
        el.textContent = String(data.count);
        persist();
        scheduleIncrement();
      }, delay);
      return () => clearTimeout(id);
    };
    const cleanupInc = scheduleIncrement();

    // Reset at midnight
    const nextMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime();
    const resetId = window.setTimeout(() => {
      data = { date: new Date().toISOString().slice(0, 10), count: base, adds: 0 };
      el.textContent = String(data.count);
      persist();
      scheduleIncrement();
    }, Math.max(1000, nextMidnight - Date.now()));

    // Avatar wiggle
    let wiggleTimeout: number;
    const wiggleLoop = () => {
      const avatars = Array.from(document.querySelectorAll('.sp-avatar'));
      if (avatars.length) {
        const who = avatars[Math.floor(Math.random() * avatars.length)];
        if (who instanceof HTMLElement) {
          who.classList.add('avatar-wiggle');
          setTimeout(() => who.classList.remove('avatar-wiggle'), 800);
        }
      }
      wiggleTimeout = window.setTimeout(wiggleLoop, 30000 + Math.random() * 30000);
    };
    wiggleLoop();

    return () => {
      if (cleanupInc) cleanupInc();
      window.clearTimeout(resetId);
      window.clearTimeout(wiggleTimeout);
    };
  }, []);

  // Confetti on answers section ~30% visible (once per session) via CDN loader
  useEffect(() => {
    const sec = document.getElementById('answers-reveal');
    const key = 'fhg-confetti-bonus';
    if (!sec || sessionStorage.getItem(key)) return;

    function ensureConfetti(cb: () => void) {
      const w = window as any;
      if (typeof w.confetti === 'function') { cb(); return; }
      const existing = document.querySelector('script[data-confetti]') as HTMLScriptElement | null;
      if (existing) { existing.addEventListener('load', cb, { once: true }); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      s.async = true; s.defer = true; s.setAttribute('data-confetti', '1');
      s.addEventListener('load', cb, { once: true });
      document.body.appendChild(s);
    }

    const isMobile = window.innerWidth < 768;
    const trigger = () => {
      const w = window as any;
      if (typeof w.confetti !== 'function') return;
      const confetti = w.confetti;
      const duration = isMobile ? 2000 : 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#A78BFA'];
      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { window.clearInterval(interval); return; }
        const particleCount = isMobile ? 30 : 50;
        confetti({ particleCount, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors, gravity: 1.2, scalar: isMobile ? 1 : 1.2, ticks: 200 });
        confetti({ particleCount, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors, gravity: 1.2, scalar: isMobile ? 1 : 1.2, ticks: 200 });
        confetti({ particleCount: Math.floor(particleCount/2), angle: 90, spread: 100, origin: { x: 0.5, y: 0.5 }, colors, gravity: 1.0, scalar: isMobile ? 1.2 : 1.5, ticks: 200 });
      }, 250);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.3) {
          sessionStorage.setItem(key, '1');
          ensureConfetti(trigger);
          observer.disconnect();
        }
      });
    }, { threshold: [0.3] });
    observer.observe(sec);
    return () => observer.disconnect();
  }, []);

  // Reserve opens embedded order form modal
  const handleReserveClick = () => {
    // Track the click
    // eslint-disable-next-line no-console
    console.log('Reserve clicked:', {
      bundle: productRecommendation.bundle,
      price,
      diagnosis: diagnosis.primary,
    });

    trackEvent('cta_clicked', { bundle: productRecommendation.bundle, payment_type: 'pay_on_delivery', position: 'results_primary' });

    // Track with analytics (if available)
    // @ts-ignore
    if (typeof gtag !== 'undefined') {
      // @ts-ignore
      gtag('event', 'begin_checkout', {
        bundle: productRecommendation.bundle,
        value: typeof price === 'string' ? parseInt(String(price).replace(/,/g, ''), 10) : price,
        currency: 'NGN',
      });
    }

    setShowOrderForm(true);
    document.body.classList.add('modal-open');
  };

  const handleCloseModal = () => {
    setShowOrderForm(false);
    document.body.classList.remove('modal-open');
  };

  // Family Saves modal controls
  const handleOpenFamilySaves = () => {
    setShowFamilyModal(true);
    trackEvent('family_saves_interest', { action: 'modal_opened', from_bundle: productRecommendation.bundle });
  };
  const handleCloseFamilySaves = () => {
    setShowFamilyModal(false);
  };

  // Upsell click (separate from modal open)
  const handleUpsellClick = () => {
    trackEvent('upsell_clicked', {
      from: productRecommendation.bundle,
      to: 'FAMILY SAVES',
      position: 'results_page',
      current_price: priceForBundle(productRecommendation.bundle),
      upsell_price: 215750,
    });
    handleOpenFamilySaves();
  };

  // Keep a short expert paragraph using diagnosis + plan highlights
  const getPersonalizedRecommendation = () => {
    if (engineResult?.summary) return engineResult.summary as string;
    const confKey = diagnosis.primary.toLowerCase().split(' ')[0];
    const confPct = Math.round(((diagnosis.confidence as any)[confKey] || 0) * 100);
    return `Primary finding: ${diagnosis.primary}${confPct ? ` (${confPct}% confidence)` : ''}. We will focus on restoring scalp balance, protecting fragile areas, and stimulating follicles with a consistent routine tailored to your selections.`;
  };

  // Build full treatment plan steps based on answers/diagnosis
  type PlanItem = { priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'INFO'; title: string; action: string; product: string };
  const getTreatmentPlan = (): PlanItem[] => {
    const plan: PlanItem[] = [];

    // PRIORITY 1: Scalp issues
    if (scalpIssues.length) {
      if (arrayIncludesAny(scalpIssues, [/ringworm|sores|infection/i])) {
        plan.push({
          priority: 'URGENT',
          title: 'Scalp Healing Protocol',
          action: 'See a dermatologist for infection treatment. After clearance, begin Fulani Hair Gro to support follicle recovery.',
          product: 'Medical treatment first, then Fulani Hair Gro'
        });
      }
      if (arrayIncludesAny(scalpIssues, [/dandruff|itch/i])) {
        plan.push({
          priority: 'HIGH',
          title: 'Scalp Soothing Routine',
          action: 'Apply Fulani Hair Gro to scalp 3x weekly. Use gentle sulfate-free shampoo to calm irritation and reduce flaking.',
          product: 'Fulani Hair Gro + gentle sulfate-free shampoo'
        });
      }
    }

    // PRIORITY 2: Address primary diagnosis
    if (diagnosis.primary === 'Traction Alopecia') {
      plan.push({
        priority: 'HIGH',
        title: 'Stop Further Damage',
        action: arrayIncludesAny(protectiveStyles, [/tight ponytails|frontal wigs/i])
          ? 'Immediately stop tight ponytails and frontal wigs. Give edges a 3‑month break.'
          : 'Loosen braids/cornrows and request low‑tension styles from your stylist.',
        product: 'Edge-friendly styling products (non-alcohol)'
      });
      plan.push({
        priority: 'HIGH',
        title: 'Follicle Reactivation',
        action: 'Massage Fulani Hair Gro into edges and affected areas 2x daily to boost circulation and block DHT locally.',
        product: 'Fulani Hair Gro (Edge Recovery Focus)'
      });
    }

    if (diagnosis.primary === 'Telogen Effluvium') {
      plan.push({
        priority: 'HIGH',
        title: 'Nutrient Replenishment',
        action: arrayIncludesAny(lifeEvents, [/postpartum/i])
          ? 'Use a postnatal multivitamin with iron. Apply Fulani Hair Gro to support recovery from postpartum shedding.'
          : 'Reduce stress (sleep, breathwork, light exercise). Use Fulani Hair Gro to help shift follicles back to growth.',
        product: 'Fulani Hair Gro + multivitamin with iron'
      });
    }

    if (diagnosis.primary === 'Androgenic Alopecia') {
      plan.push({
        priority: 'HIGH',
        title: 'DHT Blocking Protocol',
        action: 'Apply Fulani Hair Gro 2x daily to the scalp for natural DHT modulation and improved density.',
        product: 'Fulani Hair Gro (DHT Blocking Focus)'
      });
      if (arrayIncludesAny(lifeEvents, [/menopause|perimenopause/i])) {
        plan.push({
          priority: 'MEDIUM',
          title: 'Hormonal Support',
          action: 'Discuss hormonal options with your doctor. Continue topical routine consistently.',
          product: 'Medical consultation + Fulani Hair Gro'
        });
      }
    }

    // PRIORITY 3: Habits
    if (includesAny(bonnetUse ?? '', [/wig-on|no-cotton/i])) {
      plan.push({
        priority: 'MEDIUM',
        title: 'Night-Time Protection',
        action: includesAny(bonnetUse ?? '', [/wig-on/i])
          ? 'Never sleep with a wig on. Switch to silk/satin bonnet or pillowcase immediately.'
          : 'Replace cotton pillowcases with silk/satin to minimize friction and breakage.',
        product: 'Silk bonnet + satin pillowcase'
      });
    }
    if ((coveredHairIssues ?? '') !== 'no-issues' && coveredHairIssues) {
      plan.push({
        priority: 'MEDIUM',
        title: 'Scalp Breathing Time',
        action: 'Give your scalp daily breaks. Remove wigs/scarves 2‑3 hours to reduce irritation and improve airflow.',
        product: 'Low-manipulation natural styles'
      });
    }

    // PRIORITY 4: Wash frequency
    if (includesAny(washFrequency ?? '', [/less-than-monthly|only-takedown/i])) {
      plan.push({
        priority: 'MEDIUM',
        title: 'Scalp Cleansing Routine',
        action: 'Wash at least every 2 weeks. Clean scalp prevents clogging and supports growth. Use sulfate-free shampoo.',
        product: 'Gentle sulfate-free shampoo'
      });
    }

    // PRIORITY 5: Timeline expectations
    const timeline = includesAny(whenNoticed ?? '', [/less than 3|^3-6/i])
      ? '2‑3 months of consistent use'
      : includesAny(whenNoticed ?? '', [/6-12/i])
      ? '3‑4 months of consistent use'
      : '4‑6 months of consistent use (longer-term issues take longer to reverse)';
    plan.push({
      priority: 'INFO',
      title: 'Expected Results Timeline',
      action: `Based on how long you've had this issue (${whenNoticed ?? 'recently'}), expect visible results in ${timeline}.`,
      product: 'Consistency is key'
    });

    return plan;
  };

  const treatmentPlan = useMemo(() => getTreatmentPlan(), [diagnosis, scalpIssues, protectiveStyles, lifeEvents, bonnetUse, coveredHairIssues, washFrequency, whenNoticed]);

  // Save Results form handler
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailVal = formData.get('email');
    const phoneVal = formData.get('phone');
    try {
      // TODO: Connect to your backend endpoint
      // eslint-disable-next-line no-console
      console.log('Saving results:', { email: emailVal, phone: phoneVal, diagnosis: diagnosis.primary, bundle: productRecommendation.bundle });
      alert('✅ Results sent! Check your email.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error saving results:', err);
      alert('❌ Error sending results. Please try again.');
    }
  };

  // On first mount, save quiz result to backend (non-blocking)
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const recommendationText = getPersonalizedRecommendation();
    (async () => {
      const res = await saveQuizResult({ answers: responses, recommendation: { text: recommendationText }, name, email, phone, state: stateResidence });
      if (res.ok) {
        toast({ title: 'Results saved', description: 'Your quiz results were saved successfully.' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Saved without persistence',
          description: 'Backend could not persist the result. You can continue browsing.',
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveContact() {
    const recommendationText = getPersonalizedRecommendation();
    const res = await saveQuizResult({ answers: responses, recommendation: { text: recommendationText }, name, email, phone, state: stateResidence });
    if (res.ok) {
      toast({ title: 'Details saved', description: 'Your contact details were saved with your results.' });
    } else {
      toast({ variant: 'destructive', title: 'Could not save details', description: 'Please try again.' });
    }
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonialData = testimonials[currentTestimonial];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-blue-50 pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Qualified banner + Consultation complete + Hero title + Doctor card (from landing.html) */}
        <section aria-labelledby="hero-title" className="space-y-6">
          {/* Qualified banner */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white px-4 py-3 rounded-2xl shadow-xl border-4 border-green-400">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1" aria-hidden="true">
                <span className="text-xl animate-bounce">✨</span>
                <p className="text-xs font-extrabold uppercase tracking-wide">You Qualified for This Week's Batch</p>
                <span className="text-xl animate-bounce">✨</span>
              </div>
              <p className="text-xs opacity-90">You're seeing this because your hair pattern matches our grandmother's original formula</p>
            </div>
          </div>

          {/* Consultation complete pill */}
          <div className="inline-flex items-center bg-green-100 text-green-900 px-4 py-2 rounded-full text-sm font-semibold">
            <span className="mr-2">✅</span>
            CONSULTATION COMPLETE
          </div>

          {/* Hero title */}
          <h2 id="hero-title" className="text-3xl md:text-5xl font-extrabold leading-tight">Your Personalized Hair Regrowth Plan is Ready</h2>

          {/* Doctor card */}
          <article className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-6 shadow-lg" aria-labelledby="doctor-name">
            <div className="flex items-start space-x-4">
              <img
                src="/doctor-amina.jpg"
                alt="Dr. Amina Hassan, Hair Care Specialist"
                className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-4 border-white shadow-lg bg-amber-200"
                onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = 'placeholder.svg'; }}
              />
              <div className="flex-1">
                <p id="doctor-name" className="text-xl font-extrabold">Dr. Amina Hassan</p>
                <p className="text-sm text-gray-600 mb-2">Hair Care Specialist & Product Developer</p>
                <p className="text-sm text-gray-700">I've reviewed your answers and prepared your personalized plan below.</p>
              </div>
            </div>
          </article>

          {/* Social proof pill (top) */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="sp-avatar w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-lg">👩🏾</div>
                ))}
              </div>
              <div className="text-right">
                <p className="font-extrabold text-lg"><span id="social-count">746</span>+ Nigerian Women</p>
                <p className="text-xs opacity-90">ordered in last 24hrs</p>
              </div>
            </div>
          </div>

          {/* Answers Reveal (UX-focused) */}
          <section id="answers-reveal" className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 shadow-lg border-2 border-purple-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-4xl mr-3">🔍</span>
              What Your Answers Reveal
            </h3>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Based on your responses, you're experiencing the same challenges that
              <strong className="text-purple-700"> 78% of our most successful customers</strong> had
              before using grandmother's formula.
            </p>
            <div className="bg-white rounded-xl p-6 mb-4 border-2 border-purple-100">
              <p className="text-sm font-bold text-purple-700 mb-4 uppercase">Women with Your Pattern Typically Focus On:</p>
              <ul className="space-y-3">
                <li className="flex items-start text-base text-gray-700"><span className="text-purple-600 font-bold mr-3 text-xl">•</span><span>Improving scalp comfort and healthy circulation</span></li>
                <li className="flex items-start text-base text-gray-700"><span className="text-purple-600 font-bold mr-3 text-xl">•</span><span>Balancing moisture and reducing strand breakage</span></li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-5 border-2 border-green-300">
              <p className="text-base text-gray-800 leading-relaxed"><span className="text-2xl mr-2">✅</span><strong className="text-green-900">The good news:</strong> Women with your exact pattern are our best success stories — 94% report visible improvement by Month 3 with consistent use.*</p>
              <p className="text-xs text-gray-600 mt-2">*Based on user surveys. Individual results may vary.</p>
            </div>
          </section>

          {/* Without Using Grandmother's Formula */}
          <section className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-red-200">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">⚠️</span>Without Using My Fulani Grandmother's Formula</h3>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">When follicles remain blocked and scalp issues aren't addressed, here's what typically happens over time:</p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><span className="text-base font-extrabold text-red-700">3M</span></div>
                <div className="flex-1"><p className="text-sm font-extrabold text-gray-900 mb-1">Within 3 months</p><p className="text-sm text-gray-700"><strong className="text-red-700">Increased thinning.</strong> Part line widens. More scalp becomes visible when styling.</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0"><span className="text-base font-extrabold text-red-700">6M</span></div>
                <div className="flex-1"><p className="text-sm font-extrabold text-gray-900 mb-1">6 months</p><p className="text-sm text-gray-700"><strong className="text-red-700">Weaker strands and slower regrowth.</strong> Hair breaks more easily. Growth cycle continues to slow.</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-red-300 flex items-center justify-center flex-shrink-0"><span className="text-base font-extrabold text-red-700">12M+</span></div>
                <div className="flex-1"><p className="text-sm font-extrabold text-gray-900 mb-1">12 months+</p><p className="text-sm text-gray-700"><strong className="text-red-700">Harder-to-reverse areas without targeted care.</strong> Recovery may take longer from this baseline.</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 mt-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-700 italic"><strong className="text-red-700">Note:</strong> Hair cycle delays can compound over time — consistent care may help prevent these outcomes.*</p>
              <p className="text-xs text-gray-500 mt-2">*Individual results may vary. Not intended to diagnose or treat any medical condition.</p>
            </div>
          </section>

          {/* Using Grandmother's Formula */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-green-200">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">✅</span>Using My Fulani Grandmother's Formula</h3>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">When you use our 3-step system consistently as grandmother taught, here's what many women experience:</p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><span className="text-xs font-extrabold text-green-700">2–3W</span></div>
                <div className="flex-1"><p className="text-sm font-extrabold text-gray-900 mb-1">Weeks 2–3</p><p className="text-sm text-gray-700"><strong className="text-green-700">Calmer scalp & reduced breakage.</strong> Less shedding. Itching subsides. First signs things are working.</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0"><span className="text-xs font-extrabold text-green-700">6–8W</span></div>
                <div className="flex-1"><p className="text-sm font-extrabold text-gray-900 mb-1">Weeks 6–8</p><p className="text-sm text-gray-700"><strong className="text-green-700">Baby hairs and density improvements.</strong> New growth visible at hairline and part. Strands feel stronger.</p></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-green-300 flex items-center justify-center flex-shrink-0"><span className="text-xs font-extrabold text-green-700">3–6M</span></div>
                <div className="flex-1"><p className="text-sm font-extrabold text-gray-900 mb-1">Months 3–6</p><p className="text-sm text-gray-700"><strong className="text-green-700">Visible filling in where thinning began.</strong> Part looks narrower. Ponytails fuller. Confidence restored.</p></div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-5 mt-6">
              <p className="text-sm font-extrabold text-center mb-2">94% of consistent users report visible improvement by Month 3.*</p>
              <p className="text-xs text-center opacity-90">*Based on user surveys (n=847). Individual results may vary.</p>
            </div>
          </section>

          {/* Reality Check */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 md:p-8 shadow-2xl border-2 border-gray-700">
            <div className="text-center mb-6">
              <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full font-extrabold text-xs mb-3">⚠️ REALITY CHECK</div>
              <h3 className="text-2xl font-extrabold">What Happens If You "Think About It"</h3>
              <p className="text-gray-300 text-xs">We’ve seen this pattern with 1,000+ women who delayed</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-red-500"><p className="font-extrabold text-red-400 mb-1">Days 1–3: "I'll decide tomorrow"</p><p className="text-gray-300">Life gets busy. You forget the details. Stock sells out.</p></div>
              <div className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-orange-500"><p className="font-extrabold text-orange-300 mb-1">Week 2: "I should have ordered"</p><p className="text-gray-300">Your part line is wider. Next batch is days away.</p></div>
              <div className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-yellow-500"><p className="font-extrabold text-yellow-300 mb-1">Month 2: "She started after me"</p><p className="text-gray-300">Friends show baby hairs already. You’re 2 months behind.</p></div>
              <div className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-red-600"><p className="font-extrabold text-red-300 mb-1">Month 6: "I wish I hadn't waited"</p><p className="text-gray-300">Baseline worse. Money spent on random products. Starting over.</p></div>
            </div>
            <div className="mt-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-5 text-center">
              <p className="font-extrabold mb-1">The Women Who Start TODAY Are Months Ahead of "Tomorrow You"</p>
              <p className="text-sm text-white/90">Every week you delay, recovery takes longer.</p>
            </div>
          </section>

          {/* Hair Growth Roadmap */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl md:text-2xl font-extrabold mb-3">📅 Your Hair Growth Roadmap</h3>
            <div className="pl-4 border-l-4 border-blue-300 space-y-4">
              <div>
                <div className="w-3 h-3 rounded-full bg-blue-500 -ml-[9px] mb-1"></div>
                <p className="font-extrabold">Weeks 1–2</p>
                <p className="text-gray-700">Scalp reset and follicle stimulation begin.</p>
              </div>
              <div>
                <div className="w-3 h-3 rounded-full bg-blue-500 -ml-[9px] mb-1"></div>
                <p className="font-extrabold">Weeks 3–6</p>
                <p className="text-gray-700">Growth cycle activation and reduced shedding.</p>
              </div>
              <div>
                <div className="w-3 h-3 rounded-full bg-green-600 -ml-[9px] mb-1"></div>
                <p className="font-extrabold">Weeks 7–12</p>
                <p className="text-gray-700">Thickness and fullness return with consistency.</p>
              </div>
            </div>
          </section>

          {/* One Success Story */}
          <section className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl md:text-2xl font-extrabold mb-3">💬 Meet Women Who Started Where You Are</h3>
            <article className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-3"><div className="text-2xl">👩🏾</div><div><p className="font-extrabold">Funmi A., Abuja • Mother of 2</p><p className="text-xs text-gray-600">Verified Purchase</p></div></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="font-extrabold text-red-700 mb-1">BEFORE</p><p className="text-gray-700">Postpartum hair loss, thin crown, low confidence.</p></div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="font-extrabold text-green-700 mb-1">AFTER</p><p className="text-gray-700">Full crown regrowth, edges filled, thriving.</p></div>
              </div>
              <blockquote className="mt-3 bg-white border-l-4 border-amber-500 p-3 rounded-r-lg text-gray-800">“I saw baby hairs by Week 6 and my crown filled in by Month 3. I wish I started sooner.” <span className="text-amber-600 font-extrabold">★★★★★</span></blockquote>
            </article>
          </section>
        </section>

        {/* 2) Quick Diagnosis Summary */}
        <section className="diagnosis-product-grid">
          <div className="container-wide">
            <div className="two-column-layout">
              <div className="diagnosis-column">
                <div className="sticky-wrapper">
        <section className="diagnosis-summary">
          <div className="container">
            <div className="summary-card">
              <div className="summary-header">
                <h2>Your Primary Finding</h2>
              </div>
              <div className="diagnosis-quick">
                <div className="diagnosis-badge-wrapper">
                  <span className="diagnosis-badge primary-badge">{diagnosis.primary}</span>
                  <span className="confidence-badge">{Math.round(((diagnosis.confidence as any)[diagnosis.primary.toLowerCase().split(' ')[0]] || 0) * 100)}% Match</span>
                </div>
                <p className="diagnosis-brief">
                  {diagnosis.primary === 'Traction Alopecia' && 'Hair loss from repeated tension on follicles from tight styles.'}
                  {diagnosis.primary === 'Telogen Effluvium' && 'Temporary shedding triggered by stress or hormonal changes.'}
                  {diagnosis.primary === 'Androgenic Alopecia' && 'Genetic hair loss pattern sensitive to DHT hormone.'}
                  {diagnosis.primary === 'Cicatricial (Scarring) Alopecia' && 'Permanent hair loss from follicle inflammation. Needs urgent care.'}
                  {diagnosis.primary === 'Alopecia Areata' && 'Autoimmune condition causing patchy hair loss.'}
                  {diagnosis.primary === 'Nutritional Deficiency-Related Hair Loss' && 'Hair loss from insufficient vitamins and minerals.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3) PRODUCT RECOMMENDATION - at eye level */}
                </div>
              </div>
              <div className="product-column">
        <section className="product-recommendation-section priority">
          <h2>Your Recommended Treatment</h2>
          <p className="section-subtitle">Based on your diagnosis, here's exactly what you need to restore your hair</p>

          <div className="severity-indicator-bar">
            <span className={`severity-level severity-${productRecommendation.severityScore >= 8 ? 'high' : productRecommendation.severityScore >= 5 ? 'medium' : 'low'}`}>
              {productRecommendation.severityScore >= 8 ? '🔴 Intensive Care Needed' : productRecommendation.severityScore >= 5 ? '🟡 Moderate Treatment Required' : '🟢 Starter Protocol Recommended'}
            </span>
          </div>

          {productRecommendation.bundle === 'SELF LOVE PLUS B2GOF' ? (
            /* SELF LOVE PLUS B2GOF - High-emphasis product card */
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-400 relative overflow-hidden">
              {/* MOST POPULAR Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-red-500 text-white px-8 py-3 rounded-full text-sm font-bold shadow-2xl animate-pulse">⭐ MOST POPULAR</div>
              </div>

              {/* BUY 2 GET 1 FREE Banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl px-6 py-4 mb-6 mt-8 shadow-xl border-2 border-green-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-3xl animate-bounce">🎁</span>
                    <p className="text-2xl font-bold">Buy 2, Get 1 FREE</p>
                    <span className="text-3xl animate-bounce delay-100">🎁</span>
                  </div>
                  <p className="text-sm font-semibold">On EVERY item — Shampoo, Pomade & Conditioner!</p>
                </div>
              </div>

              {/* Product Title */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">SELF LOVE PLUS B2GOF</h3>
                <p className="text-base text-gray-600 font-semibold">3-Month Intensive Care Supply</p>
              </div>

              {/* Product Visualization */}
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 mb-6 border-2 border-amber-200">
                {/* 3 Shampoo bottles */}
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map((i) => (
                      <div key={`s-${i}`} className="relative">
                        <div className="w-full h-24 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-3xl shadow-lg"></div>
                        {i === 3 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">FREE!</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm font-bold text-gray-700 mt-2">3 Shampoos <span className="text-green-600">(+1 FREE)</span></p>
                </div>

                {/* 3 Pomade jars */}
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map((i) => (
                      <div key={`p-${i}`} className="relative">
                        <div className="w-full h-20 bg-gradient-to-b from-orange-600 to-orange-700 rounded-full shadow-lg"></div>
                        {i === 3 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">FREE!</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm font-bold text-gray-700 mt-2">3 Pomades <span className="text-green-600">(+1 FREE)</span></p>
                </div>

                {/* 3 Conditioner bottles */}
                <div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map((i) => (
                      <div key={`c-${i}`} className="relative">
                        <div className="w-full h-24 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-3xl shadow-lg"></div>
                        {i === 3 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">FREE!</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm font-bold text-gray-700 mt-2">3 Conditioners <span className="text-green-600">(+1 FREE)</span></p>
                </div>
              </div>

              {/* What's Included - DETAILED BREAKDOWN */}
              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-amber-200">
                <p className="text-sm font-bold text-gray-900 mb-4 flex items-center"><span className="text-green-600 text-xl mr-2">✓</span>What's Included:</p>
                {/* You Pay For */}
                <div className="mb-4 pb-4 border-b-2 border-gray-200">
                  <p className="text-xs font-bold text-red-600 mb-3 uppercase">💳 You Pay For:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center"><span className="text-red-600 font-bold mr-2">2×</span><span>Fulani Hair Gro Shampoo (500ml)</span></li>
                    <li className="flex items-center"><span className="text-red-600 font-bold mr-2">2×</span><span>Fulani Hair Gro Pomade (150g)</span></li>
                    <li className="flex items-center"><span className="text-red-600 font-bold mr-2">2×</span><span>Fulani Hair Gro Conditioner (500ml)</span></li>
                  </ul>
                </div>
                {/* But You Get */}
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-xs font-bold text-green-700 mb-3 uppercase flex items-center"><span className="text-lg mr-1">🎉</span>But You Actually Get:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center justify-between"><span><span className="text-green-600 font-bold mr-2">3×</span>Shampoo (500ml)</span><span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">+1 FREE</span></li>
                    <li className="flex items-center justify-between"><span><span className="text-green-600 font-bold mr-2">3×</span>Pomade (150g)</span><span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">+1 FREE</span></li>
                    <li className="flex items-center justify-between"><span><span className="text-green-600 font-bold mr-2">3×</span>Conditioner (500ml)</span><span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">+1 FREE</span></li>
                  </ul>
                </div>
              </div>

              {/* Usage Essentials */}
              <div className="bg-blue-50 rounded-xl p-5 mb-6 border-2 border-blue-200">
                <p className="text-xs font-bold text-gray-900 mb-3 flex items-center"><span className="text-blue-600 text-lg mr-2">📖</span>Usage Essentials</p>
                <div className="space-y-2 text-xs text-gray-700">
                  <div><p className="font-semibold">Shampoo: Every 2 weeks</p><p className="text-gray-600">Cleanses scalp, prepares for care</p></div>
                  <div><p className="font-semibold">Pomade: 1–2× daily</p><p className="text-gray-600">Apply to scalp, supports DHT management</p></div>
                  <div><p className="font-semibold text-purple-700">Conditioner: Required for best results</p><p className="text-gray-600">Strengthens strands, locks moisture</p></div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Regular Price</p>
                  <p className="text-2xl line-through text-gray-500 mb-1">₦225,000</p>
                  <p className="text-sm font-bold text-green-700 mb-4">SAVE ₦158,250 (70% OFF!)</p>
                  <div className="my-4"><p className="text-6xl font-bold text-gray-900">₦{price}</p></div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-gray-700 mb-1">Just <span className="font-bold text-green-700">₦22,250/month</span></p>
                    <p className="text-sm font-semibold text-green-700">🌯 Only ₦741/day (less than a shawarma!)</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-5 px-6 rounded-xl shadow-2xl hover:shadow-3xl transition transform hover:scale-105 mb-4" onClick={handleReserveClick}>
                <span className="text-xl">Select B2GOF Plan — ₦{price}</span>
                <p className="text-sm font-normal mt-1">Get 3 of each item, pay for 2</p>
              </button>

              {/* Payment options */}
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Safe Payment Options:</p>
                <div className="flex items-center justify-center space-x-3 text-xs">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">💳 Bank Transfer</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">📱 Pay on Delivery</span>
                </div>
              </div>

              {/* Bottom Guarantee */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">🔒 90-Day Money-Back Guarantee • 🚚 24-48hr Lagos Delivery</p>
              </div>
            </div>
          ) : (
            /* Non-B2GOF: keep previous lightweight card */
            <div className="recommended-bundle-card">
              <div className="recommended-ribbon">✨ Recommended for You</div>
              <h3 className="bundle-name">{productRecommendation.bundle}</h3>
              <p className="bundle-tagline">{productRecommendation.months}-Month Treatment Supply</p>
              <div className="bundle-contents">
                <div className="product-row"><span className="qty-badge">1×</span><span className="product-name">Fulani Hair Gro Shampoo (500ml)</span></div>
                <div className="product-row"><span className="qty-badge">1×</span><span className="product-name">Fulani Hair Gro Pomade (150g)</span></div>
                <div className="product-row"><span className="qty-badge">1×</span><span className="product-name">Fulani Hair Gro Conditioner (500ml)</span></div>
              </div>
              <div className="pricing-box">
                <div className="price-main"><span className="currency">₦</span><span className="amount">{price}</span></div>
                <p className="per-month">₦32,750/month</p>
              </div>
              <button className="add-to-cart-primary" onClick={handleReserveClick}>Reserve {productRecommendation.bundle} - Pay ₦{price} on Delivery</button>
              <p className="cta-subtext">✓ No payment now • ✓ Delivery in 3-5 days • ✓ Inspect before paying</p>
            </div>
          )}

          {/* Trust badges directly after recommendation */}
          <div className="trust-badges-bar">
            <div className="trust-badge-item"><span className="trust-icon">🚚</span><div className="trust-content"><strong>Nationwide Delivery</strong><p>3-5 working days</p></div></div>
            <div className="trust-badge-item"><span className="trust-icon">💳</span><div className="trust-content"><strong>Pay on Delivery</strong><p>Pay when you receive it</p></div></div>
            <div className="trust-badge-item"><span className="trust-icon">✅</span><div className="trust-content"><strong>400+ Years Proven</strong><p>Fulani tribal heritage</p></div></div>
            <div className="trust-badge-item"><span className="trust-icon">🔬</span><div className="trust-content"><strong>Scientifically Backed</strong><p>Trichology research</p></div></div>
          </div>
        </section>

        {/* 4) Save Results (moved below recommendation) */}
              </div>
            </div>
          </div>
        </section>
        <div className="save-results-section">
          <div className="save-results-card">
            <h3>📧 Get Your Analysis Sent to Your Email</h3>
            <p className="save-subtitle">Save your personalized diagnosis and treatment plan. We'll send you reminders to stay consistent with your routine.</p>
            <form className="save-results-form" onSubmit={handleEmailSubmit}>
              <input type="email" name="email" placeholder="Enter your email address" className="email-input" required />
              <input type="tel" name="phone" placeholder="WhatsApp number (optional)" className="phone-input" />
              <button type="submit" className="save-results-btn">Send My Results</button>
            </form>
            <p className="privacy-note">🔒 We respect your privacy. No spam, just your hair growth journey.</p>
          </div>
        </div>

        

        {/* 5) Full Diagnosis Details */}
        <section className="diagnosis-section">
          <h2>Your Diagnosis</h2>
          <div className="primary-diagnosis-card">
            <div className="diagnosis-header">
              <span className="diagnosis-badge primary-badge">Primary Diagnosis</span>
              <span className="confidence-badge">{Math.round(((diagnosis.confidence as any)[diagnosis.primary.toLowerCase().split(' ')[0]] || 0) * 100)}% Match</span>
            </div>
            <h3 className="diagnosis-name">{diagnosis.primary}</h3>
            <div className="diagnosis-explanation">
              {diagnosis.primary === 'Traction Alopecia' && (
                <p>Hair loss caused by repeated tension and pulling on the hair follicles, commonly from tight hairstyles like braids, weaves, and ponytails.</p>
              )}
              {diagnosis.primary === 'Telogen Effluvium' && (
                <p>Temporary hair shedding triggered by stress, hormonal changes, or physical trauma. Hair follicles enter a resting phase prematurely.</p>
              )}
              {diagnosis.primary === 'Androgenic Alopecia' && (
                <p>Genetic and hormonal hair loss pattern where hair follicles become sensitive to DHT (dihydrotestosterone), causing gradual thinning.</p>
              )}
              {diagnosis.primary === 'Cicatricial (Scarring) Alopecia' && (
                <p>Permanent hair loss caused by inflammation that destroys hair follicles and replaces them with scar tissue. Requires urgent medical attention.</p>
              )}
              {diagnosis.primary === 'Alopecia Areata' && (
                <p>Autoimmune condition where the immune system mistakenly attacks hair follicles, causing patchy hair loss.</p>
              )}
              {diagnosis.primary === 'Nutritional Deficiency-Related Hair Loss' && (
                <p>Hair loss caused by insufficient vitamins, minerals, or protein needed for healthy hair growth.</p>
              )}
            </div>
          </div>
          {diagnosis.secondary.length > 0 && (
            <div className="secondary-diagnoses">
              <h4>Also Detected:</h4>
              <div className="secondary-list">
                {diagnosis.secondary.map((condition, index) => (
                  <div key={index} className="secondary-item">
                    <span className="diagnosis-badge secondary-badge">Secondary</span>
                    <span className="condition-name">{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 6) Treatment Plan */}
        <section className="treatment-plan-section">
          <h2>Your Personalized Treatment Plan</h2>
          <p className="plan-intro">Follow these steps in order for the best results:</p>
          {/* Optional: mobile collapse */}
          <div className="treatment-steps">
            {treatmentPlan
              .slice(0, showAllSteps ? treatmentPlan.length : 3)
              .map((step, index) => (
              <div key={index} className={`treatment-step priority-${step.priority.toLowerCase()}`}>
                <div className="step-header">
                  <span className="step-number">{index + 1}</span>
                  <span className={`priority-badge priority-${step.priority.toLowerCase()}`}>{step.priority}</span>
                </div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-action">{step.action}</p>
                <div className="step-product"><strong>Recommended:</strong> {step.product}</div>
              </div>
            ))}
          </div>
          {!showAllSteps && treatmentPlan.length > 3 && (
            <button className="show-more-btn" onClick={() => setShowAllSteps(true)}>
              Show {treatmentPlan.length - 3} More Steps
            </button>
          )}
        </section>

        {/* Trust Badges */}
        <div className="trust-badges-bar">
          <div className="trust-badge-item"><span className="trust-icon">🚚</span><div className="trust-content"><strong>Nationwide Delivery</strong><p>3-5 working days</p></div></div>
          <div className="trust-badge-item"><span className="trust-icon">💳</span><div className="trust-content"><strong>Pay on Delivery</strong><p>Pay when you receive it</p></div></div>
          <div className="trust-badge-item"><span className="trust-icon">✅</span><div className="trust-content"><strong>400+ Years Proven</strong><p>Fulani tribal heritage</p></div></div>
          <div className="trust-badge-item"><span className="trust-icon">🔬</span><div className="trust-content"><strong>Scientifically Backed</strong><p>Trichology research</p></div></div>
        </div>

        {/* Product Recommendation Section */}
        <section className="product-recommendation-section">
          <h2>Your Recommended Products</h2>

          <div className="severity-indicator-bar">
            <span className={`severity-level severity-${productRecommendation.severityScore >= 8 ? 'high' : productRecommendation.severityScore >= 5 ? 'medium' : 'low'}`}>
              {productRecommendation.severityScore >= 8 ? '🔴 Intensive Care Needed' : productRecommendation.severityScore >= 5 ? '🟡 Moderate Treatment Required' : '🟢 Starter Protocol Recommended'}
            </span>
          </div>

          <div className="recommended-bundle-card">
            <div className="recommended-ribbon">✨ Recommended for You</div>
            <h3 className="bundle-name">{productRecommendation.bundle}</h3>
            <p className="bundle-tagline">{productRecommendation.months}-Month Treatment Supply</p>

            <div className="bundle-contents">
              {productRecommendation.bundle === 'SELF LOVE PLUS B2GOF' ? (
                <>
                  <div className="product-row"><span className="qty-badge">3×</span><span className="product-name">Fulani Hair Gro Shampoo (500ml)</span></div>
                  <div className="product-row"><span className="qty-badge">3×</span><span className="product-name">Fulani Hair Gro Pomade (150g)</span></div>
                  <div className="product-row"><span className="qty-badge">3×</span><span className="product-name">Fulani Hair Gro Conditioner (500ml)</span></div>
                </>
              ) : (
                <>
                  <div className="product-row"><span className="qty-badge">1×</span><span className="product-name">Fulani Hair Gro Shampoo (500ml)</span></div>
                  <div className="product-row"><span className="qty-badge">1×</span><span className="product-name">Fulani Hair Gro Pomade (150g)</span></div>
                  <div className="product-row"><span className="qty-badge">1×</span><span className="product-name">Fulani Hair Gro Conditioner (500ml)</span></div>
                </>
              )}
            </div>

            {/* Urgency Box */}
            <div className="urgency-box">
              <div className="urgency-header"><span className="urgency-icon">⚡</span><strong>Limited Stock Alert</strong></div>
              <p className="urgency-text">Only <span className="stock-count">23 sets</span> of {productRecommendation.bundle} left in stock for Lagos delivery this week. <strong>Reserve yours now before they're gone.</strong></p>
              <div className="social-proof-banner bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl px-4 py-3 shadow-md mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-600 shadow"><span className="text-xl">👩🏾</span></div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-600 shadow"><span className="text-xl">👩🏾</span></div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-600 shadow"><span className="text-xl">👩🏾</span></div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-600 shadow"><span className="text-xl">👩🏾</span></div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-600 shadow"><span className="text-xl">👩🏾</span></div>
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-green-600 shadow"><span className="font-extrabold text-green-900 text-[10px]">10K+</span></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-lg font-extrabold leading-tight">Join 10,000+ Nigerian Women</p>
                    <p className="text-xs text-green-100">Who've transformed their hair with grandmother's formula — <span className="font-extrabold text-yellow-300">12 joined in the last 24 hours</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pricing-box">
              <div className="price-main"><span className="currency">₦</span><span className="amount">{price}</span></div>
              {productRecommendation.bundle === 'SELF LOVE PLUS B2GOF' ? (
                <>
                  <p className="per-month">₦22,250/month (32% savings vs monthly)</p>
                  <p className="savings-note">SAVE ₦31,500 vs buying monthly</p>
                </>
              ) : (
                <p className="per-month">₦32,750/month</p>
              )}
            </div>

            <div className="reasoning-box"><h5>Why this bundle is perfect for you:</h5><p>{productRecommendation.reasoning}</p></div>

            <div className="usage-guide">
              <h5>How to Use Your Products:</h5>
              {productRecommendation.usage.shampoo && (
                <div className="usage-row"><span className="usage-icon">🧴</span><div className="usage-content"><strong>Shampoo:</strong> {productRecommendation.usage.shampoo}</div></div>
              )}
              <div className="usage-row"><span className="usage-icon">💆🏾‍♀️</span><div className="usage-content"><strong>Pomade:</strong> {productRecommendation.usage.pomade}</div></div>
              {productRecommendation.usage.conditioner && (
                <div className="usage-row"><span className="usage-icon">✨</span><div className="usage-content"><strong>Conditioner:</strong> {productRecommendation.usage.conditioner}</div></div>
              )}
            </div>

            <button className="add-to-cart-primary" onClick={handleReserveClick}>Reserve {productRecommendation.bundle} - Pay ₦{price} on Delivery</button>
            <p className="cta-subtext">✓ No payment now • ✓ Delivery in 3-5 days • ✓ Inspect before paying</p>

            {/* Guarantee */}
            <div className="guarantee-box">
              <div className="guarantee-badge"><span className="guarantee-icon">🛡️</span><strong>Our Promise to You</strong></div>
              <div className="guarantee-content">
                <h5>You're 100% Protected</h5>
                <ul className="guarantee-list">
                  <li>✓ Pay ONLY when you receive your package</li>
                  <li>✓ Inspect products before paying delivery agent</li>
                  <li>✓ Sealed, authentic products or refuse delivery FREE</li>
                  <li>✓ Track your order in real-time</li>
                  <li>✓ Direct WhatsApp support: <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I just completed the hair analysis quiz')}`} target="_blank" rel="noopener noreferrer" className="whatsapp-link">+234-XXX-XXX-XXXX</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Alternative & upsell */}
          <div className="alternative-bundles-section" id="comparison-matrix">
            <h4>Other Options Available:</h4>
            <div className="alternatives-grid">
              {productRecommendation.bundle !== 'SELF LOVE PLUS' && (
                <div className="alt-card"><h6>SELF LOVE PLUS</h6><p className="alt-desc">1-month starter kit</p><p className="alt-price">₦32,750</p><button className="alt-view-btn">View Details</button></div>
              )}
              {productRecommendation.bundle === 'SELF LOVE PLUS B2GOF' && (
                <div className="alt-card family-card"><div className="family-tag">👨‍👩‍👧‍👦 Best Value</div><h6>FAMILY SAVES</h6><p className="alt-desc">10-month supply (Buy 6 sets, Get 4 FREE)</p><p className="alt-price">₦215,750</p><p className="alt-note">Just ₦21,575/month • Great for families or multiple areas</p><button className="alt-view-btn" onClick={handleUpsellClick}>Learn More</button></div>
              )}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="social-proof-section">
          <h2>Why Women Trust Fulani Hair Gro</h2>
          <p className="social-proof-intro">Over 10,000 Nigerian women have transformed their hair with our proven formula</p>
          <div className="testimonials-grid">
            <div className="testimonial-card"><div className="testimonial-header"><img src="/avatar-1.jpg" alt="Customer" className="testimonial-avatar" /><div><strong>Chioma O.</strong><p className="location">Lagos • Verified Buyer</p></div><span className="verified-badge">✓ Verified</span></div><div className="star-rating">⭐⭐⭐⭐⭐</div><p className="testimonial-text">"My edges were GONE from years of frontal wigs. After 3 months of Fulani Hair Gro, I have baby hairs! I was skeptical about pay-on-delivery but I'm so glad I tried it."</p><div className="before-after-tag">Before & After Photos in Email</div></div>
            <div className="testimonial-card"><div className="testimonial-header"><img src="/avatar-2.jpg" alt="Customer" className="testimonial-avatar" /><div><strong>Funmi A.</strong><p className="location">Abuja • Verified Buyer</p></div><span className="verified-badge">✓ Verified</span></div><div className="star-rating">⭐⭐⭐⭐⭐</div><p className="testimonial-text">"Postpartum hair loss had me crying. This actually WORKED. My hair is thicker now than before pregnancy. Worth every naira."</p></div>
            <div className="testimonial-card"><div className="testimonial-header"><img src="/avatar-3.jpg" alt="Customer" className="testimonial-avatar" /><div><strong>Amaka N.</strong><p className="location">Port Harcourt • Verified Buyer</p></div><span className="verified-badge">✓ Verified</span></div><div className="star-rating">⭐⭐⭐⭐⭐</div><p className="testimonial-text">"I ordered with pay-on-delivery expecting to reject it. But when I saw the quality packaging and tried it for 2 weeks, I ordered 3 more sets!"</p></div>
          </div>
          <div className="trust-stats">
            <div className="stat-item"><span className="stat-number">10,000+</span><span className="stat-label">Happy Customers</span></div>
            <div className="stat-item"><span className="stat-number">4.8/5</span><span className="stat-label">Average Rating</span></div>
            <div className="stat-item"><span className="stat-number">94%</span><span className="stat-label">See Results</span></div>
            <div className="stat-item"><span className="stat-number">87%</span><span className="stat-label">Reorder Rate</span></div>
          </div>
        </section>

        {/* 9) FAQ */}
        <div className="quiz-card mb-8">
          <h3 className="text-xl font-bold text-brand-primary mb-6">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-[hsl(var(--wellness-border))] rounded-xl">
                <button
                  className="w-full p-4 text-left font-medium hover:bg-[hsl(var(--secondary))] transition-colors rounded-xl"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <span>{faq.question}</span>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact (keep) */}
        <div className="quiz-card text-center">
          <h3 className="text-xl font-bold text-brand-primary mb-4">
            CONTACT US
          </h3>
          <p className="text-muted-foreground mb-4">
            You can chat with us: <span className="text-[hsl(var(--brand-primary))] font-medium cursor-pointer">Open chat →</span>
          </p>
          <p className="text-muted-foreground">
            Or reach us via email at: <span className="text-[hsl(var(--brand-primary))] font-medium">contact@fulanihairgro.com</span>
          </p>
          
          <div className="mt-8 pt-6 border-t border-[hsl(var(--wellness-border))]">
            <Button 
              variant="outline" 
              onClick={onRestart}
              className="px-8"
            >
              Take Quiz Again
            </Button>
          </div>
        </div>
    {showOrderForm && (
      <OrderFormModal
        bundle={productRecommendation.bundle}
        price={numericPrice}
        diagnosis={diagnosis.primary}
        onClose={handleCloseModal}
      />
    )}

    {/* Family Saves Explainer Modal */}
    {showFamilyModal && (
      <div className="modal-overlay" onClick={handleCloseFamilySaves}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={handleCloseFamilySaves}>×</button>
          <div className="modal-header"><h2>💎 Family Saves Bundle - Who Is This For?</h2></div>
          <div className="modal-body">
            <div className="space-y-4">
              <div className="info-card blue"><h4>👨‍👩‍👧‍👦 Perfect for Families</h4><p>Mum + 2 daughters = 3.3 months each</p><p>Split cost: <strong>₦71,917</strong> per person!</p></div>
              <div className="info-card green"><h4>🤝 Share with Friends</h4><p>3 friends split = <strong>₦71,917</strong> each</p><p>Everyone saves <strong>₦37,083</strong>!</p></div>
              <div className="info-card purple"><h4>🔥 Extreme Hair Loss</h4><p>10 months of consistent treatment</p><p>Best results need 6–12 months</p></div>
              <div className="info-card yellow"><h4>🎁 What You Get FREE:</h4><p>4 Shampoos (₦52,400)</p><p>4 Pomades (₦52,400)</p><p>4 Conditioners (₦26,200)</p><p className="font-bold">Total FREE: ₦131,000!</p></div>
            </div>
          </div>
          <div className="modal-footer"><button className="alt-view-btn" onClick={handleCloseFamilySaves}>Close</button></div>
        </div>
      </div>
    )}
      </div>
    </div>
  );

};
