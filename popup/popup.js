function renderCurrentTime() {
  const now = new Date();
  const currentTimeStr = now.toISOString().slice(0, 19).replace("T", " ");
  const elCurrentDate = document.getElementById("current_time");
  elCurrentDate.innerHTML = currentTimeStr;
  setInterval(() => {
    const now = new Date();
    elCurrentDate.innerHTML = now.toISOString().slice(0, 19).replace("T", " ");
  }, 1000);
}

// tính số ngày giờ còn lại đến ngày 00:00:00 của ngày 26/01/2025
function calculateTimeLeft() {
  const now = new Date();
  const target = new Date("2025-01-26T00:00:00");
  const timeLeft = target - now;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function renderTimeLeft() {
  const { days, hours, minutes, seconds } = calculateTimeLeft();
  const elTimeLeft = document.getElementById("time_left");
  elTimeLeft.innerHTML = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  setInterval(() => {
    const { days, hours, minutes, seconds } = calculateTimeLeft();
    elTimeLeft.innerHTML = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  }, 1000);
}

function displayRender() {
  renderCurrentTime();
  renderTimeLeft();
}

document.addEventListener("DOMContentLoaded", function () {
  displayRender();
});
