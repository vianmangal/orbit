import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Orbit",
  description: "How Orbit collects, uses, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 24, 2026">
      <p>
        Orbit collects only the information needed to provide accounts, keep daily-game
        progress in sync, and protect the service. We do not sell personal information,
        run third-party advertising, or use advertising trackers.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> your name, email address, account identifier,
          and authentication metadata. Passwords are handled by Supabase Auth and stored only
          as salted password hashes; Orbit cannot retrieve your original password.
        </li>
        <li>
          <strong>Progress and preferences:</strong> the games in your lineup, whether a game
          was started or completed, the relevant date, and streak or completion totals.
        </li>
        <li>
          <strong>Technical information:</strong> essential authentication cookies and limited
          request, device, security, and diagnostic information processed by our hosting and
          database providers when you use the service.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>
        We use this information to create and secure your account, authenticate you, sync your
        progress across devices, display your preferences and statistics, prevent abuse,
        troubleshoot problems, and maintain or improve Orbit. Depending on where you live, we
        rely on performance of the service you request, our legitimate interests in operating
        and securing Orbit, consent where required, and compliance with legal obligations.
      </p>

      <h2>Service providers and external games</h2>
      <p>
        Supabase provides authentication and database services, and Vercel hosts the website.
        These providers process information on our behalf under their own security and privacy
        commitments. When you open a listed game, you leave Orbit and visit that publisher’s
        website. That site may receive standard connection information and is governed by its
        own privacy policy. Orbit is not affiliated with the listed game publishers.
      </p>

      <h2>Cookies</h2>
      <p>
        Orbit uses strictly necessary cookies to keep you signed in, refresh your session, and
        protect authenticated pages. We do not currently use advertising or analytics cookies.
        If that changes, this policy and any legally required consent controls will be updated.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Account information and saved progress are retained while your account remains active
        or as needed to provide Orbit. You may request access, correction, export, or deletion
        by emailing us from your registered address. We aim to complete verified deletion
        requests within 30 days, subject to limited legal, fraud-prevention, security, and
        backup-retention requirements.
      </p>

      <h2>Security</h2>
      <p>
        Orbit uses HTTPS, Supabase password hashing, authenticated sessions, database access
        controls, and row-level security intended to keep each account’s data separate. No
        online service can guarantee absolute security, so use a unique password and contact us
        if you believe your account has been compromised.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, restrict,
        object to, or receive a copy of your personal information, withdraw consent, and lodge a
        complaint with a data-protection authority. Contact us to exercise a right. We may ask
        you to verify your identity before acting on a request.
      </p>

      <h2>Children</h2>
      <p>
        Orbit is not directed to children under 13. If local law requires a higher minimum age
        or parental consent, you may use Orbit only after meeting that requirement. Contact us
        if you believe a child provided personal information without valid permission.
      </p>

      <h2>International processing</h2>
      <p>
        Our providers may process information outside your country. Where required, we rely on
        appropriate contractual or legal safeguards for those transfers.
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
