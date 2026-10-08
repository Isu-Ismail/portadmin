import type { AboutData, ProjectData } from '@/core/types';

export const defaultAboutData: AboutData = {
  name: "A.M. Ismail",
  role: "System Architect & Engineer",
  resume: "./assets/resume_ismail.pdf",
  images: {
    profile: "./assets/me.jpeg",
    hero: "./assets/hero.jpeg",
    resume_image: "./assets/resume.jpg"
  },
  contact: {
    email: "ismailisims1@gmail.com",
    phone: "+91 81248 14896",
    location: "Chennai, India",
    github: "https://github.com/Isu-Ismail",
    linkedin: "https://www.linkedin.com/in/ismail-am",
    instagram: "https://www.instagram.com/ismail_isims"
  },
  about: "Engineering student driven by practical problem-solving, continuous process improvement, and rapid learning agility. Experienced in applying engineering fundamentals to solve shop-floor bottlenecks, optimize workflows, and deploy cost-effective automated solutions that deliver measurable productivity gains. Demonstrated track record of collaborating across multidisciplinary teams, with exceptional adaptability to quickly master new processes, tools, and technical domains.",
  hero_about: "Engineer driven by practical problem-solving and continuous process improvement — applying engineering fundamentals to optimize workflows and deliver measurable results across real industrial environments.",
  education: [
    {
      degree: "B.E. Production Engineering",
      institution: "Madras Institute of Technology",
      period: "Aug 2023 - 2027",
      description: "Currently in IV Year."
    },
    {
      degree: "Higher Secondary (HSC)",
      institution: "L K Higher Secondary School",
      period: "2022 - 2023",
      description: "Score: 545/600 (90.8%)"
    }
  ],
  experience: [
    {
      role: "Industrial Intern (Production & Operations)",
      company: "SRI Energy Valves Private Limited",
      period: "June 2026",
      description: "Underwent focused observational training in industrial valve assembly and shop-floor inventory operations; studied step-by-step mechanical workflows, defect inspection, and systematic part transport logistics.",
      certificateLink: "./assets/sri_internship.png"
    },
    {
      role: "Chassis Design & Maintenance",
      company: "MITONAUR Motorsports (Go-Kart Team)",
      period: "Dec 2024 - 2025",
      description: "Assisted in the design and assembly of structural members on racing go-kart frames for the TNKC and KEC championships.",
      certificateLink: ""
    }
  ],
  skills: [
    "MQTT", "Docker", "Docker Swarm", "NGINX", "Pocketbase", "Prometheus", "Grafana",
    "JupyterHub", "Git", "XAMPP", "GlusterFS", "FireBase", "Python", "FastAPI", "React",
    "Flutter", "Arduino", "SolidWorks", "Creo", "NX CAD", "CATIA", "Abaqus CAE"
  ],
  interests: ["3D Printing", "Home Server Administration", "Karting", "Tech Exploration"],
  certificates: [
    {
      title: "Manufacturing Strategy",
      image: "./assets/certificates/manufacturing-strategy.jpg",
      desc: "NPTEL Elite Certification by IIT Roorkee. Covered manufacturing planning, competitive strategy, and operational decision-making frameworks. Score: 66% (Jul–Sep 2025)."
    },
    {
      title: "Navigating the Latest Trends in Additive Manufacturing Landscape",
      image: "./assets/certificates/latest-trends-additive.jpg",
      desc: "NPTEL Elite Certification by IIT Bombay. Explored current advancements and industry applications in additive manufacturing and 3D printing technologies. Score: 80% (Feb–Mar 2026)."
    }
  ],
  stats: [
    { value: "Entry", label: "Talent Ready" },
    { value: "11+", label: "Projects Completed" }
  ]
};

