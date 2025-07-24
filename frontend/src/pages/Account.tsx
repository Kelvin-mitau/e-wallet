import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

// Define the structure for user data
interface UserData {
    _id: string; // MongoDB user ID, serving as accountId
    firstName: string;
    lastName: string;
    email: string;
    balance: number;
}

// Base URL for API calls
const BASE_URL = 'http://localhost:8085';

const AccountPage: React.FC = () => {
    const navigate = useNavigate()

    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // States for editable form fields
    const [editFirstName, setEditFirstName] = useState<string>('');
    const [editLastName, setEditLastName] = useState<string>('');
    const [editEmail, setEditEmail] = useState<string>('');

    // States for update operation feedback
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    // Function to fetch user data
    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        const userId = sessionStorage.getItem('userID');

        if (!userId) {
            setError('User ID not found in session storage. Please log in.');
            setLoading(false);
            navigate("/")
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/user/${userId}`,
                {
                    headers: {
                        "Authorization": sessionStorage.getItem("authToken") || ""
                    }
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch user data: ${response.status}`);
            }
            const data: UserData = await response.json();
            setUserData(data);
            // Initialize edit form states with fetched data
            setEditFirstName(data.firstName);
            setEditLastName(data.lastName);
            setEditEmail(data.email);
        } catch (err: any) {
            setError(`Error fetching user data: ${err.message}`);
            console.error('Fetch user data error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setUpdateMessage(null);
        if (!isEditing && userData) {
            setEditFirstName(userData.firstName);
            setEditLastName(userData.lastName);
            setEditEmail(userData.email);
        }
    };

    // Handle saving updated user data
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateMessage(null);

        const userId = sessionStorage.getItem('userID');
        if (!userId) {
            setUpdateMessage('Error: User ID not found.');
            setUpdateLoading(false);
            return;
        }

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
            setUpdateMessage('Error: Please enter a valid email address.');
            setUpdateLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    firstName: editFirstName,
                    lastName: editLastName,
                    email: editEmail,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update user data: ${response.status}`);
            }

            setUpdateMessage('Profile updated successfully!');
            setIsEditing(false);
            fetchUserData();
        } catch (err: any) {
            setUpdateMessage(`Error updating profile: ${err.message}`);
            console.error('Update user data error:', err);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('accessToken');
        navigate("/")
    };


    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
                <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto bg-white rounded-lg shadow-xl flex flex-col min-h-[calc(100vh-2rem)]">

                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-[#6f66c7] to-[#d38de7] text-white p-5 flex justify-between items-center relative z-10 rounded-t-lg rounded-b-[20px] md:rounded-b-none">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">My Account</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-white text-[#6f66c7] rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            Logout
                        </button>
                        {/* Subtle shadow for header */}
                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4/5 h-5 bg-black/10 rounded-full blur-md -z-10"></div>
                    </div>

                    {/* Account Details Section */}
                    <div className="p-6 flex-grow overflow-y-auto">
                        {loading ? (
                            <div className="text-center text-gray-500 py-10">Loading account data...</div>
                        ) : error ? (
                            <div className="text-center text-gray-800 bg-gray-200 p-4 rounded-md my-4">{error}</div>
                        ) : userData ? (
                            <div className="space-y-6">
                                {/* Account Balance Card */}
                                <div className="bg-gradient-to-br from-[#3fccd6] to-[#94d5fa] text-white p-6 rounded-lg shadow-md">
                                    <p className="text-sm opacity-80">Current Balance</p>
                                    <h3 className="text-4xl font-bold mt-1">${userData.balance.toFixed(2)}</h3>
                                    <div className="flex justify-between items-center text-sm mt-4">
                                        <span>Account ID: {userData._id}</span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                                            </svg>
                                            Verified
                                        </span>
                                    </div>
                                </div>

                                {/* Profile Information */}
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xl font-semibold text-gray-800">Profile Information</h4>
                                        <button
                                            onClick={handleEditToggle}
                                            className="px-4 py-2 bg-[#6f66c7] text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            {isEditing ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                    </div>

                                    {updateMessage && (
                                        <div className={`p-3 rounded-md text-sm mb-4 ${updateMessage.includes('Error') ? 'bg-gray-200 text-gray-800' : 'bg-[#94d5fa] text-[#6f66c7]'}`}>
                                            {updateMessage}
                                        </div>
                                    )}

                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                                                    value={editFirstName}
                                                    onChange={(e) => setEditFirstName(e.target.value)}
                                                    required
                                                    disabled={updateLoading}
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900 text-lg font-medium">{userData.firstName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                                                    value={editLastName}
                                                    onChange={(e) => setEditLastName(e.target.value)}
                                                    required
                                                    disabled={updateLoading}
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900 text-lg font-medium">{userData.lastName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#3fccd6] focus:border-[#3fccd6]"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    required
                                                    disabled={updateLoading}
                                                />
                                            ) : (
                                                <p className="mt-1 text-gray-900 text-lg font-medium">{userData.email}</p>
                                            )}
                                        </div>

                                        {isEditing && (
                                            <button
                                                type="submit"
                                                className="w-full bg-[#3fccd6] text-white py-2 px-4 rounded-md hover:bg-[#6f66c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3fccd6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                disabled={updateLoading}
                                            >
                                                {updateLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">No user data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountPage;
