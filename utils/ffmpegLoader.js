import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";

export const loadFFmpeg = async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message);
    });
    await ffmpeg.load({
        coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript",
        ),
        wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm",
        ),
        workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript",
        ),
    });

    return ffmpeg;
};
