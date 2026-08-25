export interface SkillNode {
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
}

export interface TechnologyNode {
  name: string;
  type: string;
  description: string;
}

export interface JobRoleNode {
  title: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Principal';
  salaryRange: string;
  description: string;
}

export interface CompanyNode {
  name: string;
  industry: string;
  location: string;
  website: string;
}

export interface GraphRelationship {
  fromLabel: 'Skill' | 'Technology' | 'JobRole' | 'Company';
  fromKey: string;
  type: 'USED_WITH' | 'REQUIRED_FOR' | 'USED_IN' | 'HIRED_BY' | 'RELATED_TO';
  toLabel: 'Skill' | 'Technology' | 'JobRole' | 'Company';
  toKey: string;
  properties?: Record<string, any>;
}

export const SKILLS_DATA: SkillNode[] = [
  {
    name: 'Python',
    category: 'Programming',
    difficulty: 'Beginner',
    description: 'High-level programming language essential for AI, machine learning, data science, and backend APIs.',
  },
  {
    name: 'Machine Learning',
    category: 'AI & Data',
    difficulty: 'Advanced',
    description: 'Designing mathematical algorithms that learn predictive patterns from data to automate decision making.',
  },
  {
    name: 'Deep Learning',
    category: 'AI & Data',
    difficulty: 'Expert',
    description: 'Multi-layer neural network architectures for computer vision, NLP, generative AI, and complex representations.',
  },
  {
    name: 'SQL',
    category: 'Data Engineering',
    difficulty: 'Intermediate',
    description: 'Standard language for querying, indexing, and managing relational databases and analytical data warehouses.',
  },
  {
    name: 'Data Analysis',
    category: 'AI & Data',
    difficulty: 'Beginner',
    description: 'Inspecting, cleaning, transforming, and modeling data to discover actionable insights and trends.',
  },
  {
    name: 'NLP',
    category: 'AI & Data',
    difficulty: 'Advanced',
    description: 'Natural Language Processing algorithms for tokenization, text embeddings, semantic search, and LLMs.',
  },
  {
    name: 'Computer Vision',
    category: 'AI & Data',
    difficulty: 'Advanced',
    description: 'Extracting high-level spatial understanding and feature representations from digital images and videos.',
  },
  {
    name: 'Data Visualization',
    category: 'AI & Data',
    difficulty: 'Intermediate',
    description: 'Translating complex datasets into intuitive interactive charts, graphs, and visual dashboards.',
  },
  {
    name: 'Backend Development',
    category: 'Software Engineering',
    difficulty: 'Intermediate',
    description: 'Server architectures, microservices, business logic, authentication, and database orchestration.',
  },
  {
    name: 'Frontend Development',
    category: 'Web Development',
    difficulty: 'Intermediate',
    description: 'Creating accessible, responsive, and performant user interfaces and reactive browser client applications.',
  },
  {
    name: 'Cloud Computing',
    category: 'DevOps & Cloud',
    difficulty: 'Advanced',
    description: 'Architecting distributed compute, storage, networking, and serverless infrastructure on cloud platforms.',
  },
  {
    name: 'Statistics',
    category: 'AI & Data',
    difficulty: 'Intermediate',
    description: 'Probability theory, hypothesis testing, regression analysis, and experimental A/B testing methods.',
  },
  {
    name: 'Java',
    category: 'Programming',
    difficulty: 'Intermediate',
    description: 'Object-oriented, class-based language engineered for robust enterprise backends and distributed systems.',
  },
  {
    name: 'JavaScript',
    category: 'Programming',
    difficulty: 'Beginner',
    description: 'Dynamic scripting language powering the interactive web, Node.js runtimes, and full-stack applications.',
  },
  {
    name: 'React',
    category: 'Web Development',
    difficulty: 'Intermediate',
    description: 'Declarative component-based UI framework for building reactive, single-page web applications.',
  },
  // Additional rich ontological skills
  {
    name: 'Distributed Systems',
    category: 'Software Engineering',
    difficulty: 'Expert',
    description: 'Consensus protocols, high-throughput message streaming, fault tolerance, and eventual consistency.',
  },
  {
    name: 'MLOps',
    category: 'AI & Data',
    difficulty: 'Advanced',
    description: 'Continuous integration, deployment, feature store pipelines, and model monitoring in production.',
  },
  {
    name: 'Graph Database Modeling',
    category: 'Data Engineering',
    difficulty: 'Intermediate',
    description: 'Property graph schemas, Cypher traversal optimization, and relationship-first data persistence.',
  },
];

