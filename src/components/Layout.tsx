import { useStore, type Scene } from '../store/useStore'
import { ControlPanel } from './ControlPanel'
import { PhoneMockup } from './PhoneMockup'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { IntroScreen } from './IntroScreen'
import { OutroScreen } from './OutroScreen'
import { patterns } from './GenericBackgroundPicker'

// Helper to get background CSS
const getBackgroundStyle = (scene: Scene) => {
    switch (scene.backgroundType) {
        case 'gradient':
            return { background: scene.backgroundGradient }
        case 'solid':
            return { background: scene.backgroundColor }
        case 'pattern':
            return {
                background: scene.backgroundColor,
                backgroundImage: patterns[scene.backgroundPattern],
            }
        case 'image':
            return scene.backgroundImage
                ? { backgroundImage: `url(${scene.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: scene.backgroundColor }
        default:
            return { background: scene.backgroundGradient }
    }
}

export const Layout = () => {
    const { scenes, activeSceneId, lockedDimensions, aspectRatio, fadeEffect } = useStore()
    const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0]
    const { headline, subtitle } = activeScene

    const hasText = headline.trim().length > 0 || subtitle.trim().length > 0

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false)
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [])

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [sidebarOpen])

    if (!mounted) return null

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white overflow-hidden font-sans selection:bg-primary/30">

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/Logo.png" alt="Viewterfy" className="w-9 h-9 rounded-xl shadow-lg" />
                        <div>
                            <span className="font-bold text-base">Viewterfy</span>
                            <p className="text-[10px] text-white/40">Your app in motion</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {sidebarOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar - Only on mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed z-50 h-full w-[320px] border-r border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl flex-col md:hidden flex"
                    >
                        {/* Mobile close button */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <span className="font-semibold">Settings</span>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Control Panel Container */}
                        <div className="flex-1 overflow-hidden">
                            <ControlPanel onClose={() => setSidebarOpen(false)} />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar - Only on desktop */}
            <aside className="hidden md:flex w-[380px] border-r border-white/10 bg-black/30 backdrop-blur-xl z-20 shadow-2xl flex-shrink-0 flex-col">
                {/* Branding Header */}
                <div className="p-5 border-b border-white/10 flex items-center gap-3 gradient-mesh">
                    <div className="relative">
                        <img src="/images/Logo.png" alt="Viewterfy" className="w-11 h-11 rounded-xl shadow-lg" />
                        <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Viewterfy</h1>
                        <p className="text-[11px] text-white/50 font-medium">Your app, beautifully in motion</p>
                    </div>
                </div>

                {/* Control Panel Container */}
                <div className="flex-1 overflow-hidden">
                    <ControlPanel />
                </div>
            </aside>

            {/* Main Stage Area */}
            <main className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 pt-36 md:pt-0">

                {/* Ambient Background Glow - Elegant Light Colors */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[150px] opacity-70" />
                    <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-rose-300/15 rounded-full blur-[120px] opacity-60" />
                    <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-sky-300/15 rounded-full blur-[100px] opacity-50" />
                </div>

                {/* Canvas Stage - What gets recorded */}
                <div
                    id="canvas-stage"
                    className={clsx(
                        "relative shadow-2xl transition-all duration-500 ease-in-out overflow-hidden gradient-border",
                        aspectRatio === '1:1' ? "rounded-2xl md:rounded-3xl" : "rounded-[1.5rem] md:rounded-[2.5rem]",
                        !lockedDimensions && (aspectRatio === '1:1'
                            ? "aspect-square w-[92%] md:w-auto md:h-[88%] max-w-[400px] md:max-w-none md:max-h-[800px]"
                            : "aspect-[9/16] h-[70vh] md:h-[92%] w-auto md:w-auto max-w-[90vw] md:max-w-none")
                    )}
                    style={lockedDimensions ? { width: lockedDimensions.width, height: lockedDimensions.height } : {}}
                >
                    {/* Background - INSIDE canvas-stage */}
                    <div
                        className="absolute inset-0 transition-all duration-700"
                        style={getBackgroundStyle(activeScene)}
                    />

                    {/* Scene Transition Container */}
                    <AnimatePresence mode="wait" initial={false}>
                        {activeSceneId === 'INTRO' ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{
                                    opacity: 0,
                                    scale: 1.02,
                                    filter: "blur(8px)"
                                }}
                                transition={{
                                    duration: 0.7,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className="w-full h-full absolute inset-0 z-20"
                            >
                                <IntroScreen />
                            </motion.div>
                        ) : activeSceneId === 'OUTRO' ? (
                            <motion.div
                                key="outro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full absolute inset-0 z-20"
                            >
                                <OutroScreen />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeSceneId}
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                                transition={{
                                    duration: 0.7,
                                    ease: [0.22, 1, 0.36, 1],
                                    opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                                    filter: { duration: 0.5 }
                                }}
                                className={clsx(
                                    "w-full h-full flex relative",
                                    aspectRatio === '9:16'
                                        ? (hasText ? "flex-col items-center justify-center -translate-y-12 md:-translate-y-16 gap-3 md:gap-4" : "flex-col items-center justify-center")
                                        : (hasText ? "flex-col md:flex-row items-center justify-center p-3 md:p-8 gap-0 md:gap-0" : "flex-row items-center justify-center p-4 md:p-8")
                                )}
                            >

                                {/* Text Area */}
                                {hasText && (
                                    <div className={clsx(
                                        "z-10 flex flex-col justify-center",
                                        aspectRatio === '1:1'
                                            ? "order-2 md:order-1 text-center md:text-left items-center md:items-start w-full md:w-[290px] px-4 md:px-0 md:pr-4 md:ml-12 space-y-1"
                                            : "order-2 text-center items-center px-3 md:px-4 max-w-[85%] md:max-w-[90%] -mt-24 md:-mt-32 space-y-1.5 md:space-y-2"
                                    )}>
                                        {headline && (
                                            <h1 className={clsx(
                                                "font-bold leading-tight tracking-tight drop-shadow-lg",
                                                aspectRatio === '1:1' ? "text-base md:text-3xl" : "text-lg md:text-2xl"
                                            )}>
                                                {headline}
                                            </h1>
                                        )}
                                        {subtitle && (
                                            <p className={clsx(
                                                "font-medium text-white/80 drop-shadow-md",
                                                aspectRatio === '1:1' ? "text-[10px] md:text-base" : "text-[11px] md:text-sm"
                                            )}>
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Phone Mockup */}
                                <div className={clsx(
                                    "relative z-0 transition-all duration-500 flex items-center justify-center",
                                    aspectRatio === '1:1'
                                        ? (hasText ? "order-1 md:order-2 flex-shrink-0 scale-[0.5] md:scale-[0.7]" : "scale-[0.6] md:scale-[0.85]")
                                        : "order-1 flex-1 scale-[0.38] md:scale-[0.55]"
                                )}>
                                    <PhoneMockup />
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FADE OVERLAY - Global Transition Effect */}
                    {/* FADE OVERLAY - Global Transition Effect */}
                    <motion.div
                        key="fade-overlay"
                        className="absolute inset-0 bg-black z-50 pointer-events-none"
                        animate={{
                            opacity: fadeEffect === 'fadeIn' ? 0 :
                                fadeEffect === 'fadeOut' ? 1 :
                                    0
                        }}
                        initial={false}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} // Smooth cubic-bezier
                        style={{
                            // Force opacity 1 initially ONLY if we are starting a fade IN
                            opacity: fadeEffect === 'fadeIn' ? 1 : undefined
                        }}
                    />
                </div>

                {/* Mobile: Quick Action FAB */}

            </main >
        </div >
    )
}
