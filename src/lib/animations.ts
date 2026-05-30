import type { Variants, Transition } from 'framer-motion'

export const springConfig: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
}

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: softSpring,
  },
  hover: { scale: 1.02, transition: springConfig },
  tap: { scale: 0.98 },
}

export const completionVariants: Variants = {
  unchecked: { scale: 1 },
  checked: {
    scale: [1, 1.35, 1],
    transition: { duration: 0.4, times: [0, 0.4, 1] },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeInOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: softSpring },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: springConfig },
}
