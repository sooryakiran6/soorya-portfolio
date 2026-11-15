@echo off
title Soorya Kiran Portfolio - Local Server
echo ========================================================
echo   Starting Soorya Kiran Portfolio Local Server...
echo ========================================================
echo.
echo Launching portfolio at http://localhost:8000 ...
echo Press Ctrl+C in this window anytime to stop the server.
echo.
start http://localhost:8000
python -m http.server 8000
pause
