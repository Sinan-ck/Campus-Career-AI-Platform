/**
 * Student Data Hub - Client Application Logic
 */

let allStudents = [];
let filteredStudents = [];
let currentTechFilter = "ALL";
let currentSearchQuery = "";
let currentViewMode = "grid"; // 'grid' | 'table'

// Tech Stack badge class mapping
const badgeClassMap = {
  "MEAN Stack": "badge-mean",
  "MERN Stack": "badge-mern",
  "Python Stack": "badge-python",
  "Android Stack": "badge-android",
  "iOS Stack": "badge-ios",
  "Flutter Stack": "badge-flutter",
  "Java Enterprise": "badge-java",
  "Data Science & AI": "badge-datasci"
};

// Avatar background gradient colors
const avatarGradients = [
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #3b82f6, #6366f1)",
  "linear-gradient(135deg, #22c55e, #16a34a)",
  "linear-gradient(135deg, #a855f7, #9333ea)",
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #ec4899, #db2777)"
];

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initSearchAndFilter();
  initViewToggles();
  initModal();
  initApiExplorer();
  
  // Load initial student data from REST API server
  fetchStudents();
  fetchStats();
});

/**
 * Fetch all students from Express REST API Endpoint
 */
async function fetchStudents() {
  try {
    const response = await fetch('/api/students');
    const result = await response.json();
    
    if (result.success) {
      allStudents = result.data;
      applyFilters();
    }
  } catch (err) {
    console.error("Failed to load students:", err);
  }
}

/**
 * Fetch stats summary
 */
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('stat-total-students').textContent = data.totalStudents;
      document.getElementById('stat-stacks-count').textContent = `${Object.keys(data.techStackBreakdown).length} Stacks`;
      document.getElementById('stat-subtopics-count').textContent = `${data.totalSubtopicsSkills}+`;
      
      renderStatsBreakdown(data);
    }
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

/**
 * Apply Search and Tech Stack filters locally for instant smooth UX
 */
function applyFilters() {
  let list = [...allStudents];

  // Tech stack filter
  if (currentTechFilter !== "ALL") {
    list = list.filter(s => s.mainTechStack === currentTechFilter);
  }

  // Search query filter (Name, Email, Mobile, Tech Stack, or Skill subtopic)
  if (currentSearchQuery.trim() !== "") {
    const q = currentSearchQuery.toLowerCase().trim();
    list = list.filter(s => {
      const matchBasic = 
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.mobile.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.mainTechStack.toLowerCase().includes(q);

      const matchSkills = s.skills.some(sk => 
        sk.topic.toLowerCase().includes(q) ||
        sk.subtopics.some(sub => sub.toLowerCase().includes(q))
      );

      return matchBasic || matchSkills;
    });
  }

  filteredStudents = list;
  renderStudents();
}

/**
 * Render Grid or Table views
 */
function renderStudents() {
  const countText = document.getElementById("results-count-text");
  countText.textContent = `Showing ${filteredStudents.length} of ${allStudents.length} Students`;

  if (currentViewMode === "grid") {
    renderGrid();
  } else {
    renderTable();
  }

  // Re-initialize Lucide icons for dynamically added elements
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Render Student Cards Grid
 */
function renderGrid() {
  const container = document.getElementById("students-grid-container");
  container.innerHTML = "";

  if (filteredStudents.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p>No students match your filter criteria.</p>
      </div>
    `;
    return;
  }

  filteredStudents.forEach((student, index) => {
    const badgeClass = badgeClassMap[student.mainTechStack] || "badge-mean";
    const bgGradient = avatarGradients[index % avatarGradients.length];
    const initials = student.name.split(' ').map(n => n[0]).join('');

    // Extract top 4 skill subtopics for quick preview
    const subtopicsPreview = [];
    student.skills.forEach(sk => {
      if (sk.subtopics) {
        subtopicsPreview.push(...sk.subtopics);
      }
    });
    const previewTags = subtopicsPreview.slice(0, 4);

    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <div class="student-card-header">
        <div class="avatar" style="background: ${bgGradient};">${initials}</div>
        <div class="student-meta">
          <h3>${student.name}</h3>
          <span class="roll-id">${student.id} &bull; GPA: ${student.gpa}</span>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <span class="tech-badge ${badgeClass}">${student.mainTechStack}</span>
      </div>

      <div class="contact-details">
        <div class="contact-item">
          <i data-lucide="mail"></i>
          <span>${student.email}</span>
        </div>
        <div class="contact-item">
          <i data-lucide="phone"></i>
          <span>${student.mobile}</span>
        </div>
        <div class="contact-item">
          <i data-lucide="map-pin"></i>
          <span>${student.location}</span>
        </div>
      </div>

      <div class="subtopics-preview">
        ${previewTags.map(tag => `<span class="subtopic-tag">${tag}</span>`).join('')}
        ${subtopicsPreview.length > 4 ? `<span class="subtopic-tag">+${subtopicsPreview.length - 4} more</span>` : ''}
      </div>

      <button class="btn btn-outline btn-full" onclick="openStudentModal('${student.id}')">
        <i data-lucide="user"></i> View Full Skill Matrix
      </button>
    `;

    container.appendChild(card);
  });
}

