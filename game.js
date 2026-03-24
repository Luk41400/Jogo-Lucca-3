/* --- Variables & Constants --- */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let animationFrame;
let lastTime = 0;

// Game state
let gameState = {
    screen: 'menu',
    distance: 0,
    trackLength: 30000, 
    carX: 0,
    carY: 0,
    speed: 0,
    maxSpeed: 0,
    acceleration: 0,
    durability: 100,
    paused: false,
    markersPassed: 0,
    trafficLights: [], 
    obstacles: [],
    currentQuestion: null,
    questionTimer: 0,
    questionActive: false,
    keys: {
        forward: false,
        backward: false,
        left: false,
        right: false
    }
};

// Keyboard Listeners
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const c = e.code;
    if (k === 'arrowup' || k === 'w' || c === 'KeyW') gameState.keys.forward = true;
    if (k === 'arrowdown' || k === 's' || c === 'KeyS') gameState.keys.backward = true;
    if (k === 'arrowleft' || k === 'a' || c === 'KeyA') gameState.keys.left = true;
    if (k === 'arrowright' || k === 'd' || c === 'KeyD') gameState.keys.right = true;
});

window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    const c = e.code;
    if (k === 'arrowup' || k === 'w' || c === 'KeyW') gameState.keys.forward = false;
    if (k === 'arrowdown' || k === 's' || c === 'KeyS') gameState.keys.backward = false;
    if (k === 'arrowleft' || k === 'a' || c === 'KeyA') gameState.keys.left = false;
    if (k === 'arrowright' || k === 'd' || c === 'KeyD') gameState.keys.right = false;
});

// On-screen Control Listeners
function setupTouchControls() {
    const setupBtn = (id, property) => {
        const btn = document.getElementById(id);
        const start = (e) => { e.preventDefault(); gameState.keys[property] = true; };
        const end = (e) => { e.preventDefault(); gameState.keys[property] = false; };
        btn.addEventListener('mousedown', start, {passive: false});
        btn.addEventListener('mouseup', end, {passive: false});
        btn.addEventListener('mouseleave', end, {passive: false});
        btn.addEventListener('touchstart', start, {passive: false});
        btn.addEventListener('touchend', end, {passive: false});
    };
    setupBtn('ctrl-up', 'forward');
    setupBtn('ctrl-down', 'backward');
    setupBtn('ctrl-left', 'left');
    setupBtn('ctrl-right', 'right');
}

// Markers & Obstacles
function generateTrackData() {
    generateTrackLights();
    generateObstacles();
}

function generateTrackLights() {
    gameState.trafficLights = [];
    let lightCount = 3; 
    let interval = gameState.trackLength / (lightCount + 1);
    for (let i = 1; i <= lightCount; i++) {
        gameState.trafficLights.push({
            pos: i * interval,
            passed: false,
            active: false
        });
    }
}

function generateObstacles() {
    gameState.obstacles = [];
    const roadWidth = 400;
    
    for (let d = 2000; d < gameState.trackLength - 1000; d += (1200 + Math.random() * 800)) {
        const nearLight = gameState.trafficLights.some(l => Math.abs(l.pos - d) < 600);
        if (nearLight) continue;

        gameState.obstacles.push({
            pos: d,
            relX: (Math.random() - 0.5) * 280,
            type: Math.random() > 0.5 ? 'cone' : 'hole',
            hit: false
        });
    }
}

/* --- UI Handlers --- */
function updateUI() {
    document.getElementById('player-money').innerText = `$${playerState.money}`;
    const car = getCurrentCar();
    document.getElementById('current-car').innerText = car.name;
    document.querySelectorAll('.money-display').forEach(el => el.innerText = `$${playerState.money}`);
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    gameState.screen = screenId;
    
    if (screenId === 'garage-screen') renderGarage();
}

/* --- Garage --- */
function renderGarage() {
    const list = document.getElementById('car-list');
    list.innerHTML = '';
    CARS.forEach(car => {
        const isOwned = playerState.ownedCars.includes(car.id);
        const isCurrent = playerState.currentCarId === car.id;
        
        const card = document.createElement('div');
        card.className = `car-card ${!isOwned ? 'locked' : ''} ${isCurrent ? 'selected' : ''}`;
        
        card.innerHTML = `
            <img src="${car.image}" class="car-car-img" alt="${car.name}">
            <div class="car-name">${car.name}</div>
            <div class="car-stats">
                <span>Velo: ${car.speed}</span>
                <span>Acel: ${Math.round(car.acceleration * 100)}</span>
                <span>Qualidade: ${car.durabilityBonus}</span>
            </div>
            <div class="car-price">${isOwned ? (isCurrent ? 'SELECIONADO' : 'USAR') : `$${car.price}`}</div>
            <p style="font-size: 0.7rem; margin-top: 10px; opacity: 0.7">${car.description}</p>
        `;
        
        card.onclick = () => {
            if (isOwned) {
                playerState.currentCarId = car.id;
                saveState();
                renderGarage();
                updateUI();
            } else if (playerState.money >= car.price) {
                playerState.money -= car.price;
                playerState.ownedCars.push(car.id);
                playerState.currentCarId = car.id;
                saveState();
                renderGarage();
                updateUI();
            } else {
                alert("Dinheiro insuficiente!");
            }
        };
        list.appendChild(card);
    });
}

