#!/usr/bin/env python3
"""
sinif-listesi-gom.py — e-Okul "Şube Mevcut Listesi" Excel dosyasını uygulamaya
ŞİFRELİ olarak gömer.

Çalıştırma:
    python3 tools/sinif-listesi-gom.py "~/Downloads/Şube_Mevcut_Listesi.xlsx"
    (şifre sorulur; SINIF_LISTESI_SIFRE ortam değişkeniyle de verilebilir)

Çıktı: src/data/classRoster.js

NEDEN ŞİFRELİ?
Uygulama herkese açık bir sitede yayınlanıyor ve kaynak kodu herkese açık bir
depoda duruyor. Öğrenci adları koda düz yazılsaydı siteyi açan herkes okuyabilirdi.
Liste bu yüzden öğretmen şifresiyle şifrelenir; tarayıcı şifre girilince çözer.

YÖNTEM (yalnızca Python standart kütüphanesi — ek kurulum gerekmez)
  anahtar  = PBKDF2-HMAC-SHA256(şifre, tuz, 250 000 tur) → 64 bayt
             ilk 32 bayt şifreleme, son 32 bayt doğrulama anahtarı
  şifreleme: HMAC-SHA256 sayaç kipi akış şifresi (anahtar akışı XOR veri)
  doğrulama: HMAC-SHA256(doğrulama anahtarı, tuz + nonce + şifreli veri)
Tarayıcı tarafı (src/services/RosterCrypto.js) aynısını WebCrypto ile yapar.
Yanlış şifrede doğrulama kodu tutmaz, veri hiç çözülmez.

KİMLİKLER
Sınıf ve öğrenci kimlikleri sayfa adından ve okul numarasından TÜRETİLİR.
Liste güncellenip araç yeniden çalıştırıldığında aynı öğrenci aynı kimliği
alır; bilgisayardaki maç kayıtları ona bağlı kalır, yalnızca yeni öğrenciler
eklenir. Okul numarasının kendisi dosyaya yazılmaz.
"""

import base64
import getpass
import hashlib
import hmac
import json
import os
import secrets
import sys

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl gerekli: pip3 install openpyxl")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(ROOT, "src", "data", "classRoster.js")
ITERATIONS = 250_000


def turkish_title(text):
    """'ALİ ALPERTUNGA ŞIK' → 'Ali Alpertunga Şık' (Türkçe İ/ı kurallarıyla)."""
    def lower(word):
        return word.replace("I", "ı").replace("İ", "i").lower()

    def upper_first(char):
        return {"i": "İ", "ı": "I"}.get(char, char.upper())

    words = " ".join(str(text).split()).split(" ")
    return " ".join(upper_first(lower(w)[0]) + lower(w)[1:] for w in words if w)


def short_id(prefix, *parts):
    digest = hashlib.sha256("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()
    return prefix + digest[:14]


def read_roster(path):
    workbook = openpyxl.load_workbook(path, data_only=True)
    classes = []
    for sheet in workbook.worksheets:
        # Sayfa adı "2_KERKÜK" biçimindedir → sınıf adı "2-Kerkük".
        grade, _, rest = sheet.title.partition("_")
        name = f"{grade}-{turkish_title(rest.replace('_', ' '))}" if rest else turkish_title(sheet.title)
        class_id = short_id("c", sheet.title)

        students = []
        for row in sheet.iter_rows(values_only=True):
            cells = [c for c in row if c is not None]
            # Öğrenci satırı: sıra no, okul no, ad, soyad
            if len(cells) >= 4 and isinstance(cells[0], (int, float)) and isinstance(cells[2], str):
                number, first, last = cells[1], cells[2], cells[3]
                students.append({
                    "id": short_id("s", sheet.title, number, first, last),
                    "name": turkish_title(f"{first} {last}")
                })
        classes.append({"id": class_id, "name": name, "students": students})
    return classes


def keystream(key, nonce, length):
    out = bytearray()
    counter = 0
    while len(out) < length:
        out += hmac.new(key, nonce + counter.to_bytes(4, "big"), hashlib.sha256).digest()
        counter += 1
    return bytes(out[:length])


def encrypt(plaintext, password):
    salt = secrets.token_bytes(16)
    nonce = secrets.token_bytes(16)
    keys = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS, dklen=64)
    enc_key, mac_key = keys[:32], keys[32:]
    cipher = bytes(a ^ b for a, b in zip(plaintext, keystream(enc_key, nonce, len(plaintext))))
    tag = hmac.new(mac_key, salt + nonce + cipher, hashlib.sha256).digest()
    b64 = lambda raw: base64.b64encode(raw).decode("ascii")
    return {"iterations": ITERATIONS, "salt": b64(salt), "nonce": b64(nonce), "data": b64(cipher), "tag": b64(tag)}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = os.path.expanduser(sys.argv[1])
    classes = read_roster(path)
    if not classes:
        sys.exit("Excel dosyasında sınıf bulunamadı.")

    password = os.environ.get("SINIF_LISTESI_SIFRE") or getpass.getpass("Öğretmen şifresi: ")
    if len(password) < 8:
        sys.exit("Şifre en az 8 karakter olmalı.")
    if "SINIF_LISTESI_SIFRE" not in os.environ and getpass.getpass("Şifre (tekrar): ") != password:
        sys.exit("Şifreler aynı değil.")

    plaintext = json.dumps({"classes": classes}, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    # Sürüm, listenin İÇERİĞİNDEN türetilir: liste değişmedikçe bilgisayarlar
    # "güncel liste var" uyarısı görmez.
    version = hashlib.sha256(plaintext).hexdigest()[:12]
    payload = {"version": version, **encrypt(plaintext, password)}

    with open(OUTPUT, "w", encoding="utf-8") as handle:
        handle.write(
            "/**\n"
            " * classRoster.js — Okulun sınıf listesi (ŞİFRELİ).\n"
            " *\n"
            " * Bu dosya tools/sinif-listesi-gom.py ile üretilir; elle düzenlenmez.\n"
            " * Öğrenci adları öğretmen şifresi olmadan okunamaz. Çözme ve sınıflara\n"
            " * ekleme: services/RosterCrypto.js + ClassroomService.applyRoster().\n"
            " */\n\n"
            f"export const CLASS_ROSTER = {json.dumps(payload, indent=2)};\n"
        )

    total = sum(len(c["students"]) for c in classes)
    print(f"✅ {len(classes)} sınıf, {total} öğrenci şifrelendi → {os.path.relpath(OUTPUT, ROOT)}")
    for item in classes:
        print(f"   {item['name']}: {len(item['students'])} öğrenci")


if __name__ == "__main__":
    main()
