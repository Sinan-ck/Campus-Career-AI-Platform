/**
 * 100 Detailed Student Dummy Data Generator
 * Includes: Student ID, Name, Email, Phone, Location, Main Tech Stack, Experience Level, and Detailed Skills with Subtopics.
 */

const firstNames = [
  "Rahul", "Ananya", "Mohammed", "Devika", "Priya", "Arun", "Sanjay", "Sneha", 
  "Aisha", "Vikram", "Meera", "Kavya", "Rohan", "Nikhil", "Deepak", "Fathima", 
  "Abhishek", "Shruti", "Kiran", "Aditya", "Ritu", "Gautam", "Swati", "Naveen", 
  "Pooja", "Vishnu", "Shilpa", "Manoj", "Reshma", "Siddharth", "Aparna", "Varun", 
  "Harini", "Tarun", "Bhavna", "Roshan", "Divya", "Karthik", "Preeti", "Salman", 
  "Aswathy", "Vineeth", "Nandini", "Akash", "Aathira", "Jithin", "Sreeja", "Joel"
];

const lastNames = [
  "Sharma", "Nair", "Fasil", "Menon", "Patel", "Kumar", "Varma", "Roy", 
  "Siddiqui", "Singh", "Krishnan", "Rao", "Joshi", "Gupta", "Pillai", "Ali", 
  "Chawla", "Deshmukh", "Venkatesh", "Shenoy", "Bhat", "Kurian", "Reddy", "Verma", 
  "Nambiar", "Shetty", "Das", "Fernandez", "Kapoor", "Agarwal", "Kulkarni", "Kaur"
];

const techStacks = [
  "MEAN Stack",
  "MERN Stack",
  "Python Stack",
  "Android Stack",
  "iOS Stack",
  "Flutter Stack",
  "Java Enterprise",
  "Data Science & AI"
];

const cities = [
  "Kochi", "Trivandrum", "Kozhikode", "Bengaluru", "Chennai", 
  "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Coimbatore"
];

const techStackSkillTemplates = {
  "MEAN Stack": [
    {
      category: "Frontend",
      topic: "Angular Framework",
      subtopics: ["TypeScript", "RxJS Observables", "NgRx State Management", "Custom Directives & Pipes", "Angular Router"]
    },
    {
      category: "Backend",
      topic: "Node.js & Express.js",
      subtopics: ["RESTful API Design", "Express Middleware", "JWT Authentication", "Async/Await Control Flow", "Event Emitter"]
    },
    {
      category: "Database",
      topic: "MongoDB",
      subtopics: ["Mongoose Schema Modeling", "Aggregation Pipeline", "Indexing Strategies", "Transactions & Sessions"]
    },
    {
      category: "Tools & Testing",
      topic: "Web Tooling",
      subtopics: ["Jasmine/Karma Unit Testing", "Webpack", "NPM Scripts", "Postman API Testing"]
    }
  ],
  "MERN Stack": [
    {
      category: "Frontend",
      topic: "React.js",
      subtopics: ["React Hooks (useEffect, useMemo)", "Redux Toolkit", "Context API", "React Router v6", "Virtual DOM Optimization"]
    },
    {
      category: "Backend",
      topic: "Node.js & Express",
      subtopics: ["Express Routing", "CORS & Security Middleware", "Socket.io Realtime", "Passport.js Authentication"]
    },
    {
      category: "Database",
      topic: "MongoDB",
      subtopics: ["CRUD Operations", "Embedded vs Reference Documents", "Atlas Cloud Deployment", "Query Optimization"]
    },
    {
      category: "UI Styling",
      topic: "Modern CSS & UI Libraries",
      subtopics: ["Tailwind CSS", "Styled Components", "Framer Motion", "Shadcn UI / Material UI"]
    }
  ],
  "Python Stack": [
    {
      category: "Core Language",
      topic: "Python 3 Advanced",
      subtopics: ["OOP Principles", "Decorators & Generators", "List Comprehensions", "Type Hinting & Pydantic"]
    },
    {
      category: "Web Framework",
      topic: "Django & Django REST Framework",
      subtopics: ["Django ORM QuerySet", "DRF Serializers & ViewSets", "Django Signals", "Celery & Redis Async Queues"]
    },
    {
      category: "API Development",
      topic: "FastAPI",
      subtopics: ["Automatic OpenAPI Specs", "Dependency Injection", "Async Endpoint Handlers", "Uvicorn ASGI Server"]
    },
    {
      category: "Database",
      topic: "PostgreSQL & SQLAlchemy",
      subtopics: ["Relational Database Design", "Alembic Migrations", "Complex Joins & Aggregations"]
    }
  ],
  "Android Stack": [
    {
      category: "Language",
      topic: "Kotlin Core",
      subtopics: ["Null Safety Syntax", "Kotlin Coroutines & Flow", "Extension Functions", "Sealed Classes & Data Classes"]
    },
    {
      category: "UI Development",
      topic: "Jetpack Compose",
      subtopics: ["State Management in Compose", "Recomposition Optimization", "Material 3 Design System", "Custom Painters"]
    },
    {
      category: "Android Jetpack",
      topic: "Android Architecture Components",
      subtopics: ["ViewModel & LiveData", "Room Local Database", "Retrofit 2 Networking", "Navigation Component"]
    },
    {
      category: "Architecture & Dependency",
      topic: "Mobile Architecture",
      subtopics: ["MVVM / MVI Pattern", "Hilt / Dagger2 Injection", "Clean Architecture Layers", "WorkManager Background Jobs"]
    }
  ],
  "iOS Stack": [
    {
      category: "Language",
      topic: "Swift 5+",
      subtopics: ["Swift Concurrency (async/await, Actor)", "Protocols & Extensions", "Generics", "Automatic Reference Counting (ARC)"]
    },
    {
      category: "UI Framework",
      topic: "SwiftUI",
      subtopics: ["Declarative Layouts", "@State, @ObservedObject, @StateObject", "Custom Animations", "UIKit Integration"]
    },
    {
      category: "Data & Persistence",
      topic: "iOS Data Storage",
      subtopics: ["SwiftData / CoreData", "UserDefault & Keychain Access", "Combine Reactive Framework"]
    },
    {
      category: "Architecture & Distribution",
      topic: "iOS Ecosystem",
      subtopics: ["VIPER / MVVM-C Architecture", "XCTest Unit & UI Testing", "TestFlight & App Store Deployment", "URLSession Networking"]
    }
  ],
  "Flutter Stack": [
    {
      category: "Language",
      topic: "Dart Language",
      subtopics: ["Sound Null Safety", "Asynchronous Programming (Future/Stream)", "Mixins & Extension Types", "Isolates Multithreading"]
    },
    {
      category: "UI Framework",
      topic: "Flutter SDK",
      subtopics: ["Stateless & Stateful Widgets", "Custom RenderObjects", "Implicit & Explicit Animations", "Platform Adaptations"]
    },
    {
      category: "State Management",
      topic: "State Patterns",
      subtopics: ["Flutter Bloc & Cubit", "Riverpod 2.0", "Provider Pattern", "GetX State & Routing"]
    },
    {
      category: "Integrations",
      topic: "Mobile Features",
      subtopics: ["Method Channels (Native iOS/Android)", "Firebase Auth & Firestore", "SQLite / Hive Local Storage", "Push Notifications"]
    }
  ],
  "Java Enterprise": [
    {
      category: "Core Language",
      topic: "Java 17/21 LTS",
      subtopics: ["Stream API & Lambdas", "Record Classes", "Virtual Threads (Project Loom)", "Multithreading & Concurrency"]
    },
    {
      category: "Backend Framework",
      topic: "Spring Boot 3",
      subtopics: ["Spring MVC REST Controllers", "Spring Data JPA / Hibernate", "Spring Security & OAuth2", "Spring Cloud Microservices"]
    },
    {
      category: "Database & Messaging",
      topic: "Enterprise Data",
      subtopics: ["PostgreSQL / Oracle DB", "Apache Kafka Event Streaming", "RabbitMQ Messaging", "Redis Caching"]
    },
    {
      category: "DevOps & Build",
      topic: "Build Tooling",
      subtopics: ["Maven / Gradle Builds", "Docker Containerization", "JUnit 5 & Mockito Testing"]
    }
  ],
  "Data Science & AI": [
    {
      category: "Programming & Math",
      topic: "Python & Mathematics",
      subtopics: ["Linear Algebra & Calculus", "Probability & Statistics", "Python Numerical Computation"]
    },
    {
      category: "Data Processing",
      topic: "Data Manipulation",
      subtopics: ["Pandas DataFrames", "NumPy Array Ops", "Data Cleaning & Imputation", "Feature Engineering"]
    },
    {
      category: "Machine Learning",
      topic: "Scikit-Learn & ML Models",
      subtopics: ["Regression & Classification", "Random Forests & XGBoost", "Clustering & K-Means", "Model Evaluation Metrics"]
    },
    {
      category: "Deep Learning & AI",
      topic: "Neural Networks & LLMs",
      subtopics: ["PyTorch / TensorFlow", "Convolutional Neural Networks (CNN)", "Transformers & HuggingFace", "LangChain & RAG Pipelines"]
    }
  ]
};

