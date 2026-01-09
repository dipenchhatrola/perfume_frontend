import { Droplets, Leaf } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Ingrediants = () => {
  const images = {
    hero: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop",
    product1: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=800&auto=format&fit=crop",
    product2: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    product3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop",
    ingredients: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=cropp",
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        delay: 0.5
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  // Create ref and check if in view
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <div ref={ref}>
      <section id="notes" className="py-24 bg-[#F4F1EE]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            className="relative"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.img
              src={images.ingredients}
              className="w-full grayscale-[20%] rounded-sm"
              alt="Ingredients"
              variants={imageVariants}
            />
            <motion.div
              className="absolute -bottom-10 -right-10 bg-white p-10 hidden lg:block border border-stone-100 shadow-sm"
              variants={badgeVariants}
            >
              <p className="text-4xl font-serif italic">98%</p>
              <p className="text-[10px] uppercase tracking-widest text-stone-500">Natural Essence</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.span
              className="text-stone-400 uppercase tracking-widest text-xs mb-4 block"
              variants={itemVariants}
            >
              Our Philosophy
            </motion.span>

            <motion.h3
              className="text-4xl font-serif mb-8 leading-snug"
              variants={itemVariants}
            >
              Sustainable luxury, <br />from earth to skin.
            </motion.h3>

            <motion.p
              className="text-stone-600 leading-relaxed mb-10"
              variants={itemVariants}
            >
              We source our jasmine from family-owned farms in Grasse and our sandalwood from protected forests.
            </motion.p>

            <motion.div
              className="space-y-6"
              variants={containerVariants}
            >
              <motion.div
                className="flex items-center space-x-4 border-b border-stone-200 pb-4"
                variants={itemVariants}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <motion.div
                  variants={iconVariants}
                  whileHover={{ rotate: 15, transition: { duration: 0.3 } }}
                >
                  <Leaf className="w-5 h-5 text-stone-400" />
                </motion.div>
                <span className="text-sm uppercase tracking-wider">Vegan & Cruelty Free</span>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 border-b border-stone-200 pb-4"
                variants={itemVariants}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <motion.div
                  variants={iconVariants}
                  whileHover={{ rotate: 15, transition: { duration: 0.3 } }}
                >
                  <Droplets className="w-5 h-5 text-stone-400" />
                </motion.div>
                <span className="text-sm uppercase tracking-wider">Paraben Free Formula</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Ingrediants;