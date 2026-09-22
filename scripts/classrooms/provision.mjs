// Trusted one-time setup. Never put service-account keys in the repository.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
const { values } = parseArgs({ options: {
  project: { type: 'string' }, 'admin-email': { type: 'string', default: 'ahmetduyar89@gmail.com' },
  'board-email': { type: 'string' }, emulator: { type: 'boolean', default: false },
} });
if (!values.project) throw new Error('--project zorunlu. Canlı projeyi açıkça belirtin.');
if (values.emulator) {
  if (!values.project.startsWith('demo-')) throw new Error('Emülatör için demo- ile başlayan proje kullanın.');
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
} else if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('Canlı kurulumda emülatör ortam değişkenleri bulunmamalı.');
}
initializeApp({ projectId: values.project, ...(values.emulator ? {} : { credential: applicationDefault() }) });
const auth = getAuth(); const db = getFirestore();
const links = [];
async function account(email, role) {
  let user;
  try { user = await auth.getUserByEmail(email); }
  catch (e) { if (e.code !== 'auth/user-not-found') throw e; user = await auth.createUser({ email, password: randomBytes(32).toString('base64url') }); }
  const existing = await db.doc(`users/${user.uid}`).get();
  if (existing.exists && existing.data().role !== role) throw new Error(`${email} farklı bir role sahip; otomatik değiştirilmedi.`);
  await db.doc(`users/${user.uid}`).set({ role, active: true, email }, { merge: true });
  if (values.emulator) {
    await auth.updateUser(user.uid, { password: 'Local-test-2026!' });
  } else {
    links.push(`${role}: ${email}\n${await auth.generatePasswordResetLink(email)}\n`);
  }
  console.log(`${role} hesabı hazır: ${email}`);
}
await account(values['admin-email'], 'admin');
if (values['board-email']) await account(values['board-email'], 'board');
const now = new Date(); const y = now.getFullYear() - (now.getMonth() < 7 ? 1 : 0); const year = `${y}–${y+1}`;
for (const grade of ['5','6','7','8','9','10','11','12']) {
  const ref = db.doc(`classrooms/grade-${grade}-${y}-${y+1}`);
  await db.runTransaction(async tx => {
    if ((await tx.get(ref)).exists) return;
    tx.create(ref, { name: `${grade}. Sınıf`, grade_level: grade, school_year: year, archived: false, activity_ids: [], include_grade_content: true, created_at: now.toISOString() });
  });
}
if (links.length) {
  const file = `/tmp/atolye-account-setup-${Date.now()}.txt`;
  await writeFile(file, links.join('\n'), { mode: 0o600 });
  console.log(`Şifre belirleme bağlantıları yalnızca bu bilgisayardaki dosyaya yazıldı: ${file}`);
  console.log('Bu bağlantılar e-postayla gönderilmedi. Şifreleri belirledikten sonra dosyayı silin.');
}
console.log('5–12. sınıflar hazır. Var olan sınıflar ve çalışmalar korunmuştur.');
