
/* =========================================================
   MEDISLOT AI — COMPLETE BOOKING SCRIPT
   Step 1: Choose doctor, date and time
   Step 2: Review the selected doctor and slot
   Step 3: Enter patient details and confirm
   ========================================================= */

/* EMAILJS CONFIGURATION */
const EMAILJS_PUBLIC_KEY = "XqKQRka3CioBYl-qZ";
const EMAILJS_SERVICE_ID = "service_qlo3wqh";
const EMAILJS_TEMPLATE_ID = "template_ujfmo3r";

/* FICTIONAL DEMONSTRATION DOCTORS */
const doctors = [
  { id: 1, name: "Dr. Aarav Sharma", specialty: "General Physician", rating: 4.9, reviews: 245, experience: "12 years", fee: 500 },
  { id: 2, name: "Dr. Priya Mehta", specialty: "Cardiologist", rating: 4.8, reviews: 198, experience: "10 years", fee: 800 },
  { id: 3, name: "Dr. Rohan Gupta", specialty: "Dermatologist", rating: 4.7, reviews: 174, experience: "9 years", fee: 600 },
  { id: 4, name: "Dr. Ananya Verma", specialty: "Pediatrician", rating: 4.9, reviews: 221, experience: "11 years", fee: 650 },
  { id: 5, name: "Dr. Kabir Singh", specialty: "Orthopedic", rating: 4.6, reviews: 142, experience: "8 years", fee: 700 },
  { id: 6, name: "Dr. Meera Joshi", specialty: "Gynecologist", rating: 4.8, reviews: 203, experience: "13 years", fee: 750 },
  { id: 7, name: "Dr. Ishaan Kapoor", specialty: "Neurologist", rating: 4.7, reviews: 116, experience: "10 years", fee: 900 },
  { id: 8, name: "Dr. Sanya Malhotra", specialty: "Ophthalmologist", rating: 4.8, reviews: 156, experience: "9 years", fee: 600 },
  { id: 9, name: "Dr. Vivaan Patel", specialty: "Dentist", rating: 4.6, reviews: 134, experience: "7 years", fee: 500 },
  { id: 10, name: "Dr. Aditi Rao", specialty: "Psychiatrist", rating: 4.9, reviews: 188, experience: "12 years", fee: 850 },
  { id: 11, name: "Dr. Reyansh Jain", specialty: "ENT Specialist", rating: 4.5, reviews: 102, experience: "6 years", fee: 550 },
  { id: 12, name: "Dr. Kavya Nair", specialty: "Endocrinologist", rating: 4.8, reviews: 163, experience: "11 years", fee: 800 },
  { id: 13, name: "Dr. Aditya Soni", specialty: "Gastroenterologist", rating: 4.7, reviews: 149, experience: "9 years", fee: 750 },
  { id: 14, name: "Dr. Nisha Bansal", specialty: "Pulmonologist", rating: 4.6, reviews: 121, experience: "8 years", fee: 700 }
];

/* ELEMENTS */
const $ = (id) => document.getElementById(id);

const form = $("bookingForm");
const step1 = $("step1");
const step2 = $("step2");
const step3 = $("step3");
const receipt = $("receipt");

const specialtyInput = $("specialty");
const doctorInput = $("preferredDoctor");
const ratingInput = $("ratingPreference");
const dateInput = $("preferredDate");
const timeInput = $("preferredTime");

const patientNameInput = $("patientName");
const patientEmailInput = $("patientEmail");
const patientPhoneInput = $("patientPhone");

const selectionSummary = $("selectionSummary");
const selectedDoctorProfile = $("selectedDoctorProfile");
const finalSummary = $("finalSummary");
const emailStatus = $("emailStatus");
const receiptEmailStatus = $("receiptEmailStatus");
const bookingReference = $("bookingReference");
const receiptDetails = $("receiptDetails");

