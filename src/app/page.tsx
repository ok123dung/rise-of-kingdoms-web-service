import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Testimonials from '@/components/sections/Testimonials'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
