export default function StatusBadge({ status }) {
  const colors = {
    MENUNGGU: { bg: '#fff3cd', color: '#856404' },
    ENTRY: { bg: '#cce5ff', color: '#004085' },
    TRANSPORT: { bg: '#e2f0cb', color: '#155724' },
    PACKAGING: { bg: '#ffe5d9', color: '#7a3500' },
    PENYERAHAN: { bg: '#d1ecf1', color: '#0c5460' },
    SELESAI: { bg: '#d4edda', color: '#155724' },
    CANCELLED: { bg: '#f8d7da', color: '#721c24' },
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
      border: '1px solid rgba(0,0,0,0.04)'
    }}>{status}</span>
  );
}
