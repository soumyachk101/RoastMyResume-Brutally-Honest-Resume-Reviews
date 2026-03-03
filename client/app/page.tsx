"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, Flame, Check } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-fire-red selection:text-white pb-24 overflow-hidden">
      <Navbar />

      {/* 1. Hero Section */}
      <main className="flex flex-col items-center justify-center pt-32 pb-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fire-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-fire-orange"></span>
          </span>
          <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-widest">
            50,000+ Resumes Roasted
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tighter max-w-5xl leading-[1.1] mb-6"
        >
          Your Resume Sucks.<br />
          <span className="fire-text">Let's Fix That.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-sans text-lg md:text-xl text-zinc-400 max-w-2xl mb-12"
        >
          Brutally honest, AI-powered resume reviews that are actually fun to read.
          Stop getting ghosted completely and start getting interviews.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto px-4"
        >
          <button className="magnetic-btn shadow-glow-red flex items-center justify-center gap-2 text-lg px-8 py-4 w-full sm:w-auto rounded-xl font-bold transition-all group">
            Roast My Resume
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-8 py-4 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 transition-all text-white font-medium text-lg w-full sm:w-auto">
            Be Nice Mode 🥺
          </button>
        </motion.div>
      </main>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-3xl md:text-5xl font-display font-bold text-center mb-16 tracking-tight"
        >
          How It <span className="fire-text">Works</span>
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { tag: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX. We don't store it unless you tell us to." },
            { tag: "02", title: "AI Analyzes", desc: "Our Gordon Ramsay AI tears apart your buzzwords and formatting." },
            { tag: "03", title: "Get Roasted", desc: "Receive a brutally honest score and actionable feedback to improve." }
          ].map((step, i) => (
            <motion.div key={i} variants={fadeIn} className="glass-card relative overflow-hidden group">
              <div className="text-5xl font-mono font-bold text-white/5 absolute -right-4 -bottom-4 group-hover:text-fire-orange/20 transition-colors duration-500">
                {step.tag}
              </div>
              <h3 className="text-xl font-bold mb-4 font-display">{step.title}</h3>
              <p className="text-zinc-400">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. Features Bento Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-3xl md:text-5xl font-display font-bold text-center mb-16 tracking-tight"
        >
          Unfair <span className="fire-text">Advantages</span>
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
        >
          <motion.div variants={fadeIn} className="glass-card md:col-span-2 lg:col-span-2 flex flex-col justify-end! relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-fire-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h3 className="text-2xl font-bold mb-2 font-display relative z-10">Choose Your Coach</h3>
            <p className="text-zinc-400 relative z-10 max-w-md">Toggle between Gordon Ramsay (Brutal) or Therapy (Nice) modes depending on how much truth you can handle today.</p>
          </motion.div>

          <motion.div variants={fadeIn} className="glass-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-fire-orange group-hover:bg-fire-orange/20 group-hover:border-fire-orange/50 transition-colors">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 font-display">Score System</h3>
              <p className="text-zinc-400 text-sm">ATS-optimized scoring out of 100.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="glass-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-fire-orange group-hover:bg-fire-orange/20 group-hover:border-fire-orange/50 transition-colors">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 font-display">Share Results</h3>
              <p className="text-zinc-400 text-sm">Flex your high score on LinkedIn automatically.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="glass-card md:col-span-2 flex flex-col justify-end! relative overflow-hidden group bg-[#0a0a0a]">
            <h3 className="text-2xl font-bold mb-2 font-display relative z-10">Tailored to your Industry</h3>
            <p className="text-zinc-400 relative z-10 max-w-md">Whether you are pushing code or closing deals, the AI adapts its roast logic to standard industry expectations.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-24 w-full">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-3xl md:text-5xl font-display font-bold text-center mb-16 tracking-tight"
        >
          Simple <span className="fire-text">Pricing</span>
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 items-center"
        >
          {/* Free Tier */}
          <motion.div variants={fadeIn} className="glass-card flex flex-col h-full relative hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold font-display mb-2">Thick Skin</h3>
            <p className="text-zinc-400 mb-6">For the occasional roast.</p>
            <div className="text-4xl font-bold mb-6 font-mono">$0<span className="text-lg text-zinc-500 font-sans">/mo</span></div>
            <ul className="space-y-4 mb-8 text-zinc-300 flex-1">
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-zinc-500" /> 1 Roast per week</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-zinc-500" /> Brutal Mode only</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-zinc-500" /> Standard Scoring</li>
            </ul>
            <button className="w-full py-3 mt-auto rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium">
              Start Free
            </button>
          </motion.div>

          {/* Pro Tier (Highlighted) */}
          <motion.div
            variants={fadeIn}
            className="glass-card border-fire-red/50 shadow-glow-red md:-translate-y-4 flex flex-col h-full relative overflow-hidden hover:-translate-y-6 transition-transform duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-1 fire-gradient"></div>
            <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest text-fire-orange bg-fire-red/10 px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold font-display mb-2 mt-4">Roast Pass™</h3>
            <p className="text-zinc-400 mb-6">Unlimited roasting power.</p>
            <div className="text-4xl font-bold mb-6 font-mono">$9<span className="text-lg text-zinc-500 font-sans">/mo</span></div>
            <ul className="space-y-4 mb-8 text-white font-medium flex-1">
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-fire-orange" /> Unlimited Roasts</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-fire-orange" /> Nice Mode Unlocked</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-fire-orange" /> Line-by-Line Rewrites</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-fire-orange" /> ATS Keyword Matching</li>
            </ul>
            <button className="magnetic-btn w-full mt-auto rounded-xl font-bold py-3">
              Upgrade to Pro
            </button>
          </motion.div>

          {/* Team Tier */}
          <motion.div variants={fadeIn} className="glass-card flex flex-col h-full relative hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold font-display mb-2">Career Center</h3>
            <p className="text-zinc-400 mb-6">For universities & bootcamp cohorts.</p>
            <div className="text-4xl font-bold mb-6 font-mono">$99<span className="text-lg text-zinc-500 font-sans">/mo</span></div>
            <ul className="space-y-4 mb-8 text-zinc-300 flex-1">
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-zinc-500" /> 500 Roasts/mo</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-zinc-500" /> Custom Branding</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-zinc-500" /> Analytics Dashboard</li>
            </ul>
            <button className="w-full py-3 mt-auto rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium">
              Contact Sales
            </button>
          </motion.div>

        </motion.div>
      </section>
    </div>
  );
}
