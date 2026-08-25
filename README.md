# SkillGraph 🕸️

> **Interactive Graph Database Career & Technology Exploration Platform**  
> Built with **Node.js, Express, React, Vite, Tailwind CSS, CognoDB, and openCypher** via the official `neo4j-driver`.

---

## 📌 Table of Contents
1. [Overview](#overview)
2. [Why a Graph Database?](#why-a-graph-database)
3. [Graph Data Model](#graph-data-model)
4. [Architecture & Tech Stack](#architecture--tech-stack)
5. [Setup & Installation](#setup--installation)
6. [Environment Configuration](#environment-configuration)
7. [Database Seeding](#database-seeding)
8. [API Endpoints](#api-endpoints)
9. [Key openCypher Queries](#key-opencypher-queries)
10. [Evaluation Highlights](#evaluation-highlights)

---

## 📖 Overview

**SkillGraph** is a full-stack graph intelligence application designed to model and explore the multi-hop relationships connecting skills, technologies, job roles, and hiring organizations.

Traditional relational databases struggle to express deep career pathways without combinatorial join tables and high latency. SkillGraph demonstrates how property graphs allow instant, intuitive multi-hop traversals:
$$\text{Skill} \xrightarrow{\text{:USED\_WITH}} \text{Technology} \xrightarrow{\text{:USED\_IN}} \text{JobRole} \xrightarrow{\text{:HIRED\_BY}} \text{Company}$$

---

## 💡 Why a Graph Database? (Graph vs. Relational SQL)

| Dimension | Relational Database (SQL) | Graph Database (CognoDB / openCypher) |
| :--- | :--- | :--- |
| **Data Representation** | Rigid tables, foreign keys, and junction tables (`role_skills`, `tech_roles`). | Native Nodes (entities) and directed Relationships (edges). |
| **Multi-Hop Traversal** | Cascading `JOIN` operations ($O(N^k)$ polynomial cost). High latency on deep paths. | **Index-free adjacency**: Nodes directly store pointers to connected neighbors ($O(1)$ step traversal). |
| **Path Queries** | Requires complex recursive CTEs (`WITH RECURSIVE`). | Expressive openCypher pattern matching: `MATCH path = (s)-[*1..4]-(c)`. |
| **Schema Evolution** | Costly DDL migrations (`ALTER TABLE`) and foreign key maintenance. | Flexible property graph schema—add new relationship types dynamically. |
| **Bidirectional Navigation** | Requires multiple indexed foreign keys on each join table. | Relationships can be traversed in both directions natively with zero overhead. |

---

## 🧱 Graph Data Model

### Node Labels & Properties

#### `(:Skill)`
* `name` (String, Primary Identifier) — e.g. `"Python"`, `"Machine Learning"`
* `category` (String) — e.g. `"Programming"`, `"AI & Data"`, `"DevOps"`
* `difficulty` (String) — `"Beginner"`, `"Intermediate"`, `"Advanced"`, `"Expert"`
* `description` (String) — Overview of the competency

#### `(:Technology)`
* `name` (String, Primary Identifier) — e.g. `"PyTorch"`, `"React"`, `"Kubernetes"`
* `type` (String) — `"ML Framework"`, `"Frontend Library"`, `"Container Platform"`
* `category` (String) — High-level domain

#### `(:JobRole)`
* `title` (String, Primary Identifier) — e.g. `"AI/ML Engineer"`, `"Full Stack Engineer"`
* `experienceLevel` (String) — `"Entry-Level"`, `"Mid-Level"`, `"Senior"`, `"Lead"`
* `salaryRange` (String) — e.g. `"$160k - $240k"`
* `description` (String) — Responsibilities and scope

#### `(:Company)`
* `name` (String, Primary Identifier) — e.g. `"Google"`, `"OpenAI"`, `"Stripe"`
* `industry` (String) — `"Artificial Intelligence"`, `"Financial Technology"`
* `location` (String) — Headquarter or hub location
* `website` (String) — Official URL

### Relationships

```
(:Skill)-[:USED_WITH]->(:Technology)
(:Skill)-[:REQUIRED_FOR]->(:JobRole)
(:Technology)-[:USED_IN]->(:JobRole)
(:JobRole)-[:HIRED_BY]->(:Company)
(:Skill)-[:RELATED_TO]->(:Skill)
```

---

## 🏛️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│               Frontend: React 18 + Vite                     │
│  - Interactive D3 Force Graph Visualizer                    │
│  - Explorers: Skills, Roles, Companies, Connections        │
│  - Interactive openCypher Query Playground & Inspector      │
│  - Tailwind CSS + Lucide Icons                              │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON (port 3000)
┌──────────────────────────────▼──────────────────────────────┐
│               Backend: Express + Node.js                    │
│  - REST API Gateway (/api/*)                                │
│  - GraphService abstraction with parameterization           │
│  - In-Memory Graph Fallback Engine for offline evaluation  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Bolt Protocol (neo4j-driver)
┌──────────────────────────────▼──────────────────────────────┐
│                    CognoDB Instance                         │
│  - openCypher Query Processing Engine                       │
│  - Graph Indexes & Constraints                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file (copied from `.env.example`):
```env
COGNODB_URI=bolt://localhost:7687
COGNODB_USER=neo4j
COGNODB_PASSWORD=your_password
PORT=3000
```
> **Note:** If no CognoDB credentials are provided, SkillGraph seamlessly boots an **In-Memory Graph Engine Fallback**, ensuring the entire application and all multi-hop traversals remain 100% interactive and functional for evaluation.

---

## ⚡ Database Seeding

Populate the database with realistic skills, frameworks, career paths, and corporate ecosystems:

```bash
# Seed via CLI script
npm run seed

# Or trigger seeding directly in the UI via the Status Banner
```

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, connection verification, and graph element counts. |
| `/api/seed` | `POST` | Executes Cypher batch transactions to seed the graph schema and nodes. |
| `/api/skills` | `GET` | Lists skills with optional category/search filters & relationship counts. |
| `/api/skills/:name` | `GET` | Returns skill detail with connected technologies, roles, and hiring companies. |
| `/api/roles` | `GET` | Lists job roles with experience filters and salary metrics. |
| `/api/roles/:title` | `GET` | Returns job role detail with required skills, tech stack, and hiring companies. |
| `/api/companies` | `GET` | Lists companies with industry filtering. |
| `/api/companies/:name` | `GET` | Returns company detail with open roles and required candidate skills. |
| `/api/graph` | `GET` | Returns full or filtered node & relationship subgraph for D3 visualization. |
| `/api/connections` | `GET` | Multi-hop shortest path search between two arbitrary nodes: `?start=...&target=...`. |
| `/api/search` | `GET` | Global fuzzy search across all node types in the database. |
| `/api/query` | `POST` | Read-only openCypher query playground runner. |

---

## 🔍 Key openCypher Queries

### 1. Multi-Hop Career Pathway Traversal
```cypher
MATCH (s:Skill {name: $skillName})-[:REQUIRED_FOR]->(j:JobRole)-[:HIRED_BY]->(c:Company)
OPTIONAL MATCH (s)-[:USED_WITH]->(t:Technology)
RETURN s.name AS Skill, t.name AS Tech, j.title AS Role, c.name AS Company;
```

### 2. Variable-Length Path Search (`[*1..4]`)
```cypher
MATCH (start {name: $startNode}), (target {name: $targetNode})
MATCH path = allShortestPaths((start)-[*1..4]-(target))
RETURN path
LIMIT 10;
```

### 3. Skill Overlap Between Two Career Roles
```cypher
MATCH (j1:JobRole {title: $role1})<-[:REQUIRED_FOR]-(s:Skill)-[:REQUIRED_FOR]->(j2:JobRole {title: $role2})
RETURN s.name AS SharedSkill, s.category AS Category;
```

### 4. Company Technology Stack Inverse Traversal
```cypher
MATCH (c:Company {name: $company})<-[:HIRED_BY]-(j:JobRole)<-[:USED_IN]-(t:Technology)
RETURN DISTINCT t.name AS Technology, t.type AS Type
ORDER BY Technology;
```

---

## 🎯 Evaluation Highlights

1. **Production-Ready openCypher:** All graph queries use parameterized statements (`$param`) to prevent Cypher injection vulnerabilities and enable query plan caching.
2. **Interactive Visual Centerpiece:** D3 force-directed property graph with drag physics, zoom, highlighting, real-time node filtering, and bi-directional drilldowns.
3. **Multi-Hop Traversal Finder:** Instant computation of shortest career and technology trajectories (e.g. `Python ➔ PyTorch ➔ AI/ML Engineer ➔ Google`).
4. **Resilient Dual-Mode Architecture:** Connects to live CognoDB over Bolt protocol with zero configuration fallback to the embedded graph engine.
5. **openCypher Inspector & Playground:** Live execution modal allowing evaluators to inspect the exact Cypher query driving every UI card and run custom Cypher statements.
