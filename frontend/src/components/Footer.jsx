import React, { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, ExternalLink, Heart, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Footer() {
  const { theme, setTheme } = useTheme();
  const [hovered, setHovered] = useState(null);
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { href: "/upload", label: "Upload Poster" },
  ];
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  return (
    <footer className="border-t border-border relative">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30 dark:to-card/10 -z-10"></div>
      
      {/* Top wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden -translate-y-full opacity-10">
        <div className="w-full h-full bg-primary/20 rounded-t-[100%]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand section */}
          <motion.div 
            className="md:col-span-5 lg:col-span-4 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.98 }}
                className="mr-3"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    <img 
                      src="/accessibility_favicon_revised.svg" 
                      alt="Poster A11y Logo" 
                      className="h-6 w-6"
                    />
                  </motion.div>
                </div>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-primary">Poster A11y</h3>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Our mission is to make academic and conference posters more inclusive and 
              accessible for everyone, regardless of their abilities.
            </p>
            
            <div className="flex items-center mt-auto">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                  className="flex items-center gap-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ opacity: 0, rotate: -10 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      {theme === 'light' ? (
                        <>
                          <Moon className="h-4 w-4" /> Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4" /> Light Mode
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button> */}
              </motion.div>
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div 
            className="md:col-span-3 lg:col-span-4 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-base font-semibold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
                >
                  <motion.a 
                    href={link.href}
                    className="group flex items-center text-muted-foreground hover:text-primary transition-colors"
                    onMouseEnter={() => setHovered(link.href)}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ x: 3 }}
                  >
                    <motion.span 
                      animate={{ 
                        x: hovered === link.href ? 3 : 0,
                        color: hovered === link.href ? 'var(--primary)' : 'var(--muted-foreground)'
                      }}
                      className="text-sm"
                    >
                      {link.label}
                    </motion.span>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ 
                        opacity: hovered === link.href ? 1 : 0,
                        x: hovered === link.href ? 0 : -5
                      }}
                      transition={{ duration: 0.2 }}
                      className="ml-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </motion.div>
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact section */}
          <motion.div 
            className="md:col-span-4 lg:col-span-4 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-base font-semibold text-primary mb-4">Connect With Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Have a question or feedback? We'd love to hear from you.
            </p>
            
            <motion.a 
              href="mailto:contact@postera11y.org"
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center group"
              whileHover={{ scale: 1.02, x: 3 }}
            >
              wajdij1@gmail.com
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="ml-1"
              >
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </motion.a>
          </motion.div>
        </div>
        
        <Separator className="mb-6" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <motion.p 
            className="text-xs text-muted-foreground order-2 sm:order-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            © {currentYear} Poster A11y. All rights reserved.
          </motion.p>
          
          <motion.div 
            className="order-1 sm:order-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all border-primary/20"
              aria-label="Scroll to top"
            >
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <ArrowUp className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;