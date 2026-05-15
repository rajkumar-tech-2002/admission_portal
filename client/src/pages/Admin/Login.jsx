import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react';
import apiService from '../../services/api.service';
import styles from '../../components/css/Login.module.css';
import logo from '../../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiService.post('/auth/login', { username, password });
            if (response.data.success) {
                sessionStorage.setItem('token', response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundBlob}></div>
            <div className={styles.backgroundBlob2}></div>
            
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Administrator Access</h2>
                    <p className={styles.subtitle}>Please enter your credentials to manage the portal</p>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Username</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.fieldIcon} size={18} />
                            <input 
                                type="text" 
                                className={styles.input} 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                placeholder="Username"
                            />
                        </div>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.fieldIcon} size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className={styles.input} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                placeholder="Password"
                            />
                            <button 
                                type="button" 
                                className={styles.toggleBtn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <div className={styles.loader}></div>
                        ) : (
                            <>Login to Dashboard</>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>© 2026 Nandha Educational Institutions. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
