"use client"

import { motion, type Variants, type HTMLMotionProps, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState, type ReactNode } from "react"

/* ═══════════════════════════════════════════════════
   ANIMATION VARIANTS — Reusable across the app
   ═══════════════════════════════════════════════════ */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export const slideUp: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: "100%", transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ═══════════════════════════════════════════════════
   SCROLL-TRIGGERED ANIMATION COMPONENT
   Uses IntersectionObserver for viewport-based reveal
   ═══════════════════════════════════════════════════ */

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  /** Custom animation variant. Defaults to fadeInUp */
  variants?: Variants
  /** Delay before animation starts (seconds) */
  delay?: number
  /** How much of the element must be visible. 0–1 */
  threshold?: number
  /** Only animate once? */
  once?: boolean
  /** Direction to animate from */
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export function ScrollReveal({
  children,
  variants,
  delay = 0,
  threshold = 0.15,
  once = true,
  direction = "up",
  className,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const directionVariants: Record<string, Variants> = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight,
  }
  const resolvedVariants = variants || directionVariants[direction] || fadeInUp

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={resolvedVariants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   STAGGER CONTAINER — For grids & lists
   ═══════════════════════════════════════════════════ */

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
  /** Delay between each child item */
  staggerDelay?: number
  /** Only animate once? */
  once?: boolean
  threshold?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  once = true,
  threshold = 0.1,
  ...props
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.05 },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* Stagger Item — Use inside StaggerContainer */
export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE TRANSITION WRAPPER
   Smooth fade + slide for page enters
   ═══════════════════════════════════════════════════ */

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   HOVER SCALE — Subtle lift on hover
   ═══════════════════════════════════════════════════ */

interface HoverScaleProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  scale?: number
  className?: string
}

export function HoverScale({ children, scale = 1.02, className, ...props }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   ANIMATED COUNTER — Number count-up effect
   ═══════════════════════════════════════════════════ */

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

/* ═══════════════════════════════════════════════════
   MAGNETIC BUTTON — Subtle cursor-follow effect
   ═══════════════════════════════════════════════════ */

interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = "translate(0, 0)"
    el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
    setTimeout(() => {
      if (el) el.style.transition = ""
    }, 400)
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ANIMATED PRESENCE WRAPPER — For mount/unmount
   ═══════════════════════════════════════════════════ */

export { AnimatePresence, motion }
