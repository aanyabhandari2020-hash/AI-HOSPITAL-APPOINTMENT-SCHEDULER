
/* =========================================================
   MEDISLOT AI — APPOINTMENT BOOKING & EMAIL CONFIRMATIONS
   File: script.js
   ========================================================= */

/* 1. EMAILJS CONFIGURATION */
const EMAILJS_PUBLIC_KEY = "XqKQRka3CioBYl-qZ";
const EMAILJS_SERVICE_ID = "service_qlo3wqh";
const EMAILJS_TEMPLATE_ID = "template_ujfmo3r";

/* 2. DOCTOR DIRECTORY
   These are demonstration records, not verified real doctors.
*/
const doctors = [
  {
    id: 1,
    name: "Dr. Aarav Sharma",
    specialty: "General Physician",
    rating: 4.9,
    reviews: 245,
    experience: "12 years",
    fee: 500
  },
  {
    id: 2,
    name: "Dr. Priya Mehta",
    specialty: "Cardiologist",
    rating: 4.8,
    reviews: 198,
    experience: "10 years",
    fee: 800
  },
  {
    id: 3,
    name: "Dr. Rohan Gupta",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 174,
    experience: "9 years",
    fee: 600
  },
  {
    id: 4,
    name: "Dr. Ananya Verma",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 221,
    experience: "11 years",
    fee: 650
  },
  {
    id: 5,
    name: "Dr. Kabir Singh",
    specialty: "Orthopedic",
    rating: 4.6,
    reviews: 142,
    experience: "8 years",
    fee: 700
  },
  {
    id: 6,
    name: "Dr. Meera Joshi",
    specialty: "Gynecologist",
    rating: 4.8,
    reviews: 203,
    experience: "13 years",
    fee: 750
  },
  {
    id: 7,
    name: "Dr. Ishaan Kapoor",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 116,
    experience: "10 years",
    fee: 900
  },
  {
    id: 8,
    name: "Dr. Sanya Malhotra",
    specialty: "Ophthalmologist",
    rating: 4.8,
    reviews: 156,
    experience: "9 years",
    fee: 600
  },
  {
    id: 9,
    name: "Dr. Vivaan Patel",
    specialty: "Dentist",
    rating: 4.6,
    reviews: 134,
    experience: "7 years",
    fee: 500
  },
  {
    id: 10,
    name: "Dr. Aditi Rao",
    specialty: "Psychiatrist",
    rating: 4.9,
    reviews: 188,
    experience: "12 years",
    fee: 850
  },
  {
    id: 11,
    name: "Dr. Reyansh Jain",
    specialty: "ENT Specialist",
    rating: 4.5,
    reviews: 102,
    experience: "6 years",
    fee: 550
  },
  {
    id: 12,
    name: "Dr. Kavya Nair",
    specialty: "Endocrinologist",
    rating: 4.8,
    reviews: 163,
    experience: "11 years",
    fee: 800
  },
  {
    id: 13,
    name: "Dr. Aditya Soni",
    specialty: "Gastroenterologist",
    rating: 4.7,
    reviews: 149,
    experience: "9 years",
    fee: 750
  },
  {
    id: 14,
    name: "Dr. Nisha Bansal",
    specialty: "Pulmonologist",
    rating: 4.6,
    reviews: 121,
    experience: "8 years",
    fee: 700
  }
];

/* 3. ELEMENT REFERENCES */
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

const doctorSearch = $("doctorSearch");
const doctorList = $("doctorList");
const chosenSlot = $("chosenSlot");

const patientNameInput = $("patientName");
const patientEmailInput = $("patientEmail");
const patientPhoneInput = $("patientPhone");

const selectionSummary = $("selectionSummary");
const finalSummary = $("finalSummary");

const emailStatus = $("emailStatus");
const receiptEmailStatus = $("receiptEmailStatus");

const bookingReference = $("bookingReference");
const receiptDetails = $("receiptDetails");

const submitBooking = $("submitBooking");

const toStep2 = $("toStep2");
const backToStep1 = $("backToStep1");
const toStep3 = $("toStep3");
const backToStep2 = $("backToStep2");

const printReceipt = $("printReceipt");
const newBooking = $("newBooking");

/* 4. APPLICATION STATE */
let currentStep = 1;
let selectedDoctor = null;
let selectedTime = "";
let emailJsReady = false;
let isSubmitting = false;

