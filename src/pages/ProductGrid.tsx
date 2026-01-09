import React from 'react'
import { motion, easeOut } from 'framer-motion'

const ProductGrid = () => {
  const images = {
    hero: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop",
    product1: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=800&auto=format&fit=crop",
    product2: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    product3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop",
    ingredients: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=1200&auto=format&fit=crop",
    cinematic: "https://images.unsplash.com/photo-1616132422478-d7e14a839b0?q=80&w=1800&auto=format&fit=crop",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1.1 },
    visible: {
      scale: 1,
      transition: {
        duration: 1,
        ease: easeOut
      }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0.05 },
    hover: { opacity: 0.2 }
  };

  return (
    <div>
      {/* 3. PRODUCT GRID */}
      <section id="collection" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-serif mb-4 italic">The Signature Collection</h3>
          <motion.div 
            className="h-px w-20 bg-stone-300 mx-auto"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { name: "Oud Noir", img: images.product1, price: "$210" },
            { name: "Rose Water", img: images.product2, price: "$185" },
            { name: "Sand & Cedar", img: images.product3, price: "$195" }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              className="group text-center"
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="relative overflow-hidden mb-6 bg-stone-100 aspect-[3/4]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  variants={imageVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute inset-0 bg-black/5"
                  variants={overlayVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </motion.div>
              <motion.h4 
                className="uppercase tracking-widest text-sm mb-2"
                whileHover={{ letterSpacing: "0.3em" }}
                transition={{ duration: 0.3 }}
              >
                {item.name}
              </motion.h4>
              <motion.p 
                className="text-stone-500 font-serif"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {item.price}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}

export default ProductGrid