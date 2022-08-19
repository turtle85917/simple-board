import { useEffect } from "react";

import type { NextPage } from "next";
import { useRouter } from "next/router";

import axios from "axios";

const Redirect: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    if (!code) {
      router.push("/");
    }

    axios(`${process.env.BACK_URL}/login/${code}`, {
      method: "POST"
    })
    .then(res => {
      const data: ResponseResult = res.data;
      localStorage.setItem("login", data.message!);
      setTimeout(() => window.location.href = "/", 50)
    })
    .catch(e => {
      console.log(e)
      router.push("/");
    });
  }, []);

  return (
    <span className="text-white text-4xl font-bold">Loading...</span>
  )
};

export default Redirect;