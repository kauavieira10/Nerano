# Deploy no Render (passo a passo)

> Tempo estimado: ~5 minutos. Plano free serve.

## 1. Suba o código no GitHub
```bash
git init
git add .
git commit -m "dashboard NERANO"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nerano-dashboard.git
git push -u origin main
```
> O `.gitignore` já impede o envio do `.env` e do `node_modules`.

## 2. Crie o Web Service no Render
1. Acesse https://dashboard.render.com → **New + → Web Service**.
2. Conecte o repositório do GitHub.
3. Configurações:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

   (Se preferir, o Render lê o `render.yaml` automaticamente — basta usar
   **New + → Blueprint**.)

## 3. Configure as variáveis de ambiente
No painel do serviço → **Environment** → **Add Environment Variable**:

| Key | Value |
|---|---|
| `GOOGLE_SHEETS_API_KEY` | sua chave secreta |
| `GOOGLE_SHEETS_ID` | `1MKzxzXYvaSttMp0DmZyk4b4FR-uvsnvVWX69j0MdjBM` |
| `GOOGLE_SHEETS_NAME` | `Diário Performance` |
| `GOOGLE_SHEETS_RANGE` | `A1:Z200` |

Salve → o Render faz o redeploy sozinho.

## 4. Deixe a planilha acessível
A API Key só lê planilhas **compartilhadas**. Na planilha:
**Compartilhar → Acesso geral → “Qualquer pessoa com o link” → Leitor.**

## 5. Teste
Abra a URL do Render. No Console (F12) você deve ver:
```
[Sheets] ✓ N linhas carregadas
[App] ✓ Dashboard pronto · N dias (live)
```
A tag no topo muda de “modo demo” para **“online”**.

---

## Alternativa: Netlify
1. **Add new site → Import from Git.**
2. Build settings: deixe o **Publish directory** como `.`
   (o `netlify.toml` já aponta as functions e o redirect `/api/sheets`).
3. **Site settings → Environment variables:** adicione as 4 variáveis acima.
4. Deploy.

## Problemas comuns
- **Fica em “modo demo”** → veja o Console. Erro 403 do Google = planilha não
  compartilhada ou chave sem permissão. 400 = nome da aba/range errado.
- **Colunas zeradas** → confira `[Sheets] colunas detectadas` e ajuste
  `CONFIG.COLUMNS` em `js/config.js`.
