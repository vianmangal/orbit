import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import styles from "./legal-page.module.css";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="Back to Orbit">
          <BrandMark />
        </Link>
        <nav aria-label="Legal pages">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <article className={styles.article}>
          <p className={styles.eyebrow}>Orbit legal</p>
          <h1>{title}</h1>
          <p className={styles.updated}>Last updated {updated}</p>
          <div className={styles.content}>{children}</div>
        </article>
      </main>

      <footer className={styles.footer}>
        <p>Orbit is an independent launcher for daily games.</p>
        <Link href="/">Back to Orbit</Link>
      </footer>
    </div>
  );
}