/**
 * Render Student Table View
 */
function renderTable() {
  const tbody = document.getElementById("students-table-body");
  tbody.innerHTML = "";

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching students found</td></tr>`;
    return;
  }

  filteredStudents.forEach(student => {
    const badgeClass = badgeClassMap[student.mainTechStack] || "badge-mean";
    
    // Skill summary
    const topics = student.skills.map(s => s.topic).join(", ");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family: 'JetBrains Mono'; color: var(--text-muted);">${student.id}</td>
      <td><strong>${student.name}</strong></td>
      <td>
        <div style="font-size:0.82rem;">${student.email}</div>
        <div style="font-size:0.75rem; color: var(--text-muted);">${student.mobile}</div>
      </td>
      <td><span class="tech-badge ${badgeClass}">${student.mainTechStack}</span></td>
      <td>${student.location}</td>
      <td style="max-width: 200px; font-size: 0.78rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${topics}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="openStudentModal('${student.id}')">
          Details
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Search & Filter Initialization
 */
function initSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    clearBtn.style.display = currentSearchQuery ? "block" : "none";
    applyFilters();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearchQuery = "";
    clearBtn.style.display = "none";
    applyFilters();
  });

  // Tech stack pills
  const pillBtns = document.querySelectorAll("#tech-stack-pills .pill-btn");
  pillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      pillBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTechFilter = btn.dataset.stack;
      applyFilters();
    });
  });
}

/**
 * View Toggles (Grid vs Table)
 */
function initViewToggles() {
  const gridBtn = document.getElementById("view-grid-btn");
  const tableBtn = document.getElementById("view-table-btn");
  const gridContainer = document.getElementById("students-grid-container");
  const tableContainer = document.getElementById("students-table-container");

  gridBtn.addEventListener("click", () => {
    gridBtn.classList.add("active");
    tableBtn.classList.remove("active");
    gridContainer.classList.remove("hidden");
    tableContainer.classList.add("hidden");
    currentViewMode = "grid";
    renderStudents();
  });

  tableBtn.addEventListener("click", () => {
    tableBtn.classList.add("active");
    gridBtn.classList.remove("active");
    tableContainer.classList.remove("hidden");
    gridContainer.classList.add("hidden");
    currentViewMode = "table";
    renderStudents();
  });
}

/**
 * Open Modal with Full Student Skill Matrix
 */
window.openStudentModal = function(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  const modal = document.getElementById("student-modal");
  const initials = student.name.split(' ').map(n => n[0]).join('');

  document.getElementById("modal-avatar").textContent = initials;
  document.getElementById("modal-name").textContent = student.name;
  document.getElementById("modal-id").textContent = student.id;
  document.getElementById("modal-stack").textContent = student.mainTechStack;
  document.getElementById("modal-stack").className = `tech-badge ${badgeClassMap[student.mainTechStack] || ''}`;

  document.getElementById("modal-email").textContent = student.email;
  document.getElementById("modal-phone").textContent = student.mobile;
  document.getElementById("modal-location").textContent = student.location;
  document.getElementById("modal-gpa").textContent = `${student.gpa} / ${student.experienceLevel}`;

  // Render Skills Tree
  const skillsTree = document.getElementById("modal-skills-tree");
  skillsTree.innerHTML = "";

  student.skills.forEach(skill => {
    const card = document.createElement("div");
    card.className = "skill-topic-card";
    card.innerHTML = `
      <div class="skill-topic-header">
        <span class="topic-title">${skill.topic}</span>
        <span class="topic-category">${skill.category}</span>
      </div>
      <div class="subtopics-list">
        ${skill.subtopics.map(sub => `<span class="subtopic-chip"><i data-lucide="check-circle-2" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>${sub}</span>`).join('')}
      </div>
    `;
    skillsTree.appendChild(card);
  });

  modal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
};

function initModal() {
  const modal = document.getElementById("student-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const closeBottom = document.getElementById("modal-close-bottom");

  const closeModal = () => modal.classList.add("hidden");

  closeBtn.addEventListener("click", closeModal);
  closeBottom.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Tab Navigation
 */
function initTabs() {
  const navBtns = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.add("hidden"));

      btn.classList.add("active");
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) {
        targetTab.classList.remove("hidden");
      }
    });
  });
}

/**
 * REST API Explorer logic
 */
function initApiExplorer() {
  const endpointItems = document.querySelectorAll(".endpoint-item");
  const urlInput = document.getElementById("api-url-input");
  const executeBtn = document.getElementById("execute-api-btn");
  const jsonCode = document.getElementById("json-response-code");
  const statusCode = document.getElementById("api-status-code");
  const responseTime = document.getElementById("api-response-time");
  const copyBtn = document.getElementById("copy-json-btn");

  const endpointMap = {
    "all": "/api/students",
    "filter-stack": "/api/students?techStack=MEAN Stack",
    "filter-python": "/api/students?techStack=Python Stack",
    "filter-android": "/api/students?techStack=Android Stack",
    "filter-ios": "/api/students?techStack=iOS Stack",
    "search-skill": "/api/students?skill=RxJS",
    "single": "/api/students/STU001",
    "stats": "/api/stats",
    "health": "/api/health"
  };

  endpointItems.forEach(item => {
    item.addEventListener("click", () => {
      endpointItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const key = item.dataset.endpoint;
      if (endpointMap[key]) {
        urlInput.value = endpointMap[key];
        runApiQuery(endpointMap[key]);
      }
    });
  });

  executeBtn.addEventListener("click", () => {
    runApiQuery(urlInput.value);
  });

  async function runApiQuery(url) {
    const startTime = performance.now();
    jsonCode.textContent = "// Loading API response...";

    try {
      const res = await fetch(url);
      const data = await res.json();
      const endTime = performance.now();

      statusCode.textContent = `${res.status} ${res.statusText || 'OK'}`;
      responseTime.textContent = `${Math.round(endTime - startTime)}ms`;
      jsonCode.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      statusCode.textContent = "Error";
      jsonCode.textContent = `// Error executing request:\n${err.message}`;
    }
  }

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonCode.textContent);
    copyBtn.innerHTML = `<i data-lucide="check"></i> Copied!`;
    setTimeout(() => {
      copyBtn.innerHTML = `<i data-lucide="copy"></i> Copy JSON`;
      if (window.lucide) lucide.createIcons();
    }, 2000);
  });
}

