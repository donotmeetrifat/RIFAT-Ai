"use client";

import * as React from "react"
import { createPortal } from "react-dom"
import { RenderTarget, addPropertyControls, ControlType } from "framer"

// Hardcoded Production Backend API Endpoint on Vercel
const PRODUCTION_API_ENDPOINT = "https://rifat-ai.vercel.app/api/chat"

// Direct remote image URL of Rifat as provided in the task context
const DEFAULT_RIFAT_AVATAR =
  "https://lh3.googleusercontent.com/d/1pObMtZALnLjzEezIr7VNTKuTSqZfMP0j"

export interface RifatAIProps {
  assistantName?: string
  greeting?: string
  subtitle?: string
  statusLabel?: string
  suggestions?: Array<string | { text: string }>
  theme?: "light" | "dark"
  position?: "bottom-right" | "bottom-left" | "right" | "left"
  bottomOffset?: number
  hideFramerBadge?: boolean
  magnetism?: number
  avatarUrl?: string
}

interface Message {
  id: string
  sender: "user" | "assistant"
  text: string
}

// Initial Default Suggestions in First Person
const DEFAULT_SUGGESTIONS = [
  "What do you do?",
  "What are your skills?",
  "Tell me about your projects",
  "How can I contact you?",
]

// Dynamic Follow-Up Questions Engine in First Person
function generateDynamicFollowUps(lastQuery: string): string[] {
  const q = lastQuery.toLowerCase()

  if (q.includes("do") || q.includes("about") || q.includes("who")) {
    return [
      "What are your main skills?",
      "Show me your top projects",
      "How can we collaborate?",
      "What tools do you use?",
    ]
  } else if (
    q.includes("skill") ||
    q.includes("tech") ||
    q.includes("stack") ||
    q.includes("code")
  ) {
    return [
      "Do you build AI applications?",
      "Tell me about your design process",
      "Can I see your GitHub?",
      "What is your specialty?",
    ]
  } else if (
    q.includes("project") ||
    q.includes("work") ||
    q.includes("portfolio") ||
    q.includes("built")
  ) {
    return [
      "What live web apps have you built?",
      "How do you integrate AI?",
      "What is your latest project?",
      "How to reach out to you?",
    ]
  } else if (
    q.includes("contact") ||
    q.includes("hire") ||
    q.includes("email") ||
    q.includes("service")
  ) {
    return [
      "What services do you offer?",
      "Are you available for freelance?",
      "What is your working experience?",
      "What are your core skills?",
    ]
  }

  return [
    "Tell me about your background",
    "What technologies do you use?",
    "What services do you provide?",
    "How can I get in touch?",
  ]
}

