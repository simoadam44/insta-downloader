import type { Metadata } from 'next';

function Legal({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-slate-600 mt-3 whitespace-pre-line">{body}</p>
      <a href="/en/highlights-downloader" className="text-sm text-fuchsia-700 underline mt-4 inline-block">
        ← Back to downloader
      </a>
    </main>
  );
}

export const metadata: Metadata = { robots: { index: false } };

export function TermsPage() {
  return <Legal title="Terms of Service" body="Use this tool for personal, lawful purposes only. Do not download content you do not own or lack permission to use. We provide no warranty." />;
}

export function PrivacyPage() {
  return <Legal title="Privacy Policy" body="We do not require login and do not store pasted URLs longer than needed to process a request. Anonymous analytics may be used to improve reliability." />;
}

export function DisclaimerPage() {
  return <Legal title="Disclaimer" body="This is an independent tool, not affiliated with Instagram or Meta. All trademarks belong to their owners. Respect copyright and Instagram's Terms." />;
}
