
import { useDropzone } from 'react-dropzone'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useStore, type PhoneColor } from '../store/useStore'
import { AudioPanel } from './AudioPanel'
import { clsx } from 'clsx'
import { Upload, X, Smartphone, Type, Settings, Download, CircleDot, RotateCcw, Palette, Play, Pause, Film, Sparkles, Image } from 'lucide-react'
import { GenericBackgroundPicker } from './GenericBackgroundPicker'

interface ControlPanelProps {
    onClose?: () => void
}

export const ControlPanel = ({ onClose: _onClose }: ControlPanelProps) => {
    const {
        setPhoneColor,
        scenes, activeSceneId, addScene, removeScene, setActiveScene,
        addScreenshots, removeScreenshot, updateHeadline, updateSubtitle,
        setScrollSpeed,
        aspectRatio, setAspectRatio,
        isPlaying, setIsPlaying,
        setBackgroundType, setBackgroundColor, setBackgroundGradient, setBackgroundPattern, setBackgroundImage,
        triggerReset,
        showIntro, setShowIntro, introLogo, setIntroLogo, introTitle, setIntroTitle, introSubtitle, setIntroSubtitle,
        showOutro, setShowOutro, outroQrCode, setOutroQrCode
    } = useStore()

    const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0]
    const { screenshots, headline, subtitle, phoneColor, scrollSpeed } = activeScene

    const [isRecording, setIsRecording] = useState(false)
    const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // === Recording Logic (unchanged) ===
    const startRegionRecording = async () => {
        try {
            setMediaBlobUrl(null)
            chunksRef.current = []
            const stage = document.getElementById('canvas-stage')
            if (stage) {
                const rect = stage.getBoundingClientRect()
                useStore.getState().setLockedDimensions({ width: rect.width, height: rect.height })
            }
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: 'browser', width: { ideal: 3840 }, height: { ideal: 2160 }, frameRate: { ideal: 60 } } as any,
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                preferCurrentTab: true,
                systemAudio: 'include',
            } as any)
            const canvasStage = document.getElementById('canvas-stage')
            if (canvasStage && (window as any).CropTarget) {
                const cropTarget = await (window as any).CropTarget.fromElement(canvasStage)
                const [videoTrack] = stream.getVideoTracks()
                if (videoTrack && (videoTrack as any).cropTo) await (videoTrack as any).cropTo(cropTarget)
            }
            let mimeType = 'video/mp4'
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm'
            const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 50000000 })
            mediaRecorderRef.current = recorder
            recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data) }
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType })
                setMediaBlobUrl(URL.createObjectURL(blob))
                stream.getTracks().forEach(track => track.stop())
            }
            recorder.start()
            setIsRecording(true)
            useStore.setState({ isExporting: true, isPlaying: false, animationFinished: false })
            useStore.getState().setFadeEffect('fadeIn')
            const firstSceneId = useStore.getState().scenes[0].id
            useStore.getState().setActiveScene(useStore.getState().showIntro ? 'INTRO' : firstSceneId)
            useStore.getState().triggerReset()
            setTimeout(() => setIsPlaying(true), 1000)
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

    const { animationFinished, setAnimationFinished, setIsExporting } = useStore()

    useEffect(() => {
        if (!isRecording) return
        if (activeSceneId === 'INTRO') { const t = setTimeout(() => useStore.getState().setAnimationFinished(true), 3000); return () => clearTimeout(t) }
        if (activeSceneId === 'OUTRO') { const t = setTimeout(() => useStore.getState().setAnimationFinished(true), 4000); return () => clearTimeout(t) }
    }, [isRecording, activeSceneId])

    useEffect(() => {
        if (!isRecording || !animationFinished) return
        if (activeSceneId === 'INTRO') { setAnimationFinished(false); setIsPlaying(false); setActiveScene(scenes[0].id); triggerReset(); setTimeout(() => setIsPlaying(true), 500); return }
        if (activeSceneId === 'OUTRO') { useStore.getState().setFadeEffect('fadeOut'); setTimeout(() => { stopRegionRecording(); setIsExporting(false); setAnimationFinished(false); setIsPlaying(false); useStore.getState().setLockedDimensions(null); useStore.getState().setFadeEffect('none') }, 1000); return }
        const idx = scenes.findIndex(s => s.id === activeSceneId)
        if (idx !== -1 && idx < scenes.length - 1) { setAnimationFinished(false); setIsPlaying(false); setTimeout(() => { setActiveScene(scenes[idx + 1].id); setTimeout(() => { triggerReset(); setTimeout(() => setIsPlaying(true), 100) }, 500) }, 300) }
        else { setAnimationFinished(false); setIsPlaying(false); if (showOutro) setTimeout(() => setActiveScene('OUTRO'), 500); else { useStore.getState().setFadeEffect('fadeOut'); setTimeout(() => { stopRegionRecording(); setIsExporting(false); useStore.getState().setLockedDimensions(null); useStore.getState().setFadeEffect('none') }, 1000) } }
    }, [isRecording, animationFinished, activeSceneId, scenes, showOutro, stopRegionRecording, setIsExporting, setAnimationFinished, setIsPlaying, setActiveScene, triggerReset])

    const onDrop = useCallback((acceptedFiles: File[]) => addScreenshots(acceptedFiles.map(file => URL.createObjectURL(file))), [addScreenshots])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })

    const Colors: PhoneColor[] = ['black', 'silver', 'gold', 'blue']

    // Toggle Component
    const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
        <button onClick={onChange} className={clsx("w-11 h-6 rounded-full relative transition-all duration-300", value ? "bg-primary shadow-[0_0_12px_rgba(59,130,246,0.5)]" : "bg-white/10")}>
            <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300", value ? "left-6" : "left-1")} />
        </button>
    )

    return (
        <div className="w-full h-full flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>



            <div className="flex flex-col gap-6 p-5">

                {/* === TIMELINE / SCENES === */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                            <Film size={14} /> Timeline
                        </h3>
                        <button onClick={addScene} className="text-[10px] font-medium text-primary hover:text-primary/80 transition">+ Add Scene</button>
                    </div>

                    {/* Scene Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {showIntro && (
                            <button onClick={() => setActiveScene('INTRO')} className={clsx("flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all", activeSceneId === 'INTRO' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white")}>
                                ✨ Intro
                            </button>
                        )}
                        {scenes.map((scene, idx) => (
                            <button key={scene.id} onClick={() => setActiveScene(scene.id)} className={clsx("flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all group relative", activeSceneId === scene.id ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white")}>
                                Scene {idx + 1}
                                {scenes.length > 1 && (
                                    <span onClick={(e) => { e.stopPropagation(); removeScene(scene.id) }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600">×</span>
                                )}
                            </button>
                        ))}
                        {showOutro && (
                            <button onClick={() => setActiveScene('OUTRO')} className={clsx("flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all", activeSceneId === 'OUTRO' ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white")}>
                                🎬 Outro
                            </button>
                        )}
                    </div>
                </section>

                {/* === SCENE CONTENT === */}
                {!['INTRO', 'OUTRO'].includes(activeSceneId) && (
                    <section className="space-y-5">

                        {/* Screenshots */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2 mb-3">
                                <Image size={14} /> Screenshots
                            </h3>
                            <div {...getRootProps()} className={clsx("border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all", isDragActive ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]")}>
                                <input {...getInputProps()} />
                                <Upload size={24} className="mx-auto mb-2 text-white/20" />
                                <p className="text-sm text-white/40">{isDragActive ? "Drop to upload" : "Drag & drop or click to upload"}</p>
                            </div>
                            {screenshots.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {screenshots.map((src, idx) => (
                                        <div key={idx} className="relative group aspect-[9/16] rounded-lg overflow-hidden ring-1 ring-white/10">
                                            <img src={src} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => removeScreenshot(idx)} className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"><X size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Device */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2 mb-3">
                                <Smartphone size={14} /> Device
                            </h3>
                            <div className="flex gap-2">
                                {Colors.map((color) => (
                                    <button key={color} onClick={() => setPhoneColor(color)} className={clsx("flex-1 py-2.5 rounded-lg text-xs font-medium capitalize transition-all", phoneColor === color ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10")}>
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2 mb-3">
                                <Palette size={14} /> Background
                            </h3>
                            <GenericBackgroundPicker
                                type={activeScene.backgroundType}
                                color={activeScene.backgroundColor}
                                gradient={activeScene.backgroundGradient}
                                pattern={activeScene.backgroundPattern}
                                image={activeScene.backgroundImage}
                                onTypeChange={setBackgroundType}
                                onColorChange={setBackgroundColor}
                                onGradientChange={setBackgroundGradient}
                                onPatternChange={setBackgroundPattern}
                                onImageChange={setBackgroundImage}
                            />
                        </div>

                        {/* Typography */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2 mb-3">
                                <Type size={14} /> Text
                            </h3>
                            <div className="space-y-3">
                                <input type="text" value={headline} onChange={(e) => updateHeadline(e.target.value)} placeholder="Headline" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/30 focus:border-primary focus:outline-none transition-colors" />
                                <input type="text" value={subtitle} onChange={(e) => updateSubtitle(e.target.value)} placeholder="Subtitle" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-white/30 focus:border-primary focus:outline-none transition-colors" />
                            </div>
                        </div>

                        {/* Animation */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2 mb-3">
                                <Settings size={14} /> Animation
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-white/50">Scroll Speed</span>
                                        <span className="text-white font-medium">{scrollSpeed}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={scrollSpeed} onChange={(e) => setScrollSpeed(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { triggerReset(); setIsPlaying(false) }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                        <RotateCcw size={14} /> Reset
                                    </button>
                                    <button onClick={() => setIsPlaying(!isPlaying)} className={clsx("flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all", isPlaying ? "bg-white/10" : "bg-primary text-white shadow-lg shadow-primary/30")}>
                                        {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Preview</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* === INTRO/OUTRO SETTINGS === */}
                <section className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                        <Sparkles size={14} /> Intro & Outro
                    </h3>

                    {/* Intro */}
                    <div className="bg-white/[0.02] rounded-xl p-4 space-y-4 border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Intro Screen</span>
                            <Toggle value={showIntro} onChange={() => setShowIntro(!showIntro)} />
                        </div>
                        {showIntro && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {introLogo ? <img src={introLogo} className="w-full h-full object-cover" /> : <Upload size={16} className="text-white/20" />}
                                    </div>
                                    <div className="flex-1 flex items-center">
                                        <input type="file" accept="image/*" id="intro-logo" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setIntroLogo(URL.createObjectURL(e.target.files[0])) }} />
                                        <label htmlFor="intro-logo" className="text-xs bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg cursor-pointer transition-colors">Upload Logo</label>
                                    </div>
                                </div>
                                <input value={introTitle} onChange={(e) => setIntroTitle(e.target.value)} placeholder="App Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-white/30 focus:border-primary focus:outline-none" />
                                <input value={introSubtitle} onChange={(e) => setIntroSubtitle(e.target.value)} placeholder="Tagline" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-white/30 focus:border-primary focus:outline-none" />
                            </div>
                        )}
                    </div>

                    {/* Outro */}
                    <div className="bg-white/[0.02] rounded-xl p-4 space-y-4 border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Outro Screen</span>
                            <Toggle value={showOutro} onChange={() => setShowOutro(!showOutro)} />
                        </div>
                        {showOutro && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-white border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {outroQrCode ? <img src={outroQrCode} className="w-full h-full object-cover" /> : <Settings size={16} className="text-black/20" />}
                                    </div>
                                    <div className="flex-1 flex items-center">
                                        <input type="file" accept="image/*" id="outro-qr" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setOutroQrCode(URL.createObjectURL(e.target.files[0])) }} />
                                        <label htmlFor="outro-qr" className="text-xs bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg cursor-pointer transition-colors">Upload QR</label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* === AUDIO === */}
                <AudioPanel />

                {/* === EXPORT === */}
                <section className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                        <Download size={14} /> Export
                    </h3>

                    <div className="flex gap-2">
                        <button onClick={() => setAspectRatio('1:1')} className={clsx("flex-1 py-3 rounded-lg text-sm font-medium transition-all", aspectRatio === '1:1' ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10")}>
                            1:1 Square
                        </button>
                        <button onClick={() => setAspectRatio('9:16')} className={clsx("flex-1 py-3 rounded-lg text-sm font-medium transition-all", aspectRatio === '9:16' ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/60 hover:bg-white/10")}>
                            9:16 Vertical
                        </button>
                    </div>

                    {!isRecording ? (
                        <button onClick={startRegionRecording} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/25 active:scale-[0.98]">
                            <CircleDot size={18} /> Generate Video
                        </button>
                    ) : (
                        <div className="w-full py-4 bg-white/5 text-white rounded-xl font-medium flex items-center justify-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Generating...
                        </div>
                    )}

                    {mediaBlobUrl && !isRecording && (
                        <div className="bg-white/[0.02] rounded-xl p-4 space-y-4 border border-white/5">
                            <video src={mediaBlobUrl} controls className="w-full rounded-lg" />
                            <a href={mediaBlobUrl} download="app-promo.mp4" className="block w-full py-3 bg-primary hover:bg-primary/90 text-white text-center rounded-lg font-medium transition-colors">
                                Download Video
                            </a>
                        </div>
                    )}
                </section>

            </div>
        </div>
    )
}
