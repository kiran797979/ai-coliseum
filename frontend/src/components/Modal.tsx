import { useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: any
  size?: 'sm' | 'md' | 'lg'
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-label={title || 'Modal'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[modalFadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative ${sizes[size]} w-full animate-[modalSlideUp_0.3s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-[#12132e] to-[#0b0c1a] border border-gray-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.1)] overflow-hidden">

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
              >
                ✕
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5">
            {children}
          </div>

          {/* No title = show inline close */}
          {!title && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}