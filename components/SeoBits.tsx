export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function AdSlot({ id, label }: { id: string; label: string }) {
  // Admin toggles visibility via localStorage config; SSR renders placeholder comment only.
  // Real AdSense script is injected client-side by <AdManager/> when enabled.
  return (
    <div data-ad-slot={id} aria-hidden className="mx-auto max-w-3xl px-4">
      <div className="text-[10px] text-slate-300 text-center py-1 select-none">{label}</div>
    </div>
  );
}
