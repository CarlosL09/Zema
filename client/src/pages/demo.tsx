import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Mail, Clock, CheckCircle, TrendingUp } from "lucide-react";
import zemaLogo from "@assets/41_1751750660031.png";

export default function Demo() {
  const demoFeatures = [
    {
      title: "Smart Email Templates",
      description: "Pre-built templates for common business scenarios with intelligent customization",
      icon: <Mail className="w-6 h-6" />,
      time: "2 min demo"
    },
    {
      title: "Custom Automation Rules",
      description: "Build your own email automation workflows with drag-and-drop simplicity",
      icon: <CheckCircle className="w-6 h-6" />,
      time: "3 min demo"
    },
    {
      title: "Email Scheduling Intelligence",
      description: "AI-powered optimal send time suggestions based on recipient patterns",
      icon: <Clock className="w-6 h-6" />,
      time: "2 min demo"
    },
    {
      title: "Performance Analytics",
      description: "Track response rates, time saved, and automation success metrics",
      icon: <TrendingUp className="w-6 h-6" />,
      time: "3 min demo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link href="/">
            <Button variant="ghost" className="mb-8 text-gray-600 hover:text-cyan-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="bg-black p-6 rounded-lg">
              <img 
                src={zemaLogo} 
                alt="ZEMA Demo" 
                className="h-20 md:h-24 lg:h-32 w-auto"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See ZEMA in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore how ZEMA transforms your email workflow with these interactive demos showcasing our core features.
          </p>
          
          <Badge className="bg-cyan-100 text-cyan-700 px-4 py-2 text-lg mb-8">
            Interactive Demos Available
          </Badge>
        </motion.div>

        {/* Demo Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-cyan-100 p-3 rounded-lg">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-cyan-600">
                      {feature.time}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <Button className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Demo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>



        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Email Workflow?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Start your 14-day free trial and experience the power of Zero Effort Mail Automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg" className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-4">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 px-8 py-4">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>


    </div>
  );
}