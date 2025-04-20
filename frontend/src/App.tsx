import './App.css'
import Navbar from './components/Navbar/NavbarComponent'
import HeroSection from './components/Hero/HeroSection'
import Showcase from './components/showcase/Showcase'
import Location from './components/Location/Location'
import Partner from './components/PartnerComponents/Partner'
import Review from './components/ReviewComponents/Review'

function App() {
  return (
      <div className='w-screen'>
        <div className='sticky sticky top-0 z-50'>
          <Navbar />
        </div>
        <div>
          <HeroSection />
        </div>
        <div>
          <Showcase />
        </div>
        <div>
          <Location />
        </div>
        <div>
          <Partner />
        </div>
        <div>
          <Review />
        </div>
      </div>
  )
}

export default App
