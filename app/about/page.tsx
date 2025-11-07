import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/navbar'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-5xl mx-auto mt-20">
            <h1 className="text-6xl font-bold mb-12 text-center">
              Meet NoHarm.
            </h1>
            <h2 className="text-4xl font-semibold mb-16 text-center text-[#9b00ff]">
              Over 11 years of experience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-xl">
              <p>
                Focused on mastering the evolution of international ESG and sustainability standards, technology, and innovation across diverse global regions.
              </p>
              <p>
                Our objective is to simplify the journey towards sustainability, and grow revenue with sustainable solutions, strategies, products, training, and talent.
              </p>
            </div>
            <h2 className="text-4xl font-bold text-center mt-20">
              Now, we&apos;re here to help you do the same.
            </h2>
          </div>
        </section>

        {/* Values Section */}
        <section className="w-full bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-8 mb-20">
              <h3 className="text-3xl font-semibold">People</h3>
              <h3 className="text-3xl font-semibold">Process</h3>
              <h3 className="text-3xl font-semibold">Technology</h3>
            </div>

            <h2 className="text-5xl font-bold mb-16">This is us!</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/AboutUsImage.jpg"
                  alt="Hands together on a tree trunk representing unity and sustainability"
                  width={400}
                  height={100}
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">Our values.</h3>
                <p className="text-lg">
                  At Noharm, our core values drive everything we do. We embrace{' '}
                  <span className="text-[#00792b]">quality</span> as our standard, ensuring that every solution we offer meets the highest benchmarks of excellence.
                </p>
                <p className="text-lg">
                  Our <span className="text-[#9b00ff]">curiosity</span> fuels our relentless pursuit of innovation, enabling us to stay at the forefront of climate tech.
                </p>
                <p className="text-lg">
                  We celebrate <span className="text-[#9b00ff]">diversity</span>, recognizing that varied perspectives strengthen our ability to address global ESG challenges.
                </p>
                <p className="text-lg">
                  Finally, our adaptability allows us to swiftly respond to the ever-evolving landscape of sustainability.
                </p>
              </div>
            </div>

            <p className="text-lg text-center max-w-4xl mx-auto">
              Together, these values guide us in our mission to accelerate the effectiveness of climate tech solutions and build a more sustainable, nature-first world.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

