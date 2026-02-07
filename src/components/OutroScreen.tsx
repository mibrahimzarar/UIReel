import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { QrCode } from 'lucide-react'
import { getBackgroundStyle } from './GenericBackgroundPicker'

export const OutroScreen = () => {
    const { outroQrCode, scenes, aspectRatio } = useStore()

    // Use last scene background for continuity
    const lastScene = scenes[scenes.length - 1]

    const isVertical = aspectRatio === '9:16'
    const isSquare = aspectRatio === '1:1'

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
            style={getBackgroundStyle(lastScene)}
        >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className={`z-10 flex flex-col items-center w-full max-w-lg ${isVertical ? 'gap-6 justify-center h-full pb-0' : isSquare ? 'gap-6' : 'gap-8'}`}
            >
                <div className="space-y-1">
                    <h2 className={`font-bold text-white drop-shadow-md ${isVertical ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>Download Now</h2>
                    <p className={`text-white/80 font-medium drop-shadow-sm ${isVertical ? 'text-sm' : 'text-lg'}`}>Available on iOS and Android</p>
                </div>

                {/* Content Container: Vertical for Phone, Horizontal for Square, Stacked for Landscape */}
                <div className={`flex items-center ${isSquare ? 'flex-row gap-6 mt-2' : 'flex-col gap-6'}`}>

                    {/* QR Code Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="p-1.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
                    >
                        <div className={`bg-white rounded-xl overflow-hidden flex items-center justify-center ${isVertical ? 'w-48 h-48' : isSquare ? 'w-40 h-40' : 'w-48 h-48 md:w-56 md:h-56'}`}>
                            {outroQrCode ? (
                                <img src={outroQrCode} alt="Scan to Download" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-neutral-400">
                                    <QrCode size={isVertical || isSquare ? 40 : 48} />
                                    <span className="text-[10px] font-mono uppercase tracking-widest">Scan QR</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* App Store Badges */}
                    <div className={`flex items-center justify-center ${isVertical ? 'flex-row gap-2 scale-90' : isSquare ? 'flex-col gap-3' : 'flex-col gap-3 max-w-xs'}`}>
                        <img
                            src="/images/IOS Icon.jpeg"
                            alt="Download on App Store"
                            className={`${isSquare ? 'h-10' : 'h-10 md:h-14'} rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg border border-white/10`}
                        />
                        <img
                            src="/images/Android Icon.jpeg"
                            alt="Get it on Google Play"
                            className={`${isSquare ? 'h-10' : 'h-10 md:h-14'} rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg border border-white/10`}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
