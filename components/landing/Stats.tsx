import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import NoHarmLogo from '@/components/ui/NoHarmLogo';
import UserTypeCard from '@/components/ui/UserTypeCard';
import { useIsMobile } from '@/components/hooks/use-mobile';

const Stats = () => {
  const isMobile = useIsMobile();
  const [activeCard, setActiveCard] = useState<'green' | 'blue' | 'purple' | null>(null);
  const [dotPositions, setDotPositions] = useState<{ 
    green: DOMRect | null;
    blue: DOMRect | null;
    purple: DOMRect | null;
  }>({
    green: null,
    blue: null,
    purple: null
  });

  return (
    <section className="w-full py-24 bg-white overflow-hidden relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-repeat opacity-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Who is NoHarm for?
          </motion.h2>


          <motion.p
          className="text-lg text-gray-700 md:text-xl mb-8 mx-auto text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Noharm fosters an environment that catalyzes the adoption of climate innovations
        </motion.p>
          
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Each dot in our logo represents a key participant in our ecosystem, working to ensure environmental resilience and sustainable impact.
          </motion.p>
        </div>

        
        {isMobile ? (
          <div className="space-y-16">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <NoHarmLogo size="lg" className="mx-auto" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-2">
                <div className="h-16 w-0.5 bg-gradient-to-b from-green-500 to-transparent mx-auto" />
              </div>
              <UserTypeCard 
                title="Climate Solutions" 
                description="Innovators tackling climate challenges" 
                color="green"
                delay={0.2}
              />
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <div className="h-16 w-0.5 bg-gradient-to-b from-blue-500 to-transparent mx-auto" />
              </div>
              <UserTypeCard 
                title="Buyers" 
                description="Organizations seeking verified sustainability solutions" 
                color="blue"
                delay={0.4}
              />
            </div>
            
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <div className="h-16 w-0.5 bg-gradient-to-b from-purple-500 to-transparent mx-auto" />
              </div>
              <UserTypeCard 
                title="Allies" 
                description="Experts providing essential services for scaling impact" 
                color="purple"
                delay={0.6}
              />
            </div>
          </div>
        ) : (
          <div className="relative min-h-[500px] overflow-hidden" >
            {/* Center logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <NoHarmLogo size="lg" />
            </div>


            {/* Top card - Climate Solutions */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0 w-80">
              <div className="flex flex-col items-center">
                <UserTypeCard 
                  title="Climate Solutions" 
                  description="Innovators tackling climate challenges" 
                  color="green"
                  className={`${activeCard === 'green' ? 'ring-2 ring-green-500 ring-offset-4' : ''}`}
                  onMouseEnter={() => setActiveCard('green')}
                  onMouseLeave={() => setActiveCard(null)}
                />
              </div>
            </div>

            {/* Bottom Left - Buyers */}
            <div className="absolute bottom-0 left-1/4 transform -translate-x-1/2 w-80">
              <div className="flex flex-col items-center">
                <UserTypeCard 
                  title="Buyers" 
                  description="Organizations seeking verified sustainability solutions" 
                  color="blue"
                  className={`${activeCard === 'blue' ? 'ring-2 ring-blue-500 ring-offset-4' : ''}`}
                  onMouseEnter={() => setActiveCard('blue')}
                  onMouseLeave={() => setActiveCard(null)}
                />
              </div>
            </div>

            {/* Bottom Right - Allies */}
            <div className="absolute bottom-0 left-3/4 transform -translate-x-1/2 w-80">
              <div className="flex flex-col items-center">
                <UserTypeCard 
                  title="Allies" 
                  description="Experts providing essential services for scaling impact" 
                  color="purple"
                  className={`${activeCard === 'purple' ? 'ring-2 ring-purple-500 ring-offset-4' : ''}`}
                  onMouseEnter={() => setActiveCard('purple')}
                  onMouseLeave={() => setActiveCard(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Stats;