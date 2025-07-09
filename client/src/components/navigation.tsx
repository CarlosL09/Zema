import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import zemaLogo from "@assets/41_1751750660031.png";


export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const navigateToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location !== '/') {
      navigate('/');
      // Wait a bit for the page to load, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-black border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 md:h-20">
          <div className="flex items-center">
            <img 
              src={zemaLogo} 
              alt="ZEMA - Zero Effort Mail Automation" 
              className="h-16 md:h-18 w-auto brightness-110 contrast-110"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => navigateToSection('features')}
                className="relative px-4 py-2 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 transition-all duration-300 group"
              >
                <span className="relative z-10">Features</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:via-cyan-400/30 group-hover:to-blue-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => navigateToSection('integrations')}
                className="relative px-4 py-2 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 transition-all duration-300 group"
              >
                <span className="relative z-10">Integrations</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:via-cyan-400/30 group-hover:to-blue-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => navigateToSection('templates')}
                className="relative px-4 py-2 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 transition-all duration-300 group"
              >
                <span className="relative z-10">Templates</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:via-cyan-400/30 group-hover:to-blue-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => navigateToSection('pricing')}
                className="relative px-4 py-2 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 transition-all duration-300 group"
              >
                <span className="relative z-10">Pricing</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:via-cyan-400/30 group-hover:to-blue-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => navigateToSection('security')}
                className="relative px-4 py-2 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 transition-all duration-300 group"
              >
                <span className="relative z-10">Security</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-400/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:via-cyan-400/30 group-hover:to-blue-600/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Authentication Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600/40 to-blue-600/40 border-cyan-400/80 text-white hover:from-cyan-600/60 hover:to-blue-600/60 hover:border-cyan-300 hover:text-cyan-100 transition-all duration-300 font-medium tracking-wide uppercase text-xs shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:shadow-cyan-400/50"
                >
                  <User size={16} />
                  Sign In
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/sign-in" className="flex items-center w-full">
                    <LogIn size={16} className="mr-2" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/register" className="flex items-center w-full">
                    <UserPlus size={16} className="mr-2" />
                    Create Account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-black border-b border-gray-800"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button 
              onClick={() => navigateToSection('features')}
              className="relative block px-4 py-3 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 w-full text-left group transition-all duration-300"
            >
              <span className="relative z-10">Features</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
              <div className="absolute left-0 top-0 w-0.5 h-0 bg-gradient-to-b from-cyan-400 to-blue-500 group-hover:h-full transition-all duration-300"></div>
            </button>
            <button 
              onClick={() => navigateToSection('integrations')}
              className="relative block px-4 py-3 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 w-full text-left group transition-all duration-300"
            >
              <span className="relative z-10">Integrations</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
              <div className="absolute left-0 top-0 w-0.5 h-0 bg-gradient-to-b from-cyan-400 to-blue-500 group-hover:h-full transition-all duration-300"></div>
            </button>
            <button 
              onClick={() => navigateToSection('templates')}
              className="relative block px-4 py-3 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 w-full text-left group transition-all duration-300"
            >
              <span className="relative z-10">Templates</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
              <div className="absolute left-0 top-0 w-0.5 h-0 bg-gradient-to-b from-cyan-400 to-blue-500 group-hover:h-full transition-all duration-300"></div>
            </button>
            <button 
              onClick={() => navigateToSection('pricing')}
              className="relative block px-4 py-3 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 w-full text-left group transition-all duration-300"
            >
              <span className="relative z-10">Pricing</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
              <div className="absolute left-0 top-0 w-0.5 h-0 bg-gradient-to-b from-cyan-400 to-blue-500 group-hover:h-full transition-all duration-300"></div>
            </button>
            <button 
              onClick={() => navigateToSection('security')}
              className="relative block px-4 py-3 text-white font-medium tracking-wide uppercase text-sm hover:text-cyan-400 w-full text-left group transition-all duration-300"
            >
              <span className="relative z-10">Security</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
              <div className="absolute left-0 top-0 w-0.5 h-0 bg-gradient-to-b from-cyan-400 to-blue-500 group-hover:h-full transition-all duration-300"></div>
            </button>
            <div className="px-3 py-2 border-t border-gray-700 mt-4">
              <div className="space-y-2">
                <Link href="/sign-in">
                  <div className="relative w-full text-left text-sm text-gray-300 hover:text-cyan-400 py-2 px-4 group transition-all duration-300">
                    <span className="relative z-10 tracking-wide uppercase font-medium">Sign In</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
                  </div>
                </Link>
                <Link href="/register">
                  <div className="relative w-full text-left text-sm text-gray-300 hover:text-cyan-400 py-2 px-4 group transition-all duration-300">
                    <span className="relative z-10 tracking-wide uppercase font-medium">Create Account</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 rounded-lg transition-all duration-300"></div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
