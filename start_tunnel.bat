@echo off
title CodeSense AI - Cloudflare GPU Tunnel
echo ===================================================
echo   CodeSense AI - Cloudflare GPU Tunnel to Render
echo ===================================================
echo.
cd /d "%~dp0"

if not exist "cloudflared.exe" (
    echo [ERROR] cloudflared.exe not found in %~dp0
    pause
    exit /b 1
)

echo Starting Cloudflare Tunnel to local port 8000...
echo.
echo Look for a URL like: https://xxxx-xxxx.trycloudflare.com
echo.
echo Copy that URL and append /generate:
echo   Example: https://xxxx-xxxx.trycloudflare.com/generate
echo.
echo Paste it into your Render Web Service Environment Variables:
echo   Key:   CODESENSE_AI_URL
echo   Value: https://xxxx-xxxx.trycloudflare.com/generate
echo ===================================================
echo.

cloudflared.exe tunnel --url http://127.0.0.1:8000
pause