/* 5. GENERAL HELPERS */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function formatDate(dateString) {
  if (!dateString) return "Not selected";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTime(timeString) {
  if (!timeString) return "Not selected";

  const parts = timeString.split(":");
  const hours = Number(parts[0]);
  const minutes = parts[1] || "00";

  if (!Number.isFinite(hours)) return timeString;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

function generateBookingReference() {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `MSAI-${Date.now().toString().slice(-6)}-${randomPart}`;
}

function setStatus(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.setAttribute("role", "status");
  element.dataset.status = type || "info";
}

function scrollToElement(element) {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

/* 6. EMAILJS INITIALIZATION */
function initializeEmailJS() {
  if (
    !window.emailjs ||
    !EMAILJS_PUBLIC_KEY ||
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_TEMPLATE_ID
  ) {
    emailJsReady = false;
    console.warn(
      "EmailJS is unavailable. Check the EmailJS script and configuration."
    );
    return false;
  }

  try {
    window.emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY
    });

    emailJsReady = true;
    console.log("MediSlot AI: EmailJS initialized.");
    return true;
  } catch (error) {
    emailJsReady = false;
    console.error("EmailJS initialization failed:", error);
    return false;
  }
}

/* 7. STEP NAVIGATION */
function showStep(stepNumber) {
  currentStep = stepNumber;

  if (step1) step1.hidden = stepNumber !== 1;
  if (step2) step2.hidden = stepNumber !== 2;
  if (step3) step3.hidden = stepNumber !== 3;

  if (receipt) receipt.hidden = true;
  if (form) form.hidden = false;

  scrollToElement(
    stepNumber === 1 ? step1 :
    stepNumber === 2 ? step2 :
    step3
  );
}

function validateStep(container) {
  if (!container) return true;

  const fields = Array.from(
    container.querySelectorAll("input, select, textarea")
  );

  for (const field of fields) {
    if (field.disabled) continue;

    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }

  return true;
}

/* 8. DATE AND TIME OPTIONS */
function initializeDateField() {
  if (!dateInput) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const today = `${year}-${month}-${day}`;

  dateInput.min = today;

  if (dateInput.value && dateInput.value < today) {
    dateInput.value = "";
  }
}

function getAvailableTimes() {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30"
  ];
}

function initializeTimeOptions() {
  if (!timeInput) return;

  const previousValue = timeInput.value;

  timeInput.innerHTML =
    '<option value="">Select a time slot</option>';

  getAvailableTimes().forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = formatTime(time);
    timeInput.appendChild(option);
  });

  if (
    previousValue &&
    getAvailableTimes().includes(previousValue)
  ) {
    timeInput.value = previousValue;
  }
}

/* 9. DOCTOR FILTERING */
function getRatingMinimum() {
  if (!ratingInput) return 0;

  const value = String(ratingInput.value || "").toLowerCase();

  if (
    value.includes("highly") ||
    value.includes("4.5") ||
    value.includes("4.6") ||
    value.includes("4.7") ||
    value.includes("4.8") ||
    value.includes("4.9") ||
    value.includes("5 star")
  ) {
    return 4.5;
  }

  if (value.includes("4")) return 4;
  if (value.includes("3")) return 3;

  return 0;
}

function matchesRating(doctor) {
  if (!ratingInput || !ratingInput.value) return true;

  const value = String(ratingInput.value).toLowerCase();

  if (value.includes("below")) {
    return doctor.rating < 3;
  }

  if (value.includes("highly")) {
    return doctor.rating >= 4.5;
  }

  return doctor.rating >= getRatingMinimum();
}

function getFilteredDoctors() {
  const specialty = specialtyInput
    ? specialtyInput.value.trim().toLowerCase()
    : "";

  const searchText = doctorSearch
    ? doctorSearch.value.trim().toLowerCase()
    : "";

  return doctors.filter((doctor) => {
    const specialtyMatches =
      !specialty ||
      specialty === "all" ||
      doctor.specialty.toLowerCase() === specialty;

    const ratingMatches = matchesRating(doctor);

    const searchMatches =
      !searchText ||
      doctor.name.toLowerCase().includes(searchText) ||
      doctor.specialty.toLowerCase().includes(searchText);

    return specialtyMatches && ratingMatches && searchMatches;
  });
}

