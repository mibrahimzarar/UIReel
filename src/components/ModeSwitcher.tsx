import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { Film, Image } from 'lucide-react'

export type AppMode = 'video' | 'graphic'

interface ModeSwitcherProps {
    mode: AppMode
    onModeChange: (mode: AppMode) => void
}

export const ModeSwitcher = ({ mode, onModeChange }: ModeSwitcherProps) => {
    return (
        <div className="fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
                <button
                    onClick={() => onModeChange('video')}
                    className={clsx(
                        "relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        mode === 'video' ? "text-white" : "text-white/50 hover:text-white/70"
                    )}
                >
                    {mode === 'video' && (
                        <motion.div
                            layoutId="mode-indicator"
                            className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 rounded-xl"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Film size={16} />
                        Motion Video
                    </span>
                </button>
                <button
                    onClick={() => onModeChange('graphic')}
                    className={clsx(
                        "relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        mode === 'graphic' ? "text-white" : "text-white/50 hover:text-white/70"
                    )}
                >
                    {mode === 'graphic' && (
                        <motion.div
                            layoutId="mode-indicator"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-cyan-600/80 rounded-xl"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        <Image size={16} />
                        Feature Graphic
                    </span>
                </button>
            </div>
        </div>
    )
}
