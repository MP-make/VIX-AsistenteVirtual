import { useEffect, useState } from 'react'

interface FloatingPointsProps {
  puntos: number
  onDone: () => void
}

export function FloatingPoints({ puntos, onDone }: FloatingPointsProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDone()
    }, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-float-up text-4xl font-bold text-emerald-500 drop-shadow-lg">
        +{puntos} pts
      </div>
    </div>
  )
}
