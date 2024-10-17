// NotificationComponent.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Notification = ({ notifications }) => {
    return (
        <div>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>
                        <NavLink to={`/product/${notification.product_details.product_id}`}>
                            <div className='bg-white p-4 my-1 rounded-md shadow-md'>
                                <div className='flex flex-row items-center'>
                                    {notification.image_url && <img src={notification.image_url} alt="Notification" className='w-24 h-24' />}
                                    <div className='h-24 flex flex-col ml-4'>
                                        <h3>{notification.title}</h3>
                                        <p className="line-clamp-1">{notification.body}</p>
                                        {notification.type === 'PRODUCT_SALE' && (
                                            <div>
                                                <p className="line-through">đ{notification.product_details.original_price}</p>
                                                <p className='font-medium text-indigo-600 text-xl'>đ{notification.product_details.sale_price}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notification;
