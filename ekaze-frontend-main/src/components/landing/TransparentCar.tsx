import { useEffect, useRef, useState } from "react";
import carImg from "@/assets/services_car.jpg";

export const TransparentCar = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = carImg;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 450;
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Scan and make all studio background pixels 100% transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is part of the light studio background
        const isNeutral = Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
        if (isNeutral && r > 212 && g > 212 && b > 212) {
          data[i + 3] = 0; // Pure Transparent
        } else if (isNeutral && r > 195 && g > 195 && b > 195) {
          // Feather soft edges near tires/shadows
          const factor = (Math.min(r, g, b) - 195) / (212 - 195);
          data[i + 3] = Math.round(data[i + 3] * (1 - factor));
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Smoothly debadge the grill emblem so no brand logo exists
      const badgeX = w * 0.498;
      const badgeY = h * 0.548;
      const badgeRadiusX = w * 0.026;
      const badgeRadiusY = h * 0.024;

      ctx.fillStyle = "#181818";
      ctx.beginPath();
      ctx.ellipse(badgeX, badgeY, badgeRadiusX, badgeRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Clean horizontal grill slat line matching original automotive aesthetic
      ctx.strokeStyle = "#252525";
      ctx.lineWidth = Math.max(2, w * 0.003);
      ctx.beginPath();
      ctx.moveTo(badgeX - badgeRadiusX * 1.4, badgeY);
      ctx.lineTo(badgeX + badgeRadiusX * 1.4, badgeY);
      ctx.stroke();

      setLoaded(true);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] mx-auto flex items-center justify-center select-none py-2">
      {/* Soft ground shadow under tires */}
      <div className="absolute bottom-2 w-[76%] h-6 bg-black/25 rounded-[100%] blur-md pointer-events-none" />

      {/* Transparent debadged car canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto object-contain transition-opacity duration-300 relative z-10 select-none pointer-events-none ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};
