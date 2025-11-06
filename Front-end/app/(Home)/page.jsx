import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import StatsSection from "@/components/stats-section"
import FeaturedCourses from "@/components/featured-courses"
import PopularCategories from "@/components/popular-categories"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturedCourses />
        <PopularCategories />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}