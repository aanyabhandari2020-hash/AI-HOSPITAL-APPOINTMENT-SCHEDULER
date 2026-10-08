const doctors = {
    "General Physician": {
        name: "Dr. Rahul Sharma",
        slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
    },

    "Cardiologist": {
        name: "Dr. Priya Mehta",
        slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
    },

    "Dermatologist": {
        name: "Dr. Neha Kapoor",
        slots: ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
    },

    "Dentist": {
        name: "Dr. Arjun Verma",
        slots: ["09:00", "09:30", "10:00", "11:00", "11:30", "12:00"]
    },

    "Pediatrician": {
        name: "Dr. Anjali Singh",
        slots: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
    }
};


function scheduleAppointment() {

    const patientName =
        document.getElementById("patientName").value;

    const age =
        document.getElementById("age").value;

    const specialization =
        document.getElementById("specialization").value;

    const date =
        document.getElementById("date").value;

    const preferredTime =
        document.getElementById("time").value;

    const result =
        document.getElementById("result");


    if (!patientName || !age || !specialization || !date || !preferredTime) {

        result.innerHTML =
            "<strong>Please fill in all the details.</strong>";

        return;
    }


    const doctor = doctors[specialization];

    let recommendedSlot = doctor.slots[0];

    let smallestDifference = Infinity;


    doctor.slots.forEach(function(slot) {

        const difference =
            Math.abs(convertTime(slot) - convertTime(preferredTime));

        if (difference < smallestDifference) {

            smallestDifference = difference;
            recommendedSlot = slot;

        }

    });


    const formattedDate =
        new Date(date + "T00:00:00")
        .toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });


    result.innerHTML = `
        <div class="ai-box">

            <h3>🤖 AI Scheduling Recommendation</h3>

            <p>
                Hello <strong>${patientName}</strong>!
            </p>

            <p>
                Based on your preferred time of
                <strong>${formatTime(preferredTime)}</strong>,
                our scheduling system recommends the closest available slot.
            </p>

            <hr>

            <p><strong>Doctor:</strong> ${doctor.name}</p>

            <p><strong>Specialization:</strong> ${specialization}</p>

            <p><strong>Date:</strong> ${formattedDate}</p>

            <p><strong>Recommended Time:</strong>
                ${formatTime(recommendedSlot)}
            </p>

            <p>
                ✅ <strong>Slot available</strong>
            </p>

        </div>
    `;
}


function convertTime(time) {

    const parts = time.split(":");

    return parseInt(parts[0]) * 60 + parseInt(parts[1]);

}


function formatTime(time) {

    const parts = time.split(":");

    let hour = parseInt(parts[0]);
    const minutes = parts[1];

    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
        hour = 12;
    }

    if (hour > 12) {
        hour -= 12;
    }

    return `${hour}:${minutes} ${period}`;

}
