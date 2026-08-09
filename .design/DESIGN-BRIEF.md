# Product

## Product
GdjeSjedim je mobile-first alat za izradu rasporeda sjedenja za proslave. Organizator učita pozivnicu, doda goste, nacrta raspored stolova i pošalje jedan javni link.

## Core user
Organizator krštenja, vjenčanja, rođendana ili druge proslave koji želi brzo složiti stvarni raspored bez računa i složenog event-management sučelja. Radi prvenstveno na mobitelu, uz udobniji desktop prikaz kada uređuje veću mapu.

## Product goal
Smanjiti ručni rad i nesigurnost oko sjedenja: organizator mora odmah vidjeti tko sjedi za kojim stolom, a gost mora kroz link odmah pronaći svoj stol i cijeli raspored.

## Primary action
Složiti i objaviti raspored stolova.

## Required screens / features
- [x] Landing i postojeći wizard upload → podaci → raspored stolova + gosti → objava → share
- [x] Originalna učitana pozivnica ostaje ista nakon navigacije i refresh-a
- [x] Slobodna mapa stolova s oblikom, kapacitetom, pozicijom i uređivanjem
- [x] Dodavanje gostiju kroz popup, drag-and-drop uz tap/keyboard fallback i pregled dodjele s rednim brojevima
- [x] Javni link s mapom svih stolova, imenima i pretragom gosta
- [x] Responsive PWA i postojeći lokalni repository

## Visual personality
- [x] topao
- [x] editorial
- [x] elegantan
- [x] intiman i celebratory

## Avoid
- [ ] generički SaaS dashboard
- [ ] plavi/ljubičasti gradijenti, glow i glassmorphism
- [ ] dekoracija koja skriva mapu ili primarnu radnju
- [ ] promjena originalne pozivnice u generirani mock

## Brand
Postojeći identitet koristi GdjeSjedim.hr, DM Serif Display, Inter, ivory/cream/gold/charcoal/blush paletu i tanke Lucide ikone. Smjer ostaje topao editorial, ali dobiva jaču hijerarhiju, papirnate površine i terakota akcent za interaktivne mape.

## References
Postojeća referenca `flow.png` je north star za toplinu, pozivnicu, editorial serif i gold CTA. Nove reference ciljaju desktop map-first organizer workspace i mobile-first stacked map.

## Content / assets
Postojeći hrvatski copy, mock extraction podaci, schedule podaci, PWA ikone i QR/share komponente. Originalne slike/PDF pozivnice spremaju se kao lokalni browser asset.

## Technical constraints
Vite + React 19 + JavaScript + Tailwind v4 + react-router-dom + framer-motion + lucide-react + vite-plugin-pwa. Bez backenda; repository abstraction i lokalni storage ostaju zamjenjivi.

## Assumptions
Javni prikaz pokazuje imena gostiju po stolovima jer je to izričito odabrani product behavior. IndexedDB čuva binarni originalni upload, localStorage čuva draft metadata i repository podatke.
