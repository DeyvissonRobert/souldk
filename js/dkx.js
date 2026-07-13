/* ==========================================================================
   DKX — Sistema Inteligente de Diagnóstico (lógica da experiência)
   Fluxo: Intro → Loading (Engine) → Nome → Perguntas → Calculando → Resultado → WhatsApp
   ========================================================================== */
(() => {
  "use strict";

  const WHATSAPP_NUMBER = "5579998416681";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     DADOS: PERGUNTAS
     Categorias: atendimento, automacao, conversao, presenca, experiencia
     Todas iniciam em 100 pontos; cada opção subtrai (ou não) pontos.
     --------------------------------------------------------------------- */
  const questions = [
    {
      q: "Seu negócio está disponível para atender clientes 24 horas por dia?",
      options: [
        { label: "Sim", score: {} },
        { label: "Não", score: { atendimento: -20, automacao: -15, conversao: -10 } },
      ],
    },
    {
      q: "Se um cliente enviar uma mensagem agora, quanto tempo normalmente espera por uma resposta?",
      options: [
        { label: "Menos de 5 minutos", score: {} },
        { label: "Entre 5 e 30 minutos", score: { atendimento: -8, conversao: -6 } },
        { label: "Mais de 30 minutos", score: { atendimento: -20, conversao: -18, automacao: -10 } },
      ],
    },
    {
      q: "Você acredita que já perdeu clientes simplesmente porque demorou para responder?",
      options: [
        { label: "Nunca", score: {} },
        { label: "Algumas vezes", score: { conversao: -12, atendimento: -10 } },
        { label: "Com frequência", score: { conversao: -25, atendimento: -18 } },
      ],
    },
    {
      q: "Se um cliente encontrar sua empresa hoje na internet, entenderá rapidamente o que você oferece?",
      options: [
        { label: "Sim", score: {} },
        { label: "Parcialmente", score: { presenca: -10, conversao: -8 } },
        { label: "Não", score: { presenca: -22, conversao: -18 } },
      ],
    },
    {
      q: "Hoje você consegue medir quantos clientes deixam de comprar antes mesmo de falar com você?",
      options: [
        { label: "Sim", score: {} },
        { label: "Não", score: { experiencia: -20, conversao: -12 } },
      ],
    },
    {
      q: "O atendimento da sua empresa depende totalmente de uma pessoa para funcionar?",
      options: [
        { label: "Não", score: {} },
        { label: "Parcialmente", score: { automacao: -12, atendimento: -8 } },
        { label: "Sim", score: { automacao: -28, atendimento: -15 } },
      ],
    },
    {
      q: "Se hoje sua empresa recebesse 100 mensagens ao mesmo tempo, conseguiria atender todas com qualidade?",
      options: [
        { label: "Sim", score: {} },
        { label: "Talvez", score: { atendimento: -10, automacao: -8 } },
        { label: "Não", score: { atendimento: -22, automacao: -20, conversao: -12 } },
      ],
    },
    {
      q: "Seus clientes conseguem resolver as principais dúvidas sem esperar um atendente?",
      options: [
        { label: "Sim", score: {} },
        { label: "Parcialmente", score: { automacao: -10, experiencia: -8 } },
        { label: "Não", score: { automacao: -20, experiencia: -18 } },
      ],
    },
    {
      q: "Você acredita que sua empresa transmite uma imagem moderna e profissional na internet?",
      options: [
        { label: "Sim", score: {} },
        { label: "Mais ou menos", score: { presenca: -10, experiencia: -8 } },
        { label: "Não", score: { presenca: -25, experiencia: -12 } },
      ],
    },
    {
      q: "Se existisse uma tecnologia capaz de atender melhor seus clientes, economizar tempo da equipe e aumentar suas vendas, você teria interesse?",
      options: [
        { label: "Com certeza", score: {} },
        { label: "Sim", score: {} },
      ],
    },
  ];

  // Mensagens de diagnóstico — disparadas somente quando a opção associada é escolhida
  const negativeInsights = {
    0: { minIndex: 1, text: "Sua empresa não está disponível 24 horas por dia — isso pode significar clientes perdidos fora do horário comercial." },
    1: { minIndex: 1, text: "O tempo de resposta ao cliente está impactando negativamente o atendimento e a conversão." },
    2: { minIndex: 1, text: "Você já perdeu clientes por demora no atendimento — esse é um ponto crítico para reverter." },
    3: { minIndex: 1, text: "Sua presença digital não comunica claramente o que você oferece, dificultando a conversão de novos clientes." },
    4: { minIndex: 1, text: "Você não consegue medir quantos clientes desistem antes de falar com sua empresa — isso esconde oportunidades reais." },
    5: { minIndex: 1, text: "Seu atendimento depende fortemente de uma pessoa, o que limita a escala do seu negócio." },
    6: { minIndex: 1, text: "Sua empresa teria dificuldade em atender um pico de mensagens simultâneas, prejudicando a experiência do cliente." },
    7: { minIndex: 1, text: "Seus clientes dependem de um atendente para resolver dúvidas simples, o que gera lentidão na jornada." },
    8: { minIndex: 1, text: "Sua empresa ainda não transmite uma imagem moderna e profissional na internet." },
  };
  const positiveInsights = {
    0: "Seu atendimento já funciona 24 horas por dia — uma vantagem competitiva importante.",
    1: "Seu tempo de resposta ao cliente é rápido, o que fortalece a confiança e a conversão.",
    2: "Você nunca sentiu perder clientes por demora — sinal de um atendimento bem estruturado.",
    3: "Sua presença digital comunica com clareza o que sua empresa oferece.",
    4: "Você já consegue medir onde os clientes desistem — uma base sólida para melhorar ainda mais.",
    5: "Seu atendimento não depende de uma única pessoa para funcionar.",
    6: "Sua empresa suportaria bem um grande volume de mensagens simultâneas.",
    7: "Seus clientes resolvem dúvidas simples sem esperar um atendente.",
    8: "Sua empresa já transmite uma imagem moderna e profissional na internet.",
  };

  const categoryLabels = {
    atendimento: "Atendimento",
    automacao: "Automação",
    conversao: "Conversão",
    presenca: "Presença Digital",
    experiencia: "Experiência Digital",
  };

  const scores = { atendimento: 100, automacao: 100, conversao: 100, presenca: 100, experiencia: 100 };
  const answersLog = []; // { q, a, qIndex, optIndex }
  let companyName = "";

  const classifications = [
    { min: 90, emoji: "🟢", label: "Excelente", color: "var(--success)", desc: "Sua empresa já entrega uma experiência digital de altíssimo nível. Poucos ajustes finos podem elevar ainda mais os resultados." },
    { min: 75, emoji: "🔵", label: "Muito Boa", color: "var(--info)", desc: "Sua empresa está muito bem posicionada digitalmente, com boas práticas já implementadas e espaço para otimizações pontuais." },
    { min: 60, emoji: "🟡", label: "Boa, com oportunidades", color: "var(--warning)", desc: "Sua empresa tem uma base sólida, mas existem oportunidades claras para melhorar atendimento, automação e conversão." },
    { min: 40, emoji: "🟠", label: "Precisa de melhorias", color: "#FB923C", desc: "Sua empresa está deixando oportunidades importantes na mesa. Atendimento, automação e presença digital merecem atenção." },
    { min: 0, emoji: "🔴", label: "Atenção imediata", color: "var(--danger)", desc: "Sua empresa está perdendo clientes por falhas críticas na experiência digital. É hora de agir." },
  ];

  function classify(score){
    return classifications.find(c => score >= c.min) || classifications[classifications.length - 1];
  }

  /* ---------------------------------------------------------------------
     ELEMENTOS / NAVEGAÇÃO ENTRE TELAS
     --------------------------------------------------------------------- */
  const screens = {
    intro: document.getElementById("screenIntro"),
    loading: document.getElementById("screenLoading"),
    name: document.getElementById("screenName"),
    questionWrap: document.getElementById("screenQuestionWrap"),
    analysis: document.getElementById("screenAnalysis"),
    results: document.getElementById("screenResults"),
    done: document.getElementById("screenDone"),
  };
  function showScreen(key){
    Object.entries(screens).forEach(([k, el]) => { el.hidden = (k !== key); });
  }

  /* ---------------------------------------------------------------------
     TELA 1 — CARD DE APRESENTAÇÃO
     --------------------------------------------------------------------- */
  document.getElementById("startDiagnosis").addEventListener("click", () => {
    showScreen("loading");
    runLoading();
  });

  /* ---------------------------------------------------------------------
     TELA 2 — CARREGAMENTO (ENGINE) · mensagens empilhadas
     --------------------------------------------------------------------- */
  const loadingMessages = [
    "Inicializando DKX...",
    "Carregando módulos...",
    "Analisando estrutura...",
    "Processando experiência digital...",
    "Comparando padrões...",
    "Calculando indicadores...",
    "Gerando recomendações...",
    "Preparando diagnóstico...",
  ];
  const loadingBar = document.getElementById("loadingBar");
  const loadingList = document.getElementById("loadingMessages");

  function runLoading(){
    loadingList.innerHTML = "";
    const total = reducedMotion ? 480 : 2400;
    const stepTime = total / loadingMessages.length;
    let i = 0;

    function addMessage(index){
      const prev = loadingList.querySelector("li.is-current");
      if (prev) prev.classList.remove("is-current");
      const li = document.createElement("li");
      li.textContent = loadingMessages[index];
      li.classList.add("is-current");
      loadingList.appendChild(li);
      loadingBar.style.width = (((index + 1) / loadingMessages.length) * 100) + "%";
    }

    addMessage(0);
    const interval = setInterval(() => {
      i++;
      if (i >= loadingMessages.length){
        clearInterval(interval);
        setTimeout(() => {
          const cur = loadingList.querySelector("li.is-current");
          if (cur) cur.classList.remove("is-current");
          showScreen("name");
          document.getElementById("companyName").focus();
        }, 350);
        return;
      }
      addMessage(i);
    }, stepTime);
  }

  /* ---------------------------------------------------------------------
     TELA 3 — NOME DA EMPRESA
     --------------------------------------------------------------------- */
  document.getElementById("nameForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("companyName");
    companyName = input.value.trim() || "Sua empresa";
    startQuestions();
  });

  /* ---------------------------------------------------------------------
     TELA 4 — PERGUNTAS
     --------------------------------------------------------------------- */
  const progressFill = document.getElementById("dkxProgressFill");
  const stepLabel = document.getElementById("dkxStepLabel");
  const screenQuestion = document.getElementById("screenQuestion");
  let currentQ = 0;

  function startQuestions(){
    currentQ = 0;
    showScreen("questionWrap");
    renderQuestion();
  }

  function renderQuestion(){
    const total = questions.length;
    const data = questions[currentQ];
    const pct = (currentQ / total) * 100;
    progressFill.style.width = pct + "%";
    stepLabel.textContent = `Etapa ${currentQ + 1} de ${total}`;

    const block = document.createElement("div");
    block.className = "dkx-question";
    block.innerHTML = `
      <div class="qnum">Pergunta ${currentQ + 1}</div>
      <h2>${data.q}</h2>
      <div class="dkx-options">
        ${data.options.map((opt, i) => `
          <button class="dkx-option" data-i="${i}" type="button">
            <span>${opt.label}</span>
            <span class="check"></span>
          </button>
        `).join("")}
      </div>
    `;
    screenQuestion.innerHTML = "";
    screenQuestion.appendChild(block);

    block.querySelectorAll(".dkx-option").forEach(btn => {
      btn.addEventListener("click", (e) => selectOption(e, btn, data));
    });
  }

  function selectOption(event, btn, data){
    const i = Number(btn.dataset.i);
    const opt = data.options[i];

    // ripple
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (event.clientY - rect.top - size / 2) + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);

    const allOptions = screenQuestion.querySelectorAll(".dkx-option");
    allOptions.forEach(b => {
      b.disabled = true;
      if (b === btn) b.classList.add("is-selected");
      else b.classList.add("is-unselected");
    });

    Object.entries(opt.score || {}).forEach(([cat, delta]) => {
      scores[cat] = Math.min(100, Math.max(0, scores[cat] + delta));
    });
    answersLog.push({ q: data.q, a: opt.label, qIndex: currentQ, optIndex: i });

    const questionEl = screenQuestion.querySelector(".dkx-question");
    setTimeout(() => {
      questionEl.classList.add("q-leaving");
      setTimeout(() => {
        currentQ++;
        if (currentQ < questions.length){
          renderQuestion();
        } else {
          progressFill.style.width = "100%";
          stepLabel.textContent = "Etapa Final";
          setTimeout(runAnalysis, 300);
        }
      }, reducedMotion ? 0 : 350);
    }, reducedMotion ? 0 : 550);
  }

  /* ---------------------------------------------------------------------
     TELA 5 — CALCULANDO
     --------------------------------------------------------------------- */
  function runAnalysis(){
    showScreen("analysis");
    setTimeout(showResults, reducedMotion ? 200 : 1100);
  }

  /* ---------------------------------------------------------------------
     TELA 6 — RESULTADO
     --------------------------------------------------------------------- */
  function computeGlobalScore(){
    const vals = Object.values(scores);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  function buildInsights(){
    // Mensagens negativas: apenas para perguntas cuja resposta escolhida teve delta (optIndex >= minIndex)
    const negatives = answersLog
      .filter(a => negativeInsights[a.qIndex] && a.optIndex >= negativeInsights[a.qIndex].minIndex)
      .map(a => {
        const impact = Object.values(questions[a.qIndex].options[a.optIndex].score || {})
          .reduce((sum, v) => sum + Math.abs(v), 0);
        return { text: negativeInsights[a.qIndex].text, impact };
      })
      .sort((a, b) => b.impact - a.impact);

    let list = negatives.slice(0, 6).map(n => n.text);

    if (list.length < 4){
      const positives = answersLog
        .filter(a => positiveInsights[a.qIndex] && a.optIndex === 0)
        .map(a => positiveInsights[a.qIndex]);
      for (const p of positives){
        if (list.length >= 4) break;
        if (!list.includes(p)) list.push(p);
      }
    }

    return list.slice(0, 6);
  }

  function showResults(){
    const global = computeGlobalScore();
    const cls = classify(global);

    document.getElementById("resultCompanyTitle").textContent = `O diagnóstico de ${companyName} está pronto.`;

    // gauge
    const circle = document.getElementById("scoreCircle");
    const circumference = 2 * Math.PI * 88; // ≈ 553
    circle.style.stroke = cls.color;
    const numberEl = document.getElementById("scoreNumber");

    // classificação
    document.getElementById("classChip").innerHTML = `${cls.emoji} <span style="margin-left:6px;">${cls.label}</span>`;
    document.getElementById("classChip").style.color = cls.color;
    document.getElementById("classDesc").textContent = cls.desc;

    // barras por categoria
    const barsWrap = document.getElementById("dkxBars");
    barsWrap.innerHTML = Object.entries(scores).map(([cat, val]) => `
      <div class="dkx-bar-row">
        <div class="label"><span>${categoryLabels[cat]}</span><b data-target="${val}">0%</b></div>
        <div class="track"><i data-target="${val}" style="width:0%"></i></div>
      </div>
    `).join("");

    // insights
    const insights = buildInsights();
    document.getElementById("dkxInsightsList").innerHTML = insights.map(text => `
      <div class="dkx-insight"><i>⚡</i><span>${text}</span></div>
    `).join("");

    showScreen("results");

    requestAnimationFrame(() => {
      const offset = circumference - (global / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      animateCount(numberEl, global);

      barsWrap.querySelectorAll("i[data-target]").forEach(bar => { bar.style.width = bar.dataset.target + "%"; });
      barsWrap.querySelectorAll("b[data-target]").forEach(b => animateCount(b, Number(b.dataset.target), "%"));
    });

    window.souldkTrack?.("dkx_completed", { score: global, classification: cls.label, company: companyName });
  }

  function animateCount(el, target, suffix = ""){
    if (reducedMotion){ el.textContent = target + suffix; return; }
    const duration = 1200;
    const start = performance.now();
    function frame(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------
     ENVIO DO DIAGNÓSTICO (WhatsApp) — relatório completo
     --------------------------------------------------------------------- */
  document.getElementById("sendDiagnosis").addEventListener("click", function(){
    this.classList.add("is-loading");
    this.innerHTML = `<span class="spinner"></span> Enviando…`;

    const global = computeGlobalScore();
    const cls = classify(global);
    const insights = buildInsights();

    const qaText = answersLog.map((a, i) => `${i + 1}. ${a.q}\n   → ${a.a}`).join("\n");
    const scoreText = Object.entries(scores).map(([cat, v]) => `${categoryLabels[cat]}: ${Math.round(v)}%`).join("\n");
    const insightsText = insights.map(t => `• ${t}`).join("\n");

    const message =
`Olá! Acabei de concluir meu Diagnóstico DKX.

Empresa: ${companyName}

Respostas:
${qaText}

Pontuação Geral: ${global}% — ${cls.emoji} ${cls.label}

Pontuações por categoria:
${scoreText}

Resumo do diagnóstico:
${insightsText}

Gostaria de receber uma análise personalizada.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      window.open(url, "_blank", "noopener");
      showScreen("done");
      window.souldkTrack?.("dkx_diagnosis_sent", { score: global, company: companyName });
    }, 700);
  });

})();