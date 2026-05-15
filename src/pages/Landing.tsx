import { motion } from 'motion/react';
import { Sparkles, Play, FileText as DocIcon, Search, BrainCircuit, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 glass-panel mb-8"
          >
            <Sparkles className="w-4 h-4 text-secondary glow-cyan" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-secondary">AETHER_CORE INTELLIGENCE V2</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline text-5xl md:text-[80px] leading-tight mb-8 bg-gradient-to-b from-white via-white to-primary bg-clip-text text-transparent font-extrabold"
          >
            {t('landing.title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto mb-12"
          >
            {t('landing.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="w-full md:w-auto h-16 text-lg">
              {t('landing.getStarted')}
            </Button>
            <Button variant="glass" size="lg" className="w-full md:w-auto h-16 text-lg flex gap-2">
              <Play className="w-5 h-5 fill-current" />
              {t('landing.viewDemo')}
            </Button>
          </motion.div>

          {/* Tech Viz */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden glass-panel group"
          >
            <img 
              alt="AI Indexing" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgBzzsWUCMoalmRthsX1MqLhtR4H0x8eQJokbRs1nGXXoBShZziZ66zTRUP3_9vKtfRJ_du8Nsu7lKBVZf-I48uABhzaX-taH4sxYm_NjFBVLSDaqXhvLTL5SItCYnkbHmXWtbYe0YJyjEyZQ0yd9364c7WAsC5ZI8U7BvfAwuuDDUo3lobbS9_FuLB0WFaBb_umEi78MP02pv8ErWjYSx4uM9Yzx62muqoRSvVN5VT3saYWisFkyrOg6-ud5xV6JCMPMeNYkCA_ZG" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 backdrop-blur-xl p-8 rounded-2xl glass-panel max-w-sm text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <BrainCircuit className="text-primary neon-glow-indigo w-6 h-6" />
                  </div>
                  <div className="h-1 bg-primary/20 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-primary w-2/3" />
                  </div>
                </div>
                <h3 className="font-headline text-2xl text-primary mb-2">Vector Indexing...</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">Scanning 1,200 pages for semantic relationships and key insights.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl md:text-4xl mb-4 text-white">Crystalline Clarity for Dense Data</h2>
          <p className="text-on-surface-variant">The tools you need to master any subject in minutes, not hours.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: DocIcon, title: 'Unlimited PDF Pages', desc: 'Upload entire textbooks. Our engine handles documents of any scale.', color: 'secondary' },
            { icon: Search, title: 'AI Semantic Search', desc: 'Ask complex questions and get precise, cited answers instantly.', color: 'primary' },
            { icon: BrainCircuit, title: 'Dynamic Quiz Generation', desc: 'Test retention with AI-generated flashcards and multiple-choice quizzes.', color: 'tertiary' },
            { icon: Zap, title: 'Instant Summary', desc: 'Receive a hierarchical summary with key takeaways in under 10 seconds.', color: 'secondary' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg glass-panel hover:bg-white/10 transition-all duration-300 group"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                feature.color === 'secondary' ? "bg-secondary/10 text-secondary" :
                feature.color === 'primary' ? "bg-primary/10 text-primary" :
                "bg-tertiary/10 text-tertiary"
              )}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-xl mb-3 text-white">{feature.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-surface-container-lowest/50 backdrop-blur-sm border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { val: '1M+', label: 'Pages Summarized', color: 'text-primary' },
              { val: '99%', label: 'Factual Accuracy', color: 'text-secondary' },
              { val: '50+', label: 'Languages Supported', color: 'text-tertiary' },
            ].map((stat, i) => (
              <div key={i}>
                <div className={cn("font-headline text-5xl mb-2", stat.color)}>{stat.val}</div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl p-12 glass-panel overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="font-headline text-4xl mb-3 text-white">Ready to unlock your cognitive superpower?</h2>
              <p className="text-lg text-on-surface-variant">Join thousands of researchers and students who are already using Summarizer AI to stay ahead.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <input 
                className="bg-surface-dim/80 border border-white/5 rounded-xl px-6 py-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface min-w-[300px] outline-none" 
                placeholder="Enter your work email" 
                type="email"
              />
              <Button size="lg" className="h-14">Get Started</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline text-xl text-primary font-bold">Summarizer AI</span>
            <p className="text-sm text-on-surface-variant text-center md:text-left">© 2024 Summarizer AI Summarizer. Cognitive Superpower Guaranteed.</p>
          </div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'API Status', 'Contact'].map(link => (
              <a key={link} className="text-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
