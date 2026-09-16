import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LOCALES, isValidLocale, type Locale, type ToolSlug } from '@/lib/i18n';
import { RTL_LOCALES } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l }));
}

export default function LangLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isValidLocale(params.lang)) notFound();
  const locale = params.lang as Locale;
  // Header activeTool is set per-page via data attribute; default highlights for layout shell.
  // Pages under [tool] render their own Header, so this layout only sets lang/dir.
  return (
    <div lang={locale} dir={RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
}

// Keep per-tool metadata in [tool]/page.tsx; this is a fallback.
export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return { alternates: { canonical: `/${params.lang}` } };
}

export function LangShell({
  locale,
  activeTool,
  children
}: {
  locale: Locale;
  activeTool: ToolSlug;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header locale={locale} activeTool={activeTool} />
      <main>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
