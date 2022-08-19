import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";

import axios from "axios";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<PrismaDiscordUser | undefined>(undefined);

  useEffect(() => {
    if (loading) {
      const login = localStorage.getItem("login");
      if (!login) {
        setLoading(false);
        return;
      }
      axios(`${process.env.BACK_URL}/users/${login}`, { method: "POST" }).then(res => {
        setUser(JSON.parse(res.data.message));
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("login");
        setLoading(false);
      });
    }
  }, []);

  const menus = [
    (
      <>
        {
          loading
          ? (<>Loading...</>)
          : user === undefined
          ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </>
          )
          : (
            <>
              <img alt="profile" src={user.avatarUrl} className="h-6 w-6 mt-1 mr-2" />
              {user.nickname}
            </>
          )
        }
      </>
    )
  ];
  const hrefs = [
    !loading && (user === undefined)
    ? "https://discord.com/api/oauth2/authorize?client_id=1009058082292256858&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&response_type=code&scope=identify"
    :
    user !== undefined
    ? `/users/${user.id}`
    : undefined
  ];

  return (
    <nav className="bg-gray-500">
      <div className="flex py-3 justify-between">
        <span className="text-white ml-5 text-3xl font-bold">
            Simple Board
        </span>
        <div className="block md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gray-900 rounded-md text-gray-400 inline-flex items-center justify-center p-2 mr-2 hover:text-white focus:outline-none"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="hidden md:inline-flex mt-1">
          {menus.map((element, idx) => (
            <a className="transition delay-50 text-white text-xl pl-1 mr-3 border-l-2 border-gray-400 flex hover:text-gray-700 hover:cursor-pointer" key={idx} onClick={() => {
              const href = hrefs[idx];
              if (href) window.location.href = href;
            }}>{element}</a>
          ))}
        </div>
      </div>
      <Transition
        show={isOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        >
          <div className="block md:hidden py-1">
            {menus.map((element, idx) => (
                <a className="flex text-white text-xl pt-1 px-2 pb-2 border-t-2 border-gray-400 hover:text-gray-700" key={idx} onClick={() => {
                  const href = hrefs[idx];
                  if (href) window.location.href = href
                }}>{element}</a>
            ))}
          </div>
      </Transition>
    </nav>
  );
};