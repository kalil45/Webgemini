import React from 'react';

function Sidebar({ isCollapsed, toggleSidebar, isSidebarOpen, toggleMobileSidebar, theme, toggleTheme, activeMenu, handleMenuClick }) {
  return (
    <>
      <div className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`} onClick={toggleMobileSidebar}></div>
      <div className={`d-flex flex-column flex-shrink-0 p-3 ${theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'} ${isCollapsed ? 'collapsed-sidebar' : ''} ${isSidebarOpen ? 'open' : ''}`}>
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
          <span className="fs-4">{isCollapsed ? 'AP' : 'App Kasir Arch'}</span>
        </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a href="#dashboard" className={`nav-link ${activeMenu === 'Dashboard' ? 'active' : ''}`} aria-current="page" onClick={() => handleMenuClick('Dashboard')}>
            🏠 {isCollapsed ? '' : 'Dashboard'}
          </a>
        </li>
        <li className="nav-item">
          <a href="#laporan" className={`nav-link ${activeMenu === 'Laporan' ? 'active' : ''}`} aria-current="page" onClick={() => handleMenuClick('Laporan')}>
            📊 {isCollapsed ? '' : 'Laporan'}
          </a>
        </li>
        <li>
          <a href="#produk" className={`nav-link ${activeMenu === 'Produk' ? 'active' : ''}`} onClick={() => handleMenuClick('Produk')}>
            📦 {isCollapsed ? '' : 'Produk'}
          </a>
        </li>
        <li>
          <a href="#tambah-transaksi" className={`nav-link ${activeMenu === 'Tambah Transaksi' ? 'active' : ''}`} onClick={() => handleMenuClick('Tambah Transaksi')}>
            🛒 {isCollapsed ? '' : 'Tambah Transaksi'}
          </a>
        </li>
        <li>
          <a href="#pengeluaran" className={`nav-link ${activeMenu === 'Pengeluaran' ? 'active' : ''}`} onClick={() => handleMenuClick('Pengeluaran')}>
            💸 {isCollapsed ? '' : 'Pengeluaran'}
          </a>
        </li>
        <li>
          <a href="#modal" className={`nav-link ${activeMenu === 'Modal' ? 'active' : ''}`} onClick={() => handleMenuClick('Modal')}>
            ➕ {isCollapsed ? '' : 'Modal'}
          </a>
        </li>
      </ul>
      <hr />
      <div className="form-check form-switch d-flex justify-content-between align-items-center">
        <input className="form-check-input" type="checkbox" id="darkModeToggleSidebar" onChange={toggleTheme} checked={theme === 'dark'} />
        <label className={`form-check-label ${theme === 'dark' ? 'text-white' : 'text-dark'}`} htmlFor="darkModeToggleSidebar">{isCollapsed ? '' : (theme === 'light' ? 'Dark Mode' : 'Light Mode')}</label>
      </div>
      <button className="btn btn-secondary mt-3" onClick={toggleSidebar}>
        {isCollapsed ? '>' : '<'}
      </button>
    </div>
    </>
  );
}

export default Sidebar;
