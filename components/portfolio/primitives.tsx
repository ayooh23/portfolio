import type { ReactNode } from "react";
import {
  detailMarkerSlotClass,
  detailRowClass,
  detailTitleClass,
  markerBadgeClass,
} from "@/components/portfolio/constants";

export function NumberBadge({ n }: { n: number }) {
  return (
    <div aria-hidden="true" className={markerBadgeClass}>
      {n}
    </div>
  );
}

export function PlusBadge() {
  return (
    <div aria-hidden="true" className={markerBadgeClass}>
      +
    </div>
  );
}

export function DetailSection({
  marker,
  title,
  headingId,
  children,
}: {
  marker: ReactNode;
  title: string;
  headingId: string;
  children: ReactNode;
}) {
  return (
    <section data-active-line className={detailRowClass} aria-labelledby={headingId}>
      <div className={detailMarkerSlotClass}>{marker}</div>
      <div>
        <h3 id={headingId} className="sr-only">
          {title}
        </h3>
        <div aria-hidden="true" className={detailTitleClass}>
          {title}
        </div>
        {children}
      </div>
    </section>
  );
}
