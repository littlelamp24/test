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
    } else {
        lottoSection.style.display = "none";
        animalSection.style.display = "block";
        document.querySelectorAll(".nav-btn")[1].classList.add("active");
        loadModel();
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

// --- 동물상 테스트 기능 ---
const URL = "https://teachablemachine.withgoogle.com/models/gh_9ZUKs3/";
let model, labelContainer, maxPredictions;

const rainbowColors = [
    "#ef4444", // 빨강 (Red)
    "#f97316", // 주황 (Orange)
    "#eab308", // 노랑 (Yellow)
    "#22c55e", // 초록 (Green)
    "#3b82f6", // 파랑 (Blue)
    "#6366f1", // 남색 (Indigo)
    "#a855f7"  // 보라 (Violet)
];

// 사용자가 제공한 동물 리스트 (강아지, 고양이, 낙타, 양, 쥐, 돼지, 토끼)
const animalData = {
    "강아지": {
        img: "test_dog3.png",
        desc: "🐶 충성심 가득! 귀여움 한도 초과! 주인이 퇴근하면 꼬리 헬리콥터 가동하는 멍뭉이상이시네요. 당신의 친화력은 우주 최강!"
    },
    "고양이": {
        img: "test_cat12.jpg",
        desc: "🐱 차도남/차도녀의 정석! 가끔은 개냥이처럼 굴지만, 기본적으로 세상을 내려다보는 도도한 고양이상이시네요. 츤데레 매력에 다들 쓰러집니다."
    },
    "낙타": {
        img: "test_camel28.jpg",
        desc: "🐫 인내심 끝판왕! 사막에서도 꿋꿋이 살아남는 강인한 생명력과 듬직함을 가진 낙타상이시네요. 당신의 성실함은 모두가 인정합니다."
    },
    "양": {
        img: "test_lamb15.jpg",
        desc: "🐑 순수함 그 자체! 하얀 구름처럼 몽글몽글하고 착한 마음씨를 가진 양상이시네요. 평화주의자인 당신 주변엔 항상 사람이 모입니다."
    },
    "쥐": {
        img: "test_mouse29.jpg",
        desc: "🐭 영리하고 부지런한 매력! 작은 체구지만 눈치가 빠르고 센스가 넘치는 쥐상이시네요. 어디서든 굶지 않을 똑똑한 생존 본능의 소유자!"
    },
    "돼지": {
        img: "test_pig1.jpg",
        desc: "🐷 복을 부르는 얼굴! 둥글둥글하고 여유로운 성격으로 주변을 행복하게 만드는 돼지상이시네요. 당신과 함께라면 언제나 풍요롭습니다."
    },
    "토끼": {
        img: "test_rabbit3.jpg",
        desc: "🐰 깜찍하고 발랄한 매력! 보고만 있어도 힐링되는 치명적인 귀여움의 소유자 토끼상이시네요. 당신의 깡충거리는 에너지는 비타민 그 자체!"
    }
};

async function loadModel() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

async function handleFileUpload(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const imagePreview = document.getElementById("face-image");
            imagePreview.src = e.target.result;
            document.getElementById("image-preview-container").style.display = "block";
            await loadModel();
            predictImage(imagePreview);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function predictImage(imageElement) {
    const prediction = await model.predict(imageElement);
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    
    let topPrediction = prediction[0];
    for (let i = 1; i < maxPredictions; i++) {
        if (prediction[i].probability > topPrediction.probability) {
            topPrediction = prediction[i];
        }
    }

    const resultMessage = document.getElementById("result-message");
    // 모델의 className이 한글이므로 직접 매칭
    const animalName = topPrediction.className; 
    const data = animalData[animalName] || { img: "", desc: "매력 넘치는 특별한 동물상이시네요!" };

    resultMessage.innerHTML = `<h3>당신은 ${animalName}상!</h3>
                               <p>${data.desc}</p>`;
    resultMessage.style.display = "block";

    // 결과 이미지 표시
    const resultImg = document.getElementById("animal-result-image");
    const resultImgContainer = document.getElementById("animal-result-image-container");
    if (data.img) {
        resultImg.src = data.img;
        resultImgContainer.style.display = "block";
    } else {
        resultImgContainer.style.display = "none";
    }

    for (let i = 0; i < maxPredictions; i++) {
        const probabilityPercent = (prediction[i].probability * 100).toFixed(0);
        const labelDiv = document.createElement("div");
        labelDiv.className = "label-item";
        labelDiv.innerHTML = `${prediction[i].className}: ${probabilityPercent}%`;
        
        const barColor = rainbowColors[i % rainbowColors.length];
        if (probabilityPercent > 0) {
            labelDiv.style.background = `linear-gradient(90deg, ${barColor} ${probabilityPercent}%, var(--set-bg) ${probabilityPercent}%)`;
        } else {
            labelDiv.style.background = `var(--set-bg)`;
        }
        
        labelContainer.appendChild(labelDiv);
    }
}
