-- Legal statutes reference library
CREATE TABLE public.legal_statutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework TEXT NOT NULL,
  statute_name TEXT NOT NULL,
  statute_code TEXT NOT NULL,
  section TEXT,
  title TEXT NOT NULL,
  full_text TEXT,
  summary TEXT,
  keywords TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case law precedents library
CREATE TABLE public.case_law_precedents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citation TEXT NOT NULL,
  case_name TEXT NOT NULL,
  court TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  year INTEGER,
  summary TEXT,
  key_principles TEXT[],
  related_statutes TEXT[],
  is_landmark BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Legal doctrines reference
CREATE TABLE public.legal_doctrines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctrine_name TEXT NOT NULL,
  latin_name TEXT,
  description TEXT NOT NULL,
  application_context TEXT,
  related_statutes TEXT[],
  example_cases TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case-specific statute attachments
CREATE TABLE public.case_statute_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  statute_id UUID REFERENCES public.legal_statutes(id) ON DELETE CASCADE,
  relevance_notes TEXT,
  linked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id, statute_id)
);

-- Case-specific case law tags
CREATE TABLE public.case_precedent_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  precedent_id UUID REFERENCES public.case_law_precedents(id) ON DELETE CASCADE,
  application_notes TEXT,
  linked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id, precedent_id)
);

-- Case-specific doctrine applications
CREATE TABLE public.case_doctrine_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  doctrine_id UUID REFERENCES public.legal_doctrines(id) ON DELETE CASCADE,
  application_notes TEXT,
  supporting_evidence TEXT[],
  linked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id, doctrine_id)
);

-- Auto-generated legal issues
CREATE TABLE public.legal_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  issue_title TEXT NOT NULL,
  issue_description TEXT,
  issue_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  related_statute_ids UUID[],
  related_precedent_ids UUID[],
  related_doctrine_ids UUID[],
  ai_generated BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appeal-ready summaries
CREATE TABLE public.appeal_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT false,
  is_finalized BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_law_precedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_doctrines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_statute_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_precedent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_doctrine_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeal_summaries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Legal statutes are publicly viewable" ON public.legal_statutes FOR SELECT USING (true);
CREATE POLICY "Case law precedents are publicly viewable" ON public.case_law_precedents FOR SELECT USING (true);
CREATE POLICY "Legal doctrines are publicly viewable" ON public.legal_doctrines FOR SELECT USING (true);
CREATE POLICY "Admins can manage statutes" ON public.legal_statutes FOR ALL USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage precedents" ON public.case_law_precedents FOR ALL USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage doctrines" ON public.legal_doctrines FOR ALL USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Case statute links are publicly viewable" ON public.case_statute_links FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert statute links" ON public.case_statute_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Editors and admins can update statute links" ON public.case_statute_links FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Admins can delete statute links" ON public.case_statute_links FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Case precedent links are publicly viewable" ON public.case_precedent_links FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert precedent links" ON public.case_precedent_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Editors and admins can update precedent links" ON public.case_precedent_links FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Admins can delete precedent links" ON public.case_precedent_links FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Case doctrine links are publicly viewable" ON public.case_doctrine_links FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert doctrine links" ON public.case_doctrine_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Editors and admins can update doctrine links" ON public.case_doctrine_links FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Admins can delete doctrine links" ON public.case_doctrine_links FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Legal issues are publicly viewable" ON public.legal_issues FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert legal issues" ON public.legal_issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Editors and admins can update legal issues" ON public.legal_issues FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Admins can delete legal issues" ON public.legal_issues FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Appeal summaries are publicly viewable" ON public.appeal_summaries FOR SELECT USING (true);
CREATE POLICY "Editors and admins can insert summaries" ON public.appeal_summaries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Editors and admins can update summaries" ON public.appeal_summaries FOR UPDATE USING (auth.uid() IS NOT NULL AND has_any_role(auth.uid(), ARRAY['admin', 'editor']::app_role[]));
CREATE POLICY "Admins can delete summaries" ON public.appeal_summaries FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'));

