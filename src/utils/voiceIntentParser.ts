import { Opportunity, OpportunityCategory, OpportunityType, WorkMode, Language } from '../types';

export interface ParsedVoiceIntent {
  rawQuery: string;
  role?: string;
  category?: OpportunityCategory;
  categoryLabel?: string;
  skills: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  location?: string;
  workMode?: WorkMode;
  jobType?: OpportunityType | 'part_time';
  hasTraining?: boolean;
  noDegree?: boolean;
}

export interface MatchedOpportunityResult {
  opportunity: Opportunity;
  score: number;
  matchReasons: {
    en: string;
    hi: string;
  }[];
}

// Category keyword mappings for English and Hindi/Hinglish
const CATEGORY_MAP: Record<OpportunityCategory, { en: string; hi: string; keywords: string[] }> = {
  software_web: {
    en: 'Software & Web Development',
    hi: 'सॉफ्टवेयर और वेब डेवलपमेंट',
    keywords: [
      'web', 'website', 'software', 'developer', 'frontend', 'front-end', 'front end',
      'backend', 'back-end', 'fullstack', 'full-stack', 'full stack', 'react', 'javascript',
      'html', 'css', 'coding', 'programmer', 'वेब', 'सॉफ्टवेयर', 'डेवलपर', 'कोडिंग'
    ],
  },
  data_python: {
    en: 'Data Analytics & Python',
    hi: 'डेटा एनालिटिक्स और पायथन',
    keywords: [
      'python', 'data', 'analytics', 'analyst', 'sql', 'excel', 'pandas', 'statistics',
      'डेटा', 'पायथन', 'एनालिटिक्स', 'एनालिस्ट'
    ],
  },
  aiml_emerging: {
    en: 'AI/ML & Emerging Tech',
    hi: 'एआई/एमएल और आधुनिक तकनीक',
    keywords: [
      'ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning',
      'nlp', 'computer vision', 'prompt', 'llm', 'genai', 'एआई', 'मशीन लर्निंग'
    ],
  },
  electronics_robotics: {
    en: 'Electronics, Robotics & Hardware',
    hi: 'इलेक्ट्रॉनिक्स, रोबोटिक्स और हार्डवेयर',
    keywords: [
      'electronics', 'robotic', 'robotics', 'hardware', 'iot', 'circuit', 'embedded',
      'electrician', 'solar', 'wiring', 'electronic', 'इलेक्ट्रॉनिक्स', 'रोबोटिक्स', 'हार्डवेयर', 'सोलर'
    ],
  },
  design_creative: {
    en: 'Design & Creative Work',
    hi: 'डिज़ाइन और रचनात्मक कार्य',
    keywords: [
      'design', 'designer', 'ui', 'ux', 'graphic', 'figma', 'creative', 'illustration',
      'video editing', 'डिज़ाइन', 'ग्राफिक', 'रचनात्मक'
    ],
  },
  marketing_content: {
    en: 'Marketing & Content',
    hi: 'मार्केटिंग और सामग्री निर्माण',
    keywords: [
      'marketing', 'content', 'writer', 'writing', 'seo', 'social media', 'vernacular',
      'translation', 'अनुवाद', 'मार्केटिंग', 'कंटेंट', 'लेखन'
    ],
  },
  business_operations: {
    en: 'Business & Operations',
    hi: 'बिजनेस और ऑपरेशन्स',
    keywords: [
      'business', 'operation', 'operations', 'sales', 'coordinator', 'admin',
      'management', 'inventory', 'व्यापार', 'ऑपरेशन्स', 'प्रबंधन'
    ],
  },
  local_trades: {
    en: 'Local Jobs, Apprenticeships & Trades',
    hi: 'स्थानीय कार्य, शिक्षुता और कौशल कार्य',
    keywords: [
      'local', 'trade', 'trades', 'artisan', 'mechanic', 'repair', 'craft', 'technician',
      'iti', 'handicraft', 'स्थानीय', 'कारीगर', 'मैकेनिक', 'ट्रेड'
    ],
  },
};

