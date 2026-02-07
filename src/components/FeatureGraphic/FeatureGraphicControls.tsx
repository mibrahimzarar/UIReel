import { clsx } from 'clsx'
import { Upload, X, Smartphone, Type, Palette } from 'lucide-react'
import { useFeatureGraphicStore, type DeviceType, type DeviceColor } from '../../store/useFeatureGraphicStore'
import { BackgroundPicker } from './BackgroundPicker'
import { ExportPanel } from './ExportPanel'
import { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'
import { Smartphone as SmartphoneIcon, Tablet as TabletIcon } from 'lucide-react'

// Device options
const deviceOptions: { id: DeviceType; label: string; icon: typeof SmartphoneIcon }[] = [
    { id: 'iphone', label: 'iPhone', icon: SmartphoneIcon },
    { id: 'android', label: 'Android', icon: SmartphoneIcon },
    { id: 'ipad', label: 'iPad', icon: TabletIcon },
    { id: 'android-tablet', label: 'Android Tablet', icon: TabletIcon },
]

const colorOptions: { id: DeviceColor; label: string; color: string }[] = [
    { id: 'black', label: 'Black', color: '#1a1a1a' },
    { id: 'silver', label: 'Silver', color: '#c0c0c0' },
    { id: 'gold', label: 'Gold', color: '#d4af37' },
    { id: 'blue', label: 'Blue', color: '#1e3a5f' },
    { id: 'purple', label: 'Purple', color: '#4a2c6a' },
]

export const FeatureGraphicControls = () => {
    const {
        screenshot,
        deviceType,
        deviceColor,
        headline,
        headlineColor,
        setScreenshot,
        setDeviceType,
        setDeviceColor,
        setHeadline,
        setHeadlineColor,
    } = useFeatureGraphicStore()

    // Dropzone for screenshot
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setScreenshot(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [setScreenshot])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1,
    })

    return (
        <div className="h-full bg-black/30 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
            <div className="p-6 space-y-6">


                {/* Screenshot Upload */}
                <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                        <Upload size={16} />
                        Screenshot
                    </h3>
                    <div
                        {...getRootProps()}
                        className={clsx(
                            "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all",
                            isDragActive
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-white/20 hover:border-white/40"
                        )}
                    >
                        <input {...getInputProps()} />
                        {screenshot ? (
                            <div className="relative">
                                <img src={screenshot} alt="Screenshot" className="w-full h-24 object-cover rounded-lg" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setScreenshot(null) }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-white/40 py-2">
                                <Upload className="mx-auto mb-1" size={20} />
                                <p className="text-xs">Drop or click to upload</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Device Selection */}
                <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                        <Smartphone size={16} />
                        Device
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {deviceOptions.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setDeviceType(id)}
                                className={clsx(
                                    "p-2.5 rounded-lg text-xs font-medium flex flex-col items-center gap-1.5 transition-all",
                                    deviceType === id
                                        ? "bg-white/15 text-white ring-2 ring-white/30"
                                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                                )}
                            >
                                <Icon size={18} />
                                <span className="truncate">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Color Selection */}
                    <div className="flex gap-2 pt-2">
                        {colorOptions.map(({ id, label, color }) => (
                            <button
                                key={id}
                                onClick={() => setDeviceColor(id)}
                                className={clsx(
                                    "w-8 h-8 rounded-full transition-all hover:scale-110",
                                    deviceColor === id ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
                                )}
                                style={{ background: color }}
                                title={label}
                            />
                        ))}
                    </div>
                </section>

                {/* Background */}
                <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                        <Palette size={16} />
                        Background
                    </h3>
                    <BackgroundPicker />
                </section>

                {/* Text Overlay */}
                <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                        <Type size={16} />
                        Headline
                    </h3>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="Enter headline text..."
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-white/50">Color:</span>
                            <input
                                type="color"
                                value={headlineColor}
                                onChange={(e) => setHeadlineColor(e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                            />
                            <input
                                type="text"
                                value={headlineColor}
                                onChange={(e) => setHeadlineColor(e.target.value)}
                                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                            />
                        </div>
                    </div>
                </section>

                {/* Export */}
                <section>
                    <ExportPanel />
                </section>
            </div>
        </div>
    )
}
