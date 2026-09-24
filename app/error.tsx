'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Sayfa Yükleme Hatası:', error)
  }, [error])

  return (
    <>
      <div className="w-full py-12 flex items-center justify-center text-neutral-500 text-sm">
        <p>Bu sayfanın verisi yüklenemedi. Sitede gezinmeye devam edebilirsiniz.</p>
      </div>

      <div className="fixed bottom-4 right-4 z-[9999] bg-neutral-900/90 border border-red-500/30 text-white p-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </div>

        <span className="text-neutral-300">
          Sayfa tam yüklenemedi
        </span>

        <button
          onClick={() => reset()}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2 py-1 rounded text-[11px] border border-neutral-700 transition"
        >
          Tekrar Deneyin
        </button>
      </div>
    </>
  )
}
