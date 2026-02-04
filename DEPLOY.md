# Guia de Deploy - App Montador Connect

Este projeto foi containerizado para rodar em qualquer ambiente compatível com Docker, incluindo o Easypanel.

## 🐳 Dockerfile

O `Dockerfile` incluído na raiz (`Attachment-Reader/Dockerfile`) usa uma abordagem "multi-stage build" para criar uma imagem leve e segura:
1. **Builder Stage**: Compila o frontend (Vite) e o backend (Node/Express).
2. **Runtime Stage**: Apenas os arquivos compilados e dependências de produção.

## 🚀 Como fazer o Deploy no Easypanel

1. **Repositório**: Conecte seu repositório GitHub ao Easypanel.
2. **Build Path**: Se este arquivo está dentro de `Attachment-Reader`, defina o "Root Directory" do projeto no Easypanel como `/Attachment-Reader` (ou o caminho correto do seu repo).
3. **Variáveis de Ambiente**: Configure as variáveis abaixo na aba "Environment".

### 🔑 Variáveis de Ambiente Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | Chave secreta para assinar sessões | `uma-string-aleatoria-e-segura` |
| `PORT` | Porta do servidor (Opcional, padrão 5000) | `5000` |
| `NODE_ENV` | Ambiente (Opcional, padrão production) | `production` |

### ⚠️ Aviso Crítico sobre Autenticação (Replit Auth)

Atualmente, o código do servidor (`server/replit_integrations/auth`) está configurado exclusivamente para usar a autenticação do **Replit**.

Para que o login funcione fora do Replit, você tem duas opções:

1. **Opção A (Difícil):** Configurar as variáveis do Replit Auth se você tiver acesso às credenciais OIDC do seu Repl.
   - `REPL_ID`
   - `ISSUER_URL` (ex: `https://replit.com/oidc`)

2. **Opção B (Recomendada):** Refatorar o sistema de autenticação para usar **Email/Senha** ou **Google OAuth** padrão.
   - Isso envolve:
     - Adicionar campo `password` na tabela `users` (`shared/models/auth.ts`).
     - Criar rotas de `/register` e `/login` em `server/auth.ts`.
     - Substituir o uso de `replitAuth` por `passport-local`.

**Se você fizer o deploy agora sem alterar o código de autenticação, o botão de Login provavelmente falhará ou redirecionará para uma página de erro do Replit.**

## 🛠 Comandos Úteis

Para testar localmente com Docker:

```bash
# Construir a imagem
docker build -t app-montador .

# Rodar o container (precisa de um banco rodando)
docker run -p 5000:5000 -e DATABASE_URL="postgresql://..." -e SESSION_SECRET="segredo" app-montador
```
