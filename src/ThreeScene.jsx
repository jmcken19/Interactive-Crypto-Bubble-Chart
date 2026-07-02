import { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { fetchMarketData } from "./fetchMarketData";

// This file takes the coin market data and redners it as a 3d scene

const FONT_FAMILY = "'Segoe UI', Arial, sans-serif";

const ThreeScene = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ^^ these 3 lines will track the status of the api call, so that the user can see if it is loading,
  // if there was an error, or if the data was successfully fetched and is ready to be displayed.
  
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMarketData(); // calls fetchMarketData function
        if (data && data.length > 0) { //if it recieves data, it creates a new state variable called marketData and sets it to the data that was fetched from the api, so that it can be used in the 3d scene.
          setMarketData(data);
        } else {
          setError("No data received from API.");
        }
      } catch (err) { //catch any errors, simple
        setError("Failed to fetch data.");
      }
      setLoading(false);
    };
    getData();
  }, []);
  // this will determine if the scene is loading or if theres been an error,
  // the goal is to make sure the scene is only rendered when the data is ready, and not before,
  //  so that the user can see a loading message or an error message if something goes wrong.
  useEffect(() => {
    if (loading || error || marketData.length === 0) return;

    // Remove any previous renderer
    const prevRenderer = document.getElementById("threejs-canvas");
    if (prevRenderer) {
      prevRenderer.remove();
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181c20);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = "threejs-canvas";
    document.body.appendChild(renderer.domElement);

    // from claude -> 
    // This is the standard "three ingredients" of any Three.js app: a scene (the world),
    //  a camera (your viewpoint into it), and a renderer (draws it to a <canvas> element, 
    // which gets manually appended straight onto document.body — a bit unusual for React, 
    // normally you'd want a ref to a container div, but it works).

    // Controls for user controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    // Helper: Label with name (symbol) and price
    const createTextSprite = (name, symbol, price) => {
      const canvas = document.createElement("canvas");
      const size = 320;
      canvas.width = size;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, 90);

      ctx.font = `bold 24px ${FONT_FAMILY}`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${name} (${symbol})`, size / 2, 10);

      ctx.font = `20px ${FONT_FAMILY}`;
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`$${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}`, size / 2, 44);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(7, 2, 1);
      return sprite;
    };

    // from claude ->
    // you draw the text onto a hidden 2D <canvas> element first (using normal Canvas API: ctx.fillText, c
    // tx.font, etc.), then turn that canvas into a texture (CanvasTexture) and slap it onto a Sprite — a 
    // flat plane that always faces the camera no matter how you rotate the view. That's how name (symbol) 
    // and $price show up as floating text

    // Add coins as transparent spheres with logo and label
    const loader = new THREE.TextureLoader();
    const spheres = [];
    marketData.forEach((coin, i) => {
        //creating the sphere
      const geometry = new THREE.SphereGeometry(2, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
      });
      const sphere = new THREE.Mesh(geometry, material);

      // Arrange in a circle
      const angle = (i / marketData.length) * Math.PI * 2;
      const radius = 10;
      sphere.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      scene.add(sphere);
      spheres.push(sphere);

      // Add coin logo as sprite centered inside the sphere
      loader.load(coin.image, (texture) => {
        const logoMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const logo = new THREE.Sprite(logoMat);
        logo.scale.set(1.5, 1.5, 1);
        logo.position.set(0, 0, 0);
        sphere.add(logo);
      });

      // Add label above
      const label = createTextSprite(coin.name, coin.symbol, coin.current_price);
      label.position.copy(sphere.position).add(new THREE.Vector3(0, 3, 0));
      scene.add(label);
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate); //API for smooth animation in browser
      controls.update();
      spheres.forEach((sphere) => {
        sphere.rotation.y += 0.008;
      });
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [marketData, loading, error]);

  if (loading) return <div style={{ color: "white" }}>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (marketData.length === 0) return <div style={{ color: "yellow" }}>No data available.</div>;

  return null;
};

export default ThreeScene;