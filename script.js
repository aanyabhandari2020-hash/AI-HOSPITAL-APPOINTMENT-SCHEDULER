/* =========================================================
   MEDISLOT AI — APPOINTMENT BOOKING & EMAIL CONFIRMATIONS
   Complete replacement file: script.js
   ========================================================= */

/* 1. EMAILJS CONFIGURATION */
const EMAILJS_PUBLIC_KEY = "XqKQRka3CioBYl-qZ";
const EMAILJS_SERVICE_ID = "service_qlo3wqh";
const EMAILJS_TEMPLATE_ID = "template_ujfmo3r";

/* 2. SAMPLE DOCTOR DIRECTORY — demonstration data, not verified providers */
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
let doctorList = $("doctorList");
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
let selectedDoctor = null;
let selectedTime = "";
let emailJsReady = false;
let isSubmitting = false;

/* 5. HELPERS */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatDate(dateString) {
  if (!dateString) return "Not selected";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTime(timeString) {
  if (!timeString) return "Not selected";

  const [hourText, minuteText = "00"] = timeString.split(":");
  const hours = Number(hourText);

  if (!Number.isFinite(hours)) return timeString;

  return `${hours % 12 || 12}:${minuteText} ${hours >= 12 ? "PM" : "AM"}`;
}

function generateBookingReference() {
  return `MSAI-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function setStatus(element, message, type = "info") {
  if (!element) return;

  element.textContent = message;
  element.setAttribute("role", "status");
  element.dataset.status = type;
}

function scrollToElement(element) {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

/* 6. POPULATE THE DOCTOR DROPDOWN */
function populatePreferredDoctorDropdown() {
  if (!doctorInput) {
    console.warn(
      'MediSlot AI: no element with id="preferredDoctor" was found in index.html.'
    );
    return;
  }

  const previousValue = doctorInput.value;
  doctorInput.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a doctor";
  doctorInput.appendChild(placeholder);

  doctors.forEach((doctor) => {
    const option = document.createElement("option");

    option.value = doctor.name;
    option.textContent =
      `${doctor.name} — ${doctor.specialty} — ${doctor.rating.toFixed(1)}/5`;

    doctorInput.appendChild(option);
  });

  /*
   * The doctor can be selected using the cards or dropdown.
   * Do not let an initially empty dropdown block the form.
   */
  doctorInput.required = false;

  if (previousValue && doctors.some(
    (doctor) => doctor.name === previousValue
  )) {
    doctorInput.value = previousValue;
  }
}

/* 7. CREATE DOCTOR CARD CONTAINER IF MISSING */
function ensureDoctorListContainer() {
  if (doctorList) return doctorList;

  if (!doctorInput || !doctorInput.parentElement) {
    console.warn(
      'MediSlot AI: cannot create doctor list because #preferredDoctor is missing.'
    );
    return null;
  }

  doctorList = document.createElement("div");
  doctorList.id = "doctorList";
  doctorList.className = "doctor-list";

  doctorInput.parentElement.insertAdjacentElement(
    "afterend",
    doctorList
  );

  return doctorList;
}

/* 8. EMAILJS INITIALIZATION */
function initializeEmailJS() {
  if (!window.emailjs) {
    emailJsReady = false;

    console.warn(
      "EmailJS library did not load. Check the EmailJS script tag in index.html."
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

/* 9. STEP NAVIGATION AND VALIDATION */
function showStep(stepNumber) {
  if (step1) step1.hidden = stepNumber !== 1;
  if (step2) step2.hidden = stepNumber !== 2;
  if (step3) step3.hidden = stepNumber !== 3;

  if (receipt) receipt.hidden = true;
  if (form) form.hidden = false;

  const target =
    stepNumber === 1 ? step1 :
    stepNumber === 2 ? step2 :
    step3;

  scrollToElement(target);
}

function validateStep(container) {
  if (!container) return true;

  const fields = container.querySelectorAll(
    "input, select, textarea"
  );

  for (const field of fields) {
    if (
      field.disabled ||
      field.type === "button" ||
      field.type === "submit"
    ) {
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

/* 10. DATE AND TIME OPTIONS */
function initializeDateField() {
  if (!dateInput) return;

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

/* 11. DOCTOR FILTERS */
function getRatingMinimum() {
  const value = String(
    ratingInput?.value || ""
  ).toLowerCase();

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
  const value = String(
    ratingInput?.value || ""
  ).toLowerCase();

  if (!value) return true;

  if (value.includes("below")) {
    return doctor.rating < 3;
  }

  if (value.includes("highly")) {
    return doctor.rating >= 4.5;
  }

  return doctor.rating >= getRatingMinimum();
}

function getFilteredDoctors() {
  const specialty = String(
    specialtyInput?.value || ""
  ).trim().toLowerCase();

  const searchText = String(
    doctorSearch?.value || ""
  ).trim().toLowerCase();

  return doctors.filter((doctor) => {
    const specialtyMatches =
      !specialty ||
      specialty === "all" ||
      doctor.specialty.toLowerCase() === specialty;

    const searchMatches =
      !searchText ||
      doctor.name.toLowerCase().includes(searchText) ||
      doctor.specialty.toLowerCase().includes(searchText);

    return (
      specialtyMatches &&
      searchMatches &&
      matchesRating(doctor)
    );
  });
}

/* 12. SELECT A DOCTOR */
function selectDoctorById(id) {
  selectedDoctor =
    doctors.find((doctor) => doctor.id === Number(id)) || null;

  if (!selectedDoctor) return;

  if (doctorInput) {
    doctorInput.value = selectedDoctor.name;
    doctorInput.required = false;
  }

  updateSelectionSummary();
  updateFinalSummary();
  renderDoctors();
}

/* 13. DISPLAY DOCTOR CARDS */
function renderDoctors() {
  const container = ensureDoctorListContainer();

  if (!container) return;

  const filteredDoctors = getFilteredDoctors();

  if (filteredDoctors.length === 0) {
    container.innerHTML =
      '<p class="no-doctors">No doctors match these filters. Try another specialty or rating.</p>';

    return;
  }

  container.innerHTML = filteredDoctors.map((doctor) => `
    <article class="doctor-card"
      style="border:1px solid #ddd;border-radius:12px;padding:14px;margin:10px 0;">

      <h3>${escapeHTML(doctor.name)}</h3>

      <p>${escapeHTML(doctor.specialty)}</p>

      <p>
        ⭐ ${doctor.rating.toFixed(1)} / 5
        (${doctor.reviews} reviews)
      </p>

      <p>
        Experience: ${escapeHTML(doctor.experience)}
      </p>

      <p>
        Consultation fee: ₹${doctor.fee}
      </p>

      <button
        type="button"
        class="select-doctor-btn"
        data-doctor-id="${doctor.id}">
        ${
          selectedDoctor?.id === doctor.id
            ? "Selected ✓"
            : "Select Doctor"
        }
      </button>

    </article>
  `).join("");

  container.querySelectorAll(".select-doctor-btn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectDoctorById(button.dataset.doctorId);
      });
    });
}

/* 14. UPDATE SELECTION SUMMARY */
function updateSelectionSummary() {
  const doctorName =
    selectedDoctor?.name ||
    doctorInput?.value ||
    "Not selected";

  const specialty =
    selectedDoctor?.specialty ||
    specialtyInput?.value ||
    "Not selected";

  const date = formatDate(dateInput?.value);

  const time = formatTime(
    selectedTime || timeInput?.value
  );

  if (selectionSummary) {
    selectionSummary.innerHTML = `
      <p>
        <strong>Specialty:</strong>
        ${escapeHTML(specialty)}
      </p>

      <p>
        <strong>Doctor:</strong>
        ${escapeHTML(doctorName)}
      </p>

      <p>
        <strong>Date:</strong>
        ${escapeHTML(date)}
      </p>

      <p>
        <strong>Time:</strong>
        ${escapeHTML(time)}
      </p>
    `;
  }

  if (chosenSlot) {
    chosenSlot.textContent =
      `${doctorName} | ${date} | ${time}`;
  }
}

/* 15. UPDATE FINAL SUMMARY */
function updateFinalSummary() {
  if (!finalSummary) return;

  const doctorName =
    selectedDoctor?.name ||
    doctorInput?.value ||
    "Not selected";

  const specialty =
    selectedDoctor?.specialty ||
    specialtyInput?.value ||
    "Not selected";

  finalSummary.innerHTML = `
    <p>
      <strong>Patient:</strong>
      ${escapeHTML(patientNameInput?.value)}
    </p>

    <p>
      <strong>Email:</strong>
      ${escapeHTML(patientEmailInput?.value)}
    </p>

    <p>
      <strong>Phone:</strong>
      ${escapeHTML(patientPhoneInput?.value)}
    </p>

    <p>
      <strong>Specialty:</strong>
      ${escapeHTML(specialty)}
    </p>

    <p>
      <strong>Doctor:</strong>
      ${escapeHTML(doctorName)}
    </p>

    <p>
      <strong>Appointment date:</strong>
      ${escapeHTML(formatDate(dateInput?.value))}
    </p>

    <p>
      <strong>Appointment time:</strong>
      ${escapeHTML(formatTime(selectedTime || timeInput?.value))}
    </p>

    <p>
      <strong>Consultation fee:</strong>
      ₹${selectedDoctor ? selectedDoctor.fee : "To be confirmed"}
    </p>
  `;
}

/* 16. CREATE BOOKING DETAILS */
function buildBooking(patientName, patientEmail, patientPhone) {
  return {
    booking_id: generateBookingReference(),
    patient_name: patientName,
    patient_email: patientEmail,
    patient_phone: patientPhone,
    to_email: patientEmail,

    doctor_name:
      selectedDoctor?.name ||
      doctorInput?.value ||
      "",

    specialty:
      selectedDoctor?.specialty ||
      specialtyInput?.value ||
      "",

    appointment_date: formatDate(dateInput?.value),

    appointment_time: formatTime(
      selectedTime || timeInput?.value
    ),

    consultation_fee: selectedDoctor?.fee || "",

    created_at: new Date().toISOString()
  };
}

/* 17. SAVE DEMO BOOKING IN THIS BROWSER */
function saveDemoBooking(booking) {
  try {
    const storageKey = "medislot_ai_demo_bookings";

    const existing = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    const duplicate = existing.some((item) =>
      item.doctor_name === booking.doctor_name &&
      item.appointment_date === booking.appointment_date &&
      item.appointment_time === booking.appointment_time
    );

    if (duplicate) {
      return {
        saved: false,
        duplicate: true
      };
    }

    existing.push(booking);

    localStorage.setItem(
      storageKey,
      JSON.stringify(existing)
    );

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

/* 18. SEND EMAIL CONFIRMATION */
async function sendConfirmationEmail(booking) {
  if (!emailJsReady || !window.emailjs) {
    throw new Error(
      "EmailJS is not ready. Check the EmailJS script tag in index.html."
    );
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

/* 19. DISPLAY BOOKING RECEIPT */
function showReceipt(booking) {
  if (bookingReference) {
    bookingReference.textContent = booking.booking_id;
  }

  if (receiptDetails) {
    receiptDetails.innerHTML = `
      <p>
        <strong>Booking reference:</strong>
        ${escapeHTML(booking.booking_id)}
      </p>

      <p>
        <strong>Patient:</strong>
        ${escapeHTML(booking.patient_name)}
      </p>

      <p>
        <strong>Email:</strong>
        ${escapeHTML(booking.patient_email)}
      </p>

      <p>
        <strong>Phone:</strong>
        ${escapeHTML(booking.patient_phone)}
      </p>

      <p>
        <strong>Doctor:</strong>
        ${escapeHTML(booking.doctor_name)}
      </p>

      <p>
        <strong>Specialty:</strong>
        ${escapeHTML(booking.specialty)}
      </p>

      <p>
        <strong>Date:</strong>
        ${escapeHTML(booking.appointment_date)}
      </p>

      <p>
        <strong>Time:</strong>
        ${escapeHTML(booking.appointment_time)}
      </p>

      <p>
        <strong>Consultation fee:</strong>
        ${
          booking.consultation_fee
            ? `₹${escapeHTML(booking.consultation_fee)}`
            : "To be confirmed"
        }
      </p>
    `;
  }

  if (form) form.hidden = true;
  if (step1) step1.hidden = true;
  if (step2) step2.hidden = true;
  if (step3) step3.hidden = true;

  if (receipt) receipt.hidden = false;

  scrollToElement(receipt);
}

/* 20. SUBMIT BOOKING */
async function handleBookingSubmission(event) {
  event.preventDefault();

  if (isSubmitting) return;

  if (!validateStep(step3)) return;

  const patientName =
    patientNameInput?.value.trim() || "";

  const patientEmail =
    patientEmailInput?.value.trim() || "";

  const patientPhone =
    patientPhoneInput?.value.trim() || "";

  if (!patientName || !patientEmail || !patientPhone) {
    alert(
      "Please enter your name, email address, and phone number."
    );

    return;
  }

  if (!selectedDoctor && doctorInput?.value) {
    selectedDoctor =
      doctors.find(
        (doctor) => doctor.name === doctorInput.value
      ) || null;
  }

  if (!selectedDoctor) {
    alert(
      "Please choose a doctor from the dropdown or click Select Doctor on a doctor card."
    );

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

  setStatus(
    emailStatus,
    "Processing your appointment...",
    "info"
  );

  try {
    const saveResult = saveDemoBooking(booking);

    if (saveResult.duplicate) {
      setStatus(
        emailStatus,
        "This doctor and time appear in this browser's demo bookings. Choose another slot.",
        "error"
      );

      alert(
        "This slot is already in this browser's demo booking list. Please select another time."
      );

      showStep(2);

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

      setStatus(
        emailStatus,
        "Confirmation email sent successfully.",
        "success"
      );
    } catch (error) {
      console.error("EmailJS send error:", error);

      setStatus(
        receiptEmailStatus,
        "The demo booking was recorded, but the email could not be sent. Check the EmailJS template and dashboard logs.",
        "error"
      );

      setStatus(
        emailStatus,
        "Booking recorded, but email delivery failed. Check EmailJS settings.",
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

    alert(
      "Something went wrong. Please check your entries and try again."
    );
  } finally {
    isSubmitting = false;

    if (submitBooking) {
      submitBooking.disabled = false;
      submitBooking.textContent = "Confirm Booking";
    }
  }
}

/* 21. RESET FOR A NEW BOOKING */
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

  populatePreferredDoctorDropdown();
  initializeDateField();
  initializeTimeOptions();
  renderDoctors();
  updateSelectionSummary();
  updateFinalSummary();

  setStatus(emailStatus, "", "info");
  setStatus(receiptEmailStatus, "", "info");

  showStep(1);
}

/* 22. EVENT LISTENERS */
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
    backToStep1.addEventListener("click", () => {
      showStep(1);
    });
  }

  if (toStep3) {
    toStep3.addEventListener("click", () => {
      if (!selectedDoctor && doctorInput?.value) {
        selectedDoctor =
          doctors.find(
            (doctor) => doctor.name === doctorInput.value
          ) || null;
      }

      if (!selectedDoctor) {
        alert(
          "Please select a doctor from the dropdown or click Select Doctor on a doctor card."
        );

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
    backToStep2.addEventListener("click", () => {
      showStep(2);
    });
  }

  if (form) {
    form.addEventListener(
      "submit",
      handleBookingSubmission
    );
  }

  if (specialtyInput) {
    specialtyInput.addEventListener("change", () => {
      if (
        selectedDoctor &&
        specialtyInput.value &&
        specialtyInput.value.toLowerCase() !== "all" &&
        selectedDoctor.specialty.toLowerCase() !==
          specialtyInput.value.toLowerCase()
      ) {
        selectedDoctor = null;

        if (doctorInput) {
          doctorInput.value = "";
        }
      }

      renderDoctors();
      updateSelectionSummary();
      updateFinalSummary();
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
      selectedDoctor =
        doctors.find(
          (doctor) => doctor.name === doctorInput.value
        ) || null;

      updateSelectionSummary();
      updateFinalSummary();
      renderDoctors();
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      selectedTime = "";

      if (timeInput) {
        timeInput.value = "";
      }

      updateSelectionSummary();
      updateFinalSummary();
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      selectedTime = timeInput.value;

      updateSelectionSummary();
      updateFinalSummary();
    });
  }

  [
    patientNameInput,
    patientEmailInput,
    patientPhoneInput
  ].forEach((field) => {
    if (field) {
      field.addEventListener(
        "input",
        updateFinalSummary
      );
    }
  });

  if (printReceipt) {
    printReceipt.addEventListener("click", () => {
      window.print();
    });
  }

  if (newBooking) {
    newBooking.addEventListener("click", resetBooking);
  }
}

/* 23. START THE APPLICATION */
function initializeMediSlot() {
  populatePreferredDoctorDropdown();
  initializeEmailJS();
  initializeDateField();
  initializeTimeOptions();
  attachEventListeners();
  renderDoctors();
  updateSelectionSummary();
  updateFinalSummary();
  showStep(1);
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeMediSlot
  );
} else {
  initializeMediSlot();
}
