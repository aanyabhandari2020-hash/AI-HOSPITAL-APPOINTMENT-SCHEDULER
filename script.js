
"use strict";

// ==========================================
// MEDISLOT AI - DOCTOR APPOINTMENT BOOKING
// Academic demonstration using fictional data
// ==========================================

const CONSULTATION_FEE = 800;

// Ten fictional doctors with sample ratings.
// These are not real doctors or verified reviews.

const doctors = [
  {
    id: 1,
    name: "Dr. Aarav Sharma",
    specialties: ["Cardiologist", "General Physician"],
    rating: 4.9,
    category: "highly",
    experience: 12
  },
  {
    id: 2,
    name: "Dr. Meera Kapoor",
    specialties: ["Dermatologist", "Endocrinologist"],
    rating: 4.7,
    category: "highly",
    experience: 9
  },
  {
    id: 3,
    name: "Dr. Rohan Mehta",
    specialties: ["General Physician", "Pediatrician"],
    rating: 4.3,
    category: "above",
    experience: 8
  },
  {
    id: 4,
    name: "Dr. Ananya Verma",
    specialties: ["Neurologist", "Psychiatrist"],
    rating: 4.8,
    category: "highly",
    experience: 11
  },
  {
    id: 5,
    name: "Dr. Kabir Singh",
    specialties: ["Orthopedist", "General Physician"],
    rating: 4.1,
    category: "above",
    experience: 10
  },
  {
    id: 6,
    name: "Dr. Isha Malhotra",
    specialties: ["Pediatrician", "Gynecologist"],
    rating: 3.8,
    category: "average",
    experience: 6
  },
  {
    id: 7,
    name: "Dr. Vivaan Joshi",
    specialties: ["Gynecologist", "Endocrinologist"],
    rating: 4.6,
    category: "highly",
    experience: 9
  },
  {
    id: 8,
    name: "Dr. Sara Khan",
    specialties: ["Ophthalmologist", "Dentist"],
    rating: 3.6,
    category: "average",
    experience: 7
  },
  {
    id: 9,
    name: "Dr. Aditya Rao",
    specialties: ["Dentist", "ENT Specialist"],
    rating: 2.8,
    category: "below",
    experience: 5
  },
  {
    id: 10,
    name: "Dr. Kiara Das",
    specialties: ["ENT Specialist", "Cardiologist", "Dermatologist"],
    rating: 4.4,
    category: "above",
    experience: 8
  }
];

// Appointment time options for the demo.
const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM"
];

// ==========================================
// GET HTML ELEMENTS
// ==========================================

const bookingForm = document.getElementById("bookingForm");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const receipt = document.getElementById("receipt");

const specialtySelect = document.getElementById("specialty");
const preferredDoctorSelect =
  document.getElementById("preferredDoctor");
const ratingPreferenceSelect =
  document.getElementById("ratingPreference");

const preferredDateInput =
  document.getElementById("preferredDate");
const preferredTimeSelect =
  document.getElementById("preferredTime");

const doctorSearch = document.getElementById("doctorSearch");
const doctorList = document.getElementById("doctorList");
const chosenSlotSelect = document.getElementById("chosenSlot");

const selectionSummary =
  document.getElementById("selectionSummary");
const finalSummary = document.getElementById("finalSummary");

const patientNameInput = document.getElementById("patientName");
const patientEmailInput = document.getElementById("patientEmail");
const patientPhoneInput = document.getElementById("patientPhone");

// Current booking information.
let selectedDoctorId = null;
let currentStep = 1;

// ==========================================
// DATE SETUP
// ==========================================

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

preferredDateInput.min = getLocalDateString();
preferredDateInput.value = getLocalDateString();

// ==========================================
// RATINGS AND RECOMMENDATION LABELS
// ==========================================

function getRatingLabel(rating) {
  if (rating >= 4.5) {
    return "Highly Recommended";
  }

  if (rating >= 4.0) {
    return "Above Average";
  }

  if (rating >= 3.0) {
    return "Average";
  }

  return "Below Average";
}

function getRatingClass(rating) {
  if (rating >= 4.5) return "highly";
  if (rating >= 4.0) return "above";
  if (rating >= 3.0) return "average";

  return "below";
}

