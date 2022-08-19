import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  if (req.method !== "POST") return;

  const { code } = req.query;
  const prisma = new PrismaClient();

  if (typeof code === "string") {
    try {
      const tokenResponseData: DiscordToken = (await axios("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          client_id: process.env.CLIENT_ID!,
          client_secret: process.env.CLIENT_SECRET!,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.FRONT_URL}/redirect`,
          scope: "identify"
        })
      })).data;

      const userResponseData: DiscordUser = (await axios("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `${tokenResponseData.token_type} ${tokenResponseData.access_token}`
        }
      })).data;

      const user = await prisma.user.findMany({ where: { id: userResponseData.id } });
      if (!user.length) {
        await prisma.user.create({
          data: {
            id: userResponseData.id,
            nickname: userResponseData.username,
            profile:
              userResponseData.avatar
              ? `https://cdn.discordapp.com/avatars/${userResponseData.id}/${userResponseData.avatar}.png?size=1024`
              : `https://cdn.discordapp.com/embed/avatars/${+userResponseData.discriminator % 4}.png`
          }
        });
      }

      const id = Math.random().toString(36).slice(2);
      const oauth2 = (await prisma.oauth2.findMany({ where: { id } }))[0];
      if (!oauth2) {
        await prisma.oauth2.create({
          data: {
            id,
            access_token: tokenResponseData.access_token
          }
        });
      }

      res.status(200).json({ message: id });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "error." });
    }
  }
}