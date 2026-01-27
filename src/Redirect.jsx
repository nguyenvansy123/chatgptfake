import { useEffect } from 'react';

function Redirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2>🔄 Đang chuyển hướng...</h2>
        <div style={{
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
        <p>Nếu không tự động chuyển, <a href={to} style={{ color: 'white' }}>nhấn vào đây</a></p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Redirect;
