const QUIZ_SECONDS = 15;
const LEADERBOARD_KEY = "quizcast-leaderboard-v1";
const THEME_KEY = "quizcast-theme-v1";

const questions = [
  { question: "Which JavaScript method converts a JSON string into an object?", answers: ["JSON.parse()", "JSON.stringify()", "Object.fromJSON()", "JSON.decode()"], correct: 0 },
  { question: "What does HTTP status code 404 indicate?", answers: ["Not Found", "Unauthorized", "Server Error", "Created"], correct: 0 },
  { question: "Which browser API stores key-value data that persists after a page reload?", answers: ["localStorage", "requestAnimationFrame", "history", "IntersectionObserver"], correct: 0 },
  { question: "Which keyword pauses an async function until a Promise settles?", answers: ["await", "yield", "defer", "pause"], correct: 0 },
  { question: "What is the result of 3 ** 2 in JavaScript?", answers: ["9", "6", "8", "32"], correct: 0 },
  { question: "Which CSS layout system is designed for two-dimensional rows and columns?", answers: ["Grid", "Flexbox", "Float", "Inline flow"], correct: 0 },
  { question: "Which HTTP method is normally used to retrieve data without changing server state?", answers: ["GET", "POST", "PATCH", "DELETE"], correct: 0 },
  { question: "What does Array.prototype.map() return?", answers: ["A new array", "A single number", "A boolean only", "The original array reference only"], correct: 0 },
  { question: "Which HTML element is best for a page's primary navigation links?", answers: ["<nav>", "<section>", "<aside>", "<main>"], correct: 0 },
  { question: "Which value is returned by typeof null in JavaScript?", answers: ['"object"', '"null"', '"undefined"', '"number"'], correct: 0 }
];

const $ = (selector) => document.querySelector(selector);
const startScreen = $("#startScreen"), questionScreen = $("#questionScreen"), resultScreen = $("#resultScreen");
const playerNameInput = $("#playerName"), startError = $("#startError"), scoreEl = $("#score");
const questionCounter = $("#questionCounter"), timerText = $("#timerText"), timerBar = $("#timerBar");
const questionText = $("#questionText"), answersEl = $("#answers"), feedbackEl = $("#feedback");
const leaderboardEl = $("#leaderboard"), emptyLeaderboard = $("#emptyLeaderboard");

let quiz = { player: "", index: 0, score: 0, correct: 0, secondsLeft: QUIZ_SECONDS, timerId: null, locked: false };