/* --- Game Control --- */
let carImage = new Image();

function startRace() {
    const car = getCurrentCar();
    const tempImg = new Image();
    tempImg.src = car.image;
    tempImg.onload = () => {
        carImage.src = removeImageBackground(tempImg);
    };
    
    gameState.distance = 0;
    gameState.speed = 0;
    gameState.maxSpeed = car.speed / 10;
    gameState.acceleration = car.acceleration;
    gameState.durability = 100;
    gameState.paused = false;
    gameState.questionActive = false;
    generateTrackData();
    
    switchScreen('game-screen');
    resizeCanvas();
    lastTime = performance.now();
    gameLoop(lastTime);
}

function removeImageBackground(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Background removal logic (targets dark grays/near-blacks)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // If color is close to the typical dark gray background (#1a1a1a to #333333)
        if (r < 60 && g < 60 && b < 60) {
            data[i+3] = 0; // Set alpha to 0 (transparent)
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.carX = canvas.width / 2;
    gameState.carY = canvas.height - 150;
}

window.addEventListener('resize', resizeCanvas);

/* --- Questions Logic --- */
function showQuestion() {
    gameState.questionActive = true;
    gameState.currentQuestion = getRandomQuestion();
    gameState.questionTimer = 15;
    
    const container = document.getElementById('question-overlay');
    container.classList.remove('hidden');
    
    document.getElementById('question-text').innerText = gameState.currentQuestion.question;
    const optionsEl = document.getElementById('options-container');
    optionsEl.innerHTML = '';
    
    gameState.currentQuestion.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(idx);
        optionsEl.appendChild(btn);
    });
    
    // Traffic Light Anim
    const lights = document.querySelectorAll('.light');
    lights.forEach(l => l.classList.remove('active'));
    document.querySelector('.light.red').classList.add('active');
}

function handleAnswer(index) {
    if (!gameState.questionActive) return;
    
    const isCorrect = (index === gameState.currentQuestion.answer);
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((b, i) => {
        if (i === gameState.currentQuestion.answer) b.classList.add('correct');
        else if (i === index) b.classList.add('wrong');
        b.disabled = true;
    });

    if (isCorrect) {
        const car = getCurrentCar();
        gameState.durability = Math.min(100, gameState.durability + car.durabilityBonus);
    } else {
        gameState.durability = Math.max(0, gameState.durability - 25);
    }

    updateHud();

    setTimeout(() => {
        document.getElementById('question-overlay').classList.add('hidden');
        gameState.questionActive = false;
        
        if (gameState.durability <= 0) endGame(false);
    }, 1500);
}

function updateHud() {
    const bar = document.getElementById('durability-bar');
    bar.style.width = `${gameState.durability}%`;
    bar.className = `progress-bar ${gameState.durability < 30 ? 'red' : 'green'}`;
    
    document.getElementById('speed-display').innerText = `${Math.round(gameState.speed * 10)} KM/H`;
    
    const progress = (gameState.distance / gameState.trackLength) * 100;
    document.getElementById('player-marker').style.bottom = `${progress}%`;
}

/* --- Game Loop --- */
function gameLoop(time) {
    if (gameState.screen !== 'game-screen') return;
    
    let deltaTime = (time - lastTime) / 1000;
    if (deltaTime > 0.1) deltaTime = 0.1; // Cap dt
    lastTime = time;

    if (!gameState.questionActive && !gameState.paused) {
        // --- Controls & Physics ---
        if (gameState.keys.forward) {
            gameState.speed += gameState.acceleration;
        } else if (gameState.keys.backward) {
            gameState.speed -= gameState.acceleration * 2; // Decel
        } else {
            // Friction
            gameState.speed *= 0.98;
        }

        // Limit Speed
        if (gameState.speed > gameState.maxSpeed) gameState.speed = gameState.maxSpeed;
        if (gameState.speed < -gameState.maxSpeed / 2) gameState.speed = -gameState.maxSpeed / 2;

        // Steering
        if (gameState.speed !== 0) {
            const steeringSpeed = 5 * (Math.abs(gameState.speed) / gameState.maxSpeed + 0.5);
            if (gameState.keys.left) gameState.carX -= steeringSpeed;
            if (gameState.keys.right) gameState.carX += steeringSpeed;
        }

        // Road Limits (Collision)
        const roadWidth = 400;
        const roadX = (canvas.width - roadWidth) / 2;
        if (gameState.carX < roadX + 30) gameState.carX = roadX + 30;
        if (gameState.carX > roadX + roadWidth - 30) gameState.carX = roadX + roadWidth - 30;

        // Progress Distance
        gameState.distance += gameState.speed;
        if (gameState.distance < 0) gameState.distance = 0;
        
        // Traffic Light Trigger
        gameState.trafficLights.forEach(light => {
            if (!light.passed && gameState.distance >= light.pos + 20) {
                light.passed = true;
                gameState.speed = 0;
                showQuestion();
            }
        });

        // Obstacle Collision
        gameState.obstacles.forEach(obs => {
            if (!obs.hit) {
                // Check if car passed the obstacle pos (moving up means distance is increasing)
                const absX = (canvas.width / 2) + obs.relX;
                
                // Collision check (bounding box)
                if (Math.abs(gameState.distance - obs.pos) < 50 && Math.abs(gameState.carX - absX) < 40) {
                    obs.hit = true;
                    gameState.durability = Math.max(0, gameState.durability - 15);
                    gameState.speed *= 0.5; // Slow down on hit
                    updateHud();
                    if (gameState.durability <= 0) endGame(false);
                }
            }
        });

        // Finish Line
        if (gameState.distance >= gameState.trackLength) {
            endGame(true);
            return;
        }
        
        updateHud();
    } else if (gameState.questionActive) {
        gameState.questionTimer -= deltaTime;
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-text');
        
        timerBar.style.width = `${(gameState.questionTimer / 15) * 100}%`;
        timerText.innerText = Math.ceil(gameState.questionTimer);
        
        if (gameState.questionTimer <= 0) {
            handleAnswer(-1);
        }
    }

    renderTrack();
    animationFrame = requestAnimationFrame(gameLoop);
}

