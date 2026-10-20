const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path to data file
const DATA_FILE = path.join(__dirname, 'data', 'jobs.json');

// Helper function to load jobs
function loadJobs() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading jobs data:", err);
  }
  return [];
}

// Helper function to save jobs
function saveJobs(jobs) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error writing jobs data:", err);
    return false;
  }
}

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

/**
 * @route   GET /api/jobs/stats/summary
 * @desc    Get summary statistics of job vacancies
 */
app.get('/api/jobs/stats/summary', (req, res) => {
  const jobs = loadJobs();

  const byTechStack = {};
  const byJobType = {};
  const byExperience = {};
  const byLocation = {};

  jobs.forEach(job => {
    // Tech Stack count
    const stack = job.techStack || 'Other';
    byTechStack[stack] = (byTechStack[stack] || 0) + 1;

    // Job Type count
    const type = job.jobType || 'Other';
    byJobType[type] = (byJobType[type] || 0) + 1;

    // Experience count
    const exp = job.experienceLevel || 'Other';
    byExperience[exp] = (byExperience[exp] || 0) + 1;

    // Location count
    const loc = job.location || 'Other';
    byLocation[loc] = (byLocation[loc] || 0) + 1;
  });

  res.json({
    success: true,
    totalJobs: jobs.length,
    stats: {
      byTechStack,
      byJobType,
      byExperience,
      byLocation
    }
  });
});

/**
 * @route   GET /api/jobs
 * @desc    List all jobs with optional search, filter, pagination, and sorting
 */
app.get('/api/jobs', (req, res) => {
  let jobs = loadJobs();
  const totalCount = jobs.length;

  const { search, category, techStack, location, jobType, experienceLevel, sortBy, sortOrder = 'asc', page, limit } = req.query;

  // Filter by Search query
  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(q) ||
      job.companyName.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      (job.requiredSkills && job.requiredSkills.some(s => s.toLowerCase().includes(q)))
    );
  }

  // Filter by Tech Stack / Category
  const targetCategory = techStack || category;
  if (targetCategory) {
    const cat = targetCategory.toLowerCase();
    jobs = jobs.filter(job => job.techStack.toLowerCase().includes(cat));
  }

  // Filter by Location
  if (location) {
    const loc = location.toLowerCase();
    jobs = jobs.filter(job => job.location.toLowerCase().includes(loc));
  }

  // Filter by Job Type
  if (jobType) {
    const type = jobType.toLowerCase();
    jobs = jobs.filter(job => job.jobType.toLowerCase().includes(type));
  }

  // Filter by Experience Level
  if (experienceLevel) {
    const exp = experienceLevel.toLowerCase();
    jobs = jobs.filter(job => job.experienceLevel.toLowerCase().includes(exp));
  }

  // Sorting
  if (sortBy) {
    jobs.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }

  const filteredCount = jobs.length;

  // Pagination
  let paginatedJobs = jobs;
  let pageNum = 1;
  let limitNum = filteredCount;

  if (limit) {
    limitNum = parseInt(limit, 10) || 100;
    pageNum = parseInt(page, 10) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    paginatedJobs = jobs.slice(startIndex, startIndex + limitNum);
  }

  res.json({
    success: true,
    totalCount: totalCount,
    filteredCount: filteredCount,
    page: pageNum,
    totalPages: limitNum ? Math.ceil(filteredCount / limitNum) : 1,
    limit: limitNum,
    data: paginatedJobs
  });
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get detailed single job position by ID
 */
app.get('/api/jobs/:id', (req, res) => {
  const jobs = loadJobs();
  const job = jobs.find(j => j.id.toLowerCase() === req.params.id.toLowerCase());

  if (!job) {
    return res.status(404).json({
      success: false,
      message: `Job position with ID '${req.params.id}' not found.`
    });
  }

  res.json({
    success: true,
    data: job
  });
});

/**
 * @route   POST /api/jobs
 * @desc    Add a new job opening
 */
app.post('/api/jobs', (req, res) => {
  const jobs = loadJobs();
  const { title, companyName, companyContact, techStack, jobType, experienceLevel, salaryRange, location, description, requiredSkills, responsibilities } = req.body;

  if (!title || !companyName || !techStack) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title, companyName, and techStack are mandatory."
    });
  }

  const newId = `JOB-${1000 + jobs.length + 1}`;
  const newJob = {
    id: newId,
    title,
    companyName,
    companyContact: companyContact || {
      email: `hr@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: "+91 98470 00000",
      website: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      address: location || "Remote",
      contactPerson: "HR Manager"
    },
    techStack,
    jobType: jobType || "Full-time",
    experienceLevel: experienceLevel || "Mid-Level (2-5 yrs)",
    salaryRange: salaryRange || "₹10,00,000 - ₹15,00,000 LPA",
    location: location || "Remote (India)",
    description: description || "Exciting engineering role working with cutting-edge tech stack.",
    responsibilities: responsibilities || ["Design and develop applications.", "Collaborate with cross-functional teams."],
    requiredSkills: requiredSkills || [techStack, "JavaScript", "REST API"],
    education: "B.Tech / B.E in CS/IT or equivalent",
    postedDate: new Date().toISOString().split('T')[0],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Active"
  };

  jobs.unshift(newJob);
  if (saveJobs(jobs)) {
    return res.status(201).json({
      success: true,
      message: "Job vacancy added successfully.",
      data: newJob
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "Failed to save job vacancy."
    });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job vacancy
 */
app.put('/api/jobs/:id', (req, res) => {
  const jobs = loadJobs();
  const index = jobs.findIndex(j => j.id.toLowerCase() === req.params.id.toLowerCase());

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Job position with ID '${req.params.id}' not found.`
    });
  }

  const updatedJob = { ...jobs[index], ...req.body, id: jobs[index].id };
  jobs[index] = updatedJob;

  if (saveJobs(jobs)) {
    res.json({
      success: true,
      message: `Job position '${updatedJob.id}' updated successfully.`,
      data: updatedJob
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Failed to update job record."
    });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job position
 */
app.delete('/api/jobs/:id', (req, res) => {
  let jobs = loadJobs();
  const initialLength = jobs.length;
  jobs = jobs.filter(j => j.id.toLowerCase() !== req.params.id.toLowerCase());

  if (jobs.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: `Job position with ID '${req.params.id}' not found.`
    });
  }

  if (saveJobs(jobs)) {
    res.json({
      success: true,
      message: `Job position '${req.params.id}' deleted successfully.`
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Failed to delete job position."
    });
  }
});

// Fallback to index.html for single page application
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Tech Jobs Backend REST API Server is running!`);
  console.log(`🌐 Portal & API URL: http://localhost:${PORT}`);
  console.log(`📡 GET All Jobs:      http://localhost:${PORT}/api/jobs`);
  console.log(`📡 GET Single Job:    http://localhost:${PORT}/api/jobs/JOB-1001`);
  console.log(`📊 GET Summary Stats: http://localhost:${PORT}/api/jobs/stats/summary`);
  console.log(`====================================================`);
});
