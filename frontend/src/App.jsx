import { useState } from 'react'
 
import './App.css'
// import Page1 from './components/Page1'
import Page1 from './components/Page1'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Page1/>
    </>
  )
}

export default App