/**
 * Render Stats Tab charts & breakdown
 */
function renderStatsBreakdown(data) {
  const container = document.getElementById("stack-breakdown-list");
  if (!container) return;

  container.innerHTML = "";
  const total = data.totalStudents;

  Object.entries(data.techStackBreakdown).forEach(([stack, count]) => {
    const pct = Math.round((count / total) * 100);
    const item = document.createElement("div");
    item.style.marginBottom = "14px";
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:6px;">
        <span><strong>${stack}</strong></span>
        <span style="color:var(--text-muted);">${count} Students (${pct}%)</span>
      </div>
      <div style="background:#0b1120; height:8px; border-radius:4px; overflow:hidden;">
        <div style="background:var(--primary); width:${pct}%; height:100%;"></div>
      </div>
    `;
    container.appendChild(item);
  });

  const locContainer = document.getElementById("location-breakdown-list");
  if (locContainer) {
    locContainer.innerHTML = "";
    Object.entries(data.locationBreakdown).forEach(([loc, count]) => {
      const tag = document.createElement("div");
      tag.style.cssText = "background:#0b1120; border:1px solid var(--border-color); padding:10px 14px; border-radius:10px; text-align:center;";
      tag.innerHTML = `
        <div style="font-size:1.1rem; font-weight:700;">${count}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${loc}</div>
      `;
      locContainer.appendChild(tag);
    });
  }
}
