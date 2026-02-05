
import { useDropzone } from 'react-dropzone'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useStore, type PhoneColor } from '../store/useStore'
import { clsx } from 'clsx'
import { Upload, X, Smartphone, Type, Settings, Download, CircleDot, RotateCcw } from 'lucide-react'
// import { useReactMediaRecorder } from 'react-media-recorder' (Removed)

interface ControlPanelProps {
    onClose?: () => void
}

export const ControlPanel = ({ onClose: _onClose }: ControlPanelProps) => {
    const {
        setPhoneColor,
        // Scene Actions
        scenes, activeSceneId, addScene, removeScene, setActiveScene,
        addScreenshots, removeScreenshot, updateHeadline, updateSubtitle,

        setScrollSpeed,
        aspectRatio, setAspectRatio,
        isPlaying, setIsPlaying,
        setBackground,
        triggerReset
    } = useStore()

    const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0]
    const { screenshots, headline, subtitle, phoneColor, background, scrollSpeed } = activeScene

    // Custom Recording State
    const [isRecording, setIsRecording] = useState(false)
    const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const startRegionRecording = async () => {
        try {
            setMediaBlobUrl(null)
            chunksRef.current = []

            // 0. LOCK DIMENSIONS to prevent layout shift when "Sharing" banner appears (shrinks viewport)
            const stage = document.getElementById('canvas-stage')
            if (stage) {
                const rect = stage.getBoundingClientRect()
                // Store strict pixel values
                useStore.getState().setLockedDimensions({ width: rect.width, height: rect.height })
            }

            // 1. Get the stream (User selects Current Tab)
            // request 4K/60fps to ensure highest quality source
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'browser',
                    width: { ideal: 3840 },
                    height: { ideal: 2160 },
                    frameRate: { ideal: 60 },
                } as any,
                audio: false,
                preferCurrentTab: true
            } as any)

            // 2. Crop to the canvas-stage element
            const canvasStage = document.getElementById('canvas-stage')
            if (canvasStage && (window as any).CropTarget) {
                const cropTarget = await (window as any).CropTarget.fromElement(canvasStage)
                const [videoTrack] = stream.getVideoTracks()
                if (videoTrack && (videoTrack as any).cropTo) {
                    await (videoTrack as any).cropTo(cropTarget)
                }
            }

            // 3. Start Recording
            // Try MP4, fallback to WebM
            let mimeType = 'video/mp4'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm'
            }

            // High bitrate for "perfect" quality (25 Mbps)
            const recorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 25000000
            })
            mediaRecorderRef.current = recorder

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data)
            }

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType })
                const url = URL.createObjectURL(blob)
                setMediaBlobUrl(url)

                // Stop all tracks to clean up "sharing" indicator
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            setIsRecording(true)

            // Trigger Automation Flow
            useStore.setState({ isExporting: true, isPlaying: false, animationFinished: false })

            // Reset to First Scene for the recording sequence
            const firstSceneId = useStore.getState().scenes[0].id
            useStore.getState().setActiveScene(firstSceneId)
            useStore.getState().triggerReset()

            // Start animation slightly after recording starts to ensure frame capture
            setTimeout(() => {
                setIsPlaying(true)
            }, 1000) // Increased buffer for Scene 1 transition/setup

        } catch (err) {
            console.error("Recording failed", err)
            setIsRecording(false)
        }
    }

    const stopRegionRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }, [])

    // Watch for animation completion signal
    const { animationFinished, setAnimationFinished, setIsExporting } = useStore()

    // SEQUENCE ENGINE
    useEffect(() => {
        if (animationFinished && isRecording) {

            // Find current scene index
            const currentIdx = scenes.findIndex(s => s.id === activeSceneId)

            // Check if there are more scenes
            if (currentIdx !== -1 && currentIdx < scenes.length - 1) {
                // NEXT SCENE LOGIC
                setAnimationFinished(false)
                setIsPlaying(false) // Pause current

                // Wait for current scene to settle
                setTimeout(() => {
                    // Change scene (triggers exit → enter transition)
                    const nextSceneId = scenes[currentIdx + 1].id
                    setActiveScene(nextSceneId)

                    // Wait for transition (0.4s + buffer)
                    setTimeout(() => {
                        triggerReset()
                        setTimeout(() => {
                            setIsPlaying(true)
                        }, 100)
                    }, 500)

                }, 300)

            } else {
                // SEQUENCE COMPLETE - No delay, stop immediately
                stopRegionRecording()
                setIsExporting(false)
                setAnimationFinished(false)
                setIsPlaying(false)
                useStore.getState().setLockedDimensions(null) // Unfreeze layout
            }
        }
    }, [animationFinished, isRecording, stopRegionRecording, setIsExporting, setAnimationFinished, setIsPlaying, scenes, activeSceneId, setActiveScene, triggerReset])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const fileUrls = acceptedFiles.map(file => URL.createObjectURL(file))
        addScreenshots(fileUrls)
    }, [addScreenshots])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    })

    const Colors: PhoneColor[] = ['black', 'silver', 'gold', 'blue']

    return (
        <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">

            <div className="space-y-1">
                <h2 className="text-xl font-bold">Configuration</h2>
                <p className="text-sm text-muted-foreground">Customize your video export</p>
            </div>

            {/* Scene Manager */}
            <section className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                        Video Scenes
                    </label>
                    <button onClick={addScene} className="text-xs bg-primary px-2 py-1 rounded hover:bg-primary/90 transition">
                        + Add Scene
                    </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {scenes.map((scene, idx) => (
                        <button
                            key={scene.id}
                            onClick={() => setActiveScene(scene.id)}
                            className={clsx(
                                "flex-shrink-0 px-3 py-2 rounded-lg border text-xs transition-all relative group",
                                activeSceneId === scene.id ? "bg-white text-black border-white" : "bg-black/40 border-white/10 hover:border-white/30"
                            )}
                        >
                            Scene {idx + 1}
                            {scenes.length > 1 && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); removeScene(scene.id) }}
                                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                >×</span>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Upload Section */}
            <section className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Upload size={16} /> Screenshots
                </label>

                <div
                    {...getRootProps()}
                    className={clsx(
                        "border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-white/5",
                        isDragActive && "border-primary bg-primary/10"
                    )}
                >
                    <input {...getInputProps()} />
                    <p className="text-sm text-muted-foreground">
                        {isDragActive ? "Drop images here..." : "Drag & drop UI screenshots"}
                    </p>
                </div>

                {/* Thumbnails */}
                {screenshots.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {screenshots.map((src, idx) => (
                            <div key={idx} className="relative group aspect-[9/16] rounded-md overflow-hidden border border-white/10">
                                <img src={src} className="w-full h-full object-cover" alt="" />
                                <button
                                    onClick={() => removeScreenshot(idx)}
                                    className="absolute top-1 right-1 bg-red-500/80 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <hr className="border-white/10" />

            {/* Appearance */}
            <section className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Smartphone size={16} /> Device Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {Colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setPhoneColor(color)}
                            className={clsx(
                                "h-10 rounded-lg border transition-all capitalize text-xs",
                                phoneColor === color ? "border-primary bg-primary/20 text-white" : "border-white/10 text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            {color}
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" /> Background
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { name: 'Noir Elegance', class: 'bg-[radial-gradient(ellipse_at_top,_#1a1a2e_0%,_#16213e_50%,_#0f0f0f_100%)]' },
                        { name: 'Slate', class: 'bg-gradient-to-br from-slate-600 via-slate-800 to-black' },
                        { name: 'Twilight', class: 'bg-gradient-to-br from-purple-900/80 via-slate-900 to-black' },
                        { name: 'Carbon', class: 'bg-gradient-to-br from-neutral-700 via-zinc-900 to-black' },
                        { name: 'Forest', class: 'bg-gradient-to-br from-green-800 via-emerald-900 to-black' },
                        { name: 'Luxury Gold', class: 'bg-gradient-to-br from-yellow-600/50 via-gray-900 to-black' },
                        { name: 'Velvet', class: 'bg-gradient-to-bl from-red-700/50 via-gray-900 to-black' },
                        { name: 'Cyber', class: 'bg-gradient-to-tr from-cyan-600/50 via-gray-900 to-purple-600/50' },
                    ].map((bg) => (
                        <button
                            key={bg.name}
                            onClick={() => setBackground(bg.class)}
                            title={bg.name}
                            className={clsx(
                                "h-10 rounded-lg border transition-all relative overflow-hidden group",
                                background === bg.class ? "border-white scale-105 shadow-xl" : "border-white/10 hover:border-white/30"
                            )}
                        >
                            <div className={clsx("absolute inset-0", bg.class)} />
                        </button>
                    ))}
                </div>
            </section>

            {/* Text */}
            <section className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Type size={16} /> Typography
                </label>
                <div className="space-y-3">
                    <div>
                        <span className="text-xs text-muted-foreground mb-1 block">Headline</span>
                        <input
                            type="text"
                            value={headline}
                            onChange={(e) => updateHeadline(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground mb-1 block">Subtitle</span>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => updateSubtitle(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Animation */}
            <section className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Settings size={16} /> Animation
                </label>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Scroll Speed</span>
                            <span>{scrollSpeed}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={scrollSpeed}
                            onChange={(e) => setScrollSpeed(Number(e.target.value))}
                            className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Playback</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    triggerReset()
                                    setIsPlaying(false)
                                }}
                                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                                title="Reset to Top"
                            >
                                <RotateCcw size={12} />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors w-16 text-center"
                            >
                                {isPlaying ? "Pause" : "Play"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Export Settings */}
            <section className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Download size={16} /> Export
                </label>

                {/* Ratio Selector */}
                <div className="flex bg-black/20 p-1 rounded-lg border border-white/10 mb-4">
                    <button
                        onClick={() => setAspectRatio('1:1')}
                        className={clsx(
                            "flex-1 py-1.5 text-xs rounded-md transition-all",
                            aspectRatio === '1:1' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        Square (1:1)
                    </button>
                    <button
                        onClick={() => setAspectRatio('9:16')}
                        className={clsx(
                            "flex-1 py-1.5 text-xs rounded-md transition-all",
                            aspectRatio === '9:16' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        Vertical (9:16)
                    </button>
                </div>

                {/* Automated Recording Controls */}
                <div className="space-y-3">

                    {!isRecording ? (
                        <div className="space-y-2">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-200">
                                <strong>Note:</strong> Browser security requires permission. When prompted, select <u>Edge/Chrome Tab</u> → <u>Current Page</u>.
                            </div>
                            <button
                                onClick={startRegionRecording}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                            >
                                <CircleDot size={18} /> Generate Video
                            </button>
                        </div>
                    ) : (
                        <div className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all animate-pulse cursor-wait">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            Generating...
                        </div>
                    )}

                    {isRecording && (
                        <p className="text-xs text-center text-muted-foreground">
                            Please wait while the video is generated...
                        </p>
                    )}

                    {/* Download Link */}
                    {mediaBlobUrl && !isRecording && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                            <p className="text-xs text-muted-foreground">Video ready!</p>
                            <video src={mediaBlobUrl} controls className="w-full rounded-lg" />
                            <a
                                href={mediaBlobUrl}
                                download="app-promo.mp4"
                                className="block w-full py-2 bg-primary hover:bg-primary/90 text-white text-center rounded-lg text-sm font-medium transition-colors"
                            >
                                Download Video
                            </a>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

