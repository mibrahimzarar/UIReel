
import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { useStore } from '../store/useStore'
import { Play, Pause, Music, Volume2, Upload, Trash2, Scissors, AlertCircle } from 'lucide-react'

export const AudioPanel = () => {
    const {
        audioFile, setAudioFile,
        audioName, setAudioName,
        audioVolume, setAudioVolume,
        setAudioTrim,
        isPlaying,
        videoDuration
    } = useStore()

    const containerRef = useRef<HTMLDivElement>(null)
    const wavesurferRef = useRef<WaveSurfer | null>(null)
    const regionsRef = useRef<any>(null)
    const [localIsPlaying, setLocalIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [error, setError] = useState<string | null>(null)

    // File Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setError(null)
            const url = URL.createObjectURL(file)
            setAudioFile(url)
            setAudioName(file.name)
        }
    }

    // Initialize WaveSurfer
    useEffect(() => {
        if (!containerRef.current || !audioFile) return

        // Cleanup
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy()
        }

        try {
            const ws = WaveSurfer.create({
                container: containerRef.current,
                waveColor: 'rgba(255, 255, 255, 0.4)',
                progressColor: '#ef4444',
                cursorColor: '#ef4444',
                barWidth: 2,
                barGap: 3,
                height: 60,
                barRadius: 2,
                normalize: true,
                minPxPerSec: 0, // Fit to container (removes ugly scrollbar)
                interact: true,
                autoCenter: true,
                // Revert to WebAudio for better rendering compatibility
                backend: 'WebAudio',
            })

            const wsRegions = ws.registerPlugin(RegionsPlugin.create())
            regionsRef.current = wsRegions

            ws.on('decode', (d) => {
                setDuration(d)
                setError(null)

                // Auto Trim
                const trimEnd = (videoDuration > 0 && videoDuration < d) ? videoDuration : d
                setAudioTrim({ start: 0, end: trimEnd })

                wsRegions.clearRegions()
                wsRegions.addRegion({
                    start: 0,
                    end: trimEnd,
                    color: 'rgba(239, 68, 68, 0.15)',
                    drag: true,
                    resize: true,
                    id: 'trim-region',
                })
            })

            ws.on('ready', () => {
                ws.setVolume(audioVolume)
            })

            ws.on('audioprocess', (currentTime) => {
                const region = regionsRef.current?.getRegions()[0]
                if (region && (currentTime < region.start || currentTime >= region.end)) {
                    if (ws.isPlaying()) {
                        ws.pause()
                        // If it paused due to end of region, maybe seek to start?
                        if (currentTime >= region.end) {
                            ws.seekTo(region.start / ws.getDuration())
                        }
                    }
                }
            })

            ws.on('play', () => setLocalIsPlaying(true))
            ws.on('pause', () => setLocalIsPlaying(false))
            ws.on('error', (err) => {
                console.error("WaveSurfer Error:", err)
                setError("Failed to load audio. Please try another file.")
            })

            wsRegions.on('region-updated', (region: any) => {
                setAudioTrim({ start: region.start, end: region.end })
            })

            // Load the file
            ws.load(audioFile)

            wavesurferRef.current = ws
        } catch (e) {
            console.error("WaveSurfer Init Error:", e)
            setError("Could not initialize audio player.")
        }

        return () => {
            wavesurferRef.current?.destroy()
        }
    }, [audioFile])

    // Sync Global Playback
    useEffect(() => {
        const ws = wavesurferRef.current
        if (!ws) return

        if (isPlaying) {
            // Seek to trim start if we are resetting or just starting?
            // For now, simple play. The audioprocess will handle end.
            // Ideally we sync time exactly but that's hard.
            const region = regionsRef.current?.getRegions()[0]
            if (region) {
                // If current time is outside region, jump to start
                const currentTime = ws.getCurrentTime()
                if (currentTime < region.start || currentTime >= region.end) {
                    ws.seekTo(region.start / ws.getDuration())
                }
            }
            ws.play()
        } else {
            ws.pause()
        }
    }, [isPlaying])

    // Sync Volume
    useEffect(() => {
        wavesurferRef.current?.setVolume(audioVolume)
    }, [audioVolume])

    // Toggle Play/Pause
    const togglePlay = () => {
        wavesurferRef.current?.playPause()
    }

    const clearAudio = () => {
        setAudioFile(null)
        setAudioName(null)
        setAudioTrim({ start: 0, end: 0 })
        setError(null)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')} `
    }

    if (!audioFile) {
        return (
            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10 relative z-20">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <Music size={16} /> Background Audio
                    </label>
                </div>
                <div className="border border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition-colors group relative cursor-pointer">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                    />
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                        <Upload size={20} />
                        <span className="text-xs">Upload Music / Audio</span>
                    </div>
                </div>
                {error && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10 relative z-20">
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <Music size={16} /> Edit Audio
                    </label>
                    {audioName && <span className="text-[10px] text-white/50 truncate max-w-[200px]">{audioName}</span>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearAudio}
                        className="text-white/50 hover:text-red-500 transition-colors"
                        title="Remove Audio"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            ) : (
                <div className="relative bg-black/40 rounded-lg p-2 border border-white/10 z-10 select-none" onMouseDown={(e) => e.stopPropagation()}>
                    <div ref={containerRef} className="w-full h-[60px]" /> {/* Explicit height */}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{formatTime(0)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                    {localIsPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Volume2 size={12} />
                        <span>Volume</span>
                        <span className="ml-auto text-white">{Math.round(audioVolume * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                        style={{
                            WebkitAppearance: 'none',
                        }}
                    />
                </div>
            </div>

            <div className="flex items-start gap-2 text-[10px] text-yellow-500/80 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                <Scissors size={12} className="mt-0.5" />
                <p>Drag the trim handles. Audio only plays inside the red region.</p>
            </div>
        </div>
    )
}