export const TECHNOLOGIES_DATA: TechnologyNode[] = [
  {
    name: 'Python',
    type: 'Programming Language',
    description: 'Interpreted dynamic language with rich ecosystem for AI, scientific computing, and web APIs.',
  },
  {
    name: 'Java',
    type: 'Programming Language',
    description: 'Enterprise-grade compiled language widely used in banking, microservices, and big data systems.',
  },
  {
    name: 'JavaScript',
    type: 'Programming Language',
    description: 'Universal language of the web, powering frontend UI and backend Node.js runtimes.',
  },
  {
    name: 'React',
    type: 'Frontend Library',
    description: 'Declarative component-based UI library developed by Meta for reactive web clients.',
  },
  {
    name: 'Node.js',
    type: 'Backend Runtime',
    description: 'Asynchronous event-driven JavaScript runtime built on the Chrome V8 engine.',
  },
  {
    name: 'TensorFlow',
    type: 'Machine Learning Framework',
    description: 'End-to-end open source platform for machine learning and deep neural network training.',
  },
  {
    name: 'PyTorch',
    type: 'Machine Learning Framework',
    description: 'Dynamic tensor computation and deep learning framework created by Meta AI.',
  },
  {
    name: 'PostgreSQL',
    type: 'Relational Database',
    description: 'Advanced open-source object-relational database with ACID transactions and JSONB support.',
  },
  {
    name: 'Docker',
    type: 'Containerization Tool',
    description: 'Platform for developing, shipping, and running applications in standardized containers.',
  },
  {
    name: 'AWS',
    type: 'Cloud Platform',
    description: 'Comprehensive cloud computing platform offering compute, storage, and serverless infrastructure.',
  },
  // Additional technologies
  {
    name: 'CognoDB',
    type: 'Graph Database',
    description: 'High-performance property graph database supporting openCypher query traversals.',
  },
  {
    name: 'Kubernetes',
    type: 'Container Orchestration',
    description: 'Automated container deployment, scaling, load balancing, and cluster management system.',
  },
  {
    name: 'TypeScript',
    type: 'Programming Language',
    description: 'Typed superset of JavaScript providing compile-time type safety for scalable codebases.',
  },
];

export const JOB_ROLES_DATA: JobRoleNode[] = [
  {
    title: 'AI/ML Engineer',
    experienceLevel: 'Senior',
    salaryRange: '$160,000 - $240,000',
    description: 'Builds, fine-tunes, and deploys production machine learning pipelines and neural network models.',
  },
  {
    title: 'Machine Learning Engineer',
    experienceLevel: 'Senior',
    salaryRange: '$155,000 - $230,000',
    description: 'Researches and implements scalable ML algorithms, feature stores, and real-time inference systems.',
  },
  {
    title: 'Data Scientist',
    experienceLevel: 'Senior',
    salaryRange: '$140,000 - $210,000',
    description: 'Extracts statistical insights, conducts hypothesis testing, and builds predictive models from complex data.',
  },
  {
    title: 'Data Analyst',
    experienceLevel: 'Mid-Level',
    salaryRange: '$90,000 - $135,000',
    description: 'Transforms raw business data into actionable visual reports, SQL queries, and KPI dashboards.',
  },
  {
    title: 'Backend Developer',
    experienceLevel: 'Senior',
    salaryRange: '$145,000 - $205,000',
    description: 'Architects scalable microservices, low-latency APIs, and robust data persistence layers.',
  },
  {
    title: 'Frontend Developer',
    experienceLevel: 'Mid-Level',
    salaryRange: '$120,000 - $170,000',
    description: 'Crafts high-performance user interfaces, state management, and accessible client-side architectures.',
  },
  {
    title: 'Full Stack Developer',
    experienceLevel: 'Mid-Level',
    salaryRange: '$125,000 - $180,000',
    description: 'Designs and implements end-to-end web applications across front-end interfaces and back-end services.',
  },
  {
    title: 'Cloud Engineer',
    experienceLevel: 'Senior',
    salaryRange: '$150,000 - $220,000',
    description: 'Directs cloud infrastructure, automated CI/CD pipelines, security compliance, and disaster recovery.',
  },
  {
    title: 'Software Engineer',
    experienceLevel: 'Mid-Level',
    salaryRange: '$130,000 - $185,000',
    description: 'Develops robust software architectures, clean abstractions, and high-quality production code.',
  },
  {
    title: 'Computer Vision Engineer',
    experienceLevel: 'Senior',
    salaryRange: '$165,000 - $235,000',
    description: 'Specializes in spatial AI, object detection, segmentation, and camera perception systems.',
  },
];

