import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import Sidebar from "./SideBar";
import UpdateProfile from "./UpdateProfile";
import Address from "./Address";


const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [screen, setScreen] = useState('profile');

    useEffect(() => {
        const userSaved = Cookies.get('user');
        if (userSaved) {
            setUser(JSON.parse(userSaved));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto w-5/6 flex flex-row justify-center items-center mt-4">
            <div className="w-2/12 h-144 bg-white p-4 shadow-lg flex flex-col">
                <Sidebar user={user} setScreen={setScreen} />
            </div>
            <div className="w-5/12 h-144 bg-white p-4 shadow-lg ">
                {screen === 'profile' && (
                    <UpdateProfile user={user} setUser={setUser} />
                )}

                {screen === 'address' && (
                    <Address user={user} />
                )}

                {screen === 'change_password' && (
                    <div>
                        <h1 className="text-2xl font-semibold">Change Password</h1>
                        <p>Change Password</p>
                    </div>
                )}

                {screen === 'notifications' && (
                    <div>
                        <h1 className="text-2xl font-semibold">Notifications</h1>
                        <p>Notifications</p>
                    </div>
                )}

                {screen === 'delete_account' && (
                    <div>
                        <h1 className="text-2xl font-semibold">Delete Account</h1>
                        <p>Delete Account</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ProfileScreen;
