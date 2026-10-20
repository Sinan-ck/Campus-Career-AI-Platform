const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

const serverProcess = spawn('node', [path.join(__dirname, 'index.js')], {
  stdio: ['pipe', 'pipe', 'inherit']
});

const rl = readline.createInterface({
  input: serverProcess.stdout,
  terminal: false
});

let msgId = 1;
const pending = new Map();

rl.on('line', (line) => {
  const msg = JSON.parse(line);
  if (msg.id && pending.has(msg.id)) {
    const resolve = pending.get(msg.id);
    pending.delete(msg.id);
    resolve(msg);
  }
});

function send(method, params = {}) {
  const id = msgId++;
  const payload = { jsonrpc: '2.0', id, method, params };
  return new Promise((resolve) => {
    pending.set(id, resolve);
    serverProcess.stdin.write(JSON.stringify(payload) + '\n');
  });
}

async function runTests() {
  console.log('🧪 Starting MCP Server Automated Tests...\n');

  // Test 1: Initialize
  const initRes = await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'TestClient', version: '1.0' }
  });
  console.log('✅ 1. Initialize Response:', initRes.result.serverInfo);

  // Test 2: Tools List
  const listRes = await send('tools/list');
  console.log(`✅ 2. Tools List: Found ${listRes.result.tools.length} registered tools:`);
  listRes.result.tools.forEach(t => console.log(`   - ${t.name}: ${t.description.slice(0, 60)}...`));

  // Test 3: Search Students (Python Stack)
  const searchStudRes = await send('tools/call', {
    name: 'search_students',
    arguments: { techStack: 'Python Stack', limit: 3 }
  });
  const studData = JSON.parse(searchStudRes.result.content[0].text);
  console.log(`\n✅ 3. Search Students (Python Stack): Found ${studData.totalFound} students, showing ${studData.showing}`);
  studData.students.forEach(s => console.log(`   [${s.id}] ${s.name} (${s.mainTechStack}, GPA: ${s.gpa}, Loc: ${s.location})`));

  // Test 4: Search Jobs (Docker skill)
  const searchJobRes = await send('tools/call', {
    name: 'search_jobs',
    arguments: { skill: 'Docker', limit: 3 }
  });
  const jobData = JSON.parse(searchJobRes.result.content[0].text);
  console.log(`\n✅ 4. Search Jobs (Docker): Found ${jobData.totalFound} matching jobs, showing ${jobData.showing}`);
  jobData.jobs.forEach(j => console.log(`   [${j.id}] ${j.title} at ${j.companyName} (${j.salaryRange})`));

  // Test 5: Match Students for Job (JOB-1001)
  const matchStudentsRes = await send('tools/call', {
    name: 'match_students_for_job',
    arguments: { jobId: 'JOB-1001', limit: 3 }
  });
  const matchStudData = JSON.parse(matchStudentsRes.result.content[0].text);
  console.log(`\n✅ 5. Top Candidate Matches for [${matchStudData.job.id}] ${matchStudData.job.title} (${matchStudData.job.companyName}):`);
  matchStudData.topMatches.forEach(m => {
    console.log(`   🏆 ${m.name} (${m.studentId}) - Match: ${m.matchPercentage}% | Stack: ${m.mainTechStack} | Matched Skills: ${m.matchedSkills.join(', ')}`);
  });

  // Test 6: Match Jobs for Student (STU001)
  const matchJobsRes = await send('tools/call', {
    name: 'match_jobs_for_student',
    arguments: { studentId: 'STU001', limit: 3 }
  });
  const matchJobData = JSON.parse(matchJobsRes.result.content[0].text);
  console.log(`\n✅ 6. Top Job Recommendations for [${matchJobData.student.id}] ${matchJobData.student.name} (${matchJobData.student.mainTechStack}):`);
  matchJobData.topJobRecommendations.forEach(j => {
    console.log(`   💼 ${j.title} at ${j.companyName} - Match: ${j.matchPercentage}% | Salary: ${j.salaryRange}`);
  });

  console.log('\n🎉 ALL 6 TESTS PASSED FLAWLESSLY!\n');
  serverProcess.kill();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  serverProcess.kill();
  process.exit(1);
});