export const COMPANIES_DATA: CompanyNode[] = [
  {
    name: 'Google',
    industry: 'Technology & AI',
    location: 'Mountain View, CA',
    website: 'https://google.com',
  },
  {
    name: 'Microsoft',
    industry: 'Enterprise & Cloud',
    location: 'Redmond, WA',
    website: 'https://microsoft.com',
  },
  {
    name: 'Amazon',
    industry: 'Cloud Infrastructure & E-Commerce',
    location: 'Seattle, WA',
    website: 'https://amazon.com',
  },
  {
    name: 'IBM',
    industry: 'Enterprise Technology & Quantum',
    location: 'Armonk, NY',
    website: 'https://ibm.com',
  },
  {
    name: 'NVIDIA',
    industry: 'Semiconductors & AI Compute',
    location: 'Santa Clara, CA',
    website: 'https://nvidia.com',
  },
  {
    name: 'Adobe',
    industry: 'Creative Software & Digital Media',
    location: 'San Jose, CA',
    website: 'https://adobe.com',
  },
  {
    name: 'Salesforce',
    industry: 'Cloud CRM & Enterprise Software',
    location: 'San Francisco, CA',
    website: 'https://salesforce.com',
  },
  {
    name: 'Oracle',
    industry: 'Enterprise Database & Cloud',
    location: 'Austin, TX',
    website: 'https://oracle.com',
  },
  {
    name: 'Infosys',
    industry: 'IT Consulting & Digital Services',
    location: 'Bengaluru, India',
    website: 'https://infosys.com',
  },
  {
    name: 'TCS',
    industry: 'IT Services & Consulting',
    location: 'Mumbai, India',
    website: 'https://tcs.com',
  },
];

