import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, LogOut, Menu, X, Archive, Settings, ChevronDown, ChevronRight,
    Building2, GraduationCap, Users2, FileCheck, UserPlus, Activity, Calendar, KeyRound, Mail
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from '../css/AdminLayout.module.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMasterOpen, setIsMasterOpen] = useState(false);

    // Auto-close master submenu when navigating away from master module pages
    useEffect(() => {
        const isMasterRoute = location.pathname.includes('/admin/master') || location.pathname.includes('/admin/change-password');
        if (!isMasterRoute) {
            setIsMasterOpen(false);
        } else {
            // Keep it open if we are on a master page
            setIsMasterOpen(true);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const navButton = (
        <button className={styles.menuToggleBtn} onClick={toggleSidebar}>
            <Menu size={24} />
        </button>
    );

    return (
        <div className={styles.appContainer}>
            <Navbar leftContent={navButton}>
                <div className={styles.headerActions}>
                    <div className={styles.profileMenu}>
                        <div className={styles.avatar}>
                            <span className={styles.avatarText}>A</span>
                        </div>
                        <span className={styles.profileName}>Admin User</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className={styles.logoutText}>Logout</span>
                    </button>
                </div>
            </Navbar>

            <div className={styles.layout}>
                {/* Mobile Overlay */}
                {isSidebarOpen && <div className={styles.overlay} onClick={closeSidebar}></div>}

                {/* Sidebar */}
                <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                    <nav className={styles.navLinks}>
                        <NavLink 
                            to="/admin/dashboard" 
                            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </NavLink>

                        <NavLink 
                            to="/admin/archived" 
                            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <Archive size={20} />
                            Archived List
                        </NavLink>

                        <div className={styles.navGroup}>
                            <div 
                                className={`${styles.navItem} ${isMasterOpen ? styles.groupActive : ''}`} 
                                onClick={() => setIsMasterOpen(!isMasterOpen)}
                            >
                                <Settings size={20} />
                                <span style={{ flex: 1 }}>Master Module</span>
                                {isMasterOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                            
                            {isMasterOpen && (
                                <div className={styles.subMenu}>
                                    <NavLink to="/admin/master/departments" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <Building2 size={16} /> Department Master
                                    </NavLink>
                                    <NavLink to="/admin/master/studies" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <GraduationCap size={16} /> Study Master
                                    </NavLink>
                                    <NavLink to="/admin/master/communities" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <Users2 size={16} /> Community Master
                                    </NavLink>
                                    <NavLink to="/admin/master/admission-types" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <FileCheck size={16} /> Admission Type
                                    </NavLink>
                                    <NavLink to="/admin/master/reference-types" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <UserPlus size={16} /> Reference Type
                                    </NavLink>
                                    <NavLink to="/admin/master/admission-statuses" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <Activity size={16} /> Status Master
                                    </NavLink>
                                    <NavLink to="/admin/master/valid-date" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <Calendar size={16} /> Valid Date Master
                                    </NavLink>
                                    <NavLink to="/admin/master/email-logs" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <Mail size={16} /> Email Logs
                                    </NavLink>
                                    <NavLink to="/admin/change-password" className={({ isActive }) => isActive ? `${styles.subNavItem} ${styles.activeSub}` : styles.subNavItem} onClick={closeSidebar}>
                                        <KeyRound size={16} /> Change Password
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
