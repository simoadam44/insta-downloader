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
