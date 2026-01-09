import React, { useState, useEffect, useRef } from 'react';
import { Play, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

const IntroVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Reliable cinematic placeholder (Luxury/Interior themed)
  const placeholderImg = "https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&w=1800";
  
  // Sample Video - muted autoplay for background
  const videoSrc = "https://www.w3schools.com/html/mov_bbb.mp4"; 

  // Scroll animations ke liye
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax effect ke liye transforms
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.5]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // Smooth scroll to video play
  const smoothScrollToPlay = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      // Thoda wait karke play karo
      setTimeout(() => setIsPlaying(true), 300);
    }
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Video load hone ka wait karega
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.section 
      ref={sectionRef}
      className="h-screen relative bg-stone-900 flex items-center justify-center overflow-hidden sticky top-0"
      style={{ opacity }}
    >
      {/* 1. Background Video Layer with Parallax Scroll */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: springY, scale }}
      >
        {/* Always playing video in background - muted autoplay */}
        <video 
          src={videoSrc} 
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="auto"
        />
        
        {/* Overlay gradient for better text visibility */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: isInView ? 0.7 : 0.5 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* 2. Play Button UI with Motion Effects */}
      <AnimatePresence>
        {!isPlaying && !isLoading && (
          <motion.div 
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: isInView ? 1 : 0.5, 
              scale: isInView ? 1 : 0.95,
              y: isInView ? 0 : 20
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, type: "spring", damping: 15 }}
          >
            <motion.button 
              onClick={smoothScrollToPlay}
              className="w-28 h-28 border-2 border-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-lg hover:bg-white/10 transition-all duration-500 mb-8 mx-auto group relative shadow-2xl"
              aria-label="Play Video"
              whileHover={{ 
                scale: 1.15,
                boxShadow: "0 0 40px rgba(255,255,255,0.3)",
                borderColor: "rgba(255,255,255,0.6)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulsing ring effect */}
              <motion.div 
                className="absolute inset-0 border border-white/30 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  repeatType: "reverse"
                }}
              />
              
              <motion.div
                animate={{ rotate: isInView ? 0 : 360 }}
                transition={{ duration: 0.5 }}
              >
                <Play size={40} fill="currentColor" className="ml-2 relative z-10" />
              </motion.div>
            </motion.button>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isInView ? "100%" : "0%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-px bg-white/30 mx-auto mb-6 max-w-xs"
            />
            
            <motion.p 
              className="text-white uppercase tracking-[0.5em] text-sm font-light"
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: isInView ? 0 : 20, 
                opacity: isInView ? 1 : 0 
              }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Watch the Campaign
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Fullscreen Video Player */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={(e) => e.target === e.currentTarget && setIsPlaying(false)}
          >
            <motion.div 
              className="relative w-full max-w-6xl h-full max-h-[85vh] mx-4"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
            >
              <video 
                src={videoSrc} 
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
                controls
                autoPlay
                muted={isMuted}
              />

              {/* Floating close button */}
              <motion.button 
                onClick={() => setIsPlaying(false)}
                className="absolute -top-16 right-0 text-white/90 hover:text-white transition-colors bg-black/50 p-3 rounded-full backdrop-blur-lg z-30 border border-white/10"
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 180,
                  backgroundColor: "rgba(255,255,255,0.1)"
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <X size={24} />
              </motion.button>

              {/* Floating mute button */}
              <motion.button 
                onClick={() => setIsMuted(!isMuted)}
                className="absolute -bottom-16 right-0 text-white/90 hover:text-white transition-colors bg-black/50 p-3 rounded-full backdrop-blur-lg z-30 border border-white/10"
                whileHover={{ 
                  scale: 1.15,
                  backgroundColor: "rgba(255,255,255,0.1)"
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {isMuted ? 
                  <VolumeX size={22} /> : 
                  <Volume2 size={22} />
                }
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="absolute inset-0 z-40 flex items-center justify-center bg-stone-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 border-3 border-white/10 border-t-white rounded-full mx-auto mb-6"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              <motion.p 
                className="text-white/70 text-sm tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                LOADING EXPERIENCE
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default IntroVideo;