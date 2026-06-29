import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Terminal,
  BookOpen,
  Check,
  Copy,
  Shield,
  Zap,
  HardDrive,
  Send,
  FileCode2,
  ArrowUpRight,
  Search,
  Brain,
  Code2,
  MessageSquare,
  Puzzle,
  Layers,
  Radio,
  ListChecks,
} from 'lucide-react';

type OS = 'mac' | 'win';
type DocId = 'overview' | 'onboarding' | 'get-started' | 'channels' | 'skills' | 'commands' | 'sandbox';

/* ─────────────────────────────────────────────────────────────────────
 *  Shared scroll-reveal wrapper
 * ───────────────────────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  y = 24,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  AnimatedPanLogo — pan + flames with mount-timer ignition
 *
 *  Ported from the supplied vanilla JS. Because the logo sits at the top
 *  of the page, the original scroll-driven ignition never fires — the
 *  element is already at viewport-top on mount. We drive `prog` from 0 → 1
 *  on a 1.5 s timer instead, and use the scroll handler only as a
 *  secondary adjustment once ignition is complete. The single rAF loop
 *  updates pan stroke, egg fade, spark, igniting flames, and active
 *  flame flicker every frame via the captured refs.
 * ───────────────────────────────────────────────────────────────────── */
function AnimatedPanLogo({ className = '', size = 200 }: { className?: string; size?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const panRimRef = useRef<SVGEllipseElement>(null);
  const panBaseRef = useRef<SVGEllipseElement>(null);
  const innerRingRef = useRef<SVGEllipseElement>(null);
  const eggGroupRef = useRef<SVGGElement>(null);
  const sparkGroupRef = useRef<SVGGElement>(null);
  const flameGroupRef = useRef<SVGGElement>(null);
  const activeFlamesRef = useRef<SVGGElement>(null);
  const afRefs = [
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
    useRef<SVGPathElement>(null),
  ];

  // Mutable state read by both scroll handler and rAF tick. Stored on refs
  // so writing to it doesn't cause a re-render.
  const progRef = useRef(0);
  const flickTRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const panRim = panRimRef.current;
    const panBase = panBaseRef.current;
    const innerRing = innerRingRef.current;
    const eggGroup = eggGroupRef.current;
    const sparkGroup = sparkGroupRef.current;
    const flameGroup = flameGroupRef.current;
    const activeFlames = activeFlamesRef.current;
    const afs = afRefs.map((r) => r.current);
    if (!wrap || !svg) return;

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const hexToRgb = (h: string): [number, number, number] => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ];
    const rgbToHex = (r: number, g: number, b: number) =>
      '#' +
      [r, g, b]
        .map((n) => ('0' + Math.round(n).toString(16)).slice(-2))
        .join('');
    const lerpColor = (a: string, b: string, t: number) => {
      const ca = hexToRgb(a);
      const cb = hexToRgb(b);
      const tt = clamp(t, 0, 1);
      return rgbToHex(lerp(ca[0], cb[0], tt), lerp(ca[1], cb[1], tt), lerp(ca[2], cb[2], tt));
    };

    function applyState(p: number) {
      const s = p * 3;

      if (svg) {
        const cls =
          'pan-svg' + (s > 2.3 ? ' fire' : s > 1.2 ? ' hot' : '');
        svg.setAttribute('class', cls);
      }

      const strokeCol =
        s < 1
          ? lerpColor('#c97a3a', '#ffcc33', s)
          : s < 2
            ? lerpColor('#ffcc33', '#ff8800', s - 1)
            : lerpColor('#ff8800', '#ff4400', s - 2);

      if (panRim) {
        panRim.setAttribute('stroke', strokeCol);
        panRim.setAttribute('stroke-width', (3.2 + s * 1.1).toFixed(1));
      }
      if (panBase) panBase.setAttribute('stroke', strokeCol);
      if (innerRing) innerRing.setAttribute('stroke', strokeCol);

      const eggOp = s < 1.5 ? 1 : Math.max(0, 1 - (s - 1.5) / 0.7);
      if (eggGroup) eggGroup.setAttribute('opacity', eggOp.toFixed(2));

      let sparkOp = 0;
      if (s > 0.7 && s < 1.6) sparkOp = Math.sin((Math.PI * (s - 0.7)) / 0.9);
      const sparkScale = 0.7 + 0.6 * sparkOp;
      if (sparkGroup) {
        sparkGroup.setAttribute('opacity', sparkOp.toFixed(2));
        sparkGroup.setAttribute(
          'transform',
          `translate(88,116) scale(${sparkScale.toFixed(2)})`,
        );
      }

      let flameOp = 0;
      if (s > 1.2 && s < 2.6)
        flameOp =
          clamp((s - 1.2) / 0.6, 0, 1) * (1 - clamp((s - 2.2) / 0.4, 0, 1));
      if (flameGroup) flameGroup.setAttribute('opacity', flameOp.toFixed(2));

      const activeOp = clamp((s - 2.3) / 0.5, 0, 1);
      if (activeFlames) activeFlames.setAttribute('opacity', activeOp.toFixed(2));
    }

    // Ignition ramp duration in ms — drives `prog` from 0 → 1 on mount.
    const IGNITE_MS = 1500;
    const mountStart = performance.now();

    let animationFrameId = 0;
    const tick = () => {
      const elapsed = performance.now() - mountStart;
      // Drive `prog` from 0 to 1 over IGNITE_MS. After that the scroll handler
      // (and this loop) clamp `prog` so the fire stays lit.
      const fromTimer = Math.min(1, elapsed / IGNITE_MS);
      const target = Math.max(fromTimer, progRef.current);
      if (target !== progRef.current) {
        progRef.current = target;
        applyState(target);
      }

      if (progRef.current > 0.85) {
        flickTRef.current += 0.09;
        const bases = [0.85, 0.85, 0.9, 0.75, 0.68, 0.8];
        afs.forEach((el, i) => {
          if (!el) return;
          const base = bases[i];
          el.setAttribute(
            'opacity',
            (base + 0.12 * Math.sin(flickTRef.current * (1.5 + i * 0.3))).toFixed(2),
          );
        });
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);

    function onScroll() {
      // Scroll is a secondary input — only matters once the user scrolls past
      // the hero. The mount timer is what actually ignites the fire.
      const fromTimer = Math.min(
        1,
        (performance.now() - mountStart) / IGNITE_MS,
      );
      if (fromTimer < 1) return; // ignition still in progress, ignore scroll
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;

      const start = vh;
      const end = vh * 0.3;
      const raw = (start - rect.top) / (start - end);

      progRef.current = clamp(raw, 0, 1);
      applyState(progRef.current);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
    // afRefs are stable refs from useRef; we intentionally only set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className={className} style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        className="pan-svg block h-full w-full"
        viewBox="-10 -10 220 220"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Cook Agent — cooking pan with flames"
      >
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sparkGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="eggWhite" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbf0" />
            <stop offset="100%" stopColor="#f0e8d5" />
          </radialGradient>
          <radialGradient id="yolk" cx="40%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#fff0aa" />
            <stop offset="40%" stopColor="#ffcc44" />
            <stop offset="75%" stopColor="#f59000" />
            <stop offset="100%" stopColor="#c06000" />
          </radialGradient>
          <radialGradient id="panGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2a2420" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
        </defs>

        {/* Pan body fill */}
        <ellipse cx="95" cy="133" rx="80" ry="23" fill="url(#panGrad)" />

        {/* Pan rim */}
        <ellipse ref={panRimRef} cx="95" cy="128" rx="82" ry="27" fill="none" stroke="#c97a3a" strokeWidth="3.2" filter="url(#glow)" />
        <ellipse ref={panBaseRef} cx="95" cy="138" rx="72" ry="13" fill="none" stroke="#c97a3a" strokeWidth="2.2" filter="url(#glow)" />
        <ellipse ref={innerRingRef} cx="95" cy="128" rx="58" ry="18" fill="none" stroke="#c97a3a" strokeWidth="1.2" opacity="0.4" />

        {/* Handle */}
        <rect x="168" y="110" width="34" height="11" rx="5.5" fill="#141010" stroke="#c97a3a" strokeWidth="2.2" filter="url(#glow)" />
        <rect x="195" y="112.5" width="11" height="6" rx="3" fill="#1e1816" stroke="#c97a3a" strokeWidth="1.4" />

        {/* Egg */}
        <g ref={eggGroupRef} opacity="1">
          <ellipse cx="88" cy="126" rx="42" ry="16" fill="url(#eggWhite)" opacity="0.93" />
          <ellipse cx="70" cy="129" rx="15" ry="8.5" fill="#fffcf2" opacity="0.65" />
          <ellipse cx="110" cy="124" rx="13" ry="7" fill="#fffcf2" opacity="0.55" />
          <ellipse cx="89" cy="134" rx="11" ry="5" fill="#fffcf2" opacity="0.45" />
          <circle cx="88" cy="124" r="12" fill="url(#yolk)" />
          <ellipse cx="83" cy="120" rx="4.5" ry="3.5" fill="#ffee99" opacity="0.5" />
        </g>

        {/* Spark */}
        <g ref={sparkGroupRef} opacity="0" transform="translate(88,116)">
          <circle cx="0" cy="0" r="9" fill="rgba(255,220,50,0.12)" filter="url(#sparkGlow)" />
          <line x1="0" y1="-10" x2="0" y2="-5" stroke="#ffe566" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="7" y1="-7" x2="4" y2="-4" stroke="#ffaa22" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="-7" y1="-7" x2="-4" y2="-4" stroke="#ffaa22" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="9" y1="0" x2="4" y2="0" stroke="#ff7700" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="-9" y1="0" x2="-4" y2="0" stroke="#ff7700" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="5" y1="6" x2="3" y2="3" stroke="#ff9900" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="-5" y1="6" x2="-3" y2="3" stroke="#ff9900" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3.8" fill="#ffe566" />
          <circle cx="0" cy="0" r="1.8" fill="#fff" />
        </g>

        {/* Igniting flames (medium) */}
        <g ref={flameGroupRef} opacity="0" transform="translate(88,103)">
          <path d="M0,-46 C9,-36 15,-20 7,-8 C3,-2 -3,0 0,0 C3,0 7,-2 4,-8 C-2,-20 5,-36 0,-46Z" fill="#ff5500" opacity="0.9" />
          <path d="M-15,-30 C-7,-22 -3,-11 -9,-3 C-13,2 -19,0 -15,0 C-11,0 -7,-4 -11,-12 C-17,-22 -20,-30 -15,-30Z" fill="#ff7700" opacity="0.78" />
          <path d="M15,-26 C21,-18 19,-7 13,-2 C9,2 5,0 9,-4 C13,-10 18,-18 15,-26Z" fill="#ff6600" opacity="0.78" />
          <path d="M0,-32 C5,-23 8,-13 3,-6 C1,-2 -2,0 0,0 C2,0 5,-2 3,-6 C-2,-13 2,-23 0,-32Z" fill="#ffcc33" opacity="0.7" />
          <ellipse cx="0" cy="3" rx="17" ry="5" fill="#ff4400" opacity="0.3" filter="url(#glowStrong)" />
        </g>

        {/* Active large flames */}
        <g ref={activeFlamesRef} opacity="0" transform="translate(88,106)">
          <path ref={afRefs[0]} d="M-24,-40 C-12,-26 -7,-11 -16,-3 C-20,2 -26,0 -22,-5 C-15,-12 -20,-27 -24,-40Z" fill="#ff5500" opacity="0.85" />
          <path ref={afRefs[1]} d="M24,-36 C32,-24 30,-9 19,-2 C15,2 11,0 15,-5 C19,-12 22,-23 24,-36Z" fill="#ff6600" opacity="0.85" />
          <path ref={afRefs[2]} d="M-9,-52 C1,-40 11,-23 5,-9 C2,-2 -4,0 0,0 C4,0 8,-2 4,-9 C-2,-23 3,-40 -9,-52Z" fill="#ff4400" opacity="0.9" />
          <path ref={afRefs[3]} d="M9,-46 C16,-34 17,-19 11,-9 C8,-3 3,0 7,-4 C11,-10 15,-29 9,-46Z" fill="#ff7700" opacity="0.75" />
          <path ref={afRefs[4]} d="M-17,-32 C-9,-21 -7,-9 -13,-3 C-17,2 -21,0 -17,-4 C-11,-10 -13,-23 -17,-32Z" fill="#ff9900" opacity="0.68" />
          <path ref={afRefs[5]} d="M0,-38 C6,-27 9,-15 3,-7 C1,-2 -3,0 0,0 C3,0 6,-2 3,-7 C-1,-15 0,-27 0,-38Z" fill="#ffcc33" opacity="0.8" />
          <ellipse cx="0" cy="4" rx="30" ry="9" fill="#ff3300" opacity="0.28" filter="url(#glowStrong)" />
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Root router shell
 * ───────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0a] text-gray-200 selection:bg-[#FF4500] selection:text-black">
      <BackgroundLayers />
      <SiteHeader />
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 pb-10 pt-4 md:px-10 md:pb-16 md:pt-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Decorative background
 * ───────────────────────────────────────────────────────────────────── */
function BackgroundLayers() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.20 0 0 0 0 0.05 0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,69,0,0.22) 1px, transparent 1.4px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0',
        }}
      />
      <div
        className="pointer-events-none fixed left-0 right-0 top-1/2 z-0 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#FF4500]/35 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#FF4500]/45 sm:left-6 sm:top-6 sm:h-6 sm:w-6" />
        <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#FF4500]/45 sm:right-6 sm:top-6 sm:h-6 sm:w-6" />
        <div className="absolute left-3 bottom-3 h-5 w-5 border-l-2 border-b-2 border-[#FF4500]/45 sm:left-6 sm:bottom-6 sm:h-6 sm:w-6" />
        <div className="absolute right-3 bottom-3 h-5 w-5 border-r-2 border-b-2 border-[#FF4500]/45 sm:right-6 sm:bottom-6 sm:h-6 sm:w-6" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Site header (router-aware)
 * ───────────────────────────────────────────────────────────────────── */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#FF4500]/25 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 md:flex-row md:items-end md:justify-between md:px-10 md:py-4">
        <Link to="/" className="group flex items-center gap-3 text-left leading-none">
          <motion.div
            className="shrink-0"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/favicon.svg" alt="Cook Agent" className="h-11 w-11" />
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF4500]">
                OPEN SOURCE //
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">
                v0.1
              </span>
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
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-widest sm:gap-2 md:gap-3 md:text-xs">
          <HeaderNavLink to="/">Product</HeaderNavLink>
          <HeaderNavLink to="/docs">Docs</HeaderNavLink>
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
      <div className="relative h-px w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-y-0 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent animate-[scan_3.5s_linear_infinite]" />
      </div>
    </header>
  );
}

function HeaderNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative px-3 py-1.5 transition-all duration-300 ${
          isActive
            ? 'border border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500] shadow-[0_0_15px_rgba(255,69,0,0.25)]'
            : 'border border-transparent text-gray-500 hover:border-gray-700 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Site footer
 * ───────────────────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 w-full border-t border-gray-900 bg-black/80 px-5 py-10 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4500]">
          <Link to="/" className="border border-transparent px-2 py-1 transition-all hover:border-[#FF4500]/60 hover:text-white">
            Product
          </Link>
          <span className="text-gray-800">/</span>
          <Link to="/docs" className="border border-transparent px-2 py-1 transition-all hover:border-[#FF4500]/60 hover:text-white">
            Docs
          </Link>
          <span className="text-gray-800">/</span>
          <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="border border-transparent px-2 py-1 transition-all hover:border-[#FF4500]/60 hover:text-white">
            GitHub
          </a>
        </div>

        <div className="text-xs leading-relaxed text-gray-400">
          Built by{' '}
          <a href="https://github.com/priyanshu-sawant" target="_blank" rel="noreferrer" className="font-black text-[#FF4500] underline-offset-4 transition-all hover:underline">
            Priyanshu Sawant
          </a>
          . Reach out on{' '}
          <a href="https://www.linkedin.com/in/priyanshu-sawant-63310339b" target="_blank" rel="noreferrer" className="font-black text-[#FF4500] underline-offset-4 transition-all hover:underline">
            LinkedIn
          </a>{' '}
          or follow development on{' '}
          <a href="https://github.com/priyanshu132008/cook-agent" target="_blank" rel="noreferrer" className="font-black text-[#FF4500] underline-offset-4 transition-all hover:underline">
            GitHub
          </a>
          .
        </div>

        <div className="max-w-2xl text-[10px] uppercase leading-relaxed tracking-[0.25em] text-gray-700">
          Independent open-source project. Not affiliated with, endorsed by, or partnered with OpenAI, Anthropic, or OpenRouter. All trademarks belong to their respective owners.
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Landing page (root route)
 * ───────────────────────────────────────────────────────────────────── */
