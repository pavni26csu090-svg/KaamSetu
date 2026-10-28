export type UserGoal =
  | 'internship_job'
  | 'build_skills'
  | 'local_work'
  | 'grow_business';

export type Language = 'en' | 'hi';

export interface UserAccessibility {
  simplifiedLanguage: boolean;
  lowBandwidth: boolean;
  highContrast: boolean;
  voiceFriendly: boolean;
}

export interface UserProfile {
  name: string;
  emailOrPhone: string;
  goals: UserGoal[];
  skills: string[];
  interests: string[];
  language: Language;
  location: string;
  availability: 'full_time' | 'part_time' | 'weekend' | 'flexible_shifts';
  accessibility: UserAccessibility;
  bio: string;
  educationLevel: string;
  portfolioUrl?: string;
}

export type OpportunityType =
  | 'internship'
  | 'entry_level'
  | 'apprenticeship'
  | 'freelance'
  | 'local_work';

export type WorkMode = 'remote' | 'on_site' | 'hybrid';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  workMode: WorkMode;
  location: string;
  stipend: string;
  schedule: string;
  skillsRequired: string[];
  requirements: string[];
  description: string;
  practicalConstraints: {
    noDegreeRequired?: boolean;
    equipmentProvided?: boolean;
    flexibleHours?: boolean;
    vernacularFriendly?: boolean;
    mentorAssigned?: boolean;
    womenInclusive?: boolean;
  };
  postedDate: string;
  vacancies: number;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  appliedAt: string;
  status: 'submitted' | 'under_review' | 'interview_practice' | 'offer_received';
  notes: string;
  portfolioLink?: string;
}

export interface PracticalChallenge {
  id: string;
  title: string;
  scenario: string;
  task: string;
  starterHint: string;
  rubric: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'digital' | 'vocational' | 'business' | 'creative' | 'operations';
  level: 'beginner' | 'intermediate' | 'advanced';
  whyItMatters: {
    en: string;
    hi: string;
  };
  learningRoadmap: {
    step: number;
    milestone: string;
    estHours: string;
    resourceTip: string;
  }[];
  challenge: PracticalChallenge;
  completed?: boolean;
  completionDate?: string;
  evidenceNotes?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  skillsUsed: string[];
  proofUrlOrText: string;
}

export interface BusinessService {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
}

export interface BusinessListing {
  id: string;
  title: string;
  type: string;
  duration: string;
  stipend: string;
  description: string;
  status: 'open' | 'closed';
  applicantCount: number;
}

export interface BusinessEnquiry {
  id: string;
  customerName: string;
  customerContact: string;
  serviceInterested: string;
  message: string;
  receivedAt: string;
  status: 'unread' | 'replied';
  replyNote?: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  category: string;
  tagline: string;
  story: string;
  location: string;
  phone: string;
  services: BusinessService[];
  listings: BusinessListing[];
  enquiries: BusinessEnquiry[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description?: string;
}
