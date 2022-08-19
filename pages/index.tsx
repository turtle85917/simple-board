import { useEffect, useState } from "react";
import type { NextPage } from "next";

import Navigation from "./components/Navigation";

import { PrismaClient } from "@prisma/client";

import getTime from "./utils/getTime";

export async function getServerSideProps() {
  const prisma = new PrismaClient();

  return {
    props: {
      posts: JSON.parse(JSON.stringify(await prisma.post.findMany())),
      users: JSON.parse(JSON.stringify(await prisma.user.findMany()))
    }
  }
}

interface P {
  posts: Post[];
  users: PropsPrismaDiscordUser[];
}

const Home: NextPage<P> = (props) => {
  const [login, setLogin] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") return;
    setLogin(localStorage.getItem("login") !== undefined);
  }, []);

  return (
    <>
      <Navigation />
      <button className="action mx-auto my-2" onClick={() => window.location.href = "/write"}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        작성하기
      </button>
      <table className="w-full border-separate rounded-t-lg shadow-xl text-base text-center text-white bg-gray-600 outline-none">
        <thead className="text-xs">
          <tr className="border-b border-gray-300">
            <th className="py-3 px-6">제목</th>
            <th className="py-3 px-6">작성자</th>
            <th className="py-3 px-6">작성일</th>
            <th className="py-3 px-6">조회</th>
          </tr>
        </thead>
        <tbody className="bg-gray-300 text-gray-500">
          {
            props.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(post => (
              <tr className="border-b border-gray-200 transition hover:cursor-pointer hover:bg-gray-500 hover:text-white" onClick={() => location.href = `/posts/${post.id}`} key={post.id}>
                <td className="py-4 px- whitespace-nowrap">
                  {post.title}
                </td>
                <td className="py-4 px-6">
                  {props.users.find(u => u.id === post.author_id)?.nickname}
                </td>
                <td className="py-4 px-6">
                  {getTime(post.createdAt, true)}
                </td>
                <td className="py-4 px-6">
                  {post.view.toLocaleString()}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  );
};

export default Home;