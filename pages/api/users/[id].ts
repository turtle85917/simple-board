import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  if (req.method !== "POST") {
    if (req.method === "GET") {
      const { id } = req.query;

      if (typeof id === "string") {
        try {
          const prisma = new PrismaClient();

          const user = (await prisma.user.findMany({ where: { id } }))[0];
          let user_: APIDiscordUser = (await axios(`https://discord.com/api/users/${user.id}`, {
            headers: {
              Authorization: `Bot ${process.env.TOKEN}`
            }
          })).data;

          user_.avatarUrl = user.profile;

          res.status(200).json({ message: JSON.stringify(user_) });
        } catch (e) {
          console.error(e);
          res.status(400).json({ message: "error." });
        }
      }
    }
    return;
  }

  const { id } = req.query;
  
  if (typeof id === "string") {
    try {
      const prisma = new PrismaClient();
      const oauth2 = (await prisma.oauth2.findMany({ where: { id } }))[0];

      if (!oauth2) {
        res.status(400).json({ message: "error." });
        return;
      }

      const userResponseData: DiscordUser = (await axios("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `${oauth2.token_type} ${oauth2.access_token}`
        }
      })).data;

      const user = (await prisma.user.findMany({ where: { id: userResponseData.id } }))[0];

      if (!user) {
        await prisma.oauth2.delete({ where: { id } });
        res.status(400).json({ message: "error." });
        return;
      }

      res.status(200).json({ message: JSON.stringify({
        id: userResponseData.id,
        nickname: user.nickname,
        avatarUrl: user.profile
      }) });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "error." });
    }
  }
}