export const RELATIONSHIPS_DATA: GraphRelationship[] = [
  // ==========================================
  // 1. (Skill)-[:USED_WITH]->(Technology)
  // ==========================================
  { fromLabel: 'Skill', fromKey: 'Python', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Python' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Python' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PyTorch' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'USED_WITH', toLabel: 'Technology', toKey: 'TensorFlow' },
  { fromLabel: 'Skill', fromKey: 'Deep Learning', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PyTorch' },
  { fromLabel: 'Skill', fromKey: 'Deep Learning', type: 'USED_WITH', toLabel: 'Technology', toKey: 'TensorFlow' },
  { fromLabel: 'Skill', fromKey: 'SQL', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PostgreSQL' },
  { fromLabel: 'Skill', fromKey: 'Data Analysis', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Python' },
  { fromLabel: 'Skill', fromKey: 'Data Analysis', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PostgreSQL' },
  { fromLabel: 'Skill', fromKey: 'NLP', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Python' },
  { fromLabel: 'Skill', fromKey: 'NLP', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PyTorch' },
  { fromLabel: 'Skill', fromKey: 'Computer Vision', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PyTorch' },
  { fromLabel: 'Skill', fromKey: 'Computer Vision', type: 'USED_WITH', toLabel: 'Technology', toKey: 'TensorFlow' },
  { fromLabel: 'Skill', fromKey: 'Data Visualization', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Python' },
  { fromLabel: 'Skill', fromKey: 'Data Visualization', type: 'USED_WITH', toLabel: 'Technology', toKey: 'React' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Node.js' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Java' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'USED_WITH', toLabel: 'Technology', toKey: 'PostgreSQL' },
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'USED_WITH', toLabel: 'Technology', toKey: 'JavaScript' },
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'USED_WITH', toLabel: 'Technology', toKey: 'React' },
  { fromLabel: 'Skill', fromKey: 'Cloud Computing', type: 'USED_WITH', toLabel: 'Technology', toKey: 'AWS' },
  { fromLabel: 'Skill', fromKey: 'Cloud Computing', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Docker' },
  { fromLabel: 'Skill', fromKey: 'Statistics', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Python' },
  { fromLabel: 'Skill', fromKey: 'Java', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Java' },
  { fromLabel: 'Skill', fromKey: 'JavaScript', type: 'USED_WITH', toLabel: 'Technology', toKey: 'JavaScript' },
  { fromLabel: 'Skill', fromKey: 'JavaScript', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Node.js' },
  { fromLabel: 'Skill', fromKey: 'React', type: 'USED_WITH', toLabel: 'Technology', toKey: 'React' },
  { fromLabel: 'Skill', fromKey: 'React', type: 'USED_WITH', toLabel: 'Technology', toKey: 'JavaScript' },
  { fromLabel: 'Skill', fromKey: 'Distributed Systems', type: 'USED_WITH', toLabel: 'Technology', toKey: 'AWS' },
  { fromLabel: 'Skill', fromKey: 'Distributed Systems', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Docker' },
  { fromLabel: 'Skill', fromKey: 'MLOps', type: 'USED_WITH', toLabel: 'Technology', toKey: 'Docker' },
  { fromLabel: 'Skill', fromKey: 'MLOps', type: 'USED_WITH', toLabel: 'Technology', toKey: 'AWS' },
  { fromLabel: 'Skill', fromKey: 'Graph Database Modeling', type: 'USED_WITH', toLabel: 'Technology', toKey: 'CognoDB' },

  // ==========================================
  // 2. (Skill)-[:REQUIRED_FOR]->(JobRole)
  // ==========================================
  // AI/ML Engineer
  { fromLabel: 'Skill', fromKey: 'Python', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },
  { fromLabel: 'Skill', fromKey: 'Deep Learning', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },
  { fromLabel: 'Skill', fromKey: 'SQL', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },

  // Machine Learning Engineer
  { fromLabel: 'Skill', fromKey: 'Python', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },
  { fromLabel: 'Skill', fromKey: 'MLOps', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },
  { fromLabel: 'Skill', fromKey: 'Cloud Computing', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },

  // Data Scientist
  { fromLabel: 'Skill', fromKey: 'Python', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Scientist' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Scientist' },
  { fromLabel: 'Skill', fromKey: 'Statistics', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Scientist' },
  { fromLabel: 'Skill', fromKey: 'Data Analysis', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Scientist' },
  { fromLabel: 'Skill', fromKey: 'Data Visualization', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Scientist' },

  // Data Analyst
  { fromLabel: 'Skill', fromKey: 'SQL', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Analyst' },
  { fromLabel: 'Skill', fromKey: 'Data Analysis', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Analyst' },
  { fromLabel: 'Skill', fromKey: 'Data Visualization', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Analyst' },
  { fromLabel: 'Skill', fromKey: 'Statistics', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Data Analyst' },

  // Backend Developer
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Backend Developer' },
  { fromLabel: 'Skill', fromKey: 'Java', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Backend Developer' },
  { fromLabel: 'Skill', fromKey: 'SQL', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Backend Developer' },
  { fromLabel: 'Skill', fromKey: 'Distributed Systems', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Backend Developer' },

  // Frontend Developer
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Frontend Developer' },
  { fromLabel: 'Skill', fromKey: 'JavaScript', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Frontend Developer' },
  { fromLabel: 'Skill', fromKey: 'React', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Frontend Developer' },

  // Full Stack Developer
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Skill', fromKey: 'JavaScript', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Skill', fromKey: 'React', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Skill', fromKey: 'SQL', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Full Stack Developer' },

  // Cloud Engineer
  { fromLabel: 'Skill', fromKey: 'Cloud Computing', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Cloud Engineer' },
  { fromLabel: 'Skill', fromKey: 'Distributed Systems', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Cloud Engineer' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Cloud Engineer' },

  // Software Engineer
  { fromLabel: 'Skill', fromKey: 'Java', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Software Engineer' },
  { fromLabel: 'Skill', fromKey: 'Python', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Software Engineer' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Software Engineer' },
  { fromLabel: 'Skill', fromKey: 'SQL', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Software Engineer' },

  // Computer Vision Engineer
  { fromLabel: 'Skill', fromKey: 'Computer Vision', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Computer Vision Engineer' },
  { fromLabel: 'Skill', fromKey: 'Deep Learning', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Computer Vision Engineer' },
  { fromLabel: 'Skill', fromKey: 'Python', type: 'REQUIRED_FOR', toLabel: 'JobRole', toKey: 'Computer Vision Engineer' },

  // ==========================================
  // 3. (Technology)-[:USED_IN]->(JobRole)
  // ==========================================
  { fromLabel: 'Technology', fromKey: 'Python', type: 'USED_IN', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },
  { fromLabel: 'Technology', fromKey: 'PyTorch', type: 'USED_IN', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },
  { fromLabel: 'Technology', fromKey: 'TensorFlow', type: 'USED_IN', toLabel: 'JobRole', toKey: 'AI/ML Engineer' },

  { fromLabel: 'Technology', fromKey: 'Python', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },
  { fromLabel: 'Technology', fromKey: 'PyTorch', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },
  { fromLabel: 'Technology', fromKey: 'Docker', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },
  { fromLabel: 'Technology', fromKey: 'AWS', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Machine Learning Engineer' },

  { fromLabel: 'Technology', fromKey: 'Python', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Data Scientist' },
  { fromLabel: 'Technology', fromKey: 'PostgreSQL', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Data Scientist' },

  { fromLabel: 'Technology', fromKey: 'PostgreSQL', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Data Analyst' },
  { fromLabel: 'Technology', fromKey: 'Python', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Data Analyst' },

  { fromLabel: 'Technology', fromKey: 'Java', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Backend Developer' },
  { fromLabel: 'Technology', fromKey: 'Node.js', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Backend Developer' },
  { fromLabel: 'Technology', fromKey: 'PostgreSQL', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Backend Developer' },
  { fromLabel: 'Technology', fromKey: 'Docker', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Backend Developer' },

  { fromLabel: 'Technology', fromKey: 'JavaScript', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Frontend Developer' },
  { fromLabel: 'Technology', fromKey: 'React', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Frontend Developer' },

  { fromLabel: 'Technology', fromKey: 'React', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Technology', fromKey: 'Node.js', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Technology', fromKey: 'JavaScript', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Full Stack Developer' },
  { fromLabel: 'Technology', fromKey: 'PostgreSQL', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Full Stack Developer' },

  { fromLabel: 'Technology', fromKey: 'AWS', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Cloud Engineer' },
  { fromLabel: 'Technology', fromKey: 'Docker', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Cloud Engineer' },

  { fromLabel: 'Technology', fromKey: 'Java', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Software Engineer' },
  { fromLabel: 'Technology', fromKey: 'Python', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Software Engineer' },
  { fromLabel: 'Technology', fromKey: 'PostgreSQL', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Software Engineer' },

  { fromLabel: 'Technology', fromKey: 'PyTorch', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Computer Vision Engineer' },
  { fromLabel: 'Technology', fromKey: 'TensorFlow', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Computer Vision Engineer' },
  { fromLabel: 'Technology', fromKey: 'Python', type: 'USED_IN', toLabel: 'JobRole', toKey: 'Computer Vision Engineer' },

  // ==========================================
  // 4. (JobRole)-[:HIRED_BY]->(Company)
  // ==========================================
  { fromLabel: 'JobRole', fromKey: 'AI/ML Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Google' },
  { fromLabel: 'JobRole', fromKey: 'AI/ML Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Microsoft' },
  { fromLabel: 'JobRole', fromKey: 'AI/ML Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'NVIDIA' },

  { fromLabel: 'JobRole', fromKey: 'Machine Learning Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Amazon' },
  { fromLabel: 'JobRole', fromKey: 'Machine Learning Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Google' },
  { fromLabel: 'JobRole', fromKey: 'Machine Learning Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Adobe' },

  { fromLabel: 'JobRole', fromKey: 'Data Scientist', type: 'HIRED_BY', toLabel: 'Company', toKey: 'IBM' },
  { fromLabel: 'JobRole', fromKey: 'Data Scientist', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Salesforce' },
  { fromLabel: 'JobRole', fromKey: 'Data Scientist', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Microsoft' },

  { fromLabel: 'JobRole', fromKey: 'Data Analyst', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Infosys' },
  { fromLabel: 'JobRole', fromKey: 'Data Analyst', type: 'HIRED_BY', toLabel: 'Company', toKey: 'TCS' },
  { fromLabel: 'JobRole', fromKey: 'Data Analyst', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Oracle' },

  { fromLabel: 'JobRole', fromKey: 'Backend Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Amazon' },
  { fromLabel: 'JobRole', fromKey: 'Backend Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Oracle' },
  { fromLabel: 'JobRole', fromKey: 'Backend Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Google' },

  { fromLabel: 'JobRole', fromKey: 'Frontend Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Adobe' },
  { fromLabel: 'JobRole', fromKey: 'Frontend Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Salesforce' },
  { fromLabel: 'JobRole', fromKey: 'Frontend Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Microsoft' },

  { fromLabel: 'JobRole', fromKey: 'Full Stack Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Salesforce' },
  { fromLabel: 'JobRole', fromKey: 'Full Stack Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Infosys' },
  { fromLabel: 'JobRole', fromKey: 'Full Stack Developer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'TCS' },

  { fromLabel: 'JobRole', fromKey: 'Cloud Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Amazon' },
  { fromLabel: 'JobRole', fromKey: 'Cloud Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Microsoft' },
  { fromLabel: 'JobRole', fromKey: 'Cloud Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'IBM' },
  { fromLabel: 'JobRole', fromKey: 'Cloud Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Oracle' },

  { fromLabel: 'JobRole', fromKey: 'Software Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Google' },
  { fromLabel: 'JobRole', fromKey: 'Software Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Microsoft' },
  { fromLabel: 'JobRole', fromKey: 'Software Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Infosys' },
  { fromLabel: 'JobRole', fromKey: 'Software Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'TCS' },

  { fromLabel: 'JobRole', fromKey: 'Computer Vision Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'NVIDIA' },
  { fromLabel: 'JobRole', fromKey: 'Computer Vision Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Adobe' },
  { fromLabel: 'JobRole', fromKey: 'Computer Vision Engineer', type: 'HIRED_BY', toLabel: 'Company', toKey: 'Google' },

  // ==========================================
  // 5. (Skill)-[:RELATED_TO]->(Skill)
  // ==========================================
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Deep Learning' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Data Analysis' },
  { fromLabel: 'Skill', fromKey: 'Machine Learning', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Statistics' },
  { fromLabel: 'Skill', fromKey: 'Deep Learning', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'NLP' },
  { fromLabel: 'Skill', fromKey: 'Deep Learning', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Computer Vision' },
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'React' },
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'JavaScript' },
  { fromLabel: 'Skill', fromKey: 'Frontend Development', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Data Visualization' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'SQL' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Java' },
  { fromLabel: 'Skill', fromKey: 'Backend Development', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Distributed Systems' },
  { fromLabel: 'Skill', fromKey: 'Cloud Computing', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Distributed Systems' },
  { fromLabel: 'Skill', fromKey: 'Data Analysis', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Data Visualization' },
  { fromLabel: 'Skill', fromKey: 'Data Analysis', type: 'RELATED_TO', toLabel: 'Skill', toKey: 'Statistics' },
];
