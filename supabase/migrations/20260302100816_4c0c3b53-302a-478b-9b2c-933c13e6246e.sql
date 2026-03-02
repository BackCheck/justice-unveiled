
-- Populate key entity profiles with influence scores, categories, role_tags, and descriptions

-- Danish Farrukh Thanvi - Primary protagonist
UPDATE extracted_entities SET 
  category = 'protagonist',
  influence_score = 95,
  role_tags = ARRAY['accused', 'victim', 'executive'],
  description = 'CEO of Background Check Group (BCG), primary target of a coordinated harassment campaign involving false FIRs, illegal raids, and business sabotage. Fully acquitted in May 2025 after the court applied the Falsus in Uno doctrine.',
  position_title = 'CEO',
  organization_affiliation = 'Background Check Group (BCG)'
WHERE name ILIKE '%Danish%Thanvi%' OR name ILIKE '%Danish Farukh%' OR name = 'Danish Thanvi';

-- Syeda Mehwish Ali / Mehwish Mumtaz - Neutral
UPDATE extracted_entities SET 
  category = 'neutral',
  influence_score = 60,
  role_tags = ARRAY['witness', 'victim', 'employee'],
  description = 'Former General Manager at BCG and daughter of Major Mumtaz. Initially an employee who became caught between her employer and family. Victim of domestic violence by husband Tayyab Ali Shah.',
  position_title = 'Former General Manager',
  organization_affiliation = 'Background Check Group (BCG)'
WHERE name ILIKE '%Mehwish%' AND name NOT ILIKE '%Col%' AND name NOT ILIKE '%Saqib%' AND entity_type = 'Person';

-- Major (R) Mumtaz Hussain Shah - Primary antagonist
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 85,
  role_tags = ARRAY['complainant', 'facilitator'],
  description = 'Father of Mehwish Ali and primary complainant. Filed multiple false FIRs against Danish Thanvi. Admitted in court to lacking evidence for key allegations. Used military connections to orchestrate harassment.',
  position_title = 'Major (Retd)',
  organization_affiliation = 'Pakistan Army (Retired)'
WHERE name ILIKE '%Mumtaz%Shah%' AND name NOT ILIKE '%Saqib%' AND entity_type = 'Person';

-- Also update Mumtaz Hussain without Shah
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 85,
  role_tags = ARRAY['complainant', 'facilitator'],
  description = 'Father of Mehwish Ali and primary complainant. Filed multiple false FIRs against Danish Thanvi.',
  position_title = 'Major (Retd)',
  organization_affiliation = 'Pakistan Army (Retired)'
WHERE name ILIKE '%Mumtaz Hussain%' AND name NOT ILIKE '%Saqib%' AND entity_type = 'Person';

-- Lt. Col. (R) Saqib Mumtaz - Antagonist
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 80,
  role_tags = ARRAY['facilitator', 'intermediary', 'person_of_interest'],
  description = 'Military intelligence officer who used connections for surveillance and intimidation. Sent GPS coordinates as threats. Recorded conspiring to abduct Danish Thanvi. Influenced NADRA to terminate BCG contract.',
  position_title = 'Lt. Col. (Retd)',
  organization_affiliation = 'Military Intelligence (Retired)'
WHERE (name ILIKE '%Saqib%Mumtaz%' OR name ILIKE '%Col%Saqib%') AND entity_type = 'Person';

-- Syed Tayyab Ali Shah - Antagonist
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 70,
  role_tags = ARRAY['suspect', 'person_of_interest'],
  description = 'Husband of Mehwish Ali and domestic violence perpetrator. Audio recordings captured him conspiring with Col. Saqib to abduct Danish Thanvi.',
  position_title = 'Litigant',
  organization_affiliation = NULL
WHERE (name ILIKE '%Tayyab%Shah%' OR name ILIKE '%Tayyab Ali%') AND entity_type = 'Person';

-- Background Check Group (BCG) - Protagonist organization
UPDATE extracted_entities SET 
  category = 'protagonist',
  influence_score = 75,
  role_tags = ARRAY['stakeholder'],
  description = 'Danish Thanvi''s verification services company. Suffered 78% revenue loss after NADRA terminated VeriSys access without proper notice, violating the 30-day contractual clause.'
WHERE (name ILIKE '%Background Check%' OR name ILIKE '%BCG%') AND entity_type IN ('Organization', 'Legal Entity');

