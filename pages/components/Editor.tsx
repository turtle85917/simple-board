import { useEffect, useRef } from "react";

import colorSyntax from "@toast-ui/editor-plugin-color-syntax";
import { Editor as ToastEditor } from "@toast-ui/react-editor";

import "@toast-ui/editor/dist/i18n/ko-kr";

import "tui-color-picker/dist/tui-color-picker.css";
import "@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css";

import axios from "axios";

export default function Editor() {
  const ref = useRef<ToastEditor>(null);

  useEffect(() => {
    if (ref.current) {
      const editor = ref.current.getInstance();
      editor.removeHook("addImageBlobHook");
    }
  }, []);

  return (
    <>
      <ToastEditor
        ref={ref}
        initialValue="# 아무거나 입력해보세요."
        placeholder="내용을 입력해주세요."
        previewStyle="vertical"
        plugins={[colorSyntax]}
        usageStatistics={false}
        hideModeSwitch={true}
        initialEditType="wysiwyg"
        toolbarItems={[
          ["heading", "bold", "italic", "strike"],
          ["hr"],
          ["ul", "ol", "task"],
          ["table", "link"], ["code"], ["scrollSync"]
        ]}
        language="ko-KR"
        height="50em"
        />
        <button
          className="action my-2 mx-auto"
          onClick={async () => {
            const login = localStorage.getItem("login");
            if (!login) return;

            const title = (document.querySelector("input.title") as HTMLInputElement).value?.trim();
            const content = ref.current?.getInstance().getMarkdown()?.trim();

            if (!title || title.length > 35) return;
            if (!content || content.length > 1048) return;

            axios(`${process.env.BACK_URL}/posts`, {
              method: "POST",
              headers: {
                ContentType: "application/json"
              },
              data: { title, content, login }
            })
            .then(res => {
              location.href = `/${res.data.message}`;
            })
            .catch(e => {
              location.href = "/";
            });
          }}
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          올리기
        </button>
    </>
  )
}