import { Instagram } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const InstagramSection = () => {
  // Updated & Verified Fragrance Image URLs
  const images = {
    insta: [
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=400&auto=format&fit=crop", // Minimalist bottle
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&auto=format&fit=crop", // Luxury perfume
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400&auto=format&fit=crop", // Lifestyle/Vogue
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=400&auto=format&fit=crop", // Aesthetic mist
      "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=800&auto=format&fit=crop", // Fragrance close-u
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop", // Elegant setup
    ]
  };

  // Ref and inView hook for scroll animation
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div ref={sectionRef}>
      {/* 9. INSTAGRAM FEED */}
      <section className="py-24 border-t border-stone-100 overflow-hidden">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
          >
            <Instagram className="w-6 h-6 mx-auto mb-4 text-stone-600" />
          </motion.div>
          <motion.h4 
            className="text-sm uppercase tracking-[0.3em] text-stone-500 font-light"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            #AuraInTheWild
          </motion.h4>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-2"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {images.insta.map((url, i) => (
            <motion.div 
              key={i} 
              className="group aspect-square bg-stone-100 overflow-hidden relative"
              variants={itemVariants}
            >
              <motion.div
                className="w-full h-full"
                variants={imageVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={url}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out scale-100 group-hover:scale-110 cursor-crosshair"
                  alt={`Fragrance showcase ${i + 1}`}
                  loading="lazy"
                />
              </motion.div>
              {/* Optional: Overlay on hover */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

export default InstagramSection;