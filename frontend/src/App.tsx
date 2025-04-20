import './App.css'
import Navbar from './components/navbar/Navbar'
import HeroSection from './components/hero/HeroSection'

function App() {
  return (
      <div className='w-screen'>
        <div className='sticky sticky top-0 z-50'>
          <Navbar />
        </div>
        <div>
          <HeroSection />
        </div>
        <div className='h-[10000px] w-screen bg-black'>

        </div>
      </div>
  )
}

export default App
