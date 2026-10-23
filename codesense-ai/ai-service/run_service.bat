@echo off
title CodeSense AI - Fine-Tuned Model Inference Server
echo ===================================================
echo   CodeSense AI - Fine-Tuned Model Inference Server
echo ===================================================
echo.
cd /d "%~dp0"

venv\Scripts\python.exe main.py
pause
