const fs = require('fs');
const path = require('path');

const techStacks = [
  {
    category: "MERN Stack",
    titles: ["Senior MERN Stack Developer", "Lead MERN Engineer", "Full Stack React/Node Developer", "MERN Stack Specialist", "Junior MERN Developer", "Principal Full Stack Architect (MERN)"],
    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "TypeScript", "Redux Toolkit", "Next.js", "GraphQL", "Tailwind CSS", "REST APIs", "Docker", "Jest"],
    descriptions: [
      "We are seeking an experienced MERN Stack Developer to build high-performance, scalable web applications for enterprise clients. You will be responsible for managing the front-end and back-end services, designing database schemas, and building responsive user interfaces.",
      "Join our fast-growing SaaS startup as a Senior MERN Developer. You will drive feature development for our core web portal, integrate third-party payment gateways, and optimize API performance.",
      "Looking for a passionate Full Stack Engineer proficient in MERN stack to craft slick web portals, real-time dashboards, and robust microservices."
    ]
  },
  {
    category: "MEAN Stack",
    titles: ["Senior MEAN Stack Engineer", "Full Stack Angular/Node Developer", "MEAN Stack Tech Lead", "Angular & Express Developer", "Junior MEAN Developer"],
    skills: ["MongoDB", "Express.js", "Angular 17+", "Node.js", "TypeScript", "RxJS", "NgRx", "RESTful APIs", "WebSockets", "Jasmine", "CI/CD"],
    descriptions: [
      "Seeking a MEAN Stack Specialist with deep expertise in Angular and Node.js to architect high-throughput web portals and enterprise workflow management systems.",
      "Join our enterprise solutions team building cloud-native dashboards powered by Angular and Node/Express backend APIs with MongoDB database."
    ]
  },
  {
    category: "Python / Django",
    titles: ["Senior Python/Django Developer", "Backend Python Engineer (Django/FastAPI)", "Python Software Architect", "Django Full Stack Engineer", "Python API Developer"],
    skills: ["Python 3.11+", "Django", "Django REST Framework", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker", "PyTest", "GraphQL", "AWS"],
    descriptions: [
      "We are hiring a Python/Django Backend Specialist to construct resilient microservices, asynchronous task queues with Celery/Redis, and clean RESTful APIs.",
      "Looking for a Python Developer to build data-intensive backends, manage complex ORM models, and integrate machine learning models into live APIs."
    ]
  },
  {
    category: "iOS Development",
    titles: ["Senior iOS App Developer", "iOS Tech Lead (SwiftUI/Combine)", "Mobile Engineer (iOS)", "Junior iOS Developer", "iOS UI/UX & Native Engineer"],
    skills: ["Swift 5.9+", "SwiftUI", "UIKit", "Combine", "CoreData", "XCTest", "REST APIs", "Clean Architecture / MVVM", "CoreAnimation", "App Store Publishing"],
    descriptions: [
      "Craft modern, pixel-perfect native iOS applications using Swift and SwiftUI. You will work on real-time media streaming, offline caching, and intuitive user interfaces.",
      "Seeking an ambitious iOS Engineer to innovate our flagship mobile application. Deep knowledge of Apple HIG, Combine framework, and memory management required."
    ]
  },
  {
    category: "Android Development",
    titles: ["Senior Android Developer (Kotlin)", "Android Tech Lead", "Mobile Engineer (Android / Jetpack Compose)", "Android Application Specialist", "Junior Android Dev"],
    skills: ["Kotlin", "Jetpack Compose", "Coroutines & Flow", "Room DB", "Hilt / Dagger", "Retrofit", "MVVM / MVI Architecture", "Gradle", "JUnit / Espresso"],
    descriptions: [
      "We are looking for an Android Engineer who loves building beautiful native Android apps with Jetpack Compose, Kotlin Coroutines, and modern Android architecture components.",
      "Join our mobile product team to deliver scalable native Android applications with slick offline synchronization and high-grade security features."
    ]
  },
  {
    category: "DevOps & Cloud",
    titles: ["DevOps Engineer", "Cloud Infrastructure Architect", "Site Reliability Engineer (SRE)", "Kubernetes & Cloud Specialist", "DevSecOps Lead"],
    skills: ["AWS", "Terraform", "Kubernetes (EKS)", "Docker", "CI/CD (GitHub Actions / Jenkins)", "Ansible", "Prometheus & Grafana", "Linux Shell Scripting", "Python"],
    descriptions: [
      "Automate cloud deployments, establish zero-downtime CI/CD pipelines, manage Kubernetes clusters on AWS/GCP, and optimize system reliability and uptime.",
      "Seeking a DevOps Specialist to streamline containerized application deployment, infrastructure as code with Terraform, and active cloud security monitoring."
    ]
  },
  {
    category: "Data Science & AI",
    titles: ["AI / ML Engineer (LLMs & RAG)", "Data Scientist", "Machine Learning Specialist", "AI Back-End Engineer", "Computer Vision Specialist"],
    skills: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "LangChain / LlamaIndex", "HuggingFace", "FastAPI", "Vector DBs (Pinecone/Chroma)", "OpenCV", "Pandas & NumPy"],
    descriptions: [
      "Design and deploy production Generative AI applications, fine-tune LLM models, build RAG pipelines, and integrate AI capabilities into customer-facing web services.",
      "Looking for a Data Scientist / ML Engineer to build predictive models, recommendation engines, and high-performance NLP solutions."
    ]
  },
  {
    category: "Flutter / Cross-Platform",
    titles: ["Senior Flutter Engineer", "Cross-Platform Mobile Developer (Flutter/Dart)", "Lead Flutter App Developer", "React Native & Flutter Engineer"],
    skills: ["Flutter", "Dart", "Provider / BLoC State Management", "Firebase", "REST APIs", "Native iOS/Android Bridge", "SQLite", "App Performance Optimization"],
    descriptions: [
      "Build high-performance cross-platform iOS and Android mobile apps from a single Flutter codebase with smooth animations and complex state management.",
      "Looking for a skilled Flutter Engineer to build modern fintech and e-commerce mobile applications with real-time push notifications and secure payment integration."
    ]
  },
  {
    category: "Java / Spring Boot",
    titles: ["Senior Java Backend Engineer", "Spring Boot Microservices Architect", "Java Enterprise Developer", "Lead Java Developer"],
    skills: ["Java 17/21", "Spring Boot", "Spring Cloud", "Hibernate / JPA", "PostgreSQL / MySQL", "Apache Kafka", "Redis", "Maven/Gradle", "Docker", "Microservices"],
    descriptions: [
      "Architect and scale cloud-native enterprise microservices using Spring Boot, Kafka, and PostgreSQL for high-volume financial transaction processing.",
      "Join our enterprise backend team building fault-tolerant microservices, distributed caches with Redis, and message-driven architectures."
    ]
  },
  {
    category: "Go / Microservices",
    titles: ["Golang Backend Developer", "Senior Go Systems Engineer", "Go / Microservices Lead", "Backend Engineer (Go & gRPC)"],
    skills: ["Go (Golang)", "gRPC", "Protobuf", "Docker", "Kubernetes", "PostgreSQL", "Redis", "Kafka", "RESTful APIs", "Microservices Architecture"],
    descriptions: [
      "Develop ultra-low latency, concurrent backends and microservices in Go. Experience with gRPC, distributed systems, and cloud-native architecture is key.",
      "Seeking a Go Backend Developer to build high-concurrency event-driven systems and microservices serving millions of API calls daily."
    ]
  }
];

