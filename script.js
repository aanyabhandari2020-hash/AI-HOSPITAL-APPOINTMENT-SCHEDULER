```javascript
"use strict";

// Medi Slot: illustrative demo data, not a real medical directory.
const doctors = [
  {
    id: "gp1",
    name: "Dr. Rahul Sharma",
    specialty: "General Physician",
    experience: 8,
    fee: 400,
    rating: 4.7,
    avatar: "👨‍⚕️",
    description: "General health consultations and routine check-ups.",
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    reviews: [
      { stars: 5, text: "Friendly and explained the consultation clearly.", author: "Demo patient" },
      { stars: 4, text: "A helpful example of patient feedback.", author: "Demo patient" }
    ]
  },
  {
    id: "ca1",
    name: "Dr. Priya Mehta",
    specialty: "Cardiologist",
    experience: 10,
    fee: 700,
    rating: 4.9,
    avatar: "👩‍⚕️",
    description: "Heart-health consultations and cardiovascular assessment.",
    slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
    reviews: [
      { stars: 5, text: "Clear explanations and a professional approach.", author: "Demo patient" },
      { stars: 5, text: "A sample review for the website demonstration.", author: "Demo patient" }
    ]
  },
  {
    id: "der1",
    name: "Dr. Neha Kapoor",
    specialty: "Dermatologist",
    experience: 7,
    fee: 500,
    rating: 4.8,
    avatar: "👩‍⚕️",
    description: "Skin and hair consultations.",
    slots: ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00"],
    reviews: [
      { stars: 5, text: "The information was easy to understand.", author: "Demo patient" },
      { stars: 4, text: "Illustrative feedback for the demo profile.", author: "Demo patient" }
    ]
  },
  {
    id: "den1",
    name: "Dr. Arjun Verma",
    specialty: "Dentist",
    experience: 6,
    fee: 350,
    rating: 4.6,
    avatar: "🦷",
    description: "General dental consultations and oral-health advice.",
    slots: ["09:00", "09:30", "10:00", "11:00", "11:30", "12:00"],
    reviews: [
      { stars: 5, text: "A friendly example of a dental review.", author: "Demo patient" },
      { stars: 4, text: "Sample feedback displayed for demonstration.", author: "Demo patient" }
    ]
  },
  {
    id: "ped1",
    name: "Dr. Anjali Singh",
    specialty: "Pediatrician",
    experience: 9,
    fee: 450,
    rating: 4.8,
    avatar: "👩‍⚕️",
    description: "Child-health consultations and routine check-ups.",
    slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
    reviews: [
      { stars: 5, text: "A sample review for the pediatric profile.", author: "Demo patient" },
      { stars: 5, text: "Example feedback for the website interface.", author: "Demo patient" }
    ]
  }
];

const STORAGE = {
  searches: "mediSlotSearchHistoryV1",
  viewed: "mediSlotViewedDoctorsV1"
};

const $ = (id) => document.getElementById(id);

const searchInput = $("doctorSearch");
const specialtyFilter = $("specialtyFilter");
const sortDoctors = $("sortDoctors");
const doctorList = $("doctorList");
const resultsCount = $("resultsCount");

let currentQuery = "";
let searchTimer = null;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function readHistory(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeHistory(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function recordSearch(query, specialty) {
  const label = query.trim() || "All doctors";
  const entry = {
    query: query.trim(),
    specialty: specialty,
    label: specialty ? `${label} · ${specialty}` : label,
    date: new Date().toLocaleString()
  };

  let history = readHistory(STORAGE.searches);

  history = history.filter((item) =>
    item.query !== entry.query || item.specialty !== entry.specialty
  );

  history.unshift(entry);
  writeHistory(STORAGE.searches, history.slice(0, 10));
  renderHistory();
}

function recordViewed(doctorId) {
  let history = readHistory(STORAGE.viewed);

  history = history.filter((item) => item.id !== doctorId);
  history.unshift({ id: doctorId, date: new Date().toLocaleString() });

  writeHistory(STORAGE.viewed, history.slice(0, 10));
  renderHistory();
}

function filteredDoctors() {
  const query = searchInput.value.trim().toLowerCase();
  const specialty = specialtyFilter.value;

  let list = doctors.filter((doctor) => {
    const matchesQuery = [
      doctor.name,
      doctor.specialty,
      doctor.description
    ].join(" ").toLowerCase().includes(query);

    const matchesSpecialty = !specialty || doctor.specialty === specialty;

    return matchesQuery && matchesSpecialty;
  });

  switch (sortDoctors.value) {
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "fee-low":
      list.sort((a, b) => a.fee - b.fee);
      break;
    case "experience":
      list.sort((a, b) => b.experience - a.experience);
      break;
  }

  return list;
}

function renderDoctors() {
  const list = filteredDoctors();

  resultsCount.textContent =
    `${list.length} doctor${list.length === 1 ? "" : "s"} found`;

  if (!list.length) {
    doctorList.innerHTML =
      '<p class="muted">No matching doctors. Try another name or specialization.</p>';
    return;
  }

  doctorList.innerHTML = list.map((doctor) => `
    <article class="doctor-card" id="doctor-${escapeHTML(doctor.id)}">
      <div class="doctor-top">
        <div class="doctor-avatar" aria-hidden="true">${doctor.avatar}</div>
        <div>
          <h3>${escapeHTML(doctor.name)}</h3>
          <p class="doctor-specialty">${escapeHTML(doctor.specialty)}</p>
          <p class="doctor-rating">★ ${doctor.rating.toFixed(1)} / 5
            <span class="muted">(${doctor.reviews.length} demo reviews)</span>
          </p>
        </div>
      </div>

      <p class="doctor-description">${escapeHTML(doctor.description)}</p>

      <div class="doctor-details">
        <span>🩺 Experience: ${doctor.experience} years (demo)</span>
        <span>💳 Consultation fee: ₹${doctor.fee} (demo)</span>
        <span>🕒 Listed times: ${doctor.slots.map(formatTime).join(", ")}</span>
      </div>

      <div class="review-list">
        <strong>Sample patient reviews</strong>
        ${doctor.reviews.map((review) => `
          <p> ${"★".repeat(review.stars)}${"☆".repeat(5 - review.stars)}
            — ${escapeHTML(review.text)}
          </p>
          <p class="review-author">${escapeHTML(review.author)} · Fictional demo feedback</p>
        `).join("")}
      </div>

      <div class="card-actions">
        <button class="secondary-button" type="button"
          data-action="view" data-id="${escapeHTML(doctor.id)}">
          View profile
        </button>
        <button class="primary-button" type="button"
          data-action="book" data-id="${escapeHTML(doctor.id)}">
          Book appointment
        </button>
      </div>
    </article>
  `).join("");
}

function renderHistory() {
  const searches = readHistory(STORAGE.searches);
  const viewed = readHistory(STORAGE.viewed);

  $("searchHistoryList").innerHTML = searches.length
    ? searches.map((item, index) => `
        <li>
          <button type="button" data-search-index="${index}">
            ${escapeHTML(item.label || item.query || "All doctors")}
          </button>
          <div class="muted small-text">${escapeHTML(item.date || "")}</div>
        </li>
      `).join("")
    : '<li class="empty-history">No previous searches yet.</li>';

  $("viewedHistoryList").innerHTML = viewed.length
    ? viewed.map((item) => {
        const doctor = doctors.find((d) => d.id === item.id);
        if (!doctor) return "";

        return `
          <li>
            <button type="button" data-viewed-id="${escapeHTML(doctor.id)}">
              ${escapeHTML(doctor.name)}
            </button>
            <div class="muted small-text">${escapeHTML(doctor.specialty)} · ${escapeHTML(item.date || "")}</div>
          </li>
        `;
      }).join("")
    : '<li class="empty-history">No viewed doctors yet.</li>';
}

function formatTime(time) {
  const [hourText, minute] = time.split(":");
  let hour = Number(hourText);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}

function convertTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function setMinimumDate() {
  const now = new Date();
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  $("date").min = localDate;
}

function showBookingMessage(message) {
  $("result").innerHTML = `
    <div class="ai-box">
      <h3>🤖 Medi Slot Scheduling Recommendation</h3>
      <p>${escapeHTML(message)}</p>
      <p class="muted small-text">
        This is a demo recommendation, not a confirmed appointment.
        Contact the healthcare provider to verify the actual schedule.
      </p>
    </div>
  `;
}

function scheduleAppointment(event) {
  event.preventDefault();

  const patientName = $("patientName").value.trim();
  const age = Number($("age").value);
  const specialization = $("specialization").value;
  const date = $("date").value;
  const preferredTime = $("time").value;

  if (!patientName || !Number.isInteger(age) || age < 1 || age > 120 ||
      !specialization || !date || !preferredTime) {
    showBookingMessage("Please enter valid details in every required field.");
    return;
  }

  // Compare date strings in YYYY-MM-DD format to avoid timezone issues.
  const today = $("date").min;
  if (date < today) {
    showBookingMessage("Please choose today or a future date.");
    return;
  }

  const doctor = doctors.find((item) => item.specialty === specialization);

  if (!doctor) {
    showBookingMessage("No doctor is listed for this specialization.");
    return;
  }

  let recommendedSlot = doctor.slots[0];
  let smallestDifference = Infinity;

  doctor.slots.forEach((slot) => {
    const difference = Math.abs(
      convertTime(slot) - convertTime(preferredTime)
    );

    if (difference < smallestDifference) {
      smallestDifference = difference;
      recommendedSlot = slot;
    }
  });

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  $("result").innerHTML = `
    <div class="ai-box">
      <h3>🤖 AI Scheduling Recommendation</h3>
      <p>Hello <strong>${escapeHTML(patientName)}</strong>!</p>
      <p>Based on your preferred time of
        <strong>${formatTime(preferredTime)}</strong>,
        the closest listed time is <strong>${formatTime(recommendedSlot)}</strong>.
      </p>
      <hr>
      <p><strong>Doctor:</strong> ${escapeHTML(doctor.name)}</p>
      <p><strong>Specialization:</strong> ${escapeHTML(specialization)}</p>
      <p><strong>Date:</strong> ${escapeHTML(formattedDate)}</p>
      <p><strong>Suggested time:</strong> ${formatTime(recommendedSlot)}</p>
      <p class="status-message">
        ℹ️ Suggested time only — availability and booking have not been confirmed.
      </p>
    </div>
  `;

  recordSearch(specialization, specialization);
}

function openDoctorProfile(doctorId) {
  const doctor = doctors.find((item) => item.id === doctorId);
  if (!doctor) return;

  recordViewed(doctor.id);

  const card = $(`doctor-${doctor.id}`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.setAttribute("tabindex", "-1");
    card.focus({ preventScroll: true });
  }
}

function chooseDoctorForBooking(doctorId) {
  const doctor = doctors.find((item) => item.id === doctorId);
  if (!doctor) return;

  recordViewed(doctor.id);
  $("specialization").value = doctor.specialty;
  $("booking").scrollIntoView({ behavior: "smooth" });
  $("patientName").focus({ preventScroll: true });
}

function applySearchHistory(index) {
  const entry = readHistory(STORAGE.searches)[index];
  if (!entry) return;

  searchInput.value = entry.query || "";
  specialtyFilter.value = entry.specialty || "";
  currentQuery = searchInput.value;

  renderDoctors();
  $("search").scrollIntoView({ behavior: "smooth" });
}

searchInput.addEventListener("input", () => {
  renderDoctors();

  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const query = searchInput.value.trim();
    const specialty = specialtyFilter.value;

    if (query || specialty) {
      const signature = `${query}|${specialty}`;
      if (signature !== currentQuery) {
        currentQuery = signature;
        recordSearch(query, specialty);
      }
    }
  }, 600);
});

specialtyFilter.addEventListener("change", () => {
  renderDoctors();
  currentQuery = `${searchInput.value.trim()}|${specialtyFilter.value}`;
  recordSearch(searchInput.value, specialtyFilter.value);
});

sortDoctors.addEventListener("change", renderDoctors);

$("clearSearch").addEventListener("click", () => {
  searchInput.value = "";
  specialtyFilter.value = "";
  sortDoctors.value = "recommended";
  currentQuery = "";
  renderDoctors();
  searchInput.focus();
});

doctorList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "view") {
    openDoctorProfile(button.dataset.id);
  }

  if (button.dataset.action === "book") {
    chooseDoctorForBooking(button.dataset.id);
  }
});

$("searchHistoryList").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-search-index]");
  if (button) applySearchHistory(Number(button.dataset.searchIndex));
});

$("viewedHistoryList").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-viewed-id]");
  if (!button) return;

  const doctor = doctors.find((item) => item.id === button.dataset.viewedId);
  if (!doctor) return;

  searchInput.value = doctor.name;
  specialtyFilter.value = "";
  renderDoctors();
  openDoctorProfile(doctor.id);
});

$("clearSearchHistory").addEventListener("click", () => {
  writeHistory(STORAGE.searches, []);
  renderHistory();
});

$("clearViewedHistory").addEventListener("click", () => {
  writeHistory(STORAGE.viewed, []);
  renderHistory();
});

$("bookingForm").addEventListener("submit", scheduleAppointment);

// Initial page setup
setMinimumDate();
renderDoctors();
renderHistory();
```
