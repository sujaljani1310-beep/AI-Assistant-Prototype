"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  ChevronDown,
  Send,
  Mic,
  Settings,
  Menu,
  MessageSquare,
  Zap,
  User,
  Bot,
  Brain,
  Sparkles,
  Code,
  ImageIcon,
  FileText,
  Merge,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Mode = "basic" | "manual" | "auto"
type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  aiModel?: string
}

type Conversation = {
  id: string
  title: string
  preview: string
  messages: Message[]
  lastUpdated: Date
}

type AIModel = {
  id: string
  name: string
  description: string
  icon: any
  color: string
  specialty: string
}

const modes = [
  {
    id: "basic" as Mode,
    label: "Basic Mode",
    description: "Simple conversation & quick research",
    icon: MessageSquare,
    tooltip: "Simple AI chat for everyday questions and quick research",
  },
  {
    id: "manual" as Mode,
    label: "Manual Mode",
    description: "Select from multiple AI models (GPT, Claude, Gemini)",
    icon: User,
    tooltip: "Choose specific AI models for specialized tasks",
  },
  {
    id: "auto" as Mode,
    label: "Auto Mode",
    description: "System auto-selects the best AI for the task",
    icon: Zap,
    tooltip: "AI automatically picks the best model for your request",
  },
]

const aiModels: AIModel[] = [
  {
    id: "gpt4",
    name: "GPT-4",
    description: "Advanced reasoning and complex tasks",
    icon: Brain,
    color: "bg-green-500",
    specialty: "General Intelligence",
  },
  {
    id: "claude",
    name: "Claude",
    description: "Thoughtful analysis and writing",
    icon: FileText,
    color: "bg-orange-500",
    specialty: "Analysis & Writing",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Multimodal understanding",
    icon: Sparkles,
    color: "bg-blue-500",
    specialty: "Multimodal AI",
  },
  {
    id: "codex",
    name: "Codex",
    description: "Code generation and debugging",
    icon: Code,
    color: "bg-purple-500",
    specialty: "Programming",
  },
  {
    id: "dalle",
    name: "DALL-E",
    description: "Image generation and editing",
    icon: ImageIcon,
    color: "bg-pink-500",
    specialty: "Image Creation",
  },
]

