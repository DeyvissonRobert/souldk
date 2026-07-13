# SoulDK — Website Institucional v3

Site institucional completo da SoulDK: HTML5 + CSS3 + JavaScript puro (sem frameworks, sem build step). Basta abrir `index.html` no navegador ou hospedar a pasta em qualquer servidor estático.

## Estrutura de arquivos

```
souldk/
├── index.html          → Site institucional (Hero, DKX, Soluções, Metodologia, Antes x Depois, Segmentos, Portfólio, FAQ, CTA, Footer)
├── dkx.html             → Experiência exclusiva do DKX (diagnóstico interativo)
├── manifest.json         → Metadados PWA / ícones
├── robots.txt             → Diretivas para buscadores
├── sitemap.xml            → Mapa do site para SEO
├── css/
│   ├── styles.css        → Design System (cores, tipografia, espaçamento, componentes) + layout do site
│   └── dkx.css            → Estilos específicos da experiência DKX
├── js/
│   ├── main.js             → Interatividade do site (tema, navbar, reveal, modal, FAQ, dados de portfólio/segmentos)
│   └── dkx.js               → Lógica completa do fluxo DKX (perguntas, pontuação, resultado, envio ao WhatsApp)
└── assets/
    ├── logo.png             → Logo SoulDK (ícone)
    └── og-image.png          → Imagem para compartilhamento (Open Graph)
```

## Como usar

1. Extraia o `.zip` em uma pasta.
2. Abra `index.html` diretamente no navegador para visualizar localmente, **ou**
3. Faça upload da pasta inteira para qualquer hospedagem estática (Vercel, Netlify, Hostinger, cPanel, GitHub Pages etc). Não há dependência de backend.

> As fontes (Plus Jakarta Sans) e os ícones (Lucide, via inline SVG) carregam via CDN — é necessário acesso à internet para o carregamento completo da tipografia. O site funciona normalmente offline, apenas com a fonte de fallback do sistema.

## Já configurado com os dados da SoulDK

- **WhatsApp:** `+55 79 99841-6681` (usado no botão flutuante, footer e no envio automático do diagnóstico DKX)
- **Instagram:** [@souldk.24h](https://www.instagram.com/souldk.24h/)
- **Paleta de cores, tipografia e identidade visual:** extraídas da imagem de brand guideline enviada (`#6D4AFF`, `#3B82F6`, `#00E5FF`, `#0F172A`)
- **Logo:** aplicada na navbar, footer, favicon, manifest e dentro da experiência DKX

## O que você pode querer personalizar

| Item | Onde editar |
|---|---|
| E-mail de contato (`contato@souldk.com.br` é um placeholder) | `index.html` (footer e floating button) |
| Projetos do portfólio | array `projects` em `js/main.js` |
| Perguntas/pontuação do DKX | array `questions` em `js/dkx.js` |
| Textos e headline do Hero | seção `<section class="hero">` em `index.html` |
| URL final do site (usada em canonical/sitemap/schema) | `index.html`, `sitemap.xml`, `robots.txt` |
| Analytics (GA4 / GTM / Meta Pixel / Clarity) | adicionar os scripts oficiais antes de `</head>`; os eventos já disparam via `window.souldkTrack()` |

## Destaques técnicos

- **Design System** com tokens de cor, tipografia, espaçamento (múltiplos de 8), raio e sombra, com suporte a tema Dark (padrão) e Light, com preferência salva em `localStorage` e transição suave.
- **Experiência DKX dedicada** (`dkx.html`): tela de inicialização, barra de progresso por etapa, perguntas de resposta única com avanço automático, tela de análise, painel de resultado com barras animadas, código exclusivo gerado (`DKX-XXXXXX`), diagnóstico dinâmico conforme as respostas e envio automático para o WhatsApp da SoulDK com o resultado formatado.
- **Animações com propósito**, sempre em `transform`/`opacity`/`filter` (GPU-friendly): scroll reveal, timeline animada por scroll, parallax de mouse no Hero (desktop), glow no cursor (desktop), micro-interações em botões e cards.
- **Acessibilidade:** navegação por teclado, foco visível, `aria-label`/`aria-expanded`, respeito a `prefers-reduced-motion`, skip link.
- **SEO:** meta tags completas, Open Graph, Twitter Card, JSON-LD (Schema.org Organization), sitemap, robots, hierarquia de headings única por página.
- **Performance:** CSS/JS sem dependências pesadas, lazy nas animações via `IntersectionObserver`, fontes com `font-display: swap`.

## Próximos passos sugeridos

- Substituir os projetos de exemplo do portfólio pelos projetos reais da SoulDK (imagens, links de site/repositório).
- Confirmar o e-mail oficial de contato.
- Conectar Google Analytics / Meta Pixel / Microsoft Clarity (os hooks de evento já estão prontos).
- Gerar as versões `.webp`/`.avif` das imagens reais de portfólio quando estiverem disponíveis.