// Skill keywords mapping
const SKILL_KEYWORDS: { skill: string; regex: RegExp }[] = [
  { skill: 'Python', regex: /\b(python|पायथन)\b/i },
  { skill: 'React', regex: /\b(react|reactjs|रिएक्ट)\b/i },
  { skill: 'Frontend', regex: /\b(frontend|front-end|front end|फ्रंटएंड)\b/i },
  { skill: 'Backend', regex: /\b(backend|back-end|बैकएंड)\b/i },
  { skill: 'JavaScript', regex: /\b(javascript|js|जावास्क्रिप्ट)\b/i },
  { skill: 'HTML & CSS', regex: /\b(html|css)\b/i },
  { skill: 'Data Analytics', regex: /\b(data analytics|data analyst|डेटा)\b/i },
  { skill: 'SQL', regex: /\b(sql|database)\b/i },
  { skill: 'Machine Learning', regex: /\b(machine learning|ml|मशीन लर्निंग)\b/i },
  { skill: 'AI', regex: /\b(ai|artificial intelligence|एआई)\b/i },
  { skill: 'Robotics', regex: /\b(robotics|robotic|रोबोटिक्स)\b/i },
  { skill: 'Electronics', regex: /\b(electronics|electronic|इलेक्ट्रॉनिक्स)\b/i },
  { skill: 'Solar Installation', regex: /\b(solar|rooftop solar|सोलर)\b/i },
  { skill: 'Content Writing', regex: /\b(content|writing|writer|अनुवाद|translation)\b/i },
  { skill: 'UI/UX Design', regex: /\b(ui\/ux|ui|ux|figma|डिज़ाइन)\b/i },
  { skill: 'Electric Vehicle', regex: /\b(electric vehicle|ev|two-wheeler)\b/i },
  { skill: 'Inventory Management', regex: /\b(inventory|इन्वेंटरी)\b/i },
];

// Major Indian cities and common terms
const KNOWN_LOCATIONS: { name: string; regex: RegExp }[] = [
  { name: 'Delhi', regex: /\b(delhi|new delhi|ncr|दिल्ली|नई दिल्ली)\b/i },
  { name: 'Indore', regex: /\b(indore|इंदौर)\b/i },
  { name: 'Pune', regex: /\b(pune|पुणे)\b/i },
  { name: 'Jaipur', regex: /\b(jaipur|जयपुर)\b/i },
  { name: 'Bengaluru', regex: /\b(bengaluru|bangalore|बैंगलोर|बेंगलुरु)\b/i },
  { name: 'Hyderabad', regex: /\b(hyderabad|हैदराबाद)\b/i },
  { name: 'Bhopal', regex: /\b(bhopal|भोपाल)\b/i },
  { name: 'Mumbai', regex: /\b(mumbai|बॉम्बे|मुंबई)\b/i },
  { name: 'Lucknow', regex: /\b(lucknow|लखनऊ)\b/i },
  { name: 'Coimbatore', regex: /\b(coimbatore|कोयंबटूर)\b/i },
  { name: 'Varanasi', regex: /\b(varanasi|बनारस|वाराणसी)\b/i },
];

/**
 * Parses natural spoken English, Hindi, or Hinglish query into structured search criteria.
 */