const RIFAT_AI_STYLES = `
@keyframes rifat-popIn {
  0% { opacity: 0; transform: scale(0.96) translateY(12px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes rifat-pulseGlow {
  0%, 100% { box-shadow: 0 10px 30px rgba(56, 160, 216, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8); }
  50% { box-shadow: 0 14px 38px rgba(56, 160, 216, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.9); }
}

@keyframes rifat-dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.75); }
  40% { opacity: 1; transform: scale(1.15); }
}

.rifat-ai-root {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

.rifat-ai-root * {
  box-sizing: border-box;
}

/* AUTOMATIC FRAMER FREE BADGE SUPPRESSOR */
#__framer-badge-container,
#framer-badge-container,
[data-framer-badge],
div[id*="framer-badge"],
a[href*="framer.com?utm_campaign="] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* LIGHT THEME WITH #38A0D8 BLUE ACCENT */
.rifat-ai-light {
  --rifat-card-bg: rgba(248, 250, 252, 0.92);
  --rifat-card-border: rgba(255, 255, 255, 0.95);
  --rifat-card-shadow: 0 24px 60px -12px rgba(148, 163, 184, 0.35), 0 0 1px rgba(148, 163, 184, 0.2);
  --rifat-text-main: #1e293b;
  --rifat-text-sub: #64748b;
  
  --rifat-bot-msg-bg: #ffffff;
  --rifat-bot-msg-border: rgba(226, 232, 240, 0.8);
  --rifat-bot-msg-text: #334155;
  
  --rifat-user-msg-bg: #38A0D8;
  --rifat-user-msg-text: #ffffff;
  
  --rifat-chip-bg: rgba(255, 255, 255, 0.95);
  --rifat-chip-border: #e2e8f0;
  --rifat-chip-text: #334155;
  --rifat-chip-hover-bg: #eef8fc;
  --rifat-chip-hover-border: #38A0D8;
  
  --rifat-input-bg: rgba(241, 245, 249, 0.75);
  --rifat-input-border: #e2e8f0;
  --rifat-accent: #38A0D8;
  --rifat-accent-hover: #298ebd;
}

/* DARK THEME WITH #38A0D8 BLUE ACCENT */
.rifat-ai-dark {
  --rifat-card-bg: rgba(15, 23, 42, 0.9);
  --rifat-card-border: rgba(255, 255, 255, 0.12);
  --rifat-card-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.6);
  --rifat-text-main: #f8fafc;
  --rifat-text-sub: #94a3b8;
  
  --rifat-bot-msg-bg: rgba(30, 41, 59, 0.9);
  --rifat-bot-msg-border: rgba(51, 65, 85, 0.8);
  --rifat-bot-msg-text: #f1f5f9;
  
  --rifat-user-msg-bg: #38A0D8;
  --rifat-user-msg-text: #ffffff;
  
  --rifat-chip-bg: rgba(30, 41, 59, 0.85);
  --rifat-chip-border: rgba(51, 65, 85, 0.8);
  --rifat-chip-text: #e2e8f0;
  --rifat-chip-hover-bg: rgba(56, 160, 216, 0.18);
  --rifat-chip-hover-border: #38A0D8;
  
  --rifat-input-bg: rgba(30, 41, 59, 0.7);
  --rifat-input-border: rgba(51, 65, 85, 0.8);
  --rifat-accent: #38A0D8;
  --rifat-accent-hover: #298ebd;
}

.rifat-ai-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.rifat-ai-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.rifat-ai-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 9999px;
}

/* Horizontal Scroll Track for Questions Carousel */
.rifat-ai-scroll-x {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 4px 6px;
}

.rifat-ai-scroll-x::-webkit-scrollbar {
  display: none;
}
`

function useRifatStyleSheet(hideBadge: boolean) {
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const id = "rifat-ai-fade-carousel-styles"
    if (!document.getElementById(id)) {
      const style = document.createElement("style")
      style.id = id
      style.innerHTML = RIFAT_AI_STYLES
      document.head.appendChild(style)
    }

    if (!hideBadge) return

    // JS Observer & Interval to hide Framer Free Badge dynamically
    const hideFramerBadgeElements = () => {
      const targets = document.querySelectorAll(
        "#__framer-badge-container, #framer-badge-container, [data-framer-badge], a[href*='framer.com']"
      )
      targets.forEach((node) => {
        const el = node as HTMLElement
        if (
          el.id?.includes("framer-badge") ||
          el.hasAttribute("data-framer-badge") ||
          el.innerText?.includes("Made in Framer") ||
          (el.tagName === "A" &&
            (el as HTMLAnchorElement).href?.includes("framer.com"))
        ) {
          const container = el.closest("div[style*='fixed']") || el
          container.setAttribute(
            "style",
            "display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;"
          )
        }
      })
    }

    hideFramerBadgeElements()
    const interval = setInterval(hideFramerBadgeElements, 400)
    return () => clearInterval(interval)
  }, [hideBadge])
}

function RifatAvatar({
  src,
  size = 36,
  alt = "Rifat",
}: {
  src: string
  size?: number
  alt?: string
}) {
  const [hasError, setHasError] = React.useState(false)

  if (hasError || !src) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #38A0D8 0%, #298ebd 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: `${Math.round(size * 0.4)}px`,
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(56, 160, 216, 0.25)",
        }}
      >
        R
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
      }}
    />
  )
}

