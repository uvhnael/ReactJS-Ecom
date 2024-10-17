import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import ProductRatePopup from './ProductRatePopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import FiveStar from '../../components/FiveStar';

async function fetchOrders(customerId) {
    if (!customerId) return [];
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/order/getOrder/${customerId}`, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

async function fetchOrderItemIdByCustomer(customerId) {
    if (!customerId) return [];
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/product/rate/getOrderItemIdByCustomer/${customerId}`, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching order item id by customer:", error);
        return [];
    }
}

async function fetchProductRate(customerId) {
    if (!customerId) return null;
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/product/rate/getRateByCustomer/${customerId}`, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching product rate:", error);
        return null;
    }
}

const ProductRateScreen = () => {
    const [customerId, setCustomerId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [productRates, setProductRates] = useState(null);
    const [idList, setIdList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [screen, setScreen] = useState('rate');

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            setCustomerId(JSON.parse(userData).id);
        }
    }, []);

    useEffect(() => {
        callApi(customerId);
    }, [customerId]);

    function callApi(customerId) {
        if (customerId) {
            Promise.all([fetchOrders(customerId), fetchOrderItemIdByCustomer(customerId), fetchProductRate(customerId)])
                .then(([orders, idList, productRates]) => {
                    setOrders(orders);
                    setIdList(idList);
                    setProductRates(productRates);
                    setIsLoading(false);
                });
        }
    }


    function isOrderWithinLast30Days(orderDeliveredCustomerDate) {
        // Parse the order_delivered_customer_date
        const [time, date] = orderDeliveredCustomerDate.split(" ");
        const [hours, minutes, seconds] = time.split(":");
        const [day, month, year] = date.split("/");

        const orderDeliveredDate = new Date(`20${year}`, month - 1, day, hours, minutes, seconds);

        // Subtract 30 days from the current date
        const currentDateMinus30Days = new Date();
        currentDateMinus30Days.setDate(currentDateMinus30Days.getDate() - 30);

        // Compare the dates
        return orderDeliveredDate >= currentDateMinus30Days;
    }

    const handleRateButtonClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        // turn off page scroll
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        callApi(customerId);
        // turn on page scroll
        document.body.style.overflow = 'auto';
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto w-5/12">
            <div className="flex flex-row justify-center items-center">
                <button
                    className='w-24 bg-white p-2 m-1 rounded-md hover:bg-indigo-600 hover:text-white border border-gray-200 shadow-lg'
                    onClick={() => setScreen('rate')}
                >
                    <p className='font-medium text-xl'>Rate</p>
                </button>
                <button
                    className='w-24 bg-white p-2 m-1 rounded-md hover:bg-indigo-600 hover:text-white border border-gray-200 shadow-lg'
                    onClick={() => setScreen('rated')}
                >
                    <p className='font-medium text-xl'>Rated</p>
                </button>
            </div>
            {screen === 'rate' && (
                <table className="table-fixed min-w-full p-4 mt-4">
                    <tbody>
                        {orders.map((order, index) => (
                            order.order_status_id === 3 && order.order_items.map((orderItem) => (
                                (!idList.includes(orderItem.id)) && (
                                    <React.Fragment key={orderItem.id} >
                                        <tr className="bg-white shadow-lg">
                                            <td className="px-4 py-2 border-b border-gray-200 ">
                                                <div className="flex flex-row items-top">
                                                    <img
                                                        src={`http://localhost:8000/${orderItem.product.image_path}`}
                                                        alt={orderItem.product.product_name} className="size-24"
                                                    />
                                                    <div className="flex flex-col ml-4">
                                                        <p className="text-lg line-clamp-1">{orderItem.product.product_name}</p>
                                                        {orderItem.variant_id !== null && <p className="text-base text-gray-500">Variant: {orderItem.attribute_value}</p>}
                                                        <p className="text-base font-medium">x{orderItem.quantity}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-end border-b border-gray-200 ">
                                                <p className="text-lg font-medium text-indigo-600">${orderItem.price}</p>
                                            </td>
                                        </tr>
                                        {isOrderWithinLast30Days(order.order_delivered_customer_date) && (
                                            <tr className="bg-white shadow-lg">
                                                <td colSpan="2" className="px-4 py-2 border-b border-gray-200">
                                                    <div className="flex flex-row justify-end">
                                                        <button
                                                            onClick={() => handleRateButtonClick(orderItem)}
                                                            className="bg-indigo-600 text-white px-4 py-2 rounded-sm">
                                                            Rate
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        <tr >
                                            <td className='py-2' colSpan={2}>

                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )
                            ))
                        ))}
                    </tbody>
                </table>
            )}
            {screen === 'rated' && (
                <div className="container mx-auto min-w-full p-4 mt-4">
                    {productRates.map((productRate, index) => (
                        <React.Fragment key={productRate._id} >
                            <div className="flex flex-row items-top bg-white shadow-lg p-4">
                                <div className="flex flex-col p-1">
                                    <FontAwesomeIcon icon={faUserCircle} className="text-4xl text-gray-500" />
                                </div>
                                <div className="flex flex-col ml-4">
                                    <p className="text-lg line-clamp-1">{productRate.customer_name}</p>
                                    <div className='text-sm'>
                                        <FiveStar rating={productRate.rate} />
                                    </div>
                                    <p className="text-gray-500">{productRate.created_at} | {productRate.product_attribute_value}</p>

                                    <p className="text-base break-all">{productRate.review}</p>

                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        <video src={`http://localhost:8000/${productRate.video_path}`} controls className="size-48 border border-gray-200" />

                                        {productRate.image_path.map((image, index) => (
                                            <img key={index} src={`http://localhost:8000/${image}`} alt={`preview-${index}`} className="size-48  border border-gray-200" />
                                        ))}
                                    </div>

                                </div>

                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )
            }
            <ProductRatePopup product={selectedProduct} isOpen={isModalOpen} onClose={handleCloseModal} />
        </div >
    );
}

export default ProductRateScreen;