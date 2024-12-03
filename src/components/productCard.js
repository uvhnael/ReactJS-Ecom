import React from 'react';

const ProductCard = ({ product }) => {
    const onClick = () => {
        window.location.href = `/product/${product.id}`;
    }
    return (
        <div
            onClick={onClick}
            className="max-w-sm overflow-hidden p-1 bg-white rounded-lg shadow-lg hover:bg-gray-100"
        >
            {/* <img className="w-full h-auto object-cover" src={`http://localhost:1080/api/v1/${product.imagePath}`} alt={product.id} /> */}
            <img className=" object-cover" src={product.imagePath} alt={product.id} />
            <div className="relative h-24">
                <div className="px-2 pt-2 absolute inset-x-0 top-0">
                    <div className="font-medium text-base mb-2 "><p className='line-clamp-2'>{product.productName}</p></div>
                </div>
                <div className="px-2 justify-between flex absolute inset-x-0 bottom-0">
                    <p className="inline-block py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ">
                        {product.regularPrice.formattedPrice}
                    </p>
                    <span className="inline-block py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 ">
                        {product.quantity}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