export default function RifatAI(props: RifatAIProps) {
  const {
    assistantName = "RIFAT Ai",
    greeting = "Hey, I'm Rifat!",
    subtitle = "Ask me about my work, skills, projects, or services.",
    statusLabel = "Rifat • online",
    suggestions = DEFAULT_SUGGESTIONS,
    theme = "light",
    position = "bottom-right",
    bottomOffset = 32,
    hideFramerBadge = true,
    magnetism = 0.35,
    avatarUrl = DEFAULT_RIFAT_AVATAR,
  } = props

  useRifatStyleSheet(hideFramerBadge)

  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "greeting-msg",
      sender: "assistant",
      text: `${greeting} ${subtitle}`,
    },
  ])
  const [currentSuggestions, setCurrentSuggestions] = React.useState<
    string[]
  >(suggestions && suggestions.length > 0 ? suggestions.map(s => typeof s === "string" ? s : s.text) : DEFAULT_SUGGESTIONS)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
    const messagesScrollRef = React.useRef<HTMLDivElement | null>(null)
    const [currentTheme, setCurrentTheme] = React.useState<"light" | "dark">(
    theme
  )

  // Drag-to-Scroll & Button Navigation state
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [startX, setStartX] = React.useState(0)
  const [scrollLeftState, setScrollLeftState] = React.useState(0)
  const [hasDragged, setHasDragged] = React.useState(false)

  React.useEffect(() => {
    setCurrentTheme(theme)
  }, [theme])

  const launcherRef = React.useRef<HTMLDivElement | null>(null)
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!launcherRef.current || magnetism <= 0) return
    const rect = launcherRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * magnetism
    const deltaY = (e.clientY - centerY) * magnetism
    setMouseOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 })
  }

  const chatEndRef = React.useRef<HTMLDivElement | null>(null)
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isLoading, isOpen])

  // Carousel Mouse Drag Handlers
  const handleCarouselMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeftState(scrollContainerRef.current.scrollLeft)
  }

  const handleCarouselMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(x - startX) > 4) {
      setHasDragged(true)
    }
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk
  }

  const handleCarouselMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  // Scroll By Button Helper
  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const amount = direction === "left" ? -180 : 180
    scrollContainerRef.current.scrollBy({
      left: amount,
      behavior: "smooth",
    })
  }

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || isLoading) return

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
    }

    const historyPayload = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }))

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput("")
    setIsLoading(true)

    // Dynamically update follow-up questions in First-Person voice
    const followUps = generateDynamicFollowUps(query)
    setCurrentSuggestions(followUps)

    try {
      const res = await fetch(PRODUCTION_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      const replyText =
        data.answer ||
        data.reply ||
        data.message ||
        "I've received your request! Is there anything else about my work you'd like to know?"

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: replyText,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err: any) {
      console.error("RIFAT Ai Chat API Error:", err)
      const errorDetails = err?.message || String(err)
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `I'm having trouble connecting right now (${errorDetails}). Please try again in a moment, or reach out to me directly!`,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const isLeft = position === "bottom-left" || position === "left";
    const posStyles: React.CSSProperties =
    position === "bottom-left"
      ? { left: "24px", right: "auto" }
      : { right: "24px", left: "auto" }

  const portalContent = (
    <div
      className={`rifat-ai-root rifat-ai-${currentTheme}`}
      style={{
        position: "fixed",
        bottom: `${bottomOffset}px`,
        ...posStyles,
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        alignItems:
          isLeft ? "flex-start" : "flex-end",
        pointerEvents: "auto",
      }}
    >
      {/* Main Chat Window Card */}
      {isOpen && (
        <div
          style={{
            width: "calc(100vw - 32px)",
            maxWidth: "390px",
            height: "550px",
            maxHeight: "calc(100vh - 100px)",
            marginBottom: "16px",
            borderRadius: "28px",
            background: "var(--rifat-card-bg)",
            border: "1px solid var(--rifat-card-border)",
            backdropFilter: "blur(28px) saturate(140%)",
            WebkitBackdropFilter: "blur(28px) saturate(140%)",
            boxShadow: "var(--rifat-card-shadow)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "rifat-popIn 0.25s ease-out forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 22px 14px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <RifatAvatar
                src={avatarUrl}
                size={40}
                alt={assistantName}
              />
              <div>
                <div
                  style={{
                    fontSize: "16.5px",
                    fontWeight: 600,
                    color: "var(--rifat-text-main)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {assistantName}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--rifat-text-sub)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "inline-block",
                    }}
                  />
                  {statusLabel}
                </div>
              </div>
            </div>

            {/* Minimal Close Icon */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close Chat"
              aria-label="Close Chat"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--rifat-text-sub)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.7,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "0.7")
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div
            className="rifat-ai-scrollbar"
            style={{
              flex: 1,
              padding: "8px 20px 8px 20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.sender === "user"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                {msg.sender === "assistant" ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      maxWidth: "92%",
                    }}
                  >
                    <RifatAvatar
                      src={avatarUrl}
                      size={30}
                      alt={assistantName}
                    />
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "18px",
                        background:
                          "var(--rifat-bot-msg-bg)",
                        border: "1px solid var(--rifat-bot-msg-border)",
                        color: "var(--rifat-bot-msg-text)",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                                                whiteSpace: "pre-wrap",
                        boxShadow:
                          "0 2px 8px rgba(0, 0, 0, 0.02)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "10px 18px",
                      borderRadius: "20px",
                      background:
                        "var(--rifat-user-msg-bg)",
                      color: "var(--rifat-user-msg-text)",
                      fontSize: "14px",
                      lineHeight: 1.45,
                      wordBreak: "break-word",
                                                whiteSpace: "pre-wrap",
                      boxShadow:
                        "0 2px 8px rgba(56, 160, 216, 0.25)",
                    }}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginLeft: "40px",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "18px",
                    background: "var(--rifat-bot-msg-bg)",
                    border: "1px solid var(--rifat-bot-msg-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#38A0D8",
                      animation:
                        "rifat-dotPulse 1.4s infinite ease-in-out 0s",
                    }}
                  />
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#298ebd",
                      animation:
                        "rifat-dotPulse 1.4s infinite ease-in-out 0.2s",
                    }}
                  />
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#38A0D8",
                      animation:
                        "rifat-dotPulse 1.4s infinite ease-in-out 0.4s",
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Question Carousel with Smooth Edge Mask Fade */}
          {currentSuggestions.length > 0 && (
            <div
              style={{ padding: "0 14px", position: "relative" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {/* Scroll Left Arrow Button */}
                <button
                  onClick={() => scrollByAmount("left")}
                  title="Scroll left"
                  aria-label="Scroll left"
                  style={{
                    background: "var(--rifat-chip-bg)",
                    border: "1px solid var(--rifat-chip-border)",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    color: "var(--rifat-text-sub)",
                    fontSize: "15px",
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s ease",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "#38A0D8"
                    e.currentTarget.style.color = "#38A0D8"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--rifat-chip-border)"
                    e.currentTarget.style.color =
                      "var(--rifat-text-sub)"
                  }}
                >
                  ‹
                </button>

                {/* Masked Container with Linear Gradient Edge Fade */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    maskImage:
                      "linear-gradient(to right, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0px, black 16px, black calc(100% - 16px), transparent 100%)",
                  }}
                >
                  <div
                    ref={scrollContainerRef}
                    className="rifat-ai-scroll-x"
                    onMouseDown={handleCarouselMouseDown}
                    onMouseMove={handleCarouselMouseMove}
                    onMouseUp={handleCarouselMouseUpOrLeave}
                    onMouseLeave={
                      handleCarouselMouseUpOrLeave
                    }
                    style={{
                      cursor: isDragging
                        ? "grabbing"
                        : "grab",
                      userSelect: "none",
                    }}
                  >
                    {currentSuggestions.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!hasDragged)
                            sendMessage(chip)
                        }}
                        style={{
                          flexShrink: 0,
                          background:
                            "var(--rifat-chip-bg)",
                          border: "1px solid var(--rifat-chip-border)",
                          color: "var(--rifat-chip-text)",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 400,
                          cursor: isDragging
                            ? "grabbing"
                            : "pointer",
                          whiteSpace: "nowrap",
                          transition: "all 0.2s ease",
                          boxShadow:
                            "0 1px 3px rgba(0, 0, 0, 0.02)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.background =
                              "var(--rifat-chip-hover-bg)"
                            e.currentTarget.style.borderColor =
                              "var(--rifat-chip-hover-border)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDragging) {
                            e.currentTarget.style.background =
                              "var(--rifat-chip-bg)"
                            e.currentTarget.style.borderColor =
                              "var(--rifat-chip-border)"
                          }
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scroll Right Arrow Button */}
                <button
                  onClick={() => scrollByAmount("right")}
                  title="Scroll right"
                  aria-label="Scroll right"
                  style={{
                    background: "var(--rifat-chip-bg)",
                    border: "1px solid var(--rifat-chip-border)",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    color: "var(--rifat-text-sub)",
                    fontSize: "15px",
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s ease",
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "#38A0D8"
                    e.currentTarget.style.color = "#38A0D8"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--rifat-chip-border)"
                    e.currentTarget.style.color =
                      "var(--rifat-text-sub)"
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {/* Input Field Capsule */}
          <div
            style={{
              padding: "10px 20px 18px 20px",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--rifat-input-bg)",
                border: "1px solid var(--rifat-input-border)",
                borderRadius: "9999px",
                padding: "5px 6px 5px 18px",
                boxShadow:
                  "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask RIFAT Ai anything..."
                aria-label="Ask RIFAT Ai anything..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--rifat-text-main)",
                  fontSize: "14px",
                }}
              />

              {/* Paper Airplane Send Button in #38A0D8 */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                style={{
                  background:
                    input.trim() && !isLoading
                      ? "var(--rifat-accent)"
                      : "rgba(56, 160, 216, 0.8)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor:
                    input.trim() && !isLoading
                      ? "pointer"
                      : "default",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  boxShadow:
                    "0 2px 8px rgba(56, 160, 216, 0.3)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <div
        ref={launcherRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "relative",
          width: "52px",
          height: "52px",
          cursor: "pointer",
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
          transition:
            mouseOffset.x === 0
              ? "transform 0.4s ease-out"
              : "none",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "rifat-pulseGlow 3s infinite ease-in-out",
          background: "#ffffff",
          border: "2px solid #ffffff",
          boxShadow: "0 10px 30px rgba(148, 163, 184, 0.35)",
        }}
      >
        <RifatAvatar src={avatarUrl} size={48} alt={assistantName} />
      </div>
    </div>
  )

  if (typeof document === "undefined") return null

  if (RenderTarget.current() === RenderTarget.canvas) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minWidth: "52px",
          minHeight: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {portalContent}
      </div>
    )
  }

  return createPortal(portalContent, document.body)
}