const companies = [
  { name: "TechNova Solutions", domain: "technovasolutions.com", city: "Kochi, Kerala", address: "Infopark Phase 2, Kakkanad, Kochi" },
  { name: "CloudScale Systems", domain: "cloudscalesystems.io", city: "Bangalore, Karnataka", address: "Outer Ring Road, Bellandur, Bangalore" },
  { name: "AeroCode Labs", domain: "aerocode.ai", city: "Trivandrum, Kerala", address: "Technopark Phase 3, Trivandrum" },
  { name: "DevNexus Global", domain: "devnexus.com", city: "Remote (India)", address: "HSR Layout Sector 1, Bangalore (HQ)" },
  { name: "ByteForge Technologies", domain: "byteforge.dev", city: "Hyderabad, Telangana", address: "HITEC City, Madhapur, Hyderabad" },
  { name: "Apex AI Systems", domain: "apexai.co", city: "Bangalore, Karnataka", address: "Indiranagar 100ft Road, Bangalore" },
  { name: "CyberPulse Networks", domain: "cyberpulse.tech", city: "Pune, Maharashtra", address: "Viman Nagar, Pune" },
  { name: "InfiniCode India", domain: "infinicode.in", city: "Calicut, Kerala", address: "Government Cyberpark, Calicut" },
  { name: "DataVibe Analytics", domain: "datavibe.io", city: "Kochi, Kerala", address: "SmartCity Campus, Kakkanad, Kochi" },
  { name: "OmniTech Global", domain: "omnitechglobal.org", city: "Trivandrum, Kerala", address: "Technopark Phase 1, Trivandrum" },
  { name: "NexusMobility Labs", domain: "nexusmobility.com", city: "Bangalore, Karnataka", address: "Koramangala 4th Block, Bangalore" },
  { name: "Vanguard Software Solutions", domain: "vanguardsoft.in", city: "Chennai, Tamil Nadu", address: "OMR IT Expressway, Chennai" },
  { name: "ZetaStack Systems", domain: "zetastack.dev", city: "Kochi, Kerala", address: "Cyber Fort, Seaport-Airport Road, Kochi" },
  { name: "CodeCraft Digital", domain: "codecraft.co", city: "Remote (India)", address: "WeWork Financial District, Hyderabad" },
  { name: "PulseDigital Labs", domain: "pulsedigital.tech", city: "Pune, Maharashtra", address: "Kharadi IT Park, Pune" },
  { name: "Skyline Software Labs", domain: "skylinesoft.io", city: "Trivandrum, Kerala", address: "Kinfra IT Park, Kazhakkoottam, Trivandrum" },
  { name: "MatrixByte Innovations", domain: "matrixbyte.ai", city: "Bangalore, Karnataka", address: "Whitefield Main Road, Bangalore" },
  { name: "QuantumApp Studios", domain: "quantumapps.dev", city: "Kochi, Kerala", address: "Infopark Technology Business Incubator, Kochi" }
];