// ==========================================
// POPULATE THE PREFERRED DOCTOR DROPDOWN
// ==========================================

function populateDoctorDropdown() {
  preferredDoctorSelect.innerHTML =
    '<option value="">Select a doctor</option>';

  doctors.forEach((doctor) => {
    const option = document.createElement("option");

    option.value = String(doctor.id);

    option.textContent =
      `${doctor.name} | ${doctor.rating.toFixed(1)}/5 | ` +
      `${getRatingLabel(doctor.rating)} | ` +
      `${doctor.specialties.join(", ")}`;

    preferredDoctorSelect.appendChild(option);
  });
}

// ==========================================
// FILTER DOCTORS
// ==========================================

function getMatchingDoctors() {
  const specialty = specialtySelect.value;
  const ratingPreference = ratingPreferenceSelect.value;

  return doctors.filter((doctor) => {
    const matchesSpecialty =
      doctor.specialties.includes(specialty);

    const matchesRating =
      ratingPreference === "all" ||
      doctor.category === ratingPreference;

    return matchesSpecialty && matchesRating;
  });
}

// ==========================================
// DISPLAY DOCTOR CARDS
// ==========================================

function renderDoctors() {
  const matchingDoctors = getMatchingDoctors();
  const searchTerm = doctorSearch.value.trim().toLowerCase();

  const visibleDoctors = matchingDoctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm)
  );

  doctorList.innerHTML = "";

  if (visibleDoctors.length === 0) {
    const emptyMessage = document.createElement("div");

    emptyMessage.className = "empty-state";
    emptyMessage.textContent =
      "No sample doctors match these preferences. " +
      "Go back and select another rating category or specialty.";

    doctorList.appendChild(emptyMessage);
    selectedDoctorId = null;
    return;
  }

  // Preserve a valid existing choice when possible.
  const selectionStillAvailable = visibleDoctors.some(
    (doctor) => doctor.id === selectedDoctorId
  );

  if (!selectionStillAvailable) {
    const preferredId = Number(preferredDoctorSelect.value);

    const preferredMatch = visibleDoctors.find(
      (doctor) => doctor.id === preferredId
    );

    selectedDoctorId = preferredMatch
      ? preferredMatch.id
      : visibleDoctors[0].id;
  }

  visibleDoctors.forEach((doctor) => {
    const card = document.createElement("label");
    card.className = "doctor-card";

    if (doctor.id === selectedDoctorId) {
      card.classList.add("selected");
    }

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "selectedDoctor";
    radio.value = String(doctor.id);
    radio.checked = doctor.id === selectedDoctorId;
    radio.setAttribute("aria-label", doctor.name);

    const avatar = document.createElement("span");
    avatar.className = "doctor-avatar";

    avatar.textContent = doctor.name
      .replace("Dr. ", "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);

    const info = document.createElement("div");
    info.className = "doctor-info";

    const name = document.createElement("h3");
    name.textContent = doctor.name;

    const specialty = document.createElement("div");
    specialty.className = "doctor-specialty";
    specialty.textContent = doctor.specialties.join(" · ");

    const experience = document.createElement("div");
    experience.className = "doctor-specialty";
    experience.textContent =
      `${doctor.experience} years of sample experience`;

    const rating = document.createElement("div");
    rating.className = "doctor-rating";
    rating.textContent =
      `★ ${doctor.rating.toFixed(1)} / 5.0`;

    const badge = document.createElement("span");
    badge.className =
      `rating-badge ${getRatingClass(doctor.rating)}`;
    badge.textContent = getRatingLabel(doctor.rating);

    info.append(name, specialty, experience, rating, badge);

    if (doctor.id === Number(preferredDoctorSelect.value)) {
      const preferredLabel = document.createElement("div");
      preferredLabel.className = "preferred-label";
      preferredLabel.textContent = "Your preferred doctor";
      info.appendChild(preferredLabel);
    }

    card.append(radio, avatar, info);

    radio.addEventListener("change", () => {
      selectedDoctorId = doctor.id;

      document.querySelectorAll(".doctor-card").forEach((item) => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");
    });

    doctorList.appendChild(card);
  });
}

// ==========================================
// DISPLAY SELECTED PREFERENCES
// ==========================================

function showSelectionSummary() {
  const doctor = doctors.find(
    (item) => item.id === Number(preferredDoctorSelect.value)
  );

  selectionSummary.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "summary-line";

  const headingLabel = document.createElement("strong");
  headingLabel.textContent = "Your booking preferences";

  heading.appendChild(headingLabel);
  selectionSummary.appendChild(heading);

  const details = [
    ["Specialty", specialtySelect.value],
    ["Preferred doctor", doctor ? doctor.name : "No preference"],
    ["Rating category", ratingPreferenceSelect.options[
      ratingPreferenceSelect.selectedIndex
    ].text],
    ["Preferred date", preferredDateInput.value],
    ["Preferred time", preferredTimeSelect.value]
  ];

  details.forEach(([label, value]) => {
    const line = document.createElement("div");
    line.className = "summary-line";

    const key = document.createElement("span");
    key.textContent = `${label}:`;

    const val = document.createElement("strong");
    val.textContent = value;

    line.append(key, val);
    selectionSummary.appendChild(line);
  });
}

// ==========================================
// SLOT SELECTION
// ==========================================

function populateTimeSlots() {
  chosenSlotSelect.innerHTML =
    '<option value="">Select an available slot</option>';

  timeSlots.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;

    chosenSlotSelect.appendChild(option);
  });

  // Preselect the requested time when it matches an option.
  chosenSlotSelect.value = preferredTimeSelect.value;
}

