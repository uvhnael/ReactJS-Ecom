import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import axios from "axios";
import ProductRatePopup from "../ProductRateScreen/ProductRatePopup";


async function fetchOrders(customerId) {
    if (!customerId) return [];
    try {
        const response = await axios.get(`${process.env.REACT_APP_JAVA_API}/orders/customer/${customerId}`, {
            headers: {
                Authorization: `Bearer ${Cookies.get('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}


const OrdersScreen = () => {

    const [customerId, setCustomerId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const userData = Cookies.get('user');
        if (userData) {
            setCustomerId(JSON.parse(userData).id);
        }
    }, []);

    useEffect(() => {
        if (customerId) {
            fetchOrders(customerId).then((data) => {
                setOrders(data);
                setIsLoading(false);
                console.log(data);
            });
        }
    }, [customerId]);

    useEffect(() => {
        const newOrderStatus = orders.map((order) => {
            if (order.orderStatusId === 1) {
                return "Pending";
            } else if (order.orderStatusId === 2 && order.orderDeliveredCarrierDate === "Invalid date" && order.orderDeliveredCustomerDate === "Invalid date") {
                return "Approved";
            } else if (order.orderStatusId === 2 && order.orderDeliveredCarrierDate !== "Invalid date" && order.orderDeliveredCustomerDate === "Invalid date") {
                return "In Transit";
            } else if (order.orderStatusId === 2 && order.orderDeliveredCarrierDate !== "Invalid date" && order.orderDeliveredCustomerDate !== "Invalid date") {
                return "Delivered";
            } else if (order.orderStatusId === 3) {
                return "Completed";
            } else if (order.orderStatusId === 4) {
                return "Cancelled";
            } else if (order.orderStatusId === 5) {
                return "Returned";
            }
            return "Unknown"; // In case none of the conditions match
        });

        setOrderStatus(newOrderStatus);
    }, [orders]);


    function isOrderWithinLast30Days(orderDeliveredCustomerDate) {
        // Parse the orderDeliveredCustomerDate
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
        // turn on page scroll
        document.body.style.overflow = 'auto';
    };



    if (isLoading) {
        return <div>Loading...</div>
    }



    return (
        <div className="container mx-auto w-7/12">
            <table className="table-fixed min-w-full p-4 mt-4">
                {/* <thead>
                    <tr className="bg-white rounded-xl shadow-lg">
                        <th className="w-128 px-4 py-2 border-b border-gray-200 text-center">Product</th>
                        <th className="w-48 px-4 py-2 border-b border-gray-200 text-center">Price</th>
                    </tr>
                </thead> */}
                <tbody>
                    {orders.map((order, index) => (
                        <React.Fragment key={order.id} >
                            <tr className="bg-white shadow-lg">
                                <td colSpan="2" className="px-4 py-2 border-b border-gray-200">
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="text-lg font-bold">Order ID: {order.id}</p>
                                        <p className="text-lg font-bold">Status: {orderStatus[index]}</p>
                                    </div>
                                </td>
                            </tr>
                            {order.orderItems.map((orderItem) => (
                                <tr className="bg-white shadow-lg">
                                    <td className="px-4 py-2 border-b border-gray-200 ">
                                        <div className="flex flex-row items-top">
                                            <img
                                                src={`${orderItem.imagePath}`}
                                                alt={orderItem.productName} className="size-24"
                                            />
                                            <div className="flex flex-col ml-4">
                                                <p className="text-lg line-clamp-1">{orderItem.productName}</p>
                                                {orderItem.variant_id !== null && <p className="text-base text-gray-500">{orderItem.attributeValues}</p>}
                                                <p className="text-base font-medium">x{orderItem.quantity}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-end border-b border-gray-200 ">
                                        <p className="text-lg font-medium text-indigo-600">${orderItem.price}</p>
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-white shadow-lg">
                                <td colSpan="2" className="py-2">
                                    <div className="px-4 py-2 flex flex-row items-center justify-end">
                                        <p className="text-lg font-medium text-gray-500">Total: </p>
                                        <p className="text-lg font-bold text-indigo-600"> ${order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}</p>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-white shadow-lg">
                                <td colSpan="2" className="px-4 py-2 border-b border-gray-200">
                                    <div className="flex flex-row justify-end">
                                        {(orderStatus[index] === "Pending" || orderStatus[index] === "Approved") && <button className="bg-indigo-600 text-white px-4 py-2 rounded-sm">Cancel Order</button>}
                                        {(orderStatus[index] === "Delivered") && <button className="bg-indigo-600 text-white px-4 py-2 rounded-sm">Completed</button>}
                                        {orderStatus[index] === "Completed" && isOrderWithinLast30Days(order.orderDeliveredCustomerDate) && (
                                            <button
                                                onClick={() => handleRateButtonClick(order.order_items[0])}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-sm">
                                                Rate
                                            </button>
                                        )}
                                        {(orderStatus[index] === "Completed") && <button className="bg-indigo-600 text-white px-4 py-2 rounded-sm ml-4">Repurchase</button>}
                                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-sm ml-4">View Details</button>

                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2" colSpan="2">
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <ProductRatePopup product={selectedProduct} isOpen={isModalOpen} onClose={handleCloseModal} />
        </div >

    );
}

export default OrdersScreen;