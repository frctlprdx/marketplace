import './App.css'
import Navbar from './components/navbar/Navbar'
import HeroSection from './components/hero/HeroSection'
import Showcase from './components/showcase/Showcase'

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
      </div>
  )
}

export default App
