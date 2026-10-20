// Global State
let allJobs = [];
let currentFilterStack = '';
let currentSearch = '';
let currentLocation = '';
let currentExp = '';
let currentJobType = '';
let selectedJobId = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Navigation Tabs
  const tabJobsBtn = document.getElementById('tabJobsBtn');
  const tabApiBtn = document.getElementById('tabApiBtn');
  const jobsView = document.getElementById('jobsView');
  const apiView = document.getElementById('apiView');

  tabJobsBtn.addEventListener('click', () => {
    tabJobsBtn.classList.add('active');
    tabApiBtn.classList.remove('active');
    jobsView.classList.add('active');
    apiView.classList.remove('active');
  });

  tabApiBtn.addEventListener('click', () => {
    tabApiBtn.classList.add('active');
    tabJobsBtn.classList.remove('active');
    apiView.classList.add('active');
    jobsView.classList.remove('active');
    updateCurlDisplay();
  });

  // Filters
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const locationSelect = document.getElementById('locationSelect');
  const expSelect = document.getElementById('expSelect');
  const jobTypeSelect = document.getElementById('jobTypeSelect');
  const stackChipsContainer = document.getElementById('stackChipsContainer');

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    clearSearchBtn.style.display = currentSearch ? 'block' : 'none';
    fetchAndRenderJobs();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    clearSearchBtn.style.display = 'none';
    fetchAndRenderJobs();
  });

  locationSelect.addEventListener('change', (e) => {
    currentLocation = e.target.value;
    fetchAndRenderJobs();
  });

  expSelect.addEventListener('change', (e) => {
    currentExp = e.target.value;
    fetchAndRenderJobs();
  });

  jobTypeSelect.addEventListener('change', (e) => {
    currentJobType = e.target.value;
    fetchAndRenderJobs();
  });

  stackChipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    currentFilterStack = chip.getAttribute('data-stack');
    fetchAndRenderJobs();
  });

  // Modal Setup
  const jobModalOverlay = document.getElementById('jobModalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const testInApiBtn = document.getElementById('testInApiBtn');
  const copyModalApiUrlBtn = document.getElementById('copyModalApiUrlBtn');

  modalCloseBtn.addEventListener('click', closeModal);
  jobModalOverlay.addEventListener('click', (e) => {
    if (e.target === jobModalOverlay) closeModal();
  });

  testInApiBtn.addEventListener('click', () => {
    if (!selectedJobId) return;
    closeModal();
    tabApiBtn.click();
    document.getElementById('apiUrlInput').value = `http://localhost:5000/api/jobs/${selectedJobId}`;
    document.getElementById('apiMethodSelect').value = 'GET';
    sendApiRequest();
  });

  copyModalApiUrlBtn.addEventListener('click', () => {
    if (!selectedJobId) return;
    const url = `${window.location.origin}/api/jobs/${selectedJobId}`;
    navigator.clipboard.writeText(url);
    copyModalApiUrlBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied Link!`;
    setTimeout(() => {
      copyModalApiUrlBtn.innerHTML = `<i class="fa-solid fa-link"></i> Copy REST API Link`;
    }, 2000);
  });

  // API Tester Controls
  const sendApiRequestBtn = document.getElementById('sendApiRequestBtn');
  const apiUrlInput = document.getElementById('apiUrlInput');
  const apiMethodSelect = document.getElementById('apiMethodSelect');
  const apiBodyInput = document.getElementById('apiBodyInput');
  const postBodyWrapper = document.getElementById('postBodyWrapper');
  const copyCurlBtn = document.getElementById('copyCurlBtn');
  const copyResponseBtn = document.getElementById('copyResponseBtn');

  apiMethodSelect.addEventListener('change', (e) => {
    const method = e.target.value;
    if (method === 'POST' || method === 'PUT') {
      postBodyWrapper.classList.remove('hidden');
    } else {
      postBodyWrapper.classList.add('hidden');
    }
    updateCurlDisplay();
  });

  apiUrlInput.addEventListener('input', updateCurlDisplay);
  apiBodyInput.addEventListener('input', updateCurlDisplay);

  sendApiRequestBtn.addEventListener('click', sendApiRequest);

  // Preset Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const method = btn.getAttribute('data-method');
      const urlPath = btn.getAttribute('data-url');
      apiMethodSelect.value = method;
      apiUrlInput.value = `${window.location.origin}${urlPath}`;
      postBodyWrapper.classList.add('hidden');
      updateCurlDisplay();
      sendApiRequest();
    });
  });

  copyCurlBtn.addEventListener('click', () => {
    const text = document.getElementById('curlDisplay').textContent;
    navigator.clipboard.writeText(text);
    copyCurlBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
    setTimeout(() => {
      copyCurlBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy cURL`;
    }, 2000);
  });

  copyResponseBtn.addEventListener('click', () => {
    const text = document.getElementById('jsonOutput').textContent;
    navigator.clipboard.writeText(text);
    copyResponseBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
    setTimeout(() => {
      copyResponseBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy JSON`;
    }, 2000);
  });

  // Initial Data Load
  fetchSummaryStats();
  fetchAndRenderJobs();
  sendApiRequest(); // Initial API tester run
}

// Fetch Stats Summary API
async function fetchSummaryStats() {
  try {
    const res = await fetch('/api/jobs/stats/summary');
    const json = await res.json();
    if (json.success) {
      const { byTechStack } = json.stats;
      document.getElementById('countMern').textContent = byTechStack['MERN Stack'] || 0;
      document.getElementById('countMean').textContent = byTechStack['MEAN Stack'] || 0;
      document.getElementById('countPython').textContent = byTechStack['Python / Django'] || 0;
      const mobileCount = (byTechStack['iOS Development'] || 0) + (byTechStack['Android Development'] || 0) + (byTechStack['Flutter / Mobile'] || 0);
      document.getElementById('countMobile').textContent = mobileCount;
      document.getElementById('totalJobCountHeader').textContent = `${json.totalJobs} Openings`;

      // Remove skeleton glow
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('loading-skeleton'));
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}

// Fetch Jobs with Query Params
async function fetchAndRenderJobs() {
  const container = document.getElementById('jobsGridContainer');
  container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Loading job vacancies...</p></div>`;

  const params = new URLSearchParams();
  if (currentSearch) params.append('search', currentSearch);
  if (currentFilterStack) params.append('techStack', currentFilterStack);
  if (currentLocation) params.append('location', currentLocation);
  if (currentExp) params.append('experienceLevel', currentExp);
  if (currentJobType) params.append('jobType', currentJobType);

  const url = `/api/jobs?${params.toString()}`;
  document.getElementById('activeApiUrl').textContent = `/api/jobs${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
      allJobs = json.data;
      document.getElementById('resultsCountText').innerHTML = `Showing <strong>${json.filteredCount}</strong> of <strong>${json.totalCount}</strong> job vacancies`;
      renderJobCards(allJobs);
    }
  } catch (err) {
    console.error("Error fetching jobs:", err);
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #f87171;"><i class="fa-solid fa-triangle-exclamation fa-2x"></i><p>Failed to connect to API server. Make sure Node.js server is running on Port 5000.</p></div>`;
  }
}

// Render Job Cards
function renderJobCards(jobs) {
  const container = document.getElementById('jobsGridContainer');
  container.innerHTML = '';

  if (jobs.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);" class="glass">
        <i class="fa-solid fa-folder-open fa-3x" style="margin-bottom: 16px; opacity: 0.5;"></i>
        <h3>No Job Vacancies Found</h3>
        <p>Try resetting search terms or changing tech stack filters.</p>
      </div>
    `;
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement('div');
    card.className = 'job-card glass';

    const skillChips = (job.requiredSkills || []).slice(0, 4).map(s => `<span class="skill-pill">${s}</span>`).join('');

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="job-id-tag">${job.id}</span>
          <span class="stack-badge" data-stack="${job.techStack}">${job.techStack}</span>
        </div>

        <h3 class="job-title" style="margin-top: 10px;">${job.title}</h3>
        <p class="company-name" style="margin-top: 4px;"><i class="fa-solid fa-building"></i> ${job.companyName}</p>

        <div class="job-meta-row" style="margin-top: 14px;">
          <div class="meta-item"><i class="fa-solid fa-location-dot"></i> ${job.location}</div>
          <div class="meta-item"><i class="fa-solid fa-indian-rupee-sign"></i> ${job.salaryRange}</div>
          <div class="meta-item"><i class="fa-solid fa-briefcase"></i> ${job.jobType}</div>
          <div class="meta-item"><i class="fa-solid fa-user-graduate"></i> ${job.experienceLevel}</div>
        </div>

        <div class="skills-wrap" style="margin-top: 14px;">
          ${skillChips}
        </div>
      </div>

      <div class="card-actions">
        <button class="primary-btn view-jd-btn" data-id="${job.id}"><i class="fa-solid fa-circle-info"></i> View Details</button>
        <button class="secondary-btn copy-api-btn" data-id="${job.id}" title="Copy API Endpoint"><i class="fa-solid fa-code"></i> API</button>
      </div>
    `;

    // Event listeners
    card.querySelector('.view-jd-btn').addEventListener('click', () => openModal(job.id));
    card.querySelector('.copy-api-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const apiUrl = `${window.location.origin}/api/jobs/${job.id}`;
      navigator.clipboard.writeText(apiUrl);
      const btn = card.querySelector('.copy-api-btn');
      btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
      setTimeout(() => { btn.innerHTML = `<i class="fa-solid fa-code"></i> API`; }, 1500);
    });

    container.appendChild(card);
  });
}

