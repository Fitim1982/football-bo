export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ 
        margin: 0, padding: 0, backgroundColor: '#0A0A0C', color: '#EDEDED', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
      }}>
        
        <nav style={{ 
          position: 'sticky', top: 0, zIndex: 100,
          backgroundColor: 'rgba(10, 10, 12, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 40px', display: 'flex', gap: '40px', alignItems: 'center'
        }}>
          <div style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px', color: '#fff', marginRight: '20px' }}>
            <span style={{ color: '#32D74B' }}>///</span> QUANT-BO
          </div>
          <a href="/" style={{ color: '#A1A1A6', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>Übersicht</a>
          <a href="/predictions" style={{ color: '#A1A1A6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Algorithmus & Sync</a>
          <a href="/settings" style={{ color: '#A1A1A6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>System</a>
        </nav>
        
        <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </main>

      </body>
    </html>
  )
}