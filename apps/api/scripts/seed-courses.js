/**
 * COURSE SEED SCRIPT
 * ==================
 * Yeh script MongoDB Atlas mein courses insert karta hai.
 *
 * Usage:
 *   node scripts/seed-courses.js
 *
 * Agar production Atlas pe run karna ho:
 *   MONGODB_URI="mongodb+srv://..." node scripts/seed-courses.js
 *
 * Features:
 *   - Duplicate safe (upsert) — baar baar run karo, duplicate nahi banega
 *   - isPublished: true — insert hote hi live website pe dikhega
 */

const mongoose = require('mongoose');
require('dotenv').config();

// ──────────────────────────────────────────────────
// COURSES DATA — Yahan naye courses add karo bhai!
// ──────────────────────────────────────────────────
const COURSES = [
  // ─── 1. HTML & CSS Foundations ───────────────────
  {
    title: 'HTML5 & CSS3 Foundations',
    slug: 'html5-css3-foundations',
    level: 'beginner',
    duration: '2 Days',
    price: 0,
    description:
      'Web development ki pehli step — HTML5 aur CSS3 seekho from scratch. Semantic HTML, forms, Flexbox, Grid aur responsive design sab cover hoga.',
    thumbnail: '',
    isPublished: true,
    modules: [
      {
        title: 'HTML5 Basics',
        duration: '3 hours',
        topics: [
          'HTML kya hai aur browser kaise kaam karta hai',
          'Semantic tags: header, nav, main, section, footer',
          'Forms, inputs, tables aur links',
          'Mini Project: Personal Bio Page',
        ],
        videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg',
      },
      {
        title: 'CSS3 Styling & Layouts',
        duration: '4 hours',
        topics: [
          'Box Model — margin, padding, border',
          'Flexbox complete guide',
          'CSS Grid — rows, columns, areas',
          'Media Queries — Responsive Design',
          'Mini Project: Responsive Portfolio Layout',
        ],
        videoUrl: 'https://www.youtube.com/embed/phWxA89Dy94',
      },
    ],
  },

  // ─── 2. JavaScript ES6+ ──────────────────────────
  {
    title: 'JavaScript ES6+ Complete Course',
    slug: 'javascript-es6-complete',
    level: 'beginner',
    duration: '4 Days',
    price: 0,
    description:
      'JavaScript ki poori duniya — variables se lekar async/await tak. DOM manipulation, events, Fetch API aur modern ES6+ features sab kuch ek jagah.',
    thumbnail: '',
    isPublished: true,
    modules: [
      {
        title: 'JS Core Concepts',
        duration: '4 hours',
        topics: [
          'var, let, const — differences',
          'Data types, operators, conditionals',
          'Functions — declaration, expression, arrow',
          'Loops: for, while, forEach',
        ],
        videoUrl: 'https://www.youtube.com/embed/hdI2bqOjy3c',
      },
      {
        title: 'Arrays, Objects & DOM',
        duration: '5 hours',
        topics: [
          'Arrays — map, filter, reduce, find',
          'Objects, destructuring, spread operator',
          'DOM Manipulation — querySelector, events',
          'Event Delegation, Form Validation',
          'Project: To-Do List App',
        ],
        videoUrl: 'https://www.youtube.com/embed/y17RuWkWdn8',
      },
      {
        title: 'Async JS & Fetch API',
        duration: '5 hours',
        topics: [
          'Callbacks aur Callback Hell',
          'Promises — .then(), .catch()',
          'async/await — clean syntax',
          'Fetch API — live data load karo',
          'Project: Weather App with OpenWeatherMap API',
        ],
        videoUrl: 'https://www.youtube.com/embed/PoRJizFvM7s',
      },
      {
        title: 'ES6+ Features & Git',
        duration: '4 hours',
        topics: [
          'Template literals, optional chaining',
          'ES Modules — import/export',
          'Classes & OOP basics',
          'Git — init, add, commit, push, pull',
          'GitHub Pages pe website deploy karo',
        ],
        videoUrl: 'https://www.youtube.com/embed/SWYqp7iY_Tc',
      },
    ],
  },

  // ─── 3. React.js ─────────────────────────────────
  {
    title: 'React.js — Modern UI Development',
    slug: 'reactjs-modern-ui',
    level: 'intermediate',
    duration: '6 Days',
    price: 499,
    description:
      'React.js seekho aur SPAs banao! Components, Hooks (useState, useEffect), React Router, Context API, Tailwind CSS aur API integration — sab ek course mein.',
    thumbnail: '',
    isPublished: true,
    modules: [
      {
        title: 'React Basics & JSX',
        duration: '5 hours',
        topics: [
          'React kya hai? Virtual DOM',
          'Vite se project setup karo',
          'JSX, Functional Components, Props',
          'Lists, Keys, Conditional Rendering',
        ],
        videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
      },
      {
        title: 'React Hooks Deep Dive',
        duration: '5 hours',
        topics: [
          'useState — state management',
          'useEffect — side effects & lifecycle',
          'Dependency array patterns',
          'Custom Hooks banana',
          'Project: Counter + Timer App',
        ],
        videoUrl: 'https://www.youtube.com/embed/TNhaISOUy6Q',
      },
      {
        title: 'React Router & Forms',
        duration: '5 hours',
        topics: [
          'React Router v6 — BrowserRouter, Routes, Link',
          'useNavigate, useParams, useLocation',
          'Protected Routes — Auth Guard',
          'Controlled Forms & Validation',
          'Project: Multi-page Portfolio App',
        ],
        videoUrl: 'https://www.youtube.com/embed/Ul3y1LXxzdU',
      },
      {
        title: 'Context API & API Integration',
        duration: '6 hours',
        topics: [
          'Context API — Global state management',
          'Axios install aur use karna',
          'Loading states aur error handling',
          'React + Public APIs (Movie / News)',
          'Project: Movie App with TMDB API',
        ],
        videoUrl: '',
      },
      {
        title: 'Tailwind CSS with React',
        duration: '5 hours',
        topics: [
          'Tailwind — utility-first approach',
          'Responsive prefixes: sm, md, lg, xl',
          'Dark mode toggle',
          'Hover, Focus states',
          'Project: Responsive Landing Page',
        ],
        videoUrl: 'https://www.youtube.com/embed/lCxcTsOHrjo',
      },
      {
        title: 'Capstone: E-Commerce UI',
        duration: '7 hours',
        topics: [
          'Product listing with API',
          'Cart with Context API',
          'Search & Filter functionality',
          'React Router — product detail page',
          'Deploy on Vercel — live URL!',
        ],
        videoUrl: '',
      },
    ],
  },

  // ─── 4. Node.js & Express ────────────────────────
  {
    title: 'Node.js & Express.js Backend',
    slug: 'nodejs-express-backend',
    level: 'intermediate',
    duration: '3 Days',
    price: 499,
    description:
      'JavaScript ab server pe bhi chalega! Node.js aur Express.js se REST APIs banao, middleware likho, aur Postman se test karo.',
    thumbnail: '',
    isPublished: true,
    modules: [
      {
        title: 'Node.js Core',
        duration: '5 hours',
        topics: [
          'Node.js kya hai? Runtime environment',
          'Built-in modules: fs, path, http, events',
          'npm — package.json, scripts, node_modules',
          'Environment variables — .env file',
          'Simple HTTP server banana',
        ],
        videoUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4',
      },
      {
        title: 'Express.js REST APIs',
        duration: '6 hours',
        topics: [
          'Express install aur setup',
          'Routes — GET, POST, PUT, DELETE',
          'Middleware — custom, built-in, CORS',
          'Route params, query strings',
          'Error handling middleware',
          'Project: To-Do REST API with Postman testing',
        ],
        videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE',
      },
      {
        title: 'JWT Authentication',
        duration: '6 hours',
        topics: [
          'Authentication vs Authorization',
          'Password hashing with bcrypt',
          'JWT — sign aur verify',
          'Protected routes middleware',
          'Register + Login API banana',
          'Project: Auth System with JWT',
        ],
        videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4',
      },
    ],
  },

  // ─── 5. MongoDB & Full Stack MERN ────────────────
  {
    title: 'MongoDB & Full Stack MERN Project',
    slug: 'mongodb-fullstack-mern',
    level: 'advanced',
    duration: '5 Days',
    price: 999,
    description:
      'MongoDB Atlas, Mongoose ORM aur poora MERN stack connect karo. Authentication, file uploads, deployment tak sab kuch ek real-world project mein seekho.',
    thumbnail: '',
    isPublished: true,
    modules: [
      {
        title: 'MongoDB & Mongoose',
        duration: '6 hours',
        topics: [
          'MongoDB kya hai? SQL vs NoSQL',
          'MongoDB Atlas — Free cloud setup',
          'Collections, Documents, CRUD operations',
          'Mongoose Schema, Model, Validation',
          'Populate — references between collections',
        ],
        videoUrl: 'https://www.youtube.com/embed/-56x56UppqQ',
      },
      {
        title: 'Full Stack Connection',
        duration: '7 hours',
        topics: [
          'MERN Stack architecture samjho',
          'Vite proxy setup — frontend to backend',
          'Axios interceptors — auto auth headers',
          'Protected frontend routes with JWT',
          'File uploads with Multer + Cloudinary',
          'Project: Notes App — Full MERN',
        ],
        videoUrl: 'https://www.youtube.com/embed/O3BUHwfHf84',
      },
      {
        title: 'Production Deployment',
        duration: '5 hours',
        topics: [
          'Frontend deploy on Vercel',
          'Backend deploy on Render.com (Free)',
          'MongoDB Atlas production config',
          'Environment variables in dashboards',
          'CORS settings for production',
          'CI/CD — Auto deploy on git push',
        ],
        videoUrl: 'https://www.youtube.com/embed/l134cBAJCuc',
      },
      {
        title: 'Capstone: Social Media / Blog App',
        duration: '8 hours',
        topics: [
          'Full CRUD with authentication',
          'Profile pages, image upload, comments',
          'Responsive UI with Tailwind CSS',
          'Full deployment — live URL',
          'Professional README.md likhna',
          'Portfolio + LinkedIn update strategy',
        ],
        videoUrl: '',
      },
    ],
  },

  // ─── 6. Cybersecurity Fundamentals (Platform ka main topic!) ──
  {
    title: 'Cybersecurity Fundamentals',
    slug: 'cybersecurity-fundamentals',
    level: 'beginner',
    duration: '3 Days',
    price: 0,
    description:
      'Cybersecurity ki duniya mein pehla qadam — threats, vulnerabilities, ethical hacking basics aur web security fundamentals. Developers ke liye must-have knowledge.',
    thumbnail: '',
    isPublished: true,
    modules: [
      {
        title: 'Security Basics',
        duration: '4 hours',
        topics: [
          'CIA Triad — Confidentiality, Integrity, Availability',
          'Types of threats: malware, phishing, SQL injection',
          'OWASP Top 10 security risks',
          'HTTP vs HTTPS — SSL/TLS explained',
        ],
        videoUrl: '',
      },
      {
        title: 'Web Application Security',
        duration: '5 hours',
        topics: [
          'SQL Injection — kya hai aur kaise rokein',
          'XSS (Cross-Site Scripting)',
          'CSRF Protection',
          'Helmet.js — Express security headers',
          'Rate limiting aur brute force protection',
        ],
        videoUrl: '',
      },
      {
        title: 'Authentication Security',
        duration: '4 hours',
        topics: [
          'Password policies aur hashing (bcrypt)',
          'JWT security best practices',
          'OAuth 2.0 basics',
          'Two-Factor Authentication (2FA)',
          'Security audit checklist for your app',
        ],
        videoUrl: '',
      },
    ],
  },
];