function renderDoctors() {
  if (!doctorList) return;

  const filteredDoctors = getFilteredDoctors();

  if (filteredDoctors.length === 0) {
    doctorList.innerHTML =
      '<p class="no-doctors">No doctors match these filters. Try another specialty or rating.</p>';
    return;
  }

  doctorList.innerHTML = filteredDoctors.map((doctor) => `
    <article class="doctor-card">
      <h3>${escapeHTML(doctor.name)}</h3>
      <p>${escapeHTML(doctor.specialty)}</p>
      <p>⭐ ${doctor.rating.toFixed(1)} / 5
        (${doctor.reviews} reviews)</p>
      <p>Experience: ${escapeHTML(doctor.experience)}</p>
      <p>Consultation fee: ₹${doctor.fee}</p>
      <button
        type="button"
        class="select-doctor-btn"
        data-doctor-id="${doctor.id}"
      >
        Select Doctor
      </button>
    </article>
  `).join("");

  doctorList.querySelectorAll(".select-doctor-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const doctor = doctors.find(
        (item) => item.id === Number(button.dataset.doctorId)
      );

      if (!doctor) return;

      selectedDoctor = doctor;

      if (doctorInput) {
        const matchingOption = Array.from(doctorInput.options).find(
          (option) =>
            option.value === doctor.name ||
            option.textContent.trim() === doctor.name
        );

        if (matchingOption) {
          doctorInput.value = matchingOption.value;
        }
      }

      updateSelectionSummary();
      renderDoctors();
    });

    if (selectedDoctor &&
        Number(button.dataset.doctorId) === selectedDoctor.id) {
      button.textContent = "Selected ✓";
    }
  });
}

/* 10. SELECTED APPOINTMENT SUMMARY */
function updateSelectionSummary() {
  if (!selectionSummary) return;

  const doctorName = selectedDoctor
    ? selectedDoctor.name
    : (doctorInput?.value || "Not selected");

  const specialty = selectedDoctor
    ? selectedDoctor.specialty
    : (specialtyInput?.value || "Not selected");

  const date = formatDate(dateInput?.value);
  const time = formatTime(selectedTime || timeInput?.value);

  selectionSummary.innerHTML = `
    <p><strong>Specialty:</strong> ${escapeHTML(specialty)}</p>
    <p><strong>Doctor:</strong> ${escapeHTML(doctorName)}</p>
    <p><strong>Date:</strong> ${escapeHTML(date)}</p>
    <p><strong>Time:</strong> ${escapeHTML(time)}</p>
  `;

  if (chosenSlot) {
    chosenSlot.textContent =
      `${doctorName} | ${date} | ${time}`;
  }
}

function updateFinalSummary() {
  if (!finalSummary) return;

  const doctorName = selectedDoctor
    ? selectedDoctor.name
    : (doctorInput?.value || "Not selected");

  const specialty = selectedDoctor
    ? selectedDoctor.specialty
    : (specialtyInput?.value || "Not selected");

  finalSummary.innerHTML = `
    <p><strong>Patient:</strong> ${escapeHTML(patientNameInput?.value)}</p>
    <p><strong>Email:</strong> ${escapeHTML(patientEmailInput?.value)}</p>
    <p><strong>Phone:</strong> ${escapeHTML(patientPhoneInput?.value)}</p>
    <p><strong>Specialty:</strong> ${escapeHTML(specialty)}</p>
    <p><strong>Doctor:</strong> ${escapeHTML(doctorName)}</p>
    <p><strong>Appointment date:</strong> ${escapeHTML(formatDate(dateInput?.value))}</p>
    <p><strong>Appointment time:</strong> ${escapeHTML(formatTime(selectedTime || timeInput?.value))}</p>
    <p><strong>Consultation fee:</strong> ₹${selectedDoctor ? selectedDoctor.fee : "To be confirmed"}</p>
  `;
}

/* 11. APPOINTMENT FORMATTING */
function buildBooking(patientName, patientEmail, patientPhone) {
  const doctorName = selectedDoctor
    ? selectedDoctor.name
    : (doctorInput?.value || "");

  const specialty = selectedDoctor
    ? selectedDoctor.specialty
    : (specialtyInput?.value || "");

  return {
    booking_id: generateBookingReference(),
    patient_name: patientName,
    patient_email: patientEmail,
    patient_phone: patientPhone,
    to_email: patientEmail,
    doctor_name: doctorName,
    specialty: specialty,
    appointment_date: formatDate(dateInput?.value),
    appointment_time: formatTime(selectedTime || timeInput?.value),
    consultation_fee: selectedDoctor ? selectedDoctor.fee : "",
    created_at: new Date().toISOString()
  };
}

