import React from 'react';
import Header from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import FeaturedLearningPaths from './components/FeaturedLearningPaths';
import PlatformDemo from './components/PlatformDemo';
import GamificationSection from './components/GamificationSection';
import Footer from './components/Footer';

export default function index() {
  return (
    <div className='min-h-screen bg-background'>
        <Header/>
        <main>
            <HeroSection/>
            <FeaturesSection/>
            <FeaturedLearningPaths/>
            <PlatformDemo/>
            <GamificationSection/>
        </main>
        <Footer/>
    </div>
  )
}
