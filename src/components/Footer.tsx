/**
 * Marketing footer — 5-column layout, disclaimer, bottom bar (homepage).
 */

import React from 'react';
import Link from 'next/link';
import { marketingSubdomainUrl } from '@/lib/subdomains';

const linkClass =
  'text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors';

const colLabelClass = 'text-[11px] font-medium uppercase tracking-widest text-neutral-400';

function BadgeNew() {
  return (
    <span className="ml-1.5 inline-flex shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
      New
    </span>
  );
}

function BadgeBeta() {
  return (
    <span className="ml-1.5 inline-flex shrink-0 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] text-green-600">
      Beta
    </span>
  );
}

function FooterColumn({
  title,
  titleHref,
  titleExternal,
  children,
}: {
  title: string;
  titleHref?: string;
  /** When true, column title opens in a new tab (e.g. external marketing site). */
  titleExternal?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {titleHref ? (
        <a
          href={titleHref}
          className={`${colLabelClass} mb-4 inline-block transition-colors hover:text-neutral-900 dark:hover:text-white`}
          {...(titleExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {title}
        </a>
      ) : (
        <p className={`${colLabelClass} mb-4`}>{title}</p>
      )}
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function LiLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    </li>
  );
}

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-content layout-gutter pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-10">
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:mb-12 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] lg:gap-8 xl:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              General Exchange
            </p>
            <p className="mt-3 max-w-sm text-[13px] font-light leading-relaxed text-neutral-600 dark:text-neutral-400">
              Simulate, learn, and master markets — without risking real capital.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              Paper trading powered by Monte Carlo
            </p>
          </div>

          <FooterColumn title="Bridge Observer" titleHref="https://bridgeobserver.com" titleExternal>
            <LiLink href="#">Trading simulator</LiLink>
            <LiLink href="#">Monte Carlo engine</LiLink>
            <LiLink href="#">Portfolio builder</LiLink>
            <LiLink href="/tokenomics">Compute tokens</LiLink>
            <li>
              <a
                href="https://www.rockefeller.press"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rockefeller Press
              </a>
            </li>
            <li>
              <a
                href="https://www.townandcattle.com"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                Town{' & '}Cattle
              </a>
            </li>
            <li>
              <a
                href="https://www.credit.coffee"
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                Credit Coffee
              </a>
            </li>
          </FooterColumn>

          <FooterColumn title="University" titleHref={marketingSubdomainUrl('university')}>
            <LiLink href="#">Courses & tracks</LiLink>
            <LiLink href="/library">Strategy library</LiLink>
            <LiLink href="#">Glossary</LiLink>
            <LiLink href="#">Market mechanics</LiLink>
            <li>
              <Link href="#" className={`${linkClass} inline-flex items-center`}>
                Options lab
                <BadgeNew />
              </Link>
            </li>
            <li>
              <Link href="#" className={`${linkClass} inline-flex items-center`}>
                SIE exam prep
                <BadgeBeta />
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Company" titleHref={marketingSubdomainUrl('company')}>
            <LiLink href="#">About</LiLink>
            <LiLink href="#">Blog</LiLink>
            <LiLink href="#">Careers</LiLink>
            <LiLink href="#">Partner program</LiLink>
            <LiLink href="#">Contact</LiLink>
          </FooterColumn>

          <FooterColumn title="Account">
            <LiLink href="/request-access">Create account</LiLink>
            <LiLink href="/pricing">Pricing</LiLink>
            <LiLink href="/dashboard">Dashboard</LiLink>
            <LiLink href="#">API & docs</LiLink>
            <LiLink href="/help-center">Help center</LiLink>
          </FooterColumn>
        </div>

        <p className="mb-5 border-t border-neutral-200 pt-4 text-[11px] font-light leading-relaxed text-neutral-400 dark:border-neutral-800">
          General Exchange is an educational simulation platform. No content constitutes financial advice or a recommendation
          to buy or sell securities. Simulated results do not guarantee future performance. All trading involves risk.
        </p>

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 text-[12px] text-neutral-400 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            <span className="inline-flex min-h-11 items-center">© 2025 General Exchange</span>
            <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
              ·
            </span>
            <Link
              href="#"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Terms
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link
              href="#"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Privacy
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link
              href="#"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Cookie preferences
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link
              href="#"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Disclosures
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            <a
              href="https://www.linkedin.com/company/generalexchangeinc"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <a
              href="https://www.tiktok.com/@general_exchange"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              TikTok
            </a>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <a
              href="https://github.com/generalexchange"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
