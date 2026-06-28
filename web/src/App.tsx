import { useState, useEffect } from 'react';
import {
  Terminal,
  BookOpen,
  Check,
  Copy,
  Cpu,
  Shield,
  Radio,
  Flame,
  Server,
  Crosshair,
  Layers,
  MessageSquare,
  Brain,
  Globe,
  Wrench,
  Puzzle,
  ArrowUpRight,
  Zap,
  HardDrive,
  Send,
  FileCode2,
} from 'lucide-react';

type View = 'product' | 'docs';
type OS = 'mac' | 'win';
type DocId = 'overview' | 'onboarding' | 'get-started' | 'channels' | 'skills' | 'commands' | 'sandbox';

export default function App() {
  const [view, setView] = useState<View>('product');
  const [os, setOs] = useState<OS>('mac');
  const [copied, setCopied] = useState(false);
  const [activeDocSection, setActiveDocSection] = useState<DocId>('overview');
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      setNow(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const installCommand = 'curl -sL lethimcook.online/install.sh | bash';
  const copyCommand = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const docNav: { id: DocId; title: string; sub: string }[] = [
    { id: 'overview', title: 'Let Him Cook', sub: '01' },
    { id: 'onboarding', title: 'Trench Alignment Flow', sub: '02' },
    { id: 'get-started', title: 'Get Started', sub: '03' },
    { id: 'channels', title: 'Channels', sub: '04' },
    { id: 'skills', title: 'Skills', sub: '05' },
    { id: 'commands', title: 'CLI Command Suite', sub: '06' },
    { id: 'sandbox', title: 'Sandbox Core', sub: '07' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0a] text-gray-200 font-mono selection:bg-[#FF4500] selection:text-black">
      {/* ════════════════════ DE-AI GENERATED BACKGROUND ════════════════════ */}
      {/* Layer 1 — Paper-grain noise (real photo grain, not synthetic) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.20 0 0 0 0 0.05 0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Layer 2 — Subtle dotted-grid, big squares (drafting paper feel) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,69,0,0.22) 1px, transparent 1.4px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
        }}
      />
      {/* Layer 3 — Wide horizontal scanning rule */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-1/2 z-0 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#FF4500]/35 to-transparent"
        aria-hidden
      />
      {/* Layer 4 — Edge corner registration ticks (offset, asymmetric, brutalist) */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#FF4500]/45 sm:left-6 sm:top-6 sm:h-6 sm:w-6" />
        <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#FF4500]/45 sm:right-6 sm:top-6 sm:h-6 sm:w-6" />
        <div className="absolute left-3 bottom-3 h-5 w-5 border-l-2 border-b-2 border-[#FF4500]/45 sm:left-6 sm:bottom-6 sm:h-6 sm:w-6" />
        <div className="absolute right-3 bottom-3 h-5 w-5 border-r-2 border-b-2 border-[#FF4500]/45 sm:right-6 sm:bottom-6 sm:h-6 sm:w-6" />
        <div className="absolute right-10 top-10 hidden text-[9px] font-black uppercase tracking-[0.3em] text-[#FF4500]/55 md:block">
          REG.0xA1 · TRENCH GRID
        </div>
      </div>
      {/* Layer 5 — Vertical folio rule (right margin, like a printed sheet) */}
      <div className="pointer-events-none fixed right-10 top-0 z-0 hidden h-full w-px bg-[#FF4500]/10 lg:block" aria-hidden />

      {/* ════════════════════ TOP HORIZON HEADER — OpenClaw-style two-tier ════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-[#FF4500]/25 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 md:flex-row md:items-end md:justify-between md:px-10 md:py-4">
          {/* Two-tier brand — primary line + subtitle line */}
          <button
            onClick={() => setView('product')}
            className="group flex flex-col items-start gap-0.5 text-left leading-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF4500]">PRJ.07 //</span>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">v0.1 — STABLE</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black uppercase tracking-[0.04em] text-white md:text-3xl">
                LET HIM COOK
              </span>
              <span className="hidden h-3 w-px bg-[#FF4500]/60 md:inline-block" />
              <span className="hidden text-[11px] font-black uppercase tracking-[0.4em] text-[#FF4500] md:inline-block">
                COOK AGENT
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-gray-600 md:hidden">
              COOK AGENT · TRENCH-LOCAL AI
            </span>
          </button>

          {/* Nav */}
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-widest sm:gap-2 md:gap-3 md:text-xs">
            <button
              onClick={() => setView('product')}
              className={`relative px-3 py-1.5 transition-all duration-300 ${
                view === 'product'
                  ? 'border border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] shadow-[0_0_15px_rgba(255,69,0,0.25)]'
                  : 'border border-transparent text-gray-500 hover:border-gray-700 hover:text-white'
              }`}
            >
              Product
            </button>
            <button
              onClick={() => setView('docs')}
              className={`relative px-3 py-1.5 transition-all duration-300 ${
                view === 'docs'
                  ? 'border border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] shadow-[0_0_15px_rgba(255,69,0,0.25)]'
                  : 'border border-transparent text-gray-500 hover:border-gray-700 hover:text-white'
              }`}
            >
              Docs
            </button>
            <span className="hidden h-5 w-px bg-gray-800 md:inline-block" />
            <a
              href="https://github.com/priyanshu132008/cook-agent"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="group flex items-center gap-2 border border-gray-800 px-3 py-1.5 text-gray-400 transition-all duration-300 hover:border-[#FF4500]/80 hover:bg-[#FF4500]/5 hover:text-[#FF4500]"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.96 3.22 9.16 7.69 10.65.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.94.1-.73.39-1.22.71-1.5-2.5-.28-5.14-1.25-5.14-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.11 1.15a10.7 10.7 0 0 1 5.67 0c2.16-1.45 3.11-1.15 3.11-1.15.62 1.55.23 2.7.12 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.16 5.55.4.34.76 1.02.76 2.06v3.05c0 .3.21.65.78.54 4.46-1.49 7.68-5.69 7.68-10.65C23.25 5.48 18.27.5 12 .5Z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
              <ArrowUpRight size={11} className="opacity-60 transition-all group-hover:opacity-100" />
            </a>
          </nav>
        </div>
        {/* Animated scanline traveling under header */}
        <div className="relative h-px w-full overflow-hidden bg-gray-900">
          <div className="absolute inset-y-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent animate-[scan_3.5s_linear_infinite]" />
        </div>
      </header>

      {/* ════════════════════ MAIN VIEW SWITCHER ════════════════════ */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-10 md:px-10 md:py-16">
        {view === 'product' ? (
          <ProductView os={os} setOs={setOs} copied={copied} copyCommand={copyCommand} />
        ) : (
          <DocsView activeDocSection={activeDocSection} setActiveDocSection={setActiveDocSection} docNav={docNav} now={now} />
        )}
      </main>

      {/* ════════════════════ FOOTNOTE HORIZON ════════════════════ */}
      <footer className="relative z-10 mt-24 w-full border-t border-gray-900 bg-black/80 px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4500]">
            <button onClick={() => setView('product')} className="border border-transparent px-2 py-1 transition-all hover:border-[#FF4500]/60 hover:text-white">Product</button>
            <span className="text-gray-800">/</span>
            <button onClick={() => setView('docs')} className="border border-transparent px-2 py-1 transition-all hover:border-[#FF4500]/60 hover:text-white">Docs</button>
            <span className="text-gray-800">/</span>
            <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="border border-transparent px-2 py-1 transition-all hover:border-[#FF4500]/60 hover:text-white">GitHub</a>
          </div>

          <div className="text-xs leading-relaxed text-gray-400">
            Built by{' '}
            <a href="https://github.com/priyanshu132008/" target="_blank" rel="noreferrer" className="font-black text-[#FF4500] underline-offset-4 transition-all hover:underline">
              Priyanshu Sawant
            </a>{' '}
            with absolute focus. Secure your uplink via{' '}
            <a href="https://www.linkedin.com/in/priyanshu-sawant-63310339b?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer" className="font-black text-[#FF4500] underline-offset-4 transition-all hover:underline">
              LinkedIn
            </a>{' '}
            or follow core development parameters on{' '}
            <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="font-black text-[#FF4500] underline-offset-4 transition-all hover:underline">
              GitHub
            </a>
            .
          </div>

          <div className="max-w-2xl text-[10px] uppercase leading-relaxed tracking-[0.25em] text-gray-700">
            Independent development node. Not affiliated, endorsed, or partnered with OpenAI, Anthropic, or OpenRouter. Just raw execution. All trademarks belong to their respective owners.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  PRODUCT VIEW
 * ════════════════════════════════════════════════════════════════════ */
function ProductView({
  os,
  setOs,
  copied,
  copyCommand,
}: {
  os: OS;
  setOs: (os: OS) => void;
  copied: boolean;
  copyCommand: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-16">
      {/* Spinning CPU emblem + radar waves */}
      <Emblem />

      {/* Hero typographic block */}
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-[#FF4500] sm:text-[10px] sm:tracking-[0.5em] md:text-xs">
          <span className="h-px w-8 bg-[#FF4500]/60" />
          Feral Autonomous Node · v0.1
          <span className="h-px w-8 bg-[#FF4500]/60" />
        </div>
        <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white sm:text-6xl md:text-8xl">
          Let Him
          <span className="relative ml-3 inline-block text-[#FF4500]">
            Cook
            <span className="absolute -bottom-1 left-0 h-1 w-full origin-left scale-x-0 animate-[pulse-line_2.4s_ease-in-out_infinite] bg-[#FF4500]" />
          </span>
          <span className="text-[#FF4500]">.</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
          The autonomous engineering node built for the trenches. Zero telemetry corruption. No bloated venture layers.
          A pure, multi-modal interface that executes locally and natively out of your hard drive.
        </p>
      </div>

      {/* Interactive terminal command box */}
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex w-full max-w-3xl items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
            <Terminal size={14} className="text-[#FF4500]" />
            Quick Start Matrix
          </div>
          <div className="flex border border-gray-800 bg-black/60 p-0.5 text-[10px] font-black uppercase tracking-wider">
            <button
              onClick={() => setOs('mac')}
              className={`px-3 py-1 transition-all duration-300 ${
                os === 'mac'
                  ? 'bg-[#FF4500] text-black shadow-[0_0_10px_rgba(255,69,0,0.4)]'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              macOS · Linux
            </button>
            <button
              onClick={() => setOs('win')}
              className={`px-3 py-1 transition-all duration-300 ${
                os === 'win'
                  ? 'bg-[#FF4500] text-black shadow-[0_0_10px_rgba(255,69,0,0.4)]'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Windows · WSL
            </button>
          </div>
        </div>

        <div className="group relative flex w-full max-w-3xl flex-col gap-4 border border-[#FF4500]/30 bg-black/70 p-4 shadow-[0_0_30px_rgba(255,69,0,0.08)] backdrop-blur-md transition-all duration-500 hover:border-[#FF4500]/80 sm:p-5 md:flex-row md:items-center md:gap-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4500] to-transparent animate-[scan_4s_linear_infinite]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF4500] to-transparent animate-[scan_4s_linear_infinite_2s]" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF4500]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF4500]/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF4500]/15" />
          </div>
          <code className="flex-1 break-all font-mono text-xs text-[#00FF41] sm:text-sm md:text-base">
            <span className="select-none text-gray-600">$ </span>
            <span className="bg-gradient-to-r from-white via-[#FF4500] to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]">
              {os === 'mac' ? 'curl -sL lethimcook.online/install.sh | bash' : 'wsl --install -d Ubuntu && curl -sL lethimcook.online/install.sh | bash'}
            </span>
          </code>
          <button
            onClick={copyCommand}
            className={`flex shrink-0 items-center justify-center gap-2 border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 sm:w-auto ${
              copied
                ? 'border-[#00FF41] bg-[#00FF41] text-black shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                : 'border-[#FF4500] bg-[#FF4500] text-black hover:bg-black hover:text-[#FF4500] hover:shadow-[0_0_20px_rgba(255,69,0,0.5)]'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="max-w-3xl text-[11px] leading-relaxed text-gray-600">
          Requires Node v22+. Installs package dependencies natively, aggregates security sandbox boundaries, configurations, and auto-spins execution loops within a unified directory environment.
        </p>
      </div>

      {/* ════════════════════ WHAT IT DOES — 6-CARD GRID ════════════════════ */}
      <div className="flex w-full flex-col gap-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">What It Does</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CapabilityCard
            index="01"
            icon={<HardDrive size={16} className="text-[#FF4500]" />}
            title="Runs On Your Machine"
            desc="Local Ollama engine out of the box. Zero cloud dependency. Your data never leaves the building — privacy is the architecture, not a feature."
          />
          <CapabilityCard
            index="02"
            icon={<MessageSquare size={16} className="text-[#FF4500]" />}
            title="Chats Where You Are"
            desc="Direct terminal TUI on the spot. Boot Telegram daemons for remote access. Stealth approval pairing for new devices, no signup flow."
          />
          <CapabilityCard
            index="03"
            icon={<Brain size={16} className="text-[#FF4500]" />}
            title="Persistent Memory"
            desc="Profile, idea, status, and research ledgers stored as Markdown in /memory/. Every session reads your history. Context survives reboots."
          />
          <CapabilityCard
            index="04"
            icon={<Globe size={16} className="text-[#FF4500]" />}
            title="Stealth Browser Search"
            desc="Three-layer radar — DuckDuckGo Lite, 18 SearXNG mirrors, optional Tavily/Brave API. Compressed via trench distill before any LLM call."
          />
          <CapabilityCard
            index="05"
            icon={<Wrench size={16} className="text-[#FF4500]" />}
            title="Full System Access"
            desc="Direct read/write to your filesystem inside the sandbox boundary. Manages your project files, builds launch assets, drafts outbound messages."
          />
          <CapabilityCard
            index="06"
            icon={<Puzzle size={16} className="text-[#FF4500]" />}
            title="Skills & Slash Plugins"
            desc="11+ core skills (Truth, Decide, Blueprint, Hunt, Validate, Research, Outreach, Launch, Anchor, Doctor, Standup) composable on the fly."
          />
        </div>
      </div>

      {/* Operational Arsenal — power stats */}
      <div className="flex w-full flex-col gap-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">Operational Arsenal</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <ArsenalCard index="01" label="Tracking Interfaces" title="Stealth Radar Matrix" icon={<Radio size={14} className="text-[#FF4500]" />} desc="Scrapes localized vectors, documentation structures, and dynamic web environments utilizing randomized browsing parameters with zero upstream token overhead." />
          <ArsenalCard index="02" label="Stratified Compression" title="Trench Context Distiller" icon={<Layers size={14} className="text-[#FF4500]" />} desc="Condenses sprawling codebase tracking parameters and text blocks into localized code blocks with minimal semantic data distortion." />
          <ArsenalCard index="03" label="Active Attack Layers" title="Asynchronous Standup Daemon" icon={<Flame size={14} className="text-[#FF4500]" />} desc="Spins automated validation trackers onto your Telegram nodes to log and monitor task arrays instantly on external devices." />
          <ArsenalCard index="04" label="Persistence Matrices" title="Local Ledger Envelope" icon={<Server size={14} className="text-[#FF4500]" />} desc="Maintains structured history metrics, profile parameters, and tracking files in secure localized files inside your root system path." />
        </div>
      </div>
    </div>
  );
}

/* Capability card — for the "What It Does" grid */
function CapabilityCard({ index, icon, title, desc }: { index: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative flex flex-col gap-3 overflow-hidden border border-gray-800 bg-black/50 p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#FF4500]/80 hover:shadow-[0_0_25px_rgba(255,69,0,0.2)]">
      <div className="absolute left-0 top-0 h-0 w-px bg-[#FF4500] transition-all duration-700 group-hover:h-full" />
      <div className="absolute right-0 top-0 h-px w-0 bg-[#FF4500] transition-all duration-700 group-hover:w-full" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FF4500]/8 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-[#FF4500]">
        <span>{index}</span>
        {icon}
      </div>
      <h3 className="text-sm font-black uppercase tracking-wide text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-500 transition-all duration-300 group-hover:text-gray-300">{desc}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  EMBLEM — Spinning CPU + multi-layered radar pulse
 * ════════════════════════════════════════════════════════════════════ */
function Emblem() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40 md:h-48 md:w-48">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute h-full w-full rounded-full border border-[#FF4500]/30 animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute h-3/4 w-3/4 rounded-full border border-[#FF4500]/40 animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
        <div className="absolute h-1/2 w-1/2 rounded-full border border-[#FF4500]/50 animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
      </div>
      <div
        className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-[#FF4500]/40 animate-[spin_22s_linear_infinite]"
        style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
      />
      <div
        className="pointer-events-none absolute h-full w-full animate-[spin_4s_linear_infinite]"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(255,69,0,0.25) 25deg, transparent 60deg)',
          borderRadius: '9999px',
          maskImage: 'radial-gradient(circle, black 55%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 75%)',
        }}
      />
      <div className="relative z-10 flex h-20 w-20 items-center justify-center border-2 border-[#FF4500] bg-black shadow-[0_0_35px_rgba(255,69,0,0.4)] transition-all duration-500 hover:shadow-[0_0_55px_rgba(255,69,0,0.7)] sm:h-24 sm:w-24 md:h-28 md:w-28">
        <Cpu size={36} className="animate-[spin_9s_linear_infinite] text-[#FF4500] sm:hidden" />
        <Cpu size={42} className="hidden animate-[spin_9s_linear_infinite] text-[#FF4500] sm:block md:hidden" />
        <Cpu size={42} className="hidden animate-[spin_9s_linear_infinite] text-[#FF4500] md:block" />
        <Crosshair size={12} className="absolute -top-2 -right-2 text-[#FF4500] animate-pulse" />
      </div>
      <CornerBracket className="absolute -top-1 -left-1" rotate={0} />
      <CornerBracket className="absolute -top-1 -right-1" rotate={90} />
      <CornerBracket className="absolute -bottom-1 -right-1" rotate={180} />
      <CornerBracket className="absolute -bottom-1 -left-1" rotate={270} />
    </div>
  );
}

function CornerBracket({ className, rotate }: { className?: string; rotate: number }) {
  return (
    <div className={`h-4 w-4 ${className ?? ''}`} style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="absolute top-0 left-0 h-px w-full bg-[#FF4500]" />
      <div className="absolute top-0 left-0 h-full w-px bg-[#FF4500]" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  ARSENAL CARD
 * ════════════════════════════════════════════════════════════════════ */
function ArsenalCard({ index, label, title, icon, desc }: { index: string; label: string; title: string; icon: React.ReactNode; desc: string }) {
  return (
    <div className="group relative flex flex-col gap-3 overflow-hidden border border-gray-800 bg-black/40 p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#FF4500]/80 hover:shadow-[0_0_30px_rgba(255,69,0,0.25)]">
      <div className="absolute left-0 top-0 h-0 w-px bg-[#FF4500] transition-all duration-700 group-hover:h-full" />
      <div className="absolute right-0 top-0 h-px w-0 bg-[#FF4500] transition-all duration-700 group-hover:w-full" />
      <div className="absolute bottom-0 right-0 h-0 w-px bg-[#FF4500] transition-all duration-700 group-hover:h-full" />
      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF4500] transition-all duration-700 group-hover:w-full" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FF4500]/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-[#FF4500]">
        <span>{index} // {label}</span>
        <span className="text-gray-700 transition-all group-hover:text-[#FF4500]">▶</span>
      </div>
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
        {icon}
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-gray-500 transition-all duration-300 group-hover:text-gray-300">{desc}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  DOCS VIEW
 * ════════════════════════════════════════════════════════════════════ */
function DocsView({
  activeDocSection,
  setActiveDocSection,
  docNav,
  now,
}: {
  activeDocSection: DocId;
  setActiveDocSection: (id: DocId) => void;
  docNav: { id: DocId; title: string; sub: string }[];
  now: string;
}) {
  const rightScrollFor: Record<DocId, { label: string; active?: boolean }[]> = {
    overview: [
      { label: '01 · Context Analysis', active: true },
      { label: '02 · Execution Strategy' },
      { label: '03 · Local Constraints' },
      { label: '04 · Failure Modes' },
    ],
    onboarding: [
      { label: '01 · Trench Phase', active: true },
      { label: '02 · Idea Capture' },
      { label: '03 · Engine Mode' },
      { label: '04 · Radar Layer' },
      { label: '05 · Accountability' },
    ],
    'get-started': [
      { label: '01 · One-Liner Install', active: true },
      { label: '02 · First Onboard' },
      { label: '03 · Memory Files' },
      { label: '04 · Doctor Check' },
    ],
    channels: [
      { label: '01 · Terminal (TUI)', active: true },
      { label: '02 · Telegram Daemon' },
      { label: '03 · Pairing Code' },
      { label: '04 · Slash Routing' },
    ],
    skills: [
      { label: '01 · Core Skill List', active: true },
      { label: '02 · Skill Anatomy' },
      { label: '03 · Markdown Definition' },
      { label: '04 · Invocation' },
    ],
    commands: [
      { label: '01 · Setup Commands', active: true },
      { label: '02 · Skill Commands' },
      { label: '03 · Daemon Commands' },
    ],
    sandbox: [
      { label: '01 · Process Boundaries', active: true },
      { label: '02 · Memory Lock' },
      { label: '03 · Search Containment' },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
<div className="flex flex-wrap items-center gap-3 border-b border-gray-800 pb-4">
        <span className="border border-[#FF4500]/40 bg-[#FF4500]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF4500]">
          Stable Core · v0.1
        </span>
        <span className="hidden text-gray-700 md:inline">|</span>
        <div className="hidden flex-wrap gap-1 text-[11px] font-black uppercase tracking-widest md:flex">
          {['Get Started', 'Install', 'Channels', 'Skills', 'Architecture'].map((s) => (
            <button
              key={s}
              className="px-2 py-1 text-gray-500 transition-all duration-300 hover:text-[#FF4500]"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00FF41] shadow-[0_0_6px_#00FF41]" />
          Uplink Stable · {now}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:grid-cols-12">
        {/* LEFT NAV — mobile: horizontal chip strip at top; md+: vertical sidebar */}
        <aside className="flex flex-col gap-1 border-b border-gray-800 pb-4 md:col-span-4 md:border-b-0 md:border-r md:border-gray-800 md:pb-0 md:pr-5 lg:col-span-3">
          {/* Vertical label (md+) */}
          <div className="mb-3 hidden px-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 md:block">Documentation Matrix</div>
          {/* Mobile horizontal chip strip — scrolls horizontally, no row gap */}
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 md:hidden">Jump To</div>
          <div className="-mx-1 flex flex-row gap-1 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {docNav.map((item) => {
              const active = activeDocSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveDocSection(item.id)}
                  className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    active
                      ? 'border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500]'
                      : 'border-gray-800 text-gray-500 active:text-white'
                  }`}
                >
                  <span className="mr-1.5 text-[9px] opacity-70">{item.sub}</span>
                  {item.title}
                </button>
              );
            })}
          </div>
          {/* Vertical nav (md+) */}
          <div className="hidden md:flex md:flex-col md:gap-1">
            {docNav.map((item) => {
              const active = activeDocSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveDocSection(item.id)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    active
                      ? 'border-l-2 border-[#FF4500] bg-[#FF4500]/5 text-[#FF4500]'
                      : 'border-l-2 border-transparent text-gray-500 hover:border-[#FF4500]/60 hover:bg-black/50 hover:text-white'
                  }`}
                >
                  <span className={`text-[10px] ${active ? 'text-[#FF4500]' : 'text-gray-700 group-hover:text-[#FF4500]'}`}>{item.sub}</span>
                  <span className="flex-1">{item.title}</span>
                  {active && <span className="text-[#FF4500]">▸</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-6 hidden border-t border-gray-900 pt-4 lg:flex lg:flex-col lg:gap-2">
            <div className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Runtime</div>
            <div className="flex items-center justify-between px-2 text-[10px] text-gray-500">
              <span>Engine</span>
              <span className="text-[#00FF41]">Ollama</span>
            </div>
            <div className="flex items-center justify-between px-2 text-[10px] text-gray-500">
              <span>Memory</span>
              <span className="text-white">14 KB</span>
            </div>
            <div className="flex items-center justify-between px-2 text-[10px] text-gray-500">
              <span>Sandbox</span>
              <span className="text-[#00FF41]">Locked</span>
            </div>
          </div>
        </aside>

        {/* CENTER READING FRAME */}
        <section className="flex flex-col gap-6 border-b border-gray-800 pb-8 text-sm leading-relaxed md:col-span-8 md:border-b-0 md:border-r md:border-gray-800 md:pb-0 md:pr-6 lg:col-span-6">
          <DocContent id={activeDocSection} />
        </section>

        {/* RIGHT QUICK-SCROLL */}
        <aside className="hidden lg:sticky lg:top-32 lg:col-span-3 lg:flex lg:flex-col lg:gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">On This Section</div>
          <div className="flex flex-col gap-2 border-l border-gray-800 pl-3 text-xs">
            {rightScrollFor[activeDocSection].map((item) => (
              <a
                key={item.label}
                className={`cursor-pointer transition-all hover:translate-x-1 ${
                  item.active ? 'text-[#FF4500]' : 'text-gray-500 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2 border border-gray-900 bg-black/50 p-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF4500]">
              <span className="h-1.5 w-1.5 animate-pulse bg-[#FF4500]" />
              Live Telemetry
            </div>
            <div className="flex items-end justify-between gap-1">
              {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                <div
                  key={i}
                  className="w-2 bg-[#FF4500]/70"
                  style={{ height: `${h}%`, animation: `pulse-line 1.${i + 2}s ease-in-out infinite` }}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  DOC CONTENT — per-section rendering
 * ════════════════════════════════════════════════════════════════════ */
function DocContent({ id }: { id: DocId }) {
  switch (id) {
    /* ───────────── OVERVIEW ───────────── */
    case 'overview':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="01" label="Overview" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Let Him Cook <span className="text-[#FF4500]">Matrix</span>
          </h2>
          <p className="border-l-2 border-gray-800 pl-4 text-xs italic text-gray-500">
            "A secure terminal workspace framework for independent developers."
          </p>
          <p className="text-gray-300">
            Cook Agent is a local-first autonomous engineering node. It boots a secure terminal gateway on your own machine,
            pipes raw search radar through a strict context distiller, and routes every request through your own LLM —
            Ollama by default, OpenRouter or Anthropic/OpenAI if you plug them in. There is no Docker bloat, no vendor lock-in,
            and no telemetry leaking to outside servers. Your idea, profile, and progress live as Markdown in <code className="text-[#FF4500]">~/memory/</code>.
          </p>

          <div className="flex flex-col gap-3 border border-gray-800 bg-black/60 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF4500]">
              <BookOpen size={12} /> Execution Strategy
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The agent boots, profiles your machine, calibrates engine mode, then composes your project memory from a short onboard interview.
              Every session afterwards reads that memory to give you level-aware advice — direct for beginners, ruthless for feral builders.
              Eleven first-class skills slot in as slash commands inside the TUI or as standalone CLI invocations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatBlock label="Engine" value="Ollama → OR → Claude" sub="Local by default" />
            <StatBlock label="Search" value="DDG · 18 SearXNG" sub="No Promise.all()" />
            <StatBlock label="Memory" value="Markdown on Disk" sub="Forever · Gitignored" />
          </div>

          <Callout tone="orange">
            <strong className="text-white">The Cook Promise:</strong>{' '}
            no API keys leak upstream, no Docker daemon is required, no telemetry is collected. You ship the code; Cook keeps you accountable while you do.
          </Callout>
        </div>
      );

    /* ───────────── ONBOARDING ───────────── */
    case 'onboarding':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="02" label="Trench Alignment" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Trench <span className="text-[#FF4500]">Alignment</span> Flow
          </h2>
          <p className="text-gray-300">
            The first time you boot <code className="text-[#FF4500]">cook onboard</code>, the system walks you through a six-axis calibration.
            Each answer is written straight to <code className="text-[#FF4500]">memory/profile.md</code>, <code className="text-[#FF4500]">memory/idea.md</code> and <code className="text-[#FF4500]">memory/status.md</code>.
            From then on, every skill reads that file before responding — your tone, engine mode, and grind window travel with you across reboots.
          </p>

          {/* Terminal mock for the prompt */}
          <div className="flex flex-col gap-1.5 border border-gray-800 bg-black/70 p-4 font-mono text-xs text-[#00FF41]">
            <div>&gt;_ Where are we at in the trenches right now?</div>
            <div className="text-gray-500">[A] The Blueprint · I have ideas but zero code.</div>
            <div className="text-gray-500">[B] In the Mud · Built the MVP. Getting ghosted.</div>
            <div className="text-gray-500">[C] Feral Builder · Shipping, just need to scale.</div>
          </div>

          {/* Step blocks */}
          <StepBlock
            n="01"
            title="Trench Phase"
            body='Selects the lens for every subsequent skill. "Blueprint" gives gentle, instructional answers. "In the Mud" is direct and unblocking. "Feral Builder" gets no mercy — execution speed and blind spots are attacked aggressively.'
          />
          <StepBlock
            n="02"
            title="Idea + Status Capture"
            body='Two free-text prompts. "What are we cooking?" feeds /truth, /validate, /blueprint. "What is your status or biggest blocker?" feeds /anchor and the daily standup.'
          />
          <StepBlock
            n="03"
            title="Blocker Tag"
            body="A single-select: brain fog, ghost town, or spaghetti code. Tags the tone of the next /truth report and the first outreach draft."
          />
          <StepBlock
            n="04"
            title="Engine Mode"
            body='Three branches — Local (Ollama, list pulled from your machine), Cloud Free (OpenRouter, key saved to .env), Cloud Pro (OpenAI / Anthropic / Gemini). Default fallback: llama3.2.'
          />
          <StepBlock
            n="05"
            title="Radar Layer"
            body='Pick how Cook searches the web. Stealth is free and uses DuckDuckGo + SearXNG. Tavily and Brave unlock paid but faster APIs. Key, if needed, is appended to .env.'
          />
          <StepBlock
            n="06"
            title="Accountability Channel"
            body='Where do you want the Cook to nag you? Terminal TUI is zero-config. Telegram pastes a bot token now (or skips), then runs via `cook serve:telegram` later.'
          />
          <StepBlock
            n="07"
            title="Grind Time"
            body='Stored in profile.md. /standup and /anchor use it to anchor notifications and 2 AM grounding prompts.'
          />

          <Callout tone="green">
            Final step offers <code className="text-[#00FF41]">Boot Feral Terminal now? (Y/n)</code>. Press enter and the TUI comes alive with the system envelope already loaded.
          </Callout>
        </div>
      );

    /* ───────────── GET STARTED ───────────── */
    case 'get-started':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="03" label="Get Started" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Boot The <span className="text-[#FF4500]">Cook</span>
          </h2>
          <p className="text-gray-300">
            Zero Docker. Zero global state. The installer clones the repo into <code className="text-[#FF4500]">~/.cook</code>, runs <code className="text-[#FF4500]">pnpm install</code>,
            and forges a <code className="text-[#FF4500]">cook</code> binary into <code className="text-[#FF4500]">~/.local/bin</code>.
            No admin rights, no daemons, no background services — every command is a fresh process you control.
          </p>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">01 · One-Liner Install</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'curl -sL lethimcook.online/install.sh | bash', color: 'green' },
              { c: '◆ ', t: 'Cloning The Cook repository...', color: 'gray' },
              { c: '◆ ', t: 'Installing dependencies...', color: 'gray' },
              { c: '◆ ', t: 'Forging global \'cook\' binary...', color: 'gray' },
              { c: '✓ ', t: 'Installation complete.', color: 'orange' },
              { c: '  ', t: 'export PATH="$HOME/.local/bin:$PATH"', color: 'gray' },
            ]}
          />
          <p className="text-xs text-gray-500">
            Append that export line to <code className="text-[#FF4500]">~/.zshrc</code> or <code className="text-[#FF4500]">~/.bashrc</code> and restart the shell.
            Windows users run the same line inside WSL Ubuntu.
          </p>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">02 · First Onboard</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'cook onboard', color: 'green' },
              { c: '◆ ', t: '[ SYSTEM CALIBRATION ]', color: 'orange' },
              { c: '? ', t: 'Where are we at in the trenches?  › The Blueprint', color: 'gray' },
              { c: '◆ ', t: 'Scanning motherboard... 16.0GB RAM detected.', color: 'gray' },
              { c: '? ', t: 'Select your engine:  › Local (Ollama)', color: 'gray' },
              { c: '? ', t: 'Select your local brain:  › phi4-mini', color: 'gray' },
              { c: '✓ ', t: 'Neural profile secured. .env updated.', color: 'orange' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">03 · Verify The Install</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'cook doctor', color: 'green' },
              { c: '✓ ', t: 'Local Engine (Ollama)    localhost:11434 responding', color: 'green' },
              { c: '✓ ', t: 'Local Model              phi4-mini ready', color: 'green' },
              { c: '✓ ', t: 'RAM available            7.4GB free — sufficient for agent', color: 'green' },
              { c: '✓ ', t: 'Memory readable          /memory/ — read/write OK', color: 'green' },
              { c: '✓ ', t: 'Search Layer 1           duckduckgo.com responding', color: 'green' },
              { c: '✓ ', t: 'Auth token                ~/memory/profile.md valid', color: 'green' },
              { c: '✓ ', t: '7/7 checks passed. Cook is ready.', color: 'green' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">04 · Open The Hatch</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'cook chat', color: 'green' },
              { c: '◆ ', t: '🔥 FERAL TERMINAL UPLINK ESTABLISHED. Type "/exit" to close.', color: 'orange' },
              { c: 'You > ', t: 'plan my next 4 hours', color: 'gray' },
              { c: 'Cook > ', t: 'Based on your profile and PROGRESS.md, here are the three coding targets...', color: 'green' },
            ]}
          />

          <Callout tone="orange">
            That's it. No Docker, no signup, no cloud account. Cook runs from <code className="text-[#FF4500]">~/.cook</code> and remembers your state forever.
          </Callout>
        </div>
      );

    /* ───────────── CHANNELS ───────────── */
    case 'channels':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="04" label="Channels" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Channel <span className="text-[#FF4500]">Interfaces</span>
          </h2>
          <p className="text-gray-300">
            Cook has two surfaces — a Terminal User Interface (TUI) that lives on your machine, and a Telegram daemon that
            lets you talk to the same agent from your phone. Both routes hit the exact same router: profile-aware system envelope,
            identical skills, identical memory. Choose where you want the Cook to hold you accountable.
          </p>

          {/* CHANNEL 1: TUI */}
          <div className="flex flex-col gap-3 border border-gray-800 bg-black/60 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF4500]">
              <Terminal size={14} /> Channel 01 · Terminal (TUI)
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The <code className="text-[#FF4500]">cook chat</code> command spawns a readline loop with a 20-turn rolling history.
              The system envelope is seeded once per session and re-used across recursive slash-command skill runs —
              that means after <code className="text-[#FF4500]">/blueprint</code> finishes, the TUI reopens with the blueprint context preserved.
              Spinner frames show "Cooking..." / "Farming aura..." / "Forging in the trenches..." while the LLM works.
            </p>
            <CodeBlock
              lines={[
                { c: 'You > ', t: '/blueprint', color: 'gray' },
                { c: '◆ ', t: '[ SKILL: THE BUILD GUIDE ]', color: 'orange' },
                { c: '◆ ', t: '🧱 THE STACK: Hono · SQLite · Bun · Cloudflare Workers', color: 'green' },
                { c: '◆ ', t: '🗺️ EXECUTION ORDER (Next 48 Hours)...', color: 'green' },
                { c: '--- Returning to Chat ---', t: '', color: 'gray' },
              ]}
            />
            <div className="flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Tag>readline</Tag>
              <Tag>20-turn memory</Tag>
              <Tag>slash router</Tag>
              <Tag>recursive skills</Tag>
              <Tag>zero-config</Tag>
            </div>
          </div>

          {/* CHANNEL 2: TELEGRAM */}
          <div className="flex flex-col gap-3 border border-gray-800 bg-black/60 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF4500]">
              <Send size={14} /> Channel 02 · Telegram Daemon
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The Telegram daemon is a long-polling loop in <code className="text-[#FF4500]">packages/core/src/channels/telegram.ts</code>.
              It reads <code className="text-[#FF4500]">TELEGRAM_BOT_TOKEN</code> from <code className="text-[#FF4500]">.env</code>, drops any active webhook,
              then long-polls <code className="text-[#FF4500]">getUpdates</code>. Each incoming message is matched against an allow-list in <code className="text-[#FF4500]">memory/tg_auth.json</code>;
              unpaired chats are silently dropped. Engine routing reuses the profile — local Ollama or cloud, same as the TUI.
            </p>
            <CodeBlock
              lines={[
                { c: '$ ', t: 'cook serve:telegram', color: 'green' },
                { c: '◆ ', t: '🤖 Booting Telegram Feral Channel [Production Mode]...', color: 'orange' },
                { c: '◆ ', t: '📡 Listening for incoming transmissions...', color: 'gray' },
                { c: '◆ ', t: '[TG] In: hey cook, grind me up', color: 'green' },
                { c: '◆ ', t: '  -> Executing Local Engine (phi4-mini)...', color: 'gray' },
                { c: '◆ ', t: '[TG] Out: Locked in. Three tasks on deck for today...', color: 'orange' },
              ]}
            />
            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Pairing a New Device</h4>
            <p className="text-xs leading-relaxed text-gray-400">
              When an unauthorized chat ID pings the bot, the daemon drops the message but logs a pending entry. Run{' '}
              <code className="text-[#FF4500]">cook approve &lt;code&gt;</code> from the host terminal to mint a pairing code, then reply with it from the phone.
              Approved IDs are persisted to <code className="text-[#FF4500]">memory/tg_auth.json</code>. Revoke by deleting that file.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Tag>long-polling</Tag>
              <Tag>allow-list</Tag>
              <Tag>device pairing</Tag>
              <Tag>env-stored token</Tag>
              <Tag>hybrid routing</Tag>
            </div>
          </div>

          <Callout tone="orange">
            Both channels share one system envelope. Switch surfaces mid-project — context survives. Slash commands work in TUI; in Telegram, type the command as a regular message and the daemon routes it through the same skill.
          </Callout>
        </div>
      );

    /* ───────────── SKILLS ───────────── */
    case 'skills':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="05" label="Skills" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Skill <span className="text-[#FF4500]">Architecture</span>
          </h2>
          <p className="text-gray-300">
            Skills are the agent's atomic units of execution. Each one is a single TypeScript module under{' '}
            <code className="text-[#FF4500]">packages/core/src/skills/</code> that reads the current profile, builds a focused prompt,
            runs the LLM, and prints or persists the output. They compose like legos — <code className="text-[#FF4500]">/hunt</code> writes to{' '}
            <code className="text-[#FF4500]">memory/customers.md</code>, which <code className="text-[#FF4500]">/outreach</code> and{' '}
            <code className="text-[#FF4500]">/launch</code> read. No orchestrator above them — just a flat skill list the LLM can invoke on demand.
          </p>

          <div className="flex flex-col gap-2 border border-gray-800 bg-black/70 p-4 text-xs leading-relaxed text-gray-400">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF4500]">
              <FileCode2 size={12} /> Skill Anatomy
            </div>
            <p>
              Every skill follows the same skeleton: <span className="text-[#FF4500]">intro</span> clack banner →{' '}
              <span className="text-[#FF4500]">spinner</span> boot → read profile/idea/progress → route through{' '}
              <code className="text-[#FF4500]">generateLocal</code> or <code className="text-[#FF4500]">generateCloud</code> based on{' '}
              <code className="text-[#FF4500]">Engine Mode</code> in <code className="text-[#FF4500]">profile.md</code> →{' '}
              <span className="text-[#FF4500]">outro</span>. No silent crashes, no missing fallbacks.
            </p>
          </div>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Core Skill List</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SkillCard
              cmd="/truth"
              name="Hard Truth"
              file="hard-truth.ts"
              desc="Brutal ego-check on your current idea and progress. Tone scales with builder level — instructional for Blueprint, ruthless for Feral."
            />
            <SkillCard
              cmd="/decide"
              name="Decision Partner"
              file="decision-partner.ts"
              desc="Socratic architectural breakdown. You give it the dilemma; it strips emotion, gives two trade-offs, and ships a recommendation."
            />
            <SkillCard
              cmd="/blueprint"
              name="Build Guide"
              file="build-guide.ts"
              desc="Generates the exact stack, the 4-step 48-hour execution order, and the architectural traps to avoid. Level-aware."
            />
            <SkillCard
              cmd="/validate"
              name="Idea Validator"
              file="idea-validator.ts"
              desc="Stealth-searches competitors, returns a brutal validation matrix — threats, gap, execution risks, and a one-line verdict."
            />
            <SkillCard
              cmd="/research"
              name="Research Agent"
              file="research-agent.ts"
              desc="Deep technical briefing on any topic. Saves the report to memory/research_<topic>.md as Markdown."
            />
            <SkillCard
              cmd="/hunt"
              name="Customer Finder"
              file="customer-finder.ts"
              desc="Sequential Reddit + IndieHackers hunt. Three archetypes extracted, written to memory/customers.md. Human jitter between requests."
            />
            <SkillCard
              cmd="/outreach"
              name="Outreach Writer"
              file="outreach-writer.ts"
              desc="Reads customers.md, drafts one cold DM per archetype. Founder-to-founder tone, under four sentences each."
            />
            <SkillCard
              cmd="/launch"
              name="Launch Sequence"
              file="launch-sequence.ts"
              desc="Generates copy-paste launch assets for Product Hunt, Show HN, Twitter/X thread, and Reddit. Saves to memory/launch_sequence.md."
            />
            <SkillCard
              cmd="/anchor"
              name="The Anchor"
              file="anchor.ts"
              desc="2 AM grounding protocol. Reads your recent progress and writes four sentences of cold, feral motivation. Use it when you want to quit."
            />
            <SkillCard
              cmd="/doctor"
              name="System Doctor"
              file="doctor.ts"
              desc="Seven-point diagnostic — engine, model, RAM, Telegram token, memory r/w, search layer 1, auth token. Outputs pass/fail."
            />
            <SkillCard
              cmd="/standup"
              name="Daily Standup"
              file="standup.ts"
              desc="Reads PROGRESS.md, generates exactly three aggressive, level-aware coding tasks for today's session."
            />
          </div>

          <Callout tone="green">
            <strong className="text-white">Skill discipline:</strong> every skill assumes the user is in motion, not contemplation. No fluff, no corporate softening, no "let me know if you need anything else."
          </Callout>
        </div>
      );

    /* ───────────── COMMANDS ───────────── */
    case 'commands':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="06" label="CLI Command Suite" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            CLI Routine <span className="text-[#FF4500]">Command</span> Suite
          </h2>
          <p className="text-gray-300">
            Thirteen first-class commands. Three for setup, nine for execution, one for the Telegram daemon. Each runs as a standalone process — no implicit state beyond <code className="text-[#FF4500]">memory/</code> files on disk.
          </p>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Setup Commands</h3>
          <CommandTable
            rows={[
              { cmd: 'cook onboard', desc: 'Run initial six-axis configuration and write profile.md, idea.md, status.md.' },
              { cmd: 'cook doctor', desc: 'Seven-point diagnostic — engine, model, RAM, Telegram, memory, search, auth.' },
              { cmd: 'cook chat', desc: 'Open the local Terminal hatch (TUI) with slash routing and 20-turn memory.' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Skill Commands</h3>
          <CommandTable
            rows={[
              { cmd: 'cook hunt', desc: 'Find leads on Reddit / IndieHackers. Writes customers.md.' },
              { cmd: 'cook truth', desc: 'Brutal ego-check and reality breakdown on current progress.' },
              { cmd: 'cook decide', desc: 'Socratic architectural partner for trade-off paralysis.' },
              { cmd: 'cook blueprint', desc: 'Generate stack, 48h execution order, architectural traps.' },
              { cmd: 'cook validate', desc: 'Stealth competitor scan and market gap validation.' },
              { cmd: 'cook research', desc: 'Deep technical briefing on any topic. Persisted to memory/.' },
              { cmd: 'cook outreach', desc: 'Personalized cold DM drafts per customer archetype.' },
              { cmd: 'cook launch', desc: 'Product Hunt / Show HN / Twitter / Reddit launch dossier.' },
              { cmd: 'cook anchor', desc: '2 AM motivation protocol grounded in your shipped code.' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Daemon Commands</h3>
          <CommandTable
            rows={[
              { cmd: 'cook serve:telegram', desc: 'Boot the Telegram long-polling daemon. Requires TELEGRAM_BOT_TOKEN in .env.' },
              { cmd: 'cook approve <code>', desc: 'Pair an unauthorized Telegram chat ID using a pending pairing code.' },
            ]}
          />

          <Callout tone="orange">
            Inside the TUI, every skill above is also invokable as a <code className="text-[#FF4500]">/slash</code> command. Press <code className="text-[#FF4500]">/exit</code> to leave the chat.
          </Callout>
        </div>
      );

    /* ───────────── SANDBOX ───────────── */
    case 'sandbox':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="07" label="Sandbox Core" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Sandbox <span className="text-[#FF4500]">Environment</span> Core
          </h2>
          <p className="text-gray-300">
            All data channels operate inside strict process paths and explicit workspace parameters to stop directory-traversal exploits or unauthorized script manipulation.
            The agent never gets raw shell execution on your machine — every action flows through the typed router in{' '}
            <code className="text-[#FF4500]">packages/core/src/sandbox.ts</code> and reads only what <code className="text-[#FF4500]">profile.md</code> authorizes.
          </p>
          <div className="flex items-start gap-4 border border-[#00FF41]/30 bg-[#00FF41]/5 p-5">
            <Shield size={22} className="shrink-0 text-[#00FF41]" />
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="font-black uppercase tracking-widest text-white">Vulnerability Shield Activated</div>
              <p className="leading-relaxed text-gray-400">
                Search input is sanitized, scraped HTML is funneled through the trench distiller before any LLM call, and memory files are write-locked to the agent's working directory.
                API keys live only in <code className="text-[#FF4500]">.env</code>, never in prompts.
              </p>
            </div>
          </div>
          <Callout tone="orange">
            <strong className="text-white">No telemetry, no auto-update, no outbound calls</strong> beyond the engine endpoint you configured and the search layer you selected. Audit with <code className="text-[#FF4500]">cook doctor</code>.
          </Callout>
        </div>
      );
  }
}

/* ───────────── Helpers ───────────── */
function DocHeader({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4500]">
      <span className="h-px w-6 bg-[#FF4500]/60" /> {index} // {label}
    </div>
  );
}

function Callout({ tone, children }: { tone: 'orange' | 'green'; children: React.ReactNode }) {
  const palette =
    tone === 'orange'
      ? 'border-[#FF4500]/40 bg-[#FF4500]/5 text-gray-300'
      : 'border-[#00FF41]/35 bg-[#00FF41]/5 text-gray-300';
  return (
    <div className={`flex items-start gap-3 border p-4 text-xs leading-relaxed ${palette}`}>
      <Zap size={14} className={`mt-0.5 shrink-0 ${tone === 'orange' ? 'text-[#FF4500]' : 'text-[#00FF41]'}`} />
      <p>{children}</p>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1 border border-gray-800 bg-black/50 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-[#FF4500]">{sub}</span>
    </div>
  );
}

function StepBlock({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-4 border-l-2 border-[#FF4500]/40 bg-black/40 py-3 pl-4 pr-3">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4500]">{n}</span>
      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-black uppercase tracking-wide text-white">{title}</h4>
        <p className="text-xs leading-relaxed text-gray-400">{body}</p>
      </div>
    </div>
  );
}

function CodeBlock({ lines }: { lines: { c: string; t: string; color: 'orange' | 'green' | 'gray' }[] }) {
  const colorClass = (c: 'orange' | 'green' | 'gray') =>
    c === 'orange' ? 'text-[#FF4500]' : c === 'green' ? 'text-[#00FF41]' : 'text-gray-400';
  return (
    <div className="flex flex-col gap-0.5 border border-gray-800 bg-black/80 p-4 font-mono text-xs">
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-1">
          <span className={`shrink-0 ${colorClass(line.color as 'orange' | 'green' | 'gray')}`}>{line.c}</span>
          <span className={`break-all ${colorClass(line.color as 'orange' | 'green' | 'gray')}`}>{line.t}</span>
        </div>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-gray-800 bg-black/60 px-2 py-0.5">{children}</span>
  );
}

function SkillCard({ cmd, name, file, desc }: { cmd: string; name: string; file: string; desc: string }) {
  return (
    <div className="group relative flex flex-col gap-2 overflow-hidden border border-gray-800 bg-black/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF4500]/70 hover:shadow-[0_0_18px_rgba(255,69,0,0.18)]">
      <div className="flex items-center justify-between">
        <code className="text-sm font-black text-[#FF4500]">{cmd}</code>
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{file}</span>
      </div>
      <h4 className="text-xs font-black uppercase tracking-wide text-white">{name}</h4>
      <p className="text-xs leading-relaxed text-gray-500 transition-all group-hover:text-gray-300">{desc}</p>
    </div>
  );
}

function CommandTable({ rows }: { rows: { cmd: string; desc: string }[] }) {
  return (
    <div className="flex flex-col divide-y divide-gray-800 border border-gray-800 bg-black/50">
      {rows.map((row) => (
        <div key={row.cmd} className="flex flex-col gap-1 px-4 py-3 transition-all hover:bg-black/70 md:flex-row md:items-center md:gap-4">
          <code className="shrink-0 font-mono text-xs font-black text-[#FF4500] md:w-56">{row.cmd}</code>
          <span className="text-xs leading-relaxed text-gray-400">{row.desc}</span>
        </div>
      ))}
    </div>
  );
}
