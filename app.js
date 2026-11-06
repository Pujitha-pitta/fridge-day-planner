const STORAGE_KEY = 'dayboard-plans-v1';
const CATEGORY_LABELS = { home: 'Home', work: 'Work', food: 'Food', fun: 'Fun' };
const starterPlans = [
  { id: 'sample-1', time: '08:00', title: 'Slow breakfast together', category: 'food', done: false },
  { id: 'sample-2', time: '09:30', title: 'Focus time', category: 'work', done: false },
  { id: 'sample-3', time: '12:30', title: 'Make lunch', category: 'food', done: false },
  { id: 'sample-4', time: '16:00', title: 'A little fresh air', category: 'fun', done: false },
  { id: 'sample-5', time: '18:30', title: 'Tidy up for tomorrow', category: 'home', done: false }
];

const schedule = document.querySelector('#schedule');
const dateLabel = document.querySelector('#selected-date');
const emptyState = document.querySelector('#empty-state');
const form = document.querySelector('#add-form');
let selectedDay = new Date();
selectedDay.setHours(0, 0, 0, 0);
let plansByDay = loadPlans();

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function loadPlans() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function savePlans() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plansByDay));
}

function currentPlans() {
  const key = dayKey(selectedDay);
  if (!plansByDay[key]) plansByDay[key] = key === dayKey(new Date()) ? starterPlans.map(plan => ({ ...plan })) : [];
  return plansByDay[key];
}

function formatTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

