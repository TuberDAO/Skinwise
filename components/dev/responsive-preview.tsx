'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, Laptop, X } from 'lucide-react'

// Only render in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

type ViewportPreset = {
  name: string
  width: number
  height: number
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const viewportPresets: ViewportPreset[] = [
  {
    name: 'iPhone 12',
    width: 390,
    height: 844,
    icon: Smartphone,
    description: 'Mobile'
  },
  {
    name: 'Galaxy S21',
    width: 360,
    height: 800,
    icon: Smartphone,
    description: 'Mobile'
  },
  {
    name: 'iPad',
    width: 768,
    height: 1024,
    icon: Tablet,
    description: 'Tablet'
  },
  {
    name: 'Laptop',
    width: 1024,
    height: 768,
    icon: Laptop,
    description: 'Laptop'
  },
  {
    name: 'Desktop',
    width: 1280,
    height: 1024,
    icon: Monitor,
    description: 'Desktop'
  },
  {
    name: 'Full HD',
    width: 1920,
    height: 1080,
    icon: Monitor,
    description: 'Full HD'
  }
]

export default function ResponsivePreview() {
  const [isOpen, setIsOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<ViewportPreset | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render in production or during SSR
  if (!isDevelopment || !isMounted) {
    return null
  }

  const handlePresetSelect = (preset: ViewportPreset) => {
    setActivePreset(preset)
    setIsOpen(false)
    
    // Apply viewport dimensions to the main container
    const mainContainer = document.querySelector('main')
    if (mainContainer) {
      mainContainer.style.width = `${preset.width}px`
      mainContainer.style.height = `${preset.height}px`
      mainContainer.style.margin = '20px auto'
      mainContainer.style.border = '1px solid #e2e8f0'
      mainContainer.style.borderRadius = '8px'
      mainContainer.style.overflow = 'hidden'
      mainContainer.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    }
    
    // Update body background to show the preview frame
    document.body.style.backgroundColor = '#f1f5f9'
    document.body.style.padding = '20px'
  }

  const handleReset = () => {
    setActivePreset(null)
    setIsOpen(false)
    
    // Reset viewport dimensions
    const mainContainer = document.querySelector('main')
    if (mainContainer) {
      mainContainer.style.width = ''
      mainContainer.style.height = ''
      mainContainer.style.margin = ''
      mainContainer.style.border = ''
      mainContainer.style.borderRadius = ''
      mainContainer.style.overflow = ''
      mainContainer.style.boxShadow = ''
    }
    
    // Reset body styles
    document.body.style.backgroundColor = ''
    document.body.style.padding = ''
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Current viewport indicator */}
      {activePreset && (
        <div className="mb-2 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs font-medium text-gray-700">
          <div className="flex items-center justify-between gap-2">
            <span>{activePreset.name}</span>
            <span className="text-gray-500">{activePreset.width}×{activePreset.height}</span>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-gray-100 rounded"
              title="Reset to normal view"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 hover:bg-gray-50 transition-colors"
          title="Responsive Preview"
        >
          <Monitor className="w-5 h-5 text-gray-600" />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Viewport Presets</h3>
            </div>
            <div className="py-1">
              {viewportPresets.map((preset) => {
                const IconComponent = preset.icon
                return (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                      activePreset?.name === preset.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs text-gray-500">
                          {preset.width}×{preset.height} • {preset.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="w-full text-left text-sm text-gray-600 hover:text-gray-800"
              >
                Reset to normal view
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 