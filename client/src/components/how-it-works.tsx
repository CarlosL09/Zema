import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, Brain, Send, Zap, ArrowRight, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function HowItWorks() {
  const steps = [
    {
      icon: Plug,
      time: "1 minute",
      title: "Connect & Sync",
      description: "Instantly connect Gmail, Outlook, and 40+ platforms with military-grade security.",
      gradient: "from-cyan-500 to-blue-600",
      delay: 0.2
    },
    {
      icon: Brain,
      time: "Auto-learns",
      title: "AI Analyzes",
      description: "GPT-4o learns your patterns, style, and priorities without any training required.",
      gradient: "from-purple-500 to-pink-600",
      delay: 0.4
    },
    {
      icon: Send,
      time: "2+ hours saved",
      title: "Automate Everything",
      description: "Watch as ZEMA handles responses, organization, and workflows automatically.",
      gradient: "from-green-500 to-emerald-600",
      delay: 0.6
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-0 px-6 py-2 text-sm font-bold rounded-full mb-6">
            <Clock className="w-4 h-4 mr-2" />
            Simple 3-Step Process
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            From Chaos to 
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Control
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your email workflow in minutes, not months. ZEMA makes advanced automation accessible to everyone.
          </p>
        </motion.div>
        
        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="group relative text-center"
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-px bg-gradient-to-r from-cyan-400 to-blue-500 opacity-50"></div>
                )}
                
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${step.gradient} p-1`}>
                    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Time Badge */}
                <Badge className="bg-black/60 border border-cyan-500/30 text-cyan-400 text-sm font-semibold mb-4 backdrop-blur-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  {step.time}
                </Badge>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed">{step.description}</p>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl`}></div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex flex-col items-center">
            <Link href="/sign-in">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/40 transform hover:scale-105 transition-all duration-300 border-2 border-cyan-400/50 mb-4"
              >
                <Target className="w-6 h-6 mr-3" />
                Start Your Transformation
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-gray-400 text-sm">
              Join thousands who've reclaimed their time with ZEMA
            </p>
          </div>
        </motion.div>
      </div>

      {/* Curved Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 md:h-30">
          <defs>
            <linearGradient id="howItWorksWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="50%" stopColor="#374151" />
              <stop offset="100%" stopColor="#4b5563" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#howItWorksWaveGradient)" 
            d="M0,60 C480,120 960,0 1440,60 L1440,120 L0,120 Z"
            className="opacity-90"
          ></path>
        </svg>
      </div>
    </section>
  );
}
