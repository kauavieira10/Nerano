# Dashboard de Performance · NERANO

Dashboard de marketing digital com visual glassmorphism (estilo Apple/iOS),
integrado ao **Google Sheets** via proxy de backend. Frontend em HTML/CSS/JS
puro + Chart.js; backend em Node nativo (sem Express).

## Estrutura

```
.
├── index.html              # estrutura visual
├── assets/                 # logos (acesso = esquerda, NERANO = direita)
├── css/
│   ├── variables.css       # tokens + temas claro/escuro
│   ├── base.css            # reset + blobs animados do fundo
│   ├── components.css      # header, toolbar, KPIs, cards
│   └── dashboard.css       # hero, plataformas, criativos, calendário, toast
├── js/
│   ├── config.js           # ⚙️ metas + mapeamento de colunas (EDITE AQUI)
│   ├── utils.js            # formatadores e parsers
│   ├── sheets.js           # cliente do proxy + leitura tolerante da planilha
│   └── app.js              # estado, render, gráficos, calendário, boot
├── data/dataset.js         # dataset demo (fallback se a API falhar)
├── server.js               # proxy Node para Render
├── netlify/functions/      # proxy equivalente para Netlify
├── netlify.toml · render.yaml · package.json · .env.example
```

## Rodar localmente

```bash
npm install            # (não há dependências; só prepara o ambiente)
cp .env.example .env   # preencha GOOGLE_SHEETS_API_KEY etc.
node server.js         # abre em http://localhost:3000
```

Sem `.env`, o dashboard roda com o **dataset demo** e mostra a tag “modo demo”.
Com as variáveis corretas, lê a planilha real e mostra “online”.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `GOOGLE_SHEETS_API_KEY` | Chave da API do Google Cloud (**secreta**) |
| `GOOGLE_SHEETS_ID` | ID da planilha (da URL) |
| `GOOGLE_SHEETS_NAME` | Nome da aba (ex.: `Diário Performance`) |
| `GOOGLE_SHEETS_RANGE` | Intervalo (ex.: `A1:Z200`) |

## Mapeamento de colunas

O `js/sheets.js` detecta as colunas **pelo cabeçalho** (ignora acentos e
maiúsculas). Reconhece variações como “Verba Google”, “Investimento Google”,
“Leads Facebook”, “Verba Meta”, etc.

Se sua planilha usa nomes diferentes, ajuste `CONFIG.COLUMNS` em `js/config.js`:

```js
COLUMNS: {
  data:          'auto',  // ou índice (0=A,1=B...) ou nome exato do cabeçalho
  verbaGoogle:   'auto',
  leadsGoogle:   'auto',
  verbaFacebook: 'auto',
  leadsFacebook: 'auto'
}
```

Abra o Console do navegador (F12) — a linha `[Sheets] colunas detectadas: …`
mostra exatamente o que foi mapeado.

## Segurança

A API Key **nunca** vai no frontend: fica só nas variáveis de ambiente do
servidor. Restrinja a chave no Google Cloud (somente Google Sheets API) e,
de preferência, por referer/IP.
