import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Shield, Eye, ArrowRight, Mail, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import zemaLogo from "@assets/41_1751750660031.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Neon Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center mb-8"
          >
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-0 px-6 py-3 text-lg font-bold rounded-full shadow-2xl shadow-cyan-500/50">
              <Sparkles className="w-5 h-5 mr-2" />
              Zero Effort Mail Automation
              <motion.div
                className="ml-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Bot className="w-5 h-5" />
              </motion.div>
            </Badge>
          </motion.div>
          
          {/* Logo with Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <div className="relative">
              <img 
                src={zemaLogo} 
                alt="ZEMA - Zero Effort Mail Automation" 
                className="h-24 md:h-32 lg:h-40 w-auto filter drop-shadow-2xl hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full scale-150 animate-pulse"></div>
            </div>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight"
          >
            <span className="text-white">Your Inbox,</span><br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Automated.
            </span><br />
            <span className="text-white">Your Time,</span><br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Reclaimed.
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Complete email productivity suite with AI-powered composition, advanced analytics, 
            team collaboration, and intelligent automation that delivers 
            <span className="text-cyan-400 font-semibold"> zero effort</span> email management.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link href="/sign-in">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-10 py-6 text-xl rounded-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 transform hover:scale-105 transition-all duration-300 border-2 border-cyan-400/50"
              >
                <Mail className="w-6 h-6 mr-3" />
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button 
                variant="outline" 
                size="lg" 
                className="group border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-10 py-6 text-xl rounded-2xl backdrop-blur-sm bg-black/20 hover:shadow-xl hover:shadow-cyan-400/30 transform hover:scale-105 transition-all duration-300"
              >
                <Eye className="w-6 h-6 mr-3" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center p-6 rounded-2xl bg-black/40 border border-cyan-500/30 backdrop-blur-sm">
              <Clock className="w-6 h-6 mr-3 text-cyan-400" />
              <div className="text-left">
                <div className="text-white font-bold">14-Day Free Trial</div>
                <div className="text-gray-400 text-sm">No credit card required</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 rounded-2xl bg-black/40 border border-cyan-500/30 backdrop-blur-sm">
              <Zap className="w-6 h-6 mr-3 text-cyan-400" />
              <div className="text-left">
                <div className="text-white font-bold">2-Minute Setup</div>
                <div className="text-gray-400 text-sm">Works with existing email</div>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 rounded-2xl bg-black/40 border border-cyan-500/30 backdrop-blur-sm">
              <Shield className="w-6 h-6 mr-3 text-cyan-400" />
              <div className="text-left">
                <div className="text-white font-bold">Enterprise Security</div>
                <div className="text-gray-400 text-sm">Bank-grade encryption</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Curved Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 md:h-30">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#waveGradient)" 
            d="M0,60 C480,120 960,0 1440,60 L1440,120 L0,120 Z"
            className="opacity-90"
          ></path>
        </svg>
      </div>
    </section>
  );
}
