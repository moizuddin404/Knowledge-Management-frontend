// MyEditor.jsx
import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import {
  EditorState,
  convertToRaw,
  ContentState
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const MyEditor = ({ note, setNote }) => {
  const [editorState, setEditorState] = useState(() =>
    note
      ? EditorState.createWithContent(
          ContentState.createFromBlockArray(htmlToDraft(note).contentBlocks)
        )
      : EditorState.createEmpty()
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
      setNote(html);
    }, 150); // 150ms debounce
  
    return () => clearTimeout(timeout);
  }, [editorState, setNote]);

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={setEditorState}
      toolbarClassName="sticky top-0 z-9 bg-white border-b border-gray-200"
      wrapperClassName="w-full h-full"
      editorClassName="p-2 border border-gray-300 overflow-y-auto max-h-[100%]"
    />
  );
};

export default MyEditor;
