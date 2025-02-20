"use client";

import { useState } from "react";
import ConversionTable from "./components/layout/ConversionTable";
import FileDropzone from "./components/layout/FileDropzone";
import Hero from "./components/layout/Hero";
import NavBar from "./components/layout/NavBar";

export default function HomePage() {
    const [acceptedFiles, setAcceptedFiles] = useState([]);

    const handleFilesAccepted = (files) => setAcceptedFiles(files);

    return (
        <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 sm:px-6">
            <NavBar />
            <main className="grow">
                <Hero />
                {acceptedFiles.length === 0 ? (
                    <FileDropzone onFilesAccepted={handleFilesAccepted} />
                ) : (
                    <ConversionTable files={acceptedFiles} />
                )}
            </main>
        </div>
    );
}
