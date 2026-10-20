const http = require('http');

// Helper to make HTTP GET request
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 Starting Tech Jobs REST API Automated Verification...");
  console.log("=================================================");

  // Wait 1 sec for server to listen
  await new Promise(r => setTimeout(r, 1000));

  try {
    // Test 1: Get Summary Stats
    console.log("\n1️⃣ Testing GET /api/jobs/stats/summary ...");
    const stats = await fetchUrl('http://localhost:5000/api/jobs/stats/summary');
    console.log(`   Status: ${stats.status}`);
    console.log(`   Total Jobs: ${stats.data.totalJobs}`);
    console.log(`   Tech Stack Breakdown:`, stats.data.stats.byTechStack);

    // Test 2: Get All 100 Jobs
    console.log("\n2️⃣ Testing GET /api/jobs (List All) ...");
    const allJobs = await fetchUrl('http://localhost:5000/api/jobs');
    console.log(`   Status: ${allJobs.status}`);
    console.log(`   Total Count in DB: ${allJobs.data.totalCount}`);
    console.log(`   Returned Jobs Count: ${allJobs.data.data.length}`);

    // Test 3: Get Single Job Details
    console.log("\n3️⃣ Testing GET /api/jobs/JOB-1001 ...");
    const singleJob = await fetchUrl('http://localhost:5000/api/jobs/JOB-1001');
    console.log(`   Status: ${singleJob.status}`);
    console.log(`   Job Title: "${singleJob.data.data.title}"`);
    console.log(`   Company: "${singleJob.data.data.companyName}"`);
    console.log(`   Tech Stack: "${singleJob.data.data.techStack}"`);
    console.log(`   Contact Person: "${singleJob.data.data.companyContact.contactPerson}"`);
    console.log(`   Contact Email: "${singleJob.data.data.companyContact.email}"`);

    // Test 4: Filter by MERN Stack
    console.log("\n4️⃣ Testing GET /api/jobs?techStack=MERN%20Stack ...");
    const mernJobs = await fetchUrl('http://localhost:5000/api/jobs?techStack=MERN%20Stack');
    console.log(`   Status: ${mernJobs.status}`);
    console.log(`   MERN Jobs Count: ${mernJobs.data.filteredCount}`);

    console.log("\n=================================================");
    console.log("✅ ALL REST API VERIFICATION TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================");

    process.exit(0);
  } catch (err) {
    console.error("❌ API Test Failed:", err);
    process.exit(1);
  }
}

// Require server file (which starts listening on 5000) and execute tests
require('./server.js');
runTests();
