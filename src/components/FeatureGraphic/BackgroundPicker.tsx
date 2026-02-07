import { clsx } from 'clsx'
import { useFeatureGraphicStore, PRESET_GRADIENTS, type PatternType } from '../../store/useFeatureGraphicStore'
import { Palette, Image, Grid3X3, Droplet } from 'lucide-react'
import { useCallback, useRef } from 'react'

// Pattern SVG generators
const patterns: Record<PatternType, string> = {
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='2'/%3E%3C/svg%3E")`,
    circles: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='1'/%3E%3C/svg%3E")`,
}

export const BackgroundPicker = () => {
    const {
        backgroundType,
        backgroundColor,
        backgroundGradient,
        backgroundPattern,
        setBackgroundType,
        setBackgroundColor,
        setBackgroundGradient,
        setBackgroundPattern,
        setBackgroundImage,
    } = useFeatureGraphicStore()

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setBackgroundImage(event.target?.result as string)
                setBackgroundType('image')
            }
            reader.readAsDataURL(file)
        }
    }, [setBackgroundImage, setBackgroundType])

    const tabStyle = (active: boolean) => clsx(
        "flex-1 justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
        active
            ? "bg-white/20 text-white shadow-lg"
            : "text-white/60 hover:text-white/80 hover:bg-white/10"
    )

    return (
        <div className="space-y-4">
            {/* Background Type Tabs */}
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBackgroundType('gradient')} className={tabStyle(backgroundType === 'gradient')}>
                    <Palette size={14} /> Gradient
                </button>
                <button onClick={() => setBackgroundType('solid')} className={tabStyle(backgroundType === 'solid')}>
                    <Droplet size={14} /> Solid
                </button>
                <button onClick={() => setBackgroundType('pattern')} className={tabStyle(backgroundType === 'pattern')}>
                    <Grid3X3 size={14} /> Pattern
                </button>
                <button onClick={() => fileInputRef.current?.click()} className={tabStyle(backgroundType === 'image')}>
                    <Image size={14} /> Image
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
            </div>

            {/* Gradient Picker */}
            {backgroundType === 'gradient' && (
                <div className="grid grid-cols-4 gap-2">
                    {PRESET_GRADIENTS.map((gradient) => (
                        <button
                            key={gradient.id}
                            onClick={() => setBackgroundGradient(gradient.value)}
                            className={clsx(
                                "h-12 rounded-xl transition-all duration-200 hover:scale-105",
                                backgroundGradient === gradient.value
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                                    : "ring-1 ring-white/10"
                            )}
                            style={{ background: gradient.value }}
                            title={gradient.name}
                        />
                    ))}
                </div>
            )}

            {/* Solid Color Picker */}
            {backgroundType === 'solid' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
                        />
                        <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
                            placeholder="#1a1a2e"
                        />
                    </div>
                    {/* Quick Color Palette */}
                    <div className="grid grid-cols-8 gap-1.5">
                        {['#1a1a2e', '#16213e', '#0f0f23', '#1e3a5f', '#2d3436', '#6c5ce7', '#00cec9', '#fd79a8', '#ffeaa7', '#fab1a0', '#55efc4', '#74b9ff'].map((color) => (
                            <button
                                key={color}
                                onClick={() => setBackgroundColor(color)}
                                className={clsx(
                                    "h-8 rounded-lg transition-all hover:scale-110",
                                    backgroundColor === color ? "ring-2 ring-white" : "ring-1 ring-white/10"
                                )}
                                style={{ background: color }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pattern Picker */}
            {backgroundType === 'pattern' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        {(Object.keys(patterns) as PatternType[]).map((pattern) => (
                            <button
                                key={pattern}
                                onClick={() => setBackgroundPattern(pattern)}
                                className={clsx(
                                    "h-16 rounded-xl transition-all duration-200 hover:scale-105 capitalize text-xs text-white/60",
                                    backgroundPattern === pattern
                                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                                        : "ring-1 ring-white/10"
                                )}
                                style={{
                                    background: `${backgroundColor}`,
                                    backgroundImage: patterns[pattern],
                                }}
                            >
                                {pattern}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60">Base Color:</span>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Image Upload Indicator */}
            {backgroundType === 'image' && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-white/40 transition-colors"
                >
                    <Image className="mx-auto mb-2 text-white/40" size={32} />
                    <p className="text-sm text-white/60">Click to upload background image</p>
                </div>
            )}
        </div>
    )
}

// Helper to get background CSS for the canvas
export const getBackgroundStyle = (store: ReturnType<typeof useFeatureGraphicStore.getState>) => {
    switch (store.backgroundType) {
        case 'gradient':
            return { background: store.backgroundGradient }
        case 'solid':
            return { background: store.backgroundColor }
        case 'pattern':
            return {
                background: store.backgroundColor,
                backgroundImage: patterns[store.backgroundPattern],
            }
        case 'image':
            return store.backgroundImage
                ? { backgroundImage: `url(${store.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: store.backgroundColor }
        default:
            return { background: store.backgroundGradient }
    }
}
