"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  RenderTarget,
  useIsStaticRenderer,
  ControlType,
  addPropertyControls,
} from "@/lib/framer-compat";

const AURORA =
  "conic-gradient(from 0deg at 50% 50%, #a05cff 0deg, #ff5fa2 72deg, #38e0d0 144deg, #4d7cff 216deg, #ffd166 288deg, #a05cff 360deg)";
const STYLE_ID = "rifat-ai-css-v1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap');

@keyframes aura-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.055); } }
@keyframes aura-spin { to { transform: rotate(360deg); } }
@keyframes aura-dots { 0%,60%,100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }
@keyframes aura-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes aura-glowpulse { 0%,100% { opacity: .7; } 50% { opacity: 1; } }
.aura-close { transition: border-color .18s ease; }
.aura-close:hover { border-color: var(--aura-glass-brd2) !important; }
.aura-chip { transition: transform .18s ease, border-color .18s ease; }
.aura-chip:hover { border-color: rgba(160,92,255,0.6) !important; transform: translateY(-1px) !important; }
.aura-send { transition: transform .18s ease, opacity .18s ease; }
.aura-send:hover:not(:disabled) { transform: translateY(-1px) scale(1.04) !important; }
.aura-send:disabled { opacity: 0.5; cursor: not-allowed !important; }
.aura-launcher .aura-lbl { transition: opacity .3s ease, transform .3s ease; }
.aura-launcher:hover .aura-lbl { opacity: 1 !important; transform: translateY(-50%) translateX(0) !important; }
.aura-scroll::-webkit-scrollbar { width: 6px; }
.aura-scroll::-webkit-scrollbar-thumb { background: var(--aura-glass-brd2); border-radius: 3px; }
`;

type ThemeVars = { [key: string]: string };

const THEMES: { dark: ThemeVars; light: ThemeVars } = {
  dark: {
    "--aura-stage": "#08090f",
    "--aura-text": "#eef0f8",
    "--aura-muted": "rgba(238,240,248,0.55)",
    "--aura-glass": "rgba(16,18,30,0.62)",
    "--aura-glass-brd": "rgba(255,255,255,0.10)",
    "--aura-glass-brd2": "rgba(255,255,255,0.16)",
    "--aura-bubble-ai": "rgba(255,255,255,0.06)",
    "--aura-pill": "rgba(255,255,255,0.045)",
    "--aura-pill-brd": "rgba(255,255,255,0.11)",
    "--aura-input": "rgba(255,255,255,0.05)",
  },
  light: {
    "--aura-stage": "#eceef6",
    "--aura-text": "#13141d",
    "--aura-muted": "rgba(19,20,29,0.55)",
    "--aura-glass": "rgba(255,255,255,0.66)",
    "--aura-glass-brd": "rgba(19,20,29,0.08)",
    "--aura-glass-brd2": "rgba(19,20,29,0.12)",
    "--aura-bubble-ai": "rgba(19,20,29,0.05)",
    "--aura-pill": "rgba(19,20,29,0.035)",
    "--aura-pill-brd": "rgba(19,20,29,0.10)",
    "--aura-input": "rgba(19,20,29,0.04)",
  },
};

function injectOnce(id: string, make: () => HTMLElement) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = make();
  el.id = id;
  document.head.appendChild(el);
}

function useAuraAssets() {
  React.useEffect(() => {
    injectOnce(STYLE_ID, () => {
      const el = document.createElement("style");
      el.textContent = CSS;
      return el;
    });
  }, []);
}

const DISPLAY_FONT = "'Space Grotesk', system-ui, sans-serif";
const BODY_FONT = "'Instrument Sans', system-ui, sans-serif";

// Spinning aurora avatar disc used in header, idle state, and AI bubbles.
function Avatar({
  size,
  glow,
  isStatic,
}: {
  size: number;
  glow?: boolean;
  isStatic?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: glow
          ? `0 0 ${size * 0.4}px -2px rgba(160,92,255,0.75)`
          : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-30%",
          background: AURORA,
          animation: isStatic ? "none" : "aura-spin 7s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.5), transparent 55%)",
        }}
      />
    </div>
  );
}

interface Message {
  text: string;
  isUser: boolean;
  isAI: boolean;
}

export interface RifatAIChatProps {
  assistantName?: string;
  greeting?: string;
  subtitle?: string;
  statusLabel?: string;
  suggestions?: Array<{ text: string }>;
  theme?: "dark" | "light";
  position?: "right" | "left";
  magnetism?: number;
  speed?: number;
  apiEndpoint?: string;
  style?: React.CSSProperties;
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 74
 * @framerIntrinsicHeight 74
 */
export default function RifatAIChat(props: RifatAIChatProps) {
  const {
    assistantName = "RIFAT Ai",
    greeting = "Hi, I'm RIFAT Ai",
    subtitle = "Ask me about Rifat, his work, projects, skills or how he can help.",
    statusLabel = "AI Assistant · online",
    suggestions = [
      { text: "What does Rifat do?" },
      { text: "Show me Rifat's projects" },
      { text: "What skills does Rifat have?" },
      { text: "How can I work with Rifat?" },
    ],
    theme = "dark",
    position = "right",
    magnetism = 0.5,
    speed = 1,
    apiEndpoint = "/api/chat",
    style,
  } = props;

  const name = assistantName || "RIFAT Ai";
  const isCanvas = RenderTarget.current() === RenderTarget.canvas;
  const isStatic = useIsStaticRenderer();
  const isLeft = position === "left";

  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const orbRef = React.useRef<HTMLCanvasElement | null>(null);
  const waveRef = React.useRef<HTMLCanvasElement | null>(null);
  const magRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const magnetismRef = React.useRef(magnetism);
  const speedRef = React.useRef(speed);
  const waveActiveRef = React.useRef(false);
  const openRef = React.useRef(open);

  magnetismRef.current = magnetism;
  speedRef.current = speed;
  openRef.current = open;

  useAuraAssets();

  const showIdle = messages.length === 0 && !typing;

  // Real AI Send Handler with Gemini API Route Integration
  async function send(textToSend?: string) {
    const v = (textToSend !== undefined ? textToSend : input).trim();
    if (!v || isCanvas || typing) return;

    const currentHistory = [...messages];
    const userMsg: Message = { text: v, isUser: true, isAI: false };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: v,
          history: currentHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiReplyText =
        data?.answer ||
        "Looks like I'm having a connection issue right now. You can still reach Rifat directly through the contact links.";

      setMessages((prev) => [
        ...prev,
        { text: aiReplyText, isUser: false, isAI: true },
      ]);
    } catch (err) {
      console.error("[RIFAT Ai Chat Error]", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "Looks like I'm having a connection issue right now. You can still reach Rifat directly through the contact links.",
          isUser: false,
          isAI: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function toggleOpen() {
    setOpen((o) => !o);
  }

  // Keep the message list pinned to the newest message.
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Focus the input shortly after the panel finishes opening.
  React.useEffect(() => {
    if (open && !isCanvas) {
      const t = setTimeout(() => inputRef.current?.focus(), 420);
      return () => clearTimeout(t);
    }
  }, [open, isCanvas]);

  // ---- canvas plasma orb + input waveform + magnetic cursor ----
  React.useEffect(() => {
    const dpr = Math.min(
      (typeof window !== "undefined" && window.devicePixelRatio) || 1,
      2
    );
    function setup(c: HTMLCanvasElement | null, w: number, h: number) {
      if (!c) return null;
      c.width = w * dpr;
      c.height = h * dpr;
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w, h };
    }
    const orb = setup(orbRef.current, 74, 74);
    const wave = setup(waveRef.current, 30, 22);

    const blobs = [
      { c: [255, 95, 162], sx: 0.7, sy: 0.9, rx: 0.2, ry: 0.22, p: 0.0, p2: 1.2 },
      { c: [160, 92, 255], sx: -0.6, sy: 0.7, rx: 0.24, ry: 0.18, p: 2.1, p2: 0.4 },
      { c: [77, 124, 255], sx: 0.9, sy: -0.8, rx: 0.18, ry: 0.24, p: 4.0, p2: 2.7 },
      { c: [56, 224, 208], sx: -0.8, sy: -0.6, rx: 0.22, ry: 0.2, p: 1.1, p2: 3.9 },
      { c: [255, 209, 102], sx: 0.5, sy: 0.6, rx: 0.16, ry: 0.16, p: 3.3, p2: 5.1 },
    ];
    const parts: any[] = [];
    for (let i = 0; i < 12; i++) {
      parts.push({
        r: 0.12 + (i % 5) * 0.06,
        s: 0.5 + (i % 4) * 0.45 * (i % 2 ? 1 : -1),
        p: i * 0.9,
        sz: 0.7 + (i % 3) * 0.5,
        a: 0.35 + (i % 4) * 0.14,
      });
    }

    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let waveAmp = 0.28;
    let raf = 0;

    function onMove(e: MouseEvent) {
      const el = magRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      const range = 200;
      const strength =
        magnetismRef.current != null ? magnetismRef.current : 0.5;
      if (d < range) {
        const f = (1 - d / range) * strength;
        tmx = dx * f;
        tmy = dy * f;
      } else {
        tmx = 0;
        tmy = 0;
      }
    }

    function roundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawOrb(t: number) {
      if (!orb) return;
      const { ctx, w, h } = orb;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#07060f";
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b) => {
        const bx = w / 2 + Math.sin(t * b.sx + b.p) * w * b.rx;
        const by = h / 2 + Math.cos(t * b.sy + b.p2) * h * b.ry;
        const rad = w * 0.45;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
        g.addColorStop(
          0,
          `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.85)`
        );
        g.addColorStop(
          0.55,
          `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.35)`
        );
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      parts.forEach((p) => {
        const a = t * p.s + p.p;
        const dist = w * p.r;
        const px = w / 2 + Math.cos(a) * dist;
        const py = h / 2 + Math.sin(a) * dist;
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.beginPath();
        ctx.arc(px, py, p.sz, 0, Math.PI * 2);
        ctx.fill();
      });

      const sheen = ctx.createRadialGradient(
        w * 0.35,
        h * 0.3,
        0,
        w * 0.35,
        h * 0.3,
        w * 0.5
      );
      sheen.addColorStop(0, "rgba(255,255,255,0.45)");
      sheen.addColorStop(0.4, "rgba(255,255,255,0.08)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawWave(t: number) {
      if (!wave) return;
      const { ctx, w, h } = wave;
      ctx.clearRect(0, 0, w, h);
      const targetAmp = waveActiveRef.current ? 0.95 : 0.28;
      waveAmp += (targetAmp - waveAmp) * 0.12;
      const count = 4;
      const gap = 3;
      const bw = (w - (count - 1) * gap) / count;

      for (let i = 0; i < count; i++) {
        const phase = i * 0.9 + t * 4.5;
        const sin = Math.sin(phase);
        const norm = (sin + 1) / 2;
        const amp = 0.2 + norm * 0.75 * waveAmp;
        const x = i * (bw + gap);

        const g = ctx.createLinearGradient(0, h, 0, 0);
        g.addColorStop(0, "rgba(160,92,255,0.5)");
        g.addColorStop(1, "rgba(56,224,208,0.95)");
        ctx.fillStyle = g;

        const bh = Math.max(2, amp * h);
        roundRect(ctx, x, (h - bh) / 2, bw, bh, 1.2);
        ctx.fill();
      }
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const spd = speedRef.current != null ? speedRef.current : 1;
      const t = (now / 1000) * spd;
      const ttx = openRef.current ? 0 : tmx;
      const tty = openRef.current ? 0 : tmy;
      mx += (ttx - mx) * 0.12;
      my += (tty - my) * 0.12;
      if (magRef.current) {
        magRef.current.style.transform = `translate(${mx.toFixed(2)}px, ${my.toFixed(2)}px)`;
      }
      drawOrb(t);
      drawWave(t);
    }

    if (isStatic) {
      drawOrb(0);
      drawWave(0);
      return;
    }

    if (!isCanvas && typeof window !== "undefined") {
      window.addEventListener("mousemove", onMove);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", onMove);
      }
    };
  }, [isCanvas, isStatic]);

  const themeVars = THEMES[theme === "light" ? "light" : "dark"];
  const side = isLeft ? { left: 28 } : { right: 28 };
  const panelSide = isLeft ? { left: 28 } : { right: 28 };

  const rootStyle: React.CSSProperties = {
    position: isCanvas ? "relative" : "fixed",
    inset: isCanvas ? undefined : 0,
    width: isCanvas ? "100%" : undefined,
    height: isCanvas ? "100%" : undefined,
    minHeight: isCanvas ? 620 : undefined,
    pointerEvents: isCanvas ? "auto" : "none",
    fontFamily: BODY_FONT,
    color: "var(--aura-text)",
    zIndex: isCanvas ? undefined : 999999,
    ...(themeVars as React.CSSProperties),
    ...style,
  };

  const resolvedGreeting = greeting || `Hi, I'm ${name}`;
  const chips: Array<{ text: string }> =
    Array.isArray(suggestions) && suggestions.length > 0 ? suggestions : [];

  const content = (
    <div style={rootStyle}>
      {/* ===================== CHAT PANEL ===================== */}
      <div
        role="dialog"
        aria-label={`${name} AI assistant`}
        style={{
          position: "absolute",
          bottom: 112,
          ...panelSide,
          zIndex: 999999,
          width: "min(384px, calc(100vw - 44px))",
          height: "min(566px, 76vh)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 26,
          overflow: "hidden",
          background: "var(--aura-glass)",
          backdropFilter: "blur(26px) saturate(1.5)",
          WebkitBackdropFilter: "blur(26px) saturate(1.5)",
          border: "1px solid var(--aura-glass-brd2)",
          boxShadow:
            "0 30px 80px -20px rgba(10,6,30,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset",
          transformOrigin: isLeft ? "bottom left" : "bottom right",
          opacity: open ? 1 : 0,
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(18px) scale(0.92)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity .45s cubic-bezier(.2,.9,.25,1), transform .55s cubic-bezier(.2,.9,.25,1)",
        }}
      >
        {/* Panel Ambient Aurora */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-40%",
            left: "-20%",
            width: "140%",
            height: "120%",
            background: AURORA,
            filter: "blur(60px)",
            opacity: 0.16,
            animation: isStatic ? "none" : "aura-spin 26s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 16px 14px",
            borderBottom: "1px solid var(--aura-glass-brd)",
          }}
        >
          <Avatar size={38} glow isStatic={isStatic} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 15,
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--aura-muted)",
                marginTop: 2,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#38e0d0",
                  boxShadow: "0 0 6px #38e0d0",
                }}
              />
              {statusLabel}
            </div>
          </div>
          <button
            className="aura-close"
            onClick={toggleOpen}
            aria-label="Close chat"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid var(--aura-glass-brd)",
              background: "var(--aura-input)",
              color: "var(--aura-text)",
              fontSize: 17,
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          className="aura-scroll"
          style={{
            position: "relative",
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px 8px",
          }}
        >
          {showIdle && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "24px 8px 16px",
                animation: isStatic ? "none" : "aura-in .5s ease both",
              }}
            >
              <Avatar size={54} glow isStatic={isStatic} />
              <div
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 18,
                  marginTop: 14,
                  lineHeight: 1.25,
                }}
              >
                {resolvedGreeting}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--aura-muted)",
                  marginTop: 6,
                  maxWidth: 260,
                  lineHeight: 1.45,
                }}
              >
                {subtitle}
              </div>

              {chips.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    width: "100%",
                    marginTop: 22,
                  }}
                >
                  {chips.map((chip, idx) => (
                    <button
                      key={idx}
                      className="aura-chip"
                      onClick={() => send(chip.text)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 14,
                        border: "1px solid var(--aura-pill-brd)",
                        background: "var(--aura-pill)",
                        color: "var(--aura-text)",
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        lineHeight: 1.3,
                      }}
                    >
                      <span>{chip.text}</span>
                      <span
                        style={{
                          opacity: 0.45,
                          fontSize: 14,
                          marginLeft: 8,
                        }}
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((m, i) =>
            m.isAI ? (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-end",
                  margin: "0 0 14px",
                  animation: isStatic ? "none" : "aura-in .4s ease both",
                }}
              >
                <Avatar size={26} isStatic={isStatic} />
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "11px 14px",
                    borderRadius: "16px 16px 16px 5px",
                    background: "var(--aura-bubble-ai)",
                    border: "1px solid var(--aura-glass-brd)",
                    color: "var(--aura-text)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ) : (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  margin: "0 0 14px",
                  animation: isStatic ? "none" : "aura-in .4s ease both",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "11px 14px",
                    borderRadius: "16px 16px 5px 16px",
                    background: "linear-gradient(135deg,#a05cff,#4d7cff)",
                    color: "#fff",
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: "0 8px 20px -8px rgba(120,80,255,0.7)",
                    wordBreak: "break-word",
                  }}
                >
                  {m.text}
                </div>
              </div>
            )
          )}

          {typing && (
            <div
              style={{
                display: "flex",
                gap: 9,
                alignItems: "flex-end",
                margin: "0 0 14px",
              }}
            >
              <Avatar size={26} isStatic={isStatic} />
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  padding: "14px 15px",
                  borderRadius: "16px 16px 16px 5px",
                  background: "var(--aura-bubble-ai)",
                  border: "1px solid var(--aura-glass-brd)",
                }}
              >
                {[0, 0.18, 0.36].map((delay, i) => (
                  <span
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--aura-muted)",
                      animation: isStatic
                        ? "none"
                        : `aura-dots 1.3s infinite ${delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ position: "relative", padding: "12px 14px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 6px 6px 16px",
              borderRadius: 16,
              border: "1px solid var(--aura-glass-brd2)",
              background: "var(--aura-input)",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              disabled={typing}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !typing) {
                  e.preventDefault();
                  send();
                }
              }}
              onFocus={() => {
                waveActiveRef.current = true;
              }}
              onBlur={() => {
                waveActiveRef.current = false;
              }}
              placeholder={`Ask ${name} anything...`}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--aura-text)",
                fontFamily: BODY_FONT,
                fontSize: 14,
              }}
            />
            <canvas
              ref={waveRef}
              width={30}
              height={22}
              style={{ width: 30, height: 22, opacity: 0.9 }}
            />
            <button
              className="aura-send"
              disabled={typing || !input.trim()}
              onClick={() => send()}
              aria-label="Send"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: "none",
                cursor: typing ? "not-allowed" : "pointer",
                flexShrink: 0,
                background:
                  "linear-gradient(135deg,#ff5fa2,#a05cff,#4d7cff)",
                color: "#fff",
                fontSize: 18,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px -6px rgba(160,92,255,0.9)",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      {/* ===================== LAUNCHER ===================== */}
      <button
        className="aura-launcher"
        onClick={toggleOpen}
        aria-label={
          open ? `Close ${name} chat` : `Open ${name} AI chat`
        }
        style={{
          position: "absolute",
          bottom: 28,
          ...side,
          zIndex: 999999,
          width: 74,
          height: 74,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          pointerEvents: "auto",
          transform: open ? "scale(0.85)" : "scale(1)",
          transition: "transform .4s cubic-bezier(.2,.9,.25,1)",
        }}
      >
        {/* Hover label — only while closed */}
        {!open && (
          <span
            className="aura-lbl"
            style={{
              position: "absolute",
              ...(isLeft ? { left: 86 } : { right: 86 }),
              top: "50%",
              transform: "translateY(-50%) translateX(10px)",
              opacity: 0,
              whiteSpace: "nowrap",
              padding: "9px 15px",
              borderRadius: 999,
              background: "var(--aura-glass)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid var(--aura-glass-brd2)",
              fontFamily: DISPLAY_FONT,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--aura-text)",
              pointerEvents: "none",
            }}
          >
            Ask {name}
          </span>
        )}

        <div
          ref={magRef}
          style={{
            position: "relative",
            width: 74,
            height: 74,
            willChange: "transform",
          }}
        >
          {/* Spinning aurora glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -11,
              borderRadius: "50%",
              background: AURORA,
              filter: "blur(15px)",
              opacity: 0.85,
              animation: isStatic
                ? "none"
                : "aura-spin 6s linear infinite, aura-glowpulse 4s ease-in-out infinite",
            }}
          />
          {/* Breathing plasma orb */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              animation: isStatic
                ? "none"
                : "aura-breathe 5s ease-in-out infinite",
              willChange: "transform",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow:
                  "0 10px 30px -6px rgba(120,60,255,0.6), inset 0 1px 6px rgba(255,255,255,0.35)",
              }}
            >
              <canvas
                ref={orbRef}
                width={74}
                height={74}
                style={{
                  width: 74,
                  height: 74,
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );

  if (!isCanvas && mounted && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}

// Default Framer Component Props
RifatAIChat.defaultProps = {
  assistantName: "RIFAT Ai",
  greeting: "Hi, I'm RIFAT Ai",
  subtitle: "Ask me about Rifat, his work, projects, skills or how he can help.",
  statusLabel: "AI Assistant · online",
  suggestions: [
    { text: "What does Rifat do?" },
    { text: "Show me Rifat's projects" },
    { text: "What skills does Rifat have?" },
    { text: "How can I work with Rifat?" },
  ],
  theme: "dark",
  position: "right",
  magnetism: 0.5,
  speed: 1,
  apiEndpoint: "/api/chat",
};

// Framer Desktop & Web Property Controls
addPropertyControls(RifatAIChat, {
  assistantName: {
    type: ControlType.String,
    title: "Name",
    defaultValue: "RIFAT Ai",
  },
  greeting: {
    type: ControlType.String,
    title: "Greeting",
    placeholder: "Hi, I'm RIFAT Ai",
    description: "Idle-state heading. Blank uses 'Hi, I'm <Name>'.",
  },
  subtitle: {
    type: ControlType.String,
    title: "Subtitle",
    displayTextArea: true,
    defaultValue: "Ask me about Rifat, his work, projects, skills or how he can help.",
  },
  statusLabel: {
    type: ControlType.String,
    title: "Status",
    defaultValue: "AI Assistant · online",
  },
  suggestions: {
    type: ControlType.Array,
    title: "Suggestions",
    control: {
      type: ControlType.Object,
      controls: {
        text: { type: ControlType.String, defaultValue: "Ask me..." },
      },
    },
    defaultValue: [
      { text: "What does Rifat do?" },
      { text: "Show me Rifat's projects" },
      { text: "What skills does Rifat have?" },
      { text: "How can I work with Rifat?" },
    ],
  },
  theme: {
    type: ControlType.Enum,
    title: "Theme",
    options: ["dark", "light"],
    optionTitles: ["Dark", "Light"],
    displaySegmentedControl: true,
    defaultValue: "dark",
  },
  position: {
    type: ControlType.Enum,
    title: "Position",
    options: ["right", "left"],
    optionTitles: ["Right", "Left"],
    displaySegmentedControl: true,
    defaultValue: "right",
  },
  magnetism: {
    type: ControlType.Number,
    title: "Magnetism",
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.5,
    description: "How strongly the orb leans toward the cursor.",
  },
  speed: {
    type: ControlType.Number,
    title: "Speed",
    min: 0.3,
    max: 2,
    step: 0.1,
    unit: "x",
    defaultValue: 1,
    description: "Animation speed of the orb and waveform.",
  },
  apiEndpoint: {
    type: ControlType.String,
    title: "API Endpoint",
    defaultValue: "/api/chat",
    description: "Backend URL endpoint processing chat requests.",
  },
});
