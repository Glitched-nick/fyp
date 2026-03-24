import React from 'react';
import LegalLayout from '../components/LegalLayout';

const sections = [
  {
    id: 'overview',
    label: '1. Security Overview',
    content: (
      <p>
        At Intrex, security is a core part of how we build and operate our platform. We apply industry-standard
        practices to protect your data, your account, and the integrity of our services at every layer.
      </p>
    ),
  },
  {
    id: 'data-encryption',
    label: '2. Data Encryption',
    content: (
      <>
        <p>All data is protected in transit and at rest:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li><strong>In transit:</strong> All communication between your browser and our servers uses TLS 1.2+</li>
          <li><strong>At rest:</strong> Sensitive data including recordings and personal information is encrypted using AES-256</li>
          <li><strong>Passwords:</strong> Stored as salted bcrypt hashes — never in plain text</li>
        </ul>
      </>
    ),
  },
  {
    id: 'authentication',
    label: '3. Authentication & Access Control',
    content: (
      <>
        <p>We enforce strong authentication controls:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Firebase Authentication for secure, token-based login</li>
          <li>Multi-Factor Authentication (MFA) available via TOTP authenticator apps</li>
          <li>OAuth 2.0 for Google sign-in — no passwords stored for social logins</li>
          <li>Short-lived JWT tokens with automatic expiry and refresh</li>
          <li>Role-based access control to limit data exposure</li>
        </ul>
      </>
    ),
  },
  {
    id: 'infrastructure',
    label: '4. Infrastructure Security',
    content: (
      <>
        <p>Our infrastructure is designed with security in mind:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Hosted on cloud infrastructure with automatic security patching</li>
          <li>Network-level firewalls and DDoS protection</li>
          <li>Regular automated vulnerability scanning</li>
          <li>Isolated environments for development, staging, and production</li>
          <li>Audit logging for all administrative actions</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-handling',
    label: '5. Secure Data Handling',
    content: (
      <>
        <p>We follow strict data handling practices:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Interview recordings are processed in isolated, temporary environments</li>
          <li>Files are validated for type and size before processing</li>
          <li>Uploaded content is scanned and sandboxed before AI analysis</li>
          <li>Data minimization — we only collect what is necessary</li>
          <li>Automatic deletion of temporary processing files after analysis</li>
        </ul>
      </>
    ),
  },
  {
    id: 'incident-response',
    label: '6. Incident Response',
    content: (
      <p>
        We maintain an incident response plan to handle security events promptly. In the event of a data
        breach affecting your personal information, we will notify affected users within 72 hours in
        accordance with applicable data protection regulations.
      </p>
    ),
  },
  {
    id: 'responsible-disclosure',
    label: '7. Responsible Disclosure',
    content: (
      <p>
        We welcome security researchers to responsibly disclose vulnerabilities. If you discover a security
        issue, please contact us through our support channels before public disclosure. We commit to
        acknowledging reports within 48 hours and working to resolve confirmed issues promptly.
      </p>
    ),
  },
  {
    id: 'your-role',
    label: '8. Your Role in Security',
    content: (
      <>
        <p>You can help keep your account secure by:</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
          <li>Using a strong, unique password</li>
          <li>Enabling Multi-Factor Authentication (MFA) in your profile settings</li>
          <li>Not sharing your login credentials with others</li>
          <li>Logging out on shared or public devices</li>
          <li>Reporting suspicious activity to us immediately</li>
        </ul>
      </>
    ),
  },
  {
    id: 'contact',
    label: '9. Contact Security Team',
    content: (
      <p>
        For security-related concerns or to report a vulnerability, please reach out through our support
        channels. We take all security reports seriously and respond promptly.
      </p>
    ),
  },
];

const SecurityPage = () => <LegalLayout title="Security" sections={sections} />;

export default SecurityPage;
