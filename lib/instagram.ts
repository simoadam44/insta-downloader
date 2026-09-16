export type MediaType = 'video' | 'photo' | 'reel' | 'story' | 'highlight' | 'carousel';

export type MediaItem = {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  width?: number;
  height?: number;
  quality: string;
  caption?: string;
};

export type ExtractResult = {
  author: string;
  caption: string;
  thumbnail: string;
  detectedType: MediaType;
  items: MediaItem[];
};

const IG_RE =
  /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv|stories|s|share)\//i;

export function isInstagramUrl(input: string): boolean {
  try {
    const u = new URL(input.trim());
    return IG_RE.test(u.href);
  } catch {
    return false;
  }
}

export function detectType(input: string): MediaType {
  const s = input.toLowerCase();
  if (s.includes('/reel')) return 'reel';
  if (s.includes('/stories/')) return 'story';
  if (s.includes('/s/') || s.includes('highlight')) return 'highlight';
  if (s.includes('/p/') || s.includes('/tv/')) return 'video';
  return 'photo';
}

// Path segments that are route keywords, NOT usernames.
const RESERVED = new Set([
  'p', 'reel', 'reels', 'tv', 'stories', 's', 'share', 'explore',
  'accounts', 'direct', 'about', 'developer', 'embed'
]);

// URL patterns like /p/<code>, /reel/<code>, /tv/<code> contain NO username —
// the only non-reserved segment is the shortcode, which must NOT be shown as author.
const NO_USER_BEFORE = new Set(['p', 'reel', 'reels', 'tv', 's', 'share']);

/** Best-effort username from an Instagram URL, or null when the path has none. */
export function extractAuthor(igUrl: string): string | null {
  try {
    const u = new URL(igUrl);
    const segs = u.pathname.split('/').filter(Boolean);
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i].toLowerCase();
      if (RESERVED.has(s)) continue;
      if (i > 0 && NO_USER_BEFORE.has(segs[i - 1].toLowerCase())) return null;
      return segs[i];
    }
    return null;
  } catch {
    return null;
  }
}

export async function extractMedia(url: string): Promise<ExtractResult> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || 'Extraction failed');
  }
  return res.json();
}
