import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is my email data secure?",
      answer: "Yes, absolutely. We use bank-level encryption and enterprise-grade security. Your emails are encrypted both in transit and at rest, and we never train our AI models on your data."
    },
    {
      question: "Which email providers does ZEMA support?",
      answer: "ZEMA works seamlessly with Gmail, Outlook, Yahoo, and other IMAP-supported email providers. Setup takes just a few minutes with our secure OAuth integration."
    },
    {
      question: "How does the 14-day free trial work?",
      answer: "You get full access to all ZEMA features for 14 days with no credit card required. During your trial, you can process up to 100 emails and create unlimited automation rules."
    },
    {
      question: "Can I create custom email templates and rules?",
      answer: "Absolutely! ZEMA includes a powerful template builder and custom rule creator. You can build automation workflows, set conditions, and create personalized email templates that match your exact needs."
    },
    {
      question: "How does ZEMA help with email organization?",
      answer: "ZEMA automatically creates smart folders, groups similar emails for batch processing, and suggests optimal folder structures based on your communication patterns. It mirrors your existing email structure while adding AI-powered organization."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "You maintain full control of your data. You can export all your templates, rules, and settings at any time. When you cancel, we securely delete your data according to our privacy policy."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle. No long-term contracts required."
    },
    {
      question: "Does ZEMA work on mobile devices?",
      answer: "ZEMA is a web-based application that works perfectly on mobile browsers. While we don't have a dedicated mobile app yet, the responsive design ensures a great experience on all devices."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-300">
            Still have a question in mind?{" "}
            <a href="mailto:support@zema.ai" className="text-cyan-600 hover:underline">
              Contact us
            </a>
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
