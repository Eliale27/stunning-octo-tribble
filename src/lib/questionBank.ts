import type { MockCategory, QuestionType } from './types'

export interface BankQuestion { q: string; type: QuestionType }

export const QUESTION_BANK: Record<Exclude<MockCategory, 'mixed'>, BankQuestion[]> = {
  behavioral: [
    { q: 'Tell me about a time you solved a difficult problem at work.', type: 'problem-solving' },
    { q: 'Describe a situation where you had a conflict with a colleague. How did you handle it?', type: 'behavioral' },
    { q: 'Tell me about a time you made a mistake. What did you learn?', type: 'behavioral' },
    { q: 'Give me an example of when you had to work under a tight deadline.', type: 'situational' },
    { q: 'Tell me about a time you had to learn something new quickly.', type: 'behavioral' },
    { q: 'Describe a project you are most proud of and your role in it.', type: 'experience' },
    { q: 'How do you deal with repetitive tasks?', type: 'behavioral' },
    { q: 'Tell me about a time you went above and beyond for a customer or stakeholder.', type: 'behavioral' },
    { q: 'How do you prioritize when everything seems urgent?', type: 'situational' },
    { q: 'Tell me about a time you disagreed with a decision from your manager.', type: 'communication' },
  ],
  technical: [
    { q: 'Walk me through the tools and technologies you use most in your daily work and why.', type: 'technical' },
    { q: 'How do you make sure the quality of your work is consistently high?', type: 'technical' },
    { q: 'Describe a technical problem you debugged recently. What was your process?', type: 'problem-solving' },
    { q: 'How would you explain a complex technical concept to a non-technical stakeholder?', type: 'communication' },
    { q: 'What do you do when you are stuck on a problem and no one is available to help?', type: 'situational' },
    { q: 'How do you keep your skills up to date?', type: 'technical' },
    { q: 'Tell me about a process you improved or automated.', type: 'experience' },
    { q: 'What trade-offs did you have to make in your most recent project?', type: 'technical' },
  ],
  hr: [
    { q: 'Tell me about yourself.', type: 'tell-me-about-yourself' },
    { q: 'Why are you interested in this position?', type: 'motivation' },
    { q: 'Why do you want to work for our company?', type: 'motivation' },
    { q: 'What are your salary expectations?', type: 'salary' },
    { q: 'When would you be available to start, and what time zone do you work in?', type: 'availability' },
    { q: 'How do you organize your day when working remotely?', type: 'culture-fit' },
    { q: 'What are your strengths and weaknesses?', type: 'behavioral' },
    { q: 'Where do you see yourself in three years?', type: 'motivation' },
    { q: 'Why are you leaving your current role?', type: 'motivation' },
  ],
  'hiring-manager': [
    { q: 'What would you focus on in your first 30 days in this role?', type: 'situational' },
    { q: 'Which of your past experiences is most similar to what this role requires?', type: 'experience' },
    { q: 'How do you handle feedback from your manager?', type: 'communication' },
    { q: 'Tell me about a time you led a project or initiative without formal authority.', type: 'leadership' },
    { q: 'How do you communicate progress and blockers to a distributed team?', type: 'communication' },
    { q: 'What would make you say no to a task, and how would you communicate it?', type: 'situational' },
    { q: 'What questions do you have for me about the team or the role?', type: 'other' },
  ],
  english: [
    { q: 'Could you describe your current role and main responsibilities?', type: 'language' },
    { q: 'What has been the most rewarding part of your career so far, and why?', type: 'language' },
    { q: 'How would you describe your working style to a new teammate?', type: 'language' },
    { q: 'Tell me about a professional goal you achieved recently.', type: 'language' },
    { q: 'What do you enjoy most about working with international teams?', type: 'language' },
    { q: 'Explain a process from your job as if I knew nothing about it.', type: 'language' },
    { q: 'How do you handle misunderstandings when communicating in English at work?', type: 'language' },
  ],
}

const RULES: { type: QuestionType; re: RegExp }[] = [
  { type: 'tell-me-about-yourself', re: /tell me about yourself|introduce yourself|walk me through your (background|resume|cv)|about you\b/i },
  { type: 'salary', re: /salary|compensation|pay|rate|expect.*(earn|per hour|per month)|budget for this role/i },
  { type: 'availability', re: /available|availability|start date|when can you start|notice period|time ?zone|hours per week|schedule/i },
  { type: 'motivation', re: /why (do you|are you|would you)|why this|why us|why our|interested in this|what attracts|motivat|where do you see yourself|career goals|leaving your/i },
  { type: 'leadership', re: /lead|leadership|mentor|manage(d)? (a|the) team|delegat|influence/i },
  { type: 'culture-fit', re: /culture|values|working style|remote|work from home|team environment|fit in|collaborat/i },
  { type: 'communication', re: /communicat|explain .* to|present|feedback|disagree|stakeholder|non-technical/i },
  { type: 'problem-solving', re: /difficult problem|solve|debug|troubleshoot|challenge you faced|obstacle|complex problem/i },
  { type: 'situational', re: /what would you do|how would you (handle|approach|deal)|imagine|if you (were|had)|suppose|scenario|deadline|prioriti/i },
  { type: 'behavioral', re: /tell me about a time|describe a (time|situation)|give (me )?an example|have you ever|how do you (deal|handle|manage|cope)|mistake|conflict|strength|weakness|repetitive/i },
  { type: 'technical', re: /technical|tool|technolog|framework|code|sql|excel|architecture|algorithm|api|database|how does .* work|difference between|process you use|quality/i },
  { type: 'experience', re: /experience|previous role|past (job|role|work)|project you|worked on|responsib|proud of|similar to/i },
  { type: 'language', re: /in english|describe|explain a process|your english|fluent/i },
]

