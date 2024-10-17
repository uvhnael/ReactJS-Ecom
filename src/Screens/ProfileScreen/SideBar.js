
const Sidebar = ({ user, setScreen }) => {
    return (
        <div>
            <div className="flex flex-row items-center">
                <img src="https://via.placeholder.com/60" alt="profile" className="rounded-full p-2" />
                <p className="p-2 font-medium">{user.name}</p>
            </div>
            <ul>
                <li className="cursor-pointe hover:bg-gray-100 block px-4 py-2" onClick={() => setScreen('profile')}>
                    <p>Profile</p>
                </li>
                <li className="cursor-pointe hover:bg-gray-100 block px-4 py-2" onClick={() => setScreen('address')}>
                    <p>Address</p>
                </li>
                <li className="cursor-pointe hover:bg-gray-100 block px-4 py-2" onClick={() => setScreen('change_password')}>
                    <p>Change Password</p>
                </li>
                <li className="cursor-pointe hover:bg-gray-100 block px-4 py-2" onClick={() => setScreen('notifications')}>
                    <p>Notifications</p>
                </li>
                <li className="cursor-pointe hover:bg-gray-100 block px-4 py-2" onClick={() => setScreen('delete_account')}>
                    <p>Delete Account</p>
                </li>


            </ul>
        </div >
    )
};

export default Sidebar;