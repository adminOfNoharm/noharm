// "use client";

// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, Leaf, Building, Users, Cloud, Sun, Droplet, Wind } from 'lucide-react';
// import { useEffect, useState } from 'react';

// export default function Hero() {
//   const [isLoaded, setIsLoaded] = useState(false);
  
//   // Set isLoaded to true after component mounts to trigger animations
//   useEffect(() => {
//     setIsLoaded(true);
//   }, []);

//   // Main entities with expanded descriptions
//   const entities = [
//     { 
//       icon: Leaf, 
//       color: '#1105ff', 
//       label: 'Innovators',
//       description: 'Creating climate solutions' 
//     },
//     { 
//       icon: Building, 
//       color: '#00792b', 
//       label: 'Buyers',
//       description: 'Implementing change' 
//     },
//     { 
//       icon: Users, 
//       color: '#9b00ff', 
//       label: 'Allies',
//       description: 'Supporting the mission' 
//     }
//   ];

//   // Climate tech elements that float in the background
//   const techElements = [
//     { icon: Sun, color: '#FF9500', label: 'Solar' },
//     { icon: Wind, color: '#00B2FF', label: 'Wind' },
//     { icon: Droplet, color: '#0066FF', label: 'Water' },
//     { icon: Cloud, color: '#4CAF50', label: 'Carbon' },
//   ];

//   return (
//     <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-black">
//       <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-950" />
      
//       {/* Subtle ambient background effect */}
//       <div className="absolute inset-0 opacity-20">
//         <motion.div 
//           className="absolute inset-0"
//           animate={{ 
//             background: [
//               'radial-gradient(circle at 30% 30%, rgba(0,121,43,0.15) 0%, transparent 60%)',
//               'radial-gradient(circle at 70% 70%, rgba(155,0,255,0.15) 0%, transparent 60%)',
//               'radial-gradient(circle at 30% 70%, rgba(17,5,255,0.15) 0%, transparent 60%)',
//               'radial-gradient(circle at 70% 30%, rgba(0,121,43,0.15) 0%, transparent 60%)',
//             ]
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />
//       </div>
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-16">
//           {/* Text Content */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-left"
//           >
//             <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
//               Helping Climate Solutions{' '}
//               <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00792b] to-[#4CAF50]">Thrive</span>
//             </h1>
            
//             <p className="text-xl text-zinc-400 max-w-xl mb-8 leading-relaxed">
//               A global ecosystem connecting climate innovators, buyers, and allies for mutual impact and growth. Together, we're accelerating the transition to a sustainable future.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Button 
//                 asChild 
//                 size="lg"
//                 className="bg-[#00792b] hover:bg-[#00792b]/90 text-white group px-8 h-14 text-lg"
//               >
//                 <Link href="/onboarding">
//                   Get Started
//                   <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//                 </Link>
//               </Button>
//             </div>
//           </motion.div>

//           {/* Enhanced Animation System */}
// <div className="relative h-[500px]">
//   <motion.div 
//     className="absolute inset-0"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     transition={{ duration: 0.8 }}
//   >
//     {/* Expanded orbit paths */}
//     {[0, 1, 2].map((index) => (
//       <motion.div
//         key={`orbit-${index}`}
//         className="absolute left-1/2 top-1/2 rounded-full border border-white/5"
//         style={{
//           width: `${300 + index * 60}px`,
//           height: `${300 + index * 60}px`,
//           marginLeft: `-${(300 + index * 60) / 2}px`,
//           marginTop: `-${(300 + index * 60) / 2}px`,
//         }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: isLoaded ? 0.3 : 0 }}
//         transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
//       />
//     ))}

//     {/* Central Platform - Enhanced */}
//     <motion.div
//       className="absolute left-1/2 top-1/2 w-28 h-28 -ml-14 -mt-14 z-30"
//       initial={{ scale: 0 }}
//       animate={{ scale: isLoaded ? 1 : 0 }}
//       transition={{ duration: 0.8, delay: 0.3 }}
//     >
//       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#1105ff] via-[#00792b] to-[#9b00ff] opacity-20 animate-pulse" />
//       <div className="absolute inset-0 rounded-2xl backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center bg-black/40 p-3">
//         <motion.div
//           className="text-white/90 text-3xl font-bold mb-1"
//           animate={{ scale: [0.95, 1.05, 0.95] }}
//           transition={{ duration: 2, repeat: Infinity }}
//         >
//           🌎
//         </motion.div>
//         <span className="text-white/80 text-xs font-medium mt-1">Climate Hub</span>
//       </div>
      
//       {/* Pulse rings around center platform */}
//       {[0, 1, 2].map((_, i) => (
//         <motion.div
//           key={`pulse-${i}`}
//           className="absolute -inset-4 rounded-full border border-[#00792b]/30"
//           initial={{ scale: 0.6, opacity: 0.8 }}
//           animate={{ scale: 1.5, opacity: 0 }}
//           transition={{
//             duration: 3,
//             repeat: Infinity,
//             delay: i * 1
//           }}
//         />
//       ))}
//     </motion.div>

