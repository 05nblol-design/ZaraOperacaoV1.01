@echo off
echo 🚀 Fazendo commit das correções...
git add .
git status
echo.
echo Commit message: "fix: corrigir URLs Railway e erro acc is not defined"
git commit -m "fix: corrigir URLs Railway e erro acc is not defined"
echo.
echo 📤 Fazendo push...
git push origin main
echo.
echo ✅ Deploy automático iniciado no Vercel!
echo 🔗 Verifique: https://vercel.com/dashboard
pause