-- Seed Pakistani Laws
INSERT INTO public.legal_statutes (framework, statute_name, statute_code, section, title, summary, keywords) VALUES
('Pakistani Law', 'Prevention of Electronic Crimes Act 2016', 'PECA', '3', 'Unauthorized Access to Information System', 'Criminalizes unauthorized access to any information system', ARRAY['hacking', 'unauthorized access', 'cyber crime']),
('Pakistani Law', 'Prevention of Electronic Crimes Act 2016', 'PECA', '4', 'Unauthorized Copying of Data', 'Prohibits copying data without authorization', ARRAY['data theft', 'copying', 'unauthorized']),
('Pakistani Law', 'Prevention of Electronic Crimes Act 2016', 'PECA', '10', 'Cyber Terrorism', 'Defines and criminalizes cyber terrorism activities', ARRAY['terrorism', 'cyber', 'critical infrastructure']),
('Pakistani Law', 'Prevention of Electronic Crimes Act 2016', 'PECA', '11', 'Electronic Forgery', 'Criminalizes electronic document forgery', ARRAY['forgery', 'electronic', 'documents']),
('Pakistani Law', 'Prevention of Electronic Crimes Act 2016', 'PECA', '20', 'Offences Against Dignity of Person', 'Protection against harassment and defamation online', ARRAY['harassment', 'dignity', 'defamation']),
('Pakistani Law', 'Prevention of Electronic Crimes Act 2016', 'PECA', '24', 'Spoofing', 'Criminalizes identity spoofing in electronic communications', ARRAY['spoofing', 'identity', 'impersonation']),
('Pakistani Law', 'Pakistan Penal Code 1860', 'PPC', '302', 'Punishment of Qatl-i-Amd', 'Murder and its punishment', ARRAY['murder', 'homicide', 'qatl']),
('Pakistani Law', 'Pakistan Penal Code 1860', 'PPC', '376', 'Punishment for Rape', 'Defines rape and prescribes punishment', ARRAY['rape', 'sexual assault']),
('Pakistani Law', 'Pakistan Penal Code 1860', 'PPC', '420', 'Cheating and Dishonestly Inducing Delivery of Property', 'Fraud and cheating offences', ARRAY['fraud', 'cheating', 'property']),
('Pakistani Law', 'Pakistan Penal Code 1860', 'PPC', '489-F', 'Dishonestly Issuing Cheque', 'Bounced cheque criminal liability', ARRAY['cheque', 'dishonor', 'banking']),
('Pakistani Law', 'Pakistan Penal Code 1860', 'PPC', '500', 'Defamation', 'Criminal defamation provisions', ARRAY['defamation', 'libel', 'slander']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '154', 'Information in Cognizable Cases (FIR)', 'Procedure for registering First Information Report', ARRAY['FIR', 'complaint', 'police']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '155', 'Information in Non-Cognizable Cases', 'Procedure for non-cognizable offences', ARRAY['NCR', 'non-cognizable']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '161', 'Examination of Witnesses by Police', 'Police power to examine witnesses', ARRAY['witness', 'statement', 'police']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '164', 'Recording of Confessions and Statements', 'Judicial recording of confessions', ARRAY['confession', 'statement', 'magistrate']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '173', 'Report of Police Officer on Completion of Investigation', 'Challan submission procedure', ARRAY['challan', 'investigation', 'report']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '497', 'When Bail May Be Taken', 'Bail provisions and procedure', ARRAY['bail', 'release', 'custody']),
('Pakistani Law', 'Code of Criminal Procedure 1898', 'CrPC', '498', 'Bail for Non-Bailable Offences', 'High Court/Sessions bail powers', ARRAY['bail', 'non-bailable', 'sessions']),
('Pakistani Law', 'Qanun-e-Shahadat Order 1984', 'QSO', '3', 'Evidence May Be Given of Facts in Issue', 'Admissibility of evidence', ARRAY['evidence', 'admissibility', 'facts']),
('Pakistani Law', 'Qanun-e-Shahadat Order 1984', 'QSO', '17', 'Burden of Proof', 'Who bears the burden of proof', ARRAY['burden', 'proof', 'evidence']),
('Pakistani Law', 'Qanun-e-Shahadat Order 1984', 'QSO', '59', 'Electronic Evidence', 'Admissibility of electronic records', ARRAY['electronic', 'digital', 'evidence']);

-- Seed Constitutional Articles
INSERT INTO public.legal_statutes (framework, statute_name, statute_code, section, title, summary, keywords) VALUES
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '4', 'Right of Individuals to be Dealt with in Accordance with Law', 'No action detrimental to life, liberty, body, reputation or property except in accordance with law', ARRAY['due process', 'law', 'rights']),
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '9', 'Security of Person', 'No person shall be deprived of life or liberty save in accordance with law', ARRAY['life', 'liberty', 'security']),
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '10', 'Safeguards as to Arrest and Detention', 'Right to be informed of grounds of arrest, right to counsel', ARRAY['arrest', 'detention', 'counsel']),
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '10A', 'Right to Fair Trial', 'Every person has the right to a fair trial and due process', ARRAY['fair trial', 'due process', 'justice']),
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '14', 'Inviolability of Dignity of Man', 'Dignity of man and privacy of home are inviolable', ARRAY['dignity', 'privacy', 'honor']),
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '19', 'Freedom of Speech', 'Every citizen has the right to freedom of speech and expression', ARRAY['speech', 'expression', 'freedom']),
('Constitutional', 'Constitution of Pakistan 1973', 'Art', '25', 'Equality of Citizens', 'All citizens are equal before law and entitled to equal protection', ARRAY['equality', 'discrimination', 'protection']);

