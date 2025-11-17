
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#4900fc] to-[#282828] z-0" />
      {/* <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_20%,rgba(106,54,255,0.25),transparent_70%)] z-0" />
      <div className="absolute -top-24 -left-24 w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full blur-[90px] md:blur-[120px] bg-[#6a36ff]/40 z-0" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[420px] h-[420px] md:w-[680px] md:h-[680px] rounded-full blur-[120px] md:blur-[160px] bg-[#4c1d95]/30 z-0" /> */}

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        {/* Flex container for mobile layout, becomes relative for absolute positioning on desktop */}
        <div className="flex flex-col md:relative justify-center items-center md:items-start text-center md:text-left min-h-screen pt-24 pb-12">
        
          {/* Main Text Content */}
          <div className="w-full md:absolute md:left-4 sm:md:left-6 lg:md:left-8 md:top-[55%] md:-translate-y-1/2">
            <div 
              className="space-y-4 md:space-y-6"
            >
              <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-bold">We build trust.</h1>
              <p className="text-[#cbd5e1] text-base sm:text-lg md:text-2xl">Get verified & create planetary health</p>
              <div className="flex justify-center md:justify-start items-center gap-3 pt-4">
                <Link href="/onboarding" aria-label="Get started" className="h-11 px-6 md:h-12 md:px-8 rounded-full bg-gradient-to-r from-[#6a36ff] to-[#9c40ff] text-white font-medium flex items-center transition-transform transform-gpu hover:scale-[1.03] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9c40ff]">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right side Pills */}
          <div className="mt-12 md:mt-0 w-full flex justify-center md:block md:absolute md:top-1/2 md:-translate-y-[80%] md:right-4 sm:md:right-6 lg:md:right-8 md:w-1/2 md:max-w-md">
            <div className="relative flex flex-col items-center md:items-start space-y-10 md:space-y-12">
              {/* Investor Pill */}
              <div>
                <span className="inline-block w-48 md:w-56 py-3 px-8 rounded-full border-2 border-purple-500 text-white font-semibold text-base md:text-lg bg-black/30 backdrop-blur-sm shadow-lg text-center">
                  Investor
                </span>
              </div>
              
              {/* Corporation Pill */}
              <div className="relative flex items-center md:ml-10">
                <span className="inline-block w-48 md:w-56 py-3 px-8 rounded-full border-2 border-purple-500 text-white font-semibold text-base md:text-lg bg-black/30 backdrop-blur-sm shadow-lg text-center md:ml-8">
                  Corporation
                </span>
                <div
                className="absolute right-full h-[2px] bg-gradient-to-l from-purple-500 to-transparent hidden md:block"
                style={{ width: '10rem', right: 'calc(100% - 1.2rem)' }}
                />
              </div>

              {/* Climate Solutions Pill */}
              <div className="relative flex items-center md:ml-10">
                <span className="inline-block w-48 md:w-56 py-3 px-8 rounded-full border-2 border-purple-500 text-white font-semibold text-base md:text-lg bg-black/30 backdrop-blur-sm shadow-lg text-center">
                  Climate Solutions
                </span>
                <div
                  className="absolute right-full h-[2px] bg-gradient-to-l from-purple-500 to-transparent mr-3 hidden md:block"
                  style={{ width: '6rem', right: 'calc(100%)'}}
                />
              </div>
            </div>
          </div>

          {/* Bottom Pills */}
          <div className="mt-12 md:mt-0 md:absolute md:bottom-16 md:left-1/2 md:-translate-x-1/2 w-full max-w-xs sm:max-w-sm md:max-w-3xl px-4">
            <div className="relative flex flex-col md:flex-row items-center justify-center md:justify-between w-full gap-4 md:gap-0">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-purple-500/50 w-full hidden md:block" />
              
              <div 
                className="w-full md:w-auto"
              >
                <span className="relative block w-full text-center px-6 py-3 rounded-full border border-[#6a36ff] bg-[#2a175f]/80 text-white shadow-[0_0_25px_rgba(106,54,255,0.45)]">
                  Scaling through Alignment
                </span>
              </div>
              
              <div 
                className="w-full md:w-auto"
              >
                <span className="relative flex items-center justify-center w-full px-8 py-3 rounded-full bg-[#6a36ff] text-white font-semibold shadow-[0_0_35px_rgba(106,54,255,0.6)]">
                  Your company
                  <Sparkles className="ml-3 h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
