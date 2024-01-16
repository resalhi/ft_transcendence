import React from 'react';

interface BallProps {
  x: number;
  y: number;
}

const Ball: React.FC<BallProps> = ({ x, y }) => {
  const ballStyle: React.CSSProperties = {
    width: '30px',
    height: '30px',
    backgroundColor: 'white',
    borderRadius: '50%',
    border: '2px solid #6e7379',
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
  };

  return <div style={ballStyle} />;
};

export default Ball