import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
}

const app = express();
const PORT = getPort();

app.use(express.json());

// Initialize Google GenAI client if key is configured
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// Health check and AI status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// AI Career Guidance Proxy Route
app.post('/api/ai/guidance', async (req: Request, res: Response) => {
  const { action, payload, language = 'en' } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action parameter is required.' });
  }

  // If Gemini API is available, try generating response with gemini-3.8-flash
  if (ai) {
    try {
      const langInstruction =
        language === 'hi'
          ? 'Respond clearly in conversational, warm, and helpful Hindi (Devanagari script), keeping technical industry terms recognizable (e.g. JavaScript, Solar Inverter, HTML/CSS).'
          : 'Respond in clear, accessible, empowering English without corporate jargon.';

      let prompt = '';

      switch (action) {
        case 'career_chat':
        case 'mentor_chat':
          prompt = `You are KaamSetu's AI Career Companion - an inclusive, realistic, and practical mentor for students, underserved job seekers, informal sector workers, and local small business owners in India. ${langInstruction}

User Question: "${payload?.question || ''}"
User Context:
- Name: ${payload?.name || 'Learner'}
- Goals: ${payload?.goals?.join(', ') || 'Not specified'}
- Self-Reported Skills: ${payload?.skills?.join(', ') || 'Not specified'}
- Location: ${payload?.location || 'India'}
- Availability: ${payload?.availability || 'Flexible'}

Rules:
1. Provide actionable, practical advice tailored specifically to their skills and situation.
2. If they have no formal experience, explain exactly how to demonstrate ability through small, verifiable micro-projects, portfolio proof, or community work.
3. If they run a small business, suggest practical, low-cost local steps.
4. Keep explanations grounded and realistic. Never hallucinate experience or promise guaranteed job placements.
5. End with 1-2 concrete next steps the user can do right now on KaamSetu.`;
          break;

        case 'skill_gap':
          prompt = `You are KaamSetu's expert skill advisor. ${langInstruction}
Analyze the skill gap for the target role: "${payload?.title || 'Target Opportunity'}".
Opportunity Requirements: ${payload?.requiredSkills?.join(', ') || 'Basic computer literacy, communication, problem solving'}
User's Self-Reported Skills: ${payload?.userSkills?.join(', ') || 'None provided'}
User's Verified Skills: ${payload?.verifiedSkills?.join(', ') || 'None verified yet'}

Provide:
1. Skills Already Reported (skills the user reports possessing that match the role).
2. Skills Needing Improvement (skills the user has basic knowledge of but needs to sharpen).
3. Skills Not Yet Demonstrated (skills required for this role that the user has not yet shown).
4. For each missing skill, explain WHY it matters in day-to-day work and suggest a concrete, practical exercise or free resource.
5. Emphasize that self-reported skills are self-declared, whereas verified skills have demonstrable portfolio proof.`;
          break;

        case 'learning_roadmap':
          prompt = `You are KaamSetu's personalized learning roadmap creator. ${langInstruction}
Target Role: "${payload?.targetRole || 'Junior Web Developer'}"
Current Skills: ${payload?.currentSkills?.join(', ') || 'Basic computer knowledge'}
Available Study Time: ${payload?.availability || '10 hours/week'}
Experience Level: ${payload?.experienceLevel || 'Beginner'}

Generate a structured 4-step learning roadmap tailored to this person.
Respond with a clear markdown explanation followed by a JSON block:
\`\`\`json
{
  "targetRole": "${payload?.targetRole || 'Role'}",
  "steps": [
    {
      "stepNumber": 1,
      "skill": "Name of Skill",
      "whyItMatters": "Clear reason why this skill is needed on the job",
      "practicalTask": "Small hands-on task to build or demonstrate",
      "estimatedTime": "X hours",
      "demonstrableOutcome": "What the user will have built or shown"
    }
  ]
}
\`\`\``;
          break;

        case 'opportunity_match':
          prompt = `You are KaamSetu's opportunity matching engine. ${langInstruction}
Compare the user against these sample opportunities and explain the matching logic transparently:
User Profile:
- Skills: ${payload?.skills?.join(', ') || 'General skills'}
- Goals: ${payload?.goals?.join(', ') || 'Employment'}
- Location: ${payload?.location || 'India'}
- Availability: ${payload?.availability || 'Flexible'}

Available Sample Opportunities (Demo Data):
${JSON.stringify(payload?.opportunities || [])}

Rank the top 3 best fits and for each explain:
1. Why this opportunity fits their profile.
2. Which requirements they appear to meet.
3. Which skills or constraints need attention.
4. What concrete action they should take next on KaamSetu.
Note: Remind the user that these are realistic sample demo listings, not real live vacancies.`;
          break;

        case 'small_business':
          prompt = `You are KaamSetu's local small business advisor. ${langInstruction}
Task: "${payload?.subAction || 'draft_service'}"
Business Context:
- Name: ${payload?.businessName || 'Local Enterprise'}
- Category: ${payload?.category || 'Handicrafts / Services'}
- Location: ${payload?.location || 'Local market'}
- Raw Input from Owner: "${payload?.rawInput || ''}"

Provide:
1. A professionally drafted, welcoming description or service listing ready for review.
2. Suggested indicative pricing structure.
3. Practical tips for WhatsApp/local outreach and neighborhood discoverability.
Note: State clearly that this is a draft for their review, and will not be published automatically.`;
          break;

        case 'simplify_job':
          prompt = `You are KaamSetu's inclusive career guide. ${langInstruction}
Explain the following job opportunity in very simple terms for someone who may be a first-generation jobseeker, student, or transitioning worker.
Break it down into:
1. What you will actually do on a typical day (3-4 bullet points)
2. What skills you really need to get started
3. How to prepare or what to practice before applying
4. Work environment and schedule expectations

Opportunity Details:
Title: ${payload?.title || 'Unknown'}
Organization: ${payload?.organization || 'Unknown'}
Work Mode: ${payload?.workMode || 'Hybrid'}
Location: ${payload?.location || 'India'}
Stipend/Salary: ${payload?.stipend || 'Competitive'}
Requirements: ${payload?.requirements?.join(', ') || 'Not specified'}
Description: ${payload?.description || ''}

Rules: Keep it encouraging, realistic, and honest. Never guarantee job outcomes.`;
          break;

        case 'resume_summary':
          prompt = `You are KaamSetu's career mentor. ${langInstruction}
Create a concise, professional 3-sentence résumé summary / bio for:
Name: ${payload?.name || 'Aspirant'}
Target Goal: ${payload?.goal || 'Employment'}
Key Skills: ${payload?.skills?.join(', ') || 'General skills'}
Background/Interests: ${payload?.interests || 'Motivated learner'}
Location: ${payload?.location || 'India'}

Rules: Strictly reflect only the user-provided data. Do NOT invent degrees, past companies, or fake metrics. Highlight dedication, practical problem-solving, and readiness to learn.`;
          break;

        default:
          prompt = `Provide helpful, realistic career guidance on: ${JSON.stringify(payload)}. ${langInstruction}`;
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 9500)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response?.text || '';

      // Extract structured data if available
      let structuredData: any = null;
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          structuredData = JSON.parse(jsonMatch[1]);
        } catch {
          // ignore json parse error, text remains primary
        }
      }

      // If roadmap was requested but structuredData wasn't extracted, synthesize fallback structure
      if (action === 'learning_roadmap' && (!structuredData || !structuredData.steps)) {
        structuredData = getDeterministicRoadmap(payload, language);
      }

      return res.json({
        success: true,
        source: 'gemini',
        content: responseText,
        structuredData,
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back:', err?.message || err);
      // Fall through to deterministic fallback response below
    }
  }

  // Graceful deterministic fallback logic when API key is absent or call fails
  const fallback = generateDeterministicCareerGuidance(action, payload, language);
  return res.json({
    success: true,
    source: 'deterministic_fallback',
    content: fallback.content,
    structuredData: fallback.structuredData,
  });
});