addPropertyControls(RifatAI, {
  assistantName: {
    type: ControlType.String,
    title: "Assistant",
    defaultValue: "RIFAT Ai",
  },
  greeting: {
    type: ControlType.String,
    title: "Greeting",
    defaultValue: "Hey, I'm Rifat!",
  },
  subtitle: {
    type: ControlType.String,
    title: "Subtitle",
    defaultValue: "Ask me about my work, skills, projects, or services.",
  },
  statusLabel: {
    type: ControlType.String,
    title: "Status",
    defaultValue: "Rifat • online",
  },
  avatarUrl: {
    type: ControlType.Image,
    title: "Avatar Photo",
    defaultValue: DEFAULT_RIFAT_AVATAR,
  },
  suggestions: {
    type: ControlType.Array,
    control: { type: ControlType.String },
    title: "Suggestions",
    defaultValue: DEFAULT_SUGGESTIONS,
  },
  hideFramerBadge: {
    type: ControlType.Boolean,
    title: "Hide Framer Badge",
    defaultValue: true,
  },
  bottomOffset: {
    type: ControlType.Number,
    title: "Bottom Offset (px)",
    min: 10,
    max: 200,
    step: 2,
    defaultValue: 32,
  },
  theme: {
    type: ControlType.Enum,
    title: "Theme",
    options: ["light", "dark"],
    optionTitles: ["Light Mode (Default)", "Dark Mode"],
    defaultValue: "light",
  },
  position: {
    type: ControlType.Enum,
    title: "Position",
    options: ["bottom-right", "bottom-left"],
    optionTitles: ["Bottom Right", "Bottom Left"],
    defaultValue: "bottom-right",
  },
  magnetism: {
    type: ControlType.Number,
    title: "Magnetism",
    min: 0,
    max: 1,
    step: 0.05,
    defaultValue: 0.35,
  },
})
