import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
    const { user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<'auth' | 'otp'>(
        (user && !user.emailVerified) ? 'otp' : 'auth'
    );
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Step 1: Request OTP from backend BEFORE creating account
                await authService.sendOtp(email);
                
                // Step 2: Switch to OTP step
                setStep('otp');
                setMessage('A verification code has been sent to your email.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            // Step 1: Verify OTP with backend
            await authService.verifyOtp(email, otp);
            
            // Step 2: Create account in Firebase ONLY after successful OTP verification
            if (!isLogin) {
                await createUserWithEmailAndPassword(auth, email, password);
                setMessage('Account created and email verified!');
            } else {
                setMessage('Email verified!');
            }
            
            // Step 3: Redirect or reload
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Verify Email</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                        Please enter the 6-digit code sent to <b>{email}</b>
                    </p>

                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label>OTP Code</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={e => setOtp(e.target.value)} 
                                maxLength={6} 
                                placeholder="123456"
                                required 
                            />
                        </div>

                        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
                        {message && <p style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>{message}</p>}

                        <button type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Verifying...' : (isLogin ? 'Verify' : 'Verify & Register')}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p>
                            Didn't receive a code?{' '}
                            <span 
                                onClick={() => authService.sendOtp(email)} 
                                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Resend
                            </span>
                        </p>
                        <p style={{ marginTop: '10px' }}>
                            <span 
                                onClick={() => { auth.signOut(); setStep('auth'); }} 
                                style={{ color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                            >
                                Back to Login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {isLogin ? 'Login' : 'Sign Up'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
                    {message && <p style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>{message}</p>}

                    <button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Send Code')}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span 
                            onClick={() => setIsLogin(!isLogin)} 
                            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
