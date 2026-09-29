#!/usr/bin/env node
/* FWEA guard — chạy bằng Node, không cần cài thêm gì.
 *   node .agents/scripts/fwea.js start   <task-id> --allow "a,b/,c" [--forbid "x,y"]
 *   node .agents/scripts/fwea.js check   <task-id>
 *   node .agents/scripts/fwea.js test    baseline | compare
 * Mục trong --allow/--forbid: đường dẫn file, hoặc thư mục kết thúc bằng "/".
 */
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function die(msg) { console.error('❌ ' + msg); process.exit(2); }
function git(args, cwd) {
  return execFileSync('git', args, { encoding: 'utf8', cwd, maxBuffer: 64 * 1024 * 1024 }).trim();
}
let ROOT;
try { ROOT = git(['rev-parse', '--show-toplevel'], process.cwd()); }
catch (e) { die('Không phải git repo (hoặc git chặn quyền sở hữu). Chạy git init + commit baseline trước.'); }
const AGENT_DIR = path.join(ROOT, '.agents');
const TASK_DIR = path.join(AGENT_DIR, 'tasks');
const IGNORE = ['.agents/tasks/', '.agents/reports/', '.agents/baseline.json'];

const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '');
const matches = (file, list) => list.some((e) => (e.endsWith('/') ? file.startsWith(e) : file === e));
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean).map(norm);
const csv = (s) => (s || '').split(',').map((x) => norm(x.trim())).filter(Boolean);
function flag(argv, name) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : ''; }

function changedSince(base) {
  const tracked = lines(git(['diff', '--name-only', base], ROOT));
  const untracked = lines(git(['ls-files', '--others', '--exclude-standard'], ROOT));
  return [...new Set([...tracked, ...untracked])].filter((f) => !matches(f, IGNORE)).sort();
}
function hashOf(f) {
  return fs.existsSync(path.join(ROOT, f)) ? git(['hash-object', f], ROOT).slice(0, 12) : 'DELETED';
}
function loadTask(id) {
  if (!id) die('Thiếu task-id.');
  const p = path.join(TASK_DIR, id + '.json');
  if (!fs.existsSync(p)) die('Không thấy checkpoint: ' + p + ' (chạy "start" trước).');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const argv = process.argv.slice(2);
const [cmd, arg] = argv;

if (cmd === 'start') {
  if (!arg) die('Thiếu task-id.');
  const allowed = csv(flag(argv, '--allow')), forbidden = csv(flag(argv, '--forbid'));
  if (!allowed.length) die('Thiếu --allow (danh sách file được phép sửa).');
  const dirty = changedSince('HEAD');
  if (dirty.length) die('Working tree chưa sạch, hãy commit/stash trước:\n  ' + dirty.join('\n  '));
  fs.mkdirSync(TASK_DIR, { recursive: true });
  const t = { id: arg, createdAt: new Date().toISOString(), base: git(['rev-parse', 'HEAD'], ROOT), allowed, forbidden };
  fs.writeFileSync(path.join(TASK_DIR, arg + '.json'), JSON.stringify(t, null, 2));
  console.log('✅ CHECKPOINT BEFORE  task=' + arg + '  base=' + t.base.slice(0, 7));
  console.log('   ALLOWED  : ' + allowed.join(', '));
  console.log('   FORBIDDEN: ' + (forbidden.join(', ') || '(không khai báo)'));
  console.log('   Rollback : git restore --source=' + t.base.slice(0, 7) + ' --staged --worktree -- <file>');
} else if (cmd === 'check') {
  const t = loadTask(arg);
  const changed = changedSince(t.base);
  const unexpected = changed.filter((f) => !matches(f, t.allowed));
  const forbiddenHit = changed.filter((f) => matches(f, t.forbidden));
  fs.writeFileSync(path.join(TASK_DIR, arg + '.after.json'),
    JSON.stringify({ checkedAt: new Date().toISOString(), changed: changed.map((f) => ({ file: f, hash: hashOf(f) })) }, null, 2));
  console.log('CHECKPOINT AFTER  task=' + arg);
  console.log('CHANGED (' + changed.length + '):'); changed.forEach((f) => console.log('  ' + f));
  if (unexpected.length || forbiddenHit.length) {
    console.log('\n🚨 SCOPE VIOLATION');
    unexpected.forEach((f) => console.log('  ngoài ALLOWED : ' + f));
    forbiddenHit.forEach((f) => console.log('  chạm FORBIDDEN: ' + f));
    console.log('→ DỪNG. Báo user, không tự sửa tiếp.');
    process.exit(1);
  }
  console.log('\n✅ SCOPE OK — chỉ sửa file trong ALLOWED, không chạm FORBIDDEN.');
} else if (cmd === 'test') {
  const baseFile = path.join(AGENT_DIR, 'baseline.json');
  const r = spawnSync('node', ['run_all_tests.js'], { cwd: path.join(ROOT, 'tkweb', 'tests'), encoding: 'utf8', timeout: 300000 });
  if (r.error) die('Chạy test lỗi/timeout: ' + r.error.message + '  (KHÔNG được báo PASS)');
  const out = (r.stdout || '') + (r.stderr || '');
  const suites = {};
  for (const m of out.matchAll(/Running (.*?)\.\.\.\s*\S*\s*(PASS|FAIL)/g)) suites[m[1].trim()] = m[2];
  const total = Object.keys(suites).length;
  if (!total) die('Không đọc được kết quả test. Output cuối:\n' + out.slice(-1500));
  const pass = Object.values(suites).filter((v) => v === 'PASS').length;
  if (arg === 'baseline') {
    fs.writeFileSync(baseFile, JSON.stringify({ at: new Date().toISOString(), commit: git(['rev-parse', 'HEAD'], ROOT), suites }, null, 2));
    console.log('✅ BASELINE TEST: ' + pass + '/' + total + ' suite pass → .agents/baseline.json');
  } else if (arg === 'compare') {
    if (!fs.existsSync(baseFile)) die('Chưa có baseline. Chạy: node .agents/scripts/fwea.js test baseline');
    const b = JSON.parse(fs.readFileSync(baseFile, 'utf8')).suites;
    const reg = Object.keys(suites).filter((k) => b[k] === 'PASS' && suites[k] === 'FAIL');
    const fixed = Object.keys(suites).filter((k) => b[k] === 'FAIL' && suites[k] === 'PASS');
    console.log('TEST NOW: ' + pass + '/' + total + ' pass');
    fixed.forEach((k) => console.log('  ✅ FIXED      ' + k));
    reg.forEach((k) => console.log('  🚨 REGRESSION ' + k));
    if (reg.length) process.exit(1);
    console.log('Không có regression so với baseline.');
  } else die('Dùng: test baseline | test compare');
} else {
  console.log('Lệnh: start <id> --allow "..." [--forbid "..."] | check <id> | test baseline|compare');
}
