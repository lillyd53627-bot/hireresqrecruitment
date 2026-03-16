export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ background: "black", color: "white", width: isCollapsed ? "80px" : "256px", height: "100vh" }}>
      Sidebar is working
    </div>
  );
}