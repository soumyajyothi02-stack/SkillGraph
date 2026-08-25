import express from "express";

import { skillsRouter } from "../backend/routes/skills.js";
import { technologiesRouter } from "../backend/routes/technologies.js";
import { rolesRouter } from "../backend/routes/roles.js";
import { companiesRouter } from "../backend/routes/companies.js";
import { graphRouter } from "../backend/routes/graph.js";
import { connectionsRouter } from "../backend/routes/connections.js";
import { searchRouter } from "../backend/routes/search.js";
import { seedRouter } from "../backend/routes/seed.js";
import { queryRouter } from "../backend/routes/query.js";
import { GraphService } from "../backend/graphService.js";

const app = express();

app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const status = await GraphService.getStatus();

    res.json({
      database: "CognoDB",
      connected: status.connected,
      appName: "SkillGraph",
      ...status,
    });
  } catch (error: any) {
    res.status(500).json({
      database: "CognoDB",
      connected: false,
      status: "error",
      message: "Unable to check database status.",
      error: error.message,
    });
  }
});

app.use("/api/skills", skillsRouter);
app.use("/api/technologies", technologiesRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/graph", graphRouter);
app.use("/api/connections", connectionsRouter);
app.use("/api/search", searchRouter);
app.use("/api/seed", seedRouter);
app.use("/api/query", queryRouter);

export default app;
