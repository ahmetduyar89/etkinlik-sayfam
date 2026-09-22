import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, terminate } from 'firebase/firestore';
let env, api;
const out = resolve('node_modules/.tmp/classroom-persistence.mjs');
const page = value => [{ strokes: [{ id:'s1', tool:'pencil', color:'#000000', width:2, points:[{x:value,y:20},{x:value+10,y:30}] }], boxes:[] }];
before(async () => {
  globalThis.window = { location: { search:'?class=a' } };
  Object.defineProperty(globalThis.navigator, 'onLine', { value:true, configurable:true });
  env = await initializeTestEnvironment({projectId:'demo-atolye-persistence',firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')}});
  await env.clearFirestore();
  await mkdir('node_modules/.tmp',{recursive:true});
  await build({ stdin:{contents:"export * from './src/components/notebooks/notebookContent'; export { auth, db } from './src/lib/firebase'; export * from './src/lib/drafts';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:out,define:{'import.meta.env':JSON.stringify({DEV:true,VITE_USE_FIREBASE_EMULATORS:'true',VITE_FIREBASE_API_KEY:'demo-key',VITE_FIREBASE_PROJECT_ID:'demo-atolye-persistence',VITE_FIREBASE_STORAGE_BUCKET:'demo-atolye-persistence.appspot.com'})} });
  api = await import(pathToFileURL(out));
  const {user} = await signInAnonymously(api.auth);
  await env.withSecurityRulesDisabled(async ctx => {
    const seed = ctx.firestore();
    await setDoc(doc(seed,'users',user.uid),{role:'admin',active:true});
    await setDoc(doc(seed,'classrooms/a'),{name:'A',archived:false});
  });
});
after(async () => { if(api){await signOut(api.auth);await terminate(api.db);} await env?.cleanup(); await rm(out,{force:true}); });
test('page chunks save atomically, reload, and preserve independent classroom data', async () => {
  const saved = await api.saveNotebookPages('book',page(10));
  assert.equal(saved.rev,1);
  const loaded = await api.loadNotebookPages('book');
  assert.equal(loaded.pages[0].strokes[0].points[0].x,10);
  assert.equal((await getDoc(doc(api.db,'classrooms/a/notebooks/book'))).data().page_count,1);
  assert.equal((await getDoc(doc(api.db,'classrooms/b/notebooks/book'))).exists(),false);
  assert.equal((await getDoc(doc(api.db,'notebooks/book'))).exists(),false);
});
test('stale device cannot overwrite newer cloud revision', async () => {
  await api.saveNotebookPages('conflict',page(1));
  await api.saveNotebookPages('conflict',page(2),{baseRev:1});
  await assert.rejects(api.saveNotebookPages('conflict',page(3),{baseRev:1}),api.NotebookConflictError);
  assert.equal((await api.loadNotebookPages('conflict')).pages[0].strokes[0].points[0].x,2);
  // The rejected work is recoverable locally, without silently replacing cloud data.
  const draft = await api.loadNotebookPages('conflict',true);
  assert.equal(draft.isLocalDraft,true);
  assert.equal(draft.pages[0].strokes[0].points[0].x,3);
  await api.discardNotebookDraft('conflict');
  assert.equal((await api.loadNotebookPages('conflict',true)).pages[0].strokes[0].points[0].x,2);
});
test('offline snapshot survives reload and clears only after successful sync', async () => {
  Object.defineProperty(globalThis.navigator,'onLine',{value:false,configurable:true});
  await assert.rejects(api.saveNotebookPages('offline',page(42)),/İnternet yok/);
  const draft = await api.loadNotebookPages('offline',true);
  assert.equal(draft.isLocalDraft,true);
  assert.equal(draft.pages[0].strokes[0].points[0].x,42);
  Object.defineProperty(globalThis.navigator,'onLine',{value:true,configurable:true});
  await api.saveNotebookPages('offline',draft.pages,{baseRev:draft.rev});
  assert.equal(await api.readDraft('notebook:offline'),null);
  assert.equal((await api.loadNotebookPages('offline')).pages[0].strokes[0].points[0].x,42);
});
test('an earlier cloud completion cannot erase a newer local draft', async () => {
  const old = await api.writeDraft('race',{text:'old'});
  await api.writeDraft('race',{text:'new'});
  await api.clearDraft('race',old);
  assert.equal((await api.readDraft('race')).value.text,'new');
});
test('activity snapshots use class work metadata without creating a phantom notebook', async () => {
  await api.saveNotebookPages('activity-test',page(7),{localBackup:false,metadata:{collection:'activity_work',id:'test',fields:{title:'Test',completed:true,answers:{q:'A'}}}});
  assert.equal((await getDoc(doc(api.db,'classrooms/a/activity_work/test'))).data().completed,true);
  assert.equal((await getDoc(doc(api.db,'classrooms/a/notebooks/activity-test'))).exists(),false);
  assert.equal((await api.loadNotebookPages('activity-test')).pages[0].strokes[0].points[0].x,7);
});
