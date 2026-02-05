import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export const IntroScreen = () => {
    const { introLogo, introTitle, introSubtitle, scenes, aspectRatio } = useStore()

    // Determine backgound from the FIRST scene for consistency, or active scene
    const firstScene = scenes[0]
    const background = firstScene?.background || "bg-[#0f1218]"

    const isVertical = aspectRatio === '9:16'

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${background}`}>
            {/* Animated Particles/Glow (Optional - borrowing from Layout ambient feel) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`z-10 flex flex-col items-center ${isVertical ? 'gap-6 justify-center h-full pb-0' : 'gap-6'}`}
            >
                {/* Logo Container */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
                    <div className={`rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden ring-1 ring-white/10 ${isVertical ? 'w-32 h-32' : 'w-28 h-28 md:w-36 md:h-36'}`}>
                        {introLogo ? (
                            <img src={introLogo} alt="App Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-4xl font-bold bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                                {introTitle.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2 max-w-md">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className={`${isVertical ? 'text-3xl mt-2 px-4 leading-tight' : 'text-4xl md:text-5xl'} font-bold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent drop-shadow-sm`}
                    >
                        {introTitle}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className={`${isVertical ? 'text-sm px-8' : 'text-lg md:text-xl'} text-white/80 font-medium drop-shadow-md`}
                    >
                        {introSubtitle}
                    </motion.p>
                </div>
            </motion.div>
        </div>
    )
}
