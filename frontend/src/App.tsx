import './App.css'
import Navbar from './components/navbar/Navbar'

function App() {
  return (
      <div className='w-screen'>
        <div className='sticky sticky top-0 z-50'>
          <Navbar />
        </div>
        <div className='bg-black h-screen'>

        </div>
      </div>
  )
}

export default App
