import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { palette, typography } from '../../lib/theme';
import { useReducedMotion } from '../../lib/motion';

/**
 * 1. LivingCounter: Smooth numerical counter interpolation using requestAnimationFrame
 */
export function LivingCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1000,
  className = '',
  style = {},
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef(value);
  const endValRef = useRef(value);

  useEffect(() => {
    startValRef.current = prevValueRef.current;
    endValRef.current = value;
    startTimeRef.current = null;

    let animId: number;

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // Easing: easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValRef.current + (endValRef.current - startValRef.current) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = value;
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span
      className={className}
      style={{
        fontFamily: typography.fontMono,
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
}

/**
 * 2. LivingProgressRing: Organic circular progress ring with gradient and spring sweep
 */
export function LivingProgressRing({
  progress, // 0 to 100
  size = 56,
  strokeWidth = 5,
  color = palette.primary,
  trackColor = '#E9E4DA',
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * 3. MagneticButton: Subtle magnetic pull toward cursor position with spring release
 */
export function MagneticButton({
  children,
  onClick,
  style = {},
  strength = 0.25,
  variant = 'primary',
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  strength?: number;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  title?: string;
}) {
  const { prefersReduced } = useReducedMotion();
  const ref = useRef<HTMLButtonElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 350, damping: 25 });
  const springY = useSpring(y, { stiffness: 350, damping: 25 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (prefersReduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: palette.primary,
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(230, 107, 69, 0.25)',
        };
      case 'secondary':
        return {
          background: palette.secondary,
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(52, 87, 164, 0.25)',
        };
      case 'outline':
        return {
          background: palette.bgSecondary,
          color: palette.textMain,
          border: `1px solid ${palette.borderDark}`,
          boxShadow: palette.shadowSoft,
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: palette.textMain,
          border: '1px solid transparent',
        };
    }
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: prefersReduced ? 1 : 1.02 }}
      whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
      title={title}
      style={{
        x: springX,
        y: springY,
        cursor: 'pointer',
        padding: '10px 18px',
        borderRadius: 8,
        fontFamily: typography.fontBody,
        fontSize: 13,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        outline: 'none',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

/**
 * 4. PerspectiveCard: Subtle architectural 3D card tilt based on pointer coords
 */
export function PerspectiveCard({
  children,
  style = {},
  maxTilt = 4,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  maxTilt?: number;
  onClick?: () => void;
}) {
  const { prefersReduced } = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -maxTilt;
    const rY = ((x - centerX) / centerX) * maxTilt;

    rotateX.set(rX);
    rotateY.set(rY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1000, display: 'flex', flexDirection: 'column' }}>
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
          background: palette.bgSecondary,
          borderRadius: 12,
          border: `1px solid ${palette.border}`,
          boxShadow: palette.shadowSoft,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          ...style,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * 5. MaskReveal: Cinematic mask-based heading reveal
 */
export function MaskReveal({
  children,
  delay = 0,
  duration = 0.6,
  style = {},
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const { prefersReduced } = useReducedMotion();

  if (prefersReduced) {
    return <div style={style}>{children}</div>;
  }

  return (
    <div style={{ overflow: 'hidden', display: 'inline-block', ...style }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1], // Smooth editorial spring easing
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * 6. DynamicHeatmapBadge: Pulsing breathing room occupancy indicator
 */
export function DynamicHeatmapBadge({
  occupancy,
  capacity,
}: {
  occupancy: number;
  capacity: number;
}) {
  const pct = Math.round((occupancy / capacity) * 100);
  const isHigh = pct >= 85;
  const isMed = pct >= 60 && pct < 85;

  const bg = isHigh ? '#FDF5F2' : isMed ? '#FEF9E7' : '#F1F5E4';
  const color = isHigh ? palette.primary : isMed ? '#8C6B00' : palette.successText;
  const dotColor = isHigh ? palette.primary : isMed ? palette.warning : palette.success;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        borderRadius: 20,
        background: bg,
        border: `1px solid ${color}33`,
        fontFamily: typography.fontMono,
        fontSize: 11,
        fontWeight: 700,
        color,
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.3, 0.8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
        }}
      />
      <span>{pct}% OCCUPIED</span>
    </div>
  );
}
