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
  if (!plansByDay[key]) plansByDay[key] = key === dayKey(new Date()) ? structuredClone(starterPlans) : [];
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

