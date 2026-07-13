/* ==========================================================================
   SoulDK — main.js
   ========================================================================== */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------------------------------------------------------------------
     THEME
     --------------------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const root = document.body;

  function applyTheme(theme){
    root.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
    localStorage.setItem("souldk-theme", theme);
  }
  applyTheme(localStorage.getItem("souldk-theme") || "dark");

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  /* ---------------------------------------------------------------------
     NAVBAR
     --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navLinks = document.getElementById("navLinks");
  const navToggle = document.getElementById("navToggle");

  function onScroll(){
    navbar.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------------------------------------------------------------------
     SCROLL REVEAL
     --------------------------------------------------------------------- */
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  }, { threshold: 0.15 });
  revealItems.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------------------
     RIPPLE + BUTTON PRESS FEEDBACK
     --------------------------------------------------------------------- */
  document.querySelectorAll(".btn, .fab-main").forEach(btn => {
    btn.addEventListener("click", function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size/2) + "px";
      ripple.style.top = (e.clientY - rect.top - size/2) + "px";
      this.style.position = this.style.position || "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------------------------------------------------------------
     CURSOR GLOW (desktop only)
     --------------------------------------------------------------------- */
  const cursorGlow = document.getElementById("cursorGlow");
  if (cursorGlow && !isTouch && !reducedMotion){
    let idleTimer;
    document.addEventListener("mousemove", (e) => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
      cursorGlow.style.opacity = "1";
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => cursorGlow.style.opacity = "0", 900);
    });
  } else if (cursorGlow){
    cursorGlow.remove();
  }

  /* ---------------------------------------------------------------------
     MOUSE PARALLAX (elementos decorativos do Hero — desktop apenas)
     --------------------------------------------------------------------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (!isTouch && !reducedMotion && parallaxEls.length){
    document.addEventListener("mousemove", (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
      parallaxEls.forEach(el => {
        const amount = parseFloat(el.dataset.parallax) || 1;
        el.style.transform = `translate(${dx * amount * 8}px, ${dy * amount * 8}px)`;
      });
    });
  }

  /* ---------------------------------------------------------------------
     DKX — PARTÍCULAS DECORATIVAS
     --------------------------------------------------------------------- */
  const dkxVisual = document.getElementById("dkxVisual");
  if (dkxVisual && !reducedMotion){
    for (let i = 0; i < 14; i++){
      const p = document.createElement("span");
      p.className = "dkx-particle";
      p.style.left = (10 + Math.random() * 80) + "%";
      p.style.bottom = "10%";
      p.style.animationDuration = (4 + Math.random() * 5) + "s";
      p.style.animationDelay = (Math.random() * 6) + "s";
      dkxVisual.appendChild(p);
    }
  }

  /* ---------------------------------------------------------------------
     TIMELINE — "COMO TRABALHAMOS"
     --------------------------------------------------------------------- */
  const timelineWrap = document.getElementById("timelineWrap");
  const timelineFg = document.getElementById("timelineFg");
  const steps = document.querySelectorAll("[data-step]");

  function updateTimeline(){
    if (!timelineWrap) return;
    const rect = timelineWrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const progressed = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
    const pct = total ? (progressed / total) * 100 : 0;
    timelineFg.style.height = pct + "%";

    steps.forEach(step => {
      const r = step.getBoundingClientRect();
      const stepCenter = r.top + r.height / 2;
      step.classList.toggle("is-active", stepCenter < vh * 0.75);
    });
  }
  document.addEventListener("scroll", updateTimeline, { passive:true });
  window.addEventListener("resize", updateTimeline);
  updateTimeline();

  /* ---------------------------------------------------------------------
     DASHBOARD MOCKUP — animar barras quando visível
     --------------------------------------------------------------------- */
  const dash = document.querySelector(".mock-dash");
  if (dash){
    const dashObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          dash.querySelectorAll(".barline i").forEach(bar => {
            bar.style.width = bar.style.width; // trigger via already-set width
          });
          dashObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    dashObserver.observe(dash);
  }

  /* ---------------------------------------------------------------------
     SEGMENTOS — dados
     --------------------------------------------------------------------- */
  const segmentIcon = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>`;
  const segments = [
    "Clínicas","Dentistas","Psicólogos","Nutricionistas","Advogados","Imobiliárias",
    "Contabilidades","Escritórios","Pizzarias","Hamburguerias","Restaurantes","Cafeterias",
    "Salões de Beleza","Clínicas de Estética","Academias","Autoescolas","Lojas","Distribuidoras","Empresas"
  ];
  const segmentsGrid = document.getElementById("segmentsGrid");
  if (segmentsGrid){
    segmentsGrid.innerHTML = segments.map(s => `
      <div class="segment-chip">${segmentIcon}<span>${s}</span></div>
    `).join("");
  }

  /* ---------------------------------------------------------------------
     PORTFÓLIO — dados + render + modal
     --------------------------------------------------------------------- */
  const projects = [
    {
      name: "Clínica Vitta",
      category: "Landing Page",
      date: "2025",
      client: "Clínica médica multiespecialidade",
      thumb: "linear-gradient(135deg,#6D4AFF,#3B82F6)",
      desc: "Landing Page institucional para clínica multiespecialidade, com agendamento online integrado e foco total em conversão de novos pacientes.",
      features: ["Agendamento online", "Formulário de triagem", "Integração com WhatsApp", "SEO local"],
      tech: ["HTML5", "CSS3", "JavaScript", "Analytics"],
    },
    {
      name: "Dra. Camila Nutri",
      category: "Sistema de Atendimento",
      date: "2025",
      client: "Nutricionista clínica",
      thumb: "linear-gradient(135deg,#3B82F6,#00E5FF)",
      desc: "Sistema Inteligente de Atendimento via WhatsApp com respostas automáticas, qualificação de leads e encaminhamento para agendamento.",
      features: ["Respostas automáticas 24h", "Qualificação de leads", "Encaminhamento inteligente", "Painel de métricas"],
      tech: ["Node.js", "WhatsApp API", "Dashboard"],
    },
    {
      name: "Advocacia Reis & Martins",
      category: "Landing Page",
      date: "2024",
      client: "Escritório de advocacia",
      thumb: "linear-gradient(135deg,#7C3AED,#6D4AFF)",
      desc: "Presença digital sóbria e institucional para escritório de advocacia, transmitindo autoridade e facilitando o primeiro contato.",
      features: ["Design institucional", "Formulário de contato qualificado", "Área de especialidades", "Depoimentos"],
      tech: ["HTML5", "CSS3", "JavaScript"],
    },
    {
      name: "Sabor & Cia Hamburgueria",
      category: "Landing Page + Atendimento",
      date: "2024",
      client: "Hamburgueria artesanal",
      thumb: "linear-gradient(135deg,#F59E0B,#EF4444)",
      desc: "Cardápio digital com pedidos direcionados automaticamente ao WhatsApp, reduzindo erros de pedido e tempo de resposta.",
      features: ["Cardápio digital", "Pedido via WhatsApp", "Promoções em destaque", "Mapa e horários"],
      tech: ["HTML5", "CSS3", "JavaScript"],
    },
    {
      name: "Studio Estética Lumière",
      category: "Sistema de Atendimento",
      date: "2024",
      client: "Clínica de estética",
      thumb: "linear-gradient(135deg,#22C55E,#00E5FF)",
      desc: "Automação de agendamento e confirmação de horários, com lembretes automáticos e redução de faltas.",
      features: ["Agendamento automatizado", "Lembretes automáticos", "Confirmação por WhatsApp", "Relatório de ocupação"],
      tech: ["Automação", "WhatsApp API", "Google Calendar"],
    },
    {
      name: "Imobiliária Horizonte",
      category: "Landing Page",
      date: "2023",
      client: "Imobiliária regional",
      thumb: "linear-gradient(135deg,#38BDF8,#6D4AFF)",
      desc: "Vitrine digital de imóveis com filtros inteligentes e captação de leads qualificados para a equipe de corretores.",
      features: ["Vitrine de imóveis", "Filtros inteligentes", "Captação de leads", "Integração com CRM"],
      tech: ["HTML5", "CSS3", "JavaScript", "CRM"],
    },
  ];

  const portfolioGrid = document.getElementById("portfolioGrid");
  if (portfolioGrid){
    portfolioGrid.innerHTML = projects.map((p, i) => `
      <div class="portfolio-card reveal" style="--thumb:${p.thumb}; transition-delay:${i * 70}ms" data-index="${i}" role="button" tabindex="0" aria-label="Ver detalhes do projeto ${p.name}">
        <div class="thumb"></div>
        <div class="overlay">
          <h4>${p.name}</h4>
          <div>${p.tech.slice(0,3).map(t => `<span class="chip">${t}</span>`).join("")}</div>
        </div>
        <div class="infobar">
          <div class="meta"><small>${p.date} · ${p.category}</small><strong>${p.name}</strong></div>
          <span class="btn btn-primary">Ver Mais</span>
        </div>
      </div>
    `).join("");
    revealObserver && portfolioGrid.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
  }

  // Modal
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.id = "portfolioModal";
  modalOverlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-media" id="modalMedia">
        <button class="modal-close" id="modalClose" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <span class="eyebrow" id="modalCategory"></span>
        <h3 id="modalTitle"></h3>
        <div class="tags" id="modalTags"></div>
        <p id="modalDesc"></p>
        <div class="modal-meta">
          <div><small>Cliente</small><strong id="modalClient"></strong></div>
          <div><small>Categoria</small><strong id="modalCategory2"></strong></div>
          <div><small>Data</small><strong id="modalDate"></strong></div>
        </div>
        <div>
          <p style="margin-bottom:10px;font-weight:600;color:var(--text);">Funcionalidades</p>
          <ul id="modalFeatures" style="display:grid;gap:8px;"></ul>
        </div>
        <div class="modal-actions">
          <a href="https://wa.me/5579998416681" target="_blank" rel="noopener" class="btn btn-primary">Falar sobre este projeto</a>
          <button class="btn btn-ghost" id="modalCloseBtn">Fechar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  function openModal(index){
    const p = projects[index];
    if (!p) return;
    document.getElementById("modalMedia").style.background = p.thumb;
    document.getElementById("modalCategory").textContent = p.category;
    document.getElementById("modalTitle").textContent = p.name;
    document.getElementById("modalTags").innerHTML = p.tech.map(t => `<span class="chip">${t}</span>`).join("");
    document.getElementById("modalDesc").textContent = p.desc;
    document.getElementById("modalClient").textContent = p.client;
    document.getElementById("modalCategory2").textContent = p.category;
    document.getElementById("modalDate").textContent = p.date;
    document.getElementById("modalFeatures").innerHTML = p.features.map(f => `<li style="color:var(--text-secondary);">✓ ${f}</li>`).join("");
    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeModal(){
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  portfolioGrid?.addEventListener("click", (e) => {
    const card = e.target.closest(".portfolio-card");
    if (card) openModal(Number(card.dataset.index));
  });
  portfolioGrid?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " "){
      const card = e.target.closest(".portfolio-card");
      if (card){ e.preventDefault(); openModal(Number(card.dataset.index)); }
    }
  });
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ---------------------------------------------------------------------
     FAQ
     --------------------------------------------------------------------- */
  const faqs = [
    { q: "O que é o DKX?", a: "É o Diagnóstico Inteligente de Experiência Digital da SoulDK: um sistema que analisa como sua empresa se apresenta digitalmente e recomenda soluções personalizadas." },
    { q: "Como funciona?", a: "Você responde poucas perguntas rápidas sobre seu negócio. O DKX processa suas respostas e gera um diagnóstico com pontuações e oportunidades reais." },
    { q: "Quanto tempo leva?", a: "Poucos minutos. A experiência foi desenhada para ser rápida, fluida e objetiva, do início ao resultado." },
    { q: "Preciso trocar meu WhatsApp?", a: "Não. O Sistema Inteligente de Atendimento se integra ao número que sua empresa já utiliza." },
    { q: "As soluções são personalizadas?", a: "Sim. Cada recomendação parte do diagnóstico do seu negócio — nunca de um pacote genérico." },
  ];
  const faqList = document.getElementById("faqList");
  if (faqList){
    faqList.innerHTML = faqs.map((f, i) => `
      <div class="faq-item" data-index="${i}">
        <button class="faq-q" aria-expanded="false">
          <span>${f.q}</span><span class="plus"></span>
        </button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>
    `).join("");

    faqList.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-q");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-a");
      const isOpen = item.classList.contains("is-open");

      faqList.querySelectorAll(".faq-item.is-open").forEach(openItem => {
        if (openItem !== item){
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
          openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : null;
    });
  }

  /* ---------------------------------------------------------------------
     FLOATING BUTTON
     --------------------------------------------------------------------- */
  const fabWrap = document.getElementById("fabWrap");
  const fabMain = document.getElementById("fabMain");
  fabMain?.addEventListener("click", () => {
    const open = fabWrap.classList.toggle("is-open");
    fabMain.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (fabWrap.classList.contains("is-open") && !fabWrap.contains(e.target)){
      fabWrap.classList.remove("is-open");
      fabMain.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------------------------------------------------------------------
     BACK TO TOP
     --------------------------------------------------------------------- */
  document.getElementById("toTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------------------
     ANALYTICS HOOK (preparado para GA4 / GTM / Meta Pixel / Clarity)
     --------------------------------------------------------------------- */
  window.souldkTrack = function(eventName, params = {}){
    if (typeof window.gtag === "function") window.gtag("event", eventName, params);
    if (window.dataLayer) window.dataLayer.push({ event: eventName, ...params });
    if (typeof window.fbq === "function") window.fbq("trackCustom", eventName, params);
  };
  document.querySelectorAll("[data-analytics]").forEach(el => {
    el.addEventListener("click", () => window.souldkTrack(el.dataset.analytics));
  });
  document.querySelectorAll('a[href="dkx.html"]').forEach(el => {
    el.addEventListener("click", () => window.souldkTrack("cta_dkx_click"));
  });

  /* ---------------------------------------------------------------------
     FOOTER YEAR
     --------------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
