# QuizCast

A responsive single-page web app combining a timed quiz, speed-based scoring, a persistent localStorage leaderboard, and an asynchronous weather dashboard.

## Features

- 10-question timed quiz
- 15-second timer per question
- Speed bonus scoring
- Top-10 leaderboard saved in `localStorage`
- Async city search + current weather + 5-day forecast
- `AbortController` cancels stale weather requests
- Error states for invalid cities/API failures
- Persistent light/dark theme
- Responsive layout

## Run locally

Because the app uses `fetch()`, serve it over HTTP:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Public REST API

Weather is powered by Open-Meteo:

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

No API key is required for ordinary non-commercial usage. Check Open-Meteo's current terms before production/commercial deployment.

## Customize questions

Edit the `questions` array near the top of `script.js`.
