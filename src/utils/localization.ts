import { Opportunity, SkillItem, Language } from '../types';

/**
 * Returns localized opportunity fields depending on active language.
 */
export function getLocalizedOpp(opp: Opportunity, lang: Language) {
  const isHi = lang === 'hi';
  return {
    ...opp,
    title: (isHi && opp.titleHi) ? opp.titleHi : opp.title,
    organization: (isHi && opp.organizationHi) ? opp.organizationHi : opp.organization,
    categoryName: (isHi && opp.categoryHi) ? opp.categoryHi : opp.category,
    location: (isHi && opp.locationHi) ? opp.locationHi : opp.location,
    stipend: (isHi && opp.stipendHi) ? opp.stipendHi : opp.stipend,
    schedule: (isHi && opp.scheduleHi) ? opp.scheduleHi : opp.schedule,
    description: (isHi && opp.descriptionHi) ? opp.descriptionHi : opp.description,
    postedDate: (isHi && opp.postedDateHi) ? opp.postedDateHi : opp.postedDate,
    requirements: (isHi && opp.requirementsHi && opp.requirementsHi.length > 0)
      ? opp.requirementsHi
      : opp.requirements,
    skillsRequired: (isHi && opp.skillsRequiredHi && opp.skillsRequiredHi.length > 0)
      ? opp.skillsRequiredHi
      : opp.skillsRequired,
  };
}

/**
 * Returns localized skill item fields depending on active language.
 */
export function getLocalizedSkill(skill: SkillItem, lang: Language) {
  const isHi = lang === 'hi';
  return {
    ...skill,
    name: (isHi && skill.nameHi) ? skill.nameHi : skill.name,
    whyItMattersText: isHi ? skill.whyItMatters.hi : skill.whyItMatters.en,
    learningRoadmap: skill.learningRoadmap.map((item) => ({
      ...item,
      milestone: (isHi && item.milestoneHi) ? item.milestoneHi : item.milestone,
      resourceTip: (isHi && item.resourceTipHi) ? item.resourceTipHi : item.resourceTip,
    })),
    challenge: {
      ...skill.challenge,
      title: (isHi && skill.challenge.titleHi) ? skill.challenge.titleHi : skill.challenge.title,
      scenario: (isHi && skill.challenge.scenarioHi) ? skill.challenge.scenarioHi : skill.challenge.scenario,
      task: (isHi && skill.challenge.taskHi) ? skill.challenge.taskHi : skill.challenge.task,
      starterHint: (isHi && skill.challenge.starterHintHi) ? skill.challenge.starterHintHi : skill.challenge.starterHint,
      rubric: (isHi && skill.challenge.rubricHi && skill.challenge.rubricHi.length > 0)
        ? skill.challenge.rubricHi
        : skill.challenge.rubric,
    },
  };
}
