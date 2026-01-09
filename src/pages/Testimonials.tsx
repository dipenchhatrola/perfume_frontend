import { Star } from 'lucide-react';
import React from 'react'
import { motion } from 'framer-motion';
import { useRef } from 'react';

const Testimonials = () => {
  const images = {
    hero: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop",
    product1: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=800&auto=format&fit=crop",
    product2: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    product3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop",
    ingredients: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=1200&auto=format&fit=crop",
    cinematic: "https://images.unsplash.com/photo-1616132422478-db7e14a839b0?q=80&w=1800&auto=format&fit=crop",
    lifestyle2: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=400&auto=format&fit=crop",
    lifestyle1: "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=400&auto=format&fit=crop",
    insta: [
      "https://images.unsplash.com/photo-1595475243692-3839303bc2d5?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608528577221-9082fb305018?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619994403073-20d4a8bb63de?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615214072943-d00b39f73ea2?q=80&w=400&auto=format&fit=crop"
    ]
  };

  // SCROLL MOTION KE LIYE REF
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <section className="py-24 px-6 overflow-hidden">
        {/* SCROLL MOTION WALA CONTAINER */}
        <motion.div 
          ref={containerRef}
          className="max-w-7xl mx-auto flex flex-row overflow-x-auto gap-16 items-center snap-x snap-mandatory no-scrollbar pb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Pehla Review Block - SCROLL ANIMATION */}
          <motion.div 
            className="min-w-full md:min-w-full flex flex-col md:flex-row gap-16 items-center snap-center"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.8
            }}
          >
            <div className="md:w-1/3">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                  >
                    <Star className="w-4 h-4 fill-black" />
                  </motion.div>
                ))}
              </div>
              <motion.p 
                className="text-2xl font-serif italic leading-snug"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                "This is the first perfume that actually lasts 12+ hours on my skin. I get compliments every single day."
              </motion.p>
              <motion.p 
                className="mt-6 text-xs uppercase tracking-widest text-stone-400"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                — Sarah J., New York
              </motion.p>
            </div>
            <div className="md:w-2/3 grid grid-cols-2 gap-4">
              <motion.img 
                src={images.lifestyle2} 
                className="w-full aspect-square object-cover rounded-sm" 
                alt="Review 1"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              />
              <motion.img 
                src={images.lifestyle2} 
                className="w-full aspect-square object-cover rounded-sm" 
                alt="Review 2"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              />
            </div>
          </motion.div>

          {/* Doosra Review Block - SCROLL ANIMATION */}
          <motion.div 
            className="min-w-full md:min-w-full flex flex-col md:flex-row gap-16 items-center snap-center"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.8
            }}
          >
            <div className="md:w-1/3">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                  >
                    <Star className="w-4 h-4 fill-black" />
                  </motion.div>
                ))}
              </div>
              <motion.p 
                className="text-2xl font-serif italic leading-snug"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                "The fragrance is subtle yet long-lasting. Perfect for evening wear."
              </motion.p>
              <motion.p 
                className="mt-6 text-xs uppercase tracking-widest text-stone-400"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                — Elena W., Paris
              </motion.p>
            </div>
            <div className="md:w-2/3 grid grid-cols-2 gap-4">
              <motion.img 
                src={images.lifestyle2} 
                className="w-full aspect-square object-cover rounded-sm" 
                alt="Review 3"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              />
              <motion.img 
                src={images.lifestyle2} 
                className="w-full aspect-square object-cover rounded-sm" 
                alt="Review 4"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              />
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Scrollbar hide karne ke liye style */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default Testimonials