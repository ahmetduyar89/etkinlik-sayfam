@echo off
REM ============================================================
REM   SAHANE SATRANC OKULU - Windows baslatici
REM   Hazirlayan: Ahmet DUYAR
REM
REM   KULLANIM: Bu dosyaya CIFT TIKLA. Tarayici kendiliginden acilir.
REM   Kapatmak icin acilan siyah pencereyi kapat.
REM
REM   NOT: Sadece gelistirme/tam surum icin gereklidir.
REM   Tek dosya surumunu (SatrancOkulu.html) kullaniyorsan buna GEREK YOK -
REM   o dosyaya dogrudan cift tiklayabilirsin.
REM ============================================================

chcp 65001 >nul
cd /d "%~dp0"

set PORT=8123

echo.
echo   SAHANE SATRANC OKULU
echo   ---------------------------------------
echo   Sunucu baslatiliyor...
echo.

REM Python var mi?
where python >nul 2>&1
if %errorlevel%==0 (
    set PY=python
    goto :found
)
where py >nul 2>&1
if %errorlevel%==0 (
    set PY=py
    goto :found
)

echo   [!] Python bulunamadi.
echo.
echo   COZUM: Bunun yerine SatrancOkulu.html dosyasina cift tikla.
echo   O dosya sunucu gerektirmez.
echo.
pause
exit /b 1

:found
echo   Adres: http://localhost:%PORT%
echo   Tarayici birazdan acilacak.
echo.
echo   KAPATMAK ICIN: bu pencereyi kapat ya da Ctrl+C bas.
echo.

start "" "http://localhost:%PORT%/index.html"
%PY% -m http.server %PORT%