/* 12. DEMO BOOKING STORAGE
   localStorage only works in the current browser/device.
   It is not a shared, secure booking database.
*/
function saveDemoBooking(booking) {
  try {
    const storageKey = "medislot_ai_demo_bookings";
    const existingBookings = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    const duplicate = existingBookings.some((existing) =>
      existing.doctor_name === booking.doctor_name &&
      existing.appointment_date === booking.appointment_date &&
      existing.appointment_time === booking.appointment_time
    );

    if (duplicate) {
      return {
        saved: false,
        duplicate: true
      };
    }

    existingBookings.push(booking);
    localStorage.setItem(storageKey, JSON.stringify(existingBookings));

    return {
      saved: true,
      duplicate: false
    };
  } catch (error) {
    console.error("Could not save demo booking:", error);

    return {
      saved: false,
      duplicate: false
    };
  }
}

/* 13. SEND CONFIRMATION EMAIL */
async function sendConfirmationEmail(booking) {
  if (!emailJsReady || !window.emailjs) {
    throw new Error(
      "Email service is not ready. Check the EmailJS script and configuration."
    );
  }

  /*
    These variable names must match the EmailJS template.

    Required template variables:
    {{to_email}}
    {{patient_name}}
    {{doctor_name}}
    {{specialty}}
    {{appointment_date}}
    {{appointment_time}}
    {{booking_id}}

    Optional:
    {{patient_phone}}
    {{consultation_fee}}
  */

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

/* 14. RECEIPT */
function showReceipt(booking) {
  if (bookingReference) {
    bookingReference.textContent = booking.booking_id;
  }

  if (receiptDetails) {
    receiptDetails.innerHTML = `
      <p><strong>Booking reference:</strong> ${escapeHTML(booking.booking_id)}</p>
      <p><strong>Patient:</strong> ${escapeHTML(booking.patient_name)}</p>
      <p><strong>Email:</strong> ${escapeHTML(booking.patient_email)}</p>
      <p><strong>Phone:</strong> ${escapeHTML(booking.patient_phone)}</p>
      <p><strong>Doctor:</strong> ${escapeHTML(booking.doctor_name)}</p>
      <p><strong>Specialty:</strong> ${escapeHTML(booking.specialty)}</p>
      <p><strong>Date:</strong> ${escapeHTML(booking.appointment_date)}</p>
      <p><strong>Time:</strong> ${escapeHTML(booking.appointment_time)}</p>
      <p><strong>Consultation fee:</strong> ${
        booking.consultation_fee
          ? `₹${escapeHTML(booking.consultation_fee)}`
          : "To be confirmed"
      }</p>
    `;
  }

  if (form) form.hidden = true;
  if (step1) step1.hidden = true;
  if (step2) step2.hidden = true;
  if (step3) step3.hidden = true;
  if (receipt) receipt.hidden = false;

  scrollToElement(receipt);
}

/* 15. FINAL BOOKING SUBMISSION */
async function handleBookingSubmission(event) {
  event.preventDefault();

  if (isSubmitting) return;

  if (!validateStep(step3)) return;

  const patientName = patientNameInput?.value.trim() || "";
  const patientEmail = patientEmailInput?.value.trim() || "";
  const patientPhone = patientPhoneInput?.value.trim() || "";

  if (!patientName || !patientEmail || !patientPhone) {
    alert("Please enter your name, email address, and phone number.");
    return;
  }

  if (!selectedDoctor) {
    const enteredDoctor = doctorInput?.value.trim();

    if (enteredDoctor) {
      selectedDoctor = doctors.find(
        (doctor) => doctor.name === enteredDoctor
      ) || null;
    }
  }

  if (!selectedDoctor) {
    alert("Please select a doctor from the doctor list.");
    showStep(2);
    return;
  }

  if (!dateInput?.value || !(selectedTime || timeInput?.value)) {
    alert("Please select an appointment date and time.");
    showStep(2);
    return;
  }

  selectedTime = selectedTime || timeInput.value;

  const booking = buildBooking(
    patientName,
    patientEmail,
    patientPhone
  );

  isSubmitting = true;

  if (submitBooking) {
    submitBooking.disabled = true;
    submitBooking.textContent = "Processing booking...";
  }

  setStatus(emailStatus, "Processing your appointment...", "info");

  try {
    /*
      This duplicate check is only local to this browser.
      For real shared slot locking, connect a backend/database.
    */
    const saveResult = saveDemoBooking(booking);

    if (saveResult.duplicate) {
      setStatus(
        emailStatus,
        "This doctor and time appear in this browser's demo bookings. Please choose another slot.",
        "error"
      );

      alert(
        "This slot is already in the local demo booking list. Please select another time."
      );

      showStep(2);
      return;
    }

    showReceipt(booking);

    setStatus(
      receiptEmailStatus,
      "Booking recorded in this browser. Sending confirmation email...",
      "info"
    );

    try {
      await sendConfirmationEmail(booking);

      setStatus(
        receiptEmailStatus,
        `Confirmation email sent successfully to ${booking.patient_email}. Please check your inbox and spam folder.`,
        "success"
      );

      setStatus(
        emailStatus,
        "Confirmation email sent successfully.",
        "success"
      );
    } catch (emailError) {
      console.error("EmailJS send error:", emailError);

      setStatus(
        receiptEmailStatus,
        "The demo booking was recorded, but the confirmation email could not be sent. Check your EmailJS template, service, and dashboard logs.",
        "error"
      );

      setStatus(
        emailStatus,
        "Booking recorded, but email delivery failed. Please check your EmailJS settings.",
        "error"
      );
    }
  } catch (error) {
    console.error("Booking error:", error);

    setStatus(
      emailStatus,
      "Something went wrong while processing the booking. Please try again.",
      "error"
    );

    alert("Something went wrong. Please check your entries and try again.");
  } finally {
    isSubmitting = false;

    if (submitBooking) {
      submitBooking.disabled = false;
      submitBooking.textContent = "Confirm Booking";
    }
  }
}

/* 16. RESET FOR A NEW BOOKING */
function resetBooking() {
  if (form) {
    form.reset();
    form.hidden = false;
  }

  if (receipt) receipt.hidden = true;

  selectedDoctor = null;
  selectedTime = "";
  isSubmitting = false;

  if (submitBooking) {
    submitBooking.disabled = false;
    submitBooking.textContent = "Confirm Booking";
  }

  initializeDateField();
  initializeTimeOptions();
  renderDoctors();
  updateSelectionSummary();

  setStatus(emailStatus, "", "info");
  setStatus(receiptEmailStatus, "", "info");

  showStep(1);
}

/* 17. EVENT LISTENERS */
function attachEventListeners() {
  if (toStep2) {
    toStep2.addEventListener("click", () => {
      if (!validateStep(step1)) return;

      renderDoctors();
      updateSelectionSummary();
      showStep(2);
    });
  }

  if (backToStep1) {
    backToStep1.addEventListener("click", () => showStep(1));
  }

  if (toStep3) {
    toStep3.addEventListener("click", () => {
      if (!selectedDoctor) {
        alert("Please select a doctor first.");
        return;
      }

      if (!dateInput?.value) {
        alert("Please select an appointment date.");
        dateInput?.focus();
        return;
      }

      if (!timeInput?.value) {
        alert("Please select an appointment time.");
        timeInput?.focus();
        return;
      }

      selectedTime = timeInput.value;

      updateSelectionSummary();

      if (!validateStep(step2)) return;

      updateFinalSummary();
      showStep(3);
    });
  }

  if (backToStep2) {
    backToStep2.addEventListener("click", () => showStep(2));
  }

  if (form) {
    form.addEventListener("submit", handleBookingSubmission);
  }

  if (specialtyInput) {
    specialtyInput.addEventListener("change", () => {
      selectedDoctor = null;
      if (doctorInput) doctorInput.value = "";
      renderDoctors();
      updateSelectionSummary();
    });
  }

  if (ratingInput) {
    ratingInput.addEventListener("change", renderDoctors);
  }

  if (doctorSearch) {
    doctorSearch.addEventListener("input", renderDoctors);
  }

  if (doctorInput) {
    doctorInput.addEventListener("change", () => {
      const matchingDoctor = doctors.find(
        (doctor) => doctor.name === doctorInput.value
      );

      selectedDoctor = matchingDoctor || null;

      renderDoctors();
      updateSelectionSummary();
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      selectedTime = "";
      if (timeInput) timeInput.value = "";
      updateSelectionSummary();
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      selectedTime = timeInput.value;
      updateSelectionSummary();
    });
  }

  [
    patientNameInput,
    patientEmailInput,
    patientPhoneInput
  ].forEach((field) => {
    if (field) {
      field.addEventListener("input", updateFinalSummary);
    }
  });

  if (printReceipt) {
    printReceipt.addEventListener("click", () => window.print());
  }

  if (newBooking) {
    newBooking.addEventListener("click", resetBooking);
  }
}

/* 18. START APPLICATION */
function initializeMediSlot() {
  initializeEmailJS();
  initializeDateField();
  initializeTimeOptions();
  attachEventListeners();
  renderDoctors();
  updateSelectionSummary();
  showStep(1);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMediSlot);
} else {
  initializeMediSlot();
}
