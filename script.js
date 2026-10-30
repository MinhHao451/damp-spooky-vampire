const $ = (id) => document.getElementById(id);

// =========================
// ĐỒNG HỒ BẤM GIỜ
// =========================

let seconds = 0;
let timer = null;
let startTimestamp = null;

function getElapsed() {
  if (startTimestamp === null) return seconds;

  return seconds + Math.floor((Date.now() - startTimestamp) / 1000);
}

function formatTime(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function updateClock() {
  $("clock").textContent = formatTime(getElapsed());
}

function startTimer() {
  if (startTimestamp !== null) return;

  startTimestamp = Date.now();
  timer = setInterval(updateClock, 250);
  updateClock();
}

function stopTimer() {
  if (startTimestamp === null) return;

  seconds = getElapsed();
  startTimestamp = null;

  clearInterval(timer);
  timer = null;

  updateClock();
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  updateClock();
}

// =========================
// LƯU GIỜ
// =========================

function saveTime() {
  const list = JSON.parse(localStorage.getItem("savedTimes") || "[]");

  list.unshift({
    id: Date.now(),
    time: formatTime(getElapsed()),
    date: new Date().toLocaleString("vi-VN"),
  });

  localStorage.setItem("savedTimes", JSON.stringify(list));

  renderTimes();
  alert("Đã lưu thời gian!");
}

function renderTimes() {
  const list = JSON.parse(localStorage.getItem("savedTimes") || "[]");

  $("timeList").innerHTML = list.length
    ? list
        .map(
          (item, index) => `
            <div class="item">
                <button class="red" onclick="deleteTime(${index})">
                    Xóa
                </button>
                <b>${item.time}</b>
                <div class="date">${escapeHTML(item.date)}</div>
            </div>
        `,
        )
        .join("")
    : "<p>Chưa có giờ nào được lưu.</p>";
}

function deleteTime(index) {
  const list = JSON.parse(localStorage.getItem("savedTimes") || "[]");

  list.splice(index, 1);

  localStorage.setItem("savedTimes", JSON.stringify(list));
  renderTimes();
}

// =========================
// GHI CHÚ
// =========================

function addNote() {
  const title = $("noteTitle").value.trim() || "Ghi chú";
  const content = $("noteContent").value.trim();

  if (!content) {
    alert("Vui lòng nhập nội dung ghi chú!");
    return;
  }

  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  notes.unshift({
    title,
    content,
    date: new Date().toLocaleString("vi-VN"),
  });

  localStorage.setItem("notes", JSON.stringify(notes));

  $("noteTitle").value = "";
  $("noteContent").value = "";

  renderNotes();
  alert("Đã lưu ghi chú!");
}

function escapeHTML(text) {
  return String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function renderNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  $("noteList").innerHTML = notes.length
    ? notes
        .map(
          (note, index) => `
            <div class="item">
                <button class="red" onclick="deleteNote(${index})">
                    Xóa
                </button>
                <b>${escapeHTML(note.title)}</b>
                <div class="date">${escapeHTML(note.date)}</div>
                <p class="content">${escapeHTML(note.content)}</p>
            </div>
        `,
        )
        .join("")
    : "<p>Chưa có ghi chú nào.</p>";
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  notes.splice(index, 1);

  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
}

// =========================
// THÔNG BÁO NHẮC NHỞ
// =========================

function addReminder() {
  const text = $("reminderText").value.trim();
  const time = $("reminderTime").value;

  if (!text || !time) {
    alert("Vui lòng nhập nội dung và thời gian!");
    return;
  }

  if (new Date(time).getTime() <= Date.now()) {
    alert("Hãy chọn thời gian trong tương lai!");
    return;
  }

  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");

  reminders.push({
    id: Date.now(),
    text,
    time,
    done: false,
  });

  localStorage.setItem("reminders", JSON.stringify(reminders));

  $("reminderText").value = "";
  $("reminderTime").value = "";

  renderReminders();
  alert("Đã tạo nhắc nhở!");
}

function renderReminders() {
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");

  $("reminderList").innerHTML = reminders.length
    ? reminders
        .map(
          (r, index) => `
            <div class="item">
                <button class="red" onclick="deleteReminder(${index})">
                    Xóa
                </button>
                <b>${escapeHTML(r.text)}</b>
                <div class="date">
                    ${escapeHTML(new Date(r.time).toLocaleString("vi-VN"))}
                    ${r.done ? " · Đã thông báo" : ""}
                </div>
            </div>
        `,
        )
        .join("")
    : "<p>Chưa có nhắc nhở nào.</p>";
}

function deleteReminder(index) {
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");

  reminders.splice(index, 1);

  localStorage.setItem("reminders", JSON.stringify(reminders));
  renderReminders();
}

function checkReminders() {
  const reminders = JSON.parse(localStorage.getItem("reminders") || "[]");

  let changed = false;

  reminders.forEach((r) => {
    if (!r.done && new Date(r.time).getTime() <= Date.now()) {
      r.done = true;
      changed = true;

      alert("🔔 NHẮC NHỞ: " + r.text);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Nhắc nhở", {
          body: r.text,
        });
      }
    }
  });

  if (changed) {
    localStorage.setItem("reminders", JSON.stringify(reminders));
    renderReminders();
  }
}