const toStep2 = $("toStep2");
const backToStep1 = $("backToStep1");
const toStep3 = $("toStep3");
const backToStep2 = $("backToStep2");
const submitBooking = $("submitBooking");
const printReceipt = $("printReceipt");
const newBooking = $("newBooking");

let selectedDoctor = null;
let emailJsReady = false;
let isSubmitting = false;

/* HELPERS */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatDate(value) {
  if (!value) return "Not selected";

  const date = new Date(value + "T12:00:00");

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "Not selected";

  const parts = value.split(":");
  const hours = Number(parts[0]);
  const minutes = parts[1] || "00";

  if (!Number.isFinite(hours)) return value;

  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
}

function generateBookingReference() {
  return `MSAI-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function setStatus(element, message, type = "info") {
  if (!element) return;

  element.textContent = message;
  element.dataset.status = type;
  element.hidden = !message;
}

function scrollToElement(element) {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

/* EMAILJS */
function initializeEmailJS() {
  if (!window.emailjs) {
    emailJsReady = false;
    console.warn("EmailJS did not load.");
    return;
  }

  try {
    window.emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY
    });

    emailJsReady = true;
    console.log("EmailJS initialized.");
  } catch (error) {
    emailJsReady = false;
    console.error("EmailJS initialization failed:", error);
  }
}

/* POPULATE THE 14-DOCTOR DROPDOWN */
function populateDoctorDropdown() {
  const previousValue = doctorInput.value;

  doctorInput.innerHTML = '<option value="">Select a doctor</option>';

  doctors.forEach((doctor) => {
    const option = document.createElement("option");

    option.value = doctor.name;
    option.textContent =
      `${doctor.name} — ${doctor.specialty} — ${doctor.rating.toFixed(1)}/5`;

    doctorInput.appendChild(option);
  });

  if (doctors.some((doctor) => doctor.name === previousValue)) {
    doctorInput.value = previousValue;
  }
}

/* DATE VALIDATION */
function initializeDateField() {
  const now = new Date();

  const today =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}`;

  dateInput.min = today;

  if (dateInput.value && dateInput.value < today) {
    dateInput.value = "";
  }
}

/* RATING FILTER */
function matchesRating(doctor) {
  const value = ratingInput.value;

  if (value === "highly") return doctor.rating >= 4.5;
  if (value === "above") return doctor.rating >= 4.0 && doctor.rating < 4.5;
  if (value === "average") return doctor.rating >= 3.0 && doctor.rating < 4.0;
  if (value === "below") return doctor.rating < 3.0;

  return true;
}

/* FILTER DOCTOR OPTIONS WITHOUT LOSING THE SELECTED DOCTOR */
function filterDoctorDropdown() {
  const currentValue = doctorInput.value;
  const specialty = specialtyInput.value.toLowerCase();

  Array.from(doctorInput.options).forEach((option, index) => {
    if (index === 0) {
      option.hidden = false;
      return;
    }

    const doctor = doctors.find((item) => item.name === option.value);

    if (!doctor) return;

    const specialtyMatches =
      !specialty || doctor.specialty.toLowerCase() === specialty;

    const ratingMatches = matchesRating(doctor);

    option.hidden = !specialtyMatches || !ratingMatches;
  });

  const currentDoctor = doctors.find(
    (doctor) => doctor.name === currentValue
  );

  if (
    currentDoctor &&
    (
      (specialty && currentDoctor.specialty.toLowerCase() !== specialty) ||
      !matchesRating(currentDoctor)
    )
  ) {
    doctorInput.value = "";
    selectedDoctor = null;
  }

  if (currentValue && doctorInput.value === currentValue) {
    doctorInput.value = currentValue;
  }

  updateSelectionSummary();
  updateFinalSummary();
}

/* GET THE SELECTED DOCTOR */
function syncSelectedDoctor() {
  selectedDoctor = doctors.find(
    (doctor) => doctor.name === doctorInput.value
  ) || null;

  return selectedDoctor;
}

