import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_OPPORTUNITIES } from './src/data/sampleData';
import { promises as fs } from 'node:fs';


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


app.get('/api/opportunities', (req: Request, res: Response) => {
  const { search, type, location } = req.query;

  let results = INITIAL_OPPORTUNITIES;

  if (typeof search === 'string' && search.trim()) {
    const query = search.trim().toLowerCase();

    results = results.filter((opp) =>
      opp.title.toLowerCase().includes(query) ||
      opp.organization.toLowerCase().includes(query) ||
      opp.skillsRequired.some((skill) =>
        skill.toLowerCase().includes(query)
      )
    );
  }

  if (typeof type === 'string' && type !== 'all') {
    results = results.filter((opp) => opp.type === type);
  }

  if (typeof location === 'string' && location.trim()) {
    const query = location.trim().toLowerCase();

    results = results.filter((opp) =>
      opp.location.toLowerCase().includes(query) ||
      (query === 'remote' && opp.workMode === 'remote')
    );
  }

  res.json({
    success: true,
    count: results.length,
    opportunities: results,
  });
});


type DemoApplication = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  applicantName: string;
  notes: string;
  status: 'submitted';
  appliedAt: string;
};

// Temporary demo storage — resets when server restarts.

const APPLICATIONS_FILE = path.join(process.cwd(), 'demo-applications.json');

let demoApplications: DemoApplication[] = [];

async function loadApplications() {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    const parsed = JSON.parse(data);

    demoApplications = Array.isArray(parsed) ? parsed : [];
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to load applications:', error);
    }
  }
}

async function saveApplications() {
  await fs.writeFile(
    APPLICATIONS_FILE,
    JSON.stringify(demoApplications, null, 2),
    'utf8'
  );
}

await loadApplications();


// Retrieve submitted demo applications
app.get('/api/applications', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: demoApplications.length,
    applications: demoApplications,
  });
});

// Submit a demo application
app.post('/api/applications', async (req: Request, res: Response) => {
  const { opportunityId, applicantName, notes } = req.body ?? {};

  if (
    typeof opportunityId !== 'string' ||
    typeof applicantName !== 'string' ||
    !opportunityId.trim() ||
    !applicantName.trim()
  ) {
    return res.status(400).json({
      success: false,
      error: 'Opportunity ID and applicant name are required.',
    });
  }

  const opportunity = INITIAL_OPPORTUNITIES.find(
    (opp) => opp.id === opportunityId
  );

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      error: 'Opportunity not found.',
    });
  }

  if (demoApplications.some(
    (app) =>
      app.opportunityId === opportunityId &&
      app.applicantName.toLowerCase() === applicantName.trim().toLowerCase()
  )) {
    return res.status(409).json({
      success: false,
      error: 'Demo application already submitted for this opportunity.',
    });
  }

  const application: DemoApplication = {
    id: `app-${Date.now()}`,
    opportunityId,
    opportunityTitle: opportunity.title,
    organization: opportunity.organization,
    applicantName: applicantName.trim(),
    notes: typeof notes === 'string' ? notes.trim() : '',
    status: 'submitted',
    appliedAt: new Date().toISOString(),
  };

  demoApplications.push(application);
  
  try {
    await saveApplications();
  } catch (error) {
    console.error('Failed to save application:', error);
    return res.status(500).json({
      success: false,
      error: 'Could not save application.',
    });
  }


  return res.status(201).json({
    success: true,
    message: 'Demo application submitted successfully.',
    application,
  });
});


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
      let prompt = '';
      const langInstruction =
        language === 'hi'
          ? 'Respond clearly in conversational, warm, and helpful Hindi (Devanagari script), keeping technical industry terms recognizable (e.g. JavaScript, Solar Inverter, Inventory).'
          : 'Respond in clear, accessible, empowering English without corporate jargon.';

      switch (action) {
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

        case 'skill_gap':
          prompt = `You are KaamSetu's skill advisor. ${langInstruction}
Compare the user's current skills against the target opportunity requirements:
User Current Skills: ${payload?.userSkills?.join(', ') || 'None provided'}
Opportunity Title: ${payload?.title || 'Role'}
Required Skills: ${payload?.requiredSkills?.join(', ') || ''}

Provide:
1. Matching strengths the user already has.
2. Missing or high-priority skills to build.
3. Why each missing skill matters practically.
4. A 14-day hands-on study & practice recommendation.`;
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

        case 'career_plan':
          prompt = `You are KaamSetu's career roadmap planner. ${langInstruction}
Create a realistic 30-day step-by-step career plan for a user aiming to achieve: "${payload?.goal || 'Find a job or internship'}".
User Skills: ${payload?.skills?.join(', ') || 'Starter'}
Available Hours/Week: ${payload?.availability || '10-15 hours'}
Location Type: ${payload?.location || 'Tier-2/3 City / Local area'}

Format the plan with 4 weekly milestones (Week 1, Week 2, Week 3, Week 4) with 2 practical actions each week and 1 demonstrable project idea.`;
          break;

        case 'mentor_chat':
          prompt = `You are KaamSetu's AI Career Companion - a supportive, realistic, and practical mentor for students, informal sector workers, and local small business owners in India. ${langInstruction}
User Question: "${payload?.question || ''}"
User Context: Target goal: ${payload?.goal || 'Career advancement'}, Current Skills: ${payload?.skills?.join(', ') || 'Not specified'}.

Answer clearly, practically, with empathy and actionable steps. Never fabricate qualifications or guarantee placement.`;
          break;

        default:
          prompt = `Provide helpful, realistic career guidance on: ${JSON.stringify(payload)}. ${langInstruction}`;
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 9000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response?.text || '';
      return res.json({
        success: true,
        source: 'gemini',
        content: responseText,
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
    content: fallback,
  });
});

