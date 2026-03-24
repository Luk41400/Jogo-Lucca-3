const ROAD_SAFETY_QUESTIONS = [
    {
        question: "Qual deve ser a sua atitude ao ver o semáforo amarelo?",
        options: [
            "Acelerar para passar antes de ficar vermelho",
            "Parar o veículo se houver segurança",
            "Manter a mesma velocidade e passar",
            "Buzinar para avisar que está passando"
        ],
        answer: 1 // index of the correct option
    },
    {
        question: "Por que o uso do cinto de segurança é obrigatório?",
        options: [
            "Para evitar multas apenas",
            "Ele impede que você seja lançado para fora em colisões",
            "Para dar mais conforto ao motorista",
            "Apenas motoristas de F1 precisam usar"
        ],
        answer: 1
    },
    {
        question: "Qual o limite de velocidade em áreas escolares?",
        options: [
            "60 km/h",
            "80 km/h",
            "30 km/h (reduzida)",
            "Não há limite se não houver guardas"
        ],
        answer: 2
    },
    {
        question: "Qual a distância segura do carro da frente em alta velocidade?",
        options: [
            "1 metro",
            "Pelo menos 2 segundos de distância",
            "Não importa, contanto que seus freios funcionem",
            "50 metros fixos em qualquer situação"
        ],
        answer: 1
    },
    {
        question: "O que significa 'Direção Defensiva'?",
        options: [
            "Atacar os outros motoristas para se proteger",
            "Dirigir prevendo riscos e agindo para evitar acidentes",
            "Ficar parado no meio da rua",
            "Andar apenas pela faixa da esquerda"
        ],
        answer: 1
    },
    {
        question: "Quando é permitido ultrapassar pela direita?",
        options: [
            "A qualquer momento em rodovias",
            "Quando o veículo à frente sinaliza que vai entrar à esquerda e há espaço",
            "Sempre que estiver com pressa",
            "Nunca é permitido em hipótese alguma"
        ],
        answer: 1
    },
    {
        question: "Qual o efeito do álcool no motorista?",
        options: [
            "Aumenta os reflexos",
            "Diminui os reflexos e a capacidade de julgamento",
            "Deixa o motorista mais atento",
            "Não causa efeito se beber pouca quantidade"
        ],
        answer: 1
    },
    {
        question: "Em caso de chuva forte, o que o motorista deve fazer?",
        options: [
            "Ligar o alerta e parar no meio da pista",
            "Reduzir a velocidade e acender os faróis baixos",
            "Acelerar para sair logo da chuva",
            "Manter a velocidade e usar apenas o limpador"
        ],
        answer: 1
    },
    {
        question: "Qual a prioridade no trânsito?",
        options: [
            "O veículo mais rápido",
            "O pedestre",
            "O ônibus",
            "Quem estiver na preferencial sempre"
        ],
        answer: 1
    },
    {
        question: "O uso do celular ao dirigir é permitido se:",
        options: [
            "Estiver no viva-voz",
            "Apenas for uma mensagem rápida",
            "Não é permitido, pois causa distração cognitiva",
            "O semáforo estiver vermelho"
        ],
        answer: 2
    }
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomQuestion() {
    const q = ROAD_SAFETY_QUESTIONS[Math.floor(Math.random() * ROAD_SAFETY_QUESTIONS.length)];
    // Return a clone with shuffled options
    const originalAnswerText = q.options[q.answer];
    const shuffledOptions = shuffleArray([...q.options]);
    const newAnswerIndex = shuffledOptions.indexOf(originalAnswerText);
    
    return {
        question: q.question,
        options: shuffledOptions,
        answer: newAnswerIndex
    };
}
