import React, { useState, useEffect } from "react";
import Cookie from 'js-cookie';
import Axios from "axios";
import FileBase64 from 'react-file-base64';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

async function productRate(productRateData) {
    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/product/rate`, productRateData, {
            headers: {
                Authorization: Cookie.get('auth_token'),
                'Content-Type': 'multipart/form-data' // Ensure multipart/form-data is set
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error during product rating:", error);
    }
}

const ProductRatePopup = ({ product, isOpen, onClose }) => {
    const [rating, setRating] = useState(0);
    const [user, setUser] = useState(null);
    const [comment, setComment] = useState("");
    const [error, setError] = useState(null);
    const [video, setVideo] = useState(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const userData = Cookie.get('user_data');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating < 0 || rating > 5) {
            setError("Rating must be between 0 and 5");
            return;
        }

        const productRateData = new FormData();
        productRateData.append("product_id", product.product.id);
        productRateData.append("rate", rating);
        productRateData.append("review", comment);
        productRateData.append("customer_id", user.id);
        productRateData.append("customer_name", user.name);
        productRateData.append("order_item_id", product.id);
        productRateData.append("product_attribute_value", product.attribute_value);

        images.forEach((image, index) => {
            productRateData.append(`images`, image.file);
        });

        if (video) {
            productRateData.append(`video`, video.file);
        }

        const response = await productRate(productRateData);

        if (response) {
            onClose();
        }
    };

    const handleFileChange = (files) => {
        const imageFiles = files.filter(file => file.type.includes('image'));
        const videoFiles = files.filter(file => file.type.includes('video'));

        if (videoFiles.length > 1) {
            setError("You can only upload one video.");
            return;
        }

        if (imageFiles.length > 5) {
            setError("You can only upload up to 5 images.");
            return;
        }

        if (videoFiles.length > 0) {
            setVideo(videoFiles[0]);
        }
        setImages(prevImages => [...prevImages, ...imageFiles]);
    };

    return (
        <Popup open={isOpen} closeOnDocumentClick onClose={onClose} contentStyle={{ width: "768px" }}>
            <div className="flex items-center justify-center">
                <div className="p-2 w-144">
                    <h2 className="text-xl font-semibold">Rate this product</h2>
                    {product && (
                        <div className="flex flex-row py-2" >
                            <img src={`http://localhost:8000/${product.product.image_path}`} alt={product.product.product_name} className="size-20" />
                            <div className="flex flex-col ml-4">
                                <p className="text-lg font-medium">{product.product.product_name}</p>
                                <p className="text-gray-500">{product.attribute_value}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="overflow-y-auto scrollbar-hidden h-128">
                            <div className="flex flex-col mb-4">
                                <label htmlFor="rating" className="mb-2">Rating</label>
                                <input type="number" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)} className="border border-gray-300 rounded-md p-2" />
                            </div>
                            <div className="flex flex-col mb-4">
                                <label htmlFor="comment" className="mb-2">Comment</label>
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="border border-gray-300 rounded-md p-2" />
                            </div>
                            <div className="flex flex-col mb-4">
                                <label htmlFor="files" className="mb-2">Upload Images/Videos</label>
                                <FileBase64
                                    multiple={true}
                                    onDone={handleFileChange}
                                    accept="image/*,video/*"
                                />
                            </div>

                            {(images.length > 0 || video) && <div className="p-2">
                                <div className="grid grid-cols-4 gap-2 ">
                                    {video &&
                                        <div className="relative size-44">
                                            <video src={video.base64} controls className="size-44" />
                                            <button className="absolute top-0 right-0" onClick={() => setVideo(null)}>X</button>
                                        </div>
                                    }
                                    {images.map((image, index) => (
                                        <div key={index} className="relative size-44">
                                            <img src={image.base64} alt={`preview-${index}`} className="size-44" />
                                            <button className="absolute top-0 right-0" onClick={() => setImages(prevImages => prevImages.filter((_, i) => i !== index))}>X</button>
                                        </div>
                                    ))}
                                </div>
                            </div>}
                            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>
                            <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md ml-2">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </Popup>
    );
};

export default ProductRatePopup;
