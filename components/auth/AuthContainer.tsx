"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import LoginForm from "./LoginForm"
import SignUpForm from "./SignUpForm"

type AuthMode = "login" | "signup"

const LOGIN_IMAGES = [
  "https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148303/pexels-lum3n-44775-322207_fwt4dw.jpg",
  "https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148206/pexels-pixabay-325876_dkmfu3.jpg",
  "https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148172/pexels-solliefoto-298863_qvqtss.jpg",
]

const SIGNUP_IMAGES = [
  "https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148288/pexels-bohlemedia-1884581_qdtaxl.jpg",
  "https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148259/pexels-hngstrm-1233648_qdiv6g.jpg",
  "https://res.cloudinary.com/dmjh6qjna/image/upload/v1772148221/pexels-bohlemedia-1884584_nh6djs.jpg",
]

export default function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [isAnimating, setIsAnimating] = useState(false)

  // Use the first image as the deterministic SSR default to avoid hydration mismatch,
  // then pick a random one on the client after mount.
  const [loginImg, setLoginImg] = useState(LOGIN_IMAGES[0])
  const [signupImg, setSignupImg] = useState(SIGNUP_IMAGES[0])

  useEffect(() => {
    setLoginImg(LOGIN_IMAGES[Math.floor(Math.random() * LOGIN_IMAGES.length)])
    setSignupImg(SIGNUP_IMAGES[Math.floor(Math.random() * SIGNUP_IMAGES.length)])
  }, [])

  const switchMode = useCallback((newMode: AuthMode) => {
    if (isAnimating || newMode === mode) return
    setIsAnimating(true)
    setMode(newMode)
    setTimeout(() => setIsAnimating(false), 700)
  }, [isAnimating, mode])

  const isLogin = mode === "login"

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${isLogin ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
      {/* ===== IMAGE SECTION (50%) — Left on Login, Right on SignUp ===== */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`panel-img-${mode}`}
          className="relative w-full lg:w-1/2 h-56 sm:h-72 lg:h-full shrink-0 overflow-hidden"
          initial={{ opacity: 0, x: isLogin ? -80 : 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 80 : -80 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={isLogin ? loginImg : signupImg}
            alt="Prova Fashion"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Soft dark overlay */}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* ===== FORM SECTION (50%) — Right on Login, Left on SignUp ===== */}
      <div
        className="relative w-full lg:w-1/2 flex-1 lg:flex-none overflow-y-auto bg-background"
        style={{ perspective: "1200px" }}
      >
        <div className="flex items-center justify-center min-h-full px-6 py-10 lg:py-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`form-${mode}`}
              className={`w-full ${isLogin ? 'max-w-[420px]' : 'max-w-[480px]'}`}
              initial={{
                opacity: 0,
                x: isLogin ? 60 : -60,
                rotateY: isLogin ? 6 : -6,
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotateY: 0,
              }}
              exit={{
                opacity: 0,
                x: isLogin ? -60 : 60,
                rotateY: isLogin ? -6 : 6,
              }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Logo */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <Image
                  src="https://res.cloudinary.com/dmjh6qjna/image/upload/v1771679326/Picture2_uyt4oe.png"
                  alt="Prova"
                  width={130}
                  height={44}
                  className="h-11 w-auto object-contain"
                  priority
                />
              </motion.div>

              {isLogin ? (
                <LoginForm onSwitchToSignUp={() => switchMode("signup")} />
              ) : (
                <SignUpForm onSwitchToLogin={() => switchMode("login")} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
