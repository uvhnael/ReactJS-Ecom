import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { NavLink } from 'react-router-dom';
import AttributesDropdown from './AttributesDropdown';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

async function getCartItems(customerId) {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_JAVA_API}/carts/customer/` + customerId, {
            headers: {
                Authorization: `Bearer ${Cookies.get('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function updateCartItem(cartItem) {
    try {
        const response = await Axios.put(`${process.env.REACT_APP_JAVA_API}/carts`, cartItem, {
            headers: {
                Authorization: `Bearer ${Cookies.get('token')}`

            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function deleteCartItem(id) {
    try {
        const response = await Axios.delete(`${process.env.REACT_APP_JAVA_API}/carts/` + id, {
            headers: {
                Authorization: `Bearer ${Cookies.get('token')}`

            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const CartScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [checkedItems, setCheckedItems] = useState([]);

    useEffect(() => {
        // Check if user is logged in using cookies
        const savedUser = Cookies.get('user');
        if (savedUser) {
            setIsLoggedIn(true);
            setCustomerId(JSON.parse(savedUser).id);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn && customerId) {
            getCartItems(customerId).then((data) => {
                setCartItems(data);
                setIsLoading(false);
            });
        }
    }, [isLoggedIn, customerId]);

    const handleCheckAllButton = () => {
        if (checkedItems.length === cartItems.length) {
            setCheckedItems([]);
        } else {
            setCheckedItems(cartItems.map((item) => item.id));
        }
    }

    const handleCheckButton = (id) => {
        setCheckedItems((prevCheckedItems) =>
            prevCheckedItems.includes(id)
                ? prevCheckedItems.filter((item) => item !== id)
                : [...prevCheckedItems, id]
        );
    };

    const setAttributeValues = (id, attributeValues) => {
        const newCartItems = cartItems.map((item) => {
            if (item.id === id) {
                return { ...item, attributeValues: attributeValues };
            }
            return item;
        });
        setCartItems(newCartItems);
    };

    const handleUpdateCartItem = async (id, quantity, variantId, productId) => {
        const cartItem = {
            id,
            quantity,
            variantId: variantId,
            customerId: customerId,
            productId: productId
        };

        try {
            const data = await updateCartItem(cartItem);
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteCartItem = async (id) => {
        try {
            const data = await deleteCartItem(id);
            const newCartItems = cartItems.filter((item) => item.id !== id);
            setCartItems(newCartItems);
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckout = () => {
        const checkedCartItems = cartItems.filter((item) => checkedItems.includes(item.id));
        const idList = checkedCartItems.map((item) => item.id).join(',');
        window.location.href = `/order/${idList}`;
    };



    if (isLoading) {
        return (
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold my-4">Cart</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container w-5/6 mx-auto">
            <h1 className="text-2xl font-bold my-4">Cart</h1>
            {cartItems.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto relative">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 w-2 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleCheckAllButton}
                                        checked={checkedItems.length === cartItems.length}
                                    />
                                </th>
                                <th className="px-4 py-2 text-center">Product</th>
                                <th className="px-4 py-2 text-center"></th>
                                <th className="px-4 py-2 text-center">Price</th>
                                <th className="px-4 py-2 text-center">Quantity</th>
                                <th className="px-4 py-2 text-center">Total</th>
                                <th className="px-4 py-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            value={item.id}
                                            onChange={() => handleCheckButton(item.id)}
                                            checked={checkedItems.includes(item.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-2 flex items-center space-x-4">
                                        <img
                                            src={`${item.product.galleries[0]}`}
                                            alt={item.product.id}
                                            className="w-24 h-24 object-cover"
                                        />
                                        <NavLink
                                            to={`/product/${item.product.id}`}
                                            className="text-blue-500 hover:underline"
                                        >
                                            {item.product.productName}
                                        </NavLink>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {item.variantId !== null && (
                                            <Popup
                                                trigger={
                                                    <button className="bg-gray-100 p-1 rounded-md hover:bg-gray-200 text-gray-600">
                                                        {item.attributeValues}
                                                        <FontAwesomeIcon icon={faCaretDown} className="pl-1" />
                                                    </button>}
                                                position="bottom center"
                                                contentStyle={{ width: '300px' }}
                                            >
                                                <AttributesDropdown
                                                    attributes={item.product.attributes}
                                                    attributeValues={item.product.attributeValues}
                                                    variants={item.product.variants}
                                                    setAttributeValues={(attributeValues) => { setAttributeValues(item.id, attributeValues) }}
                                                    handleUpdateCartItem={(variantId) => { handleUpdateCartItem(item.id, item.quantity, variantId, item.product.id) }}
                                                />
                                            </Popup>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">{item.product.regularPrice.formattedPrice}</td>
                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 text-center">
                                        ${(item.product.regularPrice.value * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600"
                                            onClick={() => handleDeleteCartItem(item.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        onClick={() => handleCheckout()}
                    >
                        Checkout
                    </button>
                </div>
            ) : (
                <div>
                    <p>Your cart is empty</p>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