/* SHOW THE SELECTED DOCTOR ON STEP 2 */
function renderSelectedDoctor() {
  if (!selectedDoctor) {
    selectedDoctorProfile.innerHTML =
      '<p class="empty-state">Please return to Preferences and select a doctor.</p>';
    return;
  }

  selectedDoctorProfile.innerHTML = `
    <div class="doctor-profile-header">
      <div class="doctor-avatar">
        ${escapeHTML(selectedDoctor.name.replace("Dr. ", "").split(" ").map(part => part[0]).slice(0, 2).join(""))}
      </div>

      <div class="doctor-profile-info">
        <h3>${escapeHTML(selectedDoctor.name)}</h3>
        <p class="doctor-specialty">${escapeHTML(selectedDoctor.specialty)}</p>
        <p class="doctor-rating">⭐ ${selectedDoctor.rating.toFixed(1)} / 5 (${selectedDoctor.reviews} reviews)</p>
        <span class="rating-badge">${selectedDoctor.rating >= 4.5 ? "Highly Recommended" : "Recommended"}</span>
      </div>
    </div>

    <div class="doctor-profile-details">
      <p><strong>Experience:</strong> ${escapeHTML(selectedDoctor.experience)}</p>
      <p><strong>Consultation fee:</strong> ₹${selectedDoctor.fee}</p>
      <p><strong>Appointment date:</strong> ${escapeHTML(formatDate(dateInput.value))}</p>
      <p><strong>Appointment time:</strong> ${escapeHTML(formatTime(timeInput.value))}</p>
    </div>
  `;
}

/* STEP 2 SUMMARY */
function updateSelectionSummary() {
  if (!selectionSummary) return;

  selectionSummary.innerHTML = `
    <p><strong>Specialty:</strong> ${escapeHTML(specialtyInput.value || "Not selected")}</p>
    <p><strong>Selected doctor:</strong> ${escapeHTML(selectedDoctor?.name || doctorInput.value || "Not selected")}</p>
    <p><strong>Date:</strong> ${escapeHTML(formatDate(dateInput.value))}</p>
    <p><strong>Time:</strong> ${escapeHTML(formatTime(timeInput.value))}</p>
  `;

  if (step2 && !step2.hidden) {
    renderSelectedDoctor();
  }
}

/* STEP 3 SUMMARY */
function updateFinalSummary() {
  if (!finalSummary) return;

  finalSummary.innerHTML = `
    <p><strong>Patient:</strong> ${escapeHTML(patientNameInput.value)}</p>
    <p><strong>Email:</strong> ${escapeHTML(patientEmailInput.value)}</p>
    <p><strong>Phone:</strong> ${escapeHTML(patientPhoneInput.value)}</p>
    <p><strong>Specialty:</strong> ${escapeHTML(specialtyInput.value)}</p>
    <p><strong>Doctor:</strong> ${escapeHTML(selectedDoctor?.name || doctorInput.value || "Not selected")}</p>
    <p><strong>Appointment date:</strong> ${escapeHTML(formatDate(dateInput.value))}</p>
    <p><strong>Appointment time:</strong> ${escapeHTML(formatTime(timeInput.value))}</p>
    <p><strong>Doctor's sample consultation fee:</strong> ₹${selectedDoctor ? selectedDoctor.fee : "—"}</p>
    <p><strong>Project demonstration amount:</strong> ₹800</p>
  `;
}

/* UPDATE STEP INDICATORS */
function updateStepper(stepNumber) {
  document.querySelectorAll("[data-step-indicator]").forEach((indicator) => {
    const number = Number(indicator.dataset.stepIndicator);

    indicator.classList.toggle("active", number === stepNumber);
    indicator.classList.toggle("completed", number < stepNumber);
  });
}

/* SHOW A BOOKING STEP */
function showStep(stepNumber) {
  step1.hidden = stepNumber !== 1;
  step2.hidden = stepNumber !== 2;
  step3.hidden = stepNumber !== 3;
  receipt.hidden = true;
  form.hidden = false;

  updateStepper(stepNumber);

  const target = stepNumber === 1 ? step1 : stepNumber === 2 ? step2 : step3;
  scrollToElement(target);
}

