import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useEffect, useId, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export interface RichTextEditorFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  minHeight?: string;
  isDisabled?: boolean;
  name?: string;
}

export default function RichTextEditorField({
  label,
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  required = false,
  error,
  minHeight = "220px",
  isDisabled = false,
  name,
}: RichTextEditorFieldProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const syncingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const toolbarId = `ql-toolbar-${useId().replace(/[:]/g, "")}`;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder,
      readOnly: isDisabled,
      modules: {
        toolbar: {
          container: `#${toolbarId}`,
          handlers: {
            undo(this: { quill: Quill }) {
              this.quill.history.undo();
            },
            redo(this: { quill: Quill }) {
              this.quill.history.redo();
            },
          },
        },
        history: {
          delay: 500,
          maxStack: 100,
          userOnly: true,
        },
      },
    });

    const handleTextChange = () => {
      if (syncingRef.current) return;
      const html = quill.root.innerHTML;
      onChangeRef.current(html === "<p><br></p>" ? "" : html);
    };

    quill.on("text-change", handleTextChange);
    quillRef.current = quill;

    return () => {
      quill.off("text-change", handleTextChange);
      quillRef.current = null;
    };
  }, [toolbarId, placeholder, isDisabled]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    quill.enable(!isDisabled);
    quill.root.dataset.placeholder = placeholder;

    const editorHtml = quill.root.innerHTML === "<p><br></p>" ? "" : quill.root.innerHTML;
    const incoming = value || "";

    if (incoming === editorHtml) return;

    syncingRef.current = true;
    quill.root.innerHTML = incoming || "<p><br></p>";
    syncingRef.current = false;
  }, [value, isDisabled, placeholder]);

  return (
    <FormControl isInvalid={!!error} isRequired={required}>
      {label && (
        <FormLabel
          mb={2}
          fontSize="md"
          fontWeight="700"
          color="#1A202C"
        >
          {label}
        </FormLabel>
      )}

      <Box
        border="1px solid"
        borderColor={error ? "red.300" : "#D9E2F2"}
        borderRadius="12px"
        overflow="hidden"
        bg="white"
        transition="all 0.2s ease"
        _focusWithin={{
          borderColor: "#4C6FFF",
          boxShadow: "0 0 0 1px #4C6FFF",
        }}
        opacity={isDisabled ? 0.7 : 1}
        pointerEvents={isDisabled ? "none" : "auto"}
        sx={{
          ".ql-toolbar.ql-snow": {
            border: "none",
            borderBottom: "1px solid #E6ECF5",
            background: "#F8FAFC",
            px: 3,
            py: 2,
          },
          ".ql-container.ql-snow": {
            border: "none",
          },
          ".ql-editor": {
            minHeight,
            fontSize: "md",
            lineHeight: "1.7",
            color: "#2D3748",
            p: 4,
          },
          ".ql-editor.ql-blank::before": {
            color: "#A0AEC0",
            left: "16px",
            right: "16px",
            fontStyle: "normal",
          },
        }}
      >
        <Box id={toolbarId} className="ql-toolbar ql-snow">
          <span className="ql-formats">
            <button type="button" className="ql-bold" />
            <button type="button" className="ql-italic" />
            <button type="button" className="ql-underline" />
            <button type="button" className="ql-color" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-align" value="" />
            <button type="button" className="ql-align" value="center" />
            <button type="button" className="ql-align" value="right" />
            <button type="button" className="ql-align" value="justify" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-list" value="ordered" />
            <button type="button" className="ql-list" value="bullet" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-indent" value="-1" />
            <button type="button" className="ql-indent" value="+1" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-link" />
            <button type="button" className="ql-image" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-undo">
              <svg viewBox="0 0 18 18">
                <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
                <path
                  className="ql-stroke"
                  d="M4,11.5c0-4.3,2.6-7.5,6-7.5c3.6,0,6,2.9,6,6.5c0,3.5-2.3,6.5-6,6.5"
                />
              </svg>
            </button>
            <button type="button" className="ql-redo">
              <svg viewBox="0 0 18 18">
                <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
                <path
                  className="ql-stroke"
                  d="M14,11.5c0-4.3-2.6-7.5-6-7.5c-3.6,0-6,2.9-6,6.5c0,3.5,2.3,6.5,6,6.5"
                />
              </svg>
            </button>
          </span>
        </Box>

        <Box ref={editorRef} className="ql-container ql-snow" data-name={name} />
      </Box>

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}