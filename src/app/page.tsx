"use client";

import RifatAIChat from "@/components/RifatAIChat";
import { Sparkles, Code2, Bot, Layers, ArrowUpRight, Mail, Github, Linkedin } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090f] text-[#eef0f8] relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-teal-400 p-[1px]">
            <div className="w-full h-full bg-[#0d0e17] rounded-[11px] flex items-center justify-center">
              <span className="font-bold text-lg text-white">R</span>
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Rifat <span className="text-purple-400 text-sm ml-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">Portfolio</span>
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Interactive AI Representative Online</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.1]">
          Crafting modern digital experiences & <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-teal-300 to-indigo-400">AI integrations</span>.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Hi, I&apos;m Rifat — Creative Web Developer & AI Integration Engineer. Ask my digital AI representative <strong className="text-white font-semibold">RIFAT Ai</strong> anything about my work, experience, or how we can collaborate.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-[#08090f] grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-purple-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">RIFAT Ai Representative</h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Powered by Gemini Flash and Rifat&apos;s single source of truth knowledge base for real-time portfolio Q&A.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-teal-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Framer & Web Components</h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              High-aesthetic glassmorphism UI, interactive canvas plasma orb, magnetic cursor interactions & Framer controls.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-indigo-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Zero-Cost Architecture</h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Built serverless-first with Next.js App Router and free-tier Gemini API for low latency and high reliability.
            </p>
          </div>
        </div>
      </section>

      {/* RIFAT Ai Floating Component */}
      <RifatAIChat
        assistantName="RIFAT Ai"
        greeting="Hi, I'm RIFAT Ai"
        subtitle="Ask me about Rifat, his work, projects, skills or how he can help."
        statusLabel="AI Assistant · online"
        suggestions={[
          { text: "What does Rifat do?" },
          { text: "Show me Rifat's projects" },
          { text: "What skills does Rifat have?" },
          { text: "How can I work with Rifat?" },
        ]}
        theme="dark"
        position="right"
      />
    </main>
  );
}
