import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Zap, Crown, Sparkles, ArrowRight, Mail, Clock, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

// Pricing stats to show value (like your dashboard)
const pricingStats = [
  {
    label: "Average Time Saved",
    value: "15.3 hrs",
    sublabel: "per month",
    icon: Clock,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-slate-800"
  },
  {
    label: "Cost Savings",
    value: "$2,400",
    sublabel: "per year",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600", 
    bgColor: "bg-slate-800"
  },
  {
    label: "Productivity Boost",
    value: "87%",
    sublabel: "automation rate",
    icon: TrendingUp,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-slate-800"
  },
  {
    label: "Emails Handled",
    value: "10,000+",
    sublabel: "monthly average",
    icon: Mail,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-slate-800"
  }
];

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: 9,
      period: "month",
      badge: null,
      gradient: "from-gray-600 to-gray-800",
      description: "Essential email automation for individuals",
      features: [
        "500 emails/month",
        "5 basic templates",
        "Email labeling & sorting",
        "Basic automation rules",
        "Email support"
      ],
      limitations: [
        "No AI features",
        "Limited integrations (3)",
        "No team features"
      ],
      cta: "Start 7-Day Trial",
      ctaStyle: "outline"
    },
    {
      name: "Professional",
      price: 29,
      period: "month",
      badge: "Most Popular",
      gradient: "from-cyan-500 to-blue-600",
      description: "Complete AI-powered email automation",
      features: [
        "5,000 emails/month",
        "Unlimited templates & rules",
        "AI draft generation",
        "Smart priority detection",
        "15+ integrations",
        "Advanced analytics",
        "Priority support"
      ],
      limitations: [
        "Single user account"
      ],
      cta: "Start 14-Day Trial",
      ctaStyle: "primary",
      popular: true
    },
    {
      name: "Business",
      price: 49,
      period: "month",
      badge: "Best Value",
      gradient: "from-purple-500 to-pink-600",
      description: "Advanced automation for growing teams",
      features: [
        "25,000 emails/month",
        "Everything in Professional",
        "Team collaboration (up to 5 users)",
        "Advanced AI features",
        "40+ integrations",
        "Custom workflows",
        "Dedicated account manager",
        "API access"
      ],
      limitations: [],
      cta: "Start 14-Day Trial",
      ctaStyle: "premium"
    }
  ];

  return (
    <section id="pricing" className="relative py-20 bg-gradient-to-b from-gray-800 via-black to-gray-800 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-40 left-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
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
            <Sparkles className="w-4 h-4 mr-2" />
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Start Free,
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Scale Smart
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your email automation needs. Start free, upgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Value Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {pricingStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={`${stat.bgColor} border border-slate-700 p-6 text-center hover:border-cyan-500/50 transition-all duration-300`}>
                <div className="flex items-center justify-center mb-4">
                  <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                <div className="text-gray-500 text-xs">{stat.sublabel}</div>
              </Card>
            );
          })}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className={`${plan.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'} text-black border-0 px-4 py-2 text-sm font-bold rounded-full shadow-lg`}>
                    {plan.popular && <Star className="w-3 h-3 mr-1" />}
                    {plan.name === "Enterprise" && <Crown className="w-3 h-3 mr-1" />}
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <Card className={`relative h-full ${plan.popular ? 'bg-black/60 border-2 border-cyan-400/60' : 'bg-black/40 border border-gray-600/30'} backdrop-blur-sm hover:border-cyan-400/60 transition-all duration-500 overflow-hidden`}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold ${plan.popular ? 'text-cyan-400' : 'text-white'} mb-2`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-5xl font-black text-white">${plan.price}</span>
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    </div>
                    <p className="text-gray-300">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} p-1 mr-3 flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-center opacity-60">
                        <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/sign-in">
                    <Button 
                      className={`w-full group/btn transition-all duration-300 ${
                        plan.ctaStyle === 'primary' 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/30'
                          : plan.ctaStyle === 'premium'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold border-2 border-purple-400/50 shadow-xl shadow-purple-500/30'
                          : 'border-2 border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 bg-black/40 backdrop-blur-sm'
                      } py-4 text-lg rounded-xl`}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {plan.cta}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Animated Border */}
                {plan.popular && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${plan.gradient} opacity-20 blur-sm`}></div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Start with our free plan and experience the power of ZEMA automation. Upgrade when you're ready.
            </p>
            <div className="flex justify-center">
              <Link href="/sign-in">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-8 py-4 rounded-xl border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/30"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Curved Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 md:h-30">
          <defs>
            <linearGradient id="pricingWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="50%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#pricingWaveGradient)" 
            d="M0,60 C480,0 960,120 1440,60 L1440,120 L0,120 Z"
            className="opacity-90"
          ></path>
        </svg>
      </div>
    </section>
  );
}
