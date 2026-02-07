# Guia de Deploy - App Montador Connect

## ⚠️ IMPORTANTE: Melhorias de Segurança Implementadas

Este projeto agora possui **melhorias de segurança críticas** que exigem configuração adicional:

- ✅ **SESSION_SECRET obrigatório** - A aplicação não inicia sem esta variável
- ✅ **Validação de senha forte** - Mínimo 8 caracteres, maiúscula, minúscula, número
- ✅ **Rate limiting** - Proteção contra ataques de força bruta (5 tentativas/15min)
- ✅ **Cookies seguros** - httpOnly e sameSite configurados

---

## 🔑 Variáveis de Ambiente Obrigatórias

| Variável         | Descrição                    | Obrigatório                 | Exemplo                                   |
| ---------------- | ---------------------------- | --------------------------- | ----------------------------------------- |
| `DATABASE_URL`   | String de conexão PostgreSQL | ✅ Sim                      | `postgresql://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | Chave secreta para sessões   | ✅ Sim                      | `sua-chave-aleatoria-min-32-chars`        |
| `PORT`           | Porta do servidor            | ❌ Não (padrão: 5000)       | `5000`                                    |
| `NODE_ENV`       | Ambiente                     | ❌ Não (padrão: production) | `production`                              |

### Como gerar SESSION_SECRET seguro

```bash
# Opção 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opção 2: OpenSSL
openssl rand -hex 32
```

---

## 🚀 Deploy Rápido

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (na VM):

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/appmontador
SESSION_SECRET=cole-aqui-a-chave-gerada-acima
NODE_ENV=production
PORT=5000
```

### 2. Verificar Configuração

Execute o script de verificação:

```bash
chmod +x scripts/verify-deploy.sh
./scripts/verify-deploy.sh
```

### 3. Aplicar Migrações do Banco

```bash
npm run db:push
```

Ou manualmente:

```bash
psql $DATABASE_URL -f migrations/0000_lumpy_joshua_kane.sql
```

### 4. Build e Deploy

```bash
# Build
npm run build

# Iniciar (escolha uma opção)

# Opção A: Direto
npm run start

# Opção B: PM2 (recomendado)
pm2 start dist/index.cjs --name appmontador
pm2 save
pm2 startup

# Opção C: systemd
sudo systemctl start appmontador
```

---

## 🐳 Deploy com Docker

### Dockerfile

O projeto inclui um `Dockerfile` otimizado com multi-stage build.

### Build da Imagem

```bash
docker build -t appmontador .
```

### Executar Container

```bash
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e SESSION_SECRET="sua-chave-secreta-aqui" \
  -e NODE_ENV="production" \
  --name appmontador \
  appmontador
```

### Com Docker Compose

Crie `docker-compose.yml`:

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/appmontador
      SESSION_SECRET: sua-chave-secreta-aqui
      NODE_ENV: production
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: appmontador
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Execute:

```bash
docker-compose up -d
```

---

## 🗄️ Banco de Dados

### Tabelas Criadas pela Migração

A migração `0000_lumpy_joshua_kane.sql` cria:

- `users` - Usuários e autenticação
- `profiles` - Perfis de montadores/empresas
- `companies` - Empresas/lojas
- `services` - Serviços de montagem
- `service_attachments` - Anexos de serviços
- `service_assignments` - Atribuições de montadores
- `reviews` - Avaliações
- `partnerships` - Parcerias
- `calendar_events` - Eventos do calendário
- `sessions` - Sessões de usuário

### Verificar Tabelas

```bash
psql $DATABASE_URL -c "\dt"
```

---

## 🔍 Troubleshooting

### Erro: "SESSION_SECRET must be defined"

**Causa:** Variável SESSION_SECRET não está definida no ambiente.

**Solução:**

```bash
export SESSION_SECRET="sua-chave-aqui"
# ou adicione ao .env
```

### Erro: "Cannot connect to database"

**Verificar:**

1. PostgreSQL está rodando: `sudo systemctl status postgresql`
2. DATABASE_URL está correto: `echo $DATABASE_URL`
3. Testar conexão: `psql $DATABASE_URL -c "SELECT 1"`

### Erro: "Port 5000 already in use"

**Solução:**

```bash
# Matar processo na porta
lsof -ti:5000 | xargs kill -9

# Ou usar outra porta
export PORT=3000
```

---

## 📋 Checklist de Deploy

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados criado
- [ ] SESSION_SECRET gerado e configurado
- [ ] DATABASE_URL configurado
- [ ] Migrações aplicadas (`npm run db:push`)
- [ ] Build executado (`npm run build`)
- [ ] Script de verificação executado (`./scripts/verify-deploy.sh`)
- [ ] Servidor iniciado e acessível
- [ ] Logs verificados (sem erros)

---

## 📚 Documentação Adicional

Para mais detalhes sobre configuração e deploy, consulte:

- `guia_deploy.md` - Guia completo de deploy
- `walkthrough.md` - Melhorias de segurança implementadas
- `analise_autenticacao.md` - Análise de segurança
