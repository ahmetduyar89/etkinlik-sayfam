#!/bin/bash
# ============================================================
#  SATRANÇ EĞİTİMİ — Mac başlatıcı
#  Hazırlayan: Ahmet DUYAR
#
#  KULLANIM: Bu dosyaya ÇİFT TIKLA. Tarayıcı kendiliğinden açılır.
#  Kapatmak için açılan siyah pencereyi kapat.
#
#  NOT: Sadece geliştirme/tam sürüm için gereklidir.
#  Tek dosya sürümünü (SatrancOkulu.html) kullanıyorsan buna GEREK YOK —
#  o dosyaya doğrudan çift tıklayabilirsin.
# ============================================================

# Betiğin bulunduğu klasöre geç (nereden çalıştırılırsa çalıştırılsın).
cd "$(dirname "$0")" || exit 1

PORT=8123

echo ""
echo "  ♞  SATRANÇ EĞİTİMİ"
echo "  ---------------------------------------"
echo "  Sunucu başlatılıyor..."
echo ""

# Python 3 var mı? macOS'ta genelde kuruludur.
if ! command -v python3 >/dev/null 2>&1; then
  echo "  ⚠️  Python 3 bulunamadı."
  echo ""
  echo "  ÇÖZÜM: Bunun yerine SatrancOkulu.html dosyasına çift tıkla."
  echo "  O dosya sunucu gerektirmez."
  echo ""
  read -r -p "  Kapatmak için Enter'a bas..."
  exit 1
fi

# Port doluysa bir sonrakini dene.
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo "  Adres: http://localhost:$PORT"
echo "  Tarayıcı birazdan açılacak."
echo ""
echo "  ⛔ KAPATMAK İÇİN: bu pencereyi kapat ya da Ctrl+C bas."
echo ""

# Sunucu hazır olunca tarayıcıyı aç.
( sleep 1; open "http://localhost:$PORT/index.html" ) &

python3 -m http.server $PORT
