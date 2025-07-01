
import { ApolloContactsResponse } from './types.ts';

export function isDecisionMaker(seniority: string, title: string): boolean {
  const decisionMakerSeniorities = ['c_suite', 'founder', 'owner', 'vp', 'director'];
  const decisionMakerTitles = ['ceo', 'cto', 'cfo', 'cmo', 'founder', 'owner', 'president', 'director', 'vp', 'vice president'];
  
  if (seniority && decisionMakerSeniorities.includes(seniority.toLowerCase())) {
    return true;
  }
  
  if (title) {
    const lowerTitle = title.toLowerCase();
    return decisionMakerTitles.some(dmTitle => lowerTitle.includes(dmTitle));
  }
  
  return false;
}

export function calculateContactScore(person: any): number {
  let score = 0;
  
  // Seniority scoring
  const seniorityScores: Record<string, number> = {
    'c_suite': 100,
    'founder': 100,
    'owner': 100,
    'vp': 80,
    'director': 70,
    'senior': 50,
    'manager': 30,
    'individual': 10
  };
  
  if (person.seniority && seniorityScores[person.seniority]) {
    score += seniorityScores[person.seniority];
  }
  
  // Email availability
  if (person.email && person.extrapolated_email_confidence > 0.7) {
    score += 20;
  }
  
  // LinkedIn presence
  if (person.linkedin_url) {
    score += 10;
  }
  
  // Phone availability  
  if (person.phone_numbers && person.phone_numbers.length > 0) {
    score += 15;
  }
  
  return Math.min(score, 100); // Cap at 100
}

export function processContactsData(contactsData: ApolloContactsResponse, companyRecord: any, company_domain: string) {
  if (!contactsData.people || contactsData.people.length === 0) {
    return [];
  }

  return contactsData.people.map(person => ({
    apollo_person_id: person.id,
    company_id: companyRecord?.id,
    company_domain,
    first_name: person.first_name,
    last_name: person.last_name,
    full_name: person.name,
    email: person.email,
    phone: person.phone_numbers?.[0]?.sanitized_number,
    linkedin_url: person.linkedin_url,
    title: person.title,
    seniority: person.seniority,
    department: person.departments?.[0],
    is_decision_maker: isDecisionMaker(person.seniority, person.title),
    contact_score: calculateContactScore(person),
    apollo_data: person,
    last_enriched: new Date().toISOString()
  }));
}
