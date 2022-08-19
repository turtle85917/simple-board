import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  if (req.method !== "POST") return;

  const { id } = req.query;

  if (typeof id === "string") {
    try {
      const prisma = new PrismaClient();

      const oauth2 = (await prisma.oauth2.findMany({ where: { id } }))[0];
      if (!oauth2) {
        res.status(400).json({ message: "error." });
      }

      await prisma.oauth2.deleteMany({ where: { access_token: oauth2.access_token } });
      res.status(200).json({ message: "ok." });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "error." });
    }
  }
}