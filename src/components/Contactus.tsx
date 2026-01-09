import React, { useState, ReactNode } from 'react';
import { Mail, Phone, Truck, RotateCcw, ShieldCheck, Gift } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Animation variants with proper typing
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as any }
  }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as any }
  }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as any }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Props interface for AnimatedSection
interface AnimatedSectionProps {
  children: ReactNode;
  variant?: Variants;
  delay?: number;
}

// Component for scroll-triggered animations
const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, variant = fadeInUp, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variant}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export const ContactPage = () => {
  // Form ka data store karne ke liye state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  // Input change handle karne ke liye
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- MAIN CHANGE HERE: SMS Logic ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    // Apna phone number yahan dalein (Country code ke saath, bina + sign ke)
    const phoneNumber = "919016002198";

    // Message ka content taiyar karna
    const messageText = `New Inquiry:
    Name: ${formData.firstName} ${formData.lastName}
    Email: ${formData.email}
    Message: ${formData.message}`;

    // Message ko encode karna taaki URL mein error na aaye
    const encodedMessage = encodeURIComponent(messageText);

    // Check karna ki user iPhone (iOS) par hai ya Android par
    // Kyunki iPhone '&' use karta hai aur Android '?' use karta hai separator ke liye
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const separator = isIos ? '&' : '?';

    // Window location change karke SMS app open karna
    window.location.href = `sms:${phoneNumber}${separator}body=${encodedMessage}`;
  };

  // Array for promise items
  const promiseItems = [
    { icon: Truck, title: "7-Day Global Delivery", text: "Expedited carbon-neutral shipping to over 50 countries worldwide." },
    { icon: RotateCcw, title: "Complimentary Returns", text: "Not your scent? Return any unopened bottle within 30 days, no questions asked." },
    { icon: Gift, title: "Artisanal Gifting", text: "Every order arrives in our signature sustainable box with a hand-written note." },
    { icon: ShieldCheck, title: "Authenticity Secure", text: "Direct from our Grasse laboratory. Guaranteed 100% original formulation." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-24 bg-[#FDFCFB] min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-24 mb-24">
          {/* Left Column - Contact Details */}
          <AnimatedSection variant={fadeInLeft}>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-serif italic mb-8"
              >
                Get in Touch
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-stone-500 mb-12 max-w-md"
              >
                Whether you are looking for a personalized scent recommendation or have a question about your order, our concierge team is here to help.
              </motion.p>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div variants={fadeInUp} className="flex items-start space-x-6">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="bg-stone-100 p-3 rounded-full"
                  >
                    <Mail className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">Email Us</h4>
                    <p className="text-stone-500 text-sm font-light">concierge@aura-scents.com</p>
                  </div>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="flex items-start space-x-6">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="bg-stone-100 p-3 rounded-full"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">Call Us</h4>
                    <p className="text-stone-500 text-sm font-light">+33 (0) 1 42 68 53 00</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Right Column - Form */}
          <AnimatedSection variant={fadeInRight} delay={0.2}>
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white p-10 shadow-[0_10px_50px_rgba(0,0,0,0.03)] border border-stone-100"
            >
              <form className="space-y-6" onSubmit={handleSendMessage}>
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="FIRST NAME"
                      className="w-full border-b border-stone-200 py-3 focus:outline-none focus:border-stone-900 transition text-[10px] tracking-widest"
                      required
                    />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="LAST NAME"
                      className="w-full border-b border-stone-200 py-3 focus:outline-none focus:border-stone-900 transition text-[10px] tracking-widest"
                    />
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="EMAIL ADDRESS"
                    className="w-full border-b border-stone-200 py-3 focus:outline-none focus:border-stone-900 transition text-[10px] tracking-widest"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="HOW CAN WE HELP?"
                    className="w-full border-b border-stone-200 py-3 focus:outline-none focus:border-stone-900 transition text-[10px] tracking-widest resize-none"
                    required
                  ></textarea>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.3em] text-[10px] hover:bg-stone-800 transition"
                  >
                    Send Message via SMS
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </AnimatedSection>
        </div>

        {/* --- Why Choose Us Section --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-stone-100 pt-24"
        >
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-serif italic mb-4"
            >
              The Aura Promise
            </motion.h2>
            
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-px w-16 bg-stone-300 mx-auto"
            ></motion.div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {promiseItems.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center group"
              >
                <div className="mb-6 flex justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="bg-stone-100 p-4 rounded-full"
                  >
                    <item.icon 
                      className="w-10 h-10 text-stone-300 group-hover:text-stone-800 transition-colors duration-500" 
                      strokeWidth={1} 
                    />
                  </motion.div>
                </div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="text-xs uppercase tracking-widest font-bold mb-3"
                >
                  {item.title}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-stone-500 text-sm font-light leading-relaxed"
                >
                  {item.text}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactPage;