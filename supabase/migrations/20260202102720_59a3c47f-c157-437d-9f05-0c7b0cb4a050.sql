-- Add category column to extracted_entities table
ALTER TABLE public.extracted_entities 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'neutral';

-- Insert antagonist entities for Threat Profiler
INSERT INTO public.extracted_entities (name, entity_type, role, description, category) VALUES
('Major (R) Mumtaz Hussain Shah', 'Person', 'Primary Complainant', 'Father of Mehwish Ali, filed multiple false FIRs. Admitted lacking evidence for key allegations. Known to use military connections for intimidation.', 'antagonist'),
('Lt. Col. (R) Saqib Mumtaz', 'Person', 'Military Intelligence / Facilitator', 'Used military connections for surveillance and intimidation. Sent GPS coordinates as threats. Recorded conspiring to abduct Danish Thanvi.', 'antagonist'),
('Syed Tayyab Ali Shah', 'Person', 'Husband of Mehwish Ali / Conspirator', 'Domestic violence perpetrator. Audio recording captured him conspiring with Saqib Mumtaz to abduct Danish Thanvi.', 'antagonist'),
('SI Imran Saad', 'Person', 'FIA Investigating Officer', 'Lead IO on the case. Signatures on recovery memos confirmed as forged. Conducted illegal raid without proper authorization.', 'antagonist'),
('Tariq Hussain Arbab', 'Person', 'FIA Technical Officer', 'Produced initial technical report in 25-35 minutes for 16+ devices. Admitted not being a forensic expert during cross-examination.', 'antagonist'),
('Abdul Ghaffar', 'Person', 'FIA Official', 'Exposed in internal probe for running extortion racket against IT CEOs. Part of corrupt network within FIA Cyber Crime Wing.', 'antagonist'),
('Sunita Sabharwal', 'Person', 'Delhi Police Commissioner', 'Accused of ordering illegal arrest. Subject of Supreme Court observations regarding procedural violations.', 'antagonist'),
('Rakesh Aggarwal', 'Person', 'Corporate Executive / Complainant', 'Filed false complaints to initiate harassment campaign. Business competitor with documented conflict of interest.', 'antagonist'),
('Vipin Aggarwal', 'Person', 'Corporate Executive / Co-Conspirator', 'Coordinated with other antagonists in filing frivolous legal cases. Part of organized harassment campaign.', 'antagonist')
ON CONFLICT DO NOTHING;