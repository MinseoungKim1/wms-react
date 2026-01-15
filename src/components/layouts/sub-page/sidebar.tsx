import { Link } from 'react-router-dom';

const menuStyle = {
  display: 'block',
  padding: '12px 20px',
  borderBottom: '1px solid #eee',
  hover: { backgroundColor: '#f5f5f5' }
};

export default function Sidebar() {
  return (
    <nav>
      <Link to="/" style={menuStyle}>📊 대시보드</Link>
      <Link to="/inbound" style={menuStyle}>🚛 입고 관리</Link>
      <Link to="/outbound" style={menuStyle}>📦 출고 관리</Link>
      <Link to="/inventory" style={menuStyle}>🏭 재고 관리</Link>
      <Link to="/master" style={menuStyle}>⚙️ 기준 정보</Link>
    </nav>
  );
}