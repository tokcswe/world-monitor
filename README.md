# World Monitor v0.1

En liten, publik, cyberpunk-inspirerad världskarta med jordbävningar från USGS. Byggd för att kunna utvecklas direkt i webbläsaren och publiceras med GitHub Pages.

## Funktioner

- Interaktiv världskarta (Leaflet + CARTO Dark Matter, med OpenStreetMap-data)
- Jordbävningar med magnitud ≥2,5 från de senaste 24 timmarna (USGS)
- Filtrering på magnitud 2,5+, 4,5+ och 6,0+
- Händelseflöde – klicka för att zooma till en jordbävning
- Fyra statistikfält och en UTC-klocka
- Automatisk uppdatering var femte minut och en manuell uppdateringsknapp
- Anpassad layout för mobil och dator

## Publicera direkt på GitHub Pages

1. Skapa en **publik** GitHub-repo, t.ex. `world-monitor`.
2. Välj **Add file → Upload files** och dra in filerna `index.html`, `styles.css`, `app.js`, `.nojekyll` och `README.md` (inte zip-filen). Gör en commit.
3. Gå till **Settings → Pages**.
4. Under **Build and deployment**, välj **Deploy from a branch**. Välj **main** och **/(root)** och tryck **Save**.
5. När GitHub Pages har publicerat sajten hittar du den normalt på `https://DITT-NAMN.github.io/world-monitor/` om repot heter `world-monitor`.

Du kan även öppna `index.html` lokalt i en webbläsare (internet krävs för karta och jordbävningsdata), eller ändra kod i `github.dev` genom att trycka `.` i GitHub-repot.

## Filstruktur

```text
index.html   Webbplatsens innehåll
styles.css   Cyberpunk-stil och responsiv design
app.js       Karta, USGS-data, filter och uppdatering
.nojekyll    Ser till att GitHub Pages behandlar filerna som en statisk sida
README.md    Dokumentation
```

## Datakällor och attribution

- USGS: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- USGS GeoJSON: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson
- Leaflet: https://leafletjs.com/
- Karttiles: CARTO Dark Matter, baserad på OpenStreetMap-data

Tiden och antalet händelser styrs av USGS-flödet. Det är **inte** ett sekund-för-sekund-system; USGS kan också revidera eller komplettera sina registreringar. Om källan inte kan nås visas ett felmeddelande. Kartan och typsnitten kräver internet.

## Nästa steg

- Lägg till ytterligare offentliga datakällor (t.ex. flyg, satelliter, vädervarningar).
- Spara användarens favoritfilter med localStorage.
- Lägg till en riktig inställningspanel och flerspråkighet.
- Introducera tester innan projektet växer.
