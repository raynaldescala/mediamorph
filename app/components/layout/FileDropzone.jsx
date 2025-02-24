"use client";

import { useToast } from "@/hooks/use-toast";
import { CloudUpload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

function FileDropzone({ onFilesAccepted }) {
    const [isDropped, setIsDropped] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback(
        (acceptedFiles, fileRejections) => {
            setIsDropped(true);

            if (fileRejections.length > 0) {
                // Show error toast for rejected files
                const invalidType = fileRejections.some((file) =>
                    file.errors.some((err) => err.code === "file-invalid-type"),
                );
                if (invalidType) {
                    toast({
                        variant: "destructive",
                        title: "Invalid file type!",
                        description:
                            "One or more files have an unsupported file type. Please upload only images, videos, or audio files.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Upload error",
                        description:
                            "One or more files could not be uploaded. Please check your files and try again.",
                    });
                }

                setTimeout(() => setIsDropped(false), 1000); // Reset after delay
                return; // Do not proceed if any file is rejected
            }

            // Only proceed if there are no rejections
            console.log("Accepted", acceptedFiles);
            onFilesAccepted(acceptedFiles);

            setTimeout(() => setIsDropped(false), 1000); // Reset after delay
        },
        [onFilesAccepted, toast],
    );

    const { getRootProps, getInputProps, isDragReject, isDragActive } =
        useDropzone({
            onDrop,
            accept: {
                "image/*": [],
                "video/*": [],
                "audio/*": [],
            },
        });

    const borderClass =
        isDragActive && isDragReject
            ? "border-destructive/40"
            : "border-border";

    return (
        <div
            {...getRootProps()}
            className="mt-12 flex w-full items-center justify-center"
        >
            <label
                htmlFor="dropzone-file"
                className={`${borderClass} flex h-80 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-[3px] border-dashed bg-accent/40 hover:bg-accent/60 hover:opacity-80`}
            >
                <div className="flex flex-col items-center justify-center gap-2 pb-6 pt-5">
                    <CloudUpload className="size-16 text-muted-foreground" />
                    {isDragActive ? (
                        <p className="mb-2 text-lg font-semibold text-muted-foreground">
                            Drop it here...
                        </p>
                    ) : (
                        <p className="mb-2 text-lg text-muted-foreground">
                            <span className="font-semibold">
                                Click to upload
                            </span>{" "}
                            or drag and drop
                        </p>
                    )}
                </div>
                <input
                    {...getInputProps()}
                    id="dropzone-file"
                    className="hidden"
                />
            </label>
        </div>
    );
}

export default FileDropzone;
