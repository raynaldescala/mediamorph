import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "./components/ui/toaster";
import Providers from "./providers";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata = {
    title: "MediaMorph - Transform Your Media, Instantly",
    description:
        "Experience media conversion like never before. Convert videos, audio, and images effortlessly with zero limits, zero fees, and zero hassle. Enjoy high-quality, watermark-free transformations right in your browser. Fast. Free. Unlimited.",
    keywords: [
        "media converter",
        "video converter",
        "audio converter",
        "image converter",
        "free online converter",
        "free media converter",
        "browser-based converter",
        "unlimited media converter",
        "no watermark converter",
        "fast media converter",
        "secure media converter",
        "convert videos online",
        "convert audio online",
        "convert images online",
        "drag and drop converter",
        "instant file conversion",
        "high-quality file converter",
        "privacy-focused converter",
        "FFmpeg WASM converter",
        "lossless media conversion",
        "batch file converter",
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable}`}>
            <body className="font-sans antialiased">
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
