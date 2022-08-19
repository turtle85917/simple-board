import { useEffect, useRef, useState } from "react";

import type { NextPage } from "next";

import axios from "axios";

import dynamic from "next/dynamic";

const Write: NextPage = () => {
  const Editor = dynamic(() => import("./components/Editor"), { ssr: false });

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<PrismaDiscordUser | undefined>(undefined);

  useEffect(() => {
    if (loading) {
      const login = localStorage.getItem("login");

      axios(`${process.env.BACK_URL}/users/${login}`, { method: "POST" }).then(res => { // access token
        setUser(JSON.parse(res.data.message));
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("login");
        setLoading(false);
      });
    }
  }, []);

  return (
    <>
      <button className="action my-2 ml-2" onClick={() => location.href = "/"}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>
      {
        loading || user === undefined
        ? (<>Loading...</>)
        : (<>
          <div className="text-3xl text-center mb-2">게시글 작성하기</div>
          <input className="title h-3 py-5 w-full pl-3 rounded-lg focus:outline-none mt-2 mb-2" maxLength={35} placeholder="제목을 입력해주세요." />
          <Editor />
        </>)
      }
    </>
  );
};

export default Write;