import { useState } from 'react';
import HeroSection from 'components/HeroSection';
import ProductGrid from 'pages/ProductGrid';
import Ingrediants from 'pages/Ingrediants';
import Notes from 'pages/Notes';
import InstagramSection from 'pages/InstagramSection';
import Testimonials from 'pages/Testimonials';

const HomePage = () => {
  const [] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-light overflow-x-hidden">
      <HeroSection />
      <ProductGrid />
      <Ingrediants />
      <Notes />
      <Testimonials />
      <InstagramSection />
    </div>
  );
};

export default HomePage;