// --- 공통 기능 (테마, 모드 전환) ---
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    html.setAttribute("data-theme", newTheme);
    const themeBtn = document.querySelector(".theme-toggle");
    themeBtn.textContent = newTheme === "dark" ? "☀️ 라이트 모드" : "🌙 다크 모드";
}

function switchMode(mode) {
    const lottoSection = document.getElementById("lotto-section");
    const animalSection = document.getElementById("animal-section");
    const navBtns = document.querySelectorAll(".nav-btn");

    navBtns.forEach(btn => btn.classList.remove("active"));

    if (mode === 'lotto') {
        lottoSection.style.display = "block";
        animalSection.style.display = "none";
        document.querySelectorAll(".nav-btn")[0].classList.add("active");
        // 웹캠이 켜져있다면 중지 (선택 사항)
        if (webcam) {
            webcam.stop();
            document.getElementById("webcam-container").innerHTML = "";
        }
    } else {
        lottoSection.style.display = "none";
        animalSection.style.display = "block";
        document.querySelectorAll(".nav-btn")[1].classList.add("active");
    }
}

// --- 로또 추천 기능 ---
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

// --- 동물상 테스트 기능 (Teachable Machine) ---
const URL = "https://teachablemachine.withgoogle.com/models/gh_9ZUKs3/";
let model, webcam, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; 
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const labelDiv = document.createElement("div");
        labelDiv.className = "label-item";
        labelContainer.appendChild(labelDiv);
    }
}

async function loop() {
    if (webcam && webcam.canvas) {
        webcam.update();
        await predict();
        window.requestAnimationFrame(loop);
    }
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const probabilityPercent = (prediction[i].probability * 100).toFixed(0);
        const classPrediction = `${prediction[i].className}: ${probabilityPercent}%`;
        labelContainer.childNodes[i].innerHTML = classPrediction;
        labelContainer.childNodes[i].style.background = `linear-gradient(90deg, var(--button-bg) ${probabilityPercent}%, transparent ${probabilityPercent}%)`;
    }
}
