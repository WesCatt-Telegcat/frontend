import type {Metadata} from "next";
import {Geist, Geist_Mono, Noto_Sans_SC, Figtree} from "next/font/google";
import "./globals.css";
import {cn} from "@/lib/utils";

const figtree = Figtree({subsets: ['latin'], variable: '--font-sans'});


const notoSansSC = Noto_Sans_SC({
    variable: "--font-noto_sans_sc",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Telegcat",
    description: "Telegcat-working...",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn("font-sans", figtree.variable)}>
        <body
            className={`${notoSansSC.className} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
