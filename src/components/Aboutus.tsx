import React from 'react';
import { Quote, MapPin, Award, ShieldCheck } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AboutPage = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, type: "tween", ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, type: "tween", ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, type: "tween", ease: "easeOut" }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, type: "tween", ease: "easeOut" }
    }
  };

  // Custom hook for in-view detection with motion
  const useAnimatedSection = (threshold = 0.1) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: threshold
    });
    
    return { ref, inView };
  };

  const heroSection = useAnimatedSection(0.2);
  const heritageSectionLeft = useAnimatedSection(0.2);
  const heritageSectionRight = useAnimatedSection(0.2);
  const valuesSection = useAnimatedSection(0.1);

  return (
    <div className="pt-24 bg-[#FDFCFB] overflow-hidden">
      {/* Narrative Hero */}
      <motion.section 
        ref={heroSection.ref}
        initial="hidden"
        animate={heroSection.inView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
          }
        }}
        className="px-6 max-w-7xl mx-auto py-20 text-center"
      >
        <motion.span 
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
            }
          }}
          className="uppercase tracking-[0.4em] text-[10px] text-stone-400 mb-4 block"
        >
          Since 1992
        </motion.span>
        <motion.h1 
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
            }
          }}
          className="text-5xl md:text-7xl font-serif italic mb-8"
        >
          The Soul of Scent
        </motion.h1>
        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
            }
          }}
          className="max-w-2xl mx-auto text-stone-600 leading-relaxed text-lg font-light"
        >
          AURA was born from a simple realization: that a fragrance is more than just a scent—it is a liquid memory, a silent language, and a personal signature.
        </motion.p>
      </motion.section>

      {/* Heritage Section */}
      <section className="grid md:grid-cols-2 gap-0 overflow-hidden">
        <motion.div 
          ref={heritageSectionLeft.ref}
          initial="hidden"
          animate={heritageSectionLeft.inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: -40 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
            }
          }}
          className="bg-stone-100 flex items-center justify-center p-12 md:p-24"
        >
          <div className="max-w-md">
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
                }
              }}
              className="text-3xl font-serif mb-6 italic"
            >
              Grasse: Our Heartbeat
            </motion.h2>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
                }
              }}
              className="text-stone-600 mb-6 leading-relaxed"
            >
              Every bottle of AURA is formulated in Grasse, France—the perfume capital of the world. Our master perfumers work with rare, hand-picked ingredients to ensure that every note is as pure as nature intended.
            </motion.p>
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
                }
              }}
              className="flex items-center space-x-4 text-stone-400"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest">Provence, France</span>
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          ref={heritageSectionRight.ref}
          initial="hidden"
          animate={heritageSectionRight.inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: 40 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.7, type: "tween", ease: [0.42, 0, 0.58, 1] }
            }
          }}
          className="h-[500px] md:h-auto overflow-hidden"
        >
          <motion.img
              variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.5, type: "tween", ease: [0.42, 0, 0.58, 1] }
              }
            }}
            src="https://www.uzonepackaging.com/wp-content/uploads/2024/03/Perfume-Bottle-Design.webp"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-1000"
            alt="Perfume Workshop"
          />
        </motion.div>
      </section>

      {/* Values Grid */}
      <motion.section 
        ref={valuesSection.ref}
        initial="hidden"
        animate={valuesSection.inView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-16"
      >
        <motion.div 
          variants={fadeInUp as unknown as Variants}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ShieldCheck className="w-8 h-8 mx-auto mb-6 text-stone-300" />
          </motion.div>
          <h3 className="uppercase tracking-widest text-sm mb-4">Pure Intent</h3>
          <p className="text-stone-500 text-sm leading-relaxed">No synthetic fillers or harmful fixatives. Only skin-safe, premium extracts.</p>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp as unknown as Variants}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Award className="w-8 h-8 mx-auto mb-6 text-stone-300" />
          </motion.div>
          <h3 className="uppercase tracking-widest text-sm mb-4">Master Craft</h3>
          <p className="text-stone-500 text-sm leading-relaxed">Artisanally blended in small batches to maintain unparalleled quality control.</p>
        </motion.div>
        
        <motion.div 
            variants={fadeInUp as unknown as Variants}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Quote className="w-8 h-8 mx-auto mb-6 text-stone-300" />
          </motion.div>
          <h3 className="uppercase tracking-widest text-sm mb-4">Global Reach</h3>
          <p className="text-stone-500 text-sm leading-relaxed">Sustainable sourcing from the Moroccan Atlas Mountains to Indian Jasmine fields.</p>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default AboutPage;