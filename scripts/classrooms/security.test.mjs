import { readFile } from 'node:fs/promises';
import { test, before, after } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';
let env;
const now = new Date().toISOString();
const klass = { name: '7-A', grade_level: '7', school_year: '2026–2027', archived: false, activity_ids: [], include_grade_content: true, created_at: now };
const projectId = process.env.GCLOUD_PROJECT || 'demo-atolye';
before(async () => {
  env = await initializeTestEnvironment({ projectId, firestore: { rules: await readFile('firestore.rules','utf8'), host:'127.0.0.1', port:8080 }, storage: { rules: await readFile('storage.rules','utf8'), host:'127.0.0.1', port:9199 } });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await Promise.all([
      setDoc(doc(db,'users/admin'),{role:'admin',active:true}),
      setDoc(doc(db,'users/board'),{role:'board',active:true}),
      setDoc(doc(db,'users/disabled'),{role:'board',active:false}),
      setDoc(doc(db,'classrooms/a'),klass),
      setDoc(doc(db,'classrooms/b'),{...klass,name:'7-B'}),
      setDoc(doc(db,'classrooms/archived'),{...klass,archived:true}),
      setDoc(doc(db,'classrooms/a/notebooks/private'),{title:'Private',shared:false}),
      setDoc(doc(db,'classrooms/a/notebooks/shared'),{title:'Shared',shared:true}),
      setDoc(doc(db,'classrooms/a/notebook_content/private__c0'),{chunk:'PRIVATE'}),
      setDoc(doc(db,'classrooms/a/notebook_content/shared__c0'),{chunk:'SHARED'}),
      setDoc(doc(db,'notebooks/legacy'),{title:'Legacy'}),
    ]);
  });
});
after(async()=>env?.cleanup());
const db = uid => env.authenticatedContext(uid).firestore();
const submission = uid => ({ activity_id:'test',student_name:'Öğrenci',owner_uid:uid,answers:{},started_at:now,submitted_at:null,created_at:now });
test('only admin can create/archive classes and write library', async () => {
  await assertSucceeds(setDoc(doc(db('admin'),'classrooms/new'),klass));
  await assertFails(setDoc(doc(db('board'),'classrooms/denied'),klass));
  await assertFails(updateDoc(doc(db('board'),'classrooms/a'),{archived:true}));
  await assertSucceeds(setDoc(doc(db('admin'),'activities/test'),{title:'Test'}));
  await assertFails(setDoc(doc(db('board'),'activities/test'),{title:'Changed'}));
});
test('roles cannot be granted by clients, even an administrator', async () => {
  await assertFails(setDoc(doc(db('student'),'users/student'),{role:'admin',active:true}));
  await assertFails(updateDoc(doc(db('admin'),'users/board'),{role:'admin'}));
});
test('class and library work stay separated', async () => {
  await assertSucceeds(setDoc(doc(db('board'),'classrooms/a/notebooks/book'),{title:'Class A'}));
  await assertSucceeds(setDoc(doc(db('board'),'classrooms/b/notebooks/book'),{title:'Class B'}));
  const a = await assertSucceeds(getDoc(doc(db('admin'),'classrooms/a/notebooks/book')));
  const b = await assertSucceeds(getDoc(doc(db('admin'),'classrooms/b/notebooks/book')));
  if (a.data().title === b.data().title) throw new Error('Class scopes mixed');
  await assertFails(setDoc(doc(db('board'),'notebooks/book'),{title:'Library'}));
  await assertFails(getDoc(doc(db('disabled'),'classrooms/a/notebooks/book')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'classrooms/a/notebooks/book')));
});
test('board queries active classes, archive is admin-only', async () => {
  await assertSucceeds(getDocs(query(collection(db('board'),'classrooms'),where('archived','==',false))));
  await assertFails(getDocs(collection(db('board'),'classrooms')));
  await assertFails(setDoc(doc(db('board'),'classrooms/archived/notebooks/x'),{title:'No'}));
  await assertSucceeds(getDoc(doc(db('admin'),'classrooms/archived')));
});
test('shared notebook access is explicit, cannot enumerate or modify, and revokes chunks', async () => {
  const guest = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(guest,'classrooms/a/notebooks/shared')));
  await assertSucceeds(getDoc(doc(guest,'classrooms/a/notebook_content/shared__c0')));
  await assertFails(getDoc(doc(guest,'classrooms/a/notebook_content/private__c0')));
  await assertFails(getDocs(collection(guest,'classrooms/a/notebooks')));
  await assertFails(setDoc(doc(guest,'classrooms/a/notebook_content/shared__c0'),{chunk:'overwrite'}));
  await assertFails(getDoc(doc(guest,'notebooks/legacy')));
  await updateDoc(doc(db('admin'),'classrooms/a/notebooks/shared'),{shared:false});
  await assertFails(getDoc(doc(guest,'classrooms/a/notebook_content/shared__c0')));
});
test('student submissions bind to identity, class and immutable activity; cannot read classmates', async () => {
  const one = db('student1'), two = db('student2');
  await assertSucceeds(setDoc(doc(one,'classrooms/a/submissions/one'),submission('student1')));
  await assertFails(setDoc(doc(one,'classrooms/a/submissions/spoof'),submission('student2')));
  await assertFails(getDoc(doc(two,'classrooms/a/submissions/one')));
  await assertFails(getDocs(collection(one,'classrooms/a/submissions')));
  await assertFails(updateDoc(doc(two,'classrooms/a/submissions/one'),{answers:{q:'X'}}));
  await assertFails(updateDoc(doc(one,'classrooms/a/submissions/one'),{activity_id:'other'}));
  await assertSucceeds(updateDoc(doc(one,'classrooms/a/submissions/one'),{answers:{q:'B'},submitted_at:now}));
  await assertFails(updateDoc(doc(one,'classrooms/a/submissions/one'),{answers:{q:'C'}}));
  await assertSucceeds(getDoc(doc(db('admin'),'classrooms/a/submissions/one')));
  await assertFails(setDoc(doc(one,'classrooms/archived/submissions/one'),submission('student1')));
});
test('PDF upload requires staff; private PDFs cannot be downloaded by students', async () => {
  const payload = new Uint8Array([37,80,68,70]);
  const board = env.authenticatedContext('board').storage();
  const student = env.authenticatedContext('student1').storage();
  await assertSucceeds(uploadBytes(ref(board,'classrooms/a/pdfs/sample'),payload,{contentType:'application/pdf'}));
  await assertFails(uploadBytes(ref(student,'classrooms/a/pdfs/injected'),payload,{contentType:'application/pdf'}));
  await assertFails(uploadBytes(ref(board,'classrooms/a/pdfs/html'),payload,{contentType:'text/html'}));
  await assertFails(getBytes(ref(student,'classrooms/a/pdfs/sample')));
  await setDoc(doc(db('admin'),'classrooms/a/pdf_files/sample'),{shared:true});
  await assertSucceeds(getBytes(ref(student,'classrooms/a/pdfs/sample')));
  await updateDoc(doc(db('admin'),'classrooms/a/pdf_files/sample'),{shared:false});
  await assertFails(getBytes(ref(student,'classrooms/a/pdfs/sample')));
});
