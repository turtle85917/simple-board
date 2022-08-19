import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseResult>) {
  const { commentId } = req.query;
  if (typeof commentId !== "string") {
    res.status(400).json({ message: "Post id is not found." });
    return;
  }

  const prisma = new PrismaClient();

  const comment = (await prisma.comment.findMany({ where: { id: commentId } }))[0];
  if (!comment) {
    res.status(404).json({ message: "그런 댓글은 없어요." });
    return;
  }

  const post = (await prisma.post.findMany({ where: { id: comment.post_id } }))[0];
  if (!post) {
    res.status(404).json({ message: "그런 포스트는 없어요." });
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ message: JSON.stringify(comment) });
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

    if (comment.author_id !== user.id) {
      res.status(403).json({ message: "권한이 부족해요." });
      return;
    }

    if (req.method === "PATCH") {
      const { content } = req.body as RequestBody;

      if (!content) {
        res.status(400).json({ message: "필수 값이 빠졌어요." });
        return;
      }

      if (content.trim().length > 100) {
        res.status(400).json({ message: "받은 값들 중 너무 긴 값이 있어요." });
        return;
      }

      await prisma.comment.update({ data: { content, updatedAt: new Date() }, where: { id: commentId } });
      res.status(200).json({ message: "ok." });
    }

    if (req.method === "DELETE") {
      await prisma.post.delete({ where: { id: commentId } });
      res.status(200).json({ message: "ok." });
    }
  } catch (e) {
    res.status(400).json({ message: "error." });
  }
}