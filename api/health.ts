import { GraphService } from "../backend/graphService.js";

export default async function handler(
  _req: any,
  res: any
) {
  try {
    const status = await GraphService.getStatus();

    res.status(200).json({
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
}