// =========================
// KHỞI TẠO
// =========================

renderTimes();
renderNotes();
renderReminders();

setInterval(checkReminders, 1000);

let countdownInterval = null;
let countdownRemaining = 60;
let countdownEndTime = null;
let countdownRunning = false;

function toggleStopwatchPage() {
  const page = document.getElementById("stopwatchPage");
  page.hidden = !page.hidden;

  if (!page.hidden) {
    resetCountdown();
  }
}

function getCountdownInput() {
  const h = Number(document.getElementById("timerHour").value);
  const m = Number(document.getElementById("timerMinute").value);
  const s = Number(document.getElementById("timerSecond").value);

  if (
    ![h, m, s].every(Number.isInteger) ||
    h < 0 ||
    h > 99 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  ) {
    alert("Vui lòng nhập giờ, phút, giây hợp lệ!");
    return null;
  }

  const total = h * 3600 + m * 60 + s;

  if (total <= 0) {
    alert("Vui lòng đặt thời gian lớn hơn 0!");
    return null;
  }

  return total;
}

function formatCountdown(seconds) {
  seconds = Math.max(0, Math.ceil(seconds));

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function updateCountdownDisplay() {
  document.getElementById("countdownDisplay").textContent =
    formatCountdown(countdownRemaining);
}

function startCountdown() {
  if (countdownRunning) return;

  if (countdownRemaining <= 0) {
    const total = getCountdownInput();
    if (total === null) return;
    countdownRemaining = total;
  }

  countdownRunning = true;
  countdownEndTime = Date.now() + countdownRemaining * 1000;

  document.getElementById("countdownStatus").textContent = "Đang đếm ngược...";

  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdownRemaining = Math.max(0, (countdownEndTime - Date.now()) / 1000);

    updateCountdownDisplay();

    if (countdownRemaining <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      countdownRunning = false;
      countdownEndTime = null;

      document.getElementById("countdownStatus").textContent =
        "⏰ Đã hết thời gian!";

      alert(
        "⏰ Hết giờ!" +
          (document.getElementById("timerName").value.trim()
            ? "\n" + document.getElementById("timerName").value.trim()
            : ""),
      );
    }
  }, 200);
}

function pauseCountdown() {
  if (!countdownRunning) return;

  countdownRemaining = Math.max(0, (countdownEndTime - Date.now()) / 1000);

  clearInterval(countdownInterval);
  countdownInterval = null;
  countdownRunning = false;
  countdownEndTime = null;

  updateCountdownDisplay();

  document.getElementById("countdownStatus").textContent = "Đã tạm dừng";
}

function resetCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  countdownRunning = false;
  countdownEndTime = null;

  const total = getCountdownInputWithoutAlert();

  countdownRemaining = total > 0 ? total : 60;

  updateCountdownDisplay();

  document.getElementById("countdownStatus").textContent = "Sẵn sàng";
}

function getCountdownInputWithoutAlert() {
  const h = Number(document.getElementById("timerHour").value);
  const m = Number(document.getElementById("timerMinute").value);
  const s = Number(document.getElementById("timerSecond").value);

  if (
    ![h, m, s].every(Number.isInteger) ||
    h < 0 ||
    h > 99 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  ) {
    return 0;
  }

  return h * 3600 + m * 60 + s;
}

// Cập nhật thời gian hiển thị khi thay đổi ô nhập
["timerHour", "timerMinute", "timerSecond"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    if (!countdownRunning) {
      resetCountdown();
    }
  });
});

updateCountdownDisplay();
