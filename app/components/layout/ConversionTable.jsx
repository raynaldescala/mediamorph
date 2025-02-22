"use client";

import { fetchFile } from "@ffmpeg/util";
import { AudioLines, Film, Image, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

// --- Mappings & Helper Functions ---

// Map MIME types to a list of common file extensions.
const mimeToExtensions = {
    "image/jpeg": ["jpeg", "jpg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
    "image/tiff": ["tiff", "tif"],
    "image/bmp": ["bmp"],
    "image/x-icon": ["ico"],
    "image/vnd.adobe.photoshop": ["psd"],
    "image/x-sony-arw": ["arw"],
    "image/x-canon-cr2": ["cr2"],
    "image/x-nikon-nef": ["nef"],
    "image/x-olympus-orf": ["orf"],
    "image/x-fujifilm-raf": ["raf"],
    "image/x-panasonic-rw2": ["rw2"],

    "video/mp4": ["mp4", "m4v"],
    "video/webm": ["webm"],
    "video/quicktime": ["mov"],
    "video/x-msvideo": ["avi"],
    "video/x-matroska": ["mkv"],
    "video/x-flv": ["flv"],
    "video/3gpp": ["3gp"],
    "video/ogg": ["ogv"],
    "video/x-ms-wmv": ["wmv"],
    "video/mp2t": ["ts", "m2ts"],
    "video/x-dvd": ["vob"],

    "audio/mpeg": ["mp3"],
    "audio/wav": ["wav"],
    "audio/ogg": ["ogg"],
    "audio/flac": ["flac"],
    "audio/aac": ["aac"],
    "audio/aiff": ["aiff", "aif"],
    "audio/x-m4a": ["m4a"],
    "audio/x-ms-wma": ["wma"],
    "audio/alac": ["alac"],
    "audio/amr": ["amr"],
    "audio/opus": ["opus"],
    "audio/x-aiff": ["aiff"],
    "audio/basic": ["pcm"],
};

// Define which target formats are allowed for a given source format.
const supportedConversions = {
    image: {
        jpeg: ["png", "webp", "gif", "tiff", "bmp", "ico"],
        jpg: ["png", "webp", "gif", "tiff", "bmp", "ico"],
        png: ["jpeg", "webp", "gif", "tiff", "bmp", "ico"],
        webp: ["jpeg", "gif", "tiff", "bmp", "ico"],
        gif: ["jpeg", "png", "webp", "tiff", "bmp"],
        bmp: ["jpeg", "png", "webp", "gif", "tiff"],
        tiff: ["jpeg", "png", "webp", "gif", "bmp"],
        ico: ["jpeg", "png", "webp"],
        // Raw images convert to jpeg
        arw: ["jpeg"],
        cr2: ["jpeg"],
        nef: ["jpeg"],
        orf: ["jpeg"],
        raf: ["jpeg"],
        rw2: ["jpeg"],
    },
    audio: {
        mp3: ["wav", "aac", "ogg", "m4a", "wma", "flac", "alac"],
        aac: ["mp3", "wav", "ogg", "m4a", "wma", "flac"],
        ogg: ["mp3", "wav", "aac", "m4a", "wma", "flac"],
        m4a: ["mp3", "wav", "aac", "ogg", "wma", "flac"],
        wma: ["mp3", "wav", "aac", "ogg", "m4a", "flac"],
        wav: ["mp3", "aac", "ogg", "m4a", "wma", "flac", "alac"],
        flac: ["mp3", "wav", "aac", "ogg", "m4a", "alac"],
        alac: ["mp3", "wav", "flac", "aac", "m4a"],
        aiff: ["mp3", "wav", "aac", "ogg", "flac"],
        pcm: ["mp3", "wav", "aac", "flac"],
        amr: ["mp3", "wav", "ogg", "m4a"],
        opus: ["mp3", "wav", "ogg", "m4a"],
    },
    video: {
        mp4: ["webm", "mov", "avi", "mkv", "flv", "wmv", "m4v", "ts"],
        webm: ["mp4", "mov", "avi", "mkv", "flv", "wmv", "m4v"],
        mov: ["mp4", "webm", "avi", "mkv", "flv", "wmv", "m4v", "ts"],
        avi: ["mp4", "webm", "mov", "mkv", "flv", "wmv", "m4v"],
        mkv: ["mp4", "webm", "mov", "avi", "flv", "wmv", "m4v"],
        flv: ["mp4", "webm", "mov", "avi", "mkv", "wmv"],
        wmv: ["mp4", "webm", "mov", "avi", "mkv", "flv"],
        m4v: ["mp4", "webm", "mov", "avi", "mkv"],
        "3gp": ["mp4", "webm", "mov", "avi"],
        ogv: ["mp4", "webm", "mov", "avi"],
        ts: ["mp4", "mov", "mkv"],
        vob: ["mp4", "webm", "mov", "mkv"],
        m2ts: ["mp4", "webm", "mov", "mkv"],
    },
};

// Format bytes in a human‑readable way.
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Get file category from its MIME type.
const getFileCategory = (type) => {
    if (type.includes("image")) return "image";
    if (type.includes("video")) return "video";
    return "audio";
};

const removeFileExtension = (fileName) => {
    const lastDot = fileName.lastIndexOf(".");
    return lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
};

// Get the canonical extension from MIME type or file name.
const getCurrentFormat = (mimeType, fileName) => {
    const exts = mimeToExtensions[mimeType];
    return exts && exts.length
        ? exts[0]
        : fileName.split(".").pop().toLowerCase();
};

// Get output MIME type based on target format.
const getMimeTypeForFormat = (format) => {
    const videoFormats = [
        "mp4",
        "mov",
        "avi",
        "mkv",
        "webm",
        "flv",
        "wmv",
        "m4v",
        "ts",
    ];
    const audioFormats = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
    const imageFormats = [
        "jpeg",
        "jpg",
        "png",
        "webp",
        "gif",
        "tiff",
        "bmp",
        "ico",
    ];
    if (videoFormats.includes(format)) return `video/${format}`;
    if (audioFormats.includes(format)) return `audio/${format}`;
    if (imageFormats.includes(format))
        return `image/${format === "jpg" ? "jpeg" : format}`;
    return "";
};

// --- Main Component ---
export default function ConversionTable({ files }) {
    // State: tracks conversion details per file.
    const [conversions, setConversions] = useState({});

    // Check if every file has a selected output format.
    const allTargetsSelected = files.every(
        (f) =>
            conversions[f.name] &&
            conversions[f.name].target &&
            conversions[f.name].target !== "none",
    );

    // Check if every file has been converted (i.e. a download URL exists).
    const allConverted = files.every((f) => conversions[f.name]?.url);

    // Function to convert a file using FFmpeg.
    const startConversion = async (file, targetFormat, category) => {
        const { loadFFmpeg } = await import("@/utils/ffmpegLoader");
        const ffmpeg = await loadFFmpeg();
        await ffmpeg.writeFile(file.name, await fetchFile(file));

        const baseName = file.name.replace(/\.[^.]+$/, ""); // Remove file extension
        const outputName = `${baseName}.${targetFormat}`;

        // Build FFmpeg command
        const args =
            category === "image"
                ? [
                      "-i",
                      file.name,
                      "-frames:v",
                      "1",
                      "-update",
                      "1",
                      outputName,
                  ]
                : ["-i", file.name, outputName];

        await ffmpeg.exec(args);
        const data = await ffmpeg.readFile(outputName);
        const mime = getMimeTypeForFormat(targetFormat);
        const blob = new Blob([data.buffer], { type: mime });
        const url = URL.createObjectURL(blob);

        setConversions((prev) => ({
            ...prev,
            [file.name]: {
                target: targetFormat,
                url,
                isConverting: false,
                isError: false,
            },
        }));
    };

    // Function to convert all files in parallel.
    const convertAll = async () => {
        const promises = files.map((file) => {
            const conversion = conversions[file.name];
            if (
                conversion &&
                conversion.target &&
                conversion.target !== "none"
            ) {
                setConversions((prev) => ({
                    ...prev,
                    [file.name]: { ...prev[file.name], isConverting: true },
                }));
                return startConversion(
                    file,
                    conversion.target,
                    getFileCategory(file.type),
                );
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
    };

    return (
        <section className="mt-12 grid w-full grid-flow-row gap-2">
            {files.map(({ name, size, type }) => {
                const category = getFileCategory(type);
                const currentFormat = getCurrentFormat(type, name);
                const allowedOptions =
                    (supportedConversions[category] &&
                        supportedConversions[category][currentFormat]) ||
                    [];
                const conversion = conversions[name] || {};
                const { target, url, isConverting, isError } = conversion;
                return (
                    <div
                        key={name}
                        className="rounded-lg border p-5 text-sm font-medium"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-primary">
                                {category === "image" ? (
                                    <Image />
                                ) : category === "video" ? (
                                    <Film />
                                ) : (
                                    <AudioLines />
                                )}
                            </div>
                            <div className="grid">
                                <span className="mb-[1.5px] truncate font-medium">
                                    {name}
                                </span>
                                <span className="text-muted-foreground">
                                    {formatBytes(size)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">
                                    Output:
                                </span>
                                {/* If the file is not yet converted, show the dropdown; otherwise show a status badge */}
                                {!url ? (
                                    <Select
                                        onValueChange={(value) =>
                                            setConversions((prev) => ({
                                                ...prev,
                                                [name]: {
                                                    target: value,
                                                    url: null,
                                                    isConverting: false,
                                                    isError: false,
                                                },
                                            }))
                                        }
                                        value={target || "none"}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue>
                                                {target || "..."}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup className="grid grid-cols-2">
                                                {allowedOptions.length > 0 ? (
                                                    allowedOptions.map(
                                                        (fmt) => (
                                                            <SelectItem
                                                                key={fmt}
                                                                value={fmt}
                                                            >
                                                                {fmt}
                                                            </SelectItem>
                                                        ),
                                                    )
                                                ) : (
                                                    <SelectItem
                                                        disabled
                                                        value="none"
                                                    >
                                                        none
                                                    </SelectItem>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="font-bold text-green-500">
                                        {isConverting ? (
                                            <>
                                                <LoaderCircle className="mr-1 h-5 w-5 animate-spin" />
                                                Converting...
                                            </>
                                        ) : isError ? (
                                            "Error"
                                        ) : (
                                            "Done"
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                        {url && (
                            <div className="mt-2">
                                <a
                                    href={url}
                                    download={`${name.split(".")[0]}.${conversion.target}`}
                                    className="btn btn-outline"
                                >
                                    Download Converted File
                                </a>
                            </div>
                        )}
                    </div>
                );
            })}
            {/* Bottom action buttons */}
            <div className="mt-6 flex justify-end gap-4">
                {/* "Convert Now" Button: disabled until every file has a selected target */}
                {!allConverted && (
                    <Button
                        onClick={convertAll}
                        disabled={
                            !allTargetsSelected ||
                            !files.every(
                                (f) =>
                                    conversions[f.name]?.target &&
                                    conversions[f.name].target !== "none",
                            )
                        }
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {files.some(
                            (f) => conversions[f.name]?.isConverting,
                        ) ? (
                            <>
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                                Converting...
                            </>
                        ) : (
                            "Convert Now"
                        )}
                    </Button>
                )}

                {/* "Download All" Button: shown only when all files have been converted */}
                {allConverted && (
                    <Button
                        onClick={() => {
                            files.forEach((f) => {
                                const conv = conversions[f.name];
                                if (conv && conv.url) {
                                    const a = document.createElement("a");
                                    a.href = conv.url;
                                    a.download = `${f.name.split(".")[0]}.${conv.target}`;
                                    a.click();
                                }
                            });
                        }}
                        disabled={!allConverted}
                        className="btn btn-secondary"
                    >
                        Download All
                    </Button>
                )}
            </div>
        </section>
    );
}
