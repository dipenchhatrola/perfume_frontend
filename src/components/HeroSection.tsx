import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, Variants } from 'framer-motion';

const HeroSection: React.FC = () => {
  const images = {
    hero: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop",
    product1: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=800&auto=format&fit=crop",
    product2: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    product3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop",
    ingredients: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=1200&auto=format&fit=crop",
    cinematic: "https://images.unsplash.com/photo-1616132422478-db7e14a839b0?q=80&w=1800&auto=format&fit=crop",
    lifestyle1: "https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?q=80&w=800&auto=format&fit=crop",
    lifestyle2: "https://images.unsplash.com/photo-1583467875263-d50dec37a88c?q=80&w=800&auto=format&fit=crop",
    insta: [
      "https://images.unsplash.com/photo-1595475243692-3839303bc2d5?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608528577221-9082fb305018?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619994403073-20d4a8bb63de?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615214072943-d00b39f73ea2?q=80&w=400&auto=format&fit=crop"
    ]
  };

  // Scroll animations
  const { scrollYProgress } = useScroll();

  // Parallax effects - scroll ke saath elements move honge
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const buttonOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const buttonScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Smooth spring animation for smooth scroll effects
  const smoothBackgroundY = useSpring(backgroundY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const smoothTextY = useSpring(textY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Animation variants for initial load
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.8
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.3)",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const backgroundVariants: Variants = {
    hidden: { scale: 1.1 },
    visible: {
      scale: 1,
      transition: {
        duration: 2,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      {/* 2. HERO SECTION */}
      <section id="hero" className="relative h-screen flex items-center overflow-hidden sticky top-0">
        {/* Background Image with Parallax Scroll Effect */}
        <motion.div
          className="absolute inset-0 z-0"
          initial="hidden"
          animate="visible"
          variants={backgroundVariants}
          style={{ y: smoothBackgroundY }}
        >
          <img
            src={images.hero}
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        </motion.div>

        {/* Content Container with Scroll Fade Effect */}
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 text-white w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            y: textY,
            opacity: textOpacity
          }}
        >
          {/* Location Text */}
          <motion.span
            className="uppercase tracking-[0.5em] text-xs mb-6 block"
            variants={textVariants}
          >
            Paris • Grasse • Dubai
          </motion.span>

          {/* Main Heading */}
          <motion.h2
            className="text-6xl md:text-8xl font-serif mb-8 leading-tight"
            variants={textVariants}
          >
            The Art of <br />
            <span className="italic">Invisibility</span>
          </motion.h2>

          {/* Button with Scroll Effects */}
          <Link to="/products" className="inline-block">
            <motion.button
              className="border border-white px-12 py-4 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all duration-500 relative overflow-hidden group"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              style={{
                opacity: buttonOpacity,
                scale: buttonScale
              }}
            >
              {/* Button Background Effect */}
              <motion.span
                className="absolute inset-0 bg-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Button Text */}
              <span className="relative z-10 flex items-center gap-2">
                Explore Collection
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    repeatDelay: 1
                  }}
                >
                  <ArrowRight size={16} />
                </motion.span>
              </span>
            </motion.button>
          </Link>

          {/* Floating Elements with Scroll Interaction */}
          <motion.div
            className="absolute top-10 right-10"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0])
            }}
          >
            <Sparkles className="text-white/20" size={40} />
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-5"
            animate={{
              y: [0, 15, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
              delay: 0.5
            }}
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0])
            }}
          >
            <Star className="text-white/15" size={30} />
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
          animate={{
            y: [0, 10, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0])
          }}
        >
          <div className="text-white text-xs uppercase tracking-widest mb-2">
            Scroll to explore
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-white/80 to-transparent mx-auto"></div>
        </motion.div>
      </section>
    </>
  );
};

export default HeroSection;