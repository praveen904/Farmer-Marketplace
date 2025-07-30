@echo off
echo 🚀 Farmer's Marketplace - Quick Deploy Setup
echo.

echo 📋 Checking project status...
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json missing
    pause
    exit /b 1
)

if exist "client\build" (
    echo ✅ Client build found
) else (
    echo ❌ Client build missing - building now...
    cd client
    call npm run build
    cd ..
)

echo.
echo 🎉 Project is ready for deployment!
echo.
echo 📋 Next Steps:
echo 1. Create GitHub repository
echo 2. Push your code to GitHub
echo 3. Go to https://railway.app
echo 4. Deploy from GitHub repository
echo 5. Set environment variables
echo.
echo 🌐 Your app will be live at: https://your-project-name.railway.app
echo.
pause 