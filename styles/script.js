// ---- State ----
const state = { cls: null, startDate: null };

const $ = (id) => document.getElementById(id);
const classesEl = $("classes");
const startInput = $("start-date");
const form = $("booking-form");
const errorEl = $("error");
const modal = $("modal");

$("year").textContent = new Date().getFullYear();
startInput.min = new Date().toISOString().split("T")[0];

// ---- Load classes from your database ----
// Expected shape from your API (rename fields to match your DB):
// [{ id, name, level, day, time, duration, price_monthly, spots_left }]
const FALLBACK_CLASSES = [
  {
    id: 1,
    name: "ducklings",
    level: "Ages 3–5",
    day: "Saturday",
    time: "09:00",
    duration: 30,
    price_monthly: 45,
    spots_left: 6,
  },
  {
    id: 2,
    name: "tadpoles",
    level: "Level 1",
    day: "Saturday",
    time: "10:00",
    duration: 45,
    price_monthly: 50,
    spots_left: 4,
  },
  {
    id: 3,
    name: "Improvers",
    level: "Level 2",
    day: "Tuesday",
    time: "17:00",
    duration: 45,
    price_monthly: 50,
    spots_left: 0,
  },
  {
    id: 4,
    name: "Intermediate",
    level: "Level 3",
    day: "Wednesday",
    time: "18:00",
    duration: 45,
    price_monthly: 55,
    spots_left: 5,
  },
  {
    id: 5,
    name: "Advanced",
    level: "Level 4",
    day: "Thursday",
    time: "18:00",
    duration: 60,
    price_monthly: 60,
    spots_left: 3,
  },
  {
    id: 6,
    name: "Adult Lessons",
    level: "All levels",
    day: "Monday",
    time: "19:00",
    duration: 45,
    price_monthly: 55,
    spots_left: 8,
  },
];

async function loadClasses() {
  try {
    const res = await fetch("/api/classes");
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback classes (API not connected yet).");
    return FALLBACK_CLASSES;
  }
}

function renderClasses(list) {
  classesEl.innerHTML = "";
  list.forEach((c) => {
    const full = c.spots_left <= 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "service";
    btn.disabled = full;
    btn.innerHTML = `
      <strong>${c.name}</strong>
      <span>${c.level}</span>
      <span>${c.day}s · ${c.time} · ${c.duration} min</span>
      <span class="price">€${c.price_monthly}<small>/month</small></span>
      <span class="spots ${full ? "full" : ""}">${full ? "Full" : c.spots_left + " spots left"}</span>
    `;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".service")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.cls = c;
      $("schedule-hint").textContent =
        `This class runs every ${c.day} at ${c.time}.`;
      updateSummary();
    });
    classesEl.appendChild(btn);
  });
}

// ---- Start date ----
startInput.addEventListener("change", () => {
  state.startDate = startInput.value;
  updateSummary();
});

// ---- Summary ----
function updateSummary() {
  const c = state.cls;
  $("sum-class").textContent = c ? c.name : "—";
  $("sum-level").textContent = c ? c.level : "—";
  $("sum-schedule").textContent = c ? `${c.day}s ${c.time}` : "—";
  $("sum-start").textContent = state.startDate
    ? new Date(state.startDate).toLocaleDateString("en-IE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
  $("sum-total").textContent = "€" + (c ? c.price_monthly : 0) + " / mo";
}

// ---- Submit ----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const swimmer = $("swimmer").value.trim();
  const dob = $("dob").value;
  const email = $("email").value.trim();
  const phone = $("phone").value.trim();

  if (!state.cls) return showError("Pick a class first.");
  if (!state.startDate) return showError("Pick a start date.");
  if (!swimmer) return showError("Enter the swimmer's name.");
  if (!dob) return showError("Enter date of birth.");
  if (isUnder18(dob) && !$("guardian").value.trim())
    return showError("Parent/guardian name is required for under 18s.");
  if (!phone) return showError("Enter a phone number.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return showError("Enter a valid email.");
  if (!$("terms").checked) return showError("Please accept the billing terms.");

  showError("");
  const membership = {
    class_id: state.cls.id,
    start_date: state.startDate,
    swimmer,
    dob,
    email,
    phone,
    guardian: $("guardian").value.trim(),
    notes: $("notes").value.trim(),
  };

  // TODO: POST to your backend, create the member + a monthly subscription
  // (e.g. Stripe Checkout with mode: 'subscription'), then redirect to the payment page.
  // fetch('/api/memberships', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(membership) })
  console.log("Membership:", membership);

  $("modal-text").textContent =
    `${swimmer} is set for ${state.cls.name} (${state.cls.day}s ${state.cls.time}) from ${state.startDate} at €${state.cls.price_monthly}/month.`;
  modal.hidden = false;
});

function isUnder18(dob) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age < 18;
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

$("modal-close").addEventListener("click", () => {
  modal.hidden = true;
  form.reset();
  state.cls = null;
  state.startDate = null;
  document
    .querySelectorAll(".service")
    .forEach((b) => b.classList.remove("active"));
  $("schedule-hint").textContent = "Select a class to see its weekly schedule.";
  updateSummary();
});

// ---- Init ----
loadClasses().then(renderClasses);
updateSummary();