/* VALIDATE ONLY THE FIELDS IN THE CURRENT STEP */
function validateStep(container) {
  const fields = container.querySelectorAll("input, select, textarea");

  for (const field of fields) {
    if (field.disabled || field.type === "button" || field.type === "submit") {
      continue;
    }

    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }

  return true;
}

/* BUILD BOOKING DATA */
function buildBooking() {
  return {
    booking_id: generateBookingReference(),
    patient_name: patientNameInput.value.trim(),
    patient_email: patientEmailInput.value.trim(),
    patient_phone: patientPhoneInput.value.trim(),
    to_email: patientEmailInput.value.trim(),
    doctor_name: selectedDoctor.name,
    specialty: selectedDoctor.specialty,
    appointment_date: formatDate(dateInput.value),
    appointment_time: formatTime(timeInput.value),
    consultation_fee: selectedDoctor.fee,
    created_at: new Date().toISOString()
  };
}

/* SAVE A DEMONSTRATION BOOKING IN THIS BROWSER */
function saveDemoBooking(booking) {
  try {
    const key = "medislot_ai_demo_bookings";
    const bookings = JSON.parse(localStorage.getItem(key) || "[]");

    const duplicate = bookings.some((item) =>
      item.doctor_name === booking.doctor_name &&
      item.appointment_date === booking.appointment_date &&
      item.appointment_time === booking.appointment_time
    );

    if (duplicate) return { saved: false, duplicate: true };

    bookings.push(booking);
    localStorage.setItem(key, JSON.stringify(bookings));

    return { saved: true, duplicate: false };
  } catch (error) {
    console.error("Could not save booking:", error);
    return { saved: false, duplicate: false };
  }
}

/* SEND EMAIL */
async function sendConfirmationEmail(booking) {
  if (!emailJsReady || !window.emailjs) {
    throw new Error("EmailJS is not ready. Check the EmailJS configuration.");
  }

  const templateParams = {
    to_email: booking.to_email,
    patient_name: booking.patient_name,
    patient_email: booking.patient_email,
    patient_phone: booking.patient_phone,
    doctor_name: booking.doctor_name,
    specialty: booking.specialty,
    appointment_date: booking.appointment_date,
    appointment_time: booking.appointment_time,
    booking_id: booking.booking_id,
    consultation_fee: booking.consultation_fee
  };

  return window.emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams
  );
}

/* SHOW RECEIPT */
function showReceipt(booking) {
  bookingReference.textContent = booking.booking_id;

  receiptDetails.innerHTML = `
    <p><strong>Patient:</strong> ${escapeHTML(booking.patient_name)}</p>
    <p><strong>Email:</strong> ${escapeHTML(booking.patient_email)}</p>
    <p><strong>Phone:</strong> ${escapeHTML(booking.patient_phone)}</p>
    <p><strong>Doctor:</strong> ${escapeHTML(booking.doctor_name)}</p>
    <p><strong>Specialty:</strong> ${escapeHTML(booking.specialty)}</p>
    <p><strong>Date:</strong> ${escapeHTML(booking.appointment_date)}</p>
    <p><strong>Time:</strong> ${escapeHTML(booking.appointment_time)}</p>
    <p><strong>Doctor's sample fee:</strong> ₹${escapeHTML(booking.consultation_fee)}</p>
  `;

  form.hidden = true;
  receipt.hidden = false;
  updateStepper(3);
  scrollToElement(receipt);
}

