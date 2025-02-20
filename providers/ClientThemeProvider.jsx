"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function ClientThemeProvider({ children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted ? (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
        </ThemeProvider>
    ) : null;
}
