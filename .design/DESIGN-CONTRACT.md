# GdjeSjedim mobile-only design contract

## Art direction
Topla editorial proslava: papirnata ivory podloga, cream paneli, DM Serif Display za naslove i imena stolova, Inter za kontrole. Gold je CTA/selection accent, terracotta/blush je highlight i success accent. Dekoracija ostaje tanka i organska, nikad preko mape.

## Shell and responsive behavior
- Aplikacija je namjerno mobile-only: sadržaj je `width: 100%`, `max-width: 480px`, centriran samo kao pregled na većem viewportu.
- Primarna QA meta je 390×844; sve kontrole moraju biti dosegljive jednom rukom i najmanje 44px.
- Nema desktop sidebar/workspace varijante. Na većim širinama samo raste vanjski ivory margin, ne interni layout.

## Map composition
- Naslov i korak su kratki; mapa je dominantna vizualna površina.
- Javni link ispod naslova koristi kompaktni segmentirani prekidač `Gost / Admin`. Gost je zadano stanje; Admin otvara bottom-sheet za šifru i tek nakon uspješne provjere prelazi u uređivanje događaja.
- Admin uređuje isti identifikator događaja koji je otvoren na javnom linku; promjene stolova i gostiju spremaju se odmah i ostaju dostupne na istom slugu bez stvaranja kopije događaja.
- Mapa je relativno pozicionirani cream/paper canvas visine oko 432px, bez horizontalnog pomicanja.
- Pregledno stanje koristi interaktivne čvorove od 120×120px i optički povećane imagegen ilustracije od 132×132px, tako da uvučene stolice ostaju neposredno uz kartice imena bez širenja drag područja. Početni fit zoom je 80%. Okrugli i četvrtasti stol imaju svečani ivory-damask stolnjak, champagne-zlatni rub i osam duboko uvučenih stolica; naziv i popunjenost ostaju čitljivi na čistoj sredini stola.
- Kartice gostiju koriste dinamički kružni raspored; za devet gostiju jedan prsten ima radijus oko 92px, kartice do 58px i prijelom imena u najviše dva retka. Kartice ostaju neposredno uz vanjski rub uvučenih stolica.
- Prazna površina mape može se pomicati povlačenjem. Horizontalni blok gore desno (`−`, postotak/reset, `+`) mijenja zoom u rasponu 70–180%; pinch i kotačić rade uz kontrole, a reset koristi 80% za pregled cijele mape.
- Dodir na stol otvara fokusirani sloj: stol je centriran, a numerirane kartice gostiju raspoređene su lijevo i desno. Za više od 10 gostiju koristi se pomični dvokolonski popis.
- Raspored stolova i popis gostiju su na jednom ekranu. Dodavanje gostiju otvara bottom-sheet popup, a neraspoređeni gosti ostaju kao velike draggable chips ispod mape.
- Pregled dodjele grupira goste po stolovima; numeracija za svaki stol ponovno kreće od 1, a ispod je ukupan broj gostiju.
- Inspector se na mobitelu otvara kao bottom sheet: naziv, kapacitet, oblik, brisanje samo ako je sigurno.

## Interaction states
- Dragged guest dobiva gold outline i lagano podizanje; valid drop target dobiva terracotta ring; pun stol dobiva jasnu capacity poruku.
- Povlačenje gosta iz fokusiranog prikaza zatvara fokus i vraća pregledne drop targete.
- Stol koji je pronađen javnom pretragom dobiva gold ring i automatski otvara fokusirani prikaz.
- Svaka drag-and-drop radnja ima pristupačan tap/keyboard ekvivalent.

## Public event
- Javni link prvo prikazuje naslov, datum, pretragu i cijelu mapu.
- Svi stolovi su odmah vidljivi u preglednom stanju. Dodir ili pretraga otvaraju imena jednog stola, a zatvaranje fokusa vraća cijelu mapu.
- Fotografije su javno vidljive, ali koš za brisanje vidi samo browser koji je fotografiju dodao. Worker vraća vlasnički token samo pri uploadu, u D1 sprema samo njegov SHA-256 otisak, a potvrđeno brisanje uklanja zapis i obje WebP varijante iz R2.

## Surfaces and motion
- Koristiti postojeće radius/shadow tokene; kartice samo za jasne grupe i stanja.
- Ulazi, selekcije i drag feedback koriste 150–300ms ease-out. Poštovati `prefers-reduced-motion`.
