import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import starsData from './data/stars.json';

const MAX_ETH_SUPPLY = 1000000000; // Maksimum ETH arzı

function generateStarPath(size) {
  // Yıldız için 5 köşe noktası oluştur
  const points = [];
  const outerRadius = size;
  const innerRadius = size * 0.4; // İç yarıçap dış yarıçapın %40'ı
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / 5) * i;
    const x = 100 + radius * Math.sin(angle);
    const y = 100 + radius * Math.cos(angle);
    points.push(`${x},${y}`);
  }
  
  return `M ${points.join(' L ')} Z`;
}

function getRandomColor() {
  const colors = [
    '#FFD700', // altın sarısı
    '#FFF4E0', // parlak beyaz
    '#F0F8FF', // açık mavi beyaz
    '#87CEEB', // açık mavi
    '#E6E6FA', // lavanta
    '#B0E0E6', // açık deniz mavisi
    '#FFFACD', // limon sarısı
    '#FFB6C1', // açık pembe
    '#98FB98', // açık yeşil
    '#DDA0DD', // erik moru
    '#F0E68C', // khaki
    '#E0FFFF', // açık cyan
    '#FFDAB9', // şeftali
    '#D8BFD8', // açık mor
    '#AFEEEE', // turkuaz
    '#F5DEB3', // buğday
    '#FFA07A', // açık somon
    '#87CEFA', // açık gökyüzü mavisi
    '#98FF98', // nane yeşili
    '#DEB887', // açık kahve
    '#FF69B4', // sıcak pembe
    '#7FFFD4', // aquamarine
    '#FFE4E1', // misty rose
    '#F0FFF0', // bal köpüğü
    '#E6E6FA', // lavanta
    '#FFF0F5', // lavanta pembesi
    '#F0FFFF', // azure
    '#F5F5DC', // bej
    '#FAFAD2', // açık altın sarısı
    '#E0EAFC', // açık gece mavisi
    '#CCFBFF', // açık turkuaz
    '#EFD5FF', // açık orkide
    '#FFE4B5', // moccasin
    '#B0F2B4', // nane krema
    '#BAF2E9', // açık deniz köpüğü
    '#F3E7E9', // açık gül
    '#E3FDF5', // nane suyu
    '#FFE2D1', // şampanya
    '#FFF1E6', // vanilya krema
    '#FDE2E4', // pembe şeker
    '#FAD2E1', // açık magenta
    '#DBE7E4', // açık çam yeşili
    '#F0EFEB', // sedef beyazı
    '#E2ECE9', // açık nane
    '#BEE1E6', // buz mavisi
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomPosition(containerSize, existingPositions, starSize) {
  const padding = starSize * 2; // Yıldızlar arası minimum mesafe
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const position = {
      left: padding + Math.random() * (containerSize.width - padding * 2),
      top: padding + Math.random() * (containerSize.height - padding * 2)
    };

    // Diğer yıldızlarla çakışma kontrolü
    const hasOverlap = existingPositions.some(existing => {
      const distance = Math.sqrt(
        Math.pow(existing.left - position.left, 2) + 
        Math.pow(existing.top - position.top, 2)
      );
      return distance < padding;
    });

    if (!hasOverlap) {
      return position;
    }

    attempts++;
  }

  // Eğer uygun pozisyon bulunamazsa, yeni bir satır ekle
  return {
    left: padding + Math.random() * (containerSize.width - padding * 2),
    top: Math.max(...existingPositions.map(pos => pos.top), 0) + padding * 2
  };
}

function formatWalletAddress(address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatBalance(balance) {
  if (balance < 0.01) {
    return "<0.01";
  }
  return Number(balance).toFixed(3);
}

function formatPercentage(percentage) {
  if (percentage < 0.01) {
    return "<0.01";
  }
  return percentage.toFixed(3);
}

// Yüzdelik orana göre boyut hesaplama
function calculateStarSize(balance) {
  const percentage = (balance / MAX_ETH_SUPPLY) * 100;
  const minSize = 35; // minimum yıldız boyutunu 25'ten 15'e düşürdük
  const maxSize = 65; // maximum yıldız boyutunu 150'den 50'ye düşürdük
  
  // Logaritmik ölçekleme kullanarak daha dengeli bir dağılım elde edelim
  const normalizedSize = minSize + (Math.log10(1 + percentage) * 10); // çarpanı 20'den 10'a düşürdük
  return Math.min(maxSize, Math.max(minSize, normalizedSize));
}

function calculateGridPositions(containerWidth, starCount) {
  const MAX_STARS_PER_ROW = 25;
  const horizontalGap = containerWidth / MAX_STARS_PER_ROW;
  const verticalGap = horizontalGap; // Kare grid için
  
  const positions = [];
  const maxOffset = horizontalGap * 0.2; // %20'ye düşürdük
  const safeMargin = horizontalGap * 0.5; // Kenarlardan güvenli mesafe
  const minAllowedX = safeMargin + maxOffset;
  const maxAllowedX = containerWidth - safeMargin - maxOffset;

  for (let i = 0; i < starCount; i++) {
    const row = Math.floor(i / MAX_STARS_PER_ROW);
    const col = i % MAX_STARS_PER_ROW;
    
    // Her satırı biraz kaydıralım
    const rowOffset = row % 2 ? horizontalGap / 2 : 0;
    
    // X pozisyonunu sınırla
    const baseX = (col * horizontalGap) + rowOffset + (horizontalGap / 2);
    
    let finalX;
    if (baseX > maxAllowedX) {
      finalX = maxAllowedX - (Math.random() * maxOffset);
    } else if (baseX < minAllowedX) {
      finalX = minAllowedX + (Math.random() * maxOffset);
    } else {
      const randomOffsetX = (Math.random() - 0.5) * maxOffset;
      finalX = Math.min(Math.max(minAllowedX, baseX + randomOffsetX), maxAllowedX);
    }
    
    const randomOffsetY = (Math.random() - 0.5) * maxOffset;
    
    positions.push({
      left: finalX,
      top: (row * verticalGap) + (verticalGap / 2) + randomOffsetY
    });
  }
  
  // Çakışmaları kontrol et ve düzelt
  positions.forEach((pos) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const hasOverlap = positions.some((otherPos) => {
        if (pos === otherPos) return false;
        
        const distance = Math.sqrt(
          Math.pow(pos.left - otherPos.left, 2) + 
          Math.pow(pos.top - otherPos.top, 2)
        );
        
        return distance < horizontalGap * 0.4;
      });
      
      if (!hasOverlap) break;
      
      // Yeni pozisyon denerken sınırları kontrol et
      const newX = Math.min(
        Math.max(minAllowedX, pos.left + (Math.random() - 0.5) * maxOffset),
        maxAllowedX
      );
      
      pos.left = newX;
      pos.top = pos.top + (Math.random() - 0.5) * maxOffset;
      
      attempts++;
    }
  });
  
  return positions;
}

