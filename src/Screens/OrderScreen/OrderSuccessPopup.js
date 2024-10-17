// SuccessPopup.js
import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const OrderSuccessPopup = ({ isOpen, onClose }) => (
    <Popup open={isOpen} closeOnDocumentClick onClose={onClose}>
        <div className="modal">
            <button className="close" onClick={onClose}>
                &times;
            </button>
            <div className="header"> Success! </div>
            <div className="content">
                Your order has been placed successfully.
            </div>
        </div>
    </Popup>
);

export default OrderSuccessPopup;
