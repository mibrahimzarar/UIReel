import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useFeatureGraphicStore, EXPORT_PRESETS } from '../../store/useFeatureGraphicStore'
import { DeviceMockup } from './DeviceMockup'
import { getBackgroundStyle } from './BackgroundPicker'
import { FeatureGraphicControls } from './FeatureGraphicControls'

export const FeatureGraphicEditor = () => {
    const store = useFeatureGraphicStore()
    const {
        headline,
        headlineColor,
        selectedPreset,
    } = store

    const selectedPresetData = EXPORT_PRESETS.find(p => p.id === selectedPreset)
    const aspectRatio = selectedPresetData
        ? selectedPresetData.width / selectedPresetData.height
        : 2

    // Get background style
    const bgStyle = getBackgroundStyle(store)

    // Calculate device scale based on canvas size
    const getDeviceScale = () => {
        if (store.deviceType === 'android-tablet') return 0.6
        if (store.deviceType === 'ipad') return 0.55
        if (aspectRatio > 1.5) return 0.6
        return 0.55
    }

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex overflow-hidden">

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

            {/* Mobile Sidebar - Drawer */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 z-50 h-full w-[320px] bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <span className="font-semibold text-white">Settings</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <FeatureGraphicControls />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Canvas Preview Area - Fixed */}
            <div className="flex-1 relative flex items-center justify-center px-8 pb-8 pt-36 md:p-8 overflow-hidden">
                {/* Ambient Background Glow - Elegant Light Colors */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[150px] opacity-70" />
                    <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-rose-300/15 rounded-full blur-[120px] opacity-60" />
                    <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-sky-300/15 rounded-full blur-[100px] opacity-50" />
                </div>
                <div
                    className="relative overflow-hidden rounded-2xl shadow-2xl"
                    style={{
                        aspectRatio: `${selectedPresetData?.width || 1024} / ${selectedPresetData?.height || 500}`,
                        // For landscape (aspect > 1), constrain by width
                        // For portrait (aspect < 1), constrain by height
                        ...(aspectRatio > 1
                            ? { width: 'min(95%, 900px)', maxHeight: '70vh' }
                            : { height: 'min(75vh, 700px)', width: 'min(90%, 500px)' }
                        ),
                    }}
                >
                    {/* Export Canvas */}
                    <div
                        id="feature-graphic-canvas"
                        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
                        style={bgStyle}
                    >
                        {/* Headline */}
                        <AnimatePresence>
                            {headline && (
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute text-center font-bold z-10 px-8"
                                    style={{
                                        top: '8%',
                                        color: headlineColor,
                                        fontSize: aspectRatio > 1.5 ? 'clamp(1.5rem, 4vw, 3rem)' : 'clamp(1.2rem, 3vw, 2rem)',
                                        textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                        maxWidth: '90%',
                                    }}
                                >
                                    {headline}
                                </motion.h1>
                            )}
                        </AnimatePresence>

                        {/* Device Mockup */}
                        <div
                            className="relative z-20"
                            style={{
                                transform: headline ? 'translateY(8%)' : 'translateY(0)',
                                transition: 'transform 0.3s ease',
                            }}
                        >
                            <DeviceMockup scale={getDeviceScale()} />
                        </div>
                    </div>


                </div>
            </div>

            {/* Desktop Sidebar - Static (Hidden on Mobile) */}
            <div className="hidden md:flex w-[380px] bg-black/30 backdrop-blur-xl border-l border-white/10 shadow-2xl flex-col">
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
                <div className="flex-1 overflow-hidden">
                    <FeatureGraphicControls />
                </div>
            </div>
        </div>
    )
}
