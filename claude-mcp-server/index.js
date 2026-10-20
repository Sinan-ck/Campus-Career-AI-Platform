#!/usr/bin/env node

/**
 * Career & Campus Placement MCP Server for Claude Desktop
 * Connects 100 Student Profiles and 100 Company Job Openings
 * Implements Model Context Protocol (MCP) JSON-RPC 2.0 over stdio
 */

const readline = require('readline');
const path = require('path');

// Load Data
const { studentData } = require('./data/students');
const jobsData = require('./data/jobs.json');

// Helper: extract all skills of a student into a flat lowercase array
function getStudentSkillSet(student) {
  const set = new Set();
  if (student.mainTechStack) set.add(student.mainTechStack.toLowerCase());
  if (Array.isArray(student.skills)) {
    for (const sk of student.skills) {
      if (sk.category) set.add(sk.category.toLowerCase());
      if (sk.topic) set.add(sk.topic.toLowerCase());
      if (Array.isArray(sk.subtopics)) {
        for (const sub of sk.subtopics) {
          set.add(sub.toLowerCase());
        }
      }
    }
  }
  return set;
}

// Helper: check if query matches text
function matchesText(target, query) {
  if (!target || !query) return false;
  return target.toLowerCase().includes(query.toLowerCase());
}

// Tool Definitions for MCP
const TOOLS = [
  {
    name: 'search_students',
    description: 'Search across 100 student dummy records by name, skill, tech stack, experience level, location, or GPA.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search keyword (name, skill, keyword, roll number)'
        },
        techStack: {
          type: 'string',
          description: 'Tech stack filter (e.g., "MERN Stack", "Python Stack", "MEAN Stack", "Android Stack", "iOS Stack", "Data Science & AI", "Flutter Stack", "Java Enterprise")'
        },
        skill: {
          type: 'string',
          description: 'Specific skill/framework (e.g., "React", "Docker", "PyTorch", "Node.js", "MongoDB", "Angular")'
        },
        experienceLevel: {
          type: 'string',
          description: 'Experience level: "Beginner", "Intermediate", or "Advanced"'
        },
        location: {
          type: 'string',
          description: 'City/location filter (e.g., "Bangalore", "Kochi", "Mumbai", "Hyderabad")'
        },
        minGpa: {
          type: 'number',
          description: 'Minimum GPA threshold (0.0 - 10.0)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of student records to return (default: 10, max: 50)'
        }
      }
    }
  },
  {
    name: 'get_student_by_id',
    description: 'Retrieve complete profile details of a specific student using their ID (e.g., "STU001" to "STU100").',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'The unique student ID (e.g., "STU001", "STU042")'
        }
      }
    }
  },
  {
    name: 'get_student_stats',
    description: 'Get aggregate overview statistics of the 100 students (distribution of tech stacks, experience levels, average GPA).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'search_jobs',
    description: 'Search across 100 company job openings by job title, company name, required skills, tech stack, location, or job type.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search keyword across job titles, descriptions, and company names'
        },
        companyName: {
          type: 'string',
          description: 'Filter by hiring company name'
        },
        techStack: {
          type: 'string',
          description: 'Filter by required tech stack (e.g., "MERN Stack", "Python Stack", "Data Science & AI")'
        },
        skill: {
          type: 'string',
          description: 'Specific skill required (e.g., "Docker", "AWS", "MongoDB", "Kubernetes")'
        },
        location: {
          type: 'string',
          description: 'Filter by job location (e.g., "Kochi, Kerala", "Bangalore, Karnataka", "Remote")'
        },
        jobType: {
          type: 'string',
          description: 'Job type (e.g., "Full-time", "Internship", "Remote")'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of jobs to return (default: 10, max: 50)'
        }
      }
    }
  },
  {
    name: 'get_job_by_id',
    description: 'Retrieve full job description and company contact details for a specific job ID (e.g., "JOB-1001" to "JOB-1100").',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          description: 'The unique job ID (e.g., "JOB-1001", "JOB-1025")'
        }
      }
    }
  },
  {
    name: 'get_job_stats',
    description: 'Get aggregate statistics of all 100 company vacancies (top hiring companies, popular tech stacks, job types, salary insights).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'match_students_for_job',
    description: 'AI Recruitment Matcher: Finds and ranks the best qualified students for a given company job vacancy based on skills, tech stack, and GPA.',
    inputSchema: {
      type: 'object',
      required: ['jobId'],
      properties: {
        jobId: {
          type: 'string',
          description: 'The job vacancy ID to find matching candidates for (e.g., "JOB-1001")'
        },
        limit: {
          type: 'number',
          description: 'Number of top candidate matches to return (default: 5)'
        }
      }
    }
  },
  {
    name: 'match_jobs_for_student',
    description: 'AI Career Guidance: Finds and ranks the best matching job openings for a given student based on their profile, skills, and tech stack.',
    inputSchema: {
      type: 'object',
      required: ['studentId'],
      properties: {
        studentId: {
          type: 'string',
          description: 'The student ID to recommend jobs for (e.g., "STU001")'
        },
        limit: {
          type: 'number',
          description: 'Number of top job recommendations to return (default: 5)'
        }
      }
    }
  }
];

