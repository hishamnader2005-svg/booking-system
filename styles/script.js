// ---- State ----
const state = { service: null, date: null, time: null };

// ---- Elements ----
const $ = (id) => document.getElementById(id);
const serviceBtns = document.querySelectorAll(".service");
const dateInput = $("date");
const slotsEl = $("slots");
const form = $("booking-form");
const errorEl = $("error");
const modal = $("modal");

// ---- Setup ----
$("year").textContent = new Date().getFullYear();
dateInput.min = new Date().toISOString().split("T")[0]; // no past dates

// Placeholder slots (swap with real availability from your backend later)
const ALL_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];
const BOOKED = ["11:00", "15:00"]; // fake taken slots

// ---- Service selection ----
serviceBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    serviceBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.service = {
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      duration: Number(btn.dataset.duration),
    };
    updateSummary();
  });
});

// ---- Date selection ----
dateInput.addEventListener("change", () => {
  state.date = dateInput.value;
  state.time = null;
  renderSlots();
  updateSummary();
});

function renderSlots() {
  slotsEl.innerHTML = "";
  if (!state.date) {
    slotsEl.innerHTML = '<p class="slots-empty">Pick a date to see times.</p>';
    return;
  }
  ALL_SLOTS.forEach((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slot";
    b.textContent = t;
    b.disabled = BOOKED.includes(t);
    b.addEventListener("click", () => {
      document
        .querySelectorAll(".slot")
        .forEach((s) => s.classList.remove("active"));
      b.classList.add("active");
      state.time = t;
      updateSummary();
    });
    slotsEl.appendChild(b);
  });
}

// ---- Summary ----
function updateSummary() {
  $("sum-service").textContent = state.service ? state.service.name : "—";
  $("sum-date").textContent = state.date
    ? new Date(state.date).toLocaleDateString("en-IE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
  $("sum-time").textContent = state.time || "—";
  $("sum-duration").textContent = state.service
    ? state.service.duration + " min"
    : "—";
  $("sum-total").textContent = "€" + (state.service ? state.service.price : 0);
}

// ---- Submit ----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name").value.trim();
  const email = $("email").value.trim();

  if (!state.service) return showError("Pick a service first.");
  if (!state.date || !state.time) return showError("Pick a date and time.");
  if (!name) return showError("Enter your name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return showError("Enter a valid email.");

  showError("");
  const booking = {
    service: state.service.name,
    date: state.date,
    time: state.time,
    name,
    email,
    phone: $("phone").value.trim(),
    notes: $("notes").value.trim(),
  };

  // TODO: send `booking` to your backend, e.g.
  // fetch('/api/bookings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(booking) })
  console.log("Booking:", booking);

  $("modal-text").textContent =
    `${booking.service} on ${booking.date} at ${booking.time}. A confirmation will go to ${booking.email}.`;
  modal.hidden = false;
});

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

$("modal-close").addEventListener("click", () => {
  modal.hidden = true;
  form.reset();
  Object.assign(state, { service: null, date: null, time: null });
  serviceBtns.forEach((b) => b.classList.remove("active"));
  renderSlots();
  updateSummary();
});

// init
renderSlots();
updateSummary();
