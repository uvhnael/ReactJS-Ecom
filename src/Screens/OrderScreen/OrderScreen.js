import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import SuccessPopup from './OrderSuccessPopup';

async function getCartItems(idList) {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/cart/getCartOrderItems`,
            { idList },
            {
                headers: {
                    Authorization: `${Cookies.get('auth_token')}`
                }
            });
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}
async function fetchAddresses(userId) {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/address/${userId}`, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getProductCoupon(idList) {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/coupon`, { idList });
        return response.data;
    } catch (error) {
        console.error(error);
        return [[]];
    }
}

async function getOrderCoupon() {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/coupon`);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function placeOrder(orderData) {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/order`, orderData, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

const OrderScreen = () => {
    const { idList } = useParams();
    const [customerId, setCustomerId] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [productCoupon, setProductCoupon] = useState([[]]);
    const [orderCoupon, setOrderCoupon] = useState([]);
    const [productVariantPrice, setProductVariantPrice] = useState([]);
    const [productDiscount, setProductDiscount] = useState([]);
    const [orderDiscount, setOrderDiscount] = useState(0.0);
    const [selectedOrderCoupon, setSelectedOrderCoupon] = useState({});
    const [selectedProductCoupon, setSelectedProductCoupon] = useState([]);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            setCustomerId(JSON.parse(userData).id);
        }
    }, []);

    useEffect(() => {
        getCartItems(idList.split(',')).then((data) => {
            setCartItems(data);
        });
    }, [idList]);

    useEffect(() => {
        fetchAddresses(customerId)
            .then((data) => {
                setAddresses(data);
                setIsLoading(false);
            });
    }, [customerId]);

    useEffect(() => {
        if (cartItems.length > 0) {
            const productIdList = cartItems.map((item) => item.product.id);
            getProductCoupon(productIdList).then((data) => {
                setProductCoupon(data);
            });
            getOrderCoupon().then((data) => {
                setOrderCoupon(data);
            });
        }
        setProductDiscount(new Array(cartItems.length).fill(0));
        setOrderDiscount(0);
        setProductVariantPrice(cartItems.map((item) => (item.variant_id !== null ? item.product.variants.find((variant) => variant.id === item.variant_id).price : item.product.regular_price)));
    }, [cartItems]);

    const handleCouponChange = (e, index) => {
        const couponId = e.target.value;
        const newProductDiscount = [...productDiscount];
        const product = cartItems[index].product;

        if (couponId === "0") {
            newProductDiscount[index] = 0;
        } else {
            const coupon = productCoupon[index].find((coupon) => coupon.id === parseInt(couponId));
            setSelectedProductCoupon((prev) => {
                const newSelectedProductCoupon = [...prev];
                newSelectedProductCoupon[index] = coupon;
                return newSelectedProductCoupon;
            });
            if (coupon) {
                if (coupon.discount_type === "product_percentage") {
                    newProductDiscount[index] = product.variants.find((variant) => variant.id === cartItems[index].variant_id).price * coupon.discount_value / 100;
                } else if (coupon.discount_type === "product_fixed") {
                    newProductDiscount[index] = coupon.discount_value;
                } else {
                    newProductDiscount[index] = 0;
                }
            }
        }

        setProductDiscount(newProductDiscount);
        updateOrderDiscount(newProductDiscount);
    };

    const handleOrderCouponChange = (e) => {
        const couponId = e.target.value;
        if (couponId === "0") {
            setOrderDiscount(0);
        } else {
            const coupon = orderCoupon.find((coupon) => coupon.id === parseInt(couponId));
            setSelectedOrderCoupon(coupon);
            if (coupon) {
                if (coupon.discount_type === "percentage") {
                    setOrderDiscount(cartItems.reduce((acc, item, index) => acc + productVariantPrice[index] * item.quantity - productDiscount[index], 0) * coupon.discount_value / 100);
                } else if (coupon.discount_type === "fixed") {
                    setOrderDiscount(coupon.discount_value);
                } else {
                    setOrderDiscount(0);
                }
            }
        }
    };

    const updateOrderDiscount = (newProductDiscount) => {
        const coupon = selectedOrderCoupon;
        if (coupon) {
            if (coupon.discount_type === "percentage") {
                setOrderDiscount(cartItems.reduce((acc, item, index) => acc + productVariantPrice[index] * item.quantity - newProductDiscount[index], 0) * coupon.discount_value / 100);
            } else if (coupon.discount_type === "fixed") {
                setOrderDiscount(coupon.discount_value);
            } else {
                setOrderDiscount(0);
            }
        }
    };

    const handleOrderSuccess = () => {
        window.location.href = '/orders';
    };

    const handlePlaceOrder = () => {
        const orderData = {
            customer_id: customerId,
            coupon_id: selectedOrderCoupon?.id || 1,
            customer_address_id: 1,
            order_status_id: 1,
            price: cartItems.reduce((acc, item, index) => acc + productVariantPrice[index] * item.quantity - productDiscount[index], 0) - orderDiscount,
            order_items: cartItems.map((item, index) => ({
                product_id: item.product.id,
                variant_id: item.variant_id,
                price: productVariantPrice[index] - productDiscount[index],
                quantity: item.quantity,
                coupon_id: selectedProductCoupon[index]?.id || 1
            }))
        }

        placeOrder(orderData).then((data) => {
            setOrderSuccess(true);
        });

    };

    if (isLoading) {
        return (
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold my-4">Order</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto w-5/6">
            <h1 className="text-2xl font-bold my-4">Order</h1>
            <div className="flex flex-row items-center space-x-4">
                <div className="flex flex-col w-full">
                    <p className="text-lg font-medium">Shipping Address</p>
                    {addresses.map((address) => (
                        address.is_default === 1 ? (
                            <div key={address.id} className="flex flex-row px-4 py-2 bg-white shadow-lg justify-between">
                                <div className="flex flex-col">
                                    <div className="flex flex-row items-center">
                                        <p className="font-medium">{address.customer_name}</p>
                                        <p className="px-2">|</p>
                                        <p className="text-gray-500">{address.phone_number}</p>
                                    </div>
                                    <div className="flex flex-row items-center">
                                        <p className="text-gray-500">{address.address_line1}, {address.address_line2}</p>
                                    </div>
                                    <div className="flex flex-row items-center">
                                        <p className="text-gray-500">{address.ward}, {address.district}, {address.city}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    ))}
                </div>
            </div>
            <table className="table-fixed min-w-full p-4 mt-4">
                <thead>
                    <tr className="bg-white rounded-xl shadow-lg">
                        <th className="w-128 px-4 py-2 border-b border-gray-200 text-center">Product</th>
                        <th className="w-40 px-4 py-2 border-b border-gray-200 text-center"></th>
                        <th className="w-48 px-4 py-2 border-b border-gray-200 text-center">Price</th>
                        <th className="w-48 px-4 py-2 border-b border-gray-200 text-center">Quantity</th>
                        <th className="w-48 px-4 py-2 border-b border-gray-200 text-center">SubTotal</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <tr className="bg-white rounded-xl shadow-lg">
                                <td className="px-4 py-2 border-b border-gray-200 flex flex-row items-center space-x-4">
                                    <img
                                        src={`http://localhost:8000/${item.product.gallery[0]}`}
                                        alt={item.product.id}
                                        className="w-24 h-24 object-cover"
                                    />
                                    <p className="font-medium">{item.product.product_name}</p>
                                </td>
                                <td className="w-40 px-4 py-2 border-b border-gray-200 text-center">
                                    <p className="text-gray-600">{item.attribute_values}</p>
                                </td>
                                <td className="w-48 px-4 py-2 border-b border-gray-200 text-center">${productVariantPrice[index]}</td>
                                <td className="w-48 px-4 py-2 border-b border-gray-200 text-center">{item.quantity}</td>
                                <td className="w-48 px-4 py-2 border-b border-gray-200 text-center">
                                    ${(productVariantPrice[index] * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                            {productCoupon[index] && productCoupon[index].length > 0 && (
                                <tr className="bg-white rounded-xl shadow-lg">
                                    <td ></td>
                                    <td className="px-4 py-2 border-b border-gray-200 text-center" colSpan="3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-bold">Product Coupon</p>
                                            <select
                                                className="w-96 border border-gray-300 rounded-md p-1"
                                                onChange={(e) => handleCouponChange(e, index)}
                                            >
                                                <option value="0">None</option>
                                                {productCoupon[index] && productCoupon[index].map((coupon) => (
                                                    <option key={coupon.id} value={coupon.id}>{coupon.code}</option>
                                                ))}
                                            </select>

                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <p className="text-lg font-bold">-${productDiscount[index]?.toFixed(2)}</p>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td className="px-4 py-1 text-center" colSpan="5"></td>
                            </tr>
                        </React.Fragment>
                    ))}
                    <tr className="bg-white shadow-lg">
                        <td ></td>
                        <td className="px-4 py-2 border-b border-gray-200 text-center" colSpan="3">
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-bold">Order Coupon</p>
                                <select
                                    className="w-96 border border-gray-300 rounded-md p-1"
                                    onChange={(e) => handleOrderCouponChange(e)}
                                >
                                    <option value="0">None</option>
                                    {orderCoupon && orderCoupon.map((coupon) => (
                                        <option key={coupon.id} value={coupon.id}>{coupon.coupon_description + ` - ` + coupon.code}</option>
                                    ))}
                                </select>

                            </div>

                        </td>
                        <td className="text-center">
                            <p className="text-lg font-bold">-${orderDiscount?.toFixed(2)}</p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="px-24 py-2 flex justify-end mt-4 bg-white shadow-lg">
                <div className="flex flex-row items-center space-x-4 ">
                    <div className="flex flex-col items-start w-52">
                        <p className="text-lg text-gray-500">Total product price:</p>
                        <p className="text-lg text-gray-500">Discount:</p>
                        <p className="text-lg text-gray-500">Total:</p>

                    </div>
                    <div className="flex flex-col items-end w-40">
                        <p className="text-lg font-bold text-gray-500">
                            ${cartItems.reduce((acc, item, index) => acc + productVariantPrice[index] * item.quantity, 0).toFixed(2)}</p>
                        <p className="text-lg font-bold text-gray-500">
                            -${(productDiscount.reduce((acc, item) => acc + item, 0) + orderDiscount).toFixed(2)}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                            ${(cartItems.reduce((acc, item, index) => acc + productVariantPrice[index] * item.quantity - productDiscount[index], 0) - orderDiscount).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-4">
                <button
                    className="w-96 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    onClick={handlePlaceOrder}
                >
                    Place Order
                </button>
            </div>
            <SuccessPopup isOpen={orderSuccess} onClose={handleOrderSuccess} />
        </div>
    );
};

export default OrderScreen;