export function parseVoiceIntent(rawQuery: string): ParsedVoiceIntent {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  const intent: ParsedVoiceIntent = {
    rawQuery: query,
    skills: [],
  };

  // 1. Detect Work Mode (Remote / On-site / Hybrid)
  if (
    lower.includes('remote') ||
    lower.includes('work from home') ||
    lower.includes('wfh') ||
    lower.includes('ghar se') ||
    lower.includes('ghar baithe') ||
    lower.includes('घर से') ||
    lower.includes('रिमोट')
  ) {
    intent.workMode = 'remote';
  } else if (
    lower.includes('on-site') ||
    lower.includes('onsite') ||
    lower.includes('office') ||
    lower.includes('field') ||
    lower.includes('दफ्तर') ||
    lower.includes('ऑफिस')
  ) {
    intent.workMode = 'on_site';
  } else if (lower.includes('hybrid') || lower.includes('हाइब्रिड')) {
    intent.workMode = 'hybrid';
  }

  // 2. Detect Job Type (Internship, Apprenticeship, Entry-level, Part-time)
  if (
    lower.includes('internship') ||
    lower.includes('intern') ||
    lower.includes('इंटर्नशिप') ||
    lower.includes('इंटर्न') ||
    lower.includes('प्रशिक्षु')
  ) {
    intent.jobType = 'internship';
  } else if (
    lower.includes('apprentice') ||
    lower.includes('apprenticeship') ||
    lower.includes('शिक्षु') ||
    lower.includes('अप्रेंटिस')
  ) {
    intent.jobType = 'apprenticeship';
  } else if (
    lower.includes('part-time') ||
    lower.includes('part time') ||
    lower.includes('parttime') ||
    lower.includes('पार्ट-टाइम') ||
    lower.includes('पार्ट टाइम')
  ) {
    intent.jobType = 'part_time';
  } else if (
    lower.includes('freelance') ||
    lower.includes('gig') ||
    lower.includes('फ्रीलांस')
  ) {
    intent.jobType = 'freelance';
  }

  // 3. Detect Experience Level
  if (
    lower.includes('beginner') ||
    lower.includes('beginners') ||
    lower.includes('fresher') ||
    lower.includes('freshers') ||
    lower.includes('entry level') ||
    lower.includes('entry-level') ||
    lower.includes('starter') ||
    lower.includes('shuruati') ||
    lower.includes('शुरुआती') ||
    lower.includes('फ्रेशर')
  ) {
    intent.experienceLevel = 'beginner';
  } else if (
    lower.includes('experienced') ||
    lower.includes('senior') ||
    lower.includes('lead') ||
    lower.includes('अनुभवी')
  ) {
    intent.experienceLevel = 'experienced';
  }

  // 4. Detect Training Preference
  if (
    lower.includes('training') ||
    lower.includes('mentor') ||
    lower.includes('mentorship') ||
    lower.includes('seekhna') ||
    lower.includes('seekhein') ||
    lower.includes('ट्रेनिंग') ||
    lower.includes('सीखना') ||
    lower.includes('सिखाया जाए') ||
    lower.includes('मेंटर')
  ) {
    intent.hasTraining = true;
  }

  // 5. Detect No Degree Required preference
  if (
    lower.includes('no degree') ||
    lower.includes('without degree') ||
    lower.includes('bina degree') ||
    lower.includes('डिग्री की जरूरत नहीं') ||
    lower.includes('बिना डिग्री')
  ) {
    intent.noDegree = true;
  }

  // 6. Detect Location
  for (const loc of KNOWN_LOCATIONS) {
    if (loc.regex.test(lower)) {
      intent.location = loc.name;
      break;
    }
  }

  // 7. Detect Skills
  for (const item of SKILL_KEYWORDS) {
    if (item.regex.test(lower)) {
      if (!intent.skills.includes(item.skill)) {
        intent.skills.push(item.skill);
      }
    }
  }

  // 8. Detect Category with word-boundary matching
  let bestCategory: OpportunityCategory | null = null;
  let maxKeywordMatches = 0;

  for (const [catKey, catInfo] of Object.entries(CATEGORY_MAP)) {
    const category = catKey as OpportunityCategory;
    let matchCount = 0;
    for (const kw of catInfo.keywords) {
      // Use word boundary for short keywords or regex
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const kwRegex = new RegExp(`(^|\\s|[^a-zA-Z0-9\u0900-\u097F])${escaped}($|\\s|[^a-zA-Z0-9\u0900-\u097F])`, 'i');
      if (kwRegex.test(lower)) {
        matchCount++;
      }
    }
    if (matchCount > maxKeywordMatches) {
      maxKeywordMatches = matchCount;
      bestCategory = category;
    }
  }

  if (bestCategory && maxKeywordMatches > 0) {
    intent.category = bestCategory;
    intent.categoryLabel = CATEGORY_MAP[bestCategory].en;
  }

  // 9. Detect Role mention
  const roleTerms = [
    'frontend', 'front-end', 'react developer', 'web developer', 'python developer',
    'data analyst', 'ui designer', 'content writer', 'solar technician', 'electrician',
    'robotics trainee', 'inventory coordinator', 'agritech specialist', 'backend developer'
  ];
  for (const rt of roleTerms) {
    if (lower.includes(rt)) {
      intent.role = rt;
      break;
    }
  }

  return intent;
}

