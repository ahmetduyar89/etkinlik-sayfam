class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
const { createLearningHandlers } = require('./learning');
function setup() {
  const records = new Map(); let sequence = 0;
  const doc = (name, id = `auto${++sequence}`) => ({ id, key: `${name}/${id}`,
    get: async () => ({ exists: records.has(`${name}/${id}`), data: () => structuredClone(records.get(`${name}/${id}`)) }),
    set: async data => records.set(`${name}/${id}`, structuredClone(data)),
    update: async data => { if (!records.has(`${name}/${id}`)) throw new Error('Not found'); records.set(`${name}/${id}`, { ...records.get(`${name}/${id}`), ...structuredClone(data) }); }
  });
  const db = { collection: name => ({ doc: id => doc(name, id), where: (field, _, value) => ({ get: async () => ({ docs: [...records].filter(([key,data]) => key.startsWith(`${name}/`) && data[field] === value).map(([key,data]) => ({ id: key.slice(name.length + 1), data: () => structuredClone(data) })) }) }) }),
    runTransaction: async fn => { const writes = []; const value = await fn({ get: ref => ref.get(), set: (ref,data) => writes.push(() => records.set(ref.key, structuredClone(data))), update: (ref,data) => writes.push(() => records.set(ref.key, { ...records.get(ref.key), ...structuredClone(data) })) }); writes.forEach(fn => fn()); return value; } };
  const handlers = createLearningHandlers({ db, HttpsError, FieldValue: { serverTimestamp: () => 'server-time' }, requireTeacher: r => { if (r.auth?.token.role !== 'teacher') throw new HttpsError('permission-denied', 'Teacher only'); } });
  records.set('classes/c1', { students: [{ id: 's1', name: 'Ali Kaya' }, { id: 's2', name: 'Ece Yılmaz' }] });
  records.set('activities/a1', { is_test: true });
  const request = (data, role = 'student', studentId = 's1', classId = 'c1') => ({ auth: { uid: `${role}_${studentId}`, token: { role, studentId, classId } }, data });
  const assign = data => handlers.saveLearningAssignment(request({ classId: 'c1', kind: 'chess-week', resourceId: 'week-1', title: 'Ders', studentIds: [], ...data }, 'teacher'));
  return { records, db, handlers, request, assign };
}
module.exports = { setup };
