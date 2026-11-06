# Fridge Day Planner

A model-independent, browser-based household dashboard inspired by built-in smart-fridge screens. It puts a family greeting, live date and time, local weather, and a shared daily schedule together in one glance.

## Run it

Open the [live Fridge Day Planner](https://pujitha-pitta.github.io/fridge-day-planner/) in a browser on a fridge display that supports modern web pages, or on a phone/tablet by the fridge. Compatibility with built-in displays varies by model. No build step or account is needed.

## Use it by the fridge

- On Android, open the site in Chrome and use the browser menu to install it or add it to the home screen.
- On iPhone or iPad, open it in Safari, tap Share, then Add to Home Screen.
- Keep the device plugged in and use Full screen. Keep screen awake works in browsers that support the Screen Wake Lock API.
- Plans are stored on this device only. The app does not sync to other household members’ phones.

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

