const CARS = [
    {
        id: "fusca",
        name: "Fusca Clássico",
        price: 0,
        speed: 120,
        acceleration: 0.05,
        durabilityBonus: 10,
        image: "car_fusca.png",
        description: "Devagar e sempre. O primeiro passo para a segurança."
    },
    {
        id: "celta",
        name: "Celta Popular",
        price: 1500,
        speed: 160,
        acceleration: 0.08,
        durabilityBonus: 15,
        image: "car_celta.png",
        description: "Econômico e prático para a cidade."
    },
    {
        id: "gol",
        name: "Gol G8",
        price: 3500,
        speed: 190,
        acceleration: 0.12,
        durabilityBonus: 18,
        image: "car_celta.png",
        description: "Agilidade e resistência em qualquer pista."
    },
    {
        id: "corolla",
        name: "Corolla Sedan",
        price: 7000,
        speed: 210,
        acceleration: 0.15,
        durabilityBonus: 22,
        image: "car_bmw.png",
        description: "O padrão ouro de segurança e conforto."
    },
    {
        id: "civic",
        name: "Civic Sport",
        price: 12000,
        speed: 240,
        acceleration: 0.20,
        durabilityBonus: 25,
        image: "car_bmw.png",
        description: "Estilo esportivo com tecnologia de ponta."
    },
    {
        id: "bmw",
        name: "BMW M3",
        price: 25000,
        speed: 280,
        acceleration: 0.28,
        durabilityBonus: 30,
        image: "car_bmw.png",
        description: "Performance alemã e precisão extrema."
    },
    {
        id: "porsche",
        name: "Porsche 911",
        price: 50000,
        speed: 320,
        acceleration: 0.35,
        durabilityBonus: 35,
        image: "car_porsche.png",
        description: "Puro sangue das pistas, veloz e seguro."
    },
    {
        id: "f1",
        name: "F1 Red Hawk",
        price: 100000,
        speed: 360,
        acceleration: 0.50,
        durabilityBonus: 50,
        image: "car_f1.png",
        description: "O ápice do automobilismo. Máximo controle e velocidade."
    }
];

let playerState = {
    money: 0,
    ownedCars: ["fusca"],
    currentCarId: "fusca"
};

function loadState() {
    const saved = localStorage.getItem('ownTheRoad_save');
    if (saved) {
        playerState = JSON.parse(saved);
    }
}

function saveState() {
    localStorage.setItem('ownTheRoad_save', JSON.stringify(playerState));
}

function getCarById(id) {
    return CARS.find(c => c.id === id);
}

function getCurrentCar() {
    return getCarById(playerState.currentCarId);
}
