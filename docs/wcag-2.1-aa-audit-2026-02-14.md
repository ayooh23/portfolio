# WCAG 2.1 AA Accessibility Audit and Remediation
Date: February 14, 2026  
Project: `ayu-portfolio`  
Scope: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx`, `/Users/ayu/Projects/ayu-portfolio/app/layout.tsx`, `/Users/ayu/Projects/ayu-portfolio/app/not-found.tsx`, `/Users/ayu/Projects/ayu-portfolio/app/globals.css`

## Current Compliance Level
- **Before remediation:** Partial WCAG 2.1 AA with major keyboard and focus visibility gaps.
- **After remediation in this change set:** Substantially improved; core keyboard, semantics, landmarks, and status messaging issues addressed without intended visual/function changes.
- **Remaining blockers for full AA:** Color contrast failures that require design approval and manual assistive-tech test execution.

## Audit Method
- Manual code audit against WCAG 2.1 AA success criteria.
- Static validation:
  - `npm run lint` (pass)
  - `npm run build` (pass)
- Note: NVDA/JAWS/VoiceOver/TalkBack + axe/WAVE/Lighthouse runs are not executable in this terminal-only environment and remain manual follow-up tasks.

## Findings by WCAG Criterion
| WCAG SC | Severity | Finding | Status |
|---|---|---|---|
| 2.1.1 Keyboard | Critical | Sliding puzzle tiles were pointer-only (`onPointerDown`) with no keyboard equivalent. | **Fixed** |
| 2.4.1 Bypass Blocks | High | No skip link to main content. | **Fixed** |
| 2.4.7 Focus Visible | High | Global outline reset removed default focus visibility for many controls. | **Fixed** |
| 1.3.1 Info and Relationships | High | Project detail structure used non-semantic containers without reliable heading/list semantics for assistive tech. | **Fixed** |
| 4.1.3 Status Messages | Medium | Dynamic active-tile detail changes were not announced. | **Fixed** |
| 4.1.2 Name, Role, Value | Medium | Decorative markers/icons and loader visuals were over-exposed to screen readers. | **Fixed** |
| 1.1.1 Non-text Content | Medium | Loader image alt text created non-essential noise. | **Fixed** |
| 3.1.1 Language of Page | Low | `lang="en"` was already present. | Pass |
| 1.4.3 Contrast (Minimum) | High | Multiple low-opacity text colors fail 4.5:1 for normal text. | **Open - Requires Design Approval** |

## Fixed Issues With Before/After Examples

### 1) Keyboard access for puzzle tiles (SC 2.1.1)
**Before**
```tsx
<button onPointerDown={onTilePointerDown(tile)} ... />
```

**After**
```tsx
<button
  onPointerDown={onTilePointerDown(tile)}
  onKeyDown={onTileKeyDown(tile)}
  aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
  aria-describedby="puzzle-instructions"
  ...
/>
```
Reference: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:923`, `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:1203`

### 2) Skip navigation (SC 2.4.1)
**Before**
```tsx
<body> ... </body>
```

**After**
```tsx
<body>
  <a href="#main-content" className="skip-link">Skip to main content</a>
  ...
</body>
```
References: `/Users/ayu/Projects/ayu-portfolio/app/layout.tsx:107`, `/Users/ayu/Projects/ayu-portfolio/app/globals.css:355`

### 3) Focus visibility restoration (SC 2.4.7)
**Before**
```css
*, :after, :before {
  outline: none;
}
```

**After**
```css
:where(a, button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])):focus-visible {
  outline: 2px solid #111;
  outline-offset: 2px;
}
```
Reference: `/Users/ayu/Projects/ayu-portfolio/app/globals.css:348`

### 4) Dynamic status announcements (SC 4.1.3)
**Before**
```tsx
// No live announcement when active project changed
```

**After**
```tsx
<p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {activeTile ? `Showing details for ${activeTile.title}.` : "No project is selected."}
</p>
```
Reference: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:1053`

### 5) Loader semantics and decorative media suppression (SC 1.1.1, 4.1.2)
**Before**
```tsx
<div aria-live="polite" aria-label="Loading portfolio">
  <Image alt={`Loading gallery image ${loaderImageIndex + 1}`} ... />
</div>
```

**After**
```tsx
<div role="status" aria-live="polite" aria-atomic="true" aria-label="Loading portfolio content">
  <p className="sr-only">Loading portfolio content. Please wait.</p>
  <div aria-hidden="true">...</div>
  <Image alt="" aria-hidden="true" ... />
</div>
```
Reference: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:991`

### 6) Semantic relationships and headings without visual regression (SC 1.3.1, 2.4.6)
**Before**
```tsx
<div className={detailTitleClass}>{title}</div>
```

**After**
```tsx
<h3 id={headingId} className="sr-only">{title}</h3>
<div aria-hidden="true" className={detailTitleClass}>{title}</div>
```
Reference: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:102`

## Issues Requiring Design Approval (Not Implemented)

### Contrast failures (SC 1.4.3 Contrast Minimum)
- `text-[#111]/55` on white computes to about **4.17:1** (fails for normal text < 18pt/24px).
  - Example usage: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:1267`, `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:1513`
- `text-[#111]/42` on white computes to about **2.78:1** (fails for all normal body text).
  - Example usage: `/Users/ayu/Projects/ayu-portfolio/app/page.tsx:1175`

These require color/token updates and therefore design approval.

## Additional Notes on Requested Scope
- Forms: No forms or validation UI are present in scope files; form criteria are currently not applicable.
- Tables: No data tables are present in scope files; table criteria are currently not applicable.
- Audio/video captions/transcripts: No audio/video player components found in scope files.

## Maintenance Checklist
- [ ] Every new custom interaction supports keyboard (`Tab`, `Enter/Space`, and directional keys when relevant).
- [ ] Do not suppress focus outlines globally unless replaced with `:focus-visible` styles.
- [ ] Keep a skip link targeting the primary content container (`#main-content`).
- [ ] Keep decorative visuals `aria-hidden="true"` and use empty `alt` for decorative images.
- [ ] Ensure dynamic UI state changes have appropriate live region messaging.
- [ ] Keep heading structure logical (`h1` -> `h2` -> `h3`) even if headings are visually hidden.
- [ ] Re-test contrast whenever text opacity/color tokens change.
- [ ] Run manual assistive-tech checks (NVDA, JAWS, VoiceOver, TalkBack) before release.
- [ ] Run browser-based automated checks (axe DevTools, WAVE, Lighthouse) before release.
