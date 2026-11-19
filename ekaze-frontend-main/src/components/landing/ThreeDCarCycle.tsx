import { useState, useEffect } from "react";

export const ThreeDCarCycle = () => {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let animId: number;
    let currentAngle = 0;
    const animate = () => {
      currentAngle = (currentAngle + 0.6) % 360;
      setAngle(currentAngle);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Calculate dynamic 3D perspective transforms
  const rad = (angle * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);

  // Depth scaling and horizontal translation for 3D turntable effect
  const depthScale = 0.94 + 0.08 * cos;
  const skewX = sin * 3.5;
  const lightShift = 50 + sin * 35;

  return (
    <div className="relative w-full max-w-[420px] mx-auto h-[260px] sm:h-[300px] flex items-center justify-center select-none overflow-visible">
      {/* Dynamic 3D Ground Shadow that stays on the floor */}
      <div
        className="absolute bottom-4 sm:bottom-6 w-[82%] h-8 bg-black/25 rounded-[100%] blur-md pointer-events-none transition-transform"
        style={{
          transform: `scale(${0.9 + 0.1 * cos}, ${0.85 + 0.15 * Math.abs(cos)})`,
          opacity: 0.35 + 0.15 * cos,
        }}
      />

      {/* 3D Perspective Turntable Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
        style={{
          perspective: 1200,
        }}
      >
        <div
          className="relative w-full max-w-[380px] transition-transform duration-75 ease-linear"
          style={{
            transform: `scale(${depthScale}) skewY(${skewX * 0.4}deg) translateY(${sin * 4}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Transparent SVG Modern Debadged Vehicle (No logo, No plate) */}
          <svg
            viewBox="0 0 540 280"
            className="w-full h-auto drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Dynamic Metallic Paint Shimmer */}
              <linearGradient id="carBodyPaint" x1={`${lightShift - 30}%`} y1="0%" x2={`${lightShift + 30}%`} y2="100%">
                <stop offset="0%" stopColor="#f36805" />
                <stop offset="35%" stopColor="#ff851b" />
                <stop offset="60%" stopColor="#e05400" />
                <stop offset="100%" stopColor="#b33900" />
              </linearGradient>

              {/* Roof & Pillars Dark Metallic */}
              <linearGradient id="roofPaint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2229" />
                <stop offset="60%" stopColor="#111317" />
                <stop offset="100%" stopColor="#08090b" />
              </linearGradient>

              {/* Glass Canopy with Realistic Skylight Reflections */}
              <linearGradient id="windshieldGlass" x1={`${lightShift}%`} y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#7ec8f8" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#1b3a57" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0a1724" stopOpacity="0.95" />
              </linearGradient>

              {/* LED Headlight Beam Glow */}
              <linearGradient id="ledGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#80d4ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0099ff" stopOpacity="0" />
              </linearGradient>

              {/* Chrome Accents */}
              <linearGradient id="chromeTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#666" />
                <stop offset="30%" stopColor="#fff" />
                <stop offset="70%" stopColor="#888" />
                <stop offset="100%" stopColor="#333" />
              </linearGradient>

              {/* Wheel Rim Gradient */}
              <linearGradient id="rimMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#444" />
                <stop offset="50%" stopColor="#ddd" />
                <stop offset="100%" stopColor="#222" />
              </linearGradient>
            </defs>

            {/* ══════ VEHICLE UNDERCARRIAGE & SHADOW ══════ */}
            <path
              d="M75 230 C 140 242, 400 242, 465 230 C 495 224, 495 240, 460 244 C 380 252, 160 252, 80 244 C 45 240, 45 224, 75 230 Z"
              fill="#0a0a0c"
              opacity="0.8"
            />

            {/* ══════ MAIN HOOD & LOWER CABIN BODY ══════ */}
            <path
              d="M70 200 
                 C 72 170, 95 142, 130 135 
                 C 170 128, 230 124, 270 124 
                 C 310 124, 370 128, 410 135 
                 C 445 142, 468 170, 470 200 
                 C 472 225, 455 234, 420 236 
                 C 360 239, 180 239, 120 236 
                 C 85 234, 68 225, 70 200 Z"
              fill="url(#carBodyPaint)"
            />

            {/* Aerodynamic Front Bumper Flairs & Sculpted Lip */}
            <path
              d="M80 195 C 130 206, 210 210, 270 210 C 330 210, 410 206, 460 195 C 472 216, 456 232, 425 234 C 365 237, 175 237, 115 234 C 84 232, 68 216, 80 195 Z"
              fill="#c94900"
              opacity="0.9"
            />

            {/* ══════ GLASS GREENHOUSE (ROOF, CANOPY & PILLARS) ══════ */}
            <path
              d="M125 136 
                 C 142 98, 172 65, 205 60 
                 C 235 56, 305 56, 335 60 
                 C 368 65, 398 98, 415 136 
                 C 370 129, 320 125, 270 125 
                 C 220 125, 170 129, 125 136 Z"
              fill="url(#windshieldGlass)"
            />

            {/* Sleek Panoramic Glass Roof Cap */}
            <path
              d="M200 62 C 230 57, 310 57, 340 62 C 348 64, 342 74, 335 75 C 300 79, 240 79, 205 75 C 198 74, 192 64, 200 62 Z"
              fill="url(#roofPaint)"
            />

            {/* Left & Right A-Pillars (Sleek aerodynamic frame) */}
            <path d="M124 137 L 140 137 L 206 63 L 196 63 Z" fill="url(#roofPaint)" />
            <path d="M416 137 L 400 137 L 334 63 L 344 63 Z" fill="url(#roofPaint)" />

            {/* Interior Chauffeur & Passenger Headrests Silhouette */}
            <ellipse cx="218" cy="98" rx="14" ry="18" fill="#111827" opacity="0.8" />
            <ellipse cx="322" cy="98" rx="14" ry="18" fill="#111827" opacity="0.8" />
            <path d="M255 106 C 262 104, 278 104, 285 106 C 285 118, 255 118, 255 106 Z" fill="#1f2937" opacity="0.7" />

            {/* Windshield Wiper Details */}
            <path d="M170 132 L 260 128" stroke="#111" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
            <path d="M280 130 L 370 128" stroke="#111" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

            {/* Aerodynamic Side Wing Mirrors */}
            <path d="M102 142 C 80 138, 70 148, 82 158 C 96 162, 116 156, 122 146 Z" fill="url(#carBodyPaint)" />
            <path d="M86 142 C 78 145, 78 152, 86 155 Z" fill="#38bdf8" opacity="0.8" />

            <path d="M438 142 C 460 138, 470 148, 458 158 C 444 162, 424 156, 418 146 Z" fill="url(#carBodyPaint)" />
            <path d="M454 142 C 462 145, 462 152, 454 155 Z" fill="#38bdf8" opacity="0.8" />

            {/* ══════ MODERN DEBADGED RADIATOR GRILLE (NO LOGO) ══════ */}
            {/* Upper Clean Honeycomb Hex Dark Intake */}
            <path
              d="M165 174 C 210 171, 330 171, 375 174 C 382 188, 370 196, 350 198 C 300 200, 240 200, 190 198 C 170 196, 158 188, 165 174 Z"
              fill="#121316"
            />
            {/* Satin Horizontal Grille Louver Lines (Completely debadged, smooth and clean) */}
            <path d="M176 180 C 220 177, 320 177, 364 180" stroke="#2a2e36" strokeWidth="2" strokeLinecap="round" />
            <path d="M182 187 C 225 184, 315 184, 358 187" stroke="#2a2e36" strokeWidth="2" strokeLinecap="round" />
            <path d="M192 193 C 230 191, 310 191, 348 193" stroke="#2a2e36" strokeWidth="1.8" strokeLinecap="round" />

            {/* Lower Front Apron Mesh Intake (Completely clean bumper, NO license plate) */}
            <path
              d="M195 210 C 230 208, 310 208, 345 210 C 352 222, 340 228, 325 229 C 290 231, 250 231, 215 229 C 200 228, 188 222, 195 210 Z"
              fill="#0d0e11"
            />
            {/* Chrome Front Splitter Wing Bar */}
            <path d="M150 228 C 210 234, 330 234, 390 228" stroke="url(#chromeTrim)" strokeWidth="2" strokeLinecap="round" />

            {/* ══════ JEWEL LED PROJECTOR HEADLIGHTS ══════ */}
            {/* Left High-Tech Headlight Cluster */}
            <path
              d="M102 165 
                 C 125 160, 158 168, 166 172 
                 C 160 188, 142 192, 120 188 
                 C 105 184, 98 174, 102 165 Z"
              fill="#0a0c10"
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            {/* Glowing Dual LED DRL projector lenses */}
            <ellipse cx="122" cy="177" rx="7" ry="5.5" fill="#f8fafc" />
            <ellipse cx="140" cy="175" rx="6" ry="4.5" fill="#38bdf8" />
            <path d="M108 168 C 128 164, 154 171, 162 173" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Right High-Tech Headlight Cluster */}
            <path
              d="M438 165 
                 C 415 160, 382 168, 374 172 
                 C 380 188, 398 192, 420 188 
                 C 435 184, 442 174, 438 165 Z"
              fill="#0a0c10"
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
            {/* Glowing Dual LED DRL projector lenses */}
            <ellipse cx="418" cy="177" rx="7" ry="5.5" fill="#f8fafc" />
            <ellipse cx="400" cy="175" rx="6" ry="4.5" fill="#38bdf8" />
            <path d="M432 168 C 412 164, 386 171, 378 173" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Lower Fog Light Pods with Chrome Accents */}
            <circle cx="112" cy="214" r="7" fill="#111" stroke="#475569" strokeWidth="1" />
            <circle cx="112" cy="214" r="3.5" fill="#f8fafc" />
            <circle cx="428" cy="214" r="7" fill="#111" stroke="#475569" strokeWidth="1" />
            <circle cx="428" cy="214" r="3.5" fill="#f8fafc" />

            {/* ══════ PERFORMANCE WHEELS & TIRES ══════ */}
            {/* Left Front Tire & Multi-Spoke Alloy Rim */}
            <g style={{ transform: `rotate(${angle * 4}deg)`, transformOrigin: "92px 214px" }}>
              <ellipse cx="92" cy="214" rx="20" ry="26" fill="#141518" stroke="#222" strokeWidth="2" />
              <ellipse cx="92" cy="214" rx="13" ry="17" fill="url(#rimMetal)" />
              <line x1="92" y1="197" x2="92" y2="231" stroke="#111" strokeWidth="2" />
              <line x1="79" y1="214" x2="105" y2="214" stroke="#111" strokeWidth="2" />
              <line x1="83" y1="202" x2="101" y2="226" stroke="#111" strokeWidth="2" />
              <line x1="101" y1="202" x2="83" y2="226" stroke="#111" strokeWidth="2" />
            </g>

            {/* Right Front Tire & Multi-Spoke Alloy Rim */}
            <g style={{ transform: `rotate(${angle * 4}deg)`, transformOrigin: "448px 214px" }}>
              <ellipse cx="448" cy="214" rx="20" ry="26" fill="#141518" stroke="#222" strokeWidth="2" />
              <ellipse cx="448" cy="214" rx="13" ry="17" fill="url(#rimMetal)" />
              <line x1="448" y1="197" x2="448" y2="231" stroke="#111" strokeWidth="2" />
              <line x1="435" y1="214" x2="461" y2="214" stroke="#111" strokeWidth="2" />
              <line x1="439" y1="202" x2="457" y2="226" stroke="#111" strokeWidth="2" />
              <line x1="457" y1="202" x2="439" y2="226" stroke="#111" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
