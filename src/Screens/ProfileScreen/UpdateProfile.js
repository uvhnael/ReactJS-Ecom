import React, { useState, useEffect } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';

async function updateCustomer(customerData) {
    try {
        const response = await Axios.put(`${process.env.REACT_APP_API_URL}/customer`, customerData, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow error to handle it in the calling function
    }
}

const UpdateProfile = ({ user, setUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhoneNumber(user.phone_number || '');
            setIsLoading(false);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const customerData = {
            id: user.id,
            name: name,
            email: email,
            phone_number: phoneNumber
        };

        try {
            const response = await updateCustomer(customerData);
            console.log("Response:", response);
            setUser(response);
            Cookies.set('user_data', JSON.stringify(response));
            setSuccess('Profile updated successfully');
        } catch (error) {
            setError('An error occurred. Please try again later.');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <p>Update your profile information</p>
            <hr className="my-4" />
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <div className="flex flex-row items-center">
                    <p className="p-2 font-medium w-40">Name</p>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg mb-2 w-72"
                    />
                </div>
                <div className="flex flex-row items-center">
                    <p className="p-2 font-medium w-40">Email</p>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg mb-2 w-72"
                    />
                </div>
                <div className="flex flex-row items-center">
                    <p className=" p-2 font-medium w-40">Phone Number</p>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg mb-2 w-72"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-lg w-72 mt-4"
                >
                    Update
                </button>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
            </form>
        </div>
    );
};

export default UpdateProfile;
