import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type FallingPatternProps = React.ComponentProps<'div'> & {
  color?: string;
  backgroundColor?: string;
  density?: number;
};

export function FallingPattern({
  color = '#2563eb', // primary blue
  backgroundColor = 'transparent',
  density = 1,
  className,
}: FallingPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { theme, systemTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isLight = mounted && (theme === 'light' || (theme === 'system' && systemTheme === 'light'));

  const activeColor = isLight ? '#93c5fd' : color;
  const tailColor = isLight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(2, 6, 23, 0.05)';

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let animationFrameId: number;
    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]/';
    const charArray = characters.split('');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const fontSize = 14 / density;
    let columns = Math.floor(width / fontSize);
    let drops: { y: number, speed: number, text: string, originX: number, currentX: number }[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = parent.clientHeight;
      } else {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
      init();
    };
    window.addEventListener('resize', resize);

    resize();

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    function init() {
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let x = 0; x < columns; x++) {
        drops[x] = {
          y: Math.random() * (height / fontSize),
          speed: 0.5 + Math.random() * 1.5,
          text: charArray[Math.floor(Math.random() * charArray.length)],
          originX: x * fontSize,
          currentX: x * fontSize
        };
      }
    }
    init();

    function draw() {
      ctx.fillStyle = tailColor;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = activeColor;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];

        if (Math.random() > 0.95) {
          drop.text = charArray[Math.floor(Math.random() * charArray.length)];
        }

        const realY = drop.y * fontSize;

        const dx = mouse.x - drop.currentX;
        const dy = mouse.y - realY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const interactionRadius = 120;

        if (distance < interactionRadius) {
          const repelForce = (interactionRadius - distance) / interactionRadius;
          drop.currentX -= (dx / distance) * repelForce * 10;
          ctx.fillStyle = isLight ? '#3b82f6' : '#60a5fa';
          ctx.shadowBlur = 10;
          ctx.shadowColor = isLight ? '#3b82f6' : '#60a5fa';
        } else {
          drop.currentX += (drop.originX - drop.currentX) * 0.1;
          ctx.fillStyle = activeColor;
          ctx.shadowBlur = 4;
          ctx.shadowColor = activeColor;
        }

        ctx.fillText(drop.text, drop.currentX, realY);

        if (realY > height && Math.random() > 0.98) {
          drop.y = 0;
          drop.speed = 0.5 + Math.random() * 1.5;
        }

        drop.y += drop.speed;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeColor, tailColor, density, mounted]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)} style={{ backgroundColor }}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full bg-transparent"
        style={{ opacity: 0.4 }}
      />
    </div>
  );
}
