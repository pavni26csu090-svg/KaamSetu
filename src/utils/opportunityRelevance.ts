import { Opportunity, OpportunityCategory, UserProfile, Language } from '../types';

export interface CategoryMeta {
  id: OpportunityCategory;
  labelEn: string;
  labelHi: string;
  shortLabelEn: string;
  shortLabelHi: string;
  descriptionEn: string;
  descriptionHi: string;
}

export const OPPORTUNITY_CATEGORIES: CategoryMeta[] = [
  {
    id: 'software_web',
    labelEn: 'Software and Web Development',
    labelHi: 'सॉफ्टवेयर व वेब डेवलपमेंट',
    shortLabelEn: 'Software & Web',
    shortLabelHi: 'सॉफ्टवेयर व वेब',
    descriptionEn: 'Frontend, backend, APIs, and modern responsive web interfaces.',
    descriptionHi: 'फ्रंटएंड, बैकएंड, एपीआई और आधुनिक रिस्पॉन्सिव वेब इंटरफेस।',
  },
  {
    id: 'data_python',
    labelEn: 'Data Analytics and Python',
    labelHi: 'डेटा एनालिटिक्स व पायथन',
    shortLabelEn: 'Data & Python',
    shortLabelHi: 'डेटा व पायथन',
    descriptionEn: 'Spreadsheet automation, Python data cleaning, SQL, and business dashboards.',
    descriptionHi: 'स्प्रेडशीट ऑटोमेशन, पायथन डेटा क्लीनिंग, एसक्यूएल और बिजनेस डैशबोर्ड।',
  },
  {
    id: 'aiml_emerging',
    labelEn: 'AI/ML and Emerging Technology',
    labelHi: 'एआई/एमएल व उभरती तकनीक',
    shortLabelEn: 'AI/ML & Emerging',
    shortLabelHi: 'एआई/एमएल',
    descriptionEn: 'Data annotation, prompt evaluation, speech transcription, and IoT sensors.',
    descriptionHi: 'डेटा एनोटेशन, प्रॉम्प्ट मूल्यांकन, स्पीच ट्रांसक्रिप्शन और आईओटी सेंसर्स।',
  },
  {
    id: 'electronics_robotics',
    labelEn: 'Electronics, Robotics and Hardware',
    labelHi: 'इलेक्ट्रॉनिक्स, रोबोटिक्स व हार्डवेयर',
    shortLabelEn: 'Electronics & Hardware',
    shortLabelHi: 'इलेक्ट्रॉनिक्स',
    descriptionEn: 'Solar installation, EV battery diagnostics, circuit testing, and hardware repair.',
    descriptionHi: 'सोलर इंस्टालेशन, ईवी बैटरी जांच, सर्किट परीक्षण और हार्डवेयर मेंटेनेंस।',
  },
  {
    id: 'design_creative',
    labelEn: 'Design and Creative Work',
    labelHi: 'डिज़ाइन व रचनात्मक कार्य',
    shortLabelEn: 'Design & Creative',
    shortLabelHi: 'डिज़ाइन',
    descriptionEn: 'UI/UX wireframing, vernacular graphics, video editing, and product packaging.',
    descriptionHi: 'यूआई/यूएक्स लेआउट, क्षेत्रीय ग्राफिक्स, वीडियो संपादन और पैकेजिंग डिज़ाइन।',
  },
  {
    id: 'marketing_content',
    labelEn: 'Marketing and Content',
    labelHi: 'मार्केटिंग व सामग्री निर्माण',
    shortLabelEn: 'Marketing & Content',
    shortLabelHi: 'मार्केटिंग व कंटेंट',
    descriptionEn: 'Vernacular translation, local SEO, social outreach, and community engagement.',
    descriptionHi: 'मातृभाषा अनुवाद, लोकल एसईओ, सोशल मीडिया और सामुदायिक संवाद।',
  },
  {
    id: 'business_operations',
    labelEn: 'Business and Operations',
    labelHi: 'बिजनेस व ऑपरेशंस',
    shortLabelEn: 'Business & Ops',
    shortLabelHi: 'बिजनेस',
    descriptionEn: 'Inventory tracking, e-commerce cataloging, logistics dispatch, and customer support.',
    descriptionHi: 'इन्वेंटरी ट्रैकिंग, ई-कॉमर्स कैटलॉग, लॉजिस्टिक्स डिस्पैच और ग्राहक सहायता।',
  },
  {
    id: 'local_trades',
    labelEn: 'Local Jobs, Apprenticeships and Skilled Trades',
    labelHi: 'स्थानीय कार्य, अप्रेंटिसशिप व हुनरमंद ट्रेड',
    shortLabelEn: 'Skilled Trades & Local',
    shortLabelHi: 'लोकल व ट्रेड',
    descriptionEn: 'Agritech field collection, tailoring mastercraft, modern plumbing, and cold storage.',
    descriptionHi: 'एग्रीटेक फील्ड डेटा, परिधान सिलाई, आधुनिक प्लंबिंग और फील्ड ऑपरेशंस।',
  },
];