-- Seed International Frameworks
INSERT INTO public.legal_statutes (framework, statute_name, statute_code, section, title, summary, keywords) VALUES
('International', 'International Covenant on Civil and Political Rights', 'ICCPR', '2', 'Right to Effective Remedy', 'States must ensure effective remedies for rights violations', ARRAY['remedy', 'enforcement', 'rights']),
('International', 'International Covenant on Civil and Political Rights', 'ICCPR', '7', 'Prohibition of Torture', 'No one shall be subjected to torture or cruel treatment', ARRAY['torture', 'cruel', 'inhuman']),
('International', 'International Covenant on Civil and Political Rights', 'ICCPR', '9', 'Liberty and Security of Person', 'Everyone has the right to liberty and security', ARRAY['liberty', 'security', 'detention']),
('International', 'International Covenant on Civil and Political Rights', 'ICCPR', '14', 'Right to Fair Trial', 'Everyone entitled to fair and public hearing', ARRAY['fair trial', 'public hearing', 'equality']),
('International', 'International Covenant on Civil and Political Rights', 'ICCPR', '17', 'Right to Privacy', 'No arbitrary interference with privacy, family, home', ARRAY['privacy', 'family', 'correspondence']),
('International', 'International Covenant on Civil and Political Rights', 'ICCPR', '19', 'Freedom of Expression', 'Everyone has the right to hold opinions and expression', ARRAY['expression', 'opinion', 'speech']),
('International', 'Universal Declaration of Human Rights', 'UDHR', '3', 'Right to Life, Liberty and Security', 'Everyone has the right to life, liberty and security of person', ARRAY['life', 'liberty', 'security']),
('International', 'Universal Declaration of Human Rights', 'UDHR', '5', 'Freedom from Torture', 'No one shall be subjected to torture or cruel treatment', ARRAY['torture', 'cruel', 'degrading']),
('International', 'Universal Declaration of Human Rights', 'UDHR', '8', 'Right to Effective Remedy', 'Everyone has the right to an effective remedy', ARRAY['remedy', 'tribunal', 'rights']),
('International', 'Universal Declaration of Human Rights', 'UDHR', '10', 'Right to Fair Public Hearing', 'Everyone entitled to fair and public hearing', ARRAY['hearing', 'tribunal', 'fair']),
('International', 'Universal Declaration of Human Rights', 'UDHR', '12', 'Freedom from Arbitrary Interference', 'No arbitrary interference with privacy, family, home', ARRAY['privacy', 'interference', 'arbitrary']),
('International', 'Convention Against Torture', 'CAT', '1', 'Definition of Torture', 'Defines torture for purposes of the Convention', ARRAY['torture', 'definition', 'pain']),
('International', 'Convention Against Torture', 'CAT', '2', 'Obligation to Prevent Torture', 'States must take effective measures to prevent torture', ARRAY['prevention', 'measures', 'torture']),
('International', 'Convention Against Torture', 'CAT', '14', 'Right to Redress', 'Victims have enforceable right to fair and adequate compensation', ARRAY['redress', 'compensation', 'rehabilitation']);