/**
 * Matches and ranks opportunities against the parsed intent.
 * Generates human-readable match explanations for each result.
 */
export function matchOpportunities(
  intent: ParsedVoiceIntent,
  opportunities: Opportunity[],
  lang: Language = 'en'
): MatchedOpportunityResult[] {
  const queryLower = intent.rawQuery.toLowerCase();
  const tokens = queryLower
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  // Common stop words in English and Hindi/Hinglish to discount
  const stopWords = new Set([
    'find', 'show', 'search', 'want', 'need', 'looking', 'please', 'give', 'get',
    'mujhe', 'chahiye', 'karo', 'dikhao', 'dikhaye', 'bhi', 'aur', 'mein', 'hai',
    'karen', 'wala', 'wali', 'wale', 'ke', 'liye', 'aisi', 'aisa', 'aise', 'jobs',
    'job', 'opportunity', 'opportunities', 'the', 'for', 'with', 'and'
  ]);

  const informativeTokens = tokens.filter((t) => !stopWords.has(t));

  const results: MatchedOpportunityResult[] = [];

  for (const opp of opportunities) {
    let score = 0;
    const reasons: { en: string; hi: string }[] = [];

    const titleLower = opp.title.toLowerCase();
    const titleHiLower = (opp.titleHi || '').toLowerCase();
    const descLower = opp.description.toLowerCase();
    const orgLower = opp.organization.toLowerCase();
    const locLower = opp.location.toLowerCase();
    const skillsLower = opp.skillsRequired.map((s) => s.toLowerCase());
    const scheduleLower = (opp.schedule || '').toLowerCase();

    // 1. Role / Title Match (High Weight)
    if (intent.role && (titleLower.includes(intent.role) || titleHiLower.includes(intent.role))) {
      score += 40;
      reasons.push({
        en: `Direct match for role: "${opp.title}"`,
        hi: `पद से सीधा मिलान: "${opp.titleHi || opp.title}"`,
      });
    }

    // 2. Category Match
    if (intent.category && opp.category === intent.category) {
      score += 30;
      const catLabel = CATEGORY_MAP[opp.category];
      reasons.push({
        en: `Category match: ${catLabel.en}`,
        hi: `श्रेणी मिलान: ${catLabel.hi}`,
      });
    }

    // 3. Work Mode Match (Remote / On-site / Hybrid)
    if (intent.workMode) {
      if (opp.workMode === intent.workMode) {
        score += 25;
        const modeLabelEn = opp.workMode === 'remote' ? 'Remote work' : opp.workMode === 'hybrid' ? 'Hybrid work' : 'On-site work';
        const modeLabelHi = opp.workMode === 'remote' ? 'रिमोट कार्य' : opp.workMode === 'hybrid' ? 'हाइब्रिड कार्य' : 'ऑन-साइट कार्य';
        reasons.push({
          en: `Matched preferred work mode: ${modeLabelEn}`,
          hi: `पसंदीदा कार्य मोड: ${modeLabelHi}`,
        });
      } else if (intent.workMode === 'remote' && opp.workMode !== 'remote') {
        // Penalty if explicitly looking for remote but job is strictly on-site
        score -= 20;
      }
    }

    // 4. Job Type Match (Internship, Apprenticeship, Part-time)
    if (intent.jobType) {
      if (intent.jobType === 'part_time') {
        if (
          scheduleLower.includes('part-time') ||
          scheduleLower.includes('part time') ||
          scheduleLower.includes('flexible') ||
          scheduleLower.includes('20 hrs') ||
          scheduleLower.includes('15 hrs') ||
          scheduleLower.includes('shifts') ||
          opp.practicalConstraints.flexibleHours
        ) {
          score += 25;
          reasons.push({
            en: 'Flexible / part-time schedule matches your request',
            hi: 'लचीला / पार्ट-टाइम समय आपके अनुरोध से मेल खाता है',
          });
        }
      } else if (opp.type === intent.jobType) {
        score += 25;
        const typeLabelEn = opp.type === 'internship' ? 'Internship opportunity' : 'Apprenticeship / Trainee';
        const typeLabelHi = opp.type === 'internship' ? 'इंटर्नशिप अवसर' : 'शिक्षुता / प्रशिक्षु';
        reasons.push({
          en: typeLabelEn,
          hi: typeLabelHi,
        });
      }
    }

    // 5. Training / Mentorship Match
    if (intent.hasTraining) {
      if (opp.practicalConstraints.mentorAssigned || opp.type === 'apprenticeship' || opp.type === 'internship') {
        score += 20;
        reasons.push({
          en: 'Mentorship & structured training provided on-the-job',
          hi: 'कार्य के दौरान व्यक्तिगत मेंटरशिप व प्रशिक्षण उपलब्ध',
        });
      }
    }

    // 6. Experience Level / Beginner Friendly Match
    if (intent.experienceLevel === 'beginner') {
      if (
        opp.type === 'internship' ||
        opp.type === 'apprenticeship' ||
        opp.practicalConstraints.noDegreeRequired ||
        titleLower.includes('junior') ||
        titleLower.includes('apprentice') ||
        titleLower.includes('intern') ||
        titleLower.includes('trainee')
      ) {
        score += 20;
        reasons.push({
          en: 'Beginner-friendly: no advanced experience barrier',
          hi: 'शुरुआती स्तर: अनुभव या डिग्री की कोई कठिन शर्त नहीं',
        });
      }
    }

    // 7. Location Match
    if (intent.location) {
      const locMatch = locLower.includes(intent.location.toLowerCase());
      if (locMatch) {
        score += 35;
        reasons.push({
          en: `Location match in ${intent.location}`,
          hi: `${intent.location} में स्थानीय कार्य`,
        });
      } else if (opp.workMode === 'remote') {
        score += 15;
        reasons.push({
          en: 'Remote opportunity accessible from any location',
          hi: 'रिमोट अवसर जो किसी भी स्थान से सुलभ है',
        });
      }
    }

    // 8. Skill Matches
    for (const skill of intent.skills) {
      const skillLower = skill.toLowerCase();
      const directSkillMatch = skillsLower.some((s) => s.includes(skillLower) || skillLower.includes(s));
      const textMatch = titleLower.includes(skillLower) || descLower.includes(skillLower);

      if (directSkillMatch || textMatch) {
        score += 25;
        reasons.push({
          en: `Requires or develops "${skill}"`,
          hi: `"${skill}" कौशल का उपयोग या विकास`,
        });
      }
    }

    // 9. Informative Tokens match (handles unexpected words or partial search words)
    for (const token of informativeTokens) {
      if (titleLower.includes(token) || titleHiLower.includes(token)) {
        score += 15;
      } else if (descLower.includes(token) || orgLower.includes(token) || locLower.includes(token)) {
        score += 8;
      }
    }

    // Only include if there is a positive score and meaningful match
    if (score > 15) {
      // Ensure unique reasons
      const uniqueReasons: { en: string; hi: string }[] = [];
      const seenEn = new Set<string>();
      for (const r of reasons) {
        if (!seenEn.has(r.en)) {
          seenEn.add(r.en);
          uniqueReasons.push(r);
        }
      }

      results.push({
        opportunity: opp,
        score,
        matchReasons: uniqueReasons,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Returns suggested alternative categories if search returns 0 results.
 */
export function getRecommendedCategories(query: string): {
  id: OpportunityCategory;
  nameEn: string;
  nameHi: string;
}[] {
  return [
    {
      id: 'software_web',
      nameEn: 'Software & Web Development',
      nameHi: 'सॉफ्टवेयर और वेब डेवलपमेंट',
    },
    {
      id: 'data_python',
      nameEn: 'Data Analytics & Python',
      nameHi: 'डेटा एनालिटिक्स और पायथन',
    },
    {
      id: 'electronics_robotics',
      nameEn: 'Electronics, Robotics & Hardware',
      nameHi: 'इलेक्ट्रॉनिक्स और रोबोटिक्स',
    },
    {
      id: 'local_trades',
      nameEn: 'Local Jobs & Apprenticeships',
      nameHi: 'स्थानीय कार्य और शिक्षुता',
    },
  ];
}