function LandingPage() {
  const [os, setOs] = useState<OS>('mac');
  const [copied, setCopied] = useState(false);

  const installCommand = 'curl -sL lethimcook.online/install.sh | bash';
  const copyCommand = () => {
    void navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Hero — AnimatedPanLogo + headline + subtitle */}
      <section className="flex flex-col items-center gap-4 pt-0 text-center">
        <AnimatedPanLogo size={180} className="mx-auto" />

        <Reveal delay={0.05}>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-[#FF4500] sm:text-[10px] sm:tracking-[0.5em] md:text-xs">
            <span className="h-px w-8 bg-[#FF4500]/60" />
            Open Source · v0.1
            <span className="h-px w-8 bg-[#FF4500]/60" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="flex flex-row flex-wrap items-baseline justify-center gap-x-4 gap-y-2 text-center text-4xl font-black uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-6xl md:text-8xl">
            <span>Let</span>
            <span>Him</span>
            <span className="relative inline-block text-[#FF4500]">
              Cook
              <span className="absolute -bottom-1 left-0 h-1 w-full origin-left scale-x-0 animate-[pulse-line_2.4s_ease-in-out_infinite] bg-[#FF4500]" />
            </span>
            <span className="text-[#FF4500]">.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
            Cook Agent is an open-source AI co-founder that lives on your laptop. Remembers your journey. Guides your next move. Helps you ship.
          </p>
        </Reveal>
      </section>

      {/* Quick Start */}
      <Reveal className="flex w-full flex-col items-center gap-3">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">
          Requirements:{' '}
          <a
            href="https://nodejs.org/en/download"
            target="_blank"
            rel="noreferrer"
            className="font-black text-gray-300 underline underline-offset-4 transition-colors hover:text-[#FF4500]"
          >
            Node.js
          </a>{' '}
          v22+
        </p>

        <div className="flex w-full max-w-3xl items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
            <Terminal size={14} className="text-[#FF4500]" />
            Quick Start Command
          </div>
          <div className="flex border border-gray-800 bg-black/60 p-0.5 text-[10px] font-black uppercase tracking-wider">
            <button
              onClick={() => setOs('mac')}
              className={`px-3 py-1 transition-all duration-300 ${
                os === 'mac' ? 'bg-[#FF4500] text-black shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-white'
              }`}
            >
              macOS · Linux
            </button>
            <button
              onClick={() => setOs('win')}
              className={`px-3 py-1 transition-all duration-300 ${
                os === 'win' ? 'bg-[#FF4500] text-black shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-white'
              }`}
            >
              Windows · WSL
            </button>
          </div>
        </div>

        <p className="w-full max-w-3xl text-[11px] uppercase tracking-[0.25em] text-gray-500">
          Get yourself one according to your OS 👇
        </p>

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
              {os === 'mac'
                ? 'curl -sL lethimcook.online/install.sh | bash'
                : 'wsl --install -d Ubuntu && curl -sL lethimcook.online/install.sh | bash'}
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
          Installs the <code className="text-[#FF4500]">cook</code> binary into <code className="text-[#FF4500]">~/.local/bin</code>. No admin rights, no daemons, no background services — every command is a fresh process.
        </p>
      </Reveal>

      {/* What It Does */}
      <section className="flex w-full flex-col gap-6 pt-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">What It Does</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
          </div>
        </Reveal>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <CapabilityCard
            index="01"
            icon={<Search size={16} className="text-[#FF4500]" />}
            title="Web Search"
            desc="Three layers of web search with built-in fallback. No API keys needed for the first two layers."
          />
          <CapabilityCard
            index="02"
            icon={<Brain size={16} className="text-[#FF4500]" />}
            title="Local Memory"
            desc="Your project state — profile, ideas, progress — saved as Markdown files in ~/.cook/memory/. Nothing leaves your machine."
          />
          <CapabilityCard
            index="03"
            icon={<Code2 size={16} className="text-[#FF4500]" />}
            title="Code Generation"
            desc="Generate full files, refactors, and patches directly inside your repo, sandboxed to the working directory."
          />
          <CapabilityCard
            index="04"
            icon={<MessageSquare size={16} className="text-[#FF4500]" />}
            title="Terminal Chat"
            desc="A full TUI for direct work, plus a Telegram bot so you can keep the conversation going from your phone."
          />
          <CapabilityCard
            index="05"
            icon={<Puzzle size={16} className="text-[#FF4500]" />}
            title="Slash Skills"
            desc="Eleven composed skills — /blueprint, /truth, /hunt, /anchor, and more — invoke them from the TUI or the CLI."
          />
          <CapabilityCard
            index="06"
            icon={<HardDrive size={16} className="text-[#FF4500]" />}
            title="Model Choice"
            desc="Run on a local Ollama model for free, or plug in OpenAI / Anthropic / OpenRouter when you need more capacity."
          />
        </motion.div>
      </section>

      {/* Under The Hood */}
      <section className="flex w-full flex-col gap-6 pt-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">Under The Hood</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
          </div>
        </Reveal>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid w-full grid-cols-1 gap-4 md:grid-cols-2"
        >
          <ArsenalCard
            index="01"
            label="Context Pipeline"
            title="Context Condenser"
            icon={<Layers size={14} className="text-[#FF4500]" />}
            desc="A built-in pipeline that strips noise from every web page before it reaches the model, so you stay under token limits without paying for junk context."
          />
          <ArsenalCard
            index="02"
            label="Memory Storage"
            title="Local Memory Storage"
            icon={<HardDrive size={14} className="text-[#FF4500]" />}
            desc="Your profile, ideas, and progress are stored as Markdown files in ~/.cook/memory/. Version-control them, edit them by hand — they're yours."
          />
          <ArsenalCard
            index="03"
            label="Task Tracking"
            title="Automated Task Tracking"
            icon={<ListChecks size={14} className="text-[#FF4500]" />}
            desc="Daily standups and accountability nudges get pushed to Telegram on a schedule you define."
          />
          <ArsenalCard
            index="04"
            label="Search Backends"
            title="Stealth Search Layer"
            icon={<Radio size={14} className="text-[#FF4500]" />}
            desc="Three independent search backends (DuckDuckGo → 18 SearXNG instances → optional API) with a 2–4s jitter between requests so you stay under the radar."
          />
        </motion.div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Cards
 * ───────────────────────────────────────────────────────────────────── */
const cardStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function CapabilityCard({
  index,
  icon,
  title,
  desc,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      variants={cardVariant}
      className="group relative flex flex-col gap-3 overflow-hidden border border-gray-800 bg-black/50 p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#FF4500]/80 hover:shadow-[0_0_25px_rgba(255,69,0,0.2)]"
    >
      <div className="absolute left-0 top-0 h-0 w-px bg-[#FF4500] transition-all duration-700 group-hover:h-full" />
      <div className="absolute right-0 top-0 h-px w-0 bg-[#FF4500] transition-all duration-700 group-hover:w-full" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FF4500]/8 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-[#FF4500]">
        <span>{index}</span>
        {icon}
      </div>
      <h3 className="text-sm font-black uppercase tracking-wide text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-500 transition-all duration-300 group-hover:text-gray-300">{desc}</p>
    </motion.div>
  );
}

function ArsenalCard({
  index,
  label,
  title,
  icon,
  desc,
}: {
  index: string;
  label: string;
  title: string;
  icon: React.ReactNode;
  desc: string;
}) {
  return (
    <motion.div
      variants={cardVariant}
      className="group relative flex flex-col gap-3 overflow-hidden border border-gray-800 bg-black/40 p-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#FF4500]/80 hover:shadow-[0_0_30px_rgba(255,69,0,0.25)]"
    >
      <div className="absolute left-0 top-0 h-0 w-px bg-[#FF4500] transition-all duration-700 group-hover:h-full" />
      <div className="absolute right-0 top-0 h-px w-0 bg-[#FF4500] transition-all duration-700 group-hover:w-full" />
      <div className="absolute bottom-0 right-0 h-0 w-px bg-[#FF4500] transition-all duration-700 group-hover:h-full" />
      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#FF4500] transition-all duration-700 group-hover:w-full" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FF4500]/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-[#FF4500]">
        <span>
          {index} // {label}
        </span>
        <span className="text-gray-700 transition-all group-hover:text-[#FF4500]">▶</span>
      </div>
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
        {icon}
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-gray-500 transition-all duration-300 group-hover:text-gray-300">{desc}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Docs page
 * ───────────────────────────────────────────────────────────────────── */
function DocsPage() {
  const [activeDocSection, setActiveDocSection] = useState<DocId>('overview');

  const docNav: { id: DocId; title: string; sub: string }[] = [
    { id: 'overview', title: 'Overview', sub: '01' },
    { id: 'onboarding', title: 'Project Setup', sub: '02' },
    { id: 'get-started', title: 'Get Started', sub: '03' },
    { id: 'channels', title: 'Channels', sub: '04' },
    { id: 'skills', title: 'Skills', sub: '05' },
    { id: 'commands', title: 'Commands', sub: '06' },
    { id: 'sandbox', title: 'Sandbox', sub: '07' },
  ];

  const rightScrollFor: Record<DocId, { label: string; active?: boolean }[]> = {
    overview: [
      { label: '01 · What Cook Is', active: true },
      { label: '02 · How It Works' },
      { label: '03 · Local Constraints' },
      { label: '04 · Failure Modes' },
    ],
    onboarding: [
      { label: '01 · Where You Are', active: true },
      { label: '02 · Idea Capture' },
      { label: '03 · Model Choice' },
      { label: '04 · Search Layer' },
      { label: '05 · Accountability' },
    ],
    'get-started': [
      { label: '01 · Install', active: true },
      { label: '02 · First Onboard' },
      { label: '03 · Memory Files' },
      { label: '04 · System Doctor' },
    ],
    channels: [
      { label: '01 · Terminal (TUI)', active: true },
      { label: '02 · Telegram bot' },
      { label: '03 · Pairing' },
      { label: '04 · Slash Routing' },
    ],
    skills: [
      { label: '01 · Skill List', active: true },
      { label: '02 · Skill Anatomy' },
      { label: '03 · Markdown Definition' },
      { label: '04 · Invocation' },
    ],
    commands: [
      { label: '01 · Setup', active: true },
      { label: '02 · Skills' },
      { label: '03 · Daemon' },
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
          Stable · v0.1
        </span>
        <span className="hidden text-gray-700 md:inline">|</span>
        <div className="hidden flex-wrap gap-1 text-[11px] font-black uppercase tracking-widest md:flex">
          {['Get Started', 'Install', 'Channels', 'Skills', 'Architecture'].map((s) => (
            <button key={s} className="px-2 py-1 text-gray-500 transition-all duration-300 hover:text-[#FF4500]">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:grid-cols-12">
        {/* LEFT NAV */}
        <aside className="flex flex-col gap-1 border-b border-gray-800 pb-4 md:col-span-4 md:border-b-0 md:border-r md:border-gray-800 md:pb-0 md:pr-5 lg:col-span-3">
          <div className="mb-3 hidden px-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 md:block">Documentation</div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 md:hidden">Jump To</div>
          <div className="-mx-1 flex flex-row gap-1 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {docNav.map((item) => (
              <DocNavButton
                key={item.id}
                active={activeDocSection === item.id}
                sub={item.sub}
                title={item.title}
                onClick={() => setActiveDocSection(item.id)}
                variant="chip"
              />
            ))}
          </div>
          <div className="hidden md:flex md:flex-col md:gap-1">
            {docNav.map((item) => (
              <DocNavButton
                key={item.id}
                active={activeDocSection === item.id}
                sub={item.sub}
                title={item.title}
                onClick={() => setActiveDocSection(item.id)}
                variant="row"
              />
            ))}
          </div>
        </aside>

        {/* CENTER READING FRAME */}
        <section className="flex flex-col gap-6 border-b border-gray-800 pb-8 text-sm leading-relaxed md:col-span-8 md:border-b-0 md:border-r md:border-gray-800 md:pb-0 md:pr-6 lg:col-span-6">
          <Reveal>
            <DocContent id={activeDocSection} />
          </Reveal>
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
        </aside>
      </div>
    </div>
  );
}

function DocNavButton({
  active,
  sub,
  title,
  onClick,
  variant,
}: {
  active: boolean;
  sub: string;
  title: string;
  onClick: () => void;
  variant: 'chip' | 'row';
}) {
  if (variant === 'chip') {
    return (
      <button
        onClick={onClick}
        className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
          active
            ? 'border-[#FF4500] bg-[#FF4500]/10 text-[#FF4500]'
            : 'border-gray-800 text-gray-500 active:text-white'
        }`}
      >
        <span className="mr-1.5 text-[9px] opacity-70">{sub}</span>
        {title}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider transition-all duration-300 ${
        active
          ? 'border-l-2 border-[#FF4500] bg-[#FF4500]/5 text-[#FF4500]'
          : 'border-l-2 border-transparent text-gray-500 hover:border-[#FF4500]/60 hover:bg-black/50 hover:text-white'
      }`}
    >
      <span className={`text-[10px] ${active ? 'text-[#FF4500]' : 'text-gray-700 group-hover:text-[#FF4500]'}`}>{sub}</span>
      <span className="flex-1">{title}</span>
      {active && <span className="text-[#FF4500]">▸</span>}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 *  Doc content (jargon-free)
 * ───────────────────────────────────────────────────────────────────── */
function DocContent({ id }: { id: DocId }) {
  switch (id) {
    case 'overview':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="01" label="Overview" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Cook Agent <span className="text-[#FF4500]">Overview</span>
          </h2>
          <p className="border-l-2 border-gray-800 pl-4 text-xs italic text-gray-500">
            "An open-source AI co-founder that runs entirely on your laptop."
          </p>
          <p className="text-gray-300">
            Cook Agent is a local-first AI co-founder for indie hackers. It boots a secure terminal gateway on your own machine,
            pipes web search through a strict context condenser, and routes every request through your own LLM —
            Ollama by default, or OpenRouter / OpenAI / Anthropic when you plug them in. There is no Docker, no
            vendor lock-in, and no telemetry leaking to outside servers. Your profile, ideas, and progress live as Markdown in{' '}
            <code className="text-[#FF4500]">~/.cook/memory/</code>.
          </p>

          <div className="flex flex-col gap-3 border border-gray-800 bg-black/60 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF4500]">
              <BookOpen size={12} /> How It Works
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The agent boots, profiles your machine, picks a model, then builds a short profile from a quick onboarding interview.
              Every later session reads that profile to give you level-aware advice — gentle for first-time builders,
              direct for experienced ones. Eleven first-class skills slot in as slash commands inside the TUI or as standalone CLI invocations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatBlock label="Model" value="Ollama → OR → Claude" sub="Local by default" />
            <StatBlock label="Search" value="DDG · 18 SearXNG" sub="No parallel fetches" />
            <StatBlock label="Memory" value="Markdown on Disk" sub="Version-controlled" />
          </div>

          <Callout tone="orange">
            <strong className="text-white">The Cook Promise:</strong>{' '}
            no API keys leak upstream, no Docker daemon is required, no telemetry is collected. You ship the code; Cook keeps you accountable while you do.
          </Callout>
        </div>
      );

    case 'onboarding':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="02" label="Project Setup" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Project Setup <span className="text-[#FF4500]">Guide</span>
          </h2>
          <p className="text-gray-300">
            The first time you run <code className="text-[#FF4500]">cook onboard</code>, the system walks you through a short setup.
            Each answer is written straight to <code className="text-[#FF4500]">memory/profile.md</code>,{' '}
            <code className="text-[#FF4500]">memory/idea.md</code> and <code className="text-[#FF4500]">memory/status.md</code>.
            Every skill then reads those files before responding — your tone, model, and working hours travel with you across reboots.
          </p>

          <div className="flex flex-col gap-1.5 border border-gray-800 bg-black/70 p-4 font-mono text-xs text-[#00FF41]">
            <div>&gt;_ Where are you right now in your build?</div>
            <div className="text-gray-500">[A] Just exploring — I have ideas, no code yet.</div>
            <div className="text-gray-500">[B] Building the MVP — need help unblocking.</div>
            <div className="text-gray-500">[C] Shipping — ready to scale up.</div>
          </div>

          <StepBlock
            n="01"
            title="Where you're at"
            body='Selects the lens for every later skill. "Just exploring" gives gentle, instructional answers. "Building the MVP" is direct and unblocking. "Shipping" gets efficient, level-aware advice.'
          />
          <StepBlock
            n="02"
            title="What you're building"
            body='Two free-text prompts. "What are we cooking?" feeds /truth, /validate, /blueprint. "What is your biggest blocker right now?" feeds /anchor and the daily standup.'
          />
          <StepBlock
            n="03"
            title="Biggest blocker"
            body="A single-select: brain fog, distribution, or technical debt. Tags the tone of the next /truth report and the first outreach draft."
          />
          <StepBlock
            n="04"
            title="Which model"
            body='Three branches — Local (Ollama, models listed from your machine), Cloud Free (OpenRouter, key saved to .env), Cloud Pro (OpenAI / Anthropic / Gemini). Default fallback: phi4-mini.'
          />
          <StepBlock
            n="05"
            title="How to search"
            body='Pick how Cook searches the web. Default uses DuckDuckGo + 18 SearXNG mirrors — free and zero-config. Tavily and Brave unlock paid but faster APIs. The key, if needed, is appended to .env.'
          />
          <StepBlock
            n="06"
            title="Where to reach you"
            body='Where do you want the Cook to message you? Terminal TUI is zero-config. Telegram pastes a bot token now (or skips), then runs via `cook serve:telegram` later.'
          />
          <StepBlock
            n="07"
            title="Working hours"
            body='Stored in profile.md. /standup and /anchor use it to schedule notifications and late-evening grounding prompts.'
          />

          <Callout tone="green">
            Final step offers <code className="text-[#00FF41]">Open the terminal now? (Y/n)</code>. Press enter and the TUI comes alive with your profile already loaded.
          </Callout>
        </div>
      );

    case 'get-started':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="03" label="Get Started" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Install Cook <span className="text-[#FF4500]">Agent</span>
          </h2>
          <p className="text-gray-300">
            Zero Docker. Zero global state. The installer clones the repo into <code className="text-[#FF4500]">~/.cook</code>,
            runs <code className="text-[#FF4500]">pnpm install</code>, and installs a{' '}
            <code className="text-[#FF4500]">cook</code> binary into <code className="text-[#FF4500]">~/.local/bin</code>.
            No admin rights, no daemons, no background services — every command is a fresh process you control.
          </p>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">01 · One-Liner Install</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'curl -sL lethimcook.online/install.sh | bash', color: 'green' },
              { c: '◆ ', t: 'Cloning the Cook repository...', color: 'gray' },
              { c: '◆ ', t: 'Installing dependencies...', color: 'gray' },
              { c: '◆ ', t: 'Installing global \'cook\' binary...', color: 'gray' },
              { c: '✓ ', t: 'Installation complete.', color: 'orange' },
              { c: '  ', t: 'export PATH="$HOME/.local/bin:$PATH"', color: 'gray' },
            ]}
          />
          <p className="text-xs text-gray-500">
            Append that export line to <code className="text-[#FF4500]">~/.zshrc</code> or{' '}
            <code className="text-[#FF4500]">~/.bashrc</code> and restart the shell. Windows users run the same line inside WSL Ubuntu.
          </p>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">02 · First Onboard</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'cook onboard', color: 'green' },
              { c: '◆ ', t: '[ SETUP ]', color: 'orange' },
              { c: '? ', t: 'Where are you right now?  › Building the MVP', color: 'gray' },
              { c: '◆ ', t: 'Scanning system... 16.0GB RAM detected.', color: 'gray' },
              { c: '? ', t: 'Pick a model:  › Local (Ollama)', color: 'gray' },
              { c: '? ', t: 'Pick a local model:  › phi4-mini', color: 'gray' },
              { c: '✓ ', t: 'Profile saved. .env updated.', color: 'orange' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">03 · Verify The Install</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'cook doctor', color: 'green' },
              { c: '✓ ', t: 'Local model (Ollama)    localhost:11434 responding', color: 'green' },
              { c: '✓ ', t: 'Selected model          phi4-mini ready', color: 'green' },
              { c: '✓ ', t: 'RAM available           7.4GB free — sufficient', color: 'green' },
              { c: '✓ ', t: 'Memory readable         /memory/ — read/write OK', color: 'green' },
              { c: '✓ ', t: 'Search Layer 1          duckduckgo.com responding', color: 'green' },
              { c: '✓ ', t: 'Profile token           ~/memory/profile.md valid', color: 'green' },
              { c: '✓ ', t: '7/7 checks passed. Cook is ready.', color: 'green' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">04 · Open The Chat</h3>
          <CodeBlock
            lines={[
              { c: '$ ', t: 'cook chat', color: 'green' },
              { c: '◆ ', t: 'Cook Agent ready. Type "/exit" to close.', color: 'orange' },
              { c: 'You > ', t: 'plan my next 4 hours', color: 'gray' },
              { c: 'Cook > ', t: "Based on your profile and PROGRESS.md, here are the three coding targets...", color: 'green' },
            ]}
          />

          <Callout tone="orange">
            That's it. No Docker, no signup, no cloud account. Cook runs from <code className="text-[#FF4500]">~/.cook</code> and remembers your state forever.
          </Callout>
        </div>
      );

    case 'channels':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="04" label="Channels" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Channel <span className="text-[#FF4500]">Interfaces</span>
          </h2>
          <p className="text-gray-300">
            Cook has two surfaces — a Terminal User Interface (TUI) that lives on your machine, and a Telegram bot that
            lets you talk to the same agent from your phone. Both routes hit the exact same router: profile-aware system envelope,
            identical skills, identical memory. Choose where you want the Cook to reach you.
          </p>

          <div className="flex flex-col gap-3 border border-gray-800 bg-black/60 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF4500]">
              <Terminal size={14} /> Channel 01 · Terminal (TUI)
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The <code className="text-[#FF4500]">cook chat</code> command spawns a readline loop with a 20-turn rolling history.
              The system envelope is seeded once per session and re-used across recursive slash-command skill runs —
              that means after <code className="text-[#FF4500]">/blueprint</code> finishes, the TUI reopens with the blueprint context preserved.
              Spinner frames show "Cooking..." / "Reading source..." while the LLM works.
            </p>
            <CodeBlock
              lines={[
                { c: 'You > ', t: '/blueprint', color: 'gray' },
                { c: '◆ ', t: '[ SKILL: BUILD GUIDE ]', color: 'orange' },
                { c: '◆ ', t: '🧱 STACK: Hono · SQLite · Bun · Cloudflare Workers', color: 'green' },
                { c: '◆ ', t: '🗺️ EXECUTION ORDER (next 48 hours)...', color: 'green' },
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

          <div className="flex flex-col gap-3 border border-gray-800 bg-black/60 p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF4500]">
              <Send size={14} /> Channel 02 · Telegram bot
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The Telegram bot is a long-polling loop in{' '}
              <code className="text-[#FF4500]">packages/core/src/channels/telegram.ts</code>.
              It reads <code className="text-[#FF4500]">TELEGRAM_BOT_TOKEN</code> from{' '}
              <code className="text-[#FF4500]">.env</code>, drops any active webhook, then long-polls{' '}
              <code className="text-[#FF4500]">getUpdates</code>. Each incoming message is matched against an allow-list in{' '}
              <code className="text-[#FF4500]">memory/tg_auth.json</code>; unpaired chats are silently dropped.
              Model routing reuses the profile — local Ollama or cloud, same as the TUI.
            </p>
            <CodeBlock
              lines={[
                { c: '$ ', t: 'cook serve:telegram', color: 'green' },
                { c: '◆ ', t: '🤖 Starting Telegram bot...', color: 'orange' },
                { c: '◆ ', t: '📡 Listening for messages...', color: 'gray' },
                { c: '◆ ', t: '[TG] In: hey cook, plan my day', color: 'green' },
                { c: '◆ ', t: '  -> Routing to local model (phi4-mini)...', color: 'gray' },
                { c: '◆ ', t: '[TG] Out: Three tasks scheduled for today...', color: 'orange' },
              ]}
            />
            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Pairing a New Device</h4>
            <p className="text-xs leading-relaxed text-gray-400">
              When an unauthorized chat ID pings the bot, the daemon drops the message but logs a pending entry. Run{' '}
              <code className="text-[#FF4500]">cook approve &lt;code&gt;</code> from the host terminal to mint a pairing code,
              then reply with it from the phone. Approved IDs are persisted to{' '}
              <code className="text-[#FF4500]">memory/tg_auth.json</code>. Revoke by deleting that file.
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
            Both channels share one system envelope. Switch surfaces mid-project — context survives. Slash commands work in the TUI; in Telegram, type the command as a regular message and the bot routes it through the same skill.
          </Callout>
        </div>
      );

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
            runs the LLM, and prints or persists the output. They compose like building blocks —{' '}
            <code className="text-[#FF4500]">/hunt</code> writes to{' '}
            <code className="text-[#FF4500]">memory/customers.md</code>, which{' '}
            <code className="text-[#FF4500]">/outreach</code> and{' '}
            <code className="text-[#FF4500]">/launch</code> read. No orchestrator above them — just a flat skill list the LLM can invoke on demand.
          </p>

          <div className="flex flex-col gap-2 border border-gray-800 bg-black/70 p-4 text-xs leading-relaxed text-gray-400">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF4500]">
              <FileCode2 size={12} /> Skill Anatomy
            </div>
            <p>
              Every skill follows the same skeleton: <span className="text-[#FF4500]">intro</span> banner →{' '}
              <span className="text-[#FF4500]">spinner</span> → read profile/idea/progress → route through{' '}
              <code className="text-[#FF4500]">generateLocal</code> or <code className="text-[#FF4500]">generateCloud</code> based on{' '}
              <code className="text-[#FF4500]">Model Choice</code> in <code className="text-[#FF4500]">profile.md</code> →{' '}
              <span className="text-[#FF4500]">outro</span>. No silent crashes, no missing fallbacks.
            </p>
          </div>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Core Skill List</h3>
          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <SkillCard cmd="/truth" name="Reality Check" file="hard-truth.ts" desc="Honest reality-check on your current idea and progress. Tone adapts to your experience level." />
            <SkillCard cmd="/decide" name="Decision Partner" file="decision-partner.ts" desc="Socratic architectural breakdown. You give it the dilemma; it strips emotion, gives two trade-offs, and ships a recommendation." />
            <SkillCard cmd="/blueprint" name="Build Guide" file="build-guide.ts" desc="Generates the exact stack, a 4-step 48-hour execution order, and the architectural traps to avoid. Level-aware." />
            <SkillCard cmd="/validate" name="Idea Validator" file="idea-validator.ts" desc="Searches for competitors and returns a validation matrix — threats, gap, execution risks, and a one-line verdict." />
            <SkillCard cmd="/research" name="Research Agent" file="research-agent.ts" desc="Deep technical briefing on any topic. Saves the report to memory/research_<topic>.md as Markdown." />
            <SkillCard cmd="/hunt" name="Customer Finder" file="customer-finder.ts" desc="Sequential Reddit + IndieHackers hunt. Three archetypes extracted, written to memory/customers.md. Human jitter between requests." />
            <SkillCard cmd="/outreach" name="Outreach Writer" file="outreach-writer.ts" desc="Reads customers.md, drafts one cold DM per archetype. Founder-to-founder tone, under four sentences each." />
            <SkillCard cmd="/launch" name="Launch Kit" file="launch-sequence.ts" desc="Generates copy-paste launch assets for Product Hunt, Show HN, Twitter/X thread, and Reddit. Saves to memory/launch_sequence.md." />
            <SkillCard cmd="/anchor" name="The Anchor" file="anchor.ts" desc="A grounding protocol. Reads your recent progress and writes four sentences of motivation. Use it when you want to quit." />
            <SkillCard cmd="/doctor" name="System Doctor" file="doctor.ts" desc="Seven-point diagnostic — model, RAM, Telegram token, memory r/w, search layer 1, auth token. Outputs pass/fail." />
            <SkillCard cmd="/standup" name="Daily Standup" file="standup.ts" desc="Reads PROGRESS.md, generates exactly three coding targets for today's session." />
          </motion.div>

          <Callout tone="green">
            <strong className="text-white">Skill discipline:</strong> every skill assumes the user is in motion, not contemplation. No fluff, no corporate softening, no &ldquo;let me know if you need anything else.&rdquo;
          </Callout>
        </div>
      );

    case 'commands':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="06" label="Commands" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            CLI <span className="text-[#FF4500]">Commands</span>
          </h2>
          <p className="text-gray-300">
            Thirteen first-class commands. Three for setup, nine for execution, one for the Telegram bot. Each runs as a standalone process — no implicit state beyond <code className="text-[#FF4500]">memory/</code> files on disk.
          </p>

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Setup</h3>
          <CommandTable
            rows={[
              { cmd: 'cook onboard', desc: 'Run initial setup and write profile.md, idea.md, status.md.' },
              { cmd: 'cook doctor', desc: 'Seven-point diagnostic — model, RAM, Telegram, memory, search, auth.' },
              { cmd: 'cook chat', desc: 'Open the local terminal (TUI) with slash routing and 20-turn memory.' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Skills</h3>
          <CommandTable
            rows={[
              { cmd: 'cook hunt', desc: 'Find leads on Reddit / IndieHackers. Writes customers.md.' },
              { cmd: 'cook truth', desc: 'Honest reality-check and breakdown on current progress.' },
              { cmd: 'cook decide', desc: 'Socratic architectural partner for trade-off paralysis.' },
              { cmd: 'cook blueprint', desc: 'Generate stack, 48h execution order, architectural traps.' },
              { cmd: 'cook validate', desc: 'Competitor scan and market gap validation.' },
              { cmd: 'cook research', desc: 'Deep technical briefing on any topic. Persisted to memory/.' },
              { cmd: 'cook outreach', desc: 'Personalized cold DM drafts per customer archetype.' },
              { cmd: 'cook launch', desc: 'Product Hunt / Show HN / Twitter / Reddit launch dossier.' },
              { cmd: 'cook anchor', desc: 'Motivation protocol grounded in your shipped code.' },
            ]}
          />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4500]">Bot</h3>
          <CommandTable
            rows={[
              { cmd: 'cook serve:telegram', desc: 'Start the Telegram long-polling bot. Requires TELEGRAM_BOT_TOKEN in .env.' },
              { cmd: 'cook approve <code>', desc: 'Pair an unauthorized Telegram chat ID using a pending pairing code.' },
            ]}
          />

          <Callout tone="orange">
            Inside the TUI, every skill above is also invokable as a <code className="text-[#FF4500]">/slash</code> command. Press <code className="text-[#FF4500]">/exit</code> to leave the chat.
          </Callout>
        </div>
      );

    case 'sandbox':
      return (
        <div className="flex flex-col gap-6">
          <DocHeader index="07" label="Sandbox" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl md:text-4xl">
            Sandbox <span className="text-[#FF4500]">Environment</span>
          </h2>
          <p className="text-gray-300">
            All data channels operate inside strict process paths and explicit workspace parameters to stop directory-traversal exploits or unauthorized script manipulation.
            The agent never gets raw shell execution on your machine — every action flows through the typed router in{' '}
            <code className="text-[#FF4500]">packages/core/src/sandbox.ts</code> and reads only what <code className="text-[#FF4500]">profile.md</code> authorizes.
          </p>
          <div className="flex items-start gap-4 border border-[#00FF41]/30 bg-[#00FF41]/5 p-5">
            <Shield size={22} className="shrink-0 text-[#00FF41]" />
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="font-black uppercase tracking-widest text-white">Process Boundaries Active</div>
              <p className="leading-relaxed text-gray-400">
                Search input is sanitized, scraped HTML is funneled through the context condenser before any LLM call, and memory files are write-locked to the agent's working directory.
                API keys live only in <code className="text-[#FF4500]">.env</code>, never in prompts.
              </p>
            </div>
          </div>
          <Callout tone="orange">
            <strong className="text-white">No telemetry, no auto-update, no outbound calls</strong> beyond the model endpoint you configured and the search layer you selected. Audit with <code className="text-[#FF4500]">cook doctor</code>.
          </Callout>
        </div>
      );

    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────
 *  Doc helpers
 * ───────────────────────────────────────────────────────────────────── */
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
          <span className={`shrink-0 ${colorClass(line.color)}`}>{line.c}</span>
          <span className={`break-all ${colorClass(line.color)}`}>{line.t}</span>
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
    <motion.div
      variants={cardVariant}
      className="group relative flex flex-col gap-2 overflow-hidden border border-gray-800 bg-black/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF4500]/70 hover:shadow-[0_0_18px_rgba(255,69,0,0.18)]"
    >
      <div className="flex items-center justify-between">
        <code className="text-sm font-black text-[#FF4500]">{cmd}</code>
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{file}</span>
      </div>
      <h4 className="text-xs font-black uppercase tracking-wide text-white">{name}</h4>
      <p className="text-xs leading-relaxed text-gray-500 transition-all group-hover:text-gray-300">{desc}</p>
    </motion.div>
  );
}

function CommandTable({ rows }: { rows: { cmd: string; desc: string }[] }) {
  return (
    <motion.div
      variants={cardVariant}
      className="flex flex-col divide-y divide-gray-800 border border-gray-800 bg-black/50"
    >
      {rows.map((row) => (
        <div key={row.cmd} className="flex flex-col gap-1 px-4 py-3 transition-all hover:bg-black/70 md:flex-row md:items-center md:gap-4">
          <code className="shrink-0 font-mono text-xs font-black text-[#FF4500] md:w-56">{row.cmd}</code>
          <span className="text-xs leading-relaxed text-gray-400">{row.desc}</span>
        </div>
      ))}
    </motion.div>
  );
}

// `cardStagger` is wired to the parent grid containers in `LandingPage`
// (What It Does + Under The Hood) and to the docs Skill grid; the child
// cards inherit the `show` state through Framer Motion's variant tree.
