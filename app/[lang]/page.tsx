import { redirect } from 'next/navigation';
import { isValidLocale } from '@/lib/i18n';

export default function LangIndex({ params }: { params: { lang: string } }) {
  if (!isValidLocale(params.lang)) redirect('/en/highlights-downloader');
  redirect(`/${params.lang}/highlights-downloader`);
}
