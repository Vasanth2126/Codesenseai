@echo off
title CodeSense AI - Fine-Tuned Model Inference Server
echo ===================================================
echo   CodeSense AI - Fine-Tuned Model Inference Server
echo ===================================================
echo.
cd /d "%~dp0codesense-ai\ai-service"

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at codesense-ai\ai-service\venv
    pause
    exit /b 1
)

echo Loading fine-tuned Qwen2.5-Coder model with GPU acceleration...
echo Service endpoint will be: http://127.0.0.1:8000/generate
echo.
echo For Local Development:
echo   Set CODESENSE_AI_URL=http://127.0.0.1:8000/generate in server/.env
echo.
echo For Render / Vercel Cloud Deployment:
echo   Run start_tunnel.bat in another terminal to expose this local GPU to the web!
echo ===================================================
echo.

venv\Scripts\python.exe main.py
pause