// ==========================================
// STEP NAVIGATION
// ==========================================

function showStep(stepNumber) {
  currentStep = stepNumber;

  [step1, step2, step3].forEach((section, index) => {
    const isActive = index + 1 === stepNumber;

    section.hidden = !isActive;
    section.classList.toggle("active", isActive);
  });

  document.querySelectorAll("[data-step-indicator]").forEach(
    (indicator) => {
      const number = Number(
        indicator.dataset.stepIndicator
      );

      indicator.classList.toggle(
        "active",
        number === stepNumber
      );

      indicator.classList.toggle(
        "completed",
        number < stepNumber
      );
    }
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateFields(fieldIds) {
  for (const id of fieldIds) {
    const field = document.getElementById(id);

    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }

  return true;
}

// STEP 1 -> STEP 2

document.getElementById("toStep2").addEventListener("click", () => {
  const valid = validateFields([
    "specialty",
    "preferredDoctor",
    "preferredDate",
    "preferredTime"
  ]);

  if (!valid) return;

  if (preferredDateInput.value < getLocalDateString()) {
    alert("Please select today or a future date.");
    preferredDateInput.focus();
    return;
  }

  const matches = getMatchingDoctors();

  if (matches.length === 0) {
    alert(
      "No sample doctor matches this specialty and rating category. " +
      "Please change your rating preference."
    );
    ratingPreferenceSelect.focus();
    return;
  }

  selectedDoctorId = null;
  doctorSearch.value = "";

  showSelectionSummary();
  renderDoctors();
  populateTimeSlots();
  showStep(2);
});

// STEP 2 -> STEP 1

document.getElementById("backToStep1").addEventListener("click", () => {
  showStep(1);
});

// Update the list as the user types.
doctorSearch.addEventListener("input", renderDoctors);

// STEP 2 -> STEP 3

document.getElementById("toStep3").addEventListener("click", () => {
  if (!selectedDoctorId) {
    alert("Please select a doctor.");
    return;
  }

  if (!chosenSlotSelect.value) {
    alert("Please select an appointment slot.");
    chosenSlotSelect.focus();
    return;
  }

  const doctor = doctors.find(
    (item) => item.id === selectedDoctorId
  );

  if (!doctor || !doctor.specialties.includes(specialtySelect.value)) {
    alert("Please choose a doctor who matches your selected specialty.");
    return;
  }

  if (
    ratingPreferenceSelect.value !== "all" &&
    doctor.category !== ratingPreferenceSelect.value
  ) {
    alert("Please choose a doctor in your selected rating category.");
    return;
  }

  showFinalSummary();
  showStep(3);
});

// STEP 3 -> STEP 2

document.getElementById("backToStep2").addEventListener("click", () => {
  showStep(2);
});

// ==========================================
// PATIENT SUMMARY
// ==========================================

function showFinalSummary() {
  const doctor = doctors.find(
    (item) => item.id === selectedDoctorId
  );

  finalSummary.replaceChildren();

  const title = document.createElement("strong");
  title.textContent = "Appointment summary";

  const details = [
    ["Doctor", doctor.name],
    ["Specialty", specialtySelect.value],
    ["Rating", `${doctor.rating.toFixed(1)}/5 — ${getRatingLabel(doctor.rating)}`],
    ["Date", preferredDateInput.value],
    ["Time", chosenSlotSelect.value],
    ["Consultation fee", `₹${CONSULTATION_FEE}`]
  ];

  finalSummary.appendChild(title);

  details.forEach(([label, value]) => {
    const line = document.createElement("div");
    line.className = "summary-line";

    const key = document.createElement("span");
    key.textContent = `${label}:`;

    const val = document.createElement("strong");
    val.textContent = value;

    line.append(key, val);
    finalSummary.appendChild(line);
  });
}

// ==========================================
// RECEIPT GENERATION
// ==========================================

function addReceiptRow(container, label, value) {
  const row = document.createElement("div");
  row.className = "receipt-row";

  const key = document.createElement("span");
  key.textContent = label;

  const val = document.createElement("strong");
  val.textContent = value;

  row.append(key, val);
  container.appendChild(row);
}

function generateReference() {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `MSAI-${Date.now().toString().slice(-6)}-${randomPart}`;
}

function generateReceipt() {
  const doctor = doctors.find(
    (item) => item.id === selectedDoctorId
  );

  const patientName = patientNameInput.value.trim();
  const patientEmail = patientEmailInput.value.trim();
  const patientPhone = patientPhoneInput.value.trim();

  document.getElementById("bookingReference").textContent =
    generateReference();

  const details = document.getElementById("receiptDetails");
  details.replaceChildren();

  const rows = [
    ["Patient Name", patientName],
    ["Email Address", patientEmail],
    ["Phone Number", patientPhone],
    ["Doctor", doctor.name],
    ["Specialty", specialtySelect.value],
    ["Doctor Rating", `${doctor.rating.toFixed(1)}/5`],
    ["Recommendation", getRatingLabel(doctor.rating)],
    ["Appointment Date", preferredDateInput.value],
    ["Appointment Time", chosenSlotSelect.value],
    ["Booking Status", "Confirmed (Demo)"]
  ];

  rows.forEach(([label, value]) => {
    addReceiptRow(details, label, value);
  });

  bookingForm.hidden = true;
  document.querySelector(".stepper").hidden = true;
  receipt.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// SUBMIT BOOKING

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (currentStep !== 3) return;

  const valid = validateFields([
    "patientName",
    "patientEmail",
    "patientPhone"
  ]);

  if (!valid) return;

  if (
    !selectedDoctorId ||
    !chosenSlotSelect.value ||
    !preferredDateInput.value
  ) {
    alert("Please complete your doctor and slot selection first.");
    showStep(2);
    return;
  }

  generateReceipt();
});

// ==========================================
// PRINT RECEIPT
// ==========================================

document.getElementById("printReceipt").addEventListener("click", () => {
  window.print();
});

// ==========================================
// START A NEW DEMO BOOKING
// ==========================================

document.getElementById("newBooking").addEventListener("click", () => {
  bookingForm.reset();

  selectedDoctorId = null;

  preferredDateInput.min = getLocalDateString();
  preferredDateInput.value = getLocalDateString();

  doctorSearch.value = "";
  chosenSlotSelect.innerHTML =
    '<option value="">Select a slot</option>';

  bookingForm.hidden = false;
  receipt.hidden = true;
  document.querySelector(".stepper").hidden = false;

  showStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ==========================================
// INITIALIZE THE PROJECT
// ==========================================

populateDoctorDropdown();
showStep(1);