// Deterministic guidance generator for robust offline & keyless execution
function generateDeterministicCareerGuidance(
  action: string,
  payload: any,
  language: string = 'en'
): string {
  const isHi = language === 'hi';

  if (action === 'simplify_job') {
    const title = payload?.title || 'This role';
    const org = payload?.organization || 'Partner Organisation';
    const mode = payload?.workMode || 'Flexible';
    const stipend = payload?.stipend || 'Competitive stipend/wages';

    if (isHi) {
      return `### 📌 काम का सरल विवरण: ${title} (${org})

**1. रोज़ाना आपको क्या करना होगा:**
• टीम के साथ मिलकर दैनिक कार्यों की योजना बनाना और काम पूरा करना।
• ग्राहक या सहकर्मियों के सवालों का समय पर और स्पष्ट उत्तर देना।
• काम की प्रगति को डिजिटल शीट या ऐप में सुरक्षित दर्ज करना।

**2. आवश्यक मूलभूत कौशल:**
• सीखने की तत्परता और समय की पाबंदी।
• बातचीत में स्पष्टता और बुनियादी डिजिटल समझ।
• कार्यप्रणाली: ${mode} | पारिश्रमिक: ${stipend}।

**3. आवेदन से पहले तैयारी:**
• अपने पिछले अनुभवों (प्रोजेक्ट, स्वयंसेवा या स्थानीय काम) का 1 संक्षिप्त विवरण तैयार करें।
• साक्षात्कार के लिए 2-3 उदाहरण सोचें जहां आपने समस्या का व्यावहारिक हल निकाला हो।`;
    }

    return `### 📌 Plain-Language Breakdown: ${title} at ${org}

**1. What you will actually do day-to-day:**
• Coordinate with team leads to complete allocated daily tasks on schedule.
• Communicate clearly with customers, team members, or field partners.
• Maintain organized notes, basic digital records, or spreadsheets.

**2. Core skills you really need:**
• Dependability, clear communication, and willingness to learn on the job.
• Basic familiarity with relevant tools and working mode (${mode}).
• Compensation structure: ${stipend}.

**3. How to prepare before applying:**
• Review 1-2 examples from your studies, freelance tasks, or community work.
• Practice explaining a challenge you solved practically and honestly.`;
  }

  if (action === 'skill_gap') {
    const userSkills = payload?.userSkills || [];
    const requiredSkills = payload?.requiredSkills || ['Communication', 'Digital Tools', 'Problem Solving'];
    const missing = requiredSkills.filter((s: string) => !userSkills.includes(s));

    if (isHi) {
      return `### 🎯 कौशल मिलान और मार्गदर्शन (Skill Gap Analysis)

• **आपके पास पहले से मौजूद मजबूत कौशल:** ${userSkills.length > 0 ? userSkills.join(', ') : 'शुरुआती स्तर की तत्परता'}
• **सीखने योग्य महत्वपूर्ण कौशल:** ${missing.length > 0 ? missing.join(', ') : 'आपकी प्रोफ़ाइल इस भूमिका के लिए काफी संतुलित है!'}

**यह कौशल क्यों ज़रूरी हैं?**
उद्योग में व्यावहारिक काम के लिए इन उपकरणों की रोज़मर्रा आवश्यकता होती है। जब आप इनका छोटा प्रोजेक्ट बनाकर दिखाते हैं, तो नियोक्ता का भरोसा बढ़ता है।

**14 दिनों का अभ्यास प्लान:**
• दिन 1-5: बुनियादी कॉन्सेप्ट और फ्री ट्यूटोरियल देखें।
• दिन 6-10: एक छोटा व्यावहारिक प्रोजेक्ट (जैसे स्प्रेडशीट बजट या मिनी प्रोटोटाइप) बनाएं।
• दिन 11-14: अपने प्रोजेक्ट को KaamSetu पोर्टफोलियो में दर्ज करें और आवेदन करें।`;
    }

    return `### 🎯 Skill Match & Bridge Roadmap

• **Your Existing Strengths:** ${userSkills.length > 0 ? userSkills.join(', ') : 'Willingness to learn and foundational readiness'}
• **High-Yield Skills to Build:** ${missing.length > 0 ? missing.join(', ') : 'Your skills closely match the baseline requirements for this role!'}

**Why these skills matter:**
Practical roles value demonstrable evidence over theoretical credentials. Building 1-2 concrete micro-projects gives employers proof of your capability.

**Recommended 14-Day Action Path:**
• Days 1–5: Cover fundamentals using interactive tutorials and documentation.
• Days 6–10: Build a sample deliverable (mini-app, process sheet, or workflow demo).
• Days 11–14: Attach your completed work to your KaamSetu portfolio and apply with confidence.`;
  }

  if (action === 'resume_summary') {
    const name = payload?.name || 'Aspirant';
    const skills = payload?.skills?.length ? payload.skills.slice(0, 4).join(', ') : 'problem-solving and digital communication';
    const goal = payload?.goal || 'contributing meaningfully to growing organizations';

    if (isHi) {
      return `सक्रिय और लक्ष्य-उन्मुख पेशेवर, जो ${skills} में व्यावहारिक समझ रखते हैं। ${goal} के प्रति समर्पित और टीम में वास्तविक योगदान देने के लिए निरंतर नए कौशल सीखने के लिए तत्पर।`;
    }

    return `Driven and detail-oriented candidate with demonstrable competence in ${skills}. Motivated by ${goal}, bringing a reliable work ethic, quick adaptability to modern workflows, and a commitment to measurable team results.`;
  }

  if (action === 'career_plan') {
    const goal = payload?.goal || 'Securing an opportunity';
    if (isHi) {
      return `### 📅 30-दिवसीय व्यावहारिक करियर रोडमैप (${goal})

**सप्ताह 1: मूलभूत तैयारी और प्रोफ़ाइल मजबूती**
• अपने मुख्य कौशलों की सूची बनाएं और KaamSetu पर 1 स्किल चैलेंज पूरा करें।
• अपना रिज्यूमे सारांश तैयार करें और संपर्क जानकारी अपडेट करें।

**सप्ताह 2: व्यावहारिक प्रोजेक्ट निर्माण**
• अपने चुने हुए क्षेत्र में 1 छोटा प्रोजेक्ट पूरा करें (जैसे केस स्टडी या सैंपल वर्क)।
• प्रोजेक्ट को अपने पोर्टफोलियो में जोड़ें।

**सप्ताह 3: लक्षित खोज और आवेदन**
• कम से कम 3 उपयुक्त अवसर (इंटर्नशिप, लोकल काम या एंट्री जॉब) शॉर्टलिस्ट करें।
• प्रत्येक अवसर की ज़रूरतों के अनुसार आवेदन नोट कस्टमाइज़ करके सबमिट करें।

**सप्ताह 4: फॉलो-अप और निरंतर अभ्यास**
• आवेदन की स्थिति ट्रैक करें और इंटरव्यू के 5 बुनियादी सवालों की तैयारी करें।
• अगले उन्नत कौशल को सीखने के लिए 30 मिनट दैनिक समय निर्धारित करें।`;
    }

    return `### 📅 Realistic 30-Day Action Roadmap (${goal})

**Week 1: Core Foundation & Readiness**
• Validate your baseline skills and complete 1 SkillBridge challenge.
• Refine your personal summary to reflect real projects and practical strengths.

**Week 2: Evidence & Portfolio Building**
• Create 1 small, tangible project deliverable demonstrating your primary skill.
• Document your workflow and upload proof to your KaamSetu showcase.

**Week 3: Targeted Applications**
• Shortlist 3 high-fit opportunities with matching requirements and constraints.
• Submit demo applications with tailored problem-solving notes.

**Week 4: Follow-Through & Continuous Growth**
• Track your application pipeline and rehearse simple situational questions.
• Dedicate 45 minutes daily to your next level skill milestone.`;
  }

  // Mentor Chat fallback
  if (isHi) {
    return `नमस्ते! आपके प्रश्न के संदर्भ में: निरंतर छोटे और सुसंगत कदम उठाना सबसे अधिक प्रभावी होता है। सबसे पहले अपने बुनियादी मजबूत कौशलों की पहचान करें, KaamSetu के स्किलब्रिज में एक छोटा अभ्यास कार्य पूरा करें, और फिर स्थानीय या रिमोट अवसरों में आवेदन करें। यदि किसी विशेष विषय पर मदद चाहिए, तो बेझिझक पूछें!`;
  }

  return `Great question! The most sustainable career path begins with focusing on 1-2 demonstrable skills where you can show practical output. Complete a SkillBridge micro-challenge to add evidence to your profile, explore matched listings with practical filters (like flexible hours or training provided), and submit steady applications. Feel free to ask more specific questions about roles, interviews, or local business outreach!`;
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