function safeLoadLeaderboard() {
  try {
    const stored = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch { return []; }
}
function safeSaveLeaderboard(entries) {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries)); return true; }
  catch { return false; }
}
function renderLeaderboard() {
  const entries = safeLoadLeaderboard().sort((a,b) => b.score-a.score || b.correct-a.correct).slice(0,10);
  leaderboardEl.innerHTML = "";
  emptyLeaderboard.classList.toggle("hidden", entries.length > 0);
  entries.forEach((entry,index) => {
    const li = document.createElement("li"); li.className = "leaderboard-entry";
    const rank = document.createElement("span"); rank.className = "rank"; rank.textContent = index+1;
    const meta = document.createElement("div"); meta.className = "player-meta";
    const name = document.createElement("strong"); name.textContent = entry.name;
    const details = document.createElement("span"); details.textContent = `${entry.correct}/${questions.length} correct • ${new Date(entry.date).toLocaleDateString()}`;
    meta.append(name, details);
    const score = document.createElement("span"); score.className = "leader-score"; score.textContent = entry.score;
    li.append(rank,meta,score); leaderboardEl.append(li);
  });
}
function startQuiz() {
  const player = playerNameInput.value.trim();
  if (!player) { startError.textContent = "Enter a player name before starting."; playerNameInput.focus(); return; }
  startError.textContent = "";
  quiz = { player, index: 0, score: 0, correct: 0, secondsLeft: QUIZ_SECONDS, timerId: null, locked: false };
  startScreen.classList.add("hidden"); resultScreen.classList.add("hidden"); questionScreen.classList.remove("hidden"); scoreEl.textContent = "0";
  renderQuestion();
}
function renderQuestion() {
  clearInterval(quiz.timerId); quiz.locked = false; quiz.secondsLeft = QUIZ_SECONDS;
  feedbackEl.textContent = ""; feedbackEl.className = "feedback";
  const current = questions[quiz.index];
  questionCounter.textContent = `Question ${quiz.index+1} / ${questions.length}`; questionText.textContent = current.question;
  timerText.textContent = `${quiz.secondsLeft}s`; timerBar.style.width = "100%"; answersEl.innerHTML = "";
  current.answers.forEach((answer,index) => {
    const button = document.createElement("button"); button.type = "button"; button.className = "answer-button"; button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(index)); answersEl.append(button);
  });
  quiz.timerId = setInterval(() => {
    quiz.secondsLeft -= 1; timerText.textContent = `${quiz.secondsLeft}s`; timerBar.style.width = `${(quiz.secondsLeft/QUIZ_SECONDS)*100}%`;
    if (quiz.secondsLeft <= 0) { clearInterval(quiz.timerId); handleTimeout(); }
  },1000);
}
function chooseAnswer(selectedIndex) {
  if (quiz.locked) return; quiz.locked = true; clearInterval(quiz.timerId);
  const current = questions[quiz.index]; const buttons = [...answersEl.querySelectorAll(".answer-button")];
  buttons.forEach(button => { button.disabled = true; }); buttons[current.correct].classList.add("correct");
  if (selectedIndex === current.correct) {
    quiz.correct += 1; const speedBonus = quiz.secondsLeft*2; const points = 100+speedBonus; quiz.score += points; scoreEl.textContent = quiz.score;
    feedbackEl.textContent = `Correct! +${points} points (${speedBonus} speed bonus).`; feedbackEl.classList.add("success");
  } else {
    buttons[selectedIndex].classList.add("wrong"); feedbackEl.textContent = `Not quite. The correct answer is ${current.answers[current.correct]}.`; feedbackEl.classList.add("error");
  }
  setTimeout(nextQuestion,900);
}
function handleTimeout() {
  if (quiz.locked) return; quiz.locked = true;
  const current = questions[quiz.index]; const buttons = [...answersEl.querySelectorAll(".answer-button")];
  buttons.forEach(button => { button.disabled = true; }); buttons[current.correct].classList.add("correct");
  feedbackEl.textContent = `Time's up. The correct answer is ${current.answers[current.correct]}.`; feedbackEl.classList.add("error");
  setTimeout(nextQuestion,1000);
}
function nextQuestion() { quiz.index += 1; if (quiz.index >= questions.length) finishQuiz(); else renderQuestion(); }
function finishQuiz() {
  clearInterval(quiz.timerId); questionScreen.classList.add("hidden"); resultScreen.classList.remove("hidden");
  $("#resultHeadline").textContent = `${quiz.player}, quiz complete!`; $("#resultText").textContent = `You scored ${quiz.score} points with ${quiz.correct}/${questions.length} correct answers.`;
  const leaderboard = safeLoadLeaderboard(); leaderboard.push({ name: quiz.player, score: quiz.score, correct: quiz.correct, date: new Date().toISOString() });
  safeSaveLeaderboard(leaderboard.sort((a,b) => b.score-a.score || b.correct-a.correct).slice(0,10)); renderLeaderboard();
}
function resetQuiz() { clearInterval(quiz.timerId); resultScreen.classList.add("hidden"); questionScreen.classList.add("hidden"); startScreen.classList.remove("hidden"); scoreEl.textContent = "0"; playerNameInput.focus(); }
$("#startQuiz").addEventListener("click", startQuiz); $("#playAgain").addEventListener("click", resetQuiz);
playerNameInput.addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
$("#clearLeaderboard").addEventListener("click", () => { if (!confirm("Clear all locally stored leaderboard scores?")) return; try { localStorage.removeItem(LEADERBOARD_KEY); } catch {} renderLeaderboard(); });
function applySavedTheme() { try { if (localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark"); } catch {} }
$("#themeToggle").addEventListener("click", () => { document.body.classList.toggle("dark"); try { localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light"); } catch {} });

const weatherForm = $("#weatherForm"), cityInput = $("#cityInput"), weatherStatus = $("#weatherStatus"), weatherError = $("#weatherError"), weatherContent = $("#weatherContent");
let weatherRequestController = null;
const weatherCodes = { 0:["Clear sky","☀️"],1:["Mainly clear","🌤️"],2:["Partly cloudy","⛅"],3:["Overcast","☁️"],45:["Fog","🌫️"],48:["Rime fog","🌫️"],51:["Light drizzle","🌦️"],53:["Drizzle","🌦️"],55:["Dense drizzle","🌧️"],61:["Light rain","🌦️"],63:["Rain","🌧️"],65:["Heavy rain","🌧️"],71:["Light snow","🌨️"],73:["Snow","🌨️"],75:["Heavy snow","❄️"],80:["Rain showers","🌦️"],81:["Rain showers","🌧️"],82:["Heavy showers","⛈️"],95:["Thunderstorm","⛈️"],96:["Thunderstorm with hail","⛈️"],99:["Severe thunderstorm with hail","⛈️"] };
function describeWeather(code) { return weatherCodes[code] || ["Weather unavailable","🌡️"]; }
function setWeatherLoading(isLoading) { weatherStatus.textContent = isLoading ? "Loading…" : "Ready"; weatherForm.querySelector("button").disabled = isLoading; }
async function fetchJson(url, signal) { const response = await fetch(url,{signal}); if (!response.ok) throw new Error(`Request failed with status ${response.status}`); return response.json(); }
async function loadWeather(city) {
  weatherRequestController?.abort(); weatherRequestController = new AbortController(); setWeatherLoading(true); weatherError.textContent = "";
  try {
    const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodeUrl.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
    const geocode = await fetchJson(geocodeUrl, weatherRequestController.signal); const place = geocode.results?.[0];
    if (!place) throw new Error("City not found. Try a more specific city name.");
    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({
      latitude: String(place.latitude), longitude: String(place.longitude),
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max", timezone: "auto", forecast_days: "5"
    });
    const weather = await fetchJson(forecastUrl, weatherRequestController.signal); renderWeather(place,weather);
  } catch (error) {
    if (error.name === "AbortError") return; weatherContent.classList.add("hidden"); weatherError.textContent = error.message || "Unable to load weather right now.";
  } finally { if (!weatherRequestController?.signal.aborted) setWeatherLoading(false); }
}
function renderWeather(place,weather) {
  const [description,emoji] = describeWeather(weather.current.weather_code);
  $("#weatherLocation").textContent = `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}, ${place.country}`;
  $("#weatherDescription").textContent = `${description} • Updated ${new Date(weather.current.time).toLocaleString()}`;
  $("#temperature").textContent = `${Math.round(weather.current.temperature_2m)}°`; $("#weatherEmoji").textContent = emoji;
  $("#feelsLike").textContent = `${Math.round(weather.current.apparent_temperature)}°C`; $("#humidity").textContent = `${weather.current.relative_humidity_2m}%`;
  $("#windSpeed").textContent = `${Math.round(weather.current.wind_speed_10m)} km/h`; $("#precipitation").textContent = `${weather.current.precipitation} mm`;
  const forecastEl = $("#forecast"); forecastEl.innerHTML = "";
  weather.daily.time.forEach((date,index) => {
    const [dayDescription,dayEmoji] = describeWeather(weather.daily.weather_code[index]); const card = document.createElement("article"); card.className = "forecast-card";
    const day = new Date(`${date}T12:00:00`);
    card.innerHTML = `<div class="forecast-day">${day.toLocaleDateString(undefined,{weekday:"short"})}</div><div class="forecast-icon" aria-label="${dayDescription}">${dayEmoji}</div><div><strong>${Math.round(weather.daily.temperature_2m_max[index])}°</strong> <span class="forecast-low">${Math.round(weather.daily.temperature_2m_min[index])}°</span></div><div class="subtle">${weather.daily.precipitation_probability_max[index] ?? 0}% rain</div>`;
    forecastEl.append(card);
  });
  weatherContent.classList.remove("hidden"); weatherStatus.textContent = "Updated";
}
weatherForm.addEventListener("submit", event => { event.preventDefault(); const city = cityInput.value.trim(); if (!city) { weatherError.textContent = "Enter a city name."; return; } loadWeather(city); });
applySavedTheme(); renderLeaderboard(); loadWeather(cityInput.value);
