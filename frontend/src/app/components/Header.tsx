
import React from 'react';
//"use client";
import Image from "next/image";

export default function Header() {
  return (
    <header style={{
      backgroundColor: '#4A7BA7',
      padding: '20px 40px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Image
          src="/heatlogo.png"
          alt="Desert HeatLens logo"
          fill
          style={{ objectFit: 'cover' }}
          sizes="60px"
        />
      </div>
      <div>
        <h1 style={{
          margin: 0,
          color: '#fff',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Desert HeatLens
        </h1>
      </div>
    </header>
  );
}
