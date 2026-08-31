import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { BuntingBanner } from './BuntingBanner';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'LoCumpleanito',
  subtitle,
  showBack = false,
  backTo,
  rightAction
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 90 }}>
      <div className="header-zamba">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {showBack && (
            <button
              onClick={handleBack}
              className="btn-zamba btn-blanco btn-sm"
              style={{ padding: '0.4rem', borderRadius: '50%', width: '36px', height: '36px' }}
              aria-label="Volver"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div>
            <h1
              onClick={() => navigate('/')}
              style={{
                fontSize: '1.45rem',
                color: '#fff',
                textShadow: '2px 2px 0px var(--z-borde)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                margin: 0
              }}
            >
              <span>{title}</span>
              <span style={{ fontSize: '1.2rem' }}>🎈</span>
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--z-sol)',
                  fontWeight: 800,
                  textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Sparkles size={12} />
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction && <div>{rightAction}</div>}
      </div>
      <BuntingBanner />
    </header>
  );
};
