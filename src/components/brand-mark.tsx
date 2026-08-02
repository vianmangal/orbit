export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="Daily Orbit">
      <span className="brand-orbit" aria-hidden="true">
        <span />
      </span>
      {!compact && (
        <span className="brand-name">
          Daily <strong>Orbit</strong>
        </span>
      )}
    </div>
  );
}