export function getCategoryMeta(categoryId: OpportunityCategory): CategoryMeta {
  const found = OPPORTUNITY_CATEGORIES.find((c) => c.id === categoryId);
  return (
    found || {
      id: categoryId,
      labelEn: categoryId,
      labelHi: categoryId,
      shortLabelEn: categoryId,
      shortLabelHi: categoryId,
      descriptionEn: '',
      descriptionHi: '',
    }
  );
}

export function getCategoryLabel(categoryId: OpportunityCategory, lang: Language): string {
  const meta = getCategoryMeta(categoryId);
  return lang === 'hi' ? meta.labelHi : meta.labelEn;
}

export function getCategoryShortLabel(categoryId: OpportunityCategory, lang: Language): string {
  const meta = getCategoryMeta(categoryId);
  return lang === 'hi' ? meta.shortLabelHi : meta.shortLabelEn;
}

export interface OpportunityRelevance {
  score: number; // 0 to 100
  isHighFit: boolean;
  isInterestMatch: boolean;
  matchingSkills: string[];
  missingSkills: string[];
  whyMatchedEn: string;
  whyMatchedHi: string;
  skillGapSummaryEn: string;
  skillGapSummaryHi: string;
}

// Keyword heuristics to link profile interests / bio to categories
const CATEGORY_KEYWORDS: Record<OpportunityCategory, string[]> = {
  software_web: [
    'web',
    'frontend',
    'backend',
    'fullstack',
    'software',
    'developer',
    'javascript',
    'html',
    'css',
    'react',
    'api',
    'coding',
    'computer',
  ],
  data_python: [
    'data',
    'python',
    'analytics',
    'excel',
    'spreadsheet',
    'sql',
    'dashboard',
    'metrics',
    'cleaning',
    'scraping',
  ],
  aiml_emerging: [
    'ai',
    'ml',
    'machine learning',
    'prompt',
    'annotation',
    'transcription',
    'vision',
    'iot',
    'model',
    'emerging',
  ],
  electronics_robotics: [
    'solar',
    'electrical',
    'electrician',
    'hardware',
    'robotics',
    'battery',
    'ev',
    'wiring',
    'circuit',
    'technician',
  ],
  design_creative: [
    'design',
    'ui',
    'ux',
    'creative',
    'figma',
    'graphic',
    'canva',
    'packaging',
    'video',
    'artisan',
  ],
  marketing_content: [
    'marketing',
    'content',
    'writing',
    'translation',
    'vernacular',
    'seo',
    'social media',
    'editorial',
    'hindi',
  ],
  business_operations: [
    'business',
    'operations',
    'inventory',
    'logistics',
    'storefront',
    'microfinance',
    'catalog',
    'customer success',
    'enterprise',
  ],
  local_trades: [
    'trade',
    'apprentice',
    'field',
    'farming',
    'agritech',
    'tailoring',
    'plumbing',
    'hvac',
    'local work',
    'hands-on',
  ],
};

/**
 * Calculates a multidimensional relevance profile for an opportunity based on user's
 * declared goals, interests, skills, location, and constraints.
 */
