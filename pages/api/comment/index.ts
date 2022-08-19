import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  if (req.method !== "POST") return;

  const { content, postId, login } = req.body as RequestBody;

  if (!postId || !content || !login) {
    res.status(400).json({ message: "필수 값들이 빠졌어요." });
    return;
  }

  if (content.trim().length > 100) {
    res.status(400).json({ message: "받은 값들 중 너무 긴 값이 있어요." });
    return;
  }

  try {
    const prisma = new PrismaClient();
    const comments = await prisma.comment.findMany();

    const post = (await prisma.post.findMany({ where: { id: postId } }))[0];
    if (!post) {
        res.status(404).json({ message: "그런 포스트는 없어요." });
        return;
    }

    const commentLastId = parseInt(comments.at(-1)?.id || "0");
    const commentNewId = (commentLastId + 1).toString();

    const result: ResponseResult = (await axios(`${process.env.BACK_URL}/users/${login}`, { method: "POST" })).data;
    const user: PrismaDiscordUser = JSON.parse(result.message!);

    await prisma.comment.create({
      data: {
        id: commentNewId,
        author_id: user.id,
        content,
        like: "[]",
        post_id: postId
      }
    });

    res.status(200).json({ message: "ok." });
  } catch (e) {
    res.status(400).json({ message: "error." });
  }
}