-- FIA - Official body
UPDATE extracted_entities SET 
  category = 'official',
  influence_score = 90,
  role_tags = ARRAY['enforcement', 'investigator'],
  description = 'Federal Investigation Agency Cyber Crime Wing. Conducted an illegal raid on BCG offices, fabricated evidence, and arrested Danish Thanvi. Internal probe later exposed a corruption racket.'
WHERE (name = 'FIA' OR name ILIKE 'FIA Cyber%' OR name ILIKE 'FIA Cybercrime%') AND entity_type = 'Official Body';

-- NADRA - Official body
UPDATE extracted_entities SET 
  category = 'official',
  influence_score = 70,
  role_tags = ARRAY['regulator', 'government_official'],
  description = 'National Database & Registration Authority. Terminated BCG''s VeriSys access without the contractually required 30-day notice, causing catastrophic business losses.'
WHERE (name = 'NADRA' OR name ILIKE 'National Database%') AND entity_type = 'Official Body';

-- SECP - Official body
UPDATE extracted_entities SET 
  category = 'official',
  influence_score = 55,
  role_tags = ARRAY['regulator', 'government_official'],
  description = 'Securities & Exchange Commission of Pakistan. Issued show cause notice for BCG winding up, later stayed by the Islamabad High Court.'
WHERE (name = 'SECP' OR name ILIKE 'Securities%Exchange%') AND entity_type = 'Official Body';

-- SI Imran Saad - Antagonist
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 65,
  role_tags = ARRAY['io', 'investigator', 'enforcement'],
  description = 'FIA Sub-Inspector and lead Investigating Officer. Signatures on recovery memos confirmed as forged. Conducted raid and arrest with multiple procedural irregularities.',
  position_title = 'Sub-Inspector / Investigation Officer',
  organization_affiliation = 'FIA Cyber Crime Wing'
WHERE name ILIKE '%Imran Saad%' AND entity_type = 'Person';

-- Tariq Hussain Arbab - Antagonist
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 55,
  role_tags = ARRAY['technical_officer', 'enforcement'],
  description = 'FIA Technical Officer who produced an initial technical report in only 25-35 minutes for 16+ devices. Admitted not being a qualified forensic expert.',
  position_title = 'Inspector / Technical Officer',
  organization_affiliation = 'FIA Cyber Crime Wing'
WHERE (name ILIKE '%Arbab%' OR name ILIKE '%Tarique Arbab%') AND entity_type = 'Person';

-- Abdul Ghaffar - Antagonist
UPDATE extracted_entities SET 
  category = 'antagonist',
  influence_score = 60,
  role_tags = ARRAY['enforcement', 'government_official'],
  description = 'Former Deputy Director of FIA Cybercrime Wing. Exposed in internal probe for running an extortion racket against IT company CEOs.',
  position_title = 'Deputy Director',
  organization_affiliation = 'FIA Cyber Crime Wing'
WHERE name = 'Abdul Ghaffar' AND entity_type = 'Person';

-- Sessions Judge Suresh Kumar - Neutral judiciary
UPDATE extracted_entities SET 
  category = 'neutral',
  influence_score = 80,
  role_tags = ARRAY['judge'],
  description = 'District & Sessions Judge, Karachi South. Granted bail in 2024 and full acquittal in May 2025, applying the Falsus in Uno doctrine.',
  position_title = 'District & Sessions Judge',
  organization_affiliation = 'Judiciary - Karachi South'
WHERE name ILIKE '%Suresh Kumar%' AND entity_type = 'Person';

-- Additional key entities

-- Sindh High Court
UPDATE extracted_entities SET 
  category = 'official',
  influence_score = 85,
  role_tags = ARRAY['judge'],
  description = 'High Court of Sindh. Issued critical orders including bail confirmations and stays on regulatory actions against BCG.'
WHERE name ILIKE '%Sindh High Court%' AND entity_type = 'Official Body';

-- Islamabad High Court
UPDATE extracted_entities SET 
  category = 'official',
  influence_score = 85,
  role_tags = ARRAY['judge'],
  description = 'Islamabad High Court. Stayed the SECP winding up proceedings against BCG, providing crucial judicial relief.'
WHERE name ILIKE '%Islamabad High Court%' AND entity_type = 'Official Body';

-- Supreme Court of Pakistan
UPDATE extracted_entities SET 
  category = 'official',
  influence_score = 95,
  role_tags = ARRAY['judge'],
  description = 'Supreme Court of Pakistan. Apex court involved in oversight of constitutional rights violations in the case.'
WHERE name ILIKE '%Supreme Court%' AND entity_type = 'Official Body';
