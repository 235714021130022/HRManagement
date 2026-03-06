import React, { useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Box, Button, Center, Flex, Text, VStack } from "@chakra-ui/react";
import { FiUploadCloud } from "react-icons/fi";
import apiClient from "../../../lib/api";
import { BASE_URL, URL_API_CANDIDATE } from "../../../constant/config";
import { useNotify } from "../../../components/notification/NotifyProvider";

type CandidateCvTabProps = {
  candidateId: string;
  cvFile?: string | null;
  onUploaded?: () => void | Promise<unknown>;
  maxMb?: number; // default 5
  acceptExt?: string[]; // default ["pdf","doc","docx"]
};
export type CandidateCvTabHandle = {
  pickFile: () => void;
};
const CandidateCvTab = forwardRef<CandidateCvTabHandle, CandidateCvTabProps>(
({ candidateId, cvFile, onUploaded, maxMb = 5, acceptExt = ["pdf","doc","docx"] }, ref) => {

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const notify = useNotify();

  const pickFile = () => inputRef.current?.click();

  useImperativeHandle(ref, () => ({
    pickFile,
  }));
  const [picked, setPicked] = useState<File | null>(null);
  const hasCv = !!cvFile;

  const cvUrl = useMemo(() => {
    if (!cvFile) return "";
    return `${BASE_URL}/uploads/cv/${cvFile}`;
  }, [cvFile]);


  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !acceptExt.includes(ext)) {
    notify({
        type: "warning",
        message: "Invalid file",
        description: `Receive only ${acceptExt.map((x) => x.toUpperCase()).join("/")}`,
    });

    e.target.value = "";
    return;
    }
    if (f.size > maxMb * 1024 * 1024) {
      notify({
        type: "warning",
        message: "Deleted",
        description: `File maximum ${maxMb}MB`,
    });

      e.target.value = "";
      return;
    }

    setPicked(f);
    // auto upload luôn cho đúng "1 nút"
    void upload(f);
    e.target.value = "";
  };

  const upload = async (file: File) => {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("cv", file);

      if (!hasCv) {
        form.append("candidate_id", candidateId);
        await apiClient.post(`${URL_API_CANDIDATE}/upload-cv`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.put(`${URL_API_CANDIDATE}/${candidateId}/cv`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setPicked(null);
      await onUploaded?.();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box p={4}>
      {/* ONLY ONE BUTTON - TOP RIGHT */}
      <Flex justify="flex-end" mb={-3}>
        <input
          ref={inputRef}
          type="file"
          accept={acceptExt.map((x) => `.${x}`).join(",")}
          style={{ display: "none" }}
          onChange={onChangeFile}
        />
       
      </Flex>

      {/* PREVIEW ONLY */}
      {hasCv ? (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          h="520px"
          overflow="hidden"
          bg="gray.50"
        >
          <iframe
            title="CV Preview"
            src={cvUrl}
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </Box>
      ) : (
        <Center
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          h="520px"
          bg="gray.50"
        >
          <VStack spacing={2}>
            <Text fontWeight="600">Chưa có CV</Text>
            <Text fontSize="sm" color="gray.600">
              Bấm “Tải lên CV mới” để upload.
            </Text>
          </VStack>
        </Center>
      )}
    </Box>
  );
}
)
export default CandidateCvTab;