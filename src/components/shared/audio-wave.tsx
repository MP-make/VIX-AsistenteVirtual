import { useEffect, useRef } from 'react';

interface AudioWaveProps {
  isActive: boolean;
}

export function AudioWave({ isActive }: AudioWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d')!;
    const bars = 48;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const amplitude = Math.sin(frame * 0.05 + i * 0.3) * 0.5 + 0.5;
        const height = amplitude * canvas.height * 0.8;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        const hue = 270 + Math.sin(frame * 0.02 + i * 0.1) * 30;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
      }

      frame++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={48}
      className="hardware-accelerated"
    />
  );
}
