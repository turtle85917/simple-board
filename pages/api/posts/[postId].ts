import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  const { postId } = req.query;
  if (typeof postId !== "string") {
    res.status(400).json({ message: "Post id is not found." });
    return;
  }

  const prisma = new PrismaClient();

  const post = (await prisma.post.findMany({ where: { id: postId } }))[0];
  if (!post) {
    res.status(404).json({ message: "그런 포스트는 없어요." });
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ message: JSON.stringify(post) });
    return;
  }

  const { login } = req.body as RequestBody;

  if (!login) {
    res.status(400).json({ message: "필수 값이 빠졌어요." });
    return;
  }

  try {
    const result: ResponseResult = (await axios(`${process.env.BACK_URL}/users/${login}`, { method: "POST" })).data;
    const user: PrismaDiscordUser = JSON.parse(result.message!);

    if (post.author_id !== user.id) {
      res.status(403).json({ message: "권한이 부족해요." });
      return;
    }

    if (req.method === "PATCH") {
      const { title, content } = req.body as RequestBody;

      if (!title || !content) {
        res.status(400).json({ message: "필수 값들이 빠졌어요." });
        return;
      }

      if (title.trim().length > 35 || content.trim().length > 1048) {
        res.status(400).json({ message: "받은 값들 중 너무 긴 값이 있어요." });
        return;
      }

      await prisma.post.update({ data: { title, content, updatedAt: new Date() }, where: { id: postId } });
      res.status(200).json({ message: "ok." });
    }

    if (req.method === "DELETE") {
      await prisma.post.delete({ where: { id: postId } });
      res.status(200).json({ message: "ok." });
    }
  } catch (e) {
    res.status(400).json({ message: "error." });
  }
}