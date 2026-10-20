# 🎓 Campus Career AI Platform

> An Intelligent Campus Placement & Recruitment Ecosystem powered by **Claude AI**, **Model Context Protocol (MCP)**, **Node.js/Express REST APIs**, and Interactive Web Portals.

---

## 🌟 Overview

**Campus Career AI Platform** bridges the gap between graduating university students and hiring tech companies using Generative AI. 

The platform integrates two independent high-performance REST API services (hosting 100 comprehensive student profiles and 100 enterprise job vacancies) with a unified **Model Context Protocol (MCP)** server. This allows **Claude Desktop AI** to act as an intelligent autonomous recruiter and career counselor directly within the chat interface.

```
                           +------------------------+
                           |   Claude Desktop AI    |
                           |  (Chat Interface & UI) |
                           +-----------+------------+
                                       |
                                       | (Stdio JSON-RPC 2.0)
                                       v
                    +--------------------------------------+
                    |        claude-mcp-server             |
                    |   (Model Context Protocol Gateway)   |
                    |  - 8 Specialized AI Tools            |
                    |  - AI Candidate Scoring Algorithm    |
                    |  - AI Job Recommendation Matcher     |
                    +------------------+-------------------+
                                       |
                  +--------------------+--------------------+
                  |                                         |
                  v                                         v
     +--------------------------+              +--------------------------+
     |      student-server      |              |      company-server      |
     | (Port 3000 / Express API)|              | (Port 5000 / Express API)|
     | - 100 Student Profiles   |              | - 100 Tech Job Openings  |
     | - Interactive Web Portal |              | - Interactive Web Portal |
     +--------------------------+              +--------------------------+
```

---

## 🚀 Key Features

### 1. 👨‍🎓 Student Data Server (`/student-server`)
* **REST API:** Serves 100 student records with names, contacts, locations, GPAs, graduation years, and detailed multi-tier technical skill taxonomies (MERN, MEAN, Python, iOS, Android, AI/Data Science, Java).
* **Interactive Web Portal:** Runs on `http://localhost:3000` with filtering by tech stack, skill keywords, and experience levels.
* **Production-ready:** Pre-configured with `vercel.json` for serverless deployment.

### 2. 🏢 Company & Job Portal Server (`/company-server`)
* **REST API:** Serves 100 verified company job vacancies featuring real-world tech stacks, job descriptions, responsibilities, required skills, salary ranges, and hiring manager contacts.
* **Interactive Web Portal:** Runs on `http://localhost:5000` with instant search, location filters, and salary breakdowns.

### 3. 🧠 Claude MCP Server (`/claude-mcp-server`)
Connects Claude Desktop directly to the datasets via 8 registered AI tools:
1. `search_students`: Multi-parameter filtering across 100 student records.
2. `get_student_by_id`: Fetches complete student portfolio, GPA, and contact info.
3. `get_student_stats`: Aggregate statistics across the student talent pool.
4. `search_jobs`: Real-time query matching across 100 enterprise job openings.
5. `get_job_by_id`: Fetches detailed job description and talent acquisition contacts.
6. `get_job_stats`: Analysis of top hiring companies and salary distributions.
7. `match_students_for_job`: **AI Recruiter** ranks students for any job opening based on stack alignment and skill overlaps.
8. `match_jobs_for_student`: **AI Career Counselor** identifies top-matching job opportunities for any given student profile.

---

## 📂 Project Structure

```
Campus-Career-AI-Platform/
├── package.json                       # Root script orchestrator
├── README.md                          # Project documentation
├── .gitignore                         # Git ignore rules
│
├── student-server/                    # Student Portal & REST API (Port 3000)
│   ├── server.js                      # Express application
│   ├── package.json                   # Dependencies
│   ├── vercel.json                    # Vercel deployment config
│   ├── data/students.js               # 100 student profiles dataset
│   └── public/                        # Web Portal UI (HTML, CSS, JS)
│
├── company-server/                    # Job Portal & REST API (Port 5000)
│   ├── server.js                      # Express application
│   ├── package.json                   # Dependencies
│   ├── generate_jobs.js               # Dataset generator script
│   ├── data/jobs.json                 # 100 company vacancies dataset
│   └── public/                        # Web Portal UI (HTML, CSS, JS)
│
└── claude-mcp-server/                 # Claude Desktop MCP Integration
    ├── index.js                       # Stdio JSON-RPC 2.0 MCP Server
    ├── test.js                        # Automated test suite (6/6 tests passing)
    ├── package.json                   # Zero-dependency setup
    ├── claude_desktop_config.json      # Configuration template
    ├── install_claude_config.sh       # One-click installation script
    └── data/                          # Bundled offline datasets
```

---

## 🛠️ Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/Sinan-ck/Campus-Career-AI-Platform.git
cd Campus-Career-AI-Platform
```

### 2. Run the Web Dashboards
To launch both the Student Portal (Port 3000) and the Company Portal (Port 5000):
```bash
# Start Student Server
npm run start:student

# In another terminal: Start Company Server
npm run start:company
```
* **Student Web Portal:** [http://localhost:3000](http://localhost:3000)
* **Company Job Portal:** [http://localhost:5000](http://localhost:5000)

### 3. Connect to Claude Desktop (MCP)
Run the automated config installer to register the MCP server with Claude Desktop:
```bash
npm run setup:claude
```
Then restart Claude Desktop (`Cmd + Q` and reopen).

To verify the MCP server tools without opening Claude:
```bash
npm run test:mcp
```

---

## 💬 Example Prompts to Ask Claude

Once connected to Claude Desktop, you can ask questions naturally:

* *"Show me students with experience in Python and PyTorch with GPA above 8.5."*
* *"Who are the top 3 best-matching candidates for job JOB-1001 (Senior MERN Developer at TechNova)?"*
* *"Pull up the profile for student STU001 and recommend the best job vacancies for them."*
* *"Which companies are hiring for DevOps engineers, and what are their salary packages?"*
* *"Give me an executive summary of our student tech stacks versus available company vacancies."*

---

## 👤 Author

* **Mohammed Sinan CK**  
* GitHub: [@Sinan-ck](https://github.com/Sinan-ck)
* Email: mohammedsinan123ck@gmail.com

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