export const defaultProjects: ProjectData[] = [
  {
    id: "sri-energy-automation",
    title: "Sri Energy Industrial Automation",
    description: "A local-first IoT crane telemetry and real-time control system. Features containerized React/FastAPI services connected to a self-hosted Pocketbase backend and ESP32 nodes via MQTT.",
    tags: ["ESP32", "MQTT", "FastAPI", "Pocketbase", "React", "NGINX", "Docker", "XAMPP"],
    link: "https://srienergy.com/",
    status: "Completed",
    duration: "Oct 2024 – May 2026",
    stars: 5,
    subtitle: "Local-First IoT Crane Telemetry & Control Platform",
    metrics: [
      { value: "<50ms", label: "Telemetry Latency" },
      { value: "100%", label: "Local-First Resilience" },
      { value: "24/7", label: "Shop-Floor Operation" }
    ],
    techSpecs: [
      { label: "Hardware Node", value: "ESP32 Custom Controller" },
      { label: "Messaging", value: "Eclipse Mosquitto (MQTT)" },
      { label: "Application Layer", value: "FastAPI + React" },
      { label: "Storage", value: "Self-Hosted Pocketbase" }
    ],
    architectureNodes: [
      { icon: "cpu", title: "ESP32 Sensors", desc: "Monitors hoist load cells, vibration, limit triggers" },
      { icon: "network", title: "MQTT Broker", desc: "Local QoS-1 broker with low-latency dispatch" },
      { icon: "server", title: "FastAPI Engine", desc: "Telemetry analytics, state persistence, alarms" }
    ],
    narratives: [
      {
        heading: "Industrial Problem Statement",
        paragraphs: [
          "SRI Energy required an end-to-end real-time crane monitoring platform capable of operating autonomously without cloud dependency to ensure shop-floor safety and prevent load imbalances."
        ],
        bullets: [
          "Zero-latency requirements across shop-floor network",
          "Automated safety cut-off triggers on overload",
          "Full local logging to Pocketbase for predictive maintenance"
        ]
      }
    ],
    images: [],
    certificate: ""
  },
  {
    id: "ctskii",
    title: "CTSKII (ML-Cloud Computing)",
    description: "A high-availability server cluster offering GPU cloud environments to students. Built with Docker Swarm, GlusterFS, and a slot-based FastAPI booking platform.",
    tags: ["Docker Swarm", "GlusterFS", "JupyterHub", "FastAPI", "Prometheus", "Grafana", "NFS"],
    link: "https://ct.mitindia.edu/ctskii/",
    status: "Completed",
    duration: "Oct 2025 – March 2026",
    stars: 5,
    subtitle: "High-Availability GPU Student Cloud & Cluster Orchestration",
    metrics: [
      { value: "99.9%", label: "Cluster Uptime" },
      { value: "100+", label: "Active Student Labs" },
      { value: "3x", label: "Replicated Storage" }
    ],
    techSpecs: [
      { label: "Orchestration", value: "Docker Swarm Multi-Node" },
      { label: "Shared Storage", value: "GlusterFS Distributed Volumes" },
      { label: "Notebook Server", value: "JupyterHub on Kubernetes/Swarm" },
      { label: "Monitoring", value: "Prometheus + Grafana" }
    ],
    architectureNodes: [
      { icon: "server", title: "Manager Node", desc: "Hosts Swarm control plane, booking engine, ingress" },
      { icon: "database", title: "GlusterFS Cluster", desc: "Synchronous multi-replica network file storage" },
      { icon: "cpu", title: "Worker Nodes", desc: "Dedicated compute nodes with GPU pass-through" }
    ],
    narratives: [
      {
        heading: "Cloud Infrastructure Overview",
        paragraphs: [
          "Designed and provisioned a shared computing infrastructure allowing production engineering students to launch dedicated machine learning environments on-demand."
        ],
        bullets: [
          "Automated session teardown to reclaim compute resources",
          "Continuous metric gathering via Prometheus node exporters"
        ]
      }
    ],
    images: [],
    certificate: ""
  },
  {
    id: "middleman",
    title: "Middleman: Serverless Sourcing & RFQ Engine",
    description: "An automated RFQ sourcing engine connecting mail streams to React Flow timelines and a serverless PocketBase backend.",
    tags: ["React", "PocketBase", "React Flow", "Sourcing Engine", "Serverless", "Webhooks"],
    link: "https://github.com/Isu-Ismail/middleman",
    status: "Completed",
    duration: "June 2026 - July 2026",
    stars: 5,
    subtitle: "Automated RFQ Ingestion & Supplier Workflow Visualizer",
    metrics: [
      { value: "85%", label: "RFQ Turnaround Acceleration" },
      { value: "100%", label: "Audit Trail Integrity" }
    ],
    techSpecs: [
      { label: "Visual Graph", value: "React Flow Custom Nodes" },
      { label: "Backend", value: "PocketBase Go Engine" },
      { label: "Inbound Email", value: "Webhook WebSockets Receiver" }
    ],
    architectureNodes: [
      { icon: "mail", title: "RFQ Ingest", desc: "Parses supplier quotes and attachments" },
      { icon: "workflow", title: "Pipeline Graph", desc: "Visual quotation comparison flow" }
    ],
    narratives: [],
    images: [],
    certificate: ""
  }
];
