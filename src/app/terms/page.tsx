import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | Orbit",
  description: "The terms that apply when you use Orbit.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="August 24, 2026">
      <p>
        These Terms govern your use of Orbit. By creating an account or using the service, you
        agree to them. If you do not agree, do not use Orbit.
      </p>

      <h2>Who may use Orbit</h2>
      <p>
        You must be at least 13 years old and legally able to agree to these Terms. If the law
        where you live requires a higher age or consent from a parent or guardian, that
        requirement also applies.
      </p>

      <h2>What Orbit provides</h2>
      <p>
        Orbit is an independent launcher and progress tracker for daily games hosted by third
        parties. It helps you open original games, remember what you played, and track your own
        progress. Orbit does not host, reproduce, control, or operate those games and is not
        affiliated with or endorsed by their publishers.
      </p>

      <h2>Your account</h2>
      <p>
        Provide accurate information, keep your password confidential, and notify us if you
        suspect unauthorized access. You are responsible for activity through your account
        unless applicable law provides otherwise. Do not share an account in a way that weakens
        its security or impersonate another person.
      </p>

      <h2>Acceptable use</h2>
      <p>You must not:</p>
      <ul>
        <li>break the law or infringe another person’s rights;</li>
        <li>probe, disrupt, overload, or bypass Orbit’s security or access controls;</li>
        <li>introduce malware, abusive automation, or fraudulent data;</li>
        <li>scrape, resell, or commercially exploit Orbit without permission; or</li>
        <li>use Orbit to harass, deceive, or harm another person.</li>
      </ul>

      <h2>External websites</h2>
      <p>
        Games and other third-party links open outside Orbit. Their availability, content,
        rules, accounts, purchases, privacy practices, and security are controlled by their
        respective operators. Review their terms before using them. Orbit is not responsible
        for third-party websites or transactions.
      </p>

      <h2>Ownership</h2>
      <p>
        Orbit and its original interface, branding, and code are protected by applicable
        intellectual-property laws. Game names, logos, content, and trademarks belong to their
        respective owners. These Terms do not grant you ownership of Orbit or third-party
        materials.
      </p>

      <h2>Changes, availability, and termination</h2>
      <p>
        We may modify, suspend, or discontinue features and may restrict or terminate access
        when reasonably necessary for security, legal compliance, service integrity, or a
        material breach of these Terms. You may stop using Orbit at any time and request account
        deletion under the <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Disclaimer</h2>
      <p>
        Orbit is provided on an “as is” and “as available” basis. To the extent permitted by
        law, we make no warranty that Orbit or any linked game will always be available,
        uninterrupted, secure, accurate, or suitable for a particular purpose. Nothing in these
        Terms excludes a warranty or consumer right that cannot legally be excluded.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Orbit and its maintainer will not be liable for
        indirect, incidental, special, consequential, or punitive loss arising from the service
        or a third-party website. Liability that cannot legally be limited remains unaffected.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of India, without overriding any mandatory rights
        you have under the law where you live. We encourage you to contact us first so that we
        can try to resolve a concern informally.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms as Orbit changes. The date above identifies the latest
        version. If a change materially affects your rights, we will provide reasonable notice
        through the service or another appropriate channel. Continued use after the effective
        date means you accept the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:viaanmangal@gmail.com">viaanmangal@gmail.com</a>. Please also review
        our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
