// components/common/Layout.jsx
import React from 'react';
import Sidebar from '../Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children, title }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;