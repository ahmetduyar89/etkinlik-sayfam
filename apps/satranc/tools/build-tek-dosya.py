#!/usr/bin/env python3
"""
build-tek-dosya.py — Tüm uygulamayı TEK bir HTML dosyasına paketler (Python 3 sürümü).

Çalıştırma: python3 tools/build-tek-dosya.py
Çıktı:      SatrancOkulu.html (proje kök klasöründe)
"""

import base64
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRY = "src/app.js"
OUTPUT = os.path.join(ROOT, "SatrancOkulu.html")

def norm(path):
    rel = os.path.relpath(path, ROOT)
    return rel.replace("\\", "/")

modules = {}
order = []

IMPORT_RE = re.compile(r'^import\s*\{([^}]*)\}\s*from\s*["\']([^"\']+)["\'];?\s*$', re.MULTILINE)

def collect(abs_path, stack=None):
    if stack is None:
        stack = []
    key = norm(abs_path)
    if key in modules:
        return key

    if key in stack:
        raise ValueError(f"Döngüsel bağımlılık: {' → '.join(stack + [key])}")

    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            source = f.read()
    except Exception as e:
        raise ValueError(f"Modül bulunamadı: {key} ({e})")

    imports = []
    for m in IMPORT_RE.finditer(source):
        names = [n.strip() for n in m.group(1).split(",") if n.strip()]
        spec = m.group(2)
        target = os.path.normpath(os.path.join(os.path.dirname(abs_path), spec))
        imports.append({"names": names, "from": norm(target)})
        collect(target, stack + [key])

    modules[key] = {"source": source, "imports": imports}
    order.append(key)
    return key

collect(os.path.join(ROOT, ENTRY))

EXPORT_LIST_RE = re.compile(r'^export\s*\{([^}]*)\};?\s*$', re.MULTILINE)
EXPORT_DECL_RE = re.compile(r'^export\s+(async\s+function|function|const|let|var|class)\s+([A-Za-z0-9_$]+)', re.MULTILINE)

def transform(key, entry):
    body = entry["source"]
    exported = []

    def replace_import(m):
        name_list = m.group(1)
        spec = m.group(2)
        target = norm(os.path.normpath(os.path.join(os.path.dirname(os.path.join(ROOT, key)), spec)))
        names = ", ".join([n.strip() for n in name_list.split(",") if n.strip()])
        return f'const {{ {names} }} = __yukle("{target}");'

    body = IMPORT_RE.sub(replace_import, body)

    def replace_export_list(m):
        for n in m.group(1).split(","):
            item = n.strip()
            if item and item not in exported:
                exported.append(item)
        return ""

    body = EXPORT_LIST_RE.sub(replace_export_list, body)

    def replace_export_decl(m):
        kind = m.group(1)
        name = m.group(2)
        if name not in exported:
            exported.append(name)
        return f"{kind} {name}"

    body = EXPORT_DECL_RE.sub(replace_export_decl, body)

    leftover = re.search(r'^export\s+.*', body, re.MULTILINE)
    if leftover:
        raise ValueError(f"{key}: desteklenmeyen export biçimi → {leftover.group(0)[:60]}")

    bindings = "\n".join([
        f'  Object.defineProperty(__d, "{name}", {{ get: () => {name}, enumerable: true }});'
        for name in exported
    ])

    return f'"{key}": function (__d) {{\n{body}\n{bindings}\n}}'

factories = ",\n\n".join([transform(k, modules[k]) for k in order])

with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
    index_html = f.read()

css_files = [m.group(1) for m in re.finditer(r'<link rel="stylesheet" href="\./([^"]+)"', index_html)]

css_parts = []
for file in css_files:
    with open(os.path.join(ROOT, file), "r", encoding="utf-8") as f:
        css_parts.append(f"/* ===== {file} ===== */\n{f.read()}")
css = "\n\n".join(css_parts)

with open(os.path.join(ROOT, "src/assets/icons/app-icon.svg"), "rb") as f:
    icon_b64 = base64.b64encode(f.read()).decode("ascii")
icon_data = f"data:image/svg+xml;base64,{icon_b64}"

title_match = re.search(r'<title>([^<]*)</title>', index_html)
title = title_match.group(1) if title_match else "Satranç Eğitimi"

template = """<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#2f8f83">
<title>__TITLE__</title>
<link rel="icon" href="__ICON__" type="image/svg+xml">
<!--
  SATRANÇ EĞİTİMİ — TEK DOSYA SÜRÜMÜ
  Hazırlayan: Ahmet DUYAR

  Bu dosya kendi kendine yeter: internet, sunucu ve kurulum gerektirmez.
  USB belleğe kopyalayıp herhangi bir bilgisayarda ÇİFT TIKLAYARAK açabilirsin.

  Otomatik üretilmiştir (tools/build-tek-dosya.py). Elle düzenlemeyin;
  değişiklikleri src/ altında yapıp aracı yeniden çalıştırın.
  Üretim tarihi: __DATE__
-->
<style>
__CSS__
</style>
</head>
<body>
<div id="app" class="app-shell" aria-live="polite"></div>
<script>
(function () {
  "use strict";

  // Her modül, ilk istendiğinde çalıştırılıp önbelleğe alınır.
  var __fabrikalar = {
__FACTORIES__
  };

  var __onbellek = {};

  function __yukle(yol) {
    if (__onbellek[yol]) return __onbellek[yol];
    var fabrika = __fabrikalar[yol];
    if (!fabrika) throw new Error("Modül bulunamadı: " + yol);
    var disa = {};
    __onbellek[yol] = disa;   // döngüsel bağımlılıklarda sonsuz döngüyü önler
    fabrika(disa);
    return disa;
  }

  // Giriş noktasını çalıştır.
  __yukle("__ENTRY__");
})();
</script>
</body>
</html>
"""

output = (template
    .replace("__TITLE__", title)
    .replace("__ICON__", icon_data)
    .replace("__DATE__", date.today().isoformat())
    .replace("__CSS__", css)
    .replace("__FACTORIES__", factories)
    .replace("__ENTRY__", ENTRY)
)

with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(output)

size_kb = round(len(output.encode("utf-8")) / 1024)
print(f"✅ Tek dosya oluşturuldu: SatrancOkulu.html")
print(f"   {len(order)} JS modülü + {len(css_files)} CSS dosyası gömüldü")
print(f"   Boyut: {size_kb} KB")
print(f"   Sunucu, internet ve kurulum GEREKTİRMEZ — çift tıklayarak açılır.")
