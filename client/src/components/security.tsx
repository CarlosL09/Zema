import { Award, Lock, Server, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Security() {
  const features = [
    {
      icon: Award,
      title: "CASA Tier 3 Compliance",
      description: "Industry-leading security standards for sensitive data"
    },
    {
      icon: Lock,
      title: "Encryption",
      description: "Your emails are encrypted in transit and at rest"
    },
    {
      icon: Server,
      title: "Enterprise-Grade Infrastructure",
      description: "Built on secure cloud infrastructure with 99.9% uptime"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "We never train AI models on your data. Your information stays yours."
    }
  ];

  return (
    <section id="security" className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bank-level security for your peace of mind
          </h2>
          <p className="text-xl text-gray-300">
            With CASA Tier 3 compliance and industry-leading encryption, your emails stay private, secure, and protected—always.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
