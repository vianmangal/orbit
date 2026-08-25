import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Orbit",
  description: "How Orbit handles local progress and limited technical information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 26, 2026">
      <p>
        Orbit does not require an account and does not send your game progress to an Orbit
        database. Your progress is stored locally in your browser. We do not sell personal
        information, run third-party advertising, or use advertising trackers.
      </p>

      <h2>Information Orbit stores</h2>
      <ul>
        <li>
          <strong>Local progress:</strong> whether a listed game was started or completed and
          the relevant date. This data remains in the browser where you use Orbit and does not
          sync between browsers or devices.
        </li>
        <li>
          <strong>Technical information:</strong> limited request, device, security, and
          diagnostic information may be processed by our hosting provider when you visit Orbit.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>
        Orbit reads local progress to display your daily status, completion total, and streak.
        Limited hosting information may be used to deliver and secure the site, troubleshoot
        problems, and maintain or improve Orbit.
      </p>

      <h2>Service providers and external games</h2>
      <p>
        Vercel hosts the website and may process standard connection and diagnostic information
        under its own security and privacy commitments. When you open a listed game, you leave
        Orbit and visit that publisher’s website. That site may receive standard connection
        information and is governed by its own privacy policy. Orbit is not affiliated with the
        listed game publishers.
      </p>

      <h2>Local storage and cookies</h2>
      <p>
        Orbit uses browser local storage to remember progress. Orbit does not use account,
        advertising, or analytics cookies. If that changes, this policy and any legally required
        consent controls will be updated.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Local progress remains until you clear Orbit’s site data in your browser. Removing site
        data permanently deletes that browser’s saved progress. Hosting logs are retained by
        Vercel according to its applicable policies and service configuration.
      </p>

      <h2>Security</h2>
      <p>
        Orbit uses HTTPS and avoids collecting account credentials or transmitting game progress
        to an Orbit database. Anyone with access to your browser profile may be able to view or
        change locally stored progress.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can view or delete local progress using your browser’s developer tools or site-data
        settings. Depending on your location, you may also have rights concerning personal
        information processed by the hosting provider. Contact us with privacy questions.
      </p>

      <h2>Children</h2>
      <p>
        Orbit is not directed to children under 13. If local law requires a higher minimum age
        or parental consent, you may use Orbit only after meeting that requirement. Contact us
        if you believe a child provided personal information without valid permission.
      </p>

      <h2>International processing</h2>
      <p>
        Our hosting provider may process limited technical information outside your country.
        Where required, appropriate contractual or legal safeguards apply to those transfers.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy when Orbit or applicable requirements change. The date above
        identifies the latest version. Material changes will be communicated through the
        service or another appropriate channel.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or requests, email{" "}
        <a href="mailto:viaanmangal@gmail.com">viaanmangal@gmail.com</a>. You can also review
        the <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
