/**
 * RosterCrypto.js — Gömülü sınıf listesinin şifresini çözer.
 *
 * tools/sinif-listesi-gom.py'nin yaptığının tersidir (yöntem orada anlatılır):
 *   PBKDF2-HMAC-SHA256 → 32 bayt şifreleme + 32 bayt doğrulama anahtarı,
 *   HMAC-SHA256 sayaç kipi anahtar akışı, HMAC-SHA256 doğrulama kodu.
 *
 * Önce doğrulama kodu kontrol edilir: şifre yanlışsa veri hiç çözülmez ve
 * null döner. Tarayıcının WebCrypto'su kullanılır; https, localhost ve
 * dosyadan (file://) açılışta kullanılabilir.
 */

const bytes = (b64) => Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));

async function hmacKey(raw) {
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/**
 * @param {{iterations:number, salt:string, nonce:string, data:string, tag:string}} payload
 * @param {string} password
 * @returns {Promise<object|null>} Çözülmüş liste ya da şifre yanlışsa null.
 */
export async function decryptRoster(payload, password) {
  if (!globalThis.crypto?.subtle) throw new Error("Bu tarayıcıda şifre çözme desteklenmiyor.");

  const salt = bytes(payload.salt);
  const nonce = bytes(payload.nonce);
  const cipher = bytes(payload.data);
  const tag = bytes(payload.tag);

  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const keys = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: payload.iterations }, base, 512)
  );
  const encKey = await hmacKey(keys.slice(0, 32));
  const macKey = await hmacKey(keys.slice(32));

  const signed = new Uint8Array(salt.length + nonce.length + cipher.length);
  signed.set(salt, 0);
  signed.set(nonce, salt.length);
  signed.set(cipher, salt.length + nonce.length);
  if (!(await crypto.subtle.verify("HMAC", macKey, tag, signed))) return null;

  // Anahtar akışı: HMAC(şifreleme anahtarı, nonce + 4 baytlık sayaç) blokları.
  const plain = new Uint8Array(cipher.length);
  const block = new Uint8Array(nonce.length + 4);
  block.set(nonce, 0);
  for (let counter = 0; counter * 32 < cipher.length; counter += 1) {
    new DataView(block.buffer).setUint32(nonce.length, counter);
    const stream = new Uint8Array(await crypto.subtle.sign("HMAC", encKey, block));
    const start = counter * 32;
    for (let i = 0; i < 32 && start + i < cipher.length; i += 1) plain[start + i] = cipher[start + i] ^ stream[i];
  }

  return JSON.parse(new TextDecoder().decode(plain));
}
