import { useState, useEffect, useRef } from 'react';
import { Terminal, BookOpen, Layers, Check, Copy, Cpu, Shield, Radio, Flame, Server } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'product' | 'docs'>('product');
  const [os, setOs] = useState<'mac' | 'win'>('mac');
  const [copied, setCopied] = useState(false);
  const [activeDocSection, setActiveDocSection] = useState('overview');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Starry Sky Dynamic Background Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{ x: number; y: number; radius: number; vx: number; vy: number }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 69, 0, 0.4)'; // Subtle amber glow for stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1;
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText('curl -sL lethimcook.online/install.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 relative overflow-x-hidden font-mono selection:bg-feralOrange selection:text-black">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

      {/* Main Top Header Navbar Horizon */}
      <header className="sticky top-0 w-full border-b border-gray-800 bg-black/80 backdrop-blur-md z-50 px-4 md:px-8 py-4 flex justify-between items-center">
        <button onClick={() => setView('product')} className="text-lg font-extrabold tracking-tighter text-white flex items-center gap-2">
          &gt;_ COOK<span className="text-feralOrange animate-pulse">_</span>AGENT
        </button>
        <nav className="flex items-center gap-1 md:gap-4 text-xs md:text-sm font-bold">
          <button onClick={() => setView('product')} className={`px-3 py-1 border transition-all duration-200 ${view === 'product' ? 'border-feralOrange text-feralOrange bg-feralOrange/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Product</button>
          <button onClick={() => setView('docs')} className={`px-3 py-1 border transition-all duration-200 ${view === 'docs' ? 'border-feralOrange text-feralOrange bg-feralOrange/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Docs</button>
          <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="flex items-center gap-1 border border-gray-700 px-3 py-1 hover:border-white transition-all text-gray-400 hover:text-white">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> GitHub
          </a>
        </nav>
      </header>

      {/* Dynamic View Control Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-[calc(100--140px)]">
        {view === 'product' ? (
          /* ================= PRODUCT LAYOUT (IMAGE 1 PARADIGM) ================= */
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12 pt-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-feralOrange/20 blur-xl rounded-full group-hover:bg-feralOrange/30 transition-all duration-500 animate-pulse" />
              <div className="w-24 h-24 bg-feralDark border-2 border-feralOrange flex items-center justify-center text-feralOrange relative z-10 shadow-[0_0_20px_rgba(255,69,0,0.2)]">
                <Cpu size={44} className="animate-spin-[spin_8s_linear_infinite]" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight uppercase">Let Him Cook<span className="text-feralOrange">.</span></h1>
              <p className="text-feralOrange font-extrabold tracking-wide text-xs md:text-sm uppercase">The Autonomous Engineering Node Built For The Trenches.</p>
              <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Zero telemetry corruption. Not backed by tech conglomerates or bloated venture capital layers. A pure, multi-modal interface that executes locally and natively out of your hard drive.
              </p>
            </div>

            {/* Quick Start Installation Sandbox */}
            <div className="w-full text-left space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h3 className="text-sm font-bold flex items-center gap-2"><Terminal size={14} className="text-feralOrange" /> Quick Start Matrix</h3>
                <div className="flex bg-feralDark border border-gray-800 p-0.5 text-xs">
                  <button onClick={() => setOs('mac')} className={`px-3 py-1 font-bold transition-all ${os === 'mac' ? 'bg-feralOrange text-black' : 'text-gray-400 hover:text-white'}`}>macOS & Linux</button>
                  <button onClick={() => setOs('win')} className={`px-3 py-1 font-bold transition-all ${os === 'win' ? 'bg-feralOrange text-black' : 'text-gray-400 hover:text-white'}`}>Windows (WSL)</button>
                </div>
              </div>

              <div className="bg-feralDark border border-feralOrange/40 p-4 relative group flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
                <div className="font-mono text-xs md:text-sm text-feralGreen break-all select-all">
                  <span className="text-gray-600 font-bold">$</span> curl -sL lethimcook.online/install.sh | bash
                </div>
                <button onClick={copyCommand} className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-2 font-black text-xs uppercase px-4 py-2 border transition-all duration-200 ${copied ? 'bg-feralGreen text-black border-feralGreen' : 'bg-feralOrange text-black border-feralOrange hover:bg-black hover:text-feralOrange'}`}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Rig Hook'}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal">
                Requires Node v22+. Installs package dependencies natively, aggregates security sandboxing boundaries, configurations, and auto-spins execution loops within a unified directory environment.
              </p>
            </div>

            {/* Core Skills Horizon Grid Component */}
            <div className="w-full text-left pt-8 space-y-6">
              <h2 className="text-lg font-black border-l-4 border-feralOrange pl-3 text-white tracking-widest uppercase">Operational Arsenal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="bg-feralDark/40 border border-gray-800 p-5 hover:border-feralOrange/40 transition-all duration-300">
                  <div className="text-[10px] text-feralOrange font-bold mb-1">01 // TRACKING INTERFACES</div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Radio size={14} className="text-feralOrange" /> Stealth Radar Matrix</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">Scrapes localized vectors, documentation structures, and dynamic web environments utilizing randomized browsing parameters with zero upstream token overhead.</p>
                </div>
                <div className="bg-feralDark/40 border border-gray-800 p-5 hover:border-feralOrange/40 transition-all duration-300">
                  <div className="text-[10px] text-feralOrange font-bold mb-1">02 // STRATIFIED COMPRESSION</div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Layers size={14} className="text-feralOrange" /> Trench Context Distiller</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">Condenses sprawling codebase tracking parameters and text blocks into localized code blocks with minimal semantic data distortion.</p>
                </div>
                <div className="bg-feralDark/40 border border-gray-800 p-5 hover:border-feralOrange/40 transition-all duration-300">
                  <div className="text-[10px] text-feralOrange font-bold mb-1">03 // ACTIVE ATTACK LAYERS</div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Flame size={14} className="text-feralOrange" /> Asynchronous Standup Daemon</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">Spins automated validation trackers right onto your Telegram nodes to log and monitor task arrays instantly on external devices.</p>
                </div>
                <div className="bg-feralDark/40 border border-gray-800 p-5 hover:border-feralOrange/40 transition-all duration-300">
                  <div className="text-[10px] text-feralOrange font-bold mb-1">04 // PERSISTENCE MATRICES</div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Server size={14} className="text-feralOrange" /> Local Ledger Envelope</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">Maintains structured history metrics, profile parameters, and tracking files in secure localized files inside your root system path.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= DOCUMENTATION INTERFACE (IMAGE 2 PARADIGM) ================= */
          <div className="flex flex-col space-y-6 pt-2">
            {/* Horizontal Subbar Subroutes */}
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 text-xs overflow-x-auto whitespace-nowrap">
              <span className="bg-feralOrange/10 border border-feralOrange/20 text-feralOrange px-2 py-0.5 font-bold">STABLE CORE</span>
              <span className="text-gray-600">|</span>
              {['Get started', 'Install', 'Channels', 'Skills', 'Architecture'].map((subRoute) => (
                <button key={subRoute} className="text-gray-400 hover:text-white transition-all font-bold px-2">{subRoute}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Dynamic Navigation Sidebar */}
              <aside className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 border-b lg:border-b-0 lg:border-r border-gray-800 pb-4 lg:pb-0 lg:pr-4 space-y-0 lg:space-y-1 text-xs whitespace-nowrap">
                <div className="hidden lg:block text-[10px] text-gray-500 font-bold uppercase tracking-wider px-2 mb-2">Overview Matrix</div>
                {[
                  { id: 'overview', title: 'Let Him Cook Overview' },
                  { id: 'onboarding', title: 'Trench Alignment Flow' },
                  { id: 'commands', title: 'CLI Routine Command Suite' },
                  { id: 'sandbox', title: 'Sandbox Environment Core' }
                ].map((item) => (
                  <button key={item.id} onClick={() => setActiveDocSection(item.id)} className={`w-full text-left px-3 py-2 font-bold transition-all ${activeDocSection === item.id ? 'bg-feralOrange/10 border-l-2 border-feralOrange text-feralOrange' : 'text-gray-400 hover:text-white hover:bg-feralDark/40'}`}>
                    {item.title}
                  </button>
                ))}
              </aside>

              {/* Central Documentation Rendering Module */}
              <section className="lg:col-span-6 space-y-6 text-sm leading-relaxed border-b lg:border-b-0 lg:border-r border-gray-800 pb-8 lg:pb-0 lg:pr-6">
                {activeDocSection === 'overview' && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Let Him Cook Matrix</h2>
                    <p className="text-gray-400 text-xs italic border-l-2 border-gray-800 pl-3">"A secure terminal workspace framework for independent developers."</p>
                    <p className="text-gray-300">Let Him Cook builds a secure terminal gateway on local machines across API systems, Telegram webhooks, and local code vectors to analyze, optimize, and organize your files.</p>
                    <div className="bg-feralDark border border-gray-800 p-4 space-y-2">
                      <div className="font-bold text-white text-xs uppercase text-feralOrange flex items-center gap-1"><BookOpen size={12} /> Execution Strategy</div>
                      <p className="text-xs text-gray-400">Boot tracking frameworks, align context files inside your hard drive directories, and command skills securely directly inside a centralized shell runtime loop.</p>
                    </div>
                  </div>
                )}

                {activeDocSection === 'onboarding' && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Trench Alignment Flow</h2>
                    <p className="text-gray-300">On initial initialization, the interface sets configuration matrices to build parameters and profile guidelines locally inside your directory parameters.</p>
                    <div className="bg-feralDark border border-gray-800 p-3 font-mono text-xs text-feralGreen space-y-1">
                      <div>&gt;_ Where are we at in the trenches right now?</div>
                      <div className="text-gray-500">  [A] The Blueprint : I have ideas but zero code.</div>
                      <div className="text-gray-500">  [B] In the Mud    : Built the MVP. Getting ghosted.</div>
                    </div>
                  </div>
                )}

                {activeDocSection === 'commands' && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">CLI Routine Command Suite</h2>
                    <p className="text-gray-300">Execute explicit analytical procedures directly inside terminal chat sessions using localized slash operational routing paths:</p>
                    <ul className="space-y-2 text-xs text-gray-400 font-mono">
                      <li><span className="text-feralOrange font-bold">/truth</span> — Fires the ego verification script against baseline metrics.</li>
                      <li><span className="text-feralOrange font-bold">/decide</span> — Activates active architectural trade-off evaluations.</li>
                      <li><span className="text-feralOrange font-bold">/blueprint</span> — Generates deep file structures and technical frameworks.</li>
                      <li><span className="text-feralOrange font-bold">/doctor</span> — Verifies memory blocks, keys, and operating structures.</li>
                    </ul>
                  </div>
                )}

                {activeDocSection === 'sandbox' && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Sandbox Environment Core</h2>
                    <p className="text-gray-300">All data channels operate utilizing strict process paths inside explicit workspace parameters to stop directory-traversal exploits or unauthorized script manipulation loops.</p>
                    <div className="bg-feralDark border border-gray-800 p-4 flex items-start gap-3">
                      <Shield size={18} className="text-feralGreen shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-white uppercase">Vulnerability Shield Activated</div>
                        <p className="text-gray-500 leading-normal">System operations map strict read/write processes securely using internal processes to lock downstream dependencies from corrupting core memory files.</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Right Sticky Section Map Anchor Bar */}
              <aside className="hidden lg:col-span-3 lg:block space-y-4 text-xs sticky top-24">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">On This Section</div>
                <div className="space-y-2 font-bold">
                  <div className="text-feralOrange border-b border-gray-900 pb-1">Context Analysis</div>
                  <div className="text-gray-500 hover:text-white transition-all cursor-pointer">Verification Mechanics</div>
                  <div className="text-gray-500 hover:text-white transition-all cursor-pointer">Local Constraints</div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Structured Footer Horizon Component (IMAGE 3 PARADIGM) */}
      <footer className="relative z-10 w-full border-t border-gray-900 bg-black/60 px-4 md:px-8 py-8 mt-16 space-y-4 text-center text-xs text-gray-600 font-mono">
        <div className="flex flex-wrap justify-center items-center gap-4 text-feralOrange font-bold">
          <button onClick={() => setView('product')} className="hover:underline">Product</button>
          <span>•</span>
          <button onClick={() => setView('docs')} className="hover:underline">Showcase</button>
          <span>•</span>
          <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="hover:underline">Integrations</a>
          <span>•</span>
          <span className="text-gray-700 cursor-not-allowed">Security Layer</span>
        </div>

        <div className="text-gray-400">
          Built by{' '}
          <a href="https://github.com/priyanshu132008/" target="_blank" rel="noreferrer" className="text-feralOrange font-bold hover:underline inline-flex items-center gap-0.5">
            Priyanshu Sawant
          </a>{' '}
          with absolute focus. Secure your uplink via{' '}
          <a href="https://www.linkedin.com/in/priyanshu-sawant-63310339b?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer" className="text-feralOrange font-bold hover:underline inline-flex items-center gap-0.5">
            LinkedIn
          </a>{' '}
          or follow core development parameters on{' '}
          <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="text-feralOrange font-bold hover:underline inline-flex items-center gap-0.5">
            GitHub
          </a>.
        </div>

        <div className="text-[10px] text-gray-700 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
          Independent development node. Not affiliated, endorsed, or partnered with OpenAI, Anthropic, or OpenRouter. Just raw execution.
        </div>
      </footer>
    </div>
  );
}