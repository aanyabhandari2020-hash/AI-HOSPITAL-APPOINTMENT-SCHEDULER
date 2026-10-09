
# MediSlot AI — Smart Hospital Appointment Scheduler

MediSlot AI is a student project demonstrating a simple doctor discovery and appointment scheduling interface using HTML, CSS and JavaScript.

## Features

- Patient details form
- Doctor selection by medical specialty
- Cardiologist and other specialty options
- Sample doctor ratings and review counts
- Highest-rated and most-reviewed sorting
- Preferred date and time selection
- Available demo appointment slots
- Booking confirmation screen
- Browser-based demo appointment history
- Duplicate-slot checks within the same browser
- Responsive design for mobile and desktop

## Technologies

- HTML5
- CSS3
- JavaScript
- Browser localStorage

## How to run

1. Keep `index.html`, `style.css`, `script.js` and `README.md` in the same folder.
2. Open `index.html` in a web browser, or publish the repository using GitHub Pages.
3. Enter patient details and select the specialty, doctor, rating preference, date and time.
4. Click **Find Available Doctors & Slots**.
5. Choose a displayed time slot to see the demo booking confirmation.

## Important limitations

This is a frontend demonstration. Doctor profiles, ratings, review counts and appointment slots are sample data.

Bookings are stored in the current browser's localStorage. They are not sent to a hospital, shared across devices, or protected by a server-side booking system. The demo cannot guarantee real appointment availability.

A real-world implementation requires a backend, a shared database, server-side validation and secure handling of patient information.

## Project structure

- `index.html` — page structure and booking form
- `style.css` — responsive user interface
- `script.js` — doctor filtering, slot selection and demo bookings
- `README.md` — documentation
