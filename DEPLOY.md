# Guia de Deploy - forschen (Vercel)

Este projeto é um site **estático** (HTML + CSS + vídeos/imagens), já conectado ao
GitHub (`Brakister/forschen`) e vinculado ao Vercel.

---

## Pré-requisitos

- Conta no [Vercel](https://vercel.com) (login com o GitHub).
- Repositório no GitHub (este já existe e é o `Brakister/forschen`).
- `git` instalado (para os comandos abaixo).

---

## 1º deploy (primeira vez)

> Já existe uma pasta `.vercel` no projeto, então o projeto **já foi vinculado** ao Vercel.
> Se algo der errado, refaça os passos abaixo.

1. Garanta que o site esteja commitado e enviado ao GitHub:
   ```bash
   git add .
   git commit -m "mensagem"
   git push origin main
   ```

2. No site do Vercel, clique em **Add New → Project**.
3. Importe o repositório `Brakister/forschen`.
4. O framework será detectado como **Other** (site estático).
5. Não precisa de build command (`npm run build`) nem output directory — é um site
   estático puro. Deixe vazio.
6. Clique em **Deploy**.
7. Se preferir automaticamente a partir do GitHub: vá em **Settings → Git → Deploy Hooks**,
   ou deixe o padrão que já deploya automaticamente a cada `push` no `main`.

Pronto! O Vercel gera um domínio parecido com `forschen.vercel.app`.

Caso ainda não esteja vinculado localmente, use o CLI:
```bash
vercel
```
E siga o assistente (linka com sua conta e projeto).

---

## 2. Como fazer alterações futuras (fluxo normal)

O deploy é **automático**: toda vez que você enviar alterações para a branch `main`,
o Vercel publica a nova versão sozinho.

### ⚠️ Opção rápida (recomendada): deploy direto via CLI

> Usar `git push` gera **2 deploys** (um do push pro GitHub + outro que você fizer depois).
> Se você quer publicar **só uma vez**, direto pro ar, use o CLI:

```bash
# Salva as alterações (commit)
git add .
git commit -m "Ex.: Ajusta cores da landing page"
git push origin main   # opcional, mas mantém o GitHub atualizado

# Publica direto em produção (1 deploy só)
vercel --prod --yes
```

Depois de rodar, o Vercel mostra algo tipo:

```
Production   https://forschen-mlas5og54-brakisters-projects.vercel.app
Aliased      https://forschen.vercel.app   ← esse é o domínio que fica no ar
```

O `--yes` responde "sim" aos avisos automaticamente. Sem ele, o CLI pergunta
confirmação antes de subir.

### Passo a passo diário

```bash
# 1) Ver o que mudou
git status

# 2) Adicionar os arquivos alterados
git add .

# 3) Criar um commit com uma mensagem explicando a mudança
git commit -m "Ex.: Ajusta cores da landing page"

# 4) Enviar para o GitHub (dispara o deploy no Vercel)
git push origin main
```

Aguarde 1–2 minutos. Acompanhe o status em
`https://vercel.com/dashboard` (aba **Deployments**) do projeto `forschen`.

### Regras de bom uso

- Sempre `git status` antes de commitar, para confirmar que só vai subir o que você quer.
- Coloque mensagens de commit claras, em português, descrevendo a mudança.
- Se mudar vídeos/imagens pesados, verifique antes se eles são necessários (cada MB conta).
- Se você quebrar algo, dá pra voltar: no Vercel, em **Deployments**, escolha uma versão
  anterior e clique em **Promote to Production**.

---

## 3. Estrutura do projeto (resumo)

- `index.html` — a página principal.
- `styles.css` — todos os estilos.
- `*.mp4 / *.webm / *.mov` — vídeos de fundo.
- `*.png / *.svg` — imagens (logo, favicon, cursores).
- `vercel.json` — config do Vercel (headers de segurança + cache dos vídeos).
- `robots.txt` — acessos a robôs de busca.
- `README.md` — descrição do projeto.

---

## 4. Dicas rápidas

| Quero...                                      | Faça isso                                         |
|-----------------------------------------------|---------------------------------------------------|
| Ver o deploy | `https://vercel.com/dashboard` → projeto `forschen` |
| Vai pôr alteração no ar (sem deploy duplo) | `vercel --prod --yes` |
| Vai pôr alteração no ar pelo git (faz 2 deploys) | `git add . && git commit -m "..." && git push origin main` |
| Dar um domínio próprio (ex.: www.meudominio.com.br) | Vercel → projeto → **Settings → Domains** → adicionar seu domínio |
| Ver preview de um branch (sem publicar)        | Crie uma branch nova, commit e push nela; o Vercel gera uma URL de preview |