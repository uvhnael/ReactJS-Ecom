import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import Axios from "axios";

async function fetchAddresses(userId) {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_JAVA_API}/addresses/customer/${userId}`, {
            headers: {
                Authorization: `Bearer ${Cookies.get('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

const Address = ({ user }) => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        fetchAddresses(user.id)
            .then((data) => {
                setAddresses(data);
                setIsLoading(false);
            })
            .catch((error) => {
                setIsLoading(false);
            });

    }, [user.id]);

    const onDelete = (id) => {
        // Implement delete logic
        setAddresses(addresses.filter(address => address.id !== id));
    };

    const onUpdate = (id) => {
        // Implement update logic
        console.log('Update address with id:', id);
    };

    const onSetDefault = (id) => {
        // Implement set default logic
        console.log('Set address as default with id:', id);
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Address</h1>
            {addresses.map((address) => (
                <div key={address.id} className="flex flex-row border border-gray-300 p-4 rounded-lg mb-4 shadow-md justify-between">
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center">
                            <p className="font-medium">{address.customerName}</p>
                            <p className="px-2">|</p>
                            <p className="text-gray-500">{address.phoneNumber}</p>
                        </div>

                        <div className="flex flex-row items-center">
                            <p className="text-gray-500">{address.addressLine1}, {address.addressLine2}</p>
                        </div>
                        <div className="flex flex-row items-center">
                            <p className="text-gray-500">{address.ward}, {address.district}, {address.city}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end justify-end">
                        <div className="flex flex-row items-end">
                            <button
                                onClick={() => onUpdate(address.id)}
                                className="text-indigo-600 w-16"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => onDelete(address.id)}
                                className="text-indigo-600 w-16"
                            >
                                Delete
                            </button>
                        </div>
                        {/* if is_deafult */}
                        {address.is_default === 0 && (
                            <button
                                onClick={() => onSetDefault(address.id)}
                                className="border border-gray-500 text-indigo-600 w-32 mt-2  "
                            >
                                Set Default
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};


export default Address;