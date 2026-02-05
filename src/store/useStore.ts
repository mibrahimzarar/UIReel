import { create } from 'zustand'

export type PhoneColor = 'black' | 'silver' | 'gold' | 'blue'
export type AspectRatio = '1:1' | '9:16'
export type TextAnimation = 'fade' | 'slide' | 'none'

// Scene Definition
export interface Scene {
    id: string
    screenshots: string[]
    headline: string
    subtitle: string
    // Per-Scene Settings
    phoneColor: PhoneColor
    background: string
    scrollSpeed: number
}

interface AppState {
    // Scene Management
    scenes: Scene[]
    activeSceneId: string
    addScene: () => void
    removeScene: (id: string) => void
    setActiveScene: (id: string) => void

    // Active Scene Actions (Proxies)
    addScreenshots: (urls: string[]) => void
    removeScreenshot: (index: number) => void
    reorderScreenshots: (newOrder: string[]) => void
    updateHeadline: (text: string) => void
    updateSubtitle: (text: string) => void

    // Per-Scene Setters (Proxy to Active Scene)
    setPhoneColor: (color: PhoneColor) => void
    setBackground: (bg: string) => void
    setScrollSpeed: (speed: number) => void

    // Animation State (Global)
    isPlaying: boolean
    setIsPlaying: (playing: boolean) => void
    videoDuration: number
    setVideoDuration: (duration: number) => void

    // Export Settings (Global)
    aspectRatio: AspectRatio
    setAspectRatio: (ratio: AspectRatio) => void
    isExporting: boolean
    setIsExporting: (exporting: boolean) => void
    animationFinished: boolean
    setAnimationFinished: (finished: boolean) => void

    lockedDimensions: { width: number, height: number } | null
    setLockedDimensions: (dims: { width: number, height: number } | null) => void

    resetScrollSignal: number
    triggerReset: () => void

    // Fade Effects
    fadeEffect: 'none' | 'fadeIn' | 'fadeOut'
    setFadeEffect: (effect: 'none' | 'fadeIn' | 'fadeOut') => void

    // Intro Settings
    showIntro: boolean
    introLogo: string | null
    introTitle: string
    introSubtitle: string
    setShowIntro: (show: boolean) => void
    setIntroLogo: (logo: string | null) => void
    setIntroTitle: (text: string) => void
    setIntroSubtitle: (text: string) => void

    // Outro Settings
    showOutro: boolean
    outroQrCode: string | null
    setShowOutro: (show: boolean) => void
    setOutroQrCode: (qr: string | null) => void

    // Audio Settings
    audioFile: string | null
    audioVolume: number
    audioTrim: { start: number, end: number }
    setAudioFile: (file: string | null) => void
    setAudioVolume: (volume: number) => void
    setAudioTrim: (trim: { start: number, end: number }) => void
}

export const useStore = create<AppState>((set) => ({
    // Scenes
    scenes: [{
        id: 'default',
        screenshots: [],
        headline: "Experience the Future",
        subtitle: "Seamless, elegant, and powerful.",
        phoneColor: 'black',
        background: "bg-[radial-gradient(ellipse_at_top,_#1a1a2e_0%,_#16213e_50%,_#0f0f0f_100%)]",
        scrollSpeed: 20
    }],
    activeSceneId: 'default',

    // Intro Settings Initial State
    showIntro: false,
    introLogo: null,
    introTitle: "Welcome",
    introSubtitle: "Discover the amazing features",

    // Outro Settings Initial State
    showOutro: false,
    outroQrCode: null,

    // Audio Initial State
    audioFile: null,
    audioVolume: 0.5,
    audioTrim: { start: 0, end: 0 },

    addScene: () => set((state) => {
        const newId = crypto.randomUUID()
        // Clone the last scene's settings for convenience
        const lastScene = state.scenes[state.scenes.length - 1]
        return {
            scenes: [...state.scenes, {
                id: newId,
                screenshots: [],
                headline: "New Scene",
                subtitle: "Describe this scene...",
                phoneColor: lastScene.phoneColor,
                background: lastScene.background,
                scrollSpeed: lastScene.scrollSpeed
            }],
            activeSceneId: newId
        }
    }),

    removeScene: (id) => set((state) => {
        if (state.scenes.length <= 1) return state // Don't delete last scene
        const newScenes = state.scenes.filter(s => s.id !== id)
        return {
            scenes: newScenes,
            activeSceneId: newScenes[0].id // Fallback to first
        }
    }),

    setActiveScene: (activeSceneId) => set({ activeSceneId }),

    // Helper to resolve target scene ID
    // INTRO -> First Scene
    // OUTRO -> Last Scene
    // Scene ID -> Scene ID

    // Proxy Actions -- modify the ACTIVE scene (or mapped scene)
    addScreenshots: (urls) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId
                ? { ...s, screenshots: [...s.screenshots, ...urls] }
                : s
            )
        }
    }),

    removeScreenshot: (index) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId
                ? { ...s, screenshots: s.screenshots.filter((_, i) => i !== index) }
                : s
            )
        }
    }),

    reorderScreenshots: (newOrder) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId ? { ...s, screenshots: newOrder } : s)
        }
    }),

    updateHeadline: (headline) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId ? { ...s, headline } : s)
        }
    }),

    updateSubtitle: (subtitle) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId ? { ...s, subtitle } : s)
        }
    }),

    setPhoneColor: (phoneColor) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId ? { ...s, phoneColor } : s)
        }
    }),

    setBackground: (background) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId ? { ...s, background } : s)
        }
    }),

    setScrollSpeed: (scrollSpeed) => set((state) => {
        const targetId = state.activeSceneId === 'INTRO' ? state.scenes[0].id : state.activeSceneId === 'OUTRO' ? state.scenes[state.scenes.length - 1].id : state.activeSceneId
        return {
            scenes: state.scenes.map(s => s.id === targetId ? { ...s, scrollSpeed } : s)
        }
    }),

    // Animation
    isPlaying: false,
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    videoDuration: 0,
    setVideoDuration: (duration) => set({ videoDuration: duration }),

    // Export State
    aspectRatio: '1:1',
    setAspectRatio: (aspectRatio) => set({ aspectRatio }),

    isExporting: false,
    setIsExporting: (isExporting) => set({ isExporting }),
    animationFinished: false,
    setAnimationFinished: (animationFinished) => set({ animationFinished }),

    lockedDimensions: null,
    setLockedDimensions: (lockedDimensions) => set({ lockedDimensions }),

    resetScrollSignal: 0,
    triggerReset: () => set((state) => ({ resetScrollSignal: state.resetScrollSignal + 1 })),

    // Fade Initial State
    fadeEffect: 'none',
    setFadeEffect: (fadeEffect) => set({ fadeEffect }),

    // Intro Actions
    setShowIntro: (show) => set({ showIntro: show }),
    setIntroLogo: (logo) => set({ introLogo: logo }),
    setIntroTitle: (text) => set({ introTitle: text }),
    setIntroSubtitle: (text) => set({ introSubtitle: text }),

    // Outro Actions
    setShowOutro: (show) => set({ showOutro: show }),
    setOutroQrCode: (qr) => set({ outroQrCode: qr }),

    // Audio Actions
    setAudioFile: (file) => set({ audioFile: file }),
    setAudioVolume: (volume) => set({ audioVolume: volume }),
    setAudioTrim: (trim) => set({ audioTrim: trim }),
}))
