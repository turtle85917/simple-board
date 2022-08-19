import { useEffect, useState } from "react";
import type { NextPage } from "next";

import axios from "axios";

const User: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<APIDiscordUser | undefined>(undefined);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (loading) {
      const id = location.pathname.replace(/\/users\//, "");
      const login = localStorage.getItem("login");

      axios(`${process.env.BACK_URL}/users/${id}`).then(res => { // discord user id
        setUser(JSON.parse(res.data.message));
        axios(`${process.env.BACK_URL}/users/${login}`, { method: "POST" }).then(res => { // access token
          setId(JSON.parse(res.data.message).id);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("login");
          setLoading(false);
        });
      })
      .catch(() => {
        location.href = "/";
      });
    }
  }, []);

  return (
    <>
      {
        loading || user === undefined
        ? (<>Loading...</>)
        : (
          <>
            <button className="action my-2 mx-auto" onClick={() => location.href = "/"}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <div className="w-full shadow-2xl max-w-3xl mx-auto">
              <div className="rounded-t-2xl py-5 bg-white" style={{ background: user.banner_color }} />
              <div className="rounded-b-2xl pt-3 pb-5 bg-white text-center">
                <img alt="profile" src={user.avatarUrl} className="h-12 w-12 m-auto mb-3" />
                <div className="text-xl">
                  {user.username}
                  <span className="text-base font-bold text-gray-500">#{user.discriminator}</span>
                </div>
              </div>
            </div>
            {
              id === user.id
              ? (
              <div className="w-full shadow-2xl mt-5 max-w-3xl mx-auto">
                <div className="rounded-t-2xl py-5 bg-red-400 flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  위험
                  <span className="text-sm text-gray-300 ml-2">
                    데이터를 관리하는 부분이에요.
                  </span>
                </div>
                <div className="rounded-b-2xl pt-3 pb-1 bg-white text-center">
                  <div className="block border-b-2 border-gray-400">
                    <span className="text-sm text-gray-700">탈퇴를 진행 후, 데이터는 삭제해요.</span>
                    <button className="action danger mx-auto my-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      계정 폭발
                    </button>
                  </div>
                  <div className="block">
                    <button
                      className="action danger mx-auto my-2"
                      onClick={async () => {
                        const id = localStorage.getItem("login");
                        if (!id) return;

                        localStorage.removeItem("login");

                        try {
                          (await axios(`${process.env.BACK_URL}/logout/${id}`, { method: "POST" })).data;
                          window.location.href = "/";
                        } catch (e) {
                          console.error(e);
                          window.location.href = "/";
                        }
                      }}
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>)
              : (<></>)
            }
          </>
        )
      }
    </>
  )
};

export default User;