const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDigits(count) {
  let str = "";
  for (let i = 0; i < count; i++) {
    str += Math.floor(Math.random() * 10);
  }
  return str;
}

function generate100Students() {
  const students = [];

  for (let i = 1; i <= 100; i++) {
    const fn = getRandomItem(firstNames);
    const ln = getRandomItem(lastNames);
    const fullName = `${fn} ${ln}`;
    const cleanName = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}`;
    const email = `${cleanName}@student.edu.in`;
    
    // Generate realistic Indian mobile number (+91 9xxxxxxxx)
    const mobile = `+91 ${Math.floor(Math.random() * 3 + 7)}${getRandomDigits(1)} ${getRandomDigits(4)} ${getRandomDigits(4)}`;
    
    const stack = techStacks[(i - 1) % techStacks.length]; // Even distribution across all stacks
    const location = getRandomItem(cities);
    const experience = experienceLevels[(i + Math.floor(i / 3)) % experienceLevels.length];
    
    // Generate gpa between 7.2 and 9.8
    const gpa = (7.2 + Math.random() * 2.6).toFixed(2);
    
    // Select skills for this student based on tech stack
    const fullSkills = techStackSkillTemplates[stack];
    // Give student 2-4 skill topics from their stack with customized subtopics
    const selectedSkills = fullSkills.slice(0, Math.floor(Math.random() * 2) + 3).map(skill => {
      // Pick 3-5 subtopics
      const sub = skill.subtopics.slice(0, Math.floor(Math.random() * 2) + 3);
      return {
        category: skill.category,
        topic: skill.topic,
        subtopics: sub
      };
    });

    students.push({
      id: `STU${String(i).padStart(3, '0')}`,
      rollNumber: `2024-CS-${String(i).padStart(3, '0')}`,
      name: fullName,
      email: email,
      mobile: mobile,
      location: location,
      mainTechStack: stack,
      experienceLevel: experience,
      gpa: parseFloat(gpa),
      graduationYear: 2024 + (i % 2),
      skills: selectedSkills,
      profileCreated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
    });
  }

  return students;
}

const studentData = generate100Students();

module.exports = {
  studentData,
  techStacks
};