function renderTrack() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grass
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Road
    const roadWidth = 400;
    const roadX = (canvas.width - roadWidth) / 2;
    
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(roadX, 0, roadWidth, canvas.height);
    
    // Curbs
    const curbWidth = 15;
    const curbHeight = 40;
    const curbOffset = (gameState.distance % (curbHeight * 2));
    
    for (let y = -curbHeight * 2; y < canvas.height + curbHeight; y += curbHeight * 2) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(roadX - curbWidth, y + curbOffset, curbWidth, curbHeight);
        ctx.fillRect(roadX + roadWidth, y + curbOffset, curbWidth, curbHeight);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(roadX - curbWidth, y + curbOffset + curbHeight, curbWidth, curbHeight);
        ctx.fillRect(roadX + roadWidth, y + curbOffset + curbHeight, curbWidth, curbHeight);
    }
    
    // Road center lines
    const lineGap = 40;
    const lineHeight = 20;
    const offset = (gameState.distance % (lineHeight + lineGap));
    
    ctx.strokeStyle = '#ffffff88';
    ctx.setLineDash([lineHeight, lineGap]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, -offset);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.stroke();
    ctx.setLineDash([]);

    // Obstacles
    gameState.obstacles.forEach(obs => {
        const y = gameState.carY - (obs.pos - gameState.distance);
        // Only draw if on screen
        if (y > -50 && y < canvas.height + 50) {
            const x = (canvas.width / 2) + obs.relX;
            if (obs.type === 'cone') {
                ctx.fillStyle = obs.hit ? '#555' : '#ff9900';
                ctx.beginPath();
                ctx.moveTo(x, y - 20);
                ctx.lineTo(x - 15, y + 20);
                ctx.lineTo(x + 15, y + 20);
                ctx.fill();
            } else {
                ctx.fillStyle = obs.hit ? '#333' : '#000';
                ctx.beginPath();
                ctx.ellipse(x, y, 30, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                if (!obs.hit) {
                    ctx.strokeStyle = '#333';
                    ctx.stroke();
                }
            }
        }
    });
    
    // Car
    drawCar(gameState.carX, gameState.carY);
}

function drawCar(x, y) {
    if (carImage.complete) {
        const w = 80;
        const h = 120;
        ctx.drawImage(carImage, x - w / 2, y - h / 2, w, h);
    } else {
        // Fallback
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - 20, y - 40, 40, 80);
    }
}

function endGame(won) {
    cancelAnimationFrame(animationFrame);
    switchScreen('result-screen');
    
    const title = document.getElementById('result-title');
    const bonusEl = document.getElementById('durability-bonus');
    
    if (won) {
        title.innerText = "VOCÊ CHEGOU!";
        title.style.color = "var(--primary)";
        playerState.money += 500;
        
        // Durability bonus
        const bonus = Math.floor(gameState.durability * 2);
        playerState.money += bonus;
        bonusEl.innerText = `$${bonus}`;
    } else {
        title.innerText = "VEÍCULO DANIFICADO!";
        title.style.color = "var(--accent)";
        bonusEl.innerText = "$0";
    }
    
    saveState();
    updateUI();
}

/* --- Initialization --- */
window.onload = () => {
    loadState();
    updateUI();
    setupTouchControls();
    
    document.getElementById('start-btn').onclick = () => startRace();
    document.getElementById('garage-btn').onclick = () => switchScreen('garage-screen');
    document.querySelector('.back-btn').onclick = () => switchScreen('main-menu');
    document.getElementById('return-menu-btn').onclick = () => switchScreen('main-menu');
};