// Deterministic guidance generator for robust offline & keyless execution
function generateDeterministicCareerGuidance(
  action: string,
  payload: any,
  language: string = 'en'
): { content: string; structuredData?: any } {
  const isHi = language === 'hi';

  if (action === 'career_chat' || action === 'mentor_chat') {
    const q = (payload?.question || '').toLowerCase();
    const skills = payload?.skills || [];
    const name = payload?.name || 'Learner';

    if (q.includes('python') || q.includes('html')) {
      if (isHi) {
        return {
          content: `### 🎯 पायथन और एचटीएमएल के साथ करियर विकल्प
नमस्ते ${name}! आपके पास तकनीकी कौशल का एक बहुत अच्छा प्रारंभिक संयोजन है:

**1. आप किन शुरुआती पदों के लिए तैयार हो सकते हैं:**
• **जूनियर वेब डेवलपर / फ्रंटएंड इंटर्न:** अपने HTML ज्ञान में थोड़ा CSS और बुनियादी JavaScript जोड़ें।
• **डेटा ऑपरेशन्स / ऑटोमेशन असिस्टेंट:** Python का उपयोग डेटा क्लीनिंग, CSV फ़ाइलों के प्रसंस्करण और एक्सेल ऑटोमेशन के लिए होता है।
• **वेबसाइट कंटेंट व तकनीकी सपोर्ट:** स्थानीय व्यवसायों के लिए वेबसाइट अपडेट करना।

**2. बिना औपचारिक अनुभव के अपनी क्षमता कैसे साबित करें:**
• एक साधारण 1-पेज का व्यक्तिगत पोर्टफोलियो या स्थानीय दुकान का डेमो वेबपेज बनाएं।
• Python की 1 छोटी स्क्रिप्ट लिखें जो किसी डेटाशीट से सारांश निकालती हो।
• दोनों का कोड GitHub या KaamSetu पोर्टफोलियो में संलग्न करें।

**3. आपके लिए अगला व्यावहारिक कदम:**
KaamSetu पर "वेब डेवलपर इंटर्नशिप" या "डेटा असिस्टेंट" के सैंपल लिस्टिंग देखें और स्किलब्रिज में 1 व्यावहारिक चैलेंज पूरा करें।`,
        };
      }
      return {
        content: `### 🎯 Career Pathways for Python & HTML
Hello ${name}! That is a high-utility foundation that opens two distinct entry points:

**1. Roles You Can Target Immediately:**
• **Junior Web Developer / Frontend Intern:** Combine your HTML with CSS Flexbox and basic JavaScript to build responsive interfaces.
• **Data Support & Scripting Assistant:** Python is widely used in tier-2/3 tech setups for data cleaning, CSV parsing, and spreadsheet automation.
• **Technical Support Specialist:** Helping users navigate web platforms and checking basic scripts.

**2. How to Demonstrate Competency Without Formal Experience:**
• Build a single responsive webpage (e.g. a local service directory or mock store).
• Write a 30-line Python script that automates a daily task (like organizing transaction logs or calculating discounts).
• Host them on GitHub or attach the code link directly to your KaamSetu portfolio.

**3. Next Actionable Step:**
Select the "Junior Web Developer Intern" listing in KaamSetu's Opportunity Explorer to view exact matching criteria and complete the HTML layout challenge.`,
      };
    }

    if (q.includes('no formal work experience') || q.includes('experience') || q.includes('अनुभव')) {
      if (isHi) {
        return {
          content: `### 💡 बिना औपचारिक अनुभव के कौशल प्रदर्शित करने के 4 तरीके

**1. प्रमाण-आधारित प्रोजेक्ट (Proof of Work):**
नियोक्ता यह देखना चाहते हैं कि आप काम कर सकते हैं या नहीं। डिग्री या पिछले पद से ज़्यादा 1-2 ठोस प्रोजेक्ट मायने रखते हैं।

**2. KaamSetu स्किलब्रिज चैलेंज:**
हमारे प्रैक्टिकल चैलेंज में दिए गए परिदृश्यों (जैसे मोबाइल फॉर्म डिजाइन या स्प्रेडशीट बजटिंग) को पूरा करें। इससे आपको सत्यापित सबूत मिलता है।

**3. स्थानीय या समुदाय स्तर पर छोटा काम:**
किसी स्थानीय एनजीओ, रिश्तेदार की दुकान या स्कूल के लिए डिजिटल काम (पोस्टर, डेटा एंट्री, सोशल मीडिया पेज) करें और उसे केस स्टडी के रूप में लिखें।

**4. ईमानदार और स्पष्ट आवेदन:**
नियोक्ता को बताएं: *"मेरे पास औपचारिक कंपनी का अनुभव नहीं है, लेकिन मैंने यह 2 कार्य सफलतापूर्वक बनाए हैं जिन्हें आप यहाँ देख सकते हैं।"*`,
        };
      }
      return {
        content: `### 💡 4 Ways to Prove Your Skills Without Formal Experience

Employers in practical roles increasingly prioritize verifiable proof of execution over resume pedigree. Here is your blueprint:

**1. Create Tangible "Proof of Work":**
A live link, a sample spreadsheet template, or a photographed handicraft is 10x more persuasive than a self-claimed bullet point.

**2. Complete KaamSetu SkillBridge Challenges:**
Each challenge simulates a real workplace assignment with clear evaluation rubrics. Submitting your solution records verified portfolio evidence.

**3. Help a Local Initiative or Small Business:**
Volunteer 5 hours to digitize inventory for a neighborhood shop or build a simple flyer. Document the before-and-after outcome.

**4. Frame Your Application Around Reliability:**
State transparently: *"While I am starting my professional journey, I have demonstrated reliability through my completed projects attached below."*`,
      };
    }

    if (q.includes('tailor') || q.includes('business') || q.includes('व्यापार') || q.includes('दुकान')) {
      if (isHi) {
        return {
          content: `### 🧵 स्थानीय सिलाई व हस्तशिल्प व्यवसाय बढ़ाने के 4 व्यावहारिक सुझाव

**1. स्पष्ट डिजिटल मूल्य सूची (Rate Card):**
KaamSetu के **Local Business Hub** में अपनी सेवाओं की सूची बनाएं (जैसे: ब्लाउज सिलाई ₹450, सूट अल्टरेशन ₹120)। स्पष्ट दरें ग्राहकों का संकोच दूर करती हैं।

**2. व्हाट्सएप कैटलॉग और तस्वीरें:**
अपने 5 सबसे बेहतरीन काम की अच्छी रोशनी में तस्वीरें लें और एक मिनी कैटलॉग बनाएं।

**3. स्थानीय कार्यशालाओं व बुटीक से साझेदारी:**
आस-पास के कपड़े के व्यापारियों या बुटीक से संपर्क करें और उन्हें पीक सीजन में सिलाई सहायता की पेशकश करें।

**4. KaamSetu पर हेल्पर लिस्टिंग:**
जब ऑर्डर अधिक हों, तो पड़ोस के शिक्षार्थियों को कटिंग या पैकेजिंग के लिए 2-दिवसीय काम पर रखें।`,
        };
      }
      return {
        content: `### 🧵 4 Actionable Steps to Grow a Local Tailoring or Craft Business

**1. Publish Transparent Service Rates:**
Use KaamSetu's **Local Business Hub** to list your core services (e.g., Kurta Stitching ₹650, Alteration ₹150). Clear indicative pricing reduces buyer friction.

**2. High-Light Photography for WhatsApp Catalog:**
Photograph 5 clean finished pieces in bright natural daylight. Group them by category (daily wear, festive, repairs).

**3. Partner with Local Fabric Retailers:**
Visit neighborhood cloth merchants. Offer them referral cards: their fabric customers get seamless stitching with timely delivery.

**4. Hire Flexible Helpers for Peak Seasons:**
Post a short-term 2-day gig on KaamSetu for cutting, buttoning, or packaging during festival seasons.`,
      };
    }

    // General mentor advice
    if (isHi) {
      return {
        content: `### 🌟 करियर मार्गदर्शन और अगला कदम
नमस्ते! आपके प्रश्न के संदर्भ में:

• **कौशल-प्रथम दृष्टिकोण:** अपनी रुचि के 1-2 कौशलों पर 2 सप्ताह तक लगातार 45 मिनट ध्यान दें।
• **प्रैक्टिकल अभ्यास:** केवल वीडियो देखने के बजाय तुरंत एक छोटा कार्य करके देखें।
• **स्थानीय अवसर:** शुरुआत में हाइब्रिड या स्थानीय अवसरों में आवेदन करें जहाँ व्यावहारिक तत्परता को प्राथमिकता मिलती है।

आप बाईं ओर दिए गए सुझाए गए संकेतों (Suggested Chips) पर क्लिक करके अपना कौशल विश्लेषण या 4-चरणों वाला रोडमैप भी तैयार कर सकते हैं!`,
      };
    }

    return {
      content: `### 🌟 Career Guidance & Next Practical Action
Welcome! Here is an honest, step-by-step approach to moving your career forward:

• **Focus on 1–2 Transferable Competencies:** Rather than learning 10 things superficially, master one concrete skill that solves an employer's immediate pain point.
• **Anchor Your Profile in Proof:** Use KaamSetu's SkillBridge to submit real deliverables that back up your profile claims.
• **Target Inclusive Roles:** Filter for opportunities offering "No Degree Required" or "Mentor Assigned" to accelerate on-the-job learning.

Feel free to click any of the suggested prompt chips to analyze your skill gaps, generate a structured roadmap, or find matched opportunities!`,
    };
  }

  if (action === 'skill_gap') {
    const userSkills = payload?.userSkills || [];
    const verifiedSkills = payload?.verifiedSkills || [];
    const requiredSkills = payload?.requiredSkills || ['HTML/CSS Layouts', 'Responsive Design', 'JavaScript Basics'];
    const title = payload?.title || 'Target Role';

    const reportedSkills = requiredSkills.filter((s: string) => userSkills.includes(s));
    const missingSkills = requiredSkills.filter((s: string) => !userSkills.includes(s));

    const structuredData = {
      roleTitle: title,
      reportedSkills,
      verifiedSkills: verifiedSkills.filter((v: string) => requiredSkills.includes(v)),
      missingSkills: missingSkills.map((sk: string) => ({
        skill: sk,
        whyItMatters: isHi
          ? `यह कौशल ${title} के दैनिक कार्यों को सही ढंग से पूरा करने के लिए आवश्यक है।`
          : `Crucial for day-to-day task execution in ${title} roles.`,
        suggestedExercise: isHi
          ? `KaamSetu पर 1 मिनी-टास्क पूरा करें और समाधान सबमिट करें।`
          : `Complete a 30-minute hands-on practice exercise and document proof in your portfolio.`,
      })),
    };

    if (isHi) {
      return {
        content: `### 🎯 कौशल मिलान व विश्लेषण: ${title}

• **स्व-घोषित कौशल (User Reported):** ${reportedSkills.length > 0 ? reportedSkills.join(', ') : 'कोई सीधा मिलान नहीं मिला'}
• **सत्यापित कौशल (Independently Verified):** ${structuredData.verifiedSkills.length > 0 ? structuredData.verifiedSkills.join(', ') : 'पोर्टफोलियो में अभी कोई सत्यापित प्रमाण दर्ज नहीं है'}
• **सीखने योग्य मुख्य कौशल (Skills to Bridge):** ${missingSkills.length > 0 ? missingSkills.join(', ') : 'आपकी प्रोफ़ाइल इस भूमिका के सभी प्राथमिक कौशलों से मेल खाती है!'}

**कौशल अंतर पाटने की सिफारिश:**
${missingSkills
  .map(
    (m: string, idx: number) =>
      `**${idx + 1}. ${m}:** व्यावहारिक काम के लिए आवश्यक। KaamSetu स्किलब्रिज में इसका 1 प्रैक्टिकल चैलेंज पूरा करें।`
  )
  .join('\n')}`,
        structuredData,
      };
    }

    return {
      content: `### 🎯 Skill Gap Analysis: ${title}

• **Self-Reported Matching Skills:** ${reportedSkills.length > 0 ? reportedSkills.join(', ') : 'No direct matches yet'}
• **Independently Verified Skills:** ${structuredData.verifiedSkills.length > 0 ? structuredData.verifiedSkills.join(', ') : 'No verified submissions on record yet'}
• **Skills Requiring Demonstration (Gaps):** ${missingSkills.length > 0 ? missingSkills.join(', ') : 'All primary required skills are accounted for!'}

**Why These Gaps Matter & How to Bridge Them:**
${missingSkills
  .map(
    (m: string, idx: number) =>
      `• **${m}:** High priority for daily execution. Dedicate 4–6 hours to build a sample deliverable and attach evidence to your portfolio.`
  )
  .join('\n')}`,
      structuredData,
    };
  }

  if (action === 'learning_roadmap') {
    const structuredData = getDeterministicRoadmap(payload, language);

    if (isHi) {
      return {
        content: `### 🗺️ व्यक्तिगत 4-चरणीय शिक्षण रोडमैप: ${structuredData.targetRole}
यह रोडमैप आपकी उपलब्ध समय-सीमा (${payload?.availability || 'लचीले घंटे'}) और बुनियादी स्तर को ध्यान में रखकर तैयार किया गया है:

${structuredData.steps
  .map(
    (st: any) =>
      `**चरण ${st.stepNumber}: ${st.skill}** (अनुमानित समय: ${st.estimatedTime})\n• *महत्व:* ${st.whyItMatters}\n• *व्यावहारिक कार्य:* ${st.practicalTask}\n• *परिणाम:* ${st.demonstrableOutcome}`
  )
  .join('\n\n')}

*रोडमैप पैनल में प्रत्येक चरण पूरा होने पर चेकबॉक्स पर टिक करें; आपकी प्रगति सुरक्षित रहेगी।*`,
        structuredData,
      };
    }

    return {
      content: `### 🗺️ Personalized 4-Step Learning Roadmap: ${structuredData.targetRole}
Built realistically for your schedule (${payload?.availability || '10-15 hrs/week'}) and current competencies:

${structuredData.steps
  .map(
    (st: any) =>
      `**Step ${st.stepNumber}: ${st.skill}** (${st.estimatedTime})\n• *Why It Matters:* ${st.whyItMatters}\n• *Practical Task:* ${st.practicalTask}\n• *Demonstrable Outcome:* ${st.demonstrableOutcome}`
  )
  .join('\n\n')}

*Use the interactive Roadmap Panel on the right to track completion. Your progress persists across sessions.*`,
      structuredData,
    };
  }

  if (action === 'opportunity_match') {
    const opportunities = payload?.opportunities || [];
    const userSkills = payload?.skills || [];
    const userLocation = (payload?.location || '').toLowerCase();

    const ranked = opportunities.map((opp: any) => {
      const skillsRequired = opp.skillsRequired || [];
      const matchCount = skillsRequired.filter((sk: string) => userSkills.includes(sk)).length;
      const score = Math.round((matchCount / Math.max(skillsRequired.length, 1)) * 100);

      const locMatch = opp.workMode === 'remote' || opp.location.toLowerCase().includes(userLocation);

      return {
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        location: opp.location,
        workMode: opp.workMode,
        stipend: opp.stipend,
        matchScore: score,
        locMatch,
        matchingSkills: skillsRequired.filter((sk: string) => userSkills.includes(sk)),
        missingSkills: skillsRequired.filter((sk: string) => !userSkills.includes(sk)),
        whyItFits: isHi
          ? `आपके पास आवश्यक ${skillsRequired.length} में से ${matchCount} कौशल हैं, और कार्य मोड (${opp.workMode}) आपकी उपलब्धता के अनुकूल है।`
          : `You possess ${matchCount} of ${skillsRequired.length} required skills, and the ${opp.workMode} format aligns with flexible scheduling.`,
        actionStep: isHi
          ? `इस अवसर का विवरण देखें और KaamSetu पर डेमो आवेदन भेजें।`
          : `Review the role breakdown in Opportunity Explorer and submit a tailored demo application.`,
      };
    });

    ranked.sort((a: any, b: any) => b.matchScore - a.matchScore);

    if (isHi) {
      return {
        content: `### 🔍 अवसर मिलान परिणाम (पारदर्शी रैंकिंग)
*नोट: यह सभी सूचियां प्रामाणिक डेमो डेटा हैं, वास्तविक रिक्तियां नहीं।*\n\n` +
          ranked
            .slice(0, 3)
            .map(
              (r: any, idx: number) =>
                `**${idx + 1}. ${r.title} — ${r.organization}** (${r.matchScore}% मिलान)\n• स्थान/मोड: ${r.location} (${r.workMode}) | पारिश्रमिक: ${r.stipend}\n• क्यों उपयुक्त है: ${r.whyItFits}\n• सीखने योग्य बिंदु: ${r.missingSkills.join(', ') || 'सभी कौशल पूर्ण हैं'}\n• अगला कदम: ${r.actionStep}`
            )
            .join('\n\n'),
        structuredData: { matches: ranked.slice(0, 3) },
      };
    }

    return {
      content: `### 🔍 Opportunity Matching Results (Transparent Criteria)
*Notice: All listings below are realistic sample demo records for evaluation, not real commercial vacancies.*\n\n` +
        ranked
          .slice(0, 3)
          .map(
            (r: any, idx: number) =>
              `**${idx + 1}. ${r.title} at ${r.organization}** (${r.matchScore}% Skill Match)\n• Mode & Pay: ${r.workMode} · ${r.location} | ${r.stipend}\n• Why It Fits: ${r.whyItFits}\n• Skills Needing Attention: ${r.missingSkills.join(', ') || 'All core skills accounted for'}\n• Next Action: ${r.actionStep}`
          )
          .join('\n\n'),
      structuredData: { matches: ranked.slice(0, 3) },
    };
  }

  if (action === 'small_business') {
    const rawInput = payload?.rawInput || 'Handmade pottery and clay cookware';
    const bizName = payload?.businessName || 'Local Craft Studio';

    if (isHi) {
      return {
        content: `### 🏪 स्थानीय व्यापार ड्राफ्ट: ${bizName}
*यह ड्राफ्ट आपकी समीक्षा के लिए है; यह स्वचालित रूप से प्रकाशित नहीं होगा।*

**1. आकर्षक सेवा व उत्पाद विवरण (Storefront Story):**
"${bizName} उच्च गुणवत्ता वाले पारंपरिक और आधुनिक उत्पादों को स्थानीय कारीगरी के साथ तैयार करता है। हम शुद्धता, विश्वसनीयता और उचित दरों के लिए समर्पित हैं।"

**2. सुझाई गई सेवा प्रविष्टि (Service Listing Draft):**
• **नाम:** प्रीमियम कस्टमाइज्ड उत्पाद सेट
• **दर:** ₹750 / प्रति पीस
• **विवरण:** टिकाऊ सामग्री से निर्मित, विशेष मांग पर 3 दिनों में तैयार।

**3. स्थानीय ग्राहक आकर्षित करने के 2 कदम:**
• व्हाट्सएप स्टेटस पर निर्माण प्रक्रिया का 10 सेकंड का वीडियो साझा करें।
• पहले 10 पड़ोस के ग्राहकों को ₹50 की परिचयात्मक छूट दें।`,
        structuredData: {
          draftService: {
            name: isHi ? 'प्रीमियम कस्टमाइज्ड उत्पाद सेट' : 'Custom Handcrafted Item Set',
            price: '₹750',
            unit: isHi ? 'प्रति पीस' : 'per piece',
            description: isHi ? 'टिकाऊ सामग्री से निर्मित, विशेष मांग पर तैयार।' : 'Handmade durable piece made to order within 3 days.',
          },
        },
      };
    }

    return {
      content: `### 🏪 Small Business Showcase Draft: ${bizName}
*Review Draft: This content will not be published automatically. You can copy or save it to your Local Business Hub.*

**1. Professional Storefront Summary:**
"${bizName} brings authentic, locally crafted quality to discerning neighborhood clients and urban buyers. We pride ourselves on reliable turnaround, transparent pricing, and direct artisan care."

**2. Draft Service Listing:**
• **Item / Service Name:** Custom Handcrafted Piece / Commission
• **Indicative Rate:** ₹850 / item
• **Description:** Made to order using quality regional materials with a guaranteed 3-day turnaround.

**3. Next Step for Local Discoverability:**
Review this draft and click "Add Service" in your Local Business Hub to display it on your storefront.`,
      structuredData: {
        draftService: {
          name: 'Custom Handcrafted Piece',
          price: '₹850',
          unit: 'per item',
          description: 'Made to order using quality regional materials with a guaranteed 3-day turnaround.',
        },
      },
    };
  }

  // Fallback for simplify_job
  if (action === 'simplify_job') {
    const title = payload?.title || 'This role';
    const org = payload?.organization || 'Partner Organisation';
    const mode = payload?.workMode || 'Flexible';
    const stipend = payload?.stipend || 'Competitive';

    return {
      content: isHi
        ? `### 📌 काम का सरल विवरण: ${title} (${org})\n• कार्य: टीम कार्यों को समय पर पूरा करना और डिजिटल रिकॉर्ड बनाए रखना।\n• कौशल: बुनियादी संचार और कार्य सीखने की लगन।\n• कार्य मोड: ${mode} | पारिश्रमिक: ${stipend}`
        : `### 📌 Plain-Language Breakdown: ${title} at ${org}\n• Day-to-Day: Coordinate daily tasks, communicate clearly, and update digital sheets.\n• Core Need: Reliability, basic digital comfort, and willingness to learn.\n• Structure: ${mode} · ${stipend}`,
    };
  }

  // Fallback for resume_summary
  const name = payload?.name || 'Aspirant';
  const skillsList = payload?.skills?.length ? payload.skills.slice(0, 3).join(', ') : 'digital tools and problem solving';
  return {
    content: isHi
      ? `सक्रिय और लक्ष्य-उन्मुख पेशेवर, जो ${skillsList} में व्यावहारिक समझ रखते हैं। टीम में वास्तविक योगदान देने और निरंतर नए कौशल सीखने के लिए समर्पित।`
      : `Driven candidate with demonstrable competence in ${skillsList}. Dedicated to learning quickly on the job, adapting to modern workflows, and delivering reliable team results without unnecessary complexity.`,
  };
}

