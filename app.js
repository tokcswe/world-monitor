/* World Monitor v0.1 – static GitHub Pages app, no API key needed. */
(() => {
  'use strict';

  const FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
  const REFRESH_MS = 5 * 60 * 1000;
  const $ = (id) => document.getElementById(id);
  const state = { events: [], minMag: 2.5, loading: false, fetchedAt: null, map: null, markers: null };
  const shortDate = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const clockDate = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit' });
  const utcClock = new Intl.DateTimeFormat('sv-SE', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  function severity(mag) {
    if (mag >= 6) return { name: 'extreme', color: '#fb5d6c' };
    if (mag >= 5) return { name: 'high', color: '#fb8b61' };
    if (mag >= 4) return { name: 'moderate', color: '#f3c46e' };
    return { name: 'low', color: '#24a9cf' };
  }
  function showStatus(label, kind) {
    $('status-label').textContent = label;
    $('status-dot').className = 'status-dot' + (kind === 'ok' ? ' connected' : kind === 'error' ? ' error' : '');
  }
  function startClock() {
    const tick = () => { $('utc-clock').textContent = utcClock.format(new Date()) + ' UTC'; };
    tick(); setInterval(tick, 1000);
    $('year').textContent = String(new Date().getFullYear());
  }
  function makeMap() {
    if (typeof L === 'undefined') {
      $('map-error').hidden = false;
      $('map-error').textContent = 'Kartbiblioteket kunde inte laddas. Kontrollera internetanslutningen.';
      return;
    }
    state.map = L.map('map', { worldCopyJump: true, zoomControl: false, minZoom: 2 }).setView([16, 0], 2);
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(state.map);
    state.markers = L.layerGroup().addTo(state.map);
  }
  function createPopup(event) {
    const wrap = document.createElement('div');
    wrap.className = 'event-popup';
    const title = document.createElement('strong');
    title.textContent = `M ${event.mag.toFixed(1)} · ${event.place}`;
    const detail = document.createElement('span');
    detail.textContent = `${shortDate.format(new Date(event.time))} · ${Math.round(event.depth)} km djup`;
    wrap.append(title, detail);
    if (event.url) {
      const link = document.createElement('a');
      link.href = event.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Visa hos USGS ↗';
      wrap.append(link);
    }
    return wrap;
  }
  function setText(id, value) { $(id).textContent = String(value); }
  function paintStats() {
    const events = state.events;
    setText('stat-total', events.length);
    const biggest = events.reduce((best, e) => !best || e.mag > best.mag ? e : best, null);
    setText('stat-max', biggest ? biggest.mag.toFixed(1) : '—');
    setText('stat-max-place', biggest ? biggest.place : 'Inga registreringar');
    setText('stat-strong', events.filter(e => e.mag >= 4.5).length);
    const latest = events[0];
    setText('stat-latest', latest ? clockDate.format(new Date(latest.time)) : '—');
    setText('stat-latest-detail', latest ? shortDate.format(new Date(latest.time)) + ' (lokal tid)' : 'Inga registreringar');
  }
  function paintEvents() {
    // USGS kan inkludera t.ex. M 2,47 i sitt 2,5+-flöde (avrundning).
    const visible = state.events.filter(e => Number(e.mag.toFixed(1)) >= state.minMag);
    setText('feed-count', visible.length);
    setText('map-visible', visible.length);
    const list = $('event-list');
    list.replaceChildren();
    if (state.markers) state.markers.clearLayers();
    for (const event of visible) {
      const sev = severity(event.mag);
      if (state.map && state.markers) {
        const marker = L.circleMarker([event.lat, event.lon], {
          radius: Math.max(5, Math.min(16, event.mag * 2.05)),
          color: sev.color, fillColor: sev.color, fillOpacity: 0.27,
          weight: 1.6, opacity: 0.94
        });
        marker.bindPopup(createPopup(event));
        marker.addTo(state.markers);
        event.marker = marker;
      }
    }
    if (!visible.length) {
      const li = document.createElement('li');
      li.className = 'empty-event';
      li.textContent = 'Inga händelser matchar filtret under de senaste 24 timmarna.';
      list.append(li);
      return;
    }
    visible.slice(0, 15).forEach((event) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'event-row';
      button.title = 'Visa platsen på kartan';
      const mag = document.createElement('span');
      mag.className = 'magnitude ' + severity(event.mag).name;
      mag.textContent = event.mag.toFixed(1);
      const body = document.createElement('span');
      body.className = 'event-details';
      const place = document.createElement('span');
      place.className = 'event-place';
      place.textContent = event.place;
      place.style.display = 'block';
      const meta = document.createElement('span');
      meta.className = 'event-meta';
      meta.textContent = `${shortDate.format(new Date(event.time))} · ${Math.round(event.depth)} km djup`;
      meta.style.display = 'block';
      body.append(place, meta);
      const arrow = document.createElement('span');
      arrow.className = 'event-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '›';
      button.append(mag, body, arrow);
      button.addEventListener('click', () => {
        if (state.map && event.marker) {
          state.map.setView([event.lat, event.lon], 5, { animate: true });
          event.marker.openPopup();
        }
      });
      li.append(button);
      list.append(li);
    });
  }
  function safeUSGSLink(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname === 'earthquake.usgs.gov' ? parsed.href : null;
    } catch { return null; }
  }
  function validateFeature(feature) {
    const coords = feature?.geometry?.coordinates;
    const p = feature?.properties;
    if (!Array.isArray(coords) || coords.length < 3 || typeof p?.mag !== 'number' || !Number.isFinite(p.time)) return null;
    const [lon, lat, depth] = coords;
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return {
      mag: p.mag, place: String(p.place || 'Okänd plats'), time: p.time,
      lon, lat, depth: Number.isFinite(depth) ? depth : 0,
      url: safeUSGSLink(p.url)
    };
  }
  async function loadEvents() {
    if (state.loading) return;
    state.loading = true;
    $('refresh-button').disabled = true;
    showStatus('HÄMTAR DATA', 'loading');
    try {
      const response = await fetch(FEED_URL, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.features)) throw new Error('Ogiltigt dataformat');
      state.events = payload.features.map(validateFeature).filter(Boolean).sort((a, b) => b.time - a.time);
      state.fetchedAt = Date.now();
      paintStats(); paintEvents();
      showStatus('DATA AKTUELL', 'ok');
      $('map-error').hidden = true;
      setText('last-updated', 'Senast synkad: ' + clockDate.format(new Date(state.fetchedAt)));
    } catch (error) {
      console.error('USGS feed error:', error);
      showStatus('DATA EJ TILLGÄNGLIG', 'error');
      $('map-error').hidden = false;
      $('map-error').textContent = state.fetchedAt
        ? 'Kunde inte uppdatera USGS just nu. Tidigare hämtade händelser visas fortfarande.'
        : 'Kunde inte hämta data från USGS. Kontrollera anslutningen och tryck Uppdatera.';
      if (!state.fetchedAt) {
        $('event-list').replaceChildren();
        const li = document.createElement('li');
        li.className = 'empty-event';
        li.textContent = 'Ingen data kunde laddas. Försök igen med Uppdatera.';
        $('event-list').append(li);
      }
    } finally {
      state.loading = false;
      $('refresh-button').disabled = false;
    }
  }
  document.querySelectorAll('[data-min-mag]').forEach(button => {
    button.addEventListener('click', () => {
      state.minMag = Number(button.dataset.minMag);
      document.querySelectorAll('[data-min-mag]').forEach(b => {
        const active = b === button;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      if (state.fetchedAt) paintEvents();
    });
  });
  $('refresh-button').addEventListener('click', loadEvents);
  startClock();
  makeMap();
  loadEvents();
  setInterval(loadEvents, REFRESH_MS);
})();
