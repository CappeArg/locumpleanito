import React from 'react';

export const BuntingBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`guirnalda-container ${className}`} style={{ width: '100%', overflow: 'hidden', height: '22px', position: 'relative', zIndex: 10 }}>
      <svg
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <path d="M0,0 L400,0" stroke="#262220" strokeWidth="3" />
        
        {/* Banderines triangulares repetidos */}
        {/* Triángulo 1 - Celeste */}
        <polygon points="0,0 20,20 40,0" fill="#3298DC" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 2 - Blanco/Crema */}
        <polygon points="40,0 60,20 80,0" fill="#FFFDF8" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 3 - Sol */}
        <polygon points="80,0 100,20 120,0" fill="#FFBC00" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 4 - Rojo */}
        <polygon points="120,0 140,20 160,0" fill="#E03E2D" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 5 - Verde */}
        <polygon points="160,0 180,20 200,0" fill="#2ECC71" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 6 - Celeste */}
        <polygon points="200,0 220,20 240,0" fill="#3298DC" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 7 - Blanco */}
        <polygon points="240,0 260,20 280,0" fill="#FFFDF8" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 8 - Sol */}
        <polygon points="280,0 300,20 320,0" fill="#FFBC00" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 9 - Rojo */}
        <polygon points="320,0 340,20 360,0" fill="#E03E2D" stroke="#262220" strokeWidth="2" />
        {/* Triángulo 10 - Celeste */}
        <polygon points="360,0 380,20 400,0" fill="#3298DC" stroke="#262220" strokeWidth="2" />
      </svg>
    </div>
  );
};
