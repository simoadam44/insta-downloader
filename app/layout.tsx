import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://your-project.vercel.app'
  ),
  title: {
    default: 'SSSInstagram — Instagram Video, Photo, Reels, Story & Highlights Downloader',
    template: '%s | SSSInstagram'
  },
  description:
    'Download Instagram photos, videos, Reels, Stories and Highlights in HD. Free, fast, anonymous, no login.',
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#a855f7'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
