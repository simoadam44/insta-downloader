import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Downloader from '@/components/Downloader';
import { HowTo, MobileAppBanner, FeatureBlocks, WhyUs } from '@/components/ContentSections';
import Faq from '@/components/Faq';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSlot, { JsonLd } from '@/components/SeoBits';
import {
  LOCALES,
  TOOLS,
  isValidLocale,
  type Locale,
  type ToolSlug
} from '@/lib/i18n';
import {
  canonicalFor,
  faqsFor,
  faqSchema,
  hreflangLinks,
  howToSchema,
  metaFor,
  webAppSchema
} from '@/lib/seo';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => TOOLS.map((tool) => ({ lang, tool })));
}

export async function generateMetadata({
  params
}: {
  params: { lang: string; tool: string };
}): Promise<Metadata> {
  if (!isValidLocale(params.lang) || !(TOOLS as readonly string[]).includes(params.tool)) return {};
  const locale = params.lang as Locale;
  const tool = params.tool as ToolSlug;
  const { title, description } = metaFor(locale, tool);
  const languages = Object.fromEntries(hreflangLinks(tool).map((h) => [h.hreflang, h.href]));
  return {
    title,
    description,
    alternates: { canonical: canonicalFor(locale, tool), languages },
    openGraph: {
      title,
      description,
      url: canonicalFor(locale, tool),
      type: 'website',
      siteName: 'SSSInstagram'
    },
    twitter: { card: 'summary_large_image', title, description }
  };
}

export default function ToolPage({ params }: { params: { lang: string; tool: string } }) {
  if (!isValidLocale(params.lang) || !(TOOLS as readonly string[]).includes(params.tool)) notFound();
  const locale = params.lang as Locale;
  const tool = params.tool as ToolSlug;
  const faqs = faqsFor(locale, tool);

  return (
    <>
      <JsonLd data={webAppSchema(locale, tool)} />
      <JsonLd data={howToSchema(locale)} />
      <JsonLd data={faqSchema(faqs)} />
      <Header locale={locale} activeTool={tool} />
      <main>
        <AdSlot id="header" label="Advertisement — header" />
        <Downloader locale={locale} activeTool={tool} />
        <AdSlot id="below-input" label="Advertisement" />
        <section className="mx-auto max-w-3xl px-4 mt-6">
          <h2 className="text-xl font-semibold text-indigo-900">Instagram Highlight Downloader</h2>
          <p className="text-[13px] text-slate-600 mt-2">
            Being able to download Instagram Highlights is a useful feature that allows you to save
            videos and Highlights from Instagram to your device. Downloading is easy and can be done
            in just a few steps — copy, paste, download.
          </p>
        </section>
        <HowTo locale={locale} />
        <MobileAppBanner locale={locale} />
        <AdSlot id="above-result" label="Advertisement" />
        <FeatureBlocks locale={locale} />
        <WhyUs locale={locale} />
        <Faq locale={locale} faqs={faqs} />
      </main>
      <AdSlot id="footer" label="Advertisement — footer" />
      <Footer locale={locale} />
    </>
  );
}
