"use client";

import { ReactNode } from "react";
import { Web3Provider } from "@/app/context/Web3Context";

export function Providers({ children }: { children: ReactNode}) {
    return (
        <Web3Provider>
            {children}
        </Web3Provider>
    );
}