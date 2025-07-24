import React, { useState } from 'react';
import GoogleButton from '../components/GoogleButton';
import type { CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setMessage('Please enter both email and password.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8085/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage('Login successful! Welcome back.');
                navigate("/")
            } else {
                const errorData = await response.json();
                setMessage(`Login failed: ${errorData.message || 'Invalid credentials'}`);
                console.error('Login Error:', errorData);
            }
        } catch (error) {
            setMessage('An error occurred. Please try again later.');
            console.error('Network Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSubmit = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            console.error('No credential received from Google');
            return;
        }
        try {
            const req = await fetch('http://localhost:8085/auth/signin/google', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: credentialResponse.credential
                })
            });
            const res = await req.json();
            if (!req.ok) {
                setMessage(res.message)
                return;
            }
            setMessage('Login successful! Welcome back.');
            localStorage.setItem("token", res.token);
            navigate("/")
        } catch (error) {
            setMessage('An error occurred. Please try again later.');
            console.error('Network Error:', error);
        } finally {
            setLoading(false);
        }

    };

    const handleGoogleSubmitError = () => {
        console.error('Google Login Failed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 w-screen">
            <div
                className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
                style={{
                    borderTop: '8px solid #d38de7',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
            >
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>

                {message && (
                    <div className={`px-4 py-3 rounded relative mb-4 ${message.includes('successful') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
                        }`} role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3fccd6] focus:border-[#3fccd6] sm:text-sm transition duration-150 ease-in-out"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3fccd6] focus:border-[#3fccd6] sm:text-sm transition duration-150 ease-in-out"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>


                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition duration-150 ease-in-out font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>
                <GoogleButton handleGoogleSubmit={handleGoogleSubmit} handleGoogleSubmitError={handleGoogleSubmitError} />

                <div className='mt-7'>
                    <p>Don't have an account? <a href="/auth/signup" className='text-[#6f66c7] hover:underline hover:decoration-[#6f66c7] hover:decoration-1'>Sign Up</a></p>
                </div>
            </div>
        </div>
    )
}
export default Login