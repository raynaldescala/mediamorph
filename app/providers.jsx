"use client";

import ClientThemeProvider from "@/providers/ClientThemeProvider";

export default function Providers({ children }) {
    return <ClientThemeProvider>{children}</ClientThemeProvider>;
}