// Modal Display
async function openModal(jobId) {
  selectedJobId = jobId;
  const modalOverlay = document.getElementById('jobModalOverlay');
  const modalHeader = document.getElementById('modalHeader');
  const modalBody = document.getElementById('modalBody');

  modalOverlay.classList.add('active');
  modalHeader.innerHTML = `<h3><i class="fa-solid fa-spinner fa-spin"></i> Loading job details...</h3>`;
  modalBody.innerHTML = '';

  try {
    const res = await fetch(`/api/jobs/${jobId}`);
    const json = await res.json();
    if (json.success) {
      const job = json.data;

      modalHeader.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
          <span class="job-id-tag">${job.id}</span>
          <span class="stack-badge" data-stack="${job.techStack}">${job.techStack}</span>
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 24px; font-weight: 800;">${job.title}</h2>
        <p style="color: var(--text-muted); font-size: 15px;"><i class="fa-solid fa-building"></i> ${job.companyName} &bull; ${job.location}</p>
      `;

      const respItems = (job.responsibilities || []).map(r => `<li>${r}</li>`).join('');
      const skillPills = (job.requiredSkills || []).map(s => `<span class="skill-pill" style="font-size: 12px; padding: 4px 10px;">${s}</span>`).join('');
      const qualItems = (job.qualifications || []).map(q => `<li>${q}</li>`).join('');

      modalBody.innerHTML = `
        <div class="contact-box">
          <div class="contact-item"><i class="fa-solid fa-user-tie"></i> <span><strong>Contact:</strong> ${job.companyContact.contactPerson}</span></div>
          <div class="contact-item"><i class="fa-solid fa-envelope"></i> <span><strong>Email:</strong> ${job.companyContact.email}</span></div>
          <div class="contact-item"><i class="fa-solid fa-phone"></i> <span><strong>Phone:</strong> ${job.companyContact.phone}</span></div>
          <div class="contact-item"><i class="fa-solid fa-globe"></i> <span><strong>Website:</strong> <a href="${job.companyContact.website}" target="_blank" style="color: var(--accent-cyan);">${job.companyContact.website}</a></span></div>
          <div class="contact-item" style="grid-column: 1/-1;"><i class="fa-solid fa-map-location-dot"></i> <span><strong>Office Address:</strong> ${job.companyContact.address}</span></div>
        </div>

        <div style="margin-top: 16px;">
          <div class="modal-section-title"><i class="fa-solid fa-file-lines"></i> Job Description</div>
          <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6;">${job.description}</p>
        </div>

        <div style="margin-top: 16px;">
          <div class="modal-section-title"><i class="fa-solid fa-list-check"></i> Key Responsibilities</div>
          <ul class="resp-list">
            ${respItems}
          </ul>
        </div>

        <div style="margin-top: 16px;">
          <div class="modal-section-title"><i class="fa-solid fa-code"></i> Technical Requirements & Skills</div>
          <div class="skills-wrap" style="gap: 8px;">
            ${skillPills}
          </div>
        </div>

        <div style="margin-top: 16px;">
          <div class="modal-section-title"><i class="fa-solid fa-graduation-cap"></i> Qualifications</div>
          <ul class="resp-list">
            ${qualItems}
          </ul>
        </div>

        <div style="display: flex; gap: 16px; margin-top: 16px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; font-size: 13px; color: var(--text-dim);">
          <div><strong>Posted:</strong> ${job.postedDate}</div>
          <div><strong>Deadline:</strong> ${job.applicationDeadline}</div>
          <div><strong>Package:</strong> ${job.salaryRange}</div>
        </div>
      `;
    }
  } catch (err) {
    console.error("Error loading job detail:", err);
  }
}

function closeModal() {
  document.getElementById('jobModalOverlay').classList.remove('active');
}

// REST API Tester
function updateCurlDisplay() {
  const method = document.getElementById('apiMethodSelect').value;
  const url = document.getElementById('apiUrlInput').value || 'http://localhost:5000/api/jobs';
  const body = document.getElementById('apiBodyInput').value;

  let cmd = `curl -X ${method} "${url}"`;
  if ((method === 'POST' || method === 'PUT') && body) {
    cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${body.replace(/\n/g, '')}'`;
  }

  document.getElementById('curlDisplay').textContent = cmd;
}

async function sendApiRequest() {
  const method = document.getElementById('apiMethodSelect').value;
  let url = document.getElementById('apiUrlInput').value;
  const body = document.getElementById('apiBodyInput').value;
  const output = document.getElementById('jsonOutput');
  const statusBadge = document.getElementById('responseStatusBadge');
  const timeBadge = document.getElementById('responseTimeBadge');

  if (!url.startsWith('http')) {
    url = window.location.origin + (url.startsWith('/') ? '' : '/') + url;
    document.getElementById('apiUrlInput').value = url;
  }

  output.textContent = "Sending HTTP request to Express server...";
  const startTime = performance.now();

  try {
    const opts = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if ((method === 'POST' || method === 'PUT') && body) {
      opts.body = body;
    }

    const res = await fetch(url, opts);
    const endTime = performance.now();

    timeBadge.innerHTML = `<i class="fa-solid fa-clock"></i> ${(endTime - startTime).toFixed(0)} ms`;

    statusBadge.textContent = `${res.status} ${res.statusText || 'OK'}`;
    statusBadge.className = `status-badge ${res.status}`;

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    statusBadge.textContent = "ERROR";
    statusBadge.className = "status-badge 404";
    output.textContent = JSON.stringify({
      error: "Network / Connection Error",
      details: err.message,
      hint: "Make sure Node.js server is actively running on port 5000."
    }, null, 2);
  }
}