//     {/* Main Entities - Innovators, Buyers, Allies with text that stays upright */}
//     {entities.map((entity, index) => {
//       const angle = index * 120;
//       return (
//         <motion.div
//           key={`entity-${index}`}
//           className="absolute left-1/2 top-1/2 z-10"
//           initial={{ 
//             opacity: 0,
//             rotate: angle
//           }}
//           animate={{ 
//             opacity: isLoaded ? 1 : 0,
//             rotate: isLoaded ? angle + 360 : angle
//           }}
//           transition={{ 
//             opacity: { duration: 0.6, delay: 0.5 + index * 0.2 },
//             rotate: { 
//               duration: 40, 
//               repeat: Infinity, 
//               ease: "linear",
//               delay: 0.5
//             }
//           }}
//           style={{
//             width: 0,
//             height: 0,
//           }}
//         >
//           {/* Connection lines */}
//           <div className="absolute" style={{ transformOrigin: "left center", left: 0, top: 0, width: "150px", height: "1px" }}>
//             <motion.div 
//               className="absolute h-1 inset-0" 
//               style={{
//                 background: `linear-gradient(90deg, transparent, ${entity.color})`,
//               }}
//               initial={{ opacity: 0.3 }}
//               animate={{ opacity: [0.3, 0.7, 0.3] }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 repeatType: "reverse"
//               }}
//             />
            
//             {/* Animated pulse along the line */}
//             <motion.div
//               className="absolute top-0 w-6 h-full"
//               style={{
//                 background: `linear-gradient(90deg, transparent, ${entity.color}, transparent)`,
//               }}
//               initial={{ x: -10 }}
//               animate={{ x: 150 }}
//               transition={{
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//                 delay: index * 0.5
//               }}
//             />
//           </div>

//           {/* Entity card - positioned at the end of the line but kept upright */}
//           <motion.div
//             className="absolute z-20"
//             style={{
//               left: 150,
//               top: -40,
//               width: 130,
//               height: 100,
//               transformOrigin: "center center",
//               // Fixed rotation to keep text upright
//               rotate: -angle,
//             }}
//             animate={{
//               rotate: angle,
//             }}
//             transition={{
//               rotate: { 
//                 duration: 40, 
//                 repeat: Infinity, 
//                 ease: "linear",
//                 delay: 0.5
//               }
//             }}
//           >
//             <motion.div
//               className="h-full w-full bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10"
//               animate={{
//                 boxShadow: [
//                   `0 0 15px ${entity.color}20`,
//                   `0 0 25px ${entity.color}40`,
//                   `0 0 15px ${entity.color}20`
//                 ]
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 repeatType: "reverse"
//               }}
//             >
//               <entity.icon size={24} className="mb-1" style={{ color: entity.color }} />
//               <p className="text-white text-sm font-semibold">{entity.label}</p>
//               <p className="text-zinc-400 text-xs">{entity.description}</p>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       );
//     })}

//     {/* Climate Tech Elements */}
//     {techElements.map((tech, index) => (
//       <motion.div
//         key={`tech-${index}`}
//         className="absolute z-10"
//         style={{ 
//           left: `${15 + (index % 2) * 70}%`, 
//           top: `${20 + Math.floor(index / 2) * 60}%` 
//         }}
//         initial={{ opacity: 0, scale: 0 }}
//         animate={{ 
//           opacity: isLoaded ? [0.7, 1, 0.7] : 0,
//           scale: isLoaded ? 1 : 0,
//           y: isLoaded ? [-(index % 3) * 8, (index % 3) * 8, -(index % 3) * 8] : 0
//         }}
//         transition={{
//           opacity: { 
//             duration: 3, 
//             repeat: Infinity,
//             repeatType: "reverse",
//             delay: 0.8 + index * 0.2 
//           },
//           scale: { duration: 0.5, delay: 0.8 + index * 0.2 },
//           y: { 
//             duration: 3 + index, 
//             repeat: Infinity,
//             repeatType: "reverse",
//             delay: 0.8 + index * 0.2 
//           }
//         }}
//       >
//         <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 border border-white/10 flex items-center justify-center"
//           style={{
//             boxShadow: `0 0 15px ${tech.color}40`
//           }}
//         >
//           <tech.icon size={20} style={{ color: tech.color }} />
//         </div>
//       </motion.div>
//     ))}

//     {/* Enhanced particle effects */}
//     {[...Array(20)].map((_, i) => (
//       <motion.div
//         key={`particle-${i}`}
//         className="absolute rounded-full bg-white/40"
//         style={{
//           width: `${1 + Math.random() * 2}px`,
//           height: `${1 + Math.random() * 2}px`,
//           left: `${Math.random() * 100}%`,
//           top: `${Math.random() * 100}%`,
//         }}
//         initial={{ 
//           opacity: 0,
//           scale: 0
//         }}
//         animate={{ 
//           opacity: isLoaded ? [0, 0.8, 0] : 0,
//           scale: isLoaded ? [0, 1, 0] : 0
//         }}
//         transition={{
//           opacity: {
//             duration: 1.5 + Math.random() * 3,
//             repeat: Infinity,
//             delay: Math.random() * 5 + 1
//           },
//           scale: {
//             duration: 1.5 + Math.random() * 3,
//             repeat: Infinity,
//             delay: Math.random() * 5 + 1
//           }
//         }}
//       />
//     ))}

