# Fridge Day Planner

A Samsung Family Hub refrigerator dashboard with the family greeting “Welcome, Pitta's Family,” a clock that follows the selected weather city's time zone, local weather, and a shared daily schedule. It is designed for the fridge's built-in touchscreen and browser.

## Open it on a Samsung Family Hub fridge

Open the Family Hub's built-in browser (if your model provides one) and visit the [live Fridge Day Planner](https://pujitha-pitta.github.io/fridge-day-planner/). Use its full-screen option if available. Set the weather city once; the displayed clock will follow that city's time zone. The greeting and schedule are saved in that fridge browser.

This repository is a web dashboard, not a Samsung-certified Family Hub app. Samsung says only apps listed in the fridge's Apps menu can be installed; custom Family Hub apps use Samsung's Family Hub development tools and require device/platform-specific packaging and distribution. Whether this page opens in the built-in browser depends on the Family Hub model and software version. See [Samsung's Family Hub developer page](https://developer.samsung.com/family-hub) and [Samsung app availability guidance](https://www.samsung.com/us/support/answer/ANS10006847/).

Plans are stored in that browser only and do not sync to phones or other household screens.

## Features

- Family greeting saved locally on the display
- Live clock and date
- Optional local weather by city; the selected city is sent to Open-Meteo when you request the forecast
- Schedule display and editing for one shared household screen

- Fridge-side tablet and phone layout with large touch targets
- Installable PWA shell with offline app loading

- Browse days and jump back to today
- Add and edit plans with a time and category
- Mark plans complete or remove them
- See daily progress at a glance
- Save plans in browser local storage
- Responsive layout for phones, tablets, and landscape screens

## Privacy and limitations

Plans stay in the browser's local storage on this device; they are not synced between devices. Clearing site data removes saved plans. The sample plans appear on first use for today and can be edited or removed.

## Tech

HTML, CSS, and vanilla JavaScript.

