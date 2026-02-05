-- Add unique constraint on citation column for upsert operations
ALTER TABLE public.case_law_precedents 
ADD CONSTRAINT case_law_precedents_citation_unique UNIQUE (citation);