import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

try {
  const emptyCar = path.resolve(__dirname, "./src/assets/transparent_standing_car.png");
  if (fs.existsSync(emptyCar) && fs.statSync(emptyCar).size === 0) {
    fs.unlinkSync(emptyCar);
  }
} catch (e) {}

// Auto-copy generated images if present
try {
  const heroSrc = "C:/Users/PC/.gemini/antigravity/brain/e1de8fb0-d9b1-4fa3-9e03-86cab6c24d2d/scania_truck_africa_hero_1794823326384.jpg";
  const heroDest = path.resolve(__dirname, "./src/assets/scania_truck_africa_hero.jpg");
  if (fs.existsSync(heroSrc) && !fs.existsSync(heroDest)) {
    fs.copyFileSync(heroSrc, heroDest);
  }

  const tipperSrc = "C:/Users/PC/.gemini/antigravity/brain/e1de8fb0-d9b1-4fa3-9e03-86cab6c24d2d/modern_tipper_truck_1794824512789.jpg";
  const tipperDest = path.resolve(__dirname, "./src/assets/tipper_truck.jpg");
  if (fs.existsSync(tipperSrc) && !fs.existsSync(tipperDest)) {
    fs.copyFileSync(tipperSrc, tipperDest);
  }

  const carSrc = "C:/Users/PC/.gemini/antigravity/brain/e1de8fb0-d9b1-4fa3-9e03-86cab6c24d2d/hero_front_orange_car_1794825819552.jpg";
  const carDest = path.resolve(__dirname, "./src/assets/services_car.jpg");
  if (fs.existsSync(carSrc) && !fs.existsSync(carDest)) {
    fs.copyFileSync(carSrc, carDest);
  }
} catch (e) {
  console.error("Failed to copy images:", e);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
