import React from 'react';
import  './AIopponent.css';
import Link from 'next/link';


const AIopponent = () => (
  <div className='aiSection'>
    <img src="/pi2.png" alt="AI Opponent" className='image' />
    <div className='content'>
      <h3 className='title'>Face Our AI Opponent!</h3>
      <p className='description'>Challenge our AI opponent and test your ping pong skills</p>
      <Link href='/ai' className='playButton'>Play</Link>
    </div>
  </div>
);

export default AIopponent;
