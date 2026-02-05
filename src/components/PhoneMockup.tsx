import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { clsx } from 'clsx'
import { useStore } from '../store/useStore'
import { useEffect, useRef, useState } from 'react'

export const PhoneMockup = () => {
    const { isPlaying, aspectRatio, isExporting, setAnimationFinished, resetScrollSignal, scenes, activeSceneId } = useStore()
    const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0]
    const { screenshots, phoneColor, scrollSpeed } = activeScene
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [maxScroll, setMaxScroll] = useState(0)

    // Measure scroll distance
    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current && contentRef.current) {
                const containerHeight = containerRef.current.offsetHeight
                const contentHeight = contentRef.current.offsetHeight
                // Only scroll if content is taller than container
                setMaxScroll(Math.max(0, contentHeight - containerHeight))
            }
        }

        // Wait for images to load ideally, but a timeout helps for now
        const timer = setTimeout(updateHeight, 100)

        // Also observe resizes
        const observer = new ResizeObserver(updateHeight)
        if (contentRef.current) observer.observe(contentRef.current)

        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [screenshots, aspectRatio]) // Recalculate if aspect ratio changes (layout changes)

    const controls = useAnimation()
    const y = useMotionValue(0)

    // Recalculate duration when scroll parameters change (even if not playing)
    useEffect(() => {
        if (maxScroll <= 0) return

        const pxPerSec = Math.max(10, scrollSpeed * 5)
        const duration = pxPerSec > 0 ? maxScroll / pxPerSec : 0

        // Total Sequence = Intro (3s) + Scroll (duration) + Outro (4s)
        // We'll just store the Scroll duration here, or the total?
        // Let's store TOTAL to make it easy for AudioPanel.
        // We need to know if Intro/Outro are enabled.
        const state = useStore.getState()
        const totalDuration = (state.showIntro ? 3 : 0) + duration + 1 + (state.showOutro ? 4 : 0) // +1 for buffers

        if (Math.abs(totalDuration - state.videoDuration) > 0.1) {
            state.setVideoDuration(totalDuration)
        }
    }, [maxScroll, scrollSpeed, activeScene, useStore.getState().showIntro, useStore.getState().showOutro])

    // Handle Play/Pause and Auto-Scroll
    useEffect(() => {
        if (maxScroll <= 0) return

        if (isPlaying) {
            const currentY = y.get()
            const remainingDistance = Math.abs(-maxScroll - currentY)
            const pxPerSec = Math.max(10, scrollSpeed * 5)
            // Safety: avoid division by zero
            const duration = pxPerSec > 0 ? remainingDistance / pxPerSec : 0

            controls.start({
                y: -maxScroll,
                transition: {
                    duration: duration,
                    ease: "linear"
                }
            }).then(() => {
                // Animation completed
                if (isExporting) {
                    setTimeout(() => {
                        setAnimationFinished(true)
                    }, 1000)
                }
                // else if (isPlaying) {
                //     setIsPlaying(false) // Optionally auto-pause at end
                // }
            })
        } else {
            controls.stop()
        }
    }, [isPlaying, maxScroll, scrollSpeed, controls, y, isExporting, setAnimationFinished])

    // Reset when content changes or explicit reset signal
    useEffect(() => {
        controls.stop()
        y.set(0)
    }, [screenshots, aspectRatio, y, resetScrollSignal, controls])

    return (
        <div className="relative group">
            {/* Phone Frame */}
            <div
                className={clsx(
                    "relative w-[300px] h-[600px] rounded-[3rem] border-[8px] bg-black shadow-2xl overflow-hidden z-20 transition-colors duration-500",
                    {
                        'border-gray-900': phoneColor === 'black',
                        'border-slate-300': phoneColor === 'silver',
                        'border-yellow-600/50': phoneColor === 'gold',
                        'border-blue-900': phoneColor === 'blue',
                    }
                )}
                style={{
                    boxShadow: `
                0 0 0 2px ${phoneColor === 'black' ? '#333' : phoneColor === 'silver' ? '#fff' : '#d4af37'}, 
                0 20px 50px -10px rgba(0,0,0,0.5)
            `
                }}
            >
                {/* Notch / Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-30 flex justify-center items-center">
                    <div className="w-20 h-4 bg-black/50 rounded-full" />
                </div>

                {/* Screen Content */}
                <div ref={containerRef} className="w-full h-full bg-gray-800 relative flex flex-col overflow-hidden">
                    {screenshots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/20 p-8 text-center space-y-4">
                            <div className="w-12 h-12 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                                +
                            </div>
                            <p className="text-sm">Upload Screenshots</p>
                        </div>
                    ) : (
                        <motion.div
                            ref={contentRef}
                            className="w-full"
                            style={{ y }}
                            animate={controls}
                        >
                            {screenshots.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`Screen ${i}`}
                                    className="w-full h-auto object-cover block"
                                />
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Screen Glass Reflection (Overlay) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-40 rounded-[2.5rem]" />
            </div>

            {/* Ambient Glow behind phone */}
            <div
                className={clsx(
                    "absolute inset-0 blur-3xl opacity-40 -z-10 transition-colors duration-1000",
                    {
                        'bg-blue-500/30': phoneColor === 'blue',
                        'bg-yellow-500/20': phoneColor === 'gold',
                        'bg-gray-500/20': phoneColor === 'silver',
                        'bg-purple-500/20': phoneColor === 'black',
                    }
                )}
            />
        </div>
    )
}