function getDeterministicRoadmap(payload: any, language: string) {
  const isHi = language === 'hi';
  const role = payload?.targetRole || payload?.title || 'Junior Web Developer Intern';

  if (role.toLowerCase().includes('solar') || role.toLowerCase().includes('technician')) {
    return {
      targetRole: role,
      steps: [
        {
          id: `step-${Date.now()}-1`,
          stepNumber: 1,
          skill: isHi ? 'सोलर सेल और इन्वर्टर फंडामेंटल्स' : 'Solar Cell & Inverter Electrical Fundamentals',
          whyItMatters: isHi ? 'सौर प्रणालियों की सुरक्षित स्थापना और लोड गणना के लिए आवश्यक है।' : 'Essential for calculating household load requirements and safely wiring inverter connections.',
          practicalTask: isHi ? 'एक 1kW रूफटॉप सिस्टम का भार और आवश्यक पैनल संख्या की गणना शीट तैयार करें।' : 'Draft a 1kW rooftop load calculation sheet comparing series vs parallel wiring.',
          estimatedTime: '4–6 hours',
          demonstrableOutcome: isHi ? '1-पेज का लोड कैलकुलेशन चार्ट।' : 'A tested 1-page household sizing worksheet.',
          completed: false,
        },
        {
          id: `step-${Date.now()}-2`,
          stepNumber: 2,
          skill: isHi ? 'सुरक्षा प्रोटोकॉल और मल्टीमीटर परीक्षण' : 'High-Voltage Safety Protocols & Multimeter Testing',
          whyItMatters: isHi ? 'साइट पर दुर्घटनाओं से बचाव और वोल्टेज स्थिरता की पुष्टि।' : 'Prevents site hazards and ensures DC-to-AC conversion integrity.',
          practicalTask: isHi ? '10-बिंदु रूफटॉप सुरक्षा चेकलिस्ट बनाएं।' : 'Construct a 10-point pre-installation safety checklist.',
          estimatedTime: '5–7 hours',
          demonstrableOutcome: isHi ? 'सत्यापित सुरक्षा चेकलिस्ट।' : 'A printable pre-mount inspection checklist.',
          completed: false,
        },
        {
          id: `step-${Date.now()}-3`,
          stepNumber: 3,
          skill: isHi ? 'सोलर पैनल माउंटिंग और स्ट्रक्चरल अलाइनमेंट' : 'Rooftop Rail Mounting & Tilt Angle Alignment',
          whyItMatters: isHi ? 'मौसम के अनुकूल अधिकतम धूप ग्रहण करने के लिए सही कोण ज़रूरी है।' : 'Maximizes seasonal irradiance capture and roof load distribution.',
          practicalTask: isHi ? 'अपने क्षेत्र के अक्षांश के अनुसार मौसमी झुकाव कोण का आरेख बनाएं।' : 'Calculate optimal winter and summer tilt angles for your local latitude.',
          estimatedTime: '6–8 hours',
          demonstrableOutcome: isHi ? 'माउंटिंग झुकाव आरेख।' : 'A structural mounting diagram with tilt calculations.',
          completed: false,
        },
        {
          id: `step-${Date.now()}-4`,
          stepNumber: 4,
          skill: isHi ? 'रखरखाव और ग्राहक परामर्श' : 'Preventative Maintenance & Customer Walkthroughs',
          whyItMatters: isHi ? 'नियमित सफाई और इन्वर्टर एरर कोड की पहचान ग्राहक संतुष्टि बढ़ाती है।' : 'Empowers homeowners to maintain efficiency and reduces warranty support tickets.',
          practicalTask: isHi ? 'सामान्य समस्याओं के समाधान के लिए 1 सरल ग्राहक गाइड तैयार करें।' : 'Create a troubleshooting FAQ for battery backup and dust cleaning.',
          estimatedTime: '3–5 hours',
          demonstrableOutcome: isHi ? 'ग्राहक मेंटेनेंस वन-पेजर गाइड।' : 'A customer-facing one-page care guide.',
          completed: false,
        },
      ],
    };
  }

  // Default Web Developer roadmap
  return {
    targetRole: role,
    steps: [
      {
        id: `step-${Date.now()}-1`,
        stepNumber: 1,
        skill: isHi ? 'सिमेंटिक एचटीएमएल और सुलभ फॉर्म (HTML Forms)' : 'Semantic HTML & Accessible Form Elements',
        whyItMatters: isHi ? 'वेबसाइट्स को मोबाइल और स्क्रीन रीडर पर सही ढंग से चलाने के लिए आवश्यक है।' : 'Employers need web pages that work reliably across mobile devices, screen readers, and low-bandwidth connections.',
        practicalTask: isHi ? 'उचित लेबल और सत्यापन के साथ एक 3-फील्ड संपर्क फॉर्म बनाएं।' : 'Build a mobile-first 3-field contact and service enquiry form with proper input types, labels, and validation.',
        estimatedTime: '4–6 hours',
        demonstrableOutcome: isHi ? 'सत्यापित और काम करने वाला एचटीएमएल फॉर्म कोड।' : 'A clean, validated HTML form uploaded or hosted as a live demo snippet.',
        completed: true,
      },
      {
        id: `step-${Date.now()}-2`,
        stepNumber: 2,
        skill: isHi ? 'रिस्पॉन्सिव लेआउट्स (Flexbox & CSS Grid)' : 'Responsive Flexbox & CSS Grid Layouts',
        whyItMatters: isHi ? 'स्क्रीन के आकार के अनुसार बिना टूटे सही डिज़ाइन प्रदर्शित करना।' : 'Modern entry-level developers must construct layouts that gracefully scale from 320px mobile screens to desktop browsers.',
        practicalTask: isHi ? 'एक 3-कॉलम मूल्य निर्धारण कार्ड ग्रिड बनाएं जो मोबाइल पर 1 कॉलम में बदल जाए।' : 'Create a responsive 3-column pricing card or catalog grid that collapses to a single stacked card on mobile.',
        estimatedTime: '6–8 hours',
        demonstrableOutcome: isHi ? 'मोबाइल फ्रेंडली टेस्टेड ग्रिड लेआउट।' : 'A tested layout that passes mobile viewport checks without horizontal scrolling.',
        completed: false,
      },
      {
        id: `step-${Date.now()}-3`,
        stepNumber: 3,
        skill: isHi ? 'जावास्क्रिप्ट इंटरैक्शन और डेटा फ़िल्टरिंग' : 'Basic JavaScript DOM Interaction & Fetch API',
        whyItMatters: isHi ? 'सर्च बार और फ़िल्टर बटन जैसे डायनामिक फ़ीचर्स बनाने के लिए जरूरी है।' : 'Web applications need dynamic interactivity such as filtering items, toggling modals, and fetching remote data.',
        practicalTask: isHi ? 'एक इनपुट सर्च बार बनाएं जो कार्ड्स की सूची को श्रेणी के अनुसार तुरंत फ़िल्टर करे।' : 'Write a small script that filters an array of job or product cards by category using an input search bar.',
        estimatedTime: '8–10 hours',
        demonstrableOutcome: isHi ? 'इंटरएक्टिव मिनी-सर्च कंपोनेंट।' : 'An interactive mini-search component with real-time feedback on input.',
        completed: false,
      },
      {
        id: `step-${Date.now()}-4`,
        stepNumber: 4,
        skill: isHi ? 'वर्जन कंट्रोल (Git) और लाइव डिप्लॉयमेंट' : 'Version Control (Git) & Live Deployment',
        whyItMatters: isHi ? 'टीम वर्क और अपने प्रोजेक्ट का लाइव लिंक नियोक्ताओं को दिखाने के लिए आवश्यक।' : 'Demonstrates professional team readiness. Employers want to see your code repository and a working live link.',
        practicalTask: isHi ? 'अपने प्रोजेक्ट को GitHub पर पुश करें और लाइव होस्टिंग लिंक बनाएं।' : 'Commit your project to GitHub or code sandbox and publish it using GitHub Pages or Vercel.',
        estimatedTime: '3–4 hours',
        demonstrableOutcome: isHi ? 'पब्लिक GitHub लिंक और लाइव डेमो यूआरएल।' : 'A public GitHub repo link and live demo URL attached to your KaamSetu portfolio.',
        completed: false,
      },
    ],
  };
}

// Development Vite Middleware setup or Production Static Server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KaamSetu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
