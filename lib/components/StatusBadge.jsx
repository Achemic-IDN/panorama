/**
 * StatusBadge - Displays queue status with color coding
 * 
 * Badge Colors:
 * - MENUNGGU = gray
 * - ENTRY = blue
 * - TRANSPORT = purple
 * - PACKAGING = orange
 * - PENYERAHAN = teal
 * - SELESAI = green
 */
export default function StatusBadge({ status }) {
  const colors = {
    MENUNGGU: { bg: '#e9ecef', color: '#495057' },      // gray
    ENTRY: { bg: '#cce5ff', color: '#004085' },         // blue
    TRANSPORT: { bg: '#e2d9f3', color: '#6f42c1' },     // purple
    PACKAGING: { bg: '#ffe5d9', color: '#d35400' },     // orange
    PENYERAHAN: { bg: '#d1ecf1', color: '#0c5460' },     // teal
    SELESAI: { bg: '#d4edda', color: '#155724' },       // green
    CANCELLED: { bg: '#f8d7da', color: '#721c24' },     // red
  };
  
  const style = colors[status] || { bg: '#f1f3f5', color: '#333' };

  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: '999px',
      background: style.bg,
      color: style.color,
      fontWeight: 600,
      fontSize: '13px',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      {status}
    </span>
  );
}