/* SUBMIT BOOKING */
async function handleBookingSubmission(event) {
  event.preventDefault();

  if (isSubmitting || !validateStep(step3)) return;

  syncSelectedDoctor();

  if (!selectedDoctor || !dateInput.value || !timeInput.value) {
    alert("Your selected doctor, date or time is missing. Please return to Preferences.");
    showStep(1);
    return;
  }

  const booking = buildBooking();

  isSubmitting = true;
  submitBooking.disabled = true;
  submitBooking.textContent = "Processing booking...";

  try {
    const saveResult = saveDemoBooking(booking);

    if (saveResult.duplicate) {
      alert("This doctor and time are already in this browser's demo booking list. Please choose another time.");
      showStep(1);
      return;
    }

    showReceipt(booking);

    setStatus(
      receiptEmailStatus,
      "Demo booking recorded in this browser. Sending confirmation email...",
      "info"
    );

    try {
      await sendConfirmationEmail(booking);

      setStatus(
        receiptEmailStatus,
        `Confirmation email sent to ${booking.patient_email}. Check your inbox and spam folder.`,
        "success"
      );
    } catch (error) {
      console.error("EmailJS send error:", error);

      setStatus(
        receiptEmailStatus,
        "The demo booking was recorded, but the confirmation email could not be sent. Check your EmailJS template and dashboard logs.",
        "error"
      );
    }
  } catch (error) {
    console.error("Booking error:", error);
    alert("Something went wrong while processing the booking. Please try again.");
  } finally {
    isSubmitting = false;
    submitBooking.disabled = false;
    submitBooking.textContent = "Confirm Booking · ₹800";
  }
}

/* RESET */
function resetBooking() {
  form.reset();
  form.hidden = false;
  receipt.hidden = true;

  selectedDoctor = null;
  isSubmitting = false;

  submitBooking.disabled = false;
  submitBooking.textContent = "Confirm Booking · ₹800";

  populateDoctorDropdown();
  initializeDateField();
  filterDoctorDropdown();
  updateSelectionSummary();
  updateFinalSummary();

  setStatus(emailStatus, "");
  setStatus(receiptEmailStatus, "");

  showStep(1);
}

/* EVENT LISTENERS */
function attachEventListeners() {
  toStep2.addEventListener("click", () => {
    if (!validateStep(step1)) return;

    syncSelectedDoctor();

    if (!selectedDoctor) {
      alert("Please select your preferred doctor.");
      doctorInput.focus();
      return;
    }

    if (!dateInput.value || !timeInput.value) {
      alert("Please select your appointment date and time.");
      return;
    }

    updateSelectionSummary();
    renderSelectedDoctor();
    showStep(2);
  });

  backToStep1.addEventListener("click", () => showStep(1));

  toStep3.addEventListener("click", () => {
    // No second doctor selection or time-slot validation here.
    // Step 1 already validated and saved these choices.
    syncSelectedDoctor();

    if (!selectedDoctor || !dateInput.value || !timeInput.value) {
      alert("Your selection is incomplete. Please check Preferences.");
      showStep(1);
      return;
    }

    updateFinalSummary();
    showStep(3);
  });

  backToStep2.addEventListener("click", () => {
    updateSelectionSummary();
    renderSelectedDoctor();
    showStep(2);
  });

  form.addEventListener("submit", handleBookingSubmission);

  specialtyInput.addEventListener("change", () => {
    filterDoctorDropdown();
  });

  ratingInput.addEventListener("change", () => {
    filterDoctorDropdown();
  });

  doctorInput.addEventListener("change", () => {
    syncSelectedDoctor();
    updateSelectionSummary();
    updateFinalSummary();
  });

  dateInput.addEventListener("change", () => {
    updateSelectionSummary();
    updateFinalSummary();
  });

  timeInput.addEventListener("change", () => {
    updateSelectionSummary();
    updateFinalSummary();
  });

  [patientNameInput, patientEmailInput, patientPhoneInput].forEach((field) => {
    field.addEventListener("input", updateFinalSummary);
  });

  printReceipt.addEventListener("click", () => window.print());
  newBooking.addEventListener("click", resetBooking);
}

/* START */
function initializeMediSlot() {
  populateDoctorDropdown();
  initializeDateField();
  initializeEmailJS();
  attachEventListeners();
  updateSelectionSummary();
  updateFinalSummary();
  showStep(1);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMediSlot);
} else {
  initializeMediSlot();
}
