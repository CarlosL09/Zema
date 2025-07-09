import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail, BarChart3, Users, Settings, Shield, Clock, Target, Plus, CheckCircle, TrendingUp, Zap, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  // Quick Actions (like your dashboard screenshot)
  const quickActions = [
    { icon: Plus, label: "Add Account", color: "bg-emerald-500", textColor: "text-white" },
    { icon: Settings, label: "Templates", color: "bg-purple-500", textColor: "text-white" },
    { icon: Bot, label: "AI Assistant", color: "bg-blue-500", textColor: "text-white" },
    { icon: Clock, label: "Schedule", color: "bg-orange-500", textColor: "text-white" },
    { icon: BarChart3, label: "Analytics", color: "bg-cyan-500", textColor: "text-white" },
    { icon: Shield, label: "Security", color: "bg-pink-500", textColor: "text-white" },
    { icon: Target, label: "Workload", color: "bg-purple-600", textColor: "text-white" },
    { icon: TrendingUp, label: "More", color: "bg-green-500", textColor: "text-white" }
  ];

  // Main stats (like your dashboard metrics)
  const mainStats = [
    {
      label: "Emails Processed",
      value: "1,247",
      color: "from-cyan-500 to-blue-600",
      icon: Mail,
      bgColor: "bg-slate-800"
    },
    {
      label: "Active Rules", 
      value: "12",
      color: "from-green-500 to-emerald-600",
      icon: CheckCircle,
      bgColor: "bg-slate-800"
    },
    {
      label: "Time Saved",
      value: "15.3 hrs",
      color: "from-purple-500 to-pink-600", 
      icon: Clock,
      bgColor: "bg-slate-800"
    },
    {
      label: "Automation Rate",
      value: "87%",
      color: "from-orange-500 to-red-600",
      icon: TrendingUp,
      bgColor: "bg-slate-800"
    }
  ];

  // AI Email Assistant features (like your dashboard purple section)
  const aiFeatures = [
    {
      icon: Bot,
      title: "Auto Email Labeling",
      description: "AI automatically categorizes and labels your emails by content, sender importance, and urgency level.",
      actionLabel: "Label Emails"
    },
    {
      icon: Mail,
      title: "Smart Draft Generation", 
      description: "Generate professional email responses with awareness and your personal writing style.",
      actionLabel: "Generate Drafts"
    },
    {
      icon: Target,
      title: "Priority Sorting",
      description: "AI analyzes email content and sender importance to automatically prioritize your inbox.",
      actionLabel: "Sort by Priority"
    }
  ];

  // Template cards (like your template grid)
  const templateCards = [
    {
      icon: Target,
      title: "Smart Email Classifier",
      subtitle: "2-Day Smart Classification",
      description: "Automatically categorize emails by content and sender",
      color: "from-cyan-500 to-blue-600",
      badge: "Use Template"
    },
    {
      icon: TrendingUp,
      title: "Lead Scoring Engine", 
      subtitle: "Sales Lead Qualification",
      description: "Automatically score and prioritize potential leads",
      color: "from-green-500 to-emerald-600",
      badge: "Use Template"
    },
    {
      icon: Shield,
      title: "Social Media Alert Manager",
      subtitle: "Social Notification Hub", 
      description: "Consolidate and prioritize social media notifications",
      color: "from-purple-500 to-pink-600",
      badge: "Use Template"
    },
    {
      icon: Zap,
      title: "Cold Email Filter",
      subtitle: "Unsolicited Email Management",
      description: "Filter and organize cold sales emails and outreach",
      color: "from-orange-500 to-red-600",
      badge: "Use Template"
    }
  ];

  return (
    <section id="features" className="relative py-20 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}></div>
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
            Revolutionary Features
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Email Automation
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your email workflow with cutting-edge AI and intelligent automation that actually works.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
                >
                  <Card className="p-4 bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 h-24 flex flex-col items-center justify-center text-center hover:scale-105">
                    <div className={`${action.color} p-2 rounded-lg mb-2`}>
                      <Icon className={`w-5 h-5 ${action.textColor}`} />
                    </div>
                    <span className="text-xs text-gray-300 font-medium">{action.label}</span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {mainStats.map((stat, index) => {
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
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </Card>
            );
          })}
        </motion.div>

        {/* AI Email Assistant Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-purple-600 to-purple-800 border-0 p-8 text-white">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold mb-2">AI Email Assistant</h3>
                <p className="text-purple-100">Powered by GPT-4o for smart email automation</p>
              </div>
              <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition-colors">
                Open AI Assistant
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {aiFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="bg-white/10 p-4 rounded-xl mb-4 inline-block">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                    <p className="text-purple-100 mb-4 text-sm leading-relaxed">{feature.description}</p>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {feature.actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Template Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Popular Automation Templates</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templateCards.map((template, index) => {
              const Icon = template.icon;
              return (
                <Card key={index} className="bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 p-6 text-center group hover:scale-105">
                  <div className={`bg-gradient-to-r ${template.color} p-4 rounded-xl mb-4 inline-block`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{template.title}</h4>
                  <p className="text-cyan-400 text-sm font-medium mb-3">{template.subtitle}</p>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{template.description}</p>
                  <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors w-full">
                    {template.badge}
                  </button>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-sm">
            <Target className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-gray-300">Ready to transform your email workflow?</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}