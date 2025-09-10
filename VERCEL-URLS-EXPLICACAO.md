# URLs do Vercel - Qual Usar?

## Situação Atual

O sistema possui duas URLs no Vercel:

### 1. URL Principal (RECOMENDADA) ✅
```
https://sistema-zara-frontend.vercel.app
```
- **Status**: Funcionando corretamente (200 OK)
- **Acesso**: Público e direto
- **Conteúdo**: Aplicação React completa
- **Uso**: Esta é a URL principal que deve ser usada

### 2. URL com Sufixo Específico ❌
```
https://sistema-zara-frontend-kg85kov5j-05nblol-designs-projects.vercel.app
```
- **Status**: Redirecionando para autenticação Vercel
- **Acesso**: Requer autenticação
- **Problema**: Não é acessível publicamente
- **Uso**: NÃO usar - é uma URL de deploy específico

## Recomendação

**USE SEMPRE**: `https://sistema-zara-frontend.vercel.app`

### Motivos:
1. É a URL de produção oficial
2. Funciona sem autenticação
3. É mais limpa e profissional
4. Está configurada corretamente no Vercel

### A URL com sufixo é:
- Uma URL de deploy específico (preview)
- Gerada automaticamente pelo Vercel
- Não destinada ao uso público
- Pode expirar ou ser removida

## Configuração Atual

O sistema está configurado para usar a URL principal:
- **Frontend**: `https://sistema-zara-frontend.vercel.app`
- **Backend**: `https://zara-backend-production-aab3.up.railway.app`

## Próximos Passos

1. **Usar sempre**: `https://sistema-zara-frontend.vercel.app`
2. **Atualizar CORS**: Garantir que o backend aceita esta URL
3. **Testar funcionalidades**: Login, dashboard, etc.
4. **Documentar**: Usar apenas a URL principal em documentações

---

**CONCLUSÃO**: Use `https://sistema-zara-frontend.vercel.app` como URL oficial do sistema.