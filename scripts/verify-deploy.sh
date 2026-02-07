#!/bin/bash

# Script de verificação de ambiente para deploy
# Execute este script na sua VM antes de fazer deploy

echo "🔍 Verificando configuração de ambiente..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
PROBLEMS=0

# 1. Verificar SESSION_SECRET
echo "1️⃣  Verificando SESSION_SECRET..."
if [ -z "$SESSION_SECRET" ]; then
    echo -e "${RED}❌ SESSION_SECRET não está definido${NC}"
    echo "   Solução: export SESSION_SECRET=\"sua-chave-secreta-aqui\""
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ SESSION_SECRET está definido${NC}"
    echo "   Tamanho: ${#SESSION_SECRET} caracteres"
    if [ ${#SESSION_SECRET} -lt 32 ]; then
        echo -e "${YELLOW}⚠️  Recomendado: mínimo 32 caracteres${NC}"
    fi
fi
echo ""

# 2. Verificar DATABASE_URL
echo "2️⃣  Verificando DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL não está definido${NC}"
    echo "   Solução: export DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\""
    PROBLEMS=$((PROBLEMS + 1))
else
    echo -e "${GREEN}✅ DATABASE_URL está definido${NC}"
fi
echo ""

# 3. Verificar PostgreSQL
echo "3️⃣  Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ psql está instalado${NC}"
    
    # Tentar conectar ao banco
    if [ ! -z "$DATABASE_URL" ]; then
        if psql "$DATABASE_URL" -c "SELECT version();" &> /dev/null; then
            echo -e "${GREEN}✅ Conexão com banco de dados OK${NC}"
        else
            echo -e "${RED}❌ Não foi possível conectar ao banco${NC}"
            PROBLEMS=$((PROBLEMS + 1))
        fi
    fi
else
    echo -e "${RED}❌ PostgreSQL não está instalado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 4. Verificar Node.js
echo "4️⃣  Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 5. Verificar npm
echo "5️⃣  Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não está instalado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 6. Verificar build
echo "6️⃣  Verificando build..."
if [ -f "dist/index.cjs" ]; then
    echo -e "${GREEN}✅ Build encontrado (dist/index.cjs)${NC}"
    BUILD_SIZE=$(du -h dist/index.cjs | cut -f1)
    echo "   Tamanho: $BUILD_SIZE"
else
    echo -e "${YELLOW}⚠️  Build não encontrado${NC}"
    echo "   Execute: npm run build"
fi
echo ""

# 7. Verificar porta
echo "7️⃣  Verificando porta..."
PORT=${PORT:-5000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Porta $PORT já está em uso${NC}"
    echo "   Processo: $(lsof -Pi :$PORT -sTCP:LISTEN | tail -n 1)"
else
    echo -e "${GREEN}✅ Porta $PORT está disponível${NC}"
fi
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $PROBLEMS -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo OK! Pronto para deploy${NC}"
    echo ""
    echo "Para iniciar o servidor:"
    echo "  npm run start"
    echo ""
    echo "Ou com PM2:"
    echo "  pm2 start dist/index.cjs --name appmontador"
else
    echo -e "${RED}❌ Encontrados $PROBLEMS problema(s)${NC}"
    echo "Corrija os problemas acima antes de fazer deploy"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