// StarBox bileşenini React.memo ile sarmalayalım
const StarBox = React.memo(({ data, position, starSize }) => {
  const percentageOfSupply = useMemo(() => 
    (data.balance / MAX_ETH_SUPPLY) * 100,
    [data.balance]
  );
  
  const path = useMemo(() => generateStarPath(starSize), [starSize]);
  const color = useMemo(() => getRandomColor(), []);
  const borderColor = useMemo(() => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const brighterR = Math.min(255, r + (255 - r) * 0.5);
    const brighterG = Math.min(255, g + (255 - g) * 0.5);
    const brighterB = Math.min(255, b + (255 - b) * 0.5);
    
    return `#${Math.round(brighterR).toString(16).padStart(2, '0')}${
      Math.round(brighterG).toString(16).padStart(2, '0')}${
      Math.round(brighterB).toString(16).padStart(2, '0')}`;
  }, [color]);

  const rotation = useMemo(() => Math.random() * 360, []);
  const rotationDuration = useMemo(() => 30 + Math.random() * 30, []); // 30-60s arası
  const rotationDirection = useMemo(() => Math.random() > 0.5 ? 1 : -1, []); // Rastgele yön

  const animationStyle = useMemo(() => {
    const duration = 15 + Math.random() * 20;
    const xMove = (Math.random() - 0.5) * 10;
    const yMove = (Math.random() - 0.5) * 10;
    const delay = Math.random() * -30;

    return {
      animation: `floatAnimation ${duration}s infinite ease-in-out ${delay}s`,
      '--x-move': `${xMove}px`,
      '--y-move': `${yMove}px`,
      '--rotation-duration': `${rotationDuration}s`,
      '--rotation-direction': rotationDirection,
      '--initial-rotation': `${rotation}deg`
    };
  }, [rotationDuration, rotationDirection, rotation]);

  return (
    <div 
      className="star-item" 
      style={{ 
        left: position.left, 
        top: position.top,
        width: starSize * 2,
        height: starSize * 2,
        transform: `translate3d(0, 0, 0)`,
        ...animationStyle
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 200"
        className="rotating-star"
      >
        <defs>
          <filter id={`glow-${data.wallet}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d={path}
          fill={color}
          stroke={borderColor}
          strokeWidth="2"
          filter={`url(#glow-${data.wallet})`}
        >
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <div className="star-info">
        <span className="wallet">{formatWalletAddress(data.wallet)}</span>
        <span className="balance">{formatBalance(data.balance)} ALLSTARS</span>
        <span className="percentage">(%{formatPercentage(percentageOfSupply)})</span>
      </div>
    </div>
  );
});

// Kayan yıldız bileşeni
const ShootingStar = React.memo(({ containerWidth, containerHeight }) => {
  const [position, setPosition] = useState({ top: 0, left: -100 });
  
  useEffect(() => {
    const createNewShootingStar = () => {
      // Rastgele başlangıç pozisyonu (container'ın üst kısmından)
      const startTop = Math.random() * (containerHeight / 3);
      setPosition({
        top: startTop,
        left: -100 // Container'ın solundan başla
      });
    };

    // Her 3 saniyede bir yeni kayan yıldız
    const interval = setInterval(() => {
      createNewShootingStar();
    }, 3000);

    return () => clearInterval(interval);
  }, [containerHeight]);

  return (
    <div
      className="shooting-star"
      style={{
        top: position.top,
        left: position.left
      }}
    />
  );
});

function App() {
  const [veriler, setVeriler] = useState([]);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight - 100);
  const [totalSupply, setTotalSupply] = useState(0);
  
  const containerSize = useMemo(() => ({
    width: window.innerWidth - 40,
    height: containerHeight
  }), [containerHeight]);

  const gridPositions = useMemo(() => 
    calculateGridPositions(containerSize.width, veriler.length),
    [containerSize.width, veriler.length]
  );

  useEffect(() => {
    const total = starsData.stars.reduce((sum, item) => sum + item.balance, 0);
    setTotalSupply(total);

    const sortedVeriler = [...starsData.stars].sort((a, b) => {
      const percentageA = (a.balance / MAX_ETH_SUPPLY) * 100;
      const percentageB = (b.balance / MAX_ETH_SUPPLY) * 100;
      return percentageB - percentageA;
    });
    
    setVeriler(sortedVeriler);

    // Container yüksekliğini hesapla
    const rowCount = Math.ceil(sortedVeriler.length / 25);
    const gridSize = containerSize.width / 25;
    const newHeight = rowCount * gridSize + 100;
    setContainerHeight(newHeight);
  }, [containerSize.width]);

  return (
    <div className="App">
      <h1>$ALLSTARS</h1>
      <div className="supply-info">
        <p>All the stars are here, where are you?</p>

      </div>
      <div 
        className="stars-field" 
        style={{ 
          width: containerSize.width, 
          height: containerHeight,
          position: 'relative',
          overflow: 'hidden' // Kayan yıldızın container dışına çıkmasını engelle
        }}
      >
        <ShootingStar 
          containerWidth={containerSize.width}
          containerHeight={containerHeight}
        />
        {veriler.map((veri, index) => (
          <StarBox 
            key={veri.wallet}
            data={veri} 
            position={gridPositions[index]}
            starSize={calculateStarSize(veri.balance)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;