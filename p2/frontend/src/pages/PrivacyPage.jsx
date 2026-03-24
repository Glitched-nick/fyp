import React from 'react';
import LegalLayout from '../components/LegalLayout';

const sections = [
  {
    id: 'information-we-collect',
    label: '1. Information We Collect',
    content: (
      <>
        <p>We collect the following types of information:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li><strong>Account Information:</strong> Email, username, name, and authentication credentials</li>
          <li><strong>Interview Data:</strong> Video recordings, audio recordings, transcripts, and responses</li>
          <li><strong>Analytics Data:</strong> Performance scores, feedback, and usage statistics</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    label: '2. How We Use Your Information',
    content: (
      <>
        <p>We use collected information to:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Provide and improve our AI-powered interview analysis services</li>
          <li>Generate personalized feedback and recommendations</li>
          <li>Maintain and secure your account</li>
          <li>Analyze platform usage and improve user experience</li>
          <li>Communicate important updates and service information</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-storage',
    label: '3. Data Storage & Security',
    content: (
      <p>
        We implement industry-standard security measures to protect your data. Your interview recordings and
        personal information are stored securely and encrypted. We retain your data only as long as necessary
        to provide our services or as required by law.
      </p>
    ),
  },
  {
    id: 'data-sharing',
    label: '4. Data Sharing',
    content: (
      <>
        <p>We do not sell your personal information. We may share data only in these circumstances:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>With service providers under strict confidentiality agreements</li>
          <li>In anonymized, aggregated form for research and analytics</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-rights',
    label: '5. Your Rights',
    content: (
      <>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
          <li>Withdraw consent for data processing</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    label: '6. Cookies & Tracking',
    content: (
      <p>
        We use cookies and similar technologies to enhance your experience, remember preferences, and analyze
        platform usage. You can control cookie settings through your browser. See our{' '}
        <a href="/cookies" className="text-violet-400 hover:underline">Cookie Policy</a> for details.
      </p>
    ),
  },
  {
    id: 'childrens-privacy',
    label: "7. Children's Privacy",
    content: (
      <p>
        Our service is not intended for users under 13 years of age. We do not knowingly collect personal
        information from children under 13.
      </p>
    ),
  },
  {
    id: 'policy-changes',
    label: '8. Policy Changes',
    content: (
      <p>
        We may update this privacy policy periodically. We will notify users of significant changes via email
        or platform notification.
      </p>
    ),
  },
  {
    id: 'contact',
    label: '9. Contact Us',
    content: (
      <p>
        For privacy-related questions or to exercise your rights, please contact our privacy team through
        the support channels.
      </p>
    ),
  },
];

const PrivacyPage = () => <LegalLayout title="Privacy Policy" sections={sections} />;

export default PrivacyPage;
