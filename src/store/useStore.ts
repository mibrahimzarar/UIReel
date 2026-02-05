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

    // Proxy Actions -- modify the ACTIVE scene
    addScreenshots: (urls) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId
            ? { ...s, screenshots: [...s.screenshots, ...urls] }
            : s
        )
    })),

    removeScreenshot: (index) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId
            ? { ...s, screenshots: s.screenshots.filter((_, i) => i !== index) }
            : s
        )
    })),

    reorderScreenshots: (newOrder) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId ? { ...s, screenshots: newOrder } : s)
    })),

    updateHeadline: (headline) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId ? { ...s, headline } : s)
    })),

    updateSubtitle: (subtitle) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId ? { ...s, subtitle } : s)
    })),

    setPhoneColor: (phoneColor) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId ? { ...s, phoneColor } : s)
    })),

    setBackground: (background) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId ? { ...s, background } : s)
    })),

    setScrollSpeed: (scrollSpeed) => set((state) => ({
        scenes: state.scenes.map(s => s.id === state.activeSceneId ? { ...s, scrollSpeed } : s)
    })),

    // Animation
    isPlaying: false,
    setIsPlaying: (isPlaying) => set({ isPlaying }),

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
}))
