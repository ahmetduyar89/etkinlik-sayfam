import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
initializeApp({ projectId: 'demo-atolye' });
await getFirestore().doc('activities/demo-test').set({
 title:'Kayıt doğrulama etkinliği', grade_level:'7', subject:'Fen Bilimleri', unit:'Yerel doğrulama', is_test:true,
 description:'Yalnızca yerel emülatörde kullanılan test içeriği.',
 html_code:'<main style="font:20px system-ui;padding:40px"><h1>Sınıf çalışması</h1><p>Dünya hangi sistemdedir?</p><button onclick="parent.postMessage({type:\'SIM_ANSWER\',data:{Soru1:\'Güneş Sistemi\'}},\'*\');this.textContent=\'Yanıt seçildi\'">Güneş Sistemi</button></main>',
 created_at:new Date().toISOString(),
});
console.log('Yerel doğrulama etkinliği hazır.');
