import { Viewer as ToastViewer } from "@toast-ui/react-editor";

export default function Viewer({ content }: { content: string; }) {
  return (
    <>
      <ToastViewer
        initialValue={content}
        />
    </>
  )
}