export default function AGIInterface() {
  const [selectedMode, setSelectedMode] = useState<Mode>("basic")
  const [previousMode, setPreviousMode] = useState<Mode>("basic")
  const [inputValue, setInputValue] = useState("")
  const [selectedAIs, setSelectedAIs] = useState<string[]>([])
  const [customAIs, setCustomAIs] = useState<AIModel[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState("welcome")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [modeTransitioning, setModeTransitioning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const welcomeConversation: Conversation = {
    id: "welcome",
    title: "Welcome Chat",
    preview: "Hello! How can I assist you today?",
    messages: [
      {
        id: "1",
        content: "Hello! How can I assist you today?",
        sender: "ai",
        timestamp: new Date(),
        aiModel: "GPT-4",
      },
    ],
    lastUpdated: new Date(),
  }

  const activeConversation =
    activeConversationId === "welcome" ? welcomeConversation : conversations.find((c) => c.id === activeConversationId)
  const currentMode = modes.find((m) => m.id === selectedMode)
  const allAIs = [...aiModels, ...customAIs]

  useEffect(() => {
    if (previousMode !== selectedMode) {
      setModeTransitioning(true)
      const timer = setTimeout(() => {
        setModeTransitioning(false)
      }, 500)
      setPreviousMode(selectedMode)
      return () => clearTimeout(timer)
    }
  }, [selectedMode, previousMode])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            setSelectedMode("basic")
            e.preventDefault()
            break
          case "m":
            setSelectedMode("manual")
            e.preventDefault()
            break
          case "a":
            setSelectedMode("auto")
            e.preventDefault()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const getAutoSelectedAI = (message: string) => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes("code") || lowerMessage.includes("program") || lowerMessage.includes("debug")) {
      return "codex"
    }
    if (lowerMessage.includes("image") || lowerMessage.includes("picture") || lowerMessage.includes("draw")) {
      return "dalle"
    }
    if (lowerMessage.includes("analyze") || lowerMessage.includes("write") || lowerMessage.includes("essay")) {
      return "claude"
    }
    if (lowerMessage.includes("multimodal") || lowerMessage.includes("vision")) {
      return "gemini"
    }
    return "gpt4"
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    let aiModel = "GPT-4"
    let responseContent = `I understand you said: "${inputValue}". How can I help you further?`

    if (selectedMode === "auto") {
      const selectedAIId = getAutoSelectedAI(inputValue)
      const selectedAI = allAIs.find((ai) => ai.id === selectedAIId)
      aiModel = selectedAI?.name || "GPT-4"
      responseContent = `[${aiModel} Auto-Selected] ${responseContent}`
    } else if (selectedMode === "manual" && selectedAIs.length > 0) {
      const selectedAI = allAIs.find((ai) => selectedAIs.includes(ai.id))
      aiModel = selectedAI?.name || "GPT-4"
      responseContent = `[${aiModel}] ${responseContent}`
    }

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: responseContent,
      sender: "ai",
      timestamp: new Date(),
      aiModel,
    }

    if (activeConversationId === "welcome") {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: "New Chat",
        preview: inputValue.slice(0, 50) + "...",
        messages: [...welcomeConversation.messages, newMessage, aiResponse],
        lastUpdated: new Date(),
      }
      setConversations((prev) => [newConversation, ...prev])
      setActiveConversationId(newConversation.id)
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, newMessage, aiResponse],
                lastUpdated: new Date(),
              }
            : conv,
        ),
      )
    }

    setInputValue("")
  }

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      preview: "Start a new conversation...",
      messages: [],
      lastUpdated: new Date(),
    }

    setConversations((prev) => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    setSidebarOpen(false)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const toggleAISelection = (aiId: string) => {
    setSelectedAIs((prev) => (prev.includes(aiId) ? prev.filter((id) => id !== aiId) : [...prev, aiId]))
  }

  const handleAddNewAI = () => {
    const newAI: AIModel = {
      id: `custom-${Date.now()}`,
      name: `Custom AI ${customAIs.length + 1}`,
      description: "Your custom AI model",
      icon: Brain,
      color: "bg-cyan-500",
      specialty: "Custom Tasks",
    }
    setCustomAIs((prev) => [...prev, newAI])
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-md border-r border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50">
        <Button onClick={handleNewChat} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <button
          onClick={() => {
            setActiveConversationId("welcome")
            setSidebarOpen(false)
          }}
          className={cn(
            "w-full text-left p-3 rounded-lg transition-colors mt-3",
            "hover:bg-gray-800/50",
            activeConversationId === "welcome" ? "bg-blue-600/20 border border-blue-600/30" : "bg-gray-800/30",
          )}
        >
          <div className="font-medium text-white text-sm truncate">Welcome Chat</div>
          <div className="text-gray-400 text-xs mt-1 truncate">Hello! How can I assist you today?</div>
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setActiveConversationId(conversation.id)
                setSidebarOpen(false)
              }}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                "hover:bg-gray-800/50",
                activeConversationId === conversation.id
                  ? "bg-blue-600/20 border border-blue-600/30"
                  : "bg-gray-800/30",
              )}
            >
              <div className="font-medium text-white text-sm truncate">{conversation.title}</div>
              <div className="text-gray-400 text-xs mt-1 truncate">{conversation.preview}</div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const renderModeSpecificContent = () => {
    const conversationContent = (
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-6 pb-8">
            {activeConversation?.messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-4", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "ai" && (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    {message.aiModel && (
                      <Badge className="mt-1 text-xs bg-gray-700 text-gray-300">{message.aiModel}</Badge>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-2xl p-4 rounded-2xl",
                    message.sender === "user" ? "bg-blue-600 text-white ml-12" : "bg-gray-800/50 text-gray-100",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )

    if (selectedMode === "basic") {
      return <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">{conversationContent}</div>
    }

    if (selectedMode === "manual") {
      return (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6">
              <div className="space-y-6 pb-8">
                {activeConversation?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-4", message.sender === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.sender === "ai" && (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        {message.aiModel && (
                          <Badge className="mt-1 text-xs bg-gray-700 text-gray-300">{message.aiModel}</Badge>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-2xl p-4 rounded-2xl",
                        message.sender === "user" ? "bg-blue-600 text-white ml-12" : "bg-gray-800/50 text-gray-100",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )
    }

    if (selectedMode === "auto") {
      return (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative">
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Auto
            </Badge>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 animate-pulse"
              style={{ animationDuration: "4s" }}
            />
          </div>

          {conversationContent}
        </div>
      )
    }
  }

  const getModeHeader = () => {
    switch (selectedMode) {
      case "basic":
        return {
          text: "Hello Philomath",
          className:
            "text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-1000",
        }
      case "manual":
        return {
          text: "Manual mode on",
          className:
            "text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-1000",
        }
      case "auto":
        return {
          text: "Auto mode on",
          className:
            "text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-1000 auto-text-glow",
          style: {
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(59,130,246,1) 25%, rgba(147,51,234,0.9) 50%, rgba(59,130,246,1) 75%, rgba(255,255,255,0.9) 100%)",
            backgroundSize: "200% 100%",
            animation: "greeting-scan 2s ease-in-out infinite",
          },
        }
      default:
        return {
          text: "Hello Philomath",
          className:
            "text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-1000",
        }
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen text-white relative overflow-hidden transition-all duration-1000",
        selectedMode === "auto"
          ? "bg-gradient-to-br from-slate-900 via-blue-950/50 to-purple-950/30"
          : selectedMode === "manual"
            ? "bg-gradient-to-br from-slate-900 via-orange-950/30 to-black"
            : "bg-gradient-to-br from-slate-900 via-blue-950/30 to-black",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          selectedMode === "auto"
            ? "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),rgba(147,51,234,0.1),transparent_70%)] opacity-100"
            : selectedMode === "manual"
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.15),transparent_50%)] opacity-100"
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] opacity-100",
        )}
      />

      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          animation-delay: 0.8s;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes auto-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
            transform: scale(1);
          }
          50% { 
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5);
            transform: scale(1.02);
          }
        }

        @keyframes auto-sync-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 12px rgba(59,130,246,0.4)) drop-shadow(0 0 24px rgba(59,130,246,0.2));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 20px rgba(59,130,246,0.8)) drop-shadow(0 0 40px rgba(59,130,246,0.4));
            transform: scale(1.03);
          }
        }

        @keyframes auto-text-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2);
            transform: scale(1);
          }
          50% { 
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.9), 0 0 60px rgba(59, 130, 246, 0.6), 0 0 90px rgba(59, 130, 246, 0.3);
            transform: scale(1.02);
          }
        }

        @keyframes status-pulse {
          0%, 100% { 
            opacity: 0.8;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }
          50% { 
            opacity: 1;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(59,130,246,0.4);
          }
        }

        @keyframes mode-transition {
          0% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes logo-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 8px rgba(59,130,246,0.25));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 16px rgba(59,130,246,0.5));
            transform: scale(1.05);
          }
        }

        .auto-logo-glow {
          animation: auto-sync-glow 2s ease-in-out infinite;
        }

        .auto-text-glow {
          animation: auto-text-glow 2s ease-in-out infinite;
        }

        .auto-status-pulse {
          animation: status-pulse 2s ease-in-out infinite;
        }

        .mode-transition {
          animation: mode-transition 0.5s ease-in-out;
        }

        .logo-pulse {
          animation: logo-pulse 0.6s ease-in-out;
        }

        @keyframes greeting-scan {
          0% { 
            opacity: 0.8;
            background-position: -100% 0;
          }
          50% {
            opacity: 1;
            background-position: 100% 0;
          }
          100% { 
            opacity: 0.9;
            background-position: 200% 0;
          }
        }

        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-out-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        
        .sidebar-enter {
          animation: slide-in-left 0.3s ease-out forwards;
        }
        
        .sidebar-exit {
          animation: slide-out-left 0.3s ease-out forwards;
        }
      `}</style>

      <div className="flex h-screen relative">
        <div
          className={cn(
            "hidden md:block fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-out",
            sidebarVisible ? "w-80 sidebar-enter" : "w-0 overflow-hidden",
          )}
        >
          {sidebarVisible && <SidebarContent />}
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80 bg-gray-900/95 backdrop-blur-sm">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-out",
            sidebarVisible ? "md:ml-80" : "ml-0",
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/30 backdrop-blur-md">
            <div className="hidden md:block">
              <Button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                variant="outline"
                size="sm"
                className={cn(
                  "border-blue-500/50 text-blue-400 hover:bg-blue-500/20 bg-transparent transition-all duration-200",
                  !sidebarVisible && "ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20",
                )}
              >
                <Menu className="w-4 h-4 mr-2" />
                {sidebarVisible ? "Hide Chats" : "Show Chats"}
              </Button>
            </div>

            <div className="md:hidden">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 bg-transparent"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Chats
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>

            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400 transition-colors">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-shrink-0 p-8 text-center relative">
              <div className="flex justify-center mb-6">
                <img
                  src="/agi-logo-light.png"
                  alt="AGI"
                  className={cn(
                    "w-9 h-9 md:w-11 md:h-11 object-contain pointer-events-none transition-all duration-1000",
                    "drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]",
                    selectedMode === "auto" && "auto-logo-glow",
                    modeTransitioning && "logo-pulse",
                  )}
                  style={
                    selectedMode === "auto"
                      ? {}
                      : {
                          filter: "drop-shadow(0 0 8px rgba(59,130,246,0.25))",
                        }
                  }
                />
              </div>

              <div className={cn("transition-all duration-500", modeTransitioning && "mode-transition")}>
                <h1 className={getModeHeader().className} style={getModeHeader().style}>
                  {getModeHeader().text}
                </h1>

                <p
                  className={cn(
                    "text-lg text-gray-300 mb-8 transition-all duration-500 opacity-80",
                    selectedMode === "auto" && "auto-status-pulse",
                  )}
                >
                  {modes.find((m) => m.id === selectedMode)?.description}
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <div
                    className={cn(
                      "flex items-center bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-600/50 transition-all duration-300",
                      selectedMode === "auto"
                        ? "focus-within:border-blue-400/90 focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:shadow-xl focus-within:shadow-blue-400/30 border-blue-500/30 shadow-lg shadow-blue-500/20"
                        : selectedMode === "manual"
                          ? "focus-within:border-orange-400/90 focus-within:ring-2 focus-within:ring-orange-400/50 focus-within:shadow-xl focus-within:shadow-orange-400/30 border-orange-500/30 shadow-lg shadow-orange-500/20"
                          : "focus-within:border-blue-500/70 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:shadow-lg focus-within:shadow-blue-500/20",
                    )}
                  >
                    <Button
                      onClick={handleFileUpload}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "ml-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200",
                        selectedMode === "auto" && "text-blue-300 hover:text-blue-200",
                        selectedMode === "manual" && "text-orange-300 hover:text-orange-200",
                      )}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {selectedMode === "manual" ? "Add All Files" : "Add Files"}
                    </Button>

                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={
                        selectedMode === "auto"
                          ? "Ask anything - AI will auto-select the best model..."
                          : selectedMode === "manual"
                            ? "Select AIs below, then ask your question..."
                            : "Ask me anything..."
                      }
                      className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 px-4 py-4 text-lg"
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                          title={currentMode?.tooltip}
                        >
                          <currentMode.icon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                          Mode
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 bg-gray-800/95 backdrop-blur-sm border-gray-700">
                        {modes.map((mode) => (
                          <DropdownMenuItem
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            className={cn(
                              "flex items-start p-3 cursor-pointer",
                              selectedMode === mode.id
                                ? "bg-blue-600/20 text-blue-300"
                                : "text-gray-300 hover:bg-gray-700/50",
                            )}
                            title={mode.tooltip}
                          >
                            <mode.icon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">{mode.label}</div>
                              <div className="text-xs text-gray-400 mt-1">{mode.description}</div>
                              <div className="text-xs text-gray-500 mt-1">Alt+{mode.id.charAt(0).toUpperCase()}</div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      size="sm"
                      className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 mr-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedMode === "manual" && (
                  <div className="mt-4 relative">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 p-2 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/30 overflow-x-auto scrollbar-hide max-w-full">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {allAIs.map((ai) => (
                            <button
                              key={ai.id}
                              onClick={() => toggleAISelection(ai.id)}
                              className={cn(
                                "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group",
                                ai.color,
                                selectedAIs.includes(ai.id)
                                  ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900 shadow-lg shadow-blue-400/30"
                                  : "hover:ring-2 hover:ring-gray-400 hover:ring-offset-1 hover:ring-offset-gray-900 opacity-70 hover:opacity-100",
                              )}
                              title={`${ai.name} - ${ai.description}`}
                            >
                              <ai.icon className="w-4 h-4 text-white" />
                              {selectedAIs.includes(ai.id) && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-gray-900 animate-pulse" />
                              )}

                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {ai.name}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                              </div>
                            </button>
                          ))}

                          {/* Add/Discover AIs button */}
                          <button
                            onClick={handleAddNewAI}
                            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group border-2 border-dashed border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-300"
                            title="Add New AI / Discover AIs"
                          >
                            <Plus className="w-4 h-4" />

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Add New AI
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selection indicator for Manual mode */}
                    {selectedAIs.length > 0 && (
                      <div className="mt-2 flex justify-center">
                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                          <div className="flex items-center gap-2">
                            <Merge className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-400 text-xs">
                              {selectedAIs.length} AI{selectedAIs.length > 1 ? "s" : ""} selected
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {renderModeSpecificContent()}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          console.log("Files selected:", e.target.files)
        }}
      />
    </div>
  )
}
