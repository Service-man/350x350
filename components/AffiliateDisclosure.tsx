// Amazon Associates requires a clear disclosure wherever affiliate links appear.
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-lg border border-stone-200 bg-paper px-4 py-3 text-[12px] leading-5 text-steel ${className}`}>
      <span className="font-bold text-ink">Disclosure:</span> As an Amazon Associate, BikeKundli earns from
      qualifying purchases. Product links may be affiliate links — buying through them supports the site at no
      extra cost to you. We only list parts and tools relevant to the fix; prices shown are approximate, check
      the current price on Amazon.
    </p>
  );
}
