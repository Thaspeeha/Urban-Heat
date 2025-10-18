'use client';

import dynamic from 'next/dynamic';
import { useState, FormEvent } from 'react';
import axios from 'axios';
import Image from 'next/image';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface RouteData {
  start_coords: [number, number];
  end_coords: [number, number];
  route_fast: [number, number][];
  route_cool: [number, number][];
  fast_length: number;
  cool_length: number;
  error?: string;
}

export default function Page() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [transport, setTransport] = useState<'walk' | 'bike'>('walk');
  const [routes, setRoutes] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setRoutes(null);
    setError(null);

    try {
      const res = await axios.post<RouteData>('http://127.0.0.1:8000/find_route', {
        start_place: start,
        end_place: end,
        transport_mode: transport
      }, {
        timeout: 120000
      });
      
      if (res.data.error) {
        setError(res.data.error);
      } else if (!res.data.route_fast || !res.data.route_cool || 
                 res.data.route_fast.length === 0 || res.data.route_cool.length === 0) {
        setError('Routes not found. Try different locations.');
      } else {
        setRoutes(res.data);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || 'Error fetching route');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const timeSaved = routes 
    ? ((routes.cool_length - routes.fast_length) / 1000).toFixed(2)
    : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5E6D3' }}>
      {/* Header */}
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
           src="/logo.png"
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

      {/* Hero Section */}
      <div style={{
        backgroundColor: '#F9D56E',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#2D5F8D',
          margin: '0 0 10px 0'
        }}>
          Finding Cooler Paths Through Dubai
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#5A6C7D',
          maxWidth: '700px',
          margin: '0 auto',
          fontStyle: 'italic'
        }}>
          Discover shade-rich walking and cycling routes that keep you cooler in Dubai&apos;s heat
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Control Panel */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          marginBottom: '30px'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#2D5F8D',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Route Controls
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#5A6C7D',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Start Location
                </label>
                <input
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="e.g., Burj Khalifa"
                  required
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    color: '#000',
                    backgroundColor: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#5A6C7D',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Destination
                </label>
                <input
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="e.g., Dubai Mall"
                  required
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    color: '#000',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: '0 0 200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#5A6C7D',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Transport Mode
                </label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value as 'walk' | 'bike')}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    backgroundColor: '#fff',
                    color: '#000'
                  }}
                >
                  <option value="walk">🚶 Walking</option>
                  <option value="bike">🚴 Cycling</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: loading ? '#ccc' : '#4A7BA7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 2px 8px rgba(74, 123, 167, 0.3)'
                }}
              >
                {loading ? '🔍 Finding Routes...' : '🗺️ Find Cool Routes'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#FFE5E5', 
            border: '2px solid #FF6B6B',
            borderRadius: '8px',
            color: '#D32F2F',
            marginBottom: '30px'
          }}>
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {routes && !error && routes.route_fast && routes.route_cool && (
          <>
            <MapView routes={routes} />
            
            <div style={{ 
              marginTop: '30px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0',
                color: '#2D5F8D',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                📊 Route Comparison
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px'
              }}>
                <div style={{ 
                  padding: '25px', 
                  backgroundColor: '#FFF5F5',
                  border: '3px solid #FF6B6B',
                  borderRadius: '12px'
                }}>
                  <div style={{ 
                    fontSize: '16px',
                    color: '#FF6B6B',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    🔴 Fastest Route
                  </div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '700',
                    color: '#D32F2F',
                    marginBottom: '5px'
                  }}>
                    {(routes.fast_length / 1000).toFixed(2)} km
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    Shortest distance
                  </div>
                </div>
                
                <div style={{ 
                  padding: '25px', 
                  backgroundColor: '#F0F8FF',
                  border: '3px solid #4A7BA7',
                  borderRadius: '12px'
                }}>
                  <div style={{ 
                    fontSize: '16px',
                    color: '#4A7BA7',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    🔵 Cooler Route
                  </div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '700',
                    color: '#2D5F8D',
                    marginBottom: '5px'
                  }}>
                    {(routes.cool_length / 1000).toFixed(2)} km
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    {timeSaved && parseFloat(timeSaved) > 0 
                      ? `+${timeSaved} km for more shade` 
                      : `${timeSaved} km difference`}
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: '25px', 
                padding: '20px',
                backgroundColor: '#FFF9E6',
                borderLeft: '4px solid #F9D56E',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#5A6C7D',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#2D5F8D' }}>💡 How it works:</strong> The cooler route prioritizes residential streets and side paths with more shade from buildings.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}