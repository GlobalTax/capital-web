
export function determineTargetAccount(orgData: any): boolean {
  let score = 0;

  // Industry scoring
  const targetIndustries = ['Technology', 'Software', 'FinTech', 'SaaS', 'Healthcare', 'Financial Services'];
  if (orgData.industry && targetIndustries.some(industry => 
    orgData.industry.toLowerCase().includes(industry.toLowerCase())
  )) {
    score += 30;
  }

  // Employee count scoring
  if (orgData.estimated_num_employees) {
    if (orgData.estimated_num_employees >= 100) score += 40;
    else if (orgData.estimated_num_employees >= 50) score += 25;
    else if (orgData.estimated_num_employees >= 20) score += 15;
  }

  // Revenue scoring
  if (orgData.annual_revenue) {
    if (orgData.annual_revenue >= 50000000) score += 30; // $50M+
    else if (orgData.annual_revenue >= 10000000) score += 20; // $10M+
    else if (orgData.annual_revenue >= 5000000) score += 10; // $5M+
  }

  // Technology stack scoring
  if (orgData.technology_names && orgData.technology_names.length > 0) {
    const modernTech = ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Salesforce', 'HubSpot'];
    const techMatches = orgData.technology_names.filter((tech: string) => 
      modernTech.some(modern => tech.toLowerCase().includes(modern.toLowerCase()))
    ).length;
    score += techMatches * 5;
  }

  // Funding indicators
  if (orgData.total_funding && orgData.total_funding > 1000000) {
    score += 20; // Has received significant funding
  }

  return score >= 60; // Target account if score >= 60
}

export function processCompanyData(companyDomain: string, orgData: any) {
  return {
    company_domain: companyDomain,
    company_name: orgData.name,
    employee_count: orgData.estimated_num_employees,
    industry: orgData.industry,
    revenue_range: orgData.annual_revenue ? `$${(orgData.annual_revenue / 1000000).toFixed(1)}M` : null,
    location: [orgData.organization_city, orgData.organization_state, orgData.organization_country]
      .filter(Boolean).join(', '),
    founded_year: orgData.founded_year,
    technologies: orgData.technology_names || [],
    apollo_id: orgData.id,
    is_target_account: determineTargetAccount(orgData),
    last_enriched: new Date().toISOString(),
    contacts_count: orgData.num_contacts || 0
  };
}

export function logHighValueTarget(orgData: any, companyData: any) {
  if (companyData.is_target_account && orgData.estimated_num_employees && orgData.estimated_num_employees > 100) {
    console.log(`🔥 HIGH VALUE TARGET ACCOUNT: ${orgData.name}`);
    console.log(`   Industry: ${orgData.industry}`);
    console.log(`   Employees: ${orgData.estimated_num_employees}`);
    console.log(`   Revenue: ${companyData.revenue_range}`);
    console.log(`   Technologies: ${orgData.technology_names?.join(', ')}`);
  }
}
