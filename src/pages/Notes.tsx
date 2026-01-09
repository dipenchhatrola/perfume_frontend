import React from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'

const Notes = () => {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const viewRef = useRef(null)
  const inView = useInView(viewRef, {
    once: true,
    amount: 0.2,
  })

  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [50, 0, 0, -50])
  
  const notesOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  const notesScale = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0.8, 1, 1, 0.8])

  // FIXED: Using 'as const' for TypeScript to understand the array as a literal
  const customEase = [0.22, 1, 0.36, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  }

  const childVariants = {
    hidden: { 
      opacity: 0, 
      y: 40 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: customEase
      }
    }
  }

  const dividerVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0 
    },
    visible: { 
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeInOut",
        delay: 0.2
      }
    }
  }

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.9,
        ease: customEase
      }
    }
  }

  return (
    <div ref={containerRef}>
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <motion.h3 
          className="text-3xl font-serif mb-16 italic text-stone-800"
          variants={titleVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            opacity: titleOpacity,
            y: titleY
          }}
          ref={viewRef}
        >
          Anatomy of a Scent
        </motion.h3>
        
        <motion.div 
          className="space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          style={{
            opacity: notesOpacity,
            scale: notesScale
          }}
        >
          <motion.div 
            className="group cursor-default"
            variants={childVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <h4 className="text-xs uppercase tracking-[0.4em] text-stone-400 mb-2">Top Notes</h4>
            <p className="text-2xl font-serif group-hover:text-amber-700 transition-colors duration-500">Bergamot, Pink Pepper, Neroli</p>
          </motion.div>
          
          <motion.div 
            className="h-px w-32 bg-stone-200 mx-auto"
            variants={dividerVariants as any}
          ></motion.div>
          
          <motion.div 
            className="group cursor-default"
            variants={childVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <h4 className="text-xs uppercase tracking-[0.4em] text-stone-400 mb-2">Heart Notes</h4>
            <p className="text-2xl font-serif group-hover:text-amber-700 transition-colors duration-500">Damask Rose, Jasmine Sambac</p>
          </motion.div>
          
          <motion.div 
            className="h-px w-32 bg-stone-200 mx-auto"
            variants={dividerVariants as any}
          ></motion.div>
          
          <motion.div 
            className="group cursor-default"
            variants={childVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <h4 className="text-xs uppercase tracking-[0.4em] text-stone-400 mb-2">Base Notes</h4>
            <p className="text-2xl font-serif group-hover:text-amber-700 transition-colors duration-500">White Musk, Vanilla Bean, Patchouli</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default Notes