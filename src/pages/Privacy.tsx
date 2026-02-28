import { LegalPage } from "@/components/legal/legal-page";

const PrivacyPage = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="2026-02-28"
      sections={[
        {
          title: "Information We Collect",
          content: (
            <>
              We may collect email addresses (newsletter subscriptions), contact form submissions, voluntary report
              submissions (including evidence you provide), and basic technical/analytics data (IP address, browser type,
              device information, and usage analytics). We do not sell personal data.
            </>
          ),
        },
        {
          title: "How We Use Information",
          content: (
            <>
              We use information to respond to inquiries and submissions, send newsletter updates (if subscribed),
              improve platform functionality, and monitor abuse, security threats, and platform integrity.
            </>
          ),
        },
        {
          title: "Cookies and Analytics",
          content: (
            <>
              HRPM may use cookies or analytics tools to understand traffic patterns and improve the platform. You may
              disable cookies in your browser settings; disabling cookies may reduce functionality.
            </>
          ),
        },
        {
          title: "Data Security",
          content: <>We implement reasonable administrative and technical safeguards; however no system is fully secure.</>,
        },
        {
          title: "Sensitive and Confidential Submissions",
          content: (
            <>
              Submit only what is necessary. Avoid sharing third-party personal data unless relevant and lawful. HRPM may
              redact sensitive identifiers to reduce harm. Do not submit information you are not lawfully entitled to share.
            </>
          ),
        },
        {
          title: "Data Retention",
          content: <>We retain information only as long as reasonably necessary for documentation, compliance, safety, and operations.</>,
        },
        {
          title: "Third-Party Processors",
          content: (
            <>
              Hosting, email delivery, analytics, or storage providers may process limited data under their own privacy
              policies and contractual safeguards.
            </>
          ),
        },
        {
          title: "Your Rights and Requests",
          content: (
            <>
              You may request access, correction, or deletion of your personal data where applicable by contacting{" "}
              <a className="underline text-primary" href="mailto:info@hrpm.org">info@hrpm.org</a>.
            </>
          ),
        },
        {
          title: "Updates to This Policy",
          content: <>HRPM may update this policy periodically. Continued use constitutes acceptance of updates.</>,
        },
      ]}
    />
  );
};

export default PrivacyPage;