function render() {
  dateLabel.dateTime = dayKey(selectedDay);
  dateLabel.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(selectedDay);
  const plans = currentPlans().sort((a, b) => a.time.localeCompare(b.time));
  schedule.replaceChildren();
  emptyState.hidden = plans.length > 0;

  for (const plan of plans) {
    const row = document.createElement('article');
    row.className = `plan${plan.done ? ' done' : ''}`;
    const time = document.createElement('time');
    time.className = 'plan-time';
    time.dateTime = plan.time;
    time.textContent = formatTime(plan.time);

    const main = document.createElement('div');
    main.className = 'plan-main';
    const dot = document.createElement('span');
    dot.className = `category-dot ${plan.category}`;
    dot.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span');
    title.className = 'plan-title';
    title.textContent = plan.title;
    const tag = document.createElement('span');
    tag.className = 'plan-tag';
    tag.textContent = CATEGORY_LABELS[plan.category] || 'Home';
    main.append(dot, title, tag);

    const actions = document.createElement('div');
    actions.className = 'plan-actions';
    const check = document.createElement('button');
    check.className = 'check-button';
    check.type = 'button';
    check.setAttribute('aria-label', `${plan.done ? 'Mark incomplete' : 'Complete'}: ${plan.title}`);
    check.textContent = plan.done ? '✓' : '';
    check.addEventListener('click', () => updatePlan(plan.id, { done: !plan.done }));
    const edit = document.createElement('button');
    edit.className = 'edit-button';
    edit.type = 'button';
    edit.setAttribute('aria-label', `Edit: ${plan.title}`);
    edit.textContent = '✎';
    edit.addEventListener('click', () => {
      document.querySelector('#edit-id').value = plan.id;
      document.querySelector('#edit-title').value = plan.title;
      document.querySelector('#edit-time').value = plan.time;
      document.querySelector('#edit-category').value = plan.category;
      document.querySelector('#edit-dialog').showModal();
      document.querySelector('#edit-title').focus();
    });
    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove: ${plan.title}`);
    remove.textContent = '×';
    remove.addEventListener('click', () => removePlan(plan.id));
    actions.append(check, edit, remove);
    row.append(time, main, actions);
    schedule.append(row);
  }

  const completed = plans.filter(plan => plan.done).length;
  const count = plans.length;
  document.querySelector('#task-count').textContent = `${count} ${count === 1 ? 'plan' : 'plans'}`;
  document.querySelector('#progress-fill').style.width = count ? `${completed / count * 100}%` : '0%';
  document.querySelector('#progress-label').textContent = count && completed === count ? 'All done — lovely work!' : completed ? `${completed} of ${count} done` : 'A fresh start';
}

function updatePlan(id, changes) {
  plansByDay[dayKey(selectedDay)] = currentPlans().map(plan => plan.id === id ? { ...plan, ...changes } : plan);
  savePlans();
  render();
}

function removePlan(id) {
  plansByDay[dayKey(selectedDay)] = currentPlans().filter(plan => plan.id !== id);
  savePlans();
  render();
}

document.querySelector('#previous-day').addEventListener('click', () => { selectedDay.setDate(selectedDay.getDate() - 1); render(); });
document.querySelector('#next-day').addEventListener('click', () => { selectedDay.setDate(selectedDay.getDate() + 1); render(); });
document.querySelector('#go-today').addEventListener('click', () => { selectedDay = new Date(); selectedDay.setHours(0, 0, 0, 0); render(); });

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const title = String(data.get('title')).trim();
  if (!title) return;
  currentPlans().push({ id: crypto.randomUUID(), time: String(data.get('time')), title, category: String(data.get('category')), done: false });
  savePlans();
  form.reset();
  document.querySelector('#task-time').value = '09:00';
  document.querySelector('#task-title').focus();
  render();
});

document.querySelector('#clear-done').addEventListener('click', () => {
  plansByDay[dayKey(selectedDay)] = currentPlans().filter(plan => !plan.done);
  savePlans();
  render();
});

document.querySelector('#edit-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const id = String(data.get('id'));
  const title = String(data.get('title')).trim();
  if (!title) return;
  plansByDay[dayKey(selectedDay)] = currentPlans().map(plan => plan.id === id
    ? { ...plan, title, time: String(data.get('time')), category: String(data.get('category')) }
    : plan);
  savePlans();
  document.querySelector('#edit-dialog').close();
  render();
});

document.querySelector('#cancel-edit').addEventListener('click', () => {
  document.querySelector('#edit-dialog').close();
});

render();



// Fridge-side display controls
const fullscreenButton = document.querySelector('#fullscreen-button');
const awakeButton = document.querySelector('#awake-button');
const appStatus = document.querySelector('#app-status');
let wakeLock = null;
let keepAwakeRequested = false;

function syncFullscreenButton() {
  const active = Boolean(document.fullscreenElement);
  fullscreenButton.setAttribute('aria-pressed', String(active));
  fullscreenButton.textContent = active ? 'Exit full screen' : 'Full screen';
}

fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else appStatus.textContent = 'Full screen is not available in this browser.';
  } catch {
    appStatus.textContent = 'Full screen could not be started. Try your browser’s full screen option.';
  }
});
document.addEventListener('fullscreenchange', syncFullscreenButton);

function syncAwakeButton() {
  awakeButton.setAttribute('aria-pressed', String(keepAwakeRequested));
  awakeButton.textContent = keepAwakeRequested ? 'Screen awake' : 'Keep screen awake';
}

async function requestScreenWakeLock() {
  if (!('wakeLock' in navigator)) {
    keepAwakeRequested = false;
    syncAwakeButton();
    appStatus.textContent = 'This browser cannot keep the screen awake. Change the device display timeout in its settings.';
    return;
  }
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    syncAwakeButton();
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      if (keepAwakeRequested && document.visibilityState === 'visible') requestScreenWakeLock();
    }, { once: true });
  } catch {
    keepAwakeRequested = false;
    syncAwakeButton();
    appStatus.textContent = 'The browser could not keep the screen awake. Change the device display timeout in its settings.';
  }
}

awakeButton.addEventListener('click', async () => {
  keepAwakeRequested = !keepAwakeRequested;
  if (!keepAwakeRequested && wakeLock) {
    const currentLock = wakeLock;
    wakeLock = null;
    await currentLock.release();
  } else if (keepAwakeRequested) {
    await requestScreenWakeLock();
  }
  syncAwakeButton();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && keepAwakeRequested && !wakeLock) requestScreenWakeLock();
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).then(registration => registration.update()).catch(() => {
    appStatus.textContent = 'Offline support could not be enabled in this browser.';
  });
}


const WEATHER_KEY = 'fridge-day-planner-weather-v1';
const weatherDialog = document.querySelector('#weather-dialog');
const weatherForm = document.querySelector('#weather-form');
const weatherStatus = document.querySelector('#weather-status');
let weatherPlace = null;

function renderClock() {
  const now = new Date();
  const options = { hour: 'numeric', minute: '2-digit' };
  const zoneOptions = { timeZoneName: 'short' };
  if (weatherPlace && weatherPlace.timezone) {
    options.timeZone = weatherPlace.timezone;
    zoneOptions.timeZone = weatherPlace.timezone;
  }
  document.querySelector('#clock-time').textContent = new Intl.DateTimeFormat(undefined, options).format(now);
  const zonePart = new Intl.DateTimeFormat(undefined, zoneOptions).formatToParts(now).find(part => part.type === 'timeZoneName');
  document.querySelector('#clock-zone').textContent = zonePart ? zonePart.value : '';
  dateLabel.dateTime = dayKey(selectedDay);
  dateLabel.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(selectedDay);
}
setInterval(renderClock, 30000);
renderClock();

function weatherForCode(code) {
  if (code === 0) return ['☀', 'Clear'];
  if (code === 1 || code === 2) return ['⛅', 'Partly cloudy'];
  if (code === 3) return ['☁', 'Overcast'];
  if (code === 45 || code === 48) return ['🌫', 'Foggy'];
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['🌧', 'Rain'];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['❄', 'Snow'];
  if ([95, 96, 99].includes(code)) return ['⛈', 'Thunderstorms'];
  return ['🌤', 'Conditions updated'];
}

function showWeatherPlace(place) {
  weatherPlace = place;
  document.querySelector('#weather-location').textContent = place ? [place.name, place.admin1, place.country].filter(Boolean).join(', ') : '';
  renderClock();
}
function loadSavedWeather() {
  try {
    const stored = JSON.parse(localStorage.getItem(WEATHER_KEY));
    if (stored && Number.isFinite(stored.latitude) && Number.isFinite(stored.longitude)) showWeatherPlace(stored);
  } catch {
    localStorage.removeItem(WEATHER_KEY);
  }
}
async function updateWeather() {
  if (!weatherPlace) return;
  document.querySelector('#weather-description').textContent = 'Updating forecast…';
  try {
    const params = new URLSearchParams({
      latitude: weatherPlace.latitude,
      longitude: weatherPlace.longitude,
      current: 'temperature_2m,weather_code',
      temperature_unit: 'celsius',
      timezone: 'auto'
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error('Weather request failed');
    const payload = await response.json();
    const current = payload.current;
    if (payload.timezone) {
      weatherPlace.timezone = payload.timezone;
      localStorage.setItem(WEATHER_KEY, JSON.stringify(weatherPlace));
      renderClock();
    }
    const [icon, description] = weatherForCode(current.weather_code);
    document.querySelector('#weather-icon').textContent = icon;
    document.querySelector('#weather-temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.querySelector('#weather-description').textContent = description;
  } catch {
    document.querySelector('#weather-description').textContent = 'Weather unavailable. Your schedule still works.';
  }
}

document.querySelector('#set-weather').addEventListener('click', () => {
  document.querySelector('#weather-city').value = weatherPlace?.name || '';
  weatherStatus.textContent = '';
  weatherDialog.showModal();
});
document.querySelector('#cancel-weather').addEventListener('click', () => weatherDialog.close());
weatherForm.addEventListener('submit', async event => {
  event.preventDefault();
  const city = String(new FormData(weatherForm).get('city')).trim();
  if (city.length < 2) {
    weatherStatus.textContent = 'Enter at least two characters.';
    return;
  }
  weatherStatus.textContent = 'Finding the city…';
  const button = weatherForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const params = new URLSearchParams({ name: city, count: '1', language: 'en', format: 'json' });
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    if (!response.ok) throw new Error('City search failed');
    const payload = await response.json();
    const result = payload.results?.[0];
    if (!result) {
      weatherStatus.textContent = 'We couldn’t find that city. Try a nearby larger town.';
      return;
    }
    const place = { name: result.name, admin1: result.admin1 || '', country: result.country || '', latitude: result.latitude, longitude: result.longitude, timezone: result.timezone || '' };
    localStorage.setItem(WEATHER_KEY, JSON.stringify(place));
    showWeatherPlace(place);
    weatherDialog.close();
    await updateWeather();
  } catch {
    weatherStatus.textContent = 'Could not reach the weather service. Please try again.';
  } finally {
    button.disabled = false;
  }
});

loadSavedWeather();
updateWeather();
setInterval(updateWeather, 30 * 60 * 1000);
