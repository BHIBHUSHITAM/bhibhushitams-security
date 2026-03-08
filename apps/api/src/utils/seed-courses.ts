import { connectDatabase } from "../config/db";
import { CourseModel } from "../modules/courses/course.model";

const sampleCourses = [
  {
    title: "Ethical Hacking",
    slug: "ethical-hacking",
    level: "beginner" as const,
    duration: "12 weeks",
    price: 0,
    description:
      "Learn the fundamentals of ethical hacking, penetration testing methodologies, and security assessment techniques used by professional security researchers.",
    modules: [
      {
        title: "Introduction to Ethical Hacking",
        duration: "1 week",
        topics: [
          "What is ethical hacking?",
          "Legal and ethical considerations",
          "Hacking methodologies",
          "Lab setup and tools",
        ],
      },
      {
        title: "Reconnaissance and Footprinting",
        duration: "2 weeks",
        topics: [
          "Passive reconnaissance",
          "Active scanning techniques",
          "DNS enumeration",
          "OSINT gathering",
        ],
      },
      {
        title: "System Hacking",
        duration: "3 weeks",
        topics: [
          "Password cracking",
          "Privilege escalation",
          "Malware and backdoors",
          "Covering tracks",
        ],
      },
      {
        title: "Network Security",
        duration: "2 weeks",
        topics: ["IDS/IPS evasion", "Sniffing attacks", "Session hijacking", "Firewall bypass"],
      },
      {
        title: "Final Project",
        duration: "4 weeks",
        topics: [
          "Capture the Flag challenges",
          "Vulnerability assessment report",
          "Penetration testing simulation",
        ],
      },
    ],
    isPublished: true,
  },
  {
    title: "Web Application Security",
    slug: "web-application-security",
    level: "intermediate" as const,
    duration: "10 weeks",
    price: 0,
    description:
      "Deep dive into web application vulnerabilities including OWASP Top 10, secure coding practices, and modern web security frameworks.",
    modules: [
      {
        title: "OWASP Top 10",
        duration: "2 weeks",
        topics: [
          "Injection attacks",
          "Broken authentication",
          "Sensitive data exposure",
          "XXE and security misconfigurations",
        ],
      },
      {
        title: "Client-Side Security",
        duration: "2 weeks",
        topics: ["XSS prevention", "CSRF protection", "DOM-based vulnerabilities", "CSP headers"],
      },
      {
        title: "Server-Side Security",
        duration: "2 weeks",
        topics: ["SQL injection", "Command injection", "File inclusion", "SSRF attacks"],
      },
      {
        title: "Authentication & Authorization",
        duration: "2 weeks",
        topics: ["OAuth 2.0", "JWT security", "Session management", "MFA implementation"],
      },
      {
        title: "Capstone Project",
        duration: "2 weeks",
        topics: ["Secure web app from scratch", "Security audit report", "Remediation planning"],
      },
    ],
    isPublished: true,
  },
  {
    title: "Penetration Testing",
    slug: "penetration-testing",
    level: "advanced" as const,
    duration: "16 weeks",
    price: 0,
    description:
      "Professional penetration testing course covering network pentesting, web app pentesting, wireless security, and red team operations.",
    modules: [
      {
        title: "Penetration Testing Fundamentals",
        duration: "2 weeks",
        topics: [
          "Pentest methodology",
          "Scoping and planning",
          "Legal frameworks",
          "Reporting standards",
        ],
      },
      {
        title: "Network Penetration Testing",
        duration: "4 weeks",
        topics: [
          "Network mapping",
          "Vulnerability scanning",
          "Exploitation frameworks",
          "Post-exploitation",
        ],
      },
      {
        title: "Web Application Pentesting",
        duration: "3 weeks",
        topics: [
          "Manual testing techniques",
          "Automated scanning",
          "Authentication bypass",
          "Business logic flaws",
        ],
      },
      {
        title: "Wireless Security Testing",
        duration: "2 weeks",
        topics: ["WPA/WPA2 cracking", "Rogue AP detection", "Evil twin attacks", "Bluetooth security"],
      },
      {
        title: "Red Team Operations",
        duration: "3 weeks",
        topics: [
          "Social engineering",
          "Physical security",
          "APT simulation",
          "C2 infrastructure",
        ],
      },
      {
        title: "Final Assessment",
        duration: "2 weeks",
        topics: [
          "Full-scope pentest simulation",
          "Executive report writing",
          "Client presentation",
        ],
      },
    ],
    isPublished: true,
  },
  {
    title: "Bug Bounty",
    slug: "bug-bounty",
    level: "intermediate" as const,
    duration: "8 weeks",
    price: 0,
    description:
      "Learn how to hunt for vulnerabilities in real-world applications, write quality reports, and maximize your bug bounty earnings.",
    modules: [
      {
        title: "Bug Bounty Basics",
        duration: "1 week",
        topics: [
          "Platform overview",
          "Program selection",
          "Report writing",
          "Responsible disclosure",
        ],
      },
      {
        title: "Recon and Asset Discovery",
        duration: "2 weeks",
        topics: [
          "Subdomain enumeration",
          "Content discovery",
          "Parameter mining",
          "Automation scripts",
        ],
      },
      {
        title: "Critical Vulnerabilities",
        duration: "2 weeks",
        topics: ["RCE techniques", "IDOR exploitation", "Account takeover", "Payment bypass"],
      },
      {
        title: "Advanced Hunting Techniques",
        duration: "2 weeks",
        topics: ["API security testing", "GraphQL exploitation", "SAML bypass", "Race conditions"],
      },
      {
        title: "Live Hunting Practice",
        duration: "1 week",
        topics: [
          "Real platform hunting",
          "Report optimization",
          "Communication skills",
          "Bounty negotiation",
        ],
      },
    ],
    isPublished: true,
  },
];

async function seedCourses() {
  try {
    await connectDatabase();

    await CourseModel.deleteMany({});
    console.log("Cleared existing courses");

    await CourseModel.insertMany(sampleCourses);
    console.log(`Seeded ${sampleCourses.length} sample courses`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedCourses();