//     {/* Data flow visualization */}
//     {[...Array(5)].map((_, i) => (
//       <motion.div
//         key={`data-flow-${i}`}
//         className="absolute w-2 h-2 rounded-full z-10 opacity-0"
//         style={{
//           background: entities[i % 3].color,
//           boxShadow: `0 0 8px ${entities[i % 3].color}`,
//         }}
//         initial={{ 
//           x: 0, 
//           y: 0,
//           scale: 0.5,
//           opacity: 0
//         }}
//         animate={{ 
//           x: [0, Math.cos(i * 72 * Math.PI/180) * 150],
//           y: [0, Math.sin(i * 72 * Math.PI/180) * 150],
//           scale: [0.5, 1, 0.5],
//           opacity: isLoaded ? [0, 1, 0] : 0
//         }}
//         transition={{
//           x: { 
//             duration: 2 + i * 0.3, 
//             repeat: Infinity,
//             repeatDelay: 2,
//             delay: 2 + i * 0.5
//           },
//           y: { 
//             duration: 2 + i * 0.3, 
//             repeat: Infinity,
//             repeatDelay: 2,
//             delay: 2 + i * 0.5
//           },
//           scale: { 
//             duration: 2 + i * 0.3, 
//             repeat: Infinity,
//             repeatDelay: 2,
//             delay: 2 + i * 0.5
//           },
//           opacity: { 
//             duration: 2 + i * 0.3, 
//             repeat: Infinity,
//             repeatDelay: 2,
//             delay: 2 + i * 0.5
//           }
//         }}
//       />
//     ))}
    
//     {/* Global impact indicator */}
//     <motion.div
//       className="absolute left-1/2 top-1/2 w-56 h-56 -ml-28 -mt-28 rounded-full border-2 border-dashed border-white/5 z-5"
//       initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
//       animate={{ 
//         opacity: isLoaded ? 0.2 : 0,
//         scale: isLoaded ? [0.8, 0.9, 0.8] : 0.8,
//         rotate: 360
//       }}
//       transition={{
//         opacity: { duration: 0.8, delay: 0.5 },
//         scale: { 
//           duration: 8, 
//           repeat: Infinity,
//           repeatType: "reverse"
//         },
//         rotate: { 
//           duration: 60, 
//           repeat: Infinity,
//           ease: "linear"
//         }
//       }}
//     />
//   </motion.div>
// </div>
//         </div>
        
//         {/* Additional information bar */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
//           transition={{ duration: 0.8, delay: 1 }}
//           className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 mb-16 border-t border-white/5 pt-10"
//         >
//           {[
//             { title: 'Accelerating Change', description: 'Join a network committed to scaling climate solutions for global impact.' },
//             { title: 'Resource Sharing', description: 'Access shared knowledge and resources to maximize your climate initiatives.' },
//             { title: 'Collaborative Impact', description: 'Partner with aligned organizations to achieve greater sustainability goals.' }
//           ].map((item, index) => (
//             <div key={index} className="relative">
//               <motion.div 
//                 className="absolute left-0 top-0 w-12 h-1"
//                 style={{ background: entities[index % 3].color }}
//                 initial={{ width: 0 }}
//                 animate={{ width: 48 }}
//                 transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
//               />
//               <h3 className="text-xl font-semibold text-white mt-4 mb-2">{item.title}</h3>
//               <p className="text-zinc-400">{item.description}</p>
//             </div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

import { Button } from "@/components/ui/button"
import MatchingAnimation from "./matching-animation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="w-full py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-[56px] font-bold leading-[1.1] tracking-tight text-gray-900">
                Helping Climate Solutions{" "}
                <span className="relative inline-block">
                  Thrive
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#00792b]"></span>
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-[600px]">
                A global ecosystem connecting climate innovators, buyers, and allies for mutual impact and growth.
              </p>
            </div>

            <div className="flex items-center gap-3 max-w-[600px]">
              <Link href="/onboarding" className="h-12 px-8 rounded-full bg-[#00792b] hover:bg-[#16a34a] flex justify-center items-center text-white font-medium">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="flex gap-16 pt-8 border-t border-gray-100">
              <div>
                <div className="text-4xl font-bold text-gray-900">85%</div>
                <div className="text-base text-gray-500">Faster solution matching</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">100+</div>
                <div className="text-base text-gray-500">Climate tech solutions</div>
              </div>
            </div>
          </div>

          {/* Right Column - Illustration */}
          <div className="relative w-full lg:w-[600px] h-[500px] lg:-mr-8 mt-8"> {/* Increased height */}
            <div className="absolute top-0 right-0 bg-black text-white text-sm px-3 py-1 rounded-bl-lg z-10">
              AI-Powered
            </div>
            <div className="absolute inset-0 flex items-start justify-center pt-12"> {/* Adjusted positioning */}
              <MatchingAnimation />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}