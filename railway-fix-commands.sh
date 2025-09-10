
# SCRIPT DE CORREÇÃO AUTOMÁTICA
# Execute estes comandos após o redeploy do Railway:

# 1. Testar backend
curl -X GET "https://sistema-zara-backend-production.up.railway.app/api/health"   -H "Content-Type: application/json"

# 2. Testar endpoint de quality-tests
curl -X GET "https://sistema-zara-backend-production.up.railway.app/api/quality-tests"   -H "Content-Type: application/json"   -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Verificar CORS
curl -X OPTIONS "https://sistema-zara-backend-production.up.railway.app/api/health"   -H "Origin: https://sistema-zara-frontend.vercel.app"   -H "Access-Control-Request-Method: GET"   -v

# 4. Testar frontend
echo "Acesse: https://sistema-zara-frontend.vercel.app"
echo "Verifique se não há mais erros de JSON no console"