const hrContacts = [
  { name: "Anjali Nair", phone: "+91 98470 12345" },
  { name: "Rohan Sharma", phone: "+91 98951 67890" },
  { name: "Priya Menon", phone: "+91 97452 34567" },
  { name: "Siddharth Verma", phone: "+91 99613 45678" },
  { name: "Kavya Pillai", phone: "+91 94474 56789" },
  { name: "Arjun Das", phone: "+91 98465 67891" },
  { name: "Meera Viswanathan", phone: "+91 97466 78902" },
  { name: "Deepak Kumar", phone: "+91 99957 89013" }
];

const jobTypes = ["Full-time", "Full-time", "Full-time", "Remote", "Hybrid", "Contract"];
const experienceLevels = ["Junior (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5-8 yrs)", "Lead / Architect (8+ yrs)"];

const salaryRanges = {
  "Junior (0-2 yrs)": ["₹5,00,000 - ₹8,00,000 LPA", "₹6,00,000 - ₹9,50,000 LPA", "₹7,00,000 - ₹10,00,000 LPA"],
  "Mid-Level (2-5 yrs)": ["₹10,00,000 - ₹16,00,000 LPA", "₹12,00,000 - ₹18,00,000 LPA", "₹14,00,000 - ₹20,00,000 LPA"],
  "Senior (5-8 yrs)": ["₹18,00,000 - ₹28,00,000 LPA", "₹20,00,000 - ₹32,00,000 LPA", "₹24,00,000 - ₹36,00,000 LPA"],
  "Lead / Architect (8+ yrs)": ["₹30,00,000 - ₹45,00,000 LPA", "₹35,00,000 - ₹50,00,000 LPA", "₹40,00,000 - ₹65,00,000 LPA"]
};

