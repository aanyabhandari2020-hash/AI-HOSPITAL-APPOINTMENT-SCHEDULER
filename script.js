
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const doctors = [
    {
      id: "gp1",
      name: "Dr. Rahul Sharma",
      specialty: "General Physician",
      rating: 4.7,
      reviews: 310,
      experience: "8 years"
    },
    {
      id: "gp2",
      name: "Dr. Neha Joshi",
      specialty: "General Physician",
      rating: 4.5,
      reviews: 185,
      experience: "6 years"
    },
    {
      id: "card1",
      name: "Dr. Aditi Verma",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 220,
      experience: "12 years"
    },
    {
      id: "card2",
      name: "Dr. Kunal Mehta",
      specialty: "Cardiologist",
      rating: 4.7,
      reviews: 345,
      experience: "10 years"
    },
    {
      id: "derm1",
      name: "Dr. Priya Kapoor",
      specialty: "Dermatologist",
      rating: 4.8,
      reviews: 190,
      experience: "9 years"
    },
    {
      id: "dent1",
      name: "Dr. Arjun Singh",
      specialty: "Dentist",
      rating: 4.6,
      reviews: 275,
      experience: "7 years"
    },
    {
      id: "ped1",
      name: "Dr. Meera Patel",
      specialty: "Pediatrician",
      rating: 4.9,
      reviews: 160,
      experience: "11 years"
    }
  ];

  const availableTimes = [
    "09:00",
    "09:30",
    "10:30",
    "11:30",
    "12:30",
    "14:00",
    "15:00",
    "16:00"
  ];

  const form = document.getElementById("appointmentForm");
  const specialtyInput = document.getElementById("specialty");
  const doctorInput = document.getElementById("preferredDoctor");
  const ratingInput = document.getElementById("ratingPreference");
  const dateInput = document.getElementById("appointmentDate");
  const timeInput = document.getElementById("timePreference");

  const resultsSection = document.getElementById("resultsSection");
  const doctorResults = document.getElementById("doctorResults");
  const resultsMessage = document.getElementById("resultsMessage");

  const confirmationSection =
    document.getElementById("confirmationSection");
  const confirmationDetails =
    document.getElementById("confirmationDetails");
  const historyContainer = document.getElementById("bookingHistory");

  let currentSearch = null;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  dateInput.min = localDateString();
  dateInput.value = localDateString();

  function getBookings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("medislotDemoBookings") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveBookings(bookings) {
    try {
      localStorage.setItem(
        "medislotDemoBookings",
        JSON.stringify(bookings)
      );
      return true;
    } catch (error) {
      alert(
        "The browser could not save this demo booking. " +
        "Please check your browser storage settings."
      );
      return false;
    }
  }

  function updateDoctorOptions() {
    const selectedDoctor = doctorInput.value;
    const specialty = specialtyInput.value;

    const matchingDoctors = doctors.filter(doctor =>
      specialty === "All" || doctor.specialty === specialty
    );

    doctorInput.innerHTML =
      '<option value="Any">Any available doctor</option>';

    matchingDoctors.forEach(doctor => {
      const option = document.createElement("option");
      option.value = doctor.id;
      option.textContent = doctor.name;
      doctorInput.appendChild(option);
    });

    if (matchingDoctors.some(doctor => doctor.id === selectedDoctor)) {
      doctorInput.value = selectedDoctor;
    }
  }

  function getFilteredDoctors() {
    let matching = doctors.filter(doctor => {
      const specialtyMatches =
        specialtyInput.value === "All" ||
        doctor.specialty === specialtyInput.value;

      const nameMatches =
        doctorInput.value === "Any" ||
        doctor.id === doctorInput.value;

      const rating = ratingInput.value;
      const ratingMatches =
        rating === "any" ||
        rating === "highest" ||
        rating === "most" ||
        doctor.rating >= Number(rating);

      return specialtyMatches && nameMatches && ratingMatches;
    });

    if (ratingInput.value === "highest") {
      matching.sort((a, b) =>
        b.rating - a.rating || b.reviews - a.reviews
      );
    } else if (ratingInput.value === "most") {
      matching.sort((a, b) =>
        b.reviews - a.reviews || b.rating - a.rating
      );
    } else {
      matching.sort((a, b) =>
        b.rating - a.rating || b.reviews - a.reviews
      );
    }

    return matching;
  }

  function timeMatchesPreference(time) {
    if (timeInput.value === "morning") {
      return time < "12:00";
    }

    if (timeInput.value === "afternoon") {
      return time >= "12:00";
    }

    return true;
  }

  function isSlotBooked(doctorId, date, time) {
    return getBookings().some(booking =>
      booking.doctorId === doctorId &&
      booking.date === date &&
      booking.time === time
    );
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function formatTime(time) {
    const [hourString, minute] = time.split(":");
    const hour = Number(hourString);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
  }

  function renderDoctors(matchingDoctors, date) {
    doctorResults.innerHTML = "";

    if (matchingDoctors.length === 0) {
      resultsMessage.textContent =
        "No doctors match your selected specialty and rating. " +
        "Try changing your filters.";

      doctorResults.innerHTML =
        '<div class="empty-message">No matching doctors found.</div>';
      return;
    }

    resultsMessage.textContent =
      `${matchingDoctors.length} matching doctor(s) found. ` +
      `Select a time slot to book your demo appointment.`;

    matchingDoctors.forEach(doctor => {
      const slots = availableTimes.filter(time =>
        timeMatchesPreference(time) &&
        !isSlotBooked(doctor.id, date, time)
      );

      const slotMarkup = slots.length
        ? slots.map(time => `
            <button
              class="slot-button"
              type="button"
              data-doctor-id="${escapeHTML(doctor.id)}"
              data-time="${escapeHTML(time)}">
              ${escapeHTML(formatTime(time))} · Book
            </button>
          `).join("")
        : '<p class="helper">No matching slots left for this date. Try another date or time preference.</p>';

      const card = document.createElement("article");
      card.className = "doctor-card";

      card.innerHTML = `
        <h3>${escapeHTML(doctor.name)}</h3>
        <p class="specialty">${escapeHTML(doctor.specialty)}</p>
        <div class="doctor-meta">
          <span>★ ${doctor.rating.toFixed(1)} / 5</span>
          <span>${doctor.reviews} demo reviews</span>
          <span>${escapeHTML(doctor.experience)}</span>
        </div>
        <p class="slot-heading">
          Available slots · ${escapeHTML(formatDate(date))}
        </p>
        <div class="slot-list">${slotMarkup}</div>
      `;

      doctorResults.appendChild(card);
    });
  }

  function renderHistory() {
    const bookings = getBookings().slice().reverse();

    if (!bookings.length) {
      historyContainer.innerHTML =
        '<p class="helper">No demo appointments booked yet.</p>';
      return;
    }

    historyContainer.innerHTML = bookings.map(booking => `
      <div class="booking-item">
        <strong>${escapeHTML(booking.patientName)}</strong>
        <p>${escapeHTML(booking.doctorName)} · ${escapeHTML(booking.specialty)}</p>
        <p>${escapeHTML(formatDate(booking.date))} at ${escapeHTML(formatTime(booking.time))}</p>
        <span class="status">Demo booking saved</span>
      </div>
    `).join("");
  }

  specialtyInput.addEventListener("change", updateDoctorOptions);

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const date = dateInput.value;

    if (!date || date < localDateString()) {
      alert("Please select today or a future date.");
      return;
    }

    currentSearch = {
      patientName: document.getElementById("patientName").value.trim(),
      patientEmail: document.getElementById("patientEmail").value.trim(),
      specialty: specialtyInput.value,
      preferredDoctor: doctorInput.value,
      ratingPreference: ratingInput.value,
      date,
      timePreference: timeInput.value
    };

    if (!currentSearch.patientName) {
      alert("Please enter the patient's name.");
      return;
    }

    const matchingDoctors = getFilteredDoctors();

    confirmationSection.hidden = true;
    resultsSection.hidden = false;

    renderDoctors(matchingDoctors, date);

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  doctorResults.addEventListener("click", event => {
    const button = event.target.closest("[data-doctor-id][data-time]");

    if (!button || !currentSearch) return;

    const doctor = doctors.find(
      item => item.id === button.dataset.doctorId
    );
    const time = button.dataset.time;

    if (!doctor) return;

    if (currentSearch.specialty !== "All" &&
        doctor.specialty !== currentSearch.specialty) {
      alert("This doctor does not match your selected specialty.");
      return;
    }

    if (currentSearch.preferredDoctor !== "Any" &&
        doctor.id !== currentSearch.preferredDoctor) {
      alert("This is not your selected preferred doctor.");
      return;
    }

    if (doctor.rating < 4 &&
        ["4", "4.5"].includes(currentSearch.ratingPreference)) {
      alert("This doctor does not meet your selected rating.");
      return;
    }

    if (currentSearch.ratingPreference === "4.5" &&
        doctor.rating < 4.5) {
      alert("Please select a doctor rated 4.5 or higher.");
      return;
    }

    if (!timeMatchesPreference(time)) {
      alert("Please choose a slot within your preferred time.");
      return;
    }

    if (isSlotBooked(doctor.id, currentSearch.date, time)) {
      alert("This demo slot has already been booked in this browser. Choose another slot.");
      renderDoctors(getFilteredDoctors(), currentSearch.date);
      return;
    }

    const booking = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patientName: currentSearch.patientName,
      patientEmail: currentSearch.patientEmail,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating,
      date: currentSearch.date,
      time
    };

    const bookings = getBookings();
    bookings.push(booking);

    if (!saveBookings(bookings)) return;

    confirmationDetails.innerHTML = `
      <p><strong>Patient:</strong> ${escapeHTML(booking.patientName)}</p>
      <p><strong>Doctor:</strong> ${escapeHTML(booking.doctorName)}</p>
      <p><strong>Specialty:</strong> ${escapeHTML(booking.specialty)}</p>
      <p><strong>Date:</strong> ${escapeHTML(formatDate(booking.date))}</p>
      <p><strong>Time:</strong> ${escapeHTML(formatTime(booking.time))}</p>
      <p><strong>Demo reference:</strong> ${escapeHTML(booking.id)}</p>
    `;

    confirmationSection.hidden = false;
    resultsSection.hidden = true;
    renderHistory();

    confirmationSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  document.getElementById("newSearchButton").addEventListener("click", () => {
    confirmationSection.hidden = true;
    resultsSection.hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  updateDoctorOptions();
  renderHistory();
});
