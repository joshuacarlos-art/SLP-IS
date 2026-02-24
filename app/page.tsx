"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  LogIn, 
  Users, 
  BarChart3, 
  Heart, 
  Target, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  X,
  Menu
} from "lucide-react";
import { Parallax, ParallaxLayer, IParallax } from "@react-spring/parallax";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Animated component wrapper
const MotionDiv = motion.div;

// Fixed: Use rounded values to prevent hydration mismatch
const getGridPosition = (index: number, total: number, offset = 0) => {
  const position = Math.floor((index / total) * 10000) / 100;
  return ((position + offset) % 100).toFixed(2);
};

const getZTransform = (index: number) => {
  return Math.floor(Math.sin(index * 0.5) * 10000) / 100;
};

const getParticlePosition = (index: number) => {
  const seed = index * 0.6180339887;
  return {
    left: ((Math.floor(Math.sin(seed) * 500) / 1000 + 0.5) * 80 + 10) % 100,
    top: ((Math.floor(Math.cos(seed * 1.618) * 500) / 1000 + 0.5) * 80 + 10) % 100,
  };
};

// Container variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const parallaxRef = useRef<IParallax>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation handler
  const scrollToSection = (section: number) => {
    setActiveSection(section);
    setIsScrolling(true);
    
    if (parallaxRef.current) {
      parallaxRef.current.scrollTo(section);
      setTimeout(() => {
        setActiveSection(section);
        setIsScrolling(false);
      }, 500);
    }
    setMenuOpen(false);
  };

  // Handle scroll events
  const handleScroll = (offset: number) => {
    const section = Math.round(offset);
    if (!isScrolling && section !== activeSection) {
      setActiveSection(section);
    }
  };

  // Framer Motion variants
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.5,
        ease: "easeIn",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Pre-calculate grid positions with reduced complexity on mobile
  const verticalLines = Array.from({ length: isMobile ? 15 : 25 }).map((_, i) => ({
    left: getGridPosition(i, isMobile ? 15 : 25),
    z: getZTransform(i)
  }));

  const horizontalLines = Array.from({ length: isMobile ? 15 : 25 }).map((_, i) => ({
    top: getGridPosition(i, isMobile ? 15 : 25),
    z: getZTransform(i * 1.618)
  }));

  const gridDots = Array.from({ length: isMobile ? 20 : 50 }).map((_, i) => {
    const row = Math.floor(i / (isMobile ? 5 : 10));
    const col = i % (isMobile ? 5 : 10);
    return {
      left: (col * (isMobile ? 20 : 10) + 5).toFixed(2),
      top: (row * (isMobile ? 20 : 10) + 5).toFixed(2),
      z: Math.floor(Math.sin(i) * 10000) / 100
    };
  });

  const particles = Array.from({ length: isMobile ? 8 : 15 }).map((_, i) => {
    const pos = getParticlePosition(i);
    return {
      left: pos.left.toFixed(2),
      top: pos.top.toFixed(2),
      xMovement: Math.sin(i * 0.3) * (isMobile ? 20 : 50),
      yMovement: Math.cos(i * 0.3) * (isMobile ? 20 : 50),
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* 3D Background Grid - Client Side Only */}
      {isClient && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Vertical Lines */}
          <div className="absolute inset-0 perspective-[1000px]">
            {verticalLines.map((line, i) => (
              <MotionDiv
                key={`vertical-${i}`}
                className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
                style={{ 
                  left: `${line.left}%`,
                  transform: `translateZ(${line.z}px)`
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
            
            {/* Horizontal Lines */}
            {horizontalLines.map((line, i) => (
              <MotionDiv
                key={`horizontal-${i}`}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent"
                style={{ 
                  top: `${line.top}%`,
                  transform: `translateZ(${line.z}px)`
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Floating Grid Dots */}
          <div className="absolute inset-0 perspective-[2000px]">
            {gridDots.map((dot, i) => (
              <MotionDiv
                key={`grid-dot-${i}`}
                className="absolute w-[2px] h-[2px] bg-primary/40 rounded-full"
                style={{
                  left: `${dot.left}%`,
                  top: `${dot.top}%`,
                  transform: `translateZ(${dot.z}px)`,
                }}
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 0.7, 0.3],
                  transform: [
                    `translateZ(${dot.z}px)`,
                    `translateZ(${Number(dot.z) + (isMobile ? 20 : 50)}px)`,
                    `translateZ(${dot.z}px)`,
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Animated Particles */}
          <div className="absolute inset-0">
            {particles.map((particle, i) => (
              <MotionDiv
                key={`particle-${i}`}
                className="absolute w-[1px] h-[1px] bg-primary/30 rounded-full"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  x: [0, particle.xMovement, 0],
                  y: [0, particle.yMovement, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3 + (i * 0.2),
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Grid Line Animation */}
          <div className="absolute inset-0">
            {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
              <MotionDiv
                key={`grid-line-${i}`}
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                style={{
                  transform: `rotate(${45 + i * 30}deg)`,
                  top: `${i * (isMobile ? 40 : 25)}%`,
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 3,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <MotionDiv
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-full h-full bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
            </button>
            <div className="space-y-6 sm:space-y-8 text-center px-4">
              {["Home", "About Program", "Projects", "Contact"].map((item, index) => (
                <MotionDiv
                  key={item}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button 
                    onClick={() => scrollToSection(index)}
                    className="block text-xl sm:text-2xl md:text-3xl font-bold text-primary hover:text-primary/80 transition-colors py-2"
                  >
                    {item}
                  </button>
                </MotionDiv>
              ))}
              <div className="pt-6 sm:pt-8 space-y-3 sm:space-y-4">
                <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth/register">
                    <Button size="lg" className="rounded-full px-6 sm:px-8 w-full max-w-xs sm:max-w-sm">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                </MotionDiv>
                <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8 w-full max-w-xs sm:max-w-sm">
                      <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Sign In
                    </Button>
                  </Link>
                </MotionDiv>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
      <MotionDiv
        initial={{ x: 100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: activeSection === 3 ? 0 : 1,
          pointerEvents: activeSection === 3 ? 'none' : 'auto'
        }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed top-6 right-6 z-40 hidden md:flex items-center gap-6"
      >
        {/* Navigation Menu - Hidden on contact section */}
        <MotionDiv
          animate={{
            opacity: activeSection === 3 ? 0 : 1,
            scale: activeSection === 3 ? 0.9 : 1,
            pointerEvents: activeSection === 3 ? 'none' : 'auto'
          }}
          transition={{ duration: 0.3 }}
          className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-border"
        >
          <div className="flex gap-6">
            {["Home", "About", "Projects", "Contact"].map((item, index) => (
              <MotionDiv
                key={item}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => scrollToSection(index)}
                  className={`text-sm font-medium transition-all ${
                    activeSection === index
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* Sign In and Get Started Buttons - Always Visible */}
        <div className="flex gap-3">
          <MotionDiv 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="rounded-full">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </MotionDiv>
          <MotionDiv 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/auth/register">
              <Button size="sm" className="rounded-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </MotionDiv>
        </div>
      </MotionDiv>

      {/* Mobile Menu Button - Hidden on contact section */}
      <MotionDiv
        animate={{
          opacity: activeSection === 3 ? 0 : 1,
          scale: activeSection === 3 ? 0.9 : 1,
          pointerEvents: activeSection === 3 ? 'none' : 'auto'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 md:hidden bg-background/80 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg border border-border"
      >
        <button onClick={() => setMenuOpen(true)} className="p-1">
          <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
        </button>
      </MotionDiv>

      {/* Logo with Sustainable Livelihood Program Text */}
      <MotionDiv
        initial={{ x: -50, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: activeSection === 3 ? 0 : 1,
          pointerEvents: activeSection === 3 ? 'none' : 'auto'
        }}
        transition={{ delay: 0.7, type: "spring" }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-40"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <MotionDiv
            animate={{
              scale: [1, 1.05, 1],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/slp.png" 
              alt="Sustainable Livelihood Program" 
              className="h-8 w-auto sm:h-10 object-contain" 
            />
          </MotionDiv>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-primary">DSWD</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
              Sustainable<br className="hidden xs:block" /> Livelihood Program
            </p>
          </div>
        </div>
      </MotionDiv>

      {/* Parallax Container */}
      <Parallax 
        ref={parallaxRef} 
        pages={4} 
        className="w-full"
        onChange={(e: any) => handleScroll(e.offset)}
      >
        {/* SECTION 1: HERO */}
        <ParallaxLayer offset={0} speed={0.5} className="relative z-10">
          <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
              <MotionDiv
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center space-y-8 sm:space-y-12"
              >
                <MotionDiv variants={itemVariants} className="space-y-6 sm:space-y-10 pt-16 sm:pt-24">
                  {/* Responsive Main Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-1 sm:mb-2">
                      SUSTAINABLE
                    </span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary/60 mb-1 sm:mb-2">
                      LIVELIHOOD
                    </span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                      PROGRAM
                    </span>
                  </h1>
                  <div className="space-y-4 sm:space-y-6">
                    <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light italic">
                      "Sibol Kakayahan, Sibol Kabuhayan"
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">
                      Department of Social Welfare and Development
                    </p>
                  </div>
                </MotionDiv>

                <MotionDiv variants={itemVariants} className="max-w-2xl mx-auto mt-6 sm:mt-10">
                  <p className="text-base sm:text-lg md:text-xl text-foreground/80 leading-relaxed tracking-wide bg-background/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                    Empowering communities through sustainable livelihood initiatives and capacity building programs.
                  </p>
                </MotionDiv>

                <MotionDiv 
                  variants={containerVariants}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mt-8 sm:mt-12"
                >
                  {[
                    { icon: Heart, title: "Community Focus", desc: "Supporting vulnerable sectors" },
                    { icon: Users, title: "Capacity Building", desc: "Skills and livelihood training" },
                    { icon: Target, title: "Sustainable Impact", desc: "Long-term community development" }
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <MotionDiv
                        key={feature.title}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="group relative"
                      >
                        <div className="p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-b from-background/50 to-secondary/5 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 space-y-3 sm:space-y-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                          </div>
                          <h3 className="text-base sm:text-lg md:text-lg font-semibold">{feature.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                      </MotionDiv>
                    );
                  })}
                </MotionDiv>

                <MotionDiv
                  variants={itemVariants}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pt-8 sm:pt-12 md:pt-16"
                >
                  <button 
                    onClick={() => scrollToSection(1)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm">Scroll to explore</span>
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 rotate-90 animate-bounce" />
                    </div>
                  </button>
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </ParallaxLayer>

        {/* SECTION 2: ABOUT */}
        <ParallaxLayer offset={1} speed={1} className="relative z-10">
          <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8 sm:space-y-12 md:space-y-16"
              >
                <div className="text-center space-y-4 sm:space-y-6">
                  {/* Responsive Section Title */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                      About the Program
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                    Empowering communities through sustainable development and capacity building
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
                  <div className="space-y-6 sm:space-y-8 md:space-y-10">
                    {[
                      {
                        icon: Shield,
                        title: "Our Mission",
                        description: "To empower poor households by improving their capabilities to manage sustainable micro-enterprises and link them to locally available jobs."
                      },
                      {
                        icon: Globe,
                        title: "Our Vision",
                        description: "To have sustainable and resilient communities where individuals are economically stable and socially protected."
                      }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <MotionDiv
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="group"
                        >
                          <div className="p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-background/50 to-secondary/5 border border-border/50 hover:border-primary/30 transition-all duration-300 space-y-3 sm:space-y-4">
                            <div className="flex items-start gap-4 sm:gap-6">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                              </div>
                              <div className="flex-1 space-y-2 sm:space-y-3">
                                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{item.title}</h3>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        </MotionDiv>
                      );
                    })}
                  </div>

                  <div className="space-y-6 sm:space-y-8 md:space-y-10">
                    <MotionDiv
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
                    >
                      {[
                        { value: "50K+", label: "Beneficiaries" },
                        { value: "2,500+", label: "Communities" },
                        { value: "15+", label: "Years" },
                        { value: "95%", label: "Success Rate" },
                      ].map((stat, index) => (
                        <MotionDiv
                          key={stat.label}
                          variants={itemVariants}
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 sm:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-b from-background/50 to-secondary/5 border border-border/50 space-y-1 sm:space-y-2"
                        >
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">
                            {stat.value}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {stat.label}
                          </div>
                        </MotionDiv>
                      ))}
                    </MotionDiv>

                    <MotionDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-background/50 to-secondary/5 border border-border/50">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Core Values</h3>
                        <div className="space-y-3 sm:space-y-4">
                          {["Integrity", "Accountability", "Service Excellence", "Innovation", "Teamwork"].map((value, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm sm:text-base text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </MotionDiv>
                  </div>
                </div>
              </MotionDiv>
            </div>
          </div>
        </ParallaxLayer>

        {/* SECTION 3: PROJECTS */}
        <ParallaxLayer offset={1.9} speed={0.5} className="relative z-10">
          <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8 sm:space-y-12 md:space-y-16"
              >
                <div className="text-center space-y-4 sm:space-y-6">
                  {/* Responsive Section Title */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                      Projects & Developments
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                    Explore our ongoing and completed livelihood initiatives
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {[
                    {
                      title: "Agricultural Enterprises",
                      description: "Modern farming techniques and sustainable agriculture",
                      icon: TrendingUp,
                      highlights: ["Organic Farming", "Livestock Production", "Fisheries"]
                    },
                    {
                      title: "Skills Development",
                      description: "Vocational training for sustainable employment",
                      icon: Users,
                      highlights: ["Technical Training", "Entrepreneurship", "Digital Skills"]
                    },
                    {
                      title: "Micro-enterprises",
                      description: "Small business support and capital assistance",
                      icon: BarChart3,
                      highlights: ["Retail Stores", "Food Processing", "Service Business"]
                    }
                  ].map((project, index) => {
                    const Icon = project.icon;
                    return (
                      <MotionDiv
                        key={project.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="group"
                      >
                        <div className="h-full p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-b from-background/50 to-secondary/5 border border-border/50 hover:border-primary/30 transition-all duration-300 space-y-4 sm:space-y-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                          </div>
                          <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{project.title}</h3>
                            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">{project.description}</p>
                          </div>
                          
                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="text-sm font-medium text-foreground/80">Key Areas:</h4>
                            <ul className="space-y-2 sm:space-y-3">
                              {project.highlights.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </MotionDiv>
                    );
                  })}
                </div>

                <MotionDiv
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="pt-8 sm:pt-12"
                >
                  <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-10">Project Impact Timeline</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    {[
                      { year: "2024", milestone: "Digital Transformation", status: "active" },
                      { year: "2023", milestone: "National Expansion", status: "completed" },
                      { year: "2022", milestone: "Pandemic Recovery", status: "completed" },
                      { year: "2021", milestone: "Sustainable Practices", status: "completed" },
                    ].map((item, index) => (
                      <MotionDiv
                        key={item.year}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 sm:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-b from-background/50 to-secondary/5 border border-border/50 space-y-2 sm:space-y-3"
                      >
                        <div className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">{item.year}</div>
                        <div className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">{item.milestone}</div>
                        <div className={`inline-flex px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                          item.status === "active" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-secondary/10 text-secondary"
                        }`}>
                          {item.status}
                        </div>
                      </MotionDiv>
                    ))}
                  </div>
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </ParallaxLayer>

        {/* SECTION 4: CONTACT */}
        <ParallaxLayer offset={2.7} speed={0.4} className="relative z-10">
          <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8 sm:space-y-12 md:space-y-16"
              >
                <div className="text-center space-y-4 sm:space-y-6">
                  {/* Responsive Section Title */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                      Get In Touch
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                    Reach out to learn more or partner with us
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                  <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {[
                      { icon: MapPin, title: "Main Office", details: "DSWD Central Office, Batasan Complex, Quezon City" },
                      { icon: Phone, title: "Contact Numbers", details: "(02) 8931-8101 to 07" },
                      { icon: Mail, title: "Email Address", details: "slp@dswd.gov.ph" },
                      { icon: Calendar, title: "Office Hours", details: "Monday to Friday, 8:00 AM - 5:00 PM" },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <MotionDiv
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-b from-background/50 to-secondary/5 border border-border/50 hover:border-primary/30 transition-all duration-300"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <h4 className="font-semibold text-base sm:text-lg mb-0 sm:mb-1">{item.title}</h4>
                            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{item.details}</p>
                          </div>
                        </MotionDiv>
                      );
                    })}
                  </div>

                  <MotionDiv
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <form className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-b from-background/50 to-secondary/5 border border-border/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <label className="block text-sm font-medium mb-1">First Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm sm:text-base"
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="block text-sm font-medium mb-1">Last Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm sm:text-base"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input 
                          type="email" 
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm sm:text-base"
                          placeholder="john@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea 
                          rows={4}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm sm:text-base"
                          placeholder="Your message here..."
                        />
                      </div>
                      
                      <MotionDiv whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full rounded-lg py-4 sm:py-6 text-sm sm:text-base">
                          Send Message
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </MotionDiv>
                    </form>
                  </MotionDiv>
                </div>

                <MotionDiv
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center pt-8 sm:pt-12 border-t border-border/50"
                >
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Department of Social Welfare and Development - Sustainable Livelihood Program
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                    © {new Date().getFullYear()} DSWD. All rights reserved.
                  </p>
                </MotionDiv>
              </MotionDiv>
            </div>
          </div>
        </ParallaxLayer>
      </Parallax>
    </div>
  );
}