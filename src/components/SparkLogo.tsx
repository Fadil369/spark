import { motion } from 'framer-motion'

interface SparkLogoProps {
  className?: string
  animated?: boolean
}

export function SparkLogo({ className = '', animated = false }: SparkLogoProps) {
  if (animated) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <motion.path
          d="M50 10 C35 25, 30 40, 35 55 C38 65, 42 72, 50 85 C58 72, 62 65, 65 55 C70 40, 65 25, 50 10 Z"
          fill="currentColor"
          opacity="0.9"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.path
          d="M50 25 C42 35, 40 45, 43 55 C45 62, 47 68, 50 75 C53 68, 55 62, 57 55 C60 45, 58 35, 50 25 Z"
          fill="currentColor"
          opacity="0.7"
          className="brightness-125"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        
        <motion.circle
          cx="45"
          cy="20"
          r="2"
          fill="currentColor"
          opacity="0.6"
          animate={{
            y: [0, -3, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.5, 1]
          }}
        />
        
        <motion.circle
          cx="55"
          cy="15"
          r="1.5"
          fill="currentColor"
          opacity="0.6"
          animate={{
            y: [0, -3, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.5, 1],
            delay: 0.3
          }}
        />
        
        <motion.circle
          cx="38"
          cy="28"
          r="1"
          fill="currentColor"
          opacity="0.6"
          animate={{
            y: [0, -3, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.5, 1],
            delay: 0.6
          }}
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 10 C35 25, 30 40, 35 55 C38 65, 42 72, 50 85 C58 72, 62 65, 65 55 C70 40, 65 25, 50 10 Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      <path
        d="M50 25 C42 35, 40 45, 43 55 C45 62, 47 68, 50 75 C53 68, 55 62, 57 55 C60 45, 58 35, 50 25 Z"
        fill="currentColor"
        opacity="0.7"
        className="brightness-125"
      />
      
      <circle
        cx="45"
        cy="20"
        r="2"
        fill="currentColor"
        opacity="0.6"
      />
      
      <circle
        cx="55"
        cy="15"
        r="1.5"
        fill="currentColor"
        opacity="0.6"
      />
      
      <circle
        cx="38"
        cy="28"
        r="1"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )
}