export function calculateOpportunityRelevance(
  opp: Opportunity,
  profile: UserProfile
): OpportunityRelevance {
  const userSkills = profile.skills || [];
  const userInterests = (profile.interests || []).map((i) => i.toLowerCase());
  const userGoals = profile.goals || [];
  const userBio = (profile.bio || '').toLowerCase();
  const userEdu = (profile.educationLevel || '').toLowerCase();

  const oppCategory = opp.category;
  const oppSkills = opp.skillsRequired || [];
  const oppTitle = opp.title.toLowerCase();

  // 1. Skill Matching
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const reqSkill of oppSkills) {
    const reqLower = reqSkill.toLowerCase();
    const hasMatch = userSkills.some((uSkill) => {
      const uLower = uSkill.toLowerCase();
      return (
        uLower === reqLower ||
        uLower.includes(reqLower) ||
        reqLower.includes(uLower) ||
        (reqLower.includes('javascript') && uLower.includes('javascript')) ||
        (reqLower.includes('html') && uLower.includes('html')) ||
        (reqLower.includes('python') && uLower.includes('python')) ||
        (reqLower.includes('solar') && uLower.includes('solar')) ||
        (reqLower.includes('wiring') && uLower.includes('wiring')) ||
        (reqLower.includes('inventory') && uLower.includes('inventory'))
      );
    });

    if (hasMatch) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const skillMatchRatio = oppSkills.length > 0 ? matchingSkills.length / oppSkills.length : 0;
  let score = Math.round(skillMatchRatio * 40);

  // 2. Interest / Domain Affinity
  const keywords = CATEGORY_KEYWORDS[oppCategory] || [];
  let interestMatchCount = 0;

  for (const interest of userInterests) {
    if (keywords.some((kw) => interest.includes(kw) || kw.includes(interest))) {
      interestMatchCount++;
    }
  }

  // Also check bio & title keywords
  const bioMatches = keywords.filter((kw) => userBio.includes(kw) || oppTitle.includes(kw)).length;
  const isInterestMatch = interestMatchCount > 0 || bioMatches > 0;

  if (interestMatchCount > 0) {
    score += Math.min(interestMatchCount * 20, 35);
  } else if (bioMatches > 0) {
    score += 15;
  }

  // 3. Goal Compatibility
  if (userGoals.includes('internship_job') && (opp.type === 'internship' || opp.type === 'entry_level')) {
    score += 15;
  }
  if (userGoals.includes('local_work') && (opp.type === 'local_work' || opp.type === 'apprenticeship')) {
    score += 15;
  }
  if (userGoals.includes('grow_business') && oppCategory === 'business_operations') {
    score += 15;
  }
  if (userGoals.includes('build_skills')) {
    score += 5;
  }

  // 4. Practical Constraints Compatibility
  if (opp.practicalConstraints.noDegreeRequired && (userEdu.includes('student') || userEdu.includes('iti') || userEdu.includes('diploma'))) {
    score += 5;
  }
  if (opp.workMode === 'remote') {
    score += 5;
  } else if (profile.location && opp.location.toLowerCase().includes(profile.location.split(',')[0].toLowerCase().trim())) {
    score += 10;
  }

  // Bound score between 5 and 100
  score = Math.min(Math.max(score, 10), 100);

  const isHighFit = score >= 55 || (isInterestMatch && matchingSkills.length > 0);

  // Dynamic explanation strings
  let whyMatchedEn = '';
  let whyMatchedHi = '';

  if (isInterestMatch && matchingSkills.length > 0) {
    whyMatchedEn = `Directly matches your interest in ${getCategoryShortLabel(oppCategory, 'en')} and ${matchingSkills.length} of your current skills (${matchingSkills.slice(0, 2).join(', ')}).`;
    whyMatchedHi = `आपके ${getCategoryShortLabel(oppCategory, 'hi')} में रुचि और ${matchingSkills.length} वर्तमान कौशलों (${matchingSkills.slice(0, 2).join(', ')}) से सीधा मेल खाता है।`;
  } else if (matchingSkills.length > 0) {
    whyMatchedEn = `Applies ${matchingSkills.length} of your existing skills: ${matchingSkills.join(', ')}.`;
    whyMatchedHi = `आपके मौजूदा ${matchingSkills.length} कौशलों का उपयोग करता है: ${matchingSkills.join(', ')}।`;
  } else if (isInterestMatch) {
    whyMatchedEn = `Strong domain alignment with your focus in ${getCategoryShortLabel(oppCategory, 'en')}. Excellent springboard to build foundational proof.`;
    whyMatchedHi = `${getCategoryShortLabel(oppCategory, 'hi')} में आपके रुझान के अनुरूप। आवश्यक व्यावहारिक अनुभव बनाने का अच्छा अवसर।`;
  } else {
    whyMatchedEn = `Available ${opp.type.replace('_', ' ')} opportunity open to ambitious learners with flexible scheduling.`;
    whyMatchedHi = `लचीले समय के साथ शिक्षार्थियों के लिए उपलब्ध ${opp.type.replace('_', ' ')} अवसर।`;
  }

  let skillGapSummaryEn = '';
  let skillGapSummaryHi = '';

  if (missingSkills.length === 0) {
    skillGapSummaryEn = 'Full skill coverage! You are ready to review and submit a demo application.';
    skillGapSummaryHi = 'सभी मुख्य कौशल मेल खाते हैं! आप डेमो आवेदन भेजने के लिए तैयार हैं।';
  } else {
    const missingStrEn = missingSkills.slice(0, 2).join(' and ');
    const missingStrHi = missingSkills.slice(0, 2).join(' व ');
    skillGapSummaryEn = `${missingSkills.length} skill gap${missingSkills.length > 1 ? 's' : ''} to bridge: ${missingStrEn}. Complete a SkillBridge practical challenge to add verified proof.`;
    skillGapSummaryHi = `${missingSkills.length} कौशल सीखने योग्य: ${missingStrHi}। सत्यापित प्रमाण जोड़ने के लिए स्किलब्रिज का प्रैक्टिकल चैलेंज पूरा करें।`;
  }

  return {
    score,
    isHighFit,
    isInterestMatch,
    matchingSkills,
    missingSkills,
    whyMatchedEn,
    whyMatchedHi,
    skillGapSummaryEn,
    skillGapSummaryHi,
  };
}

/**
 * Ranks all opportunities based on relevance to the current user profile.
 */
export function rankOpportunitiesForUser(
  opportunities: Opportunity[],
  profile: UserProfile
): { opp: Opportunity; relevance: OpportunityRelevance }[] {
  return opportunities
    .map((opp) => ({
      opp,
      relevance: calculateOpportunityRelevance(opp, profile),
    }))
    .sort((a, b) => b.relevance.score - a.relevance.score);
}
