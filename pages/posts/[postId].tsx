import { useEffect, useState } from "react";
import { PrismaClient } from "@prisma/client";

import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";

import axios from "axios";
import dynamic from "next/dynamic";

import getTime from "../utils/getTime";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prisma = new PrismaClient();
  const users: PropsPrismaDiscordUser[] = JSON.parse(JSON.stringify(await prisma.user.findMany()));
  const comments: PropsPrismaComments[] = [];

  JSON.parse(JSON.stringify(await prisma.comment.findMany({ where: { post_id: context.query.postId as string } }))).map((comment: PropsPrismaComments) => {
    comment.user = users.find(u => u.id === comment.author_id)!;
    comments.push(comment);
  })

  return {
    props: {
      users,
      comments
    }
  }
}

interface P {
  users: PropsPrismaDiscordUser[];
  comments: PropsPrismaComments[];
}

const Posts: NextPage<P> = (props) => {
  const router = useRouter();

  const Viewer = dynamic(() => import("../components/Viewer"), { ssr: false });

  const [loading, setLoading] = useState<boolean>(true);
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [author, setAuthor] = useState<PropsPrismaDiscordUser | undefined>(undefined);

  useEffect(() => {
    const { postId } = router.query;

    axios(`${process.env.BACK_URL}/posts/${postId}`)
    .then(res => {
      const data = JSON.parse(res.data.message);
      setPost(data);
      setAuthor(props.users.find(u => u.id === data.author_id));
      setLoading(false);
    })
    .catch(e => {
      setLoading(false);
    });
  }, [loading]);

  return (
    <>
      <button className="action my-2 ml-2" onClick={() => location.href = "/"}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>
      {
        loading || post === undefined
        ? (<>Loading...</>)
        : (<>
          <div className="w-full shadow-2xl max-w-3xl mx-auto">
            <div className="rounded-t-2xl py-5 bg-gray-800">
              <div className="flex text-white ml-2">
                <p className="mr-2 text-gray-300">작성자 : </p>
                <img alt="profile" src={author?.profile} className="w-8 h-8" />
                <span className="text-base mt-1 ml-2">
                    {author?.nickname}
                </span>
              </div>
              <div className="flex text-white ml-2">
                <p className="mr-2 text-gray-300">작성일 : </p>
                <span>{getTime(post.createdAt, true)}</span>
              </div>
              <div className="flex text-white ml-2">
                <p className="mr-2 text-gray-300">수정일 : </p>
                <span>{getTime(post.updatedAt, true)}</span>
              </div>
            </div>
            <div className="rounded-b-2xl pt-3 pb-5 px-2 bg-white">
              <Viewer
                content={post.content}
                />
            </div>
          </div>
          <div className="w-full mt-2 shadow-2xl max-w-3xl mx-auto rounded-2xl pt-2 pb-3 bg-gray-300">
            <div className="mx-2 border-b-2 py-2 border-gray-600 flex">
              <textarea className="content text-sm px-2 w-52 h-10 focus:outline-none" maxLength={100} placeholder="댓글을 입력해주세요." autoComplete="off" />
              <button className="action max-w-xs ml-2" onClick={async () => {
                const login = localStorage.getItem("login");
                if (!login) return;

                const content = (document.querySelector("textarea.content")! as HTMLTextAreaElement).value;

                axios(`${process.env.BACK_URL}/comment`, {
                  method: "POST",
                  data: {
                    content,
                    postId: post.id,
                    login
                  }
                })
                .then(() => {
                  location.href = "/";
                })
                .catch(() => undefined)
              }}>
                등록하기
              </button>
            </div>
            <ul>
              {
                props.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(comment => (
                  <li className="mx-2 border-b-2 py-2 border-gray-600" key={comment.id}>
                    <div className="flex text-gray-800">
                      <img alt="profile" src={comment?.user?.profile} className="w-8 h-8" />
                      <span className="text-base ml-2 mt-1">
                        {comment?.user?.nickname}
                      </span>
                    </div>
                    <div>
                      {comment.content}
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </>)
      }
    </>
  )
}

export default Posts;