-- Seed Case Law Precedents
INSERT INTO public.case_law_precedents (citation, case_name, court, jurisdiction, year, summary, key_principles, related_statutes, is_landmark) VALUES
('PLD 2019 SC 675', 'Mian Muhammad Nawaz Sharif vs State', 'Supreme Court', 'Pakistan', 2019, 'Landmark case on disqualification under Article 62(1)(f)', ARRAY['Disqualification', 'Article 62', 'Honest and Ameen'], ARRAY['Art-62', 'Art-63'], true),
('PLD 2018 SC 77', 'Aasia Bibi vs The State', 'Supreme Court', 'Pakistan', 2018, 'Blasphemy acquittal based on reasonable doubt and evidentiary standards', ARRAY['Blasphemy', 'Evidence', 'Reasonable Doubt', 'Fair Trial'], ARRAY['PPC-295C', 'Art-10A'], true),
('PLD 2015 SC 561', 'D.G. Khan Cement Company vs Government of Pakistan', 'Supreme Court', 'Pakistan', 2015, 'Constitutional protection of property rights and taxation principles', ARRAY['Property Rights', 'Taxation', 'Due Process'], ARRAY['Art-24', 'Art-25'], false),
('2019 SCMR 1', 'Suo Motu Case No. 1 of 2019', 'Supreme Court', 'Pakistan', 2019, 'Right to fair trial and due process in criminal proceedings', ARRAY['Fair Trial', 'Due Process', 'Criminal Procedure'], ARRAY['Art-10A', 'CrPC-154'], true),
('PLD 2014 SC 14', 'Nadeem Ahmed vs Federation of Pakistan', 'Supreme Court', 'Pakistan', 2014, 'Fundamental rights protection and right to privacy', ARRAY['Privacy', 'Fundamental Rights', 'Dignity'], ARRAY['Art-14', 'Art-9'], true),
('2020 CLC 1', 'XYZ Corporation vs FBR', 'Lahore High Court', 'Punjab', 2020, 'Business taxation and procedural fairness', ARRAY['Taxation', 'Business', 'Fair Procedure'], ARRAY['Art-25', 'Art-4'], false),
('PLD 2016 SC 85', 'Imrana Tiwana vs Pakistan', 'Supreme Court', 'Pakistan', 2016, 'Environmental protection and public interest litigation', ARRAY['Environment', 'PIL', 'Public Interest'], ARRAY['Art-9', 'Art-14'], true),
('2017 SCMR 2017', 'Salman Akram Raja vs Government of Punjab', 'Supreme Court', 'Pakistan', 2017, 'Right to information and transparency in governance', ARRAY['RTI', 'Transparency', 'Good Governance'], ARRAY['Art-19A', 'Art-4'], true);

-- Seed Legal Doctrines
INSERT INTO public.legal_doctrines (doctrine_name, latin_name, description, application_context, related_statutes, example_cases) VALUES
('False in One, False in All', 'Falsus in Uno, Falsus in Omnibus', 'If a witness is found to have lied about one material fact, their entire testimony may be disbelieved', 'Used to challenge witness credibility when contradictions or falsehoods are discovered in their testimony', ARRAY['QSO-3', 'QSO-17'], ARRAY['PLD 2018 SC 77']),
('No Harm Without Fault', 'Damnum Sine Injuria', 'Damage without legal injury - no cause of action exists if there is no violation of a legal right', 'Applied when harm occurs but no legal right has been violated', ARRAY['Art-4', 'PPC-420'], ARRAY[]::TEXT[]),
('Injury Without Damage', 'Injuria Sine Damno', 'Violation of a legal right even without actual damage is actionable', 'Applies to fundamental rights violations even without monetary loss', ARRAY['Art-9', 'Art-14'], ARRAY['PLD 2014 SC 14']),
('Let the Master Answer', 'Respondeat Superior', 'An employer is liable for the wrongful acts of employees performed within scope of employment', 'Applied in civil liability cases involving government agencies or corporations', ARRAY['Art-4'], ARRAY[]::TEXT[]),
('The Thing Speaks for Itself', 'Res Ipsa Loquitur', 'The occurrence of an accident implies negligence without need for further proof', 'Applied when the cause of injury was under exclusive control of the defendant', ARRAY['QSO-17'], ARRAY[]::TEXT[]),
('Hearing the Other Side', 'Audi Alteram Partem', 'Principle of natural justice requiring that both parties be heard before a decision', 'Fundamental to fair trial rights and administrative justice', ARRAY['Art-10A', 'CrPC-164'], ARRAY['2019 SCMR 1']),
('Against Self-Interest', 'Nemo Judex in Causa Sua', 'No one should be a judge in their own cause - impartiality principle', 'Applied to disqualify biased decision-makers in judicial or administrative proceedings', ARRAY['Art-10A'], ARRAY[]::TEXT[]),
('Benefit of Doubt', 'In Dubio Pro Reo', 'When in doubt, decide in favor of the accused', 'Criminal law principle that doubt benefits the accused', ARRAY['QSO-17', 'CrPC-497'], ARRAY['PLD 2018 SC 77']);

-- Triggers
CREATE TRIGGER update_legal_issues_updated_at
  BEFORE UPDATE ON public.legal_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appeal_summaries_updated_at
  BEFORE UPDATE ON public.appeal_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();