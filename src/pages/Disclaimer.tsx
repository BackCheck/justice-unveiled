import { LegalPage } from "@/components/legal/legal-page";

const DisclaimerPage = () => {
  return (
    <LegalPage
      title="Disclaimer"
      effectiveDate="2026-02-28"
      intro={
        <>
          HRPM.org is an independent public-interest documentation and monitoring platform.
          Content is published for transparency, research, and advocacy purposes.
        </>
      }
      sections={[
        {
          title: "No Legal Advice",
          content: (
            <>
              Nothing on HRPM.org constitutes legal advice. HRPM does not provide legal representation,
              legal services, or professional counsel. Consult a qualified legal professional for advice
              specific to your circumstances.
            </>
          ),
        },
        {
          title: "Allegations and Judicial Status",
          content: (
            <div className="space-y-2">
              <p>Inclusion of an individual or entity does not constitute a criminal conviction.</p>
              <p>Allegations remain subject to judicial determination where applicable.</p>
              <p>HRPM does not assert guilt beyond what is legally established by competent courts.</p>
            </div>
          ),
        },
        {
          title: "Sources and Methodology",
          content: (
            <>
              HRPM reports may incorporate information derived from court records, regulatory documentation,
              verified statements, OSINT, and digital evidence analysis. Reasonable efforts are made to ensure
              accuracy; however HRPM does not guarantee completeness, timeliness, or error-free publication.
            </>
          ),
        },
        {
          title: "Public Interest and Good-Faith Publication",
          content: (
            <>
              HRPM publishes without malice and solely for public-interest documentation, transparency,
              and rights-monitoring purposes. HRPM discourages harassment, doxxing, or intimidation of any
              person referenced on the platform and may redact sensitive identifiers where necessary to
              reduce risk of harm.
            </>
          ),
        },
        {
          title: "Corrections and Right of Reply",
          content: (
            <>
              If you believe information is materially inaccurate, submit a correction request with verifiable
              supporting documentation to{" "}
              <a className="underline text-primary" href="mailto:info@hrpm.org">info@hrpm.org</a>.
              HRPM will review in good faith and update where appropriate, and may publish clarifications.
            </>
          ),
        },
        {
          title: "Limitation of Liability",
          content: (
            <>
              Use of HRPM.org is at your own risk. HRPM shall not be liable for direct or indirect damages
              arising from reliance on published content, system availability, or third-party links.
            </>
          ),
        },
      ]}
      footer={
        <>Human Rights Protection & Monitoring (HRPM.org) — Documenting injustice. Demanding accountability.</>
      }
    />
  );
};

export default DisclaimerPage;
