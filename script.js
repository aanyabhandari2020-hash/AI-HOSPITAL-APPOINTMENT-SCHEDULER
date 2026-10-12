
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const CONSULTATION_FEE = 800;
  const STORAGE_KEY = "medislot_ai_appointments_v1";

  // Demonstration doctor directory. Ratings and reviews are sample data.
  const doctors = [
    {
      id: "D001",
      name: "Dr. Rahul Sharma",
      specialty: "General Physician",
      rating: 4.9,
      reviews: 248,
      experience: "12 years",
      recommended: true,
      description: "General health consultations and routine health concerns."
    },
    {
      id: "D002",
      name: "Dr. Priya Mehta",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 315,
      experience: "15 years",
      recommended: true,
      description: "Heart health consultations and cardiovascular assessment."
    },
    {
      id: "D003",
      name: "Dr. Arjun Verma",
      specialty: "Radiologist",
      rating: 4.7,
      reviews: 132,
      experience: "10 years",
      recommended: false,
      description: "Radiology consultations and diagnostic imaging guidance."
    },
    {
      id: "D004",
      name: "Dr. Neha Kapoor",
      specialty: "Dermatologist",
      rating: 4.9,
      reviews: 287,
      experience: "11 years",
      recommended: true,
      description: "Skin, hair, and general dermatology consultations."
    },
    {
      id: "D005",
      name: "Dr. Karan Malhotra",
      specialty: "Dentist",
      rating: 4.6,
      reviews: 106,
      experience: "8 years",
      recommended: false,
      description: "Dental consultations and oral health guidance."
    },
    {
      id: "D006",
      name: "Dr. Anjali Singh",
      specialty: "Pediatrician",
      rating: 4.8,
      reviews: 221,
      experience: "13 years",
      recommended: true,
      description: "Healthcare consultations for infants, children, and teens."
    },
    {
      id: "D007",
      name: "Dr. Vikram Joshi",
      specialty: "Neurologist",
      rating: 4.7,
      reviews: 154,
      experience: "14 years",
      recommended: false,
      description: "Neurology consultations and nervous system health."
    },
    {
      id: "D008",
      name: "Dr. Pooja Rathore",
      specialty: "Orthopedic",
      rating: 4.8,
      reviews: 193,
      experience: "12 years",
      recommended: true,
      description: "Bone, joint, and musculoskeletal consultations."
    },
    {
      id: "D009",
      name: "Dr. Meera Joshi",
      specialty: "Gynecologist",
      rating: 4.9,
      reviews: 276,
      experience: "16 years",
      recommended: true,
      description: "Women's health and gynecology consultations."
    },
    {
      id: "D010",
      name: "Dr. Aditya Sethi",
      specialty: "Ophthalmologist",
      rating: 4.6,
      reviews: 118,
      experience: "9 years",
      recommended: false,
      description: "Eye health consultations and vision-related concerns."
    },
    {
      id: "D011",
      name: "Dr. Simran Gill",
      specialty: "General Physician",
      rating: 4.8,
      reviews: 187,
      experience: "9 years",
      recommended: true,
      description: "General consultations and preventive healthcare."
    },
    {
      id: "D012",
      name: "Dr. Rohan Bhatia",
      specialty: "Cardiologist",
      rating: 4.7,
      reviews: 164,
      experience: "10 years",
      recommended: false,
      description: "Cardiology consultations and heart health assessment."
    }
  ];

  const specialtySelect = document.getElementById("specialty");
  const preferredDoctorSelect = document.getElementById("preferredDoctor");
  const appointmentDate = document.getElementById("appointmentDate");
  const appointmentTime = document.getElementById("appointmentTime");
  const searchForm = document.getElementById("searchForm");
  const resultsSection = document.getElementById("resultsSection");
  const resultsSummary = document.getElementById("resultsSummary");
  const doctorResults = document.getElementById("doctorResults");
  const sortRating = document.getElementById("sortRating");

  const bookingSection = document.getElementById("bookingSection");
  const bookingForm = document.getElementById("bookingForm");
  const selectedDoctorSummary = document.getElementById("selectedDoctorSummary");
  const bookingDateDisplay = document.getElementById("bookingDateDisplay");
  const bookingTimeDisplay = document.getElementById("bookingTimeDisplay");
  const bookingError = document.getElementById("bookingError");

  const receiptSection = document.getElementById("receiptSection");
  const appointmentHistory = document.getElementById("appointmentHistory");

  let selectedDoctor = null;
  let lastSearchResults = [];
  let chosenDate = "";
  let chosenTime = "";

  function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "Not selected";

    const parts = dateString.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return dateString;
    }

    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function getAppointments() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Could not read saved appointments:", error);
      return [];
    }
  }

  function saveAppointments(appointments) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
      return true;
    } catch (error) {
      console.error("Could not save appointments:", error);
      return false;
    }
  }

  function setTodayAsMinimum() {
    const today = getLocalDateString(new Date());
    appointmentDate.min = today;
    appointmentDate.value = today;
  }

  function populateDoctorDropdown() {
    const currentSpecialty = specialtySelect.value;
    const previousValue = preferredDoctorSelect.value || "All";

    const matchingDoctors = doctors.filter(function (doctor) {
      return currentSpecialty === "All" ||
        doctor.specialty === currentSpecialty;
    });

    preferredDoctorSelect.replaceChildren();

    const anyOption = document.createElement("option");
    anyOption.value = "All";
    anyOption.textContent = "Any available doctor";
    preferredDoctorSelect.appendChild(anyOption);

    matchingDoctors.forEach(function (doctor) {
      const option = document.createElement("option");
      option.value = doctor.id;
      option.textContent = `${doctor.name} — ${doctor.specialty} (${doctor.rating.toFixed(1)}/5)`;
      preferredDoctorSelect.appendChild(option);
    });

    if (
      previousValue !== "All" &&
      matchingDoctors.some(function (doctor) {
        return doctor.id === previousValue;
      })
    ) {
      preferredDoctorSelect.value = previousValue;
    } else {
      preferredDoctorSelect.value = "All";
    }
  }

  function getStars(rating) {
    const fullStars = Math.round(rating);
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  }

  function renderDoctors(list) {
    doctorResults.replaceChildren();

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "no-results";
      empty.textContent =
        "No doctors match these preferences. Try another specialty, doctor, date, or time.";
      doctorResults.appendChild(empty);
      return;
    }

    list.forEach(function (doctor) {
      const card = document.createElement("article");
      card.className = "doctor-card";
      if (selectedDoctor && selectedDoctor.id === doctor.id) {
        card.classList.add("selected");
      }

      const initials = doctor.name
        .replace("Dr. ", "")
        .split(" ")
        .map(function (part) {
          return part.charAt(0);
        })
        .slice(0, 2)
        .join("");

      const top = document.createElement("div");
      top.className = "doctor-top";

      const avatar = document.createElement("div");
      avatar.className = "doctor-avatar";
      avatar.textContent = initials;

      const titleBox = document.createElement("div");
      const name = document.createElement("h3");
      name.className = "doctor-name";
      name.textContent = doctor.name;

      const specialty = document.createElement("p");
      specialty.className = "doctor-specialty";
      specialty.textContent = doctor.specialty;

      titleBox.append(name, specialty);
      top.append(avatar, titleBox);
      card.appendChild(top);

      const ratingRow = document.createElement("div");
      ratingRow.className = "rating-row";

      const stars = document.createElement("span");
      stars.className = "stars";
      stars.textContent = getStars(doctor.rating);
      stars.setAttribute("aria-label", `${doctor.rating} out of 5 stars`);

      const ratingNumber = document.createElement("span");
      ratingNumber.className = "rating-number";
      ratingNumber.textContent = doctor.rating.toFixed(1) + "/5";

      const reviewCount = document.createElement("span");
      reviewCount.className = "review-count";
      reviewCount.textContent = `(${doctor.reviews} sample reviews)`;

      ratingRow.append(stars, ratingNumber, reviewCount);
      card.appendChild(ratingRow);

      if (doctor.recommended) {
        const badge = document.createElement("span");
        badge.className = "recommend-badge";
        badge.textContent = "✓ Highly Recommended";
        card.appendChild(badge);
      }

      const description = document.createElement("p");
      description.className = "doctor-description";
      description.textContent = doctor.description;
      card.appendChild(description);

      const meta = document.createElement("div");
      meta.className = "doctor-meta";

      const experience = document.createElement("span");
      experience.innerHTML = "<strong>Experience</strong><br>";
      experience.append(document.createTextNode(doctor.experience));

      const fee = document.createElement("span");
      fee.innerHTML = "<strong>Consultation</strong><br>₹800";

      meta.append(experience, fee);
      card.appendChild(meta);

      const button = document.createElement("button");
      button.className = "btn btn-primary";
      button.type = "button";
      button.textContent =
        selectedDoctor && selectedDoctor.id === doctor.id
          ? "Selected ✓"
          : "Select This Doctor";

      button.addEventListener("click", function () {
        chooseDoctor(doctor);
      });

      card.appendChild(button);
      doctorResults.appendChild(card);
    });
  }

  function chooseDoctor(doctor) {
    selectedDoctor = doctor;

    chosenDate = appointmentDate.value;
    chosenTime = appointmentTime.value;

    if (!chosenDate || !chosenTime) {
      alert("Please choose your appointment date and time first.");
      return;
    }

    const dateObject = new Date(chosenDate + "T00:00:00");
    const today = new Date(getLocalDateString(new Date()) + "T00:00:00");

    if (dateObject < today) {
      alert("Please choose today or a future date.");
      appointmentDate.focus();
      return;
    }

    selectedDoctorSummary.replaceChildren();

    const name = document.createElement("strong");
    name.textContent = `${doctor.name} — ${doctor.specialty}`;

    const details = document.createElement("p");
    details.textContent =
      `Rating: ${doctor.rating.toFixed(1)}/5 · ${formatDate(chosenDate)} · ${chosenTime} · Consultation fee: ₹800`;

    selectedDoctorSummary.append(name, details);

    bookingDateDisplay.value = formatDate(chosenDate);
    bookingTimeDisplay.value = chosenTime;
    bookingError.hidden = true;

    resultsSection.querySelectorAll(".doctor-card").forEach(function (card) {
      card.classList.remove("selected");
    });

    renderDoctors(lastSearchResults);
    bookingSection.hidden = false;
    receiptSection.hidden = true;
    bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function runSearch(event) {
    if (event) event.preventDefault();

    const date = appointmentDate.value;
    const time = appointmentTime.value;
    const specialty = specialtySelect.value;
    const preferredId = preferredDoctorSelect.value;

    if (!date || !time) {
      alert("Please choose an appointment date and time slot.");
      return;
    }

    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date(getLocalDateString(new Date()) + "T00:00:00");

    if (selectedDate < today) {
      alert("Please choose today or a future date.");
      appointmentDate.focus();
      return;
    }

    chosenDate = date;
    chosenTime = time;
    selectedDoctor = null;
    bookingSection.hidden = true;
    receiptSection.hidden = true;

    lastSearchResults = doctors.filter(function (doctor) {
      const specialtyMatches =
        specialty === "All" || doctor.specialty === specialty;
      const doctorMatches =
        preferredId === "All" || doctor.id === preferredId;

      return specialtyMatches && doctorMatches;
    });

    sortDoctors();
    resultsSummary.textContent =
      `${lastSearchResults.length} doctor(s) found for ${formatDate(date)} · ${time}`;

    renderDoctors(lastSearchResults);
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function sortDoctors() {
    const sortMode = sortRating.value;

    lastSearchResults.sort(function (a, b) {
      if (sortMode === "rating") {
        return b.rating - a.rating || b.reviews - a.reviews;
      }

      if (sortMode === "reviews") {
        return b.reviews - a.reviews;
      }

      return (
        Number(b.recommended) - Number(a.recommended) ||
        b.rating - a.rating ||
        b.reviews - a.reviews
      );
    });
  }

  function createAppointmentId() {
    const datePart = getLocalDateString(new Date()).replaceAll("-", "");
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `MS-${datePart}-${randomPart}`;
  }

  function showReceipt(appointment) {
    const fields = {
      receiptId: appointment.id,
      receiptName: appointment.patientName,
      receiptEmail: appointment.email,
      receiptPhone: appointment.phone,
      receiptDoctor: appointment.doctorName,
      receiptSpecialty: appointment.specialty,
      receiptDate: formatDate(appointment.date),
      receiptTime: appointment.time,
      receiptRating: `${appointment.rating.toFixed(1)}/5 (sample rating)`,
      receiptGenerated: new Date(appointment.createdAt).toLocaleString("en-IN")
    };

    Object.entries(fields).forEach(function ([elementId, value]) {
      document.getElementById(elementId).textContent = value;
    });

    receiptSection.hidden = false;
    receiptSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderHistory() {
    appointmentHistory.replaceChildren();

    const appointments = getAppointments().slice().reverse();

    if (appointments.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-history";
      empty.textContent = "No appointments saved in this browser yet.";
      appointmentHistory.appendChild(empty);
      return;
    }

    appointments.forEach(function (appointment) {
      const item = document.createElement("div");
      item.className = "history-item";

      const details = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = `${appointment.doctorName} · ${appointment.specialty}`;

      const patient = document.createElement("p");
      patient.textContent =
        `${appointment.patientName} · ${formatDate(appointment.date)} · ${appointment.time}`;

      const id = document.createElement("span");
      id.className = "history-id";
      id.textContent = `Appointment ID: ${appointment.id}`;

      details.append(name, patient, id);

      const viewButton = document.createElement("button");
      viewButton.className = "btn btn-secondary";
      viewButton.type = "button";
      viewButton.textContent = "View Receipt";

      viewButton.addEventListener("click", function () {
        showReceipt(appointment);
      });

      item.append(details, viewButton);
      appointmentHistory.appendChild(item);
    });
  }

  specialtySelect.addEventListener("change", function () {
    populateDoctorDropdown();
  });

  searchForm.addEventListener("submit", runSearch);

  sortRating.addEventListener("change", function () {
    sortDoctors();
    renderDoctors(lastSearchResults);
  });

  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();
    bookingError.hidden = true;

    if (!selectedDoctor) {
      bookingError.textContent = "Please select a doctor from the search results.";
      bookingError.hidden = false;
      return;
    }

    if (!chosenDate || !chosenTime) {
      bookingError.textContent = "Please search for doctors using a date and time slot.";
      bookingError.hidden = false;
      return;
    }

    const patientName = document.getElementById("patientName").value.trim();
    const email = document.getElementById("patientEmail").value.trim();
    const phone = document.getElementById("patientPhone").value.trim();

    if (!patientName || !email || !phone) {
      bookingError.textContent = "Please fill in your name, email, and phone number.";
      bookingError.hidden = false;
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      bookingError.textContent = "Please enter a valid 10-digit phone number.";
      bookingError.hidden = false;
      return;
    }

    const dateObject = new Date(chosenDate + "T00:00:00");
    const today = new Date(getLocalDateString(new Date()) + "T00:00:00");

    if (dateObject < today) {
      bookingError.textContent = "Your appointment date cannot be in the past.";
      bookingError.hidden = false;
      return;
    }

    const appointment = {
      id: createAppointmentId(),
      patientName: patientName,
      email: email,
      phone: phone,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      rating: selectedDoctor.rating,
      date: chosenDate,
      time: chosenTime,
      fee: CONSULTATION_FEE,
      createdAt: new Date().toISOString()
    };

    const appointments = getAppointments();
    appointments.push(appointment);

    if (!saveAppointments(appointments)) {
      bookingError.textContent =
        "Your browser could not save this appointment. Please check browser storage settings and try again.";
      bookingError.hidden = false;
      return;
    }

    renderHistory();
    showReceipt(appointment);
  });

  document.getElementById("printReceipt").addEventListener("click", function () {
    if (receiptSection.hidden) {
      alert("Please confirm an appointment or open a saved receipt first.");
      return;
    }

    window.print();
  });

  document.getElementById("newBooking").addEventListener("click", function () {
    receiptSection.hidden = true;
    bookingSection.hidden = true;
    selectedDoctor = null;
    bookingForm.reset();
    searchForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("clearAppointments").addEventListener("click", function () {
    const appointments = getAppointments();

    if (appointments.length === 0) {
      alert("There is no saved appointment history to clear.");
      return;
    }

    const confirmed = window.confirm(
      "Clear all appointments saved by this MediSlot demo in this browser?"
    );

    if (!confirmed) return;

    if (saveAppointments([])) {
      renderHistory();
      alert("Saved appointment history cleared.");
    } else {
      alert("Could not clear history. Please try again.");
    }
  });

  // Start-up: initialize the page and populate the doctor dropdown.
  setTodayAsMinimum();
  populateDoctorDropdown();
  renderHistory();
});