// ──────────────────────────────────────────────────
// MAIN FUNCTION — Upsert karta hai (safe to re-run)
// ──────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable nahi mili!');
    console.error('   Run karo: MONGODB_URI="mongodb+srv://..." node scripts/seed-courses.js');
    process.exit(1);
  }

  console.log('🔌 MongoDB Atlas se connect ho raha hoon...');
  await mongoose.connect(uri);
  console.log('✅ Connected!\n');

  const db = mongoose.connection.db;
  const collection = db.collection('courses');

  let inserted = 0;
  let updated = 0;

  for (const course of COURSES) {
    const result = await collection.updateOne(
      { slug: course.slug },             // slug se dhundo
      { $set: course },                  // data update/insert karo
      { upsert: true }                   // nahi mila toh create karo
    );

    if (result.upsertedCount > 0) {
      console.log(`✨ INSERTED: "${course.title}" (${course.slug})`);
      inserted++;
    } else if (result.modifiedCount > 0) {
      console.log(`🔄 UPDATED:  "${course.title}" (${course.slug})`);
      updated++;
    } else {
      console.log(`⏭️  NO CHANGE: "${course.title}" (already up to date)`);
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`📊 Summary:`);
  console.log(`   ✨ Inserted: ${inserted} courses`);
  console.log(`   🔄 Updated:  ${updated} courses`);
  console.log(`   📚 Total in script: ${COURSES.length} courses`);
  console.log('─────────────────────────────────────');
  console.log('\n🌐 Live website pe jao aur /courses page refresh karo — dikh jayenge!');

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Done! ✅');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
