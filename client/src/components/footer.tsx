import { Button } from "@/components/ui/button";
import { Clock, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import zemaLogo from "@assets/41_1751750660031.png";

export default function Footer() {
  return (
    <>
      {/* Final CTA Section */}
      <section className="py-16 bg-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to reclaim your time?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals who've already transformed their email workflow.
            </p>
            
            <div className="flex justify-center mb-8">
              <Button className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started for Free
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-blue-100">
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                7 days free trial
              </div>
              <div className="flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Takes 30 seconds
              </div>
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                30 days money back guarantee
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="mb-3">
                <img 
                  src={zemaLogo} 
                  alt="ZEMA - Zero Effort Mail Automation" 
                  className="h-16 w-auto brightness-125 contrast-125"
                />
              </div>
              <div className="text-gray-400">
                <p className="text-lg font-medium mb-2">Zero Effort Mail Automation</p>
                <p className="text-sm">AI-powered email assistant that saves you hours every day.</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Extension Privacy</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ZEMA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
