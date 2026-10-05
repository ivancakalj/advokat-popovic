# Advokatska kancelarija Popović – sajt

Statični one-page sajt (HTML/CSS/JS, bez build koraka). Dizajn je rađen po uzoru na Behance koncept „Law Firm Website“, a sadržaj i fotografije su preuzeti sa advokat-popovic.rs.

## Pokretanje
Otvorite `index.html` u pretraživaču ili pokrenite lokalni server:

```bash
python3 -m http.server 8000   # pa otvorite http://localhost:8000
```

## Struktura
- `index.html` – sve sekcije (hero, statistika, o nama, oblasti, kako radimo, tim, slučajevi, pitanja, kontakt, footer)
- `styles.css` – stilovi i responsive prikaz
- `script.js` – meni, animacije, slider, FAQ i validacija kontakt forme
- `assets/img/` – optimizovane fotografije (tim u `assets/img/tim/`)

## Pozivanje telefonom
Svi brojevi su `tel:` linkovi (+381 64 20 14 903 i +381 21 494 449). Na mobilnom je uvek vidljivo plutajuće dugme „Pozovite“.

## Kontakt forma
Forma za sada **ne šalje podatke** – samo proverava polja i prikazuje poruku o uspehu.
Za stvarno slanje izmenite funkciju `sendForm` u `script.js` (npr. Formspree: `fetch('https://formspree.io/f/VAS_ID', …)`).
