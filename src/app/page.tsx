import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Features from '@/components/sections/Features'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Features />
      </main>
      <Footer />
    </>
  )
}
