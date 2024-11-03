import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import { faBell, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Notification from './Notification';

import socketIOClient from 'socket.io-client';
import { faUserCircle } from '@fortawesome/free-regular-svg-icons';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const screen = window.location.pathname;

    const [notifications, setNotifications] = useState([]);
    const [audio] = useState(new Audio('/notifi_sound.mp3')); // Load the audio file

    // useEffect(() => {
    //     const socket = socketIOClient(process.env.REACT_APP_ENDPOINT);

    //     // Listen for notifications from the server
    //     socket.on('receiveNotification', (data) => {
    //         setNotifications((prevNotifications) => [...prevNotifications, data]);
    //         audio.play();
    //     });

    //     // Cleanup on component unmount
    //     return () => {
    //         socket.disconnect();
    //     };
    // }, [audio]);

    useEffect(() => {
        // Check if user is logged in using cookies
        const savedUser = Cookies.get('user');
        if (savedUser) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setIsLoggedIn(false);
        setShowDropdown(false); // Hide dropdown on logout
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const onProfileClick = () => {
        window.location.href = '/user/profile';
    }

    const onOrdersClick = () => {
        window.location.href = '/user/orders';
    }

    return (
        screen === '/login' || screen === '/register' ? null : (
            <nav className="sticky top-0 start-0 z-50 bg-indigo-600 p-3 ">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-white font-bold text-xl">
                        <NavLink to="/">Ecom</NavLink>
                    </div>
                    <div className="flex items-center">
                        <div className="pr-12">
                            <input type="text" className="p-2 rounded-lg focus:outline-none w-96" placeholder="Search products..." />
                            <button className="bg-white btn-outline text-indigo-600 px-4 py-2 rounded-lg ml-2">Search</button>
                        </div>
                        <div>
                            {isLoggedIn ? (
                                <div className="relative">
                                    <Popup
                                        trigger={
                                            <button>
                                                <FontAwesomeIcon icon={faBell} className="text-2xl text-white mx-2" />
                                            </button>}
                                        position="bottom center"
                                        contentStyle={{ width: '500px', backgroundColor: '#f4f4f4' }}
                                    >
                                        <Notification notifications={notifications} />
                                    </Popup>
                                    <NavLink to="/cart">
                                        <FontAwesomeIcon icon={faCartShopping} className="text-2xl text-white mx-2" />
                                    </NavLink>
                                    <button onClick={toggleDropdown} className="focus:outline-none">
                                        <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-white mx-2" />
                                    </button>
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                                            <ul>
                                                <li onClick={onProfileClick} className="hover:bg-indigo-600 hover:text-white px-4 py-2 cursor-pointer" role="menuitem">Profile</li>
                                                <li onClick={onOrdersClick} className="hover:bg-indigo-600 hover:text-white px-4 py-2 cursor-pointer" role="menuitem">Orders</li>
                                                <li onClick={handleLogout} className="hover:bg-indigo-600 hover:text-white px-4 py-2 cursor-pointer">Logout</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a href="/login" className="text-white hover:underline">Login</a>
                            )}
                        </div>
                    </div>
                </div>
            </nav >
        )
    );
};

export default Navbar;
