import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  if (req.method !== "POST") return;

  const { title, content, login } = req.body as RequestBody;

  if (!title || !content || !login) {
    res.status(400).json({ message: "필수 값들이 빠졌어요." });
    return;
  }

  if (title.trim().length > 35 || content.trim().length > 1048) {
    res.status(400).json({ message: "받은 값들 중 너무 긴 값이 있어요." });
    return;
  }

  try {
    const prisma = new PrismaClient();
    const posts = await prisma.post.findMany();

    const postLastId = parseInt(posts.at(-1)?.id || "0");
    const postNewId = (postLastId + 1).toString();

    const result: ResponseResult = (await axios(`${process.env.BACK_URL}/users/${login}`, { method: "POST" })).data;
    const user: PrismaDiscordUser = JSON.parse(result.message!);

    await prisma.post.create({
      data: {
        id: postNewId,
        author_id: user.id,
        title, content,
        like: "[]",
        view: 0
      }
    });

    res.status(200).json({ message: "ok." });
  } catch (e) {
    res.status(400).json({ message: "error." });
  }
}