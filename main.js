function getColorClass(number) {
  if (number <= 10) return "yellow";
  if (number <= 20) return "blue";
  if (number <= 30) return "red";
  if (number <= 40) return "gray";
  return "green";
}

function generateOneSet() {
  const numbers = [];
  while (numbers.length < 6) {
    const random = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(random)) {
      numbers.push(random);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function generateLottoSets() {
  const numbersDiv = document.getElementById("numbers");
  numbersDiv.innerHTML = "";

  // 5세트 생성
  for (let i = 1; i <= 5; i++) {
    const set = generateOneSet();

    const setBox = document.createElement("div");
    setBox.className = "set-box";

    const setTitle = document.createElement("div");
    setTitle.className = "set-title";
    setTitle.textContent = i + "번 추천 번호";

    const ballRow = document.createElement("div");
    ballRow.className = "ball-row";

    set.forEach((num) => {
      const ball = document.createElement("div");
      ball.className = "ball " + getColorClass(num);
      ball.textContent = num;
      ballRow.appendChild(ball);
    });

    setBox.appendChild(setTitle);
    setBox.appendChild(ballRow);
    numbersDiv.appendChild(setBox);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  html.setAttribute("data-theme", newTheme);
  const themeBtn = document.querySelector(".theme-toggle");
  themeBtn.textContent = newTheme === "dark" ? "☀️ 라이트 모드" : "🌙 다크 모드";
}