// Tool Handlers
function handleSearchStudents(args = {}) {
  let results = [...studentData];

  if (args.query) {
    const q = args.query.toLowerCase();
    results = results.filter(s => {
      if (s.name.toLowerCase().includes(q)) return true;
      if (s.id.toLowerCase().includes(q)) return true;
      if (s.email.toLowerCase().includes(q)) return true;
      if (s.mainTechStack.toLowerCase().includes(q)) return true;
      const skills = getStudentSkillSet(s);
      for (const sk of skills) {
        if (sk.includes(q)) return true;
      }
      return false;
    });
  }

  if (args.techStack) {
    const ts = args.techStack.toLowerCase();
    results = results.filter(s => s.mainTechStack.toLowerCase().includes(ts));
  }

  if (args.skill) {
    const skTarget = args.skill.toLowerCase();
    results = results.filter(s => {
      const skills = getStudentSkillSet(s);
      for (const sk of skills) {
        if (sk.includes(skTarget)) return true;
      }
      return false;
    });
  }

  if (args.experienceLevel) {
    const exp = args.experienceLevel.toLowerCase();
    results = results.filter(s => s.experienceLevel.toLowerCase() === exp);
  }

  if (args.location) {
    const loc = args.location.toLowerCase();
    results = results.filter(s => s.location.toLowerCase().includes(loc));
  }

  if (args.minGpa !== undefined) {
    results = results.filter(s => s.gpa >= args.minGpa);
  }

  const limit = Math.min(Math.max(args.limit || 10, 1), 50);
  const totalFound = results.length;
  const returnedResults = results.slice(0, limit);

  return {
    totalFound,
    limit,
    showing: returnedResults.length,
    students: returnedResults.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      location: s.location,
      mainTechStack: s.mainTechStack,
      experienceLevel: s.experienceLevel,
      gpa: s.gpa,
      skillsSummary: s.skills.map(sk => `${sk.topic} (${(sk.subtopics || []).slice(0, 3).join(', ')})`).join(' | ')
    }))
  };
}

function handleGetStudentById(args = {}) {
  const student = studentData.find(s => s.id.toUpperCase() === (args.id || '').toUpperCase());
  if (!student) {
    return { error: `Student with ID "${args.id}" not found. Valid IDs range from STU001 to STU100.` };
  }
  return { student };
}

function handleGetStudentStats() {
  const stackCounts = {};
  const expCounts = {};
  let totalGpa = 0;

  for (const s of studentData) {
    stackCounts[s.mainTechStack] = (stackCounts[s.mainTechStack] || 0) + 1;
    expCounts[s.experienceLevel] = (expCounts[s.experienceLevel] || 0) + 1;
    totalGpa += s.gpa;
  }

  return {
    totalStudents: studentData.length,
    averageGpa: parseFloat((totalGpa / studentData.length).toFixed(2)),
    techStackBreakdown: stackCounts,
    experienceLevelBreakdown: expCounts
  };
}

