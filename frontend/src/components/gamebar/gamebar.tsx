"use client"

import React from 'react';

interface BarProps {
  position: { x: number; y: number };
  left?: boolean;
}

const Bar: React.FC<BarProps> = ({ position, left }) => {
  const barStyle: React.CSSProperties = {
    width: '10px',
    height: '200px',
    backgroundColor: 'white',
    border: '2px solid #6e7379',
    borderRadius: '10px',
    position: 'absolute',
    top: `${position.y+100}px`, // Center the top of the bar
    left: left ? '0' : 'unset',
    right: left ? 'unset' : '0',
    transform: 'translateY(-50%)',
  };

  return <div style={barStyle} />;
};

export default Bar;