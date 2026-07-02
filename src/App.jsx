import ThreeScene from './ThreeScene'

// the root component of the app, which renders the ThreeScene component. 
// The ThreeScene component is responsible for rendering the 3D scene using 
// Three.js and displaying the coin data fetched from the API.

function App() {
  return (
    <>
      <ThreeScene />
    </>
  )
}

export default App
