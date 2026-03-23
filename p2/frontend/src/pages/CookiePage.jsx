import React from 'react';
import LegalLayout from '../components/LegalLayout';

const sections = [
  {
    id: 'what-are-cookies',
    label: '1. What Are Cookies?',
    content: (
      <p>
        Cookies are small text files stored on your device when you visit our website. They help us provide
        a better user experience by remembering your preferences and analyzing how you use our platform.
      </p>
    ),
  },
  {
    id: 'types',
    label: '2. Types of Cookies We Use',
    content: (
      <div className="space-y-4 mt-2">
        {[
          { name: 'Essential Cookies', desc: 'Required for the website to function properly. These include authentication tokens, session management, and security features. These cookies cannot be disabled.' },
          { name: 'Performance Cookies', desc: 'Help us understand how visitors interact with our website by collecting anonymous information about page visits, time spent, and navigation patterns.' },
          { name: 'Functionality Cookies', desc: 'Remember your preferences such as language, theme, and display settings to provide a personalized experience.' },
          { name: 'Analytics Cookies', desc: 'Help us analyze platform usage, identify popular features, and improve our services based on user behavior data.' },
        ].map(c => (
          <div key={c.name}>
            <h3 className="text-lg font-semibold text-white mb-1">{c.name}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'how-we-use',
    label: '3. How We Use Cookies',
    content: (
      <>
        <p>We use cookies to:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Keep you signed in to your account</li>
          <li>Remember your preferences and settings</li>
          <li>Analyze platform performance and usage</li>
          <li>Improve user experience and interface</li>
          <li>Provide personalized content and recommendations</li>
          <li>Ensure platform security and prevent fraud</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party',
    label: '4. Third-Party Cookies',
    content: (
      <>
        <p>We may use third-party services that set their own cookies, including:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li><strong>Google Analytics:</strong> For website analytics and usage tracking</li>
          <li><strong>Firebase:</strong> For authentication and user management</li>
          <li><strong>OAuth Providers:</strong> For social login functionality</li>
        </ul>
        <p className="mt-2">These third parties have their own privacy policies governing their use of cookies.</p>
      </>
    ),
  },
  {
    id: 'managing',
    label: '5. Managing Cookies',
    content: (
      <>
        <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>View and delete cookies</li>
          <li>Block third-party cookies</li>
          <li>Block cookies from specific websites</li>
          <li>Block all cookies</li>
          <li>Delete all cookies when closing the browser</li>
        </ul>
        <p className="mt-4 text-yellow-400">
          Note: Blocking or deleting cookies may affect website functionality and your user experience.
        </p>
      </>
    ),
  },
  {
    id: 'consent',
    label: '6. Cookie Consent',
    content: (
      <p>
        By continuing to use our website, you consent to our use of cookies as described in this policy.
        You can withdraw consent at any time by adjusting your browser settings or contacting us.
      </p>
    ),
  },
  {
    id: 'updates',
    label: '7. Updates to Cookie Policy',
    content: (
      <p>
        We may update this cookie policy to reflect changes in technology or legal requirements. Please
        review this page periodically for updates.
      </p>
    ),
  },
  {
    id: 'contact',
    label: '8. Contact Us',
    content: (
      <p>For questions about our use of cookies, please contact us through our support channels.</p>
    ),
  },
];

const CookiePage = () => <LegalLayout title="Cookie Policy" sections={sections} />;

export default CookiePage;
