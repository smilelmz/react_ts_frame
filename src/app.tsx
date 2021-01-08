import React, { Suspense, useState } from 'react'
import './app.scss'

const One = React.lazy(() => import('@/components/One'))
const Two = React.lazy(() => import('@/components/Two'))

function App() {
  const [showTwo, setShowTwo] = useState<boolean>(false)

  return (
    <div className='app'>
      <Suspense fallback={<div>Loading...</div>}>
        <One a={1} b={2} />
        {showTwo && <Two a={3} b={4} />}
        <button type='button' onClick={() => setShowTwo(true)}>
          显示Two啊啊啊fff
        </button>
      </Suspense>
    </div>
  )
}

export default App