export function classifyQuestion(q: string): QuestionType {
  for (const r of RULES) if (r.re.test(q)) return r.type
  return 'other'
}

export const EVALUATING: Record<QuestionType, string[]> = {
  'tell-me-about-yourself': ['Relevance of background', 'Structure and focus', 'Communication clarity', 'Fit with the role'],
  behavioral: ['Past behavior as predictor', 'Self-awareness', 'Ownership', 'Specificity of examples'],
  technical: ['Depth of knowledge', 'Practical application', 'Problem-solving approach', 'Clarity of explanation'],
  situational: ['Judgment', 'Prioritization', 'Decision-making under pressure', 'Communication'],
  experience: ['Relevance to the role', 'Impact and results', 'Role clarity', 'Tools and methods used'],
  motivation: ['Genuine interest', 'Company knowledge', 'Career alignment', 'Retention risk'],
  salary: ['Market awareness', 'Flexibility', 'Confidence', 'Alignment with budget'],
  availability: ['Logistics and time zone', 'Commitment', 'Reliability'],
  'culture-fit': ['Values alignment', 'Remote work habits', 'Collaboration style', 'Adaptability'],
  'problem-solving': ['Analytical thinking', 'Resourcefulness', 'Persistence', 'Results'],
  leadership: ['Influence', 'Accountability', 'Team development', 'Decision-making'],
  communication: ['Clarity', 'Empathy', 'Handling disagreement', 'Stakeholder awareness'],
  language: ['Fluency', 'Vocabulary', 'Grammar', 'Naturalness'],
  other: ['Relevance', 'Clarity', 'Confidence'],
}

export const INTENT: Record<QuestionType, string> = {
  'tell-me-about-yourself': 'The interviewer wants a focused 60–90 second narrative that connects your background to this role, not your life story.',
  behavioral: 'The interviewer wants a concrete past example that proves how you actually behave, with a clear outcome.',
  technical: 'The interviewer is checking whether you truly understand and have applied the skill, and how you reason about it.',
  situational: 'The interviewer wants to see your judgment and priorities in a realistic scenario for this role.',
  experience: 'The interviewer is mapping your past work to the responsibilities of this position.',
  motivation: 'The interviewer wants to know whether you understand the company and role and whether you are likely to stay and thrive.',
  salary: 'The interviewer is checking alignment with the budget and how you handle a negotiation conversation.',
  availability: 'The interviewer is confirming logistics: start date, hours, time zone overlap and commitment.',
  'culture-fit': 'The interviewer wants evidence that you work well the way this team works, especially remotely.',
  'problem-solving': 'The interviewer wants to see how you think when things are hard: process, persistence and outcome.',
  leadership: 'The interviewer wants to know how you influence others and take ownership, with or without a title.',
  communication: 'The interviewer is evaluating how clearly and diplomatically you communicate, especially under disagreement.',
  language: 'The interviewer is assessing your professional English: fluency, vocabulary and naturalness.',
  other: 'The interviewer is looking for a clear, relevant and confident answer connected to the role.',
}

export const FOLLOW_UPS: Record<QuestionType, string[]> = {
  'tell-me-about-yourself': ['Why are you looking for a new role now?', 'Which part of your experience is most relevant to this role?', 'What are you looking for in your next position?', 'What would your last manager say about you?'],
  behavioral: ['What tools or methods did you use?', 'What was the biggest challenge?', 'What was the result?', 'What would you do differently today?'],
  technical: ['Can you give a concrete example from a real project?', 'What are the limitations of that approach?', 'How did you validate that it worked?', 'How would you scale it?'],
  situational: ['What if the deadline could not move?', 'How would you communicate that to the stakeholder?', 'Has something similar happened to you before?', 'What would you do if the plan failed?'],
  experience: ['What was your specific contribution?', 'What did you learn from it?', 'What metrics did you track?', 'Who did you work with?'],
  motivation: ['What do you know about our product?', 'What other companies are you interviewing with?', 'What would make you leave a job?', 'Where do you want to be in three years?'],
  salary: ['Is that number flexible?', 'What is your current compensation?', 'Would you consider a lower base with a bonus?', 'When would you be able to start?'],
  availability: ['How many hours of overlap can you offer with our time zone?', 'Do you have other commitments?', 'How do you manage your schedule remotely?', 'When could you start?'],
  'culture-fit': ['How do you handle async communication?', 'Describe your ideal manager.', 'How do you stay motivated working remotely?', 'What kind of team environment do you avoid?'],
  'problem-solving': ['How did you identify the root cause?', 'What alternatives did you consider?', 'How long did it take?', 'What was the impact?'],
  leadership: ['How did you handle resistance?', 'How did you measure success?', 'What would you do differently?', 'How do you develop people?'],
  communication: ['How did the other person react?', 'How do you adapt your message to different audiences?', 'Give an example of a misunderstanding you resolved.', 'How do you give difficult feedback?'],
  language: ['Could you elaborate on that?', 'How would you describe that to a client?', 'What would you improve about your English?', 'Can you summarize that in one sentence?'],
  other: ['Can you give an example?', 'Why is that important to you?', 'How does that relate to this role?', 'What did you learn?'],
}
