
import { clsx } from 'clsx'
import { Palette, Image, Grid3X3, Droplet } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { type PatternType, PRESET_GRADIENTS } from '../store/useFeatureGraphicStore'

// Pattern SVG generators (Shared)
export const patterns: Record<PatternType, string> = {
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'/%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='2'/%3E%3C/svg%3E")`,
    circles: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='1'/%3E%3C/svg%3E")`,
}

export type BackgroundType = 'gradient' | 'solid' | 'pattern' | 'image'

interface GenericBackgroundPickerProps {
    type: BackgroundType
    color: string
    gradient: string
    pattern: PatternType
    image: string | null
    onTypeChange: (type: BackgroundType) => void
    onColorChange: (color: string) => void
    onGradientChange: (gradient: string) => void
    onPatternChange: (pattern: PatternType) => void
    onImageChange: (image: string | null) => void
}

export const GenericBackgroundPicker = ({
    type,
    color,
    gradient,
    pattern,
    onTypeChange,
    onColorChange,
    onGradientChange,
    onPatternChange,
    onImageChange
}: GenericBackgroundPickerProps) => {

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                onImageChange(event.target?.result as string)
                onTypeChange('image')
            }
            reader.readAsDataURL(file)
        }
    }, [onImageChange, onTypeChange])

    const tabStyle = (active: boolean) => clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
        active
            ? "bg-white/20 text-white shadow-lg"
            : "text-white/60 hover:text-white/80 hover:bg-white/10"
    )

    return (
        <div className="space-y-4">
            {/* Background Type Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                <button onClick={() => onTypeChange('gradient')} className={tabStyle(type === 'gradient')}>
                    <Palette size={14} /> Gradient
                </button>
                <button onClick={() => onTypeChange('solid')} className={tabStyle(type === 'solid')}>
                    <Droplet size={14} /> Solid
                </button>
                <button onClick={() => onTypeChange('pattern')} className={tabStyle(type === 'pattern')}>
                    <Grid3X3 size={14} /> Pattern
                </button>
                <button onClick={() => fileInputRef.current?.click()} className={tabStyle(type === 'image')}>
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
            {type === 'gradient' && (
                <div className="grid grid-cols-4 gap-2">
                    {PRESET_GRADIENTS.map((g) => (
                        <button
                            key={g.id}
                            onClick={() => onGradientChange(g.value)}
                            className={clsx(
                                "h-12 rounded-xl transition-all duration-200 hover:scale-105",
                                gradient === g.value
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                                    : "ring-1 ring-white/10"
                            )}
                            style={{ background: g.value }}
                            title={g.name}
                        />
                    ))}
                </div>
            )}

            {/* Solid Color Picker */}
            {type === 'solid' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
                        />
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
                            placeholder="#1a1a2e"
                        />
                    </div>
                    {/* Quick Color Palette */}
                    <div className="grid grid-cols-8 gap-1.5">
                        {['#1a1a2e', '#16213e', '#0f0f23', '#1e3a5f', '#2d3436', '#6c5ce7', '#00cec9', '#fd79a8', '#ffeaa7', '#fab1a0', '#55efc4', '#74b9ff'].map((c) => (
                            <button
                                key={c}
                                onClick={() => onColorChange(c)}
                                className={clsx(
                                    "h-8 rounded-lg transition-all hover:scale-110",
                                    color === c ? "ring-2 ring-white" : "ring-1 ring-white/10"
                                )}
                                style={{ background: c }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pattern Picker */}
            {type === 'pattern' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        {(Object.keys(patterns) as PatternType[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPatternChange(p)}
                                className={clsx(
                                    "h-16 rounded-xl transition-all duration-200 hover:scale-105 capitalize text-xs text-white/60",
                                    pattern === p
                                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                                        : "ring-1 ring-white/10"
                                )}
                                style={{
                                    background: `${color}`,
                                    backgroundImage: patterns[p],
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60">Base Color:</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Image Upload Indicator */}
            {type === 'image' && (
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

export interface BackgroundConfig {
    backgroundType: BackgroundType
    backgroundColor: string
    backgroundGradient: string
    backgroundPattern: PatternType
    backgroundImage: string | null
}

// Helper to get background CSS
export const getBackgroundStyle = (config: BackgroundConfig) => {
    switch (config.backgroundType) {
        case 'gradient':
            return { background: config.backgroundGradient }
        case 'solid':
            return { background: config.backgroundColor }
        case 'pattern':
            return {
                background: config.backgroundColor,
                backgroundImage: patterns[config.backgroundPattern],
            }
        case 'image':
            return config.backgroundImage
                ? { backgroundImage: `url(${config.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: config.backgroundColor }
        default:
            return { background: config.backgroundGradient }
    }
}
