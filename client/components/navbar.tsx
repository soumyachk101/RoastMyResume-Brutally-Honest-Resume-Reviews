"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { SignIn } from "@/components/auth/sign-in-button";
import { SignOut } from "@/components/auth/sign-out-button";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export function Navbar() {
    const { data: session, status } = useSession();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="sticky top-0 z-50 w-full flex items-center justify-between p-4 md:px-8 max-w-7xl mx-auto backdrop-blur-md bg-black/50 border-b border-white/5"
        >
            <Link href="/" className="font-display font-bold text-2xl tracking-tighter">
                RoastMy<span className="fire-text">Resume</span>
            </Link>
            <div className="hidden md:flex gap-8 items-center text-sm font-medium text-zinc-400">
                <Link href="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
                <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex gap-4 items-center">
                {status === "loading" ? (
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 animate-pulse" />
                ) : session?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                                    <AvatarFallback className="bg-zinc-800 text-white">
                                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {session.user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="cursor-pointer flex items-center">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="p-0">
                                <SignOut />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <SignIn />
                        <button className="hidden sm:block magnetic-btn border border-white/10 shadow-glow-red text-sm py-2 px-6 rounded-lg font-medium">
                            Try Now
                        </button>
                    </>
                )}
            </div>
        </motion.nav>
    );
}
