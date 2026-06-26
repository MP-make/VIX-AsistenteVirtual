import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface AudioWaveProps {
  isActive: boolean
  className?: string
}

export function AudioWave({ isActive, className }: AudioWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isActive) return

    const ctx = canvas.getContext('2d')!
    const bars = 36
    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const w = canvas.width / bars

      for (let i = 0; i < bars; i++) {
        const amp = Math.sin(frame * 0.04 + i * 0.35) * 0.5 + 0.5
        const h = amp * canvas.height * 0.7
        const x = i * w
        const y = (canvas.height - h) / 2
        ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + amp * 0.5})`
        ctx.beginPath()
        ctx.roundRect(x + 1, y, w - 2, h, [3, 3])
        ctx.fill()
      }

      frame++
      raf.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf.current)
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={36}
      className={clsx('rounded-lg', className)}
    />
  )
}