function handleSearchJobs(args = {}) {
  let results = [...jobsData];

  if (args.query) {
    const q = args.query.toLowerCase();
    results = results.filter(j => {
      if (j.title.toLowerCase().includes(q)) return true;
      if (j.companyName.toLowerCase().includes(q)) return true;
      if (j.description.toLowerCase().includes(q)) return true;
      if (j.techStack.toLowerCase().includes(q)) return true;
      if (Array.isArray(j.requiredSkills)) {
        for (const r of j.requiredSkills) {
          if (r.toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }

  if (args.companyName) {
    const c = args.companyName.toLowerCase();
    results = results.filter(j => j.companyName.toLowerCase().includes(c));
  }

  if (args.techStack) {
    const ts = args.techStack.toLowerCase();
    results = results.filter(j => j.techStack.toLowerCase().includes(ts));
  }

  if (args.skill) {
    const s = args.skill.toLowerCase();
    results = results.filter(j => {
      if (!Array.isArray(j.requiredSkills)) return false;
      return j.requiredSkills.some(sk => sk.toLowerCase().includes(s));
    });
  }

  if (args.location) {
    const loc = args.location.toLowerCase();
    results = results.filter(j => j.location.toLowerCase().includes(loc));
  }

  if (args.jobType) {
    const jt = args.jobType.toLowerCase();
    results = results.filter(j => j.jobType.toLowerCase().includes(jt));
  }

  const limit = Math.min(Math.max(args.limit || 10, 1), 50);
  const totalFound = results.length;
  const returnedJobs = results.slice(0, limit);

  return {
    totalFound,
    limit,
    showing: returnedJobs.length,
    jobs: returnedJobs.map(j => ({
      id: j.id,
      title: j.title,
      companyName: j.companyName,
      techStack: j.techStack,
      salaryRange: j.salaryRange,
      location: j.location,
      jobType: j.jobType,
      experienceLevel: j.experienceLevel,
      requiredSkills: j.requiredSkills,
      contactEmail: j.companyContact?.email
    }))
  };
}

function handleGetJobById(args = {}) {
  const job = jobsData.find(j => j.id.toUpperCase() === (args.id || '').toUpperCase());
  if (!job) {
    return { error: `Job with ID "${args.id}" not found. Valid IDs range from JOB-1001 to JOB-1100.` };
  }
  return { job };
}

function handleGetJobStats() {
  const companyCounts = {};
  const stackCounts = {};
  const typeCounts = {};

  for (const j of jobsData) {
    companyCounts[j.companyName] = (companyCounts[j.companyName] || 0) + 1;
    stackCounts[j.techStack] = (stackCounts[j.techStack] || 0) + 1;
    typeCounts[j.jobType] = (typeCounts[j.jobType] || 0) + 1;
  }

  return {
    totalVacancies: jobsData.length,
    uniqueCompanies: Object.keys(companyCounts).length,
    techStackBreakdown: stackCounts,
    jobTypes: typeCounts,
    topCompaniesHiring: Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, openPositions: count }))
  };
}

function handleMatchStudentsForJob(args = {}) {
  const job = jobsData.find(j => j.id.toUpperCase() === (args.jobId || '').toUpperCase());
  if (!job) {
    return { error: `Job with ID "${args.jobId}" not found.` };
  }

  const jobStack = job.techStack.toLowerCase();
  const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

  const scoredStudents = studentData.map(student => {
    let score = 0;
    const matchedSkills = [];
    const studentSkillSet = getStudentSkillSet(student);

    // Tech stack match
    if (student.mainTechStack.toLowerCase().includes(jobStack) || jobStack.includes(student.mainTechStack.toLowerCase())) {
      score += 40;
    }

    // Individual skill match
    for (const req of requiredSkills) {
      let found = false;
      for (const sk of studentSkillSet) {
        if (sk.includes(req) || req.includes(sk)) {
          found = true;
          break;
        }
      }
      if (found) {
        score += 10;
        matchedSkills.push(req);
      }
    }

    // GPA score bonus (up to 10 points)
    if (student.gpa) {
      score += Math.min(10, (student.gpa / 10) * 10);
    }

    const maxPossibleScore = 40 + (requiredSkills.length * 10) + 10;
    const matchPercentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));

    return {
      studentId: student.id,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      location: student.location,
      mainTechStack: student.mainTechStack,
      experienceLevel: student.experienceLevel,
      gpa: student.gpa,
      matchPercentage,
      matchedSkillsCount: matchedSkills.length,
      matchedSkills
    };
  });

  scoredStudents.sort((a, b) => b.matchPercentage - a.matchPercentage);

  const limit = Math.min(Math.max(args.limit || 5, 1), 20);
  return {
    job: {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      techStack: job.techStack,
      salaryRange: job.salaryRange,
      requiredSkills: job.requiredSkills
    },
    totalCandidatesEvaluated: studentData.length,
    topMatches: scoredStudents.slice(0, limit)
  };
}

