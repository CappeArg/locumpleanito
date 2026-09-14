import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

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

  const isHome = title === 'LoCumpleanito' && !showBack;

  return (
    <header className="notion-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        {showBack && (
          <button
            onClick={handleBack}
            className="notion-btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px' }}
            aria-label="Volver"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        <div className="notion-breadcrumbs" style={{ minWidth: 0 }}>
          {!isHome ? (
            <>
              <span
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
                title="Ir al inicio"
              >
                <span>🎈</span>
                <span style={{ fontWeight: 500 }}>LoCumpleanito</span>
              </span>
              <ChevronRight size={14} style={{ color: 'var(--notion-text-subtle)', flexShrink: 0 }} />
              <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--notion-text)' }}>
                  {title}
                </span>
                {subtitle && (
                  <span style={{ marginLeft: '0.35rem', fontSize: '0.78rem', color: 'var(--notion-text-muted)' }}>
                    ({subtitle})
                  </span>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🎈</span>
              <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--notion-text)' }}>
                LoCumpleanito
              </span>
            </div>
          )}
        </div>
      </div>

      {rightAction && <div>{rightAction}</div>}
    </header>
  );
};
