const express = require('express');
const cors = require('cors');
const path = require('path');
const { studentData, techStacks } = require('./data/students');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Serve static frontend dashboard portal
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * @route   GET /api/health
 * @desc    Check server health status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'Node.js Student Data REST API Server is running smoothly.',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

/**
 * @route   GET /api/stats
 * @desc    Get aggregate statistics of 100 students
 */
app.get('/api/stats', (req, res) => {
  const stackCounts = {};
  const locationCounts = {};
  const expCounts = {};
  let totalSubtopicsCount = 0;

  studentData.forEach(student => {
    // Stack breakdown
    stackCounts[student.mainTechStack] = (stackCounts[student.mainTechStack] || 0) + 1;
    // Location breakdown
    locationCounts[student.location] = (locationCounts[student.location] || 0) + 1;
    // Experience breakdown
    expCounts[student.experienceLevel] = (expCounts[student.experienceLevel] || 0) + 1;

    // Subtopic count
    student.skills.forEach(s => {
      totalSubtopicsCount += s.subtopics ? s.subtopics.length : 0;
    });
  });

  res.json({
    success: true,
    totalStudents: studentData.length,
    totalSubtopicsSkills: totalSubtopicsCount,
    techStackBreakdown: stackCounts,
    locationBreakdown: locationCounts,
    experienceBreakdown: expCounts,
    availableTechStacks: techStacks
  });
});

/**
 * @route   GET /api/students
 * @desc    Get list of all 100 students with search, filter, and pagination
 * @query   q, techStack, skill, page, limit
 */
app.get('/api/students', (req, res) => {
  let { q, techStack, skill, page = 1, limit = 100 } = req.query;

  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 100;

  let results = [...studentData];

  // Filter by Main Tech Stack (e.g. MEAN, Python, Android, iOS)
  if (techStack) {
    const searchStack = techStack.toLowerCase().trim();
    results = results.filter(s => 
      s.mainTechStack.toLowerCase().includes(searchStack)
    );
  }

  // Filter by Skill topic or subtopic
  if (skill) {
    const searchSkill = skill.toLowerCase().trim();
    results = results.filter(student => 
      student.skills.some(sk => 
        sk.topic.toLowerCase().includes(searchSkill) ||
        sk.category.toLowerCase().includes(searchSkill) ||
        sk.subtopics.some(sub => sub.toLowerCase().includes(searchSkill))
      )
    );
  }

  // General Search query (Name, Email, Mobile, TechStack, Location, Skill)
  if (q) {
    const query = q.toLowerCase().trim();
    results = results.filter(student => {
      const matchBasic = 
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.mobile.toLowerCase().includes(query) ||
        student.location.toLowerCase().includes(query) ||
        student.mainTechStack.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query);

      const matchSkills = student.skills.some(sk => 
        sk.topic.toLowerCase().includes(query) ||
        sk.subtopics.some(sub => sub.toLowerCase().includes(query))
      );

      return matchBasic || matchSkills;
    });
  }

  // Pagination calculation
  const totalFiltered = results.length;
  const totalPages = Math.ceil(totalFiltered / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = results.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    totalRecords: studentData.length,
    filteredRecords: totalFiltered,
    page: page,
    limit: limit,
    totalPages: totalPages,
    data: paginatedData
  });
});

/**
 * @route   GET /api/students/:id
 * @desc    Get single student details by Student ID (e.g. STU001)
 */
app.get('/api/students/:id', (req, res) => {
  const studentId = req.params.id.toUpperCase();
  const student = studentData.find(s => s.id.toUpperCase() === studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with ID '${req.params.id}' not found.`
    });
  }

  res.json({
    success: true,
    data: student
  });
});

// Fallback route for SPA / Web Portal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Student Data Node.js REST API Server is Live!`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📡 REST API Endpoint: http://localhost:${PORT}/api/students`);
    console.log(`📊 Stats Endpoint: http://localhost:${PORT}/api/stats`);
    console.log(`===================================================`);
  });
}

module.exports = app;

