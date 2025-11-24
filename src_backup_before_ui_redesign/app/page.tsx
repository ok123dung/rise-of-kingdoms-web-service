import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Features from '@/components/sections/Features'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'

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