const responsibilitiesPool = [
  "Design, develop, and deploy highly scalable production code following modern engineering best practices.",
  "Collaborate with cross-functional product managers, UI/UX designers, and QA engineers to ship high-quality features.",
  "Participate in code reviews, design system discussions, and architectural planning sessions.",
  "Optimize application performance, database queries, and reduce page load speeds.",
  "Write clean, maintainable unit and integration tests to ensure code coverage and reliability.",
  "Troubleshoot production issues, analyze logs, and implement bug fixes with rapid turnaround.",
  "Mentor junior engineers and promote modern software development practices within the engineering organization.",
  "Integrate secure OAuth2/JWT authentication, REST/GraphQL APIs, and third-party SaaS services."
];

const qualificationsList = [
  "B.Tech / B.E in Computer Science, Information Technology, or equivalent practical experience.",
  "Strong foundation in data structures, algorithms, object-oriented design, and software architecture.",
  "Hands-on experience with Git version control, Agile/Scrum development methodologies.",
  "Excellent problem-solving skills, analytical mindset, and effective communication skills."
];

const jobs = [];

for (let i = 1; i <= 100; i++) {
  const stackObj = techStacks[(i - 1) % techStacks.length];
  const company = companies[(i - 1) % companies.length];
  const hr = hrContacts[(i - 1) % hrContacts.length];

  const titleIndex = (i - 1) % stackObj.titles.length;
  const title = stackObj.titles[titleIndex];

  const expLevel = experienceLevels[(i - 1) % experienceLevels.length];
  const jobType = jobTypes[(i - 1) % jobTypes.length];
  
  const salOptions = salaryRanges[expLevel];
  const salaryRange = salOptions[(i - 1) % salOptions.length];

  const descTemplate = stackObj.descriptions[(i - 1) % stackObj.descriptions.length];

  // Pick skills
  const shuffledSkills = [...stackObj.skills].sort(() => 0.5 - Math.random());
  const selectedSkills = shuffledSkills.slice(0, 6 + (i % 3));

  // Pick responsibilities
  const shuffledResp = [...responsibilitiesPool].sort(() => 0.5 - Math.random());
  const selectedResp = shuffledResp.slice(0, 4);

  const daysAgo = (i % 25);
  const postedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const deadlineDate = new Date(Date.now() + (30 - daysAgo) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const jobId = `JOB-${1000 + i}`;

  jobs.push({
    id: jobId,
    title: title,
    companyName: company.name,
    companyContact: {
      email: `careers@${company.domain}`,
      phone: hr.phone,
      website: `https://${company.domain}`,
      address: company.address,
      contactPerson: `${hr.name} (Talent Acquisition)`
    },
    techStack: stackObj.category,
    jobType: jobType,
    experienceLevel: expLevel,
    salaryRange: salaryRange,
    location: company.city,
    description: `${descTemplate} At ${company.name}, you will be part of an innovative tech team building cutting-edge software solutions for global enterprise clients.`,
    responsibilities: selectedResp,
    requiredSkills: selectedSkills,
    education: qualificationsList[0],
    qualifications: qualificationsList,
    postedDate: postedDate,
    applicationDeadline: deadlineDate,
    status: "Active"
  });
}

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify(jobs, null, 2));
console.log(`Successfully generated ${jobs.length} dummy tech job openings in ${path.join(dataDir, 'jobs.json')}`);
