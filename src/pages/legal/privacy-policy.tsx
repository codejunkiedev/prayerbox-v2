import { LegalLayout } from './legal-layout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title='Privacy Policy' lastUpdated='25 November 2025'>
      <p>
        This Privacy Policy explains how <strong>PrayerBox</strong> ("we", "us", "our") collects,
        uses, and protects information about administrators, moderators, display operators, and
        visitors ("you") when you use the PrayerBox application and related services (the
        "Services").
      </p>
      <p>By using the Services, you consent to the practices described in this Privacy Policy.</p>

      <h2>1. Who We Are</h2>
      <p>
        PrayerBox is a software-as-a-service platform that helps masjids manage prayer timings,
        announcements, posts, events, Quranic ayat and hadith content, and the digital displays
        shown inside their facilities.
      </p>
      <p>
        If you have questions about this Privacy Policy or your data, you can contact us through the
        in-app Support page or by email at{' '}
        <a href='mailto:admin@shaykhrahmatalamjan.com'>admin@shaykhrahmatalamjan.com</a>.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Information You Provide Directly</h3>
      <ul>
        <li>
          <strong>Account information:</strong> Email address and password used to sign in,
          masjid/organisation name, role (admin or moderator), and contact details you choose to
          add.
        </li>
        <li>
          <strong>Masjid profile:</strong> Masjid name, address, geographic coordinates, prayer
          calculation preferences, jamaat times, logo, and other configuration you provide.
        </li>
        <li>
          <strong>Content you upload:</strong> Announcements, posts, event details, ayat/hadith
          slide designs, images, YouTube video links, and any other content you publish to your
          displays.
        </li>
        <li>
          <strong>Display registration:</strong> Screen names, orientation, location labels, and the
          screen codes generated to pair physical displays with your account.
        </li>
        <li>
          <strong>Communications:</strong> Messages or feedback you send through the Support form or
          by email.
        </li>
      </ul>

      <h3>2.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Log and device data:</strong> IP address, browser type, device information, the
          pages you visit within the app, and timestamps of significant actions (for example,
          last-active time on your account).
        </li>
        <li>
          <strong>Error and performance data:</strong> When something goes wrong, our error
          monitoring provider records details about the error (such as a stack trace, browser
          information, and the user identifier associated with the session) so we can diagnose and
          fix the issue.
        </li>
        <li>
          <strong>Cookies and local storage:</strong> Small data files stored on your device to keep
          you signed in, remember preferences (such as theme and sidebar state), and keep a paired
          display screen authenticated between visits.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>
          <strong>To provide the Services</strong> — authenticate you, sync your masjid
          configuration, render your displays, and deliver the content you publish.
        </li>
        <li>
          <strong>To maintain account security</strong> — detect suspicious activity, recover
          accounts, and protect against abuse.
        </li>
        <li>
          <strong>To respond to your inquiries</strong> sent through Support, email, or other
          channels.
        </li>
        <li>
          <strong>To improve the Services</strong> — diagnose bugs, monitor performance, and
          understand which features are useful.
        </li>
        <li>
          <strong>To send service-related communications</strong> — for example, password resets,
          security notices, or notices about material changes to the Services.
        </li>
        <li>
          <strong>To comply with legal obligations</strong> and enforce our Terms &amp; Conditions.
        </li>
      </ul>

      <h2>4. Legal Bases for Processing</h2>
      <p>
        Depending on your jurisdiction, we may rely on different legal bases to process your
        personal data:
      </p>
      <ul>
        <li>
          The <strong>performance of a contract</strong> (providing the Services you signed up for).
        </li>
        <li>
          Your <strong>consent</strong>, where required (for example, optional communications).
        </li>
        <li>
          Our <strong>legitimate interests</strong> in operating, securing, and improving the
          Services.
        </li>
        <li>
          <strong>Compliance with legal obligations</strong>, such as tax, accounting, or
          law-enforcement requirements.
        </li>
      </ul>

      <h2>5. How We Share Your Information</h2>
      <p>We do not sell your personal information.</p>
      <p>We share information with:</p>
      <ul>
        <li>
          <strong>Infrastructure and service providers</strong> who help us operate the Services,
          including our database, authentication and file storage provider (Supabase), error and
          performance monitoring (Sentry), and our email/transactional message providers.
        </li>
        <li>
          <strong>Third-party content sources</strong> we integrate with, such as Quran and hadith
          data providers, prayer-time calculation libraries, and YouTube (when you embed videos).
          These services have their own privacy policies governing the data they receive.
        </li>
        <li>
          <strong>Professional advisers</strong> (for example, legal or accounting advisers) where
          necessary.
        </li>
        <li>
          <strong>Authorities or law enforcement</strong> where required by law, court order, or to
          protect our rights or users.
        </li>
      </ul>

      <h2>6. Content You Publish</h2>
      <p>
        Content you publish through PrayerBox (announcements, posts, events, ayat/hadith designs) is
        displayed inside your masjid's facilities through your registered screens. You are
        responsible for the accuracy, legality, and appropriateness of that content. Where the
        Services allow you to add moderators, the masjid administrator remains responsible for
        oversight of moderator activity.
      </p>

      <h2>7. Cookies and Similar Technologies</h2>
      <p>We use:</p>
      <ul>
        <li>
          <strong>Essential cookies and local storage</strong> required for the Services to function
          — for example, keeping you signed in and keeping a paired display screen authenticated.
        </li>
        <li>
          <strong>Preference storage</strong> for choices such as light/dark theme and sidebar
          state.
        </li>
        <li>
          <strong>Diagnostic data</strong> used by our error and performance monitoring tools.
        </li>
      </ul>
      <p>
        You can clear or block this storage through your browser settings, but doing so may sign you
        out and reset your preferences.
      </p>

      <h2>8. Data Retention</h2>
      <p>We retain your personal information for as long as necessary to:</p>
      <ul>
        <li>Provide the Services to you;</li>
        <li>Comply with legal, tax, and accounting requirements;</li>
        <li>Resolve disputes and enforce our agreements.</li>
      </ul>
      <p>
        When you delete your account or specific content, we will take reasonable steps to remove or
        anonymise the associated personal data, except where retention is required by law.
      </p>

      <h2>9. Data Security</h2>
      <p>
        We take reasonable technical and organisational measures — including encrypted transport,
        access controls, and managed authentication — to protect your information against
        unauthorised access, loss, misuse, or alteration. However, no method of transmission over
        the internet or electronic storage is completely secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>10. International Data Transfers</h2>
      <p>
        Our infrastructure providers may process your data in data centres located outside your
        country of residence. Where required by law, we rely on appropriate safeguards (such as
        standard contractual clauses) for such transfers. By using the Services, you consent to
        these transfers subject to applicable law.
      </p>

      <h2>11. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have some or all of the following rights regarding
        your personal data:
      </p>
      <ul>
        <li>
          <strong>Access</strong> — request a copy of the personal data we hold about you.
        </li>
        <li>
          <strong>Rectification</strong> — request correction of inaccurate or incomplete data.
        </li>
        <li>
          <strong>Deletion</strong> — request deletion of your data, subject to legal exceptions.
        </li>
        <li>
          <strong>Restriction</strong> — limit how we use your data in certain cases.
        </li>
        <li>
          <strong>Objection</strong> — object to certain processing, including direct marketing.
        </li>
        <li>
          <strong>Withdraw consent</strong> at any time where processing is based on your consent.
        </li>
      </ul>
      <p>
        To exercise these rights, contact us through the Support page or at{' '}
        <a href='mailto:admin@shaykhrahmatalamjan.com'>admin@shaykhrahmatalamjan.com</a>. We may
        need to verify your identity before fulfilling your request.
      </p>

      <h2>12. Children's Privacy</h2>
      <p>
        PrayerBox is intended for use by masjid administrators and the moderators they appoint. We
        do not knowingly collect personal information from children. If you believe a child has
        provided us with personal data, please contact us and we will take appropriate action.
      </p>

      <h2>13. Third-Party Links and Embedded Content</h2>
      <p>
        The Services may link to or embed content from third-party sites (for example, YouTube
        videos you choose to display). We are not responsible for the privacy practices or content
        of those third parties. We encourage you to review their privacy policies.
      </p>

      <h2>14. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will update the "Last
        updated" date at the top of this page. For material changes, we will take reasonable steps
        to notify you. Your continued use of the Services after changes are posted constitutes
        acceptance of the updated policy.
      </p>

      <h2>15. Contact Us</h2>
      <p>
        If you have any questions, concerns, or requests regarding this Privacy Policy or our
        handling of your personal information, please contact us:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{' '}
          <a href='mailto:admin@shaykhrahmatalamjan.com'>admin@shaykhrahmatalamjan.com</a>
        </li>
        <li>
          <strong>Support:</strong> Through the Support page in your PrayerBox account.
        </li>
      </ul>
    </LegalLayout>
  );
}
