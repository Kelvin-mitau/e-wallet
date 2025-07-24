import { useEffect, useState } from "react";

const BASE_URL = 'http://localhost:8085';

interface props {
    firstName?: string,
    lastName?: string,
    setNotsCount?: (count: Number) => void
}

const Navbar: React.FC<props> = ({ firstName, lastName }) => {
    const [notificationsCount, setUnreadNotificationCount] = useState(0)
    useEffect(() => {
        fetch(`${BASE_URL}/unread_notifications_count/${sessionStorage.getItem("userID")}`, {
            headers: {
                'Authorization': sessionStorage.getItem("authToken") || ""
            },
        })
            .then(res => res.json())
            .then(data => {
                //console.log("Nots count: ", data.count)
                setUnreadNotificationCount(data.count)
            })
            .catch()
    }, []);


    return (
        <div className="bg-gradient-to-br from-[#6f66c7] to-[#d38de7] text-white p-5 flex justify-between items-center relative z-10  rounded-b-[20px] md:rounded-b-none">
            <a href="/dashboard" className='text-white'>
                {!firstName && !lastName ?
                    <span className="font-semibold text-lg">Dashboard</span>
                    :
                    <div className="flex items-center gap-2">
                        <span className="text-xl">👋</span>
                        <span className="font-semibold text-lg">Hi, {firstName + " " + lastName}!</span>
                    </div>
                }
            </a>
            <div className="flex items-center gap-4">
                {/* Notification Icon */}
                <a href="/notifications">
                    <div className="relative">
                        {notificationsCount > 0 && <div className="absolute text-red-500 text-sm font-semibold -top-2.5 -right-1 bg-red-50 aspect-square h-4 rounded-full flex items-center justify-center">
                            <span>{notificationsCount}</span>

                        </div>}
                        <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z" />
                        </svg>
                    </div>
                </a>
                {/* Account icon */}
                <a href="/profile">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill='currentColor'><path d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z" /></svg>
                </a>
            </div>
            {/* Subtle shadow for header */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4/5 h-5 bg-black/10 rounded-full blur-md -z-10"></div>
        </div>
    )
}

export default Navbar