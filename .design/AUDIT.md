# Visual audit

## Mobile 390×844

- Product intent — PASS: upload, guest list, seating map and public link remain the dominant flow.
- Composition — PASS: the seating canvas is the focal point and the guest tray follows it naturally.
- Hierarchy — PASS: map heading, capacity status and primary CTA are easy to scan.
- Primary action — PASS: `Nastavi na objavu` is sticky and remains reachable above the mobile safe area.
- Responsive adaptation — PASS: mobile-only shell stays within the viewport at 375, 390 and 430px.
- Interaction presentation — PASS: table drag, guest drag, tap fallback and inspector states are explicit.

## Desktop QA viewport 1440×1000

- PASS as an intentional mobile-only presentation: the application stays a centered 480px shell rather than becoming a separate desktop product.
- No desktop-specific navigation or dense workspace was introduced.

## Refinement

The first functional pass was refined by keeping the page transition content visible for deterministic QA and moving default table nodes below the map label. No MAJOR findings remain.
