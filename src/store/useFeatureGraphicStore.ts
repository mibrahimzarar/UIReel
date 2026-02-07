import { create } from 'zustand'

// Device Types
export type DeviceType = 'iphone' | 'android' | 'ipad' | 'android-tablet'
export type DeviceColor = 'black' | 'silver' | 'gold' | 'blue' | 'purple'
export type BackgroundType = 'gradient' | 'solid' | 'pattern' | 'image'
export type PatternType = 'dots' | 'grid' | 'waves' | 'circles'

// Preset Gradients
export const PRESET_GRADIENTS = [
    // Elegant Collection (Restored)
    { id: 'slate', name: 'Slate', value: 'linear-gradient(135deg, #475569 0%, #1e293b 50%, #000000 100%)' },
    { id: 'twilight', name: 'Twilight', value: 'linear-gradient(135deg, rgba(88, 28, 135, 0.8) 0%, #0f172a 50%, #000000 100%)' },
    { id: 'carbon', name: 'Carbon', value: 'linear-gradient(135deg, #404040 0%, #18181b 50%, #000000 100%)' },
    { id: 'forest', name: 'Forest', value: 'linear-gradient(135deg, #166534 0%, #064e3b 50%, #000000 100%)' },
    { id: 'gold', name: 'Gold', value: 'linear-gradient(135deg, rgba(202, 138, 4, 0.5) 0%, #111827 50%, #000000 100%)' },
    { id: 'velvet', name: 'Velvet', value: 'linear-gradient(225deg, rgba(185, 28, 28, 0.5) 0%, #111827 50%, #000000 100%)' },
    { id: 'cyber', name: 'Cyber', value: 'linear-gradient(45deg, rgba(8, 145, 178, 0.5) 0%, #111827 50%, rgba(147, 51, 234, 0.5) 100%)' },

    // Modern Collection (Filtered)
    { id: 'sunset', name: 'Sunset Glow', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
    // Removed: Ocean, Aurora, Fire
    { id: 'midnight', name: 'Midnight', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
    // Removed: Emerald
    { id: 'rose', name: 'Rose Gold', value: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
    { id: 'cosmic', name: 'Cosmic', value: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)' },
    { id: 'peach', name: 'Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 'electric', name: 'Electric', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { id: 'nord', name: 'Nordic', value: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)' },
    { id: 'lavender', name: 'Lavender', value: 'linear-gradient(135deg, #E8CBC0 0%, #636FA4 100%)' },
]

// Export Ratio Presets
export const EXPORT_PRESETS = [
    { id: 'play-feature', name: 'Play Feature Graphic', width: 1024, height: 500, platform: 'android' },
    { id: 'play-phone', name: 'Play Phone Screenshot', width: 1080, height: 1920, platform: 'android' },
    { id: 'play-tablet-7', name: 'Play Tablet 7"', width: 1920, height: 1200, platform: 'android' },
    { id: 'play-tablet-10', name: 'Play Tablet 10"', width: 2560, height: 1600, platform: 'android' },
    { id: 'ios-65', name: 'iOS 6.5" Display', width: 1242, height: 2688, platform: 'ios' },
    { id: 'ios-55', name: 'iOS 5.5" Display', width: 1242, height: 2208, platform: 'ios' },
    { id: 'ios-ipad', name: 'iOS iPad Pro', width: 2048, height: 2732, platform: 'ios' },
] as const

export type ExportPresetId = typeof EXPORT_PRESETS[number]['id']

// Store State Interface
interface FeatureGraphicState {
    // Screenshot
    screenshot: string | null
    setScreenshot: (url: string | null) => void

    // Device Settings
    deviceType: DeviceType
    deviceColor: DeviceColor
    setDeviceType: (type: DeviceType) => void
    setDeviceColor: (color: DeviceColor) => void

    // Background Settings
    backgroundType: BackgroundType
    backgroundColor: string
    backgroundGradient: string
    backgroundPattern: PatternType
    backgroundImage: string | null
    setBackgroundType: (type: BackgroundType) => void
    setBackgroundColor: (color: string) => void
    setBackgroundGradient: (gradient: string) => void
    setBackgroundPattern: (pattern: PatternType) => void
    setBackgroundImage: (url: string | null) => void

    // Text Overlay
    headline: string
    headlineColor: string
    headlineSize: 'sm' | 'md' | 'lg' | 'xl'
    setHeadline: (text: string) => void
    setHeadlineColor: (color: string) => void
    setHeadlineSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void

    // Export Settings
    selectedPreset: ExportPresetId
    setSelectedPreset: (preset: ExportPresetId) => void

    // Canvas Reference for Export
    isExporting: boolean
    setIsExporting: (exporting: boolean) => void

    // Reset
    reset: () => void
}

const initialState = {
    screenshot: null,
    deviceType: 'iphone' as DeviceType,
    deviceColor: 'black' as DeviceColor,
    backgroundType: 'gradient' as BackgroundType,
    backgroundColor: '#1a1a2e',
    backgroundGradient: PRESET_GRADIENTS[0].value,
    backgroundPattern: 'dots' as PatternType,
    backgroundImage: null,
    headline: '',
    headlineColor: '#ffffff',
    headlineSize: 'lg' as const,
    selectedPreset: 'play-feature' as ExportPresetId,
    isExporting: false,
}

export const useFeatureGraphicStore = create<FeatureGraphicState>((set) => ({
    ...initialState,

    // Screenshot Actions
    setScreenshot: (url) => set({ screenshot: url }),

    // Device Actions
    setDeviceType: (deviceType) => set({ deviceType }),
    setDeviceColor: (deviceColor) => set({ deviceColor }),

    // Background Actions
    setBackgroundType: (backgroundType) => set({ backgroundType }),
    setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
    setBackgroundGradient: (backgroundGradient) => set({ backgroundGradient }),
    setBackgroundPattern: (backgroundPattern) => set({ backgroundPattern }),
    setBackgroundImage: (backgroundImage) => set({ backgroundImage }),

    // Text Actions
    setHeadline: (headline) => set({ headline }),
    setHeadlineColor: (headlineColor) => set({ headlineColor }),
    setHeadlineSize: (headlineSize) => set({ headlineSize }),

    // Export Actions
    setSelectedPreset: (selectedPreset) => set({ selectedPreset }),
    setIsExporting: (isExporting) => set({ isExporting }),

    // Reset
    reset: () => set(initialState),
}))
