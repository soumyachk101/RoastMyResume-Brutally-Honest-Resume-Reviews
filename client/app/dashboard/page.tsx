import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UploadZone } from "@/components/dashboard/upload-zone"
import { FileUp, Sparkles, History } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/")
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-fire-red selection:text-white pb-24">
            <main className="max-w-5xl mx-auto w-full px-4 flex flex-col gap-12 mt-12">
                {/* Header Section */}
                <section className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                        Welcome back, <span className="fire-text">{session.user.name?.split(' ')[0] || 'Roastee'}</span>
                    </h1>
                    <p className="text-zinc-400 font-sans text-lg">
                        Ready to face the music? Drop your resume below.
                    </p>
                </section>

                {/* Upload Section */}
                <section className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-fire-red/20 to-fire-orange/20 blur-xl opacity-50 rounded-3xl -z-10" />
                    <div className="glass-card border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl bg-black/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-fire-orange/20 text-fire-orange rounded-lg">
                                <FileUp className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-display font-bold">New Roast</h2>
                        </div>

                        <UploadZone />
                    </div>
                </section>

                {/* Stats / Recent Layout Placeholder */}
                <section className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="glass-card border border-white/5 p-6 rounded-2xl flex flex-col gap-4 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3 text-zinc-300">
                            <Sparkles className="w-5 h-5 text-zinc-500 group-hover:text-fire-orange transition-colors" />
                            <h3 className="font-display font-semibold text-lg">Roast Credits</h3>
                        </div>
                        <div className="text-4xl font-mono font-bold">1<span className="text-sm text-zinc-500 font-sans font-normal ml-2">/ week</span></div>
                        <button className="text-sm text-fire-orange font-medium mt-auto text-left hover:underline">
                            Upgrade to Pro →
                        </button>
                    </div>

                    <div className="glass-card border border-white/5 p-6 rounded-2xl flex flex-col gap-4 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3 text-zinc-300">
                            <History className="w-5 h-5 text-zinc-500 group-hover:text-fire-orange transition-colors" />
                            <h3 className="font-display font-semibold text-lg">Recent Roasts</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/5 min-h-[100px]">
                            <p className="text-sm text-zinc-500">No roasts yet. Coward.</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    )
}
