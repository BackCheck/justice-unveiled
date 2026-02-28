import { LegalPage } from "@/components/legal/legal-page";

const TermsPage = () => {
  return (
    <LegalPage
      title="Terms & Conditions"
      effectiveDate="2026-02-28"
      sections={[
        {
          title: "Acceptance of Terms",
          content: <>By accessing HRPM.org you agree to these terms. If you do not agree, discontinue use.</>,
        },
        {
          title: "Platform Purpose",
          content: (
            <>
              HRPM.org provides public-interest documentation, human rights monitoring, intelligence-style analysis,
              and compliance mapping. Content is informational and advocacy-oriented.
            </>
          ),
        },
        {
          title: "Intellectual Property and Attribution",
          content: (
            <>
              Unless otherwise stated, content on HRPM.org is owned by HRPM. You may cite for academic, journalistic,
              or advocacy purposes with proper attribution. You may not republish full reports commercially without
              written permission, alter content to misrepresent findings, remove attribution, or use HRPM materials
              for harassment or intimidation.
            </>
          ),
        },
        {
          title: "User Conduct",
          content: (
            <>
              You agree not to submit knowingly false information, attempt unauthorized access, scrape at scale for
              malicious use, compromise security, or use HRPM.org for harassment, doxxing, or incitement. HRPM may
              restrict access to protect platform integrity, safety, and legal compliance.
            </>
          ),
        },
        {
          title: "Takedown / Redaction Requests",
          content: (
            <>
              HRPM may consider requests to redact personal identifiers where disclosure creates credible safety risks,
              subject to public interest and evidentiary value. Requests must include verifiable justification.
            </>
          ),
        },
        {
          title: "Third-Party Links",
          content: <>HRPM may link to third-party sites and is not responsible for their content or privacy practices.</>,
        },
        {
          title: "No Warranty",
          content: <>The website and content are provided "as is" without warranties of any kind.</>,
        },
        {
          title: "Limitation of Liability",
          content: (
            <>
              To the maximum extent permitted by law, HRPM shall not be liable for damages resulting from use of the
              website or reliance on content.
            </>
          ),
        },
        {
          title: "Changes to Terms",
          content: <>HRPM may update these Terms at any time. Continued use constitutes acceptance of updates.</>,
        },
        {
          title: "Contact",
          content: (
            <>
              For inquiries: <a className="underline text-primary" href="mailto:info@hrpm.org">info@hrpm.org</a>
            </>
          ),
        },
      ]}
    />
  );
};

export default TermsPage;