function handleMatchJobsForStudent(args = {}) {
  const student = studentData.find(s => s.id.toUpperCase() === (args.studentId || '').toUpperCase());
  if (!student) {
    return { error: `Student with ID "${args.studentId}" not found.` };
  }

  const studentStack = student.mainTechStack.toLowerCase();
  const studentSkillSet = getStudentSkillSet(student);

  const scoredJobs = jobsData.map(job => {
    let score = 0;
    const matchedSkills = [];
    const jobStack = job.techStack.toLowerCase();
    const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

    // Tech stack match
    if (studentStack.includes(jobStack) || jobStack.includes(studentStack)) {
      score += 40;
    }

    // Individual skill match
    for (const req of requiredSkills) {
      let found = false;
      for (const sk of studentSkillSet) {
        if (sk.includes(req) || req.includes(sk)) {
          found = true;
          break;
        }
      }
      if (found) {
        score += 10;
        matchedSkills.push(req);
      }
    }

    const maxPossibleScore = 40 + (requiredSkills.length * 10);
    const matchPercentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));

    return {
      jobId: job.id,
      title: job.title,
      companyName: job.companyName,
      techStack: job.techStack,
      salaryRange: job.salaryRange,
      location: job.location,
      jobType: job.jobType,
      contactEmail: job.companyContact?.email,
      matchPercentage,
      matchedSkills
    };
  });

  scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

  const limit = Math.min(Math.max(args.limit || 5, 1), 20);
  return {
    student: {
      id: student.id,
      name: student.name,
      mainTechStack: student.mainTechStack,
      experienceLevel: student.experienceLevel,
      gpa: student.gpa
    },
    totalJobsEvaluated: jobsData.length,
    topJobRecommendations: scoredJobs.slice(0, limit)
  };
}

// Router for tool calls
function executeTool(name, args) {
  switch (name) {
    case 'search_students':
      return handleSearchStudents(args);
    case 'get_student_by_id':
      return handleGetStudentById(args);
    case 'get_student_stats':
      return handleGetStudentStats();
    case 'search_jobs':
      return handleSearchJobs(args);
    case 'get_job_by_id':
      return handleGetJobById(args);
    case 'get_job_stats':
      return handleGetJobStats();
    case 'match_students_for_job':
      return handleMatchStudentsForJob(args);
    case 'match_jobs_for_student':
      return handleMatchJobsForStudent(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC Dispatcher
function handleJsonRpc(message) {
  const { id, method, params } = message;

  // Handle Notifications (no response needed)
  if (method === 'notifications/initialized') {
    return null;
  }

  // Handle Requests
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'career-mcp-server',
          version: '1.0.0'
        }
      }
    };
  }

  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: TOOLS
      }
    };
  }

  if (method === 'tools/call') {
    try {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const output = executeTool(toolName, toolArgs);

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(output, null, 2)
            }
          ]
        }
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: err.message
        }
      };
    }
  }

  // Fallback for unknown methods
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  };
}

// Main stdio loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const parsed = JSON.parse(trimmed);
    const response = handleJsonRpc(parsed);
    if (response) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    console.error('Error parsing JSON-RPC line:', err.message);
  }
});

console.error('[career-mcp-server] MCP Server initialized and listening on stdio.');
