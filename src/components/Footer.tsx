/**
 * Marketing footer — multi-column layout, disclaimer, bottom bar (homepage).
 */

import React from 'react';
import Link from 'next/link';
import { marketingSubdomainUrl } from '@/lib/subdomains';
import { FooterCopyrightLine } from '@/components/FooterCopyrightLine';
import { FooterNewsletterSignup } from '@/components/FooterNewsletterSignup';
import { FooterSocialLinks } from '@/components/FooterSocialLinks';

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
  const titleClass = `${colLabelClass} mb-4 inline-block transition-colors hover:text-neutral-900 dark:hover:text-white`;

  return (
    <div>
      {titleHref ? (
        /^https?:\/\//i.test(titleHref) ? (
          <a
            href={titleHref}
            className={titleClass}
            {...(titleExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {title}
          </a>
        ) : (
          <Link href={titleHref} className={titleClass}>
            {title}
          </Link>
        )
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
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 h-10 w-10 shrink-0 rounded-lg border border-dashed border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800"
                role="img"
                aria-label="Logo placeholder"
              />
              <p className="min-w-0 font-display text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                General Exchange
              </p>
            </div>
            <FooterNewsletterSignup />
          </div>

          <FooterColumn title="Solutions" titleHref="/solutions">
            <LiLink href="/stocks">Stocks</LiLink>
            <LiLink href="/futures">Futures</LiLink>
            <LiLink href="/options">Options</LiLink>
            <LiLink href="/fixed-income">Fixed Income</LiLink>
          </FooterColumn>

          <FooterColumn title="Products">
            <LiLink href="/consultation">Consultation</LiLink>
            <LiLink href="/bridge-observer">Bridge Observer</LiLink>
            <LiLink href="/town-and-cattle">Town{' & '}Cattle</LiLink>
            <LiLink href="/coffee">Coffee</LiLink>
          </FooterColumn>

          <FooterColumn title="University" titleHref={marketingSubdomainUrl('university')}>
            <li>
              <a
                href="https://www.riskonometry.com"
                className={`${linkClass} inline-flex items-center`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Riskonometry
                <BadgeBeta />
              </a>
            </li>
            <li>
              <Link href="/monte-carlo" className={`${linkClass} inline-flex items-center`}>
                Monte Carlo
                <BadgeNew />
              </Link>
            </li>
            <li>
              <Link href="#" className={linkClass}>
                FINRA Exam Prep
              </Link>
            </li>
            <LiLink href="/assembly">Assembly</LiLink>
          </FooterColumn>

          <FooterColumn title="Company" titleHref={marketingSubdomainUrl('company')}>
            <LiLink href="/our-story">Our Story</LiLink>
            <LiLink href="#">Careers</LiLink>
            <LiLink href="/help-desk">Help Desk</LiLink>
            <LiLink href="/tokenomics">Tokenomics</LiLink>
          </FooterColumn>
        </div>

        <p className="mb-5 border-t border-neutral-200 pt-4 text-[11px] font-light leading-relaxed text-neutral-400 dark:border-neutral-800">
          General Exchange is an educational simulation platform. No content constitutes financial advice or a recommendation
          to buy or sell securities. Simulated results do not guarantee future performance. All trading involves risk.
        </p>

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 text-[12px] text-neutral-400 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            <FooterCopyrightLine className="inline-flex min-h-11 items-center" />
            <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
              ·
            </span>
            <Link
              href="/terms-and-conditions"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Terms and Conditions
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link
              href="/privacy-policy"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link
              href="/legal"
              className="inline-flex min-h-11 items-center rounded-md px-1 hover:text-neutral-900 dark:hover:text-white"
            >
              Legal
            </Link>
          </div>
          <FooterSocialLinks />
        </div>
      </div>
    </footer>
  );
};
