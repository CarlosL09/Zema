import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export default function DemoVideo() {
  return (
    <section id="demo" className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            See ZEMA in action
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Watch how ZEMA handles an email in the example below.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gray-800 flex items-center justify-center cursor-pointer group">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 group-hover:bg-opacity-30 transition-all duration-300">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <p className="text-white text-xl font-semibold">ZEMA AI Demo Video</p>
                <p className="text-gray-300">Click to watch the demonstration</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto mt-12"
        >
          <Card className="bg-gray-50 rounded-xl p-8">
            <blockquote className="text-lg text-gray-700 mb-6 italic">
              "ZEMA has been a game-changer for our business operations. The platform is intuitive and has become an essential tool for our daily operations. I highly recommend it to any business leader looking to enhance their productivity."
            </blockquote>
            <div className="flex items-center justify-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarFallback className="bg-gray-300 text-gray-600">SH</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Stacey Helbig</p>
                <p className="text-gray-600">Chief Operating Officer @ Fire Department Coffee</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
