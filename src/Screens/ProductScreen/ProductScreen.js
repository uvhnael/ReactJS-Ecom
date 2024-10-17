import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cookies from 'js-cookie';
import FiveStar from '../../components/FiveStar';
import { faUserCircle } from '@fortawesome/free-regular-svg-icons';


async function fetchProduct(productId) {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_API_URL}/product/getProduct/${productId}`,
            {
                headers: {
                    Authorization: `${Cookies.get('auth_token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function fetchProductRate(productId) {
    try {
        const response = await Axios.get(`${process.env.REACT_APP_API_URL}/product/rate/${productId}`);

        return response.data;
    } catch (error) {
        console.error(error);
    }
}

async function addToCart(customerId, productId, variantId, quantity) {

    try {
        const response = await Axios.post(`${process.env.REACT_APP_API_URL}/cart`, {
            customer_id: customerId,
            product_id: productId,
            variant_id: variantId,
            quantity: quantity
        }, {
            headers: {
                Authorization: `${Cookies.get('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

const ProductScreen = () => {
    const { productId } = useParams();
    const [customerId, setCustomerId] = useState();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [attributeValues, setAttributeValues] = useState([]);
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [productRates, setProductRates] = useState([]);
    const [clickedButton, setClickedButton] = useState([]);
    const [disabledButton, setDisabledButton] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = Cookies.get('user_data');
        if (data) {
            setCustomerId(JSON.parse(data).id);
        }
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            const data = await fetchProduct(productId);
            setProduct(data);
            setVariants(data.variants || []);
            setAttributes(data.attributes || []);
            setAttributeValues(data.attribute_values || []);
            setPrice(data.regular_price || 0);
            setStock(data.quantity || 0);
            setIsLoading(false);
        };
        loadProduct();
        fetchProductRate(productId).then((data) => setProductRates(data));
    }, [productId]);


    useEffect(() => {
        setDisabledButton(baseDisabledButton());
        // eslint-disable-next-line
    }, [variants]);

    useEffect(() => {
        setDisabledButton(updateDisabledButton(baseDisabledButton()));
        // eslint-disable-next-line
    }, [clickedButton]);

    const handleButtonClick = (attrIndex, valueIndex) => {
        const newClickedButton = [...clickedButton];
        newClickedButton[attrIndex] = newClickedButton[attrIndex] === valueIndex ? '' : valueIndex;
        setClickedButton(newClickedButton);
        updatePriceAndStock(newClickedButton);

    };

    const updatePriceAndStock = (newClickedButton) => {
        const selectedAttributes = newClickedButton.filter((button) => button !== '');
        if (selectedAttributes.length === attributes.length) {
            let selectedVariant = [];
            if (selectedAttributes.length === 1) {
                selectedVariant = variants[newClickedButton[0]];
            } else if (selectedAttributes.length === 2) {
                selectedVariant = variants[newClickedButton[0] * attributeValues[1].length + newClickedButton[1]];
            }
            setPrice(selectedVariant.price);
            setStock(selectedVariant.quantity);
        } else {
            setPrice(product.regular_price);
            setStock(product.quantity);
        }
    };

    const baseDisabledButton = () => {
        const disabledButton = [];
        if (attributes.length === 0 || attributeValues.length === 0 || variants.length === 0) {
            return disabledButton;
        }

        if (attributes.length === 1) {
            for (let i = 0; i < attributeValues[0].length; i++) {
                if (variants[i].quantity <= 0) {
                    disabledButton.push(i);
                }
            }
        } else if (attributes.length === 2) {
            for (let i = 0; i < attributeValues[0].length; i++) {
                let disabled = true;
                for (let j = 0; j < attributeValues[1].length; j++) {
                    if (variants[i * attributeValues[1].length + j].quantity > 0) {
                        disabled = false;
                    }
                }
                if (disabled) {
                    disabledButton.push(i);
                }
            }
            for (let i = 0; i < attributeValues[1].length; i++) {
                let disabled = true;
                for (let j = 0; j < attributeValues[0].length; j++) {
                    if (variants[j * attributeValues[1].length + i].quantity > 0) {
                        disabled = false;
                    }
                }
                if (disabled) {
                    disabledButton.push(attributeValues[0].length + i);
                }
            }
        }

        return disabledButton;
    };

    const updateDisabledButton = (baseDisabledButton) => {
        const newDisabledButton = [...baseDisabledButton];

        if (attributes.length === 0 || attributes.length === 1) {
            return newDisabledButton;
        }
        if (clickedButton[0] !== undefined && clickedButton[0] !== '') {
            for (let i = 0; i < attributeValues[1].length; i++) {
                if (variants[clickedButton[0] * attributeValues[1].length + i].quantity <= 0) {
                    newDisabledButton.push(attributeValues[0].length + i);
                }
            }
        }
        if (clickedButton[1] !== undefined && clickedButton[1] !== '') {
            for (let i = 0; i < attributeValues[0].length; i++) {
                if (variants[i * attributeValues[1].length + clickedButton[1]].quantity <= 0) {
                    newDisabledButton.push(i);
                }
            }
        }

        return newDisabledButton;


    };

    const handleAddToCart = async () => {
        var variantId = null;
        if (variants.length !== 0) {
            if (attributes.length === 1) {
                variantId = variants[clickedButton[0]].id;
            } else if (attributes.length === 2) {
                variantId = variants[clickedButton[0] * attributeValues[1].length + clickedButton[1]].id;
            }
        }
        await addToCart(customerId, productId, variantId, quantity);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-rows justify-center">
                <div className="bg-gray">
                    <img
                        src={`http://localhost:8000/${product.galleries.find((gallery) => gallery.thumbnail).image_path}`}
                        alt={product.product_name}
                        className="w-full h-auto md:w-128"
                    />
                </div>
                <div className="bg-white p-4 w-128 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
                    <p className="text-lg font-semibold mb-4">${price}</p>
                    <div className="mb-4">
                        {attributes.map((attr, attrIndex) => (
                            <div key={attrIndex} className="flex flex-row mb-2 items-center">
                                <div className="w-24">
                                    <p className="font-normal text-gray-600">{attr}</p>
                                </div>
                                <div className="flex flex-wrap py-1">
                                    {attributeValues[attrIndex].map((value, valueIndex) => (
                                        <button
                                            key={valueIndex}
                                            className={`px-3 py-1 rounded-lg mr-2 ${disabledButton.includes(attrIndex * attributeValues[0].length + valueIndex)
                                                ? 'text-gray-500 bg-gray-300 '
                                                : 'bg-gray-200 '
                                                } ${clickedButton[attrIndex] === valueIndex
                                                    ? 'outline outline-2 outline-indigo-600'
                                                    : ''
                                                }`}
                                            onClick={() => handleButtonClick(attrIndex, valueIndex)}
                                            disabled={disabledButton.includes(attrIndex * attributeValues[0].length + valueIndex)}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mb-4 flex flex-rows items-center">
                        <div className="w-24">
                            <p className="font-normal text-gray-600">Quantity</p>
                        </div>
                        <div className="flex flex-rows">
                            <button
                                onClick={() => setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1))}
                                className="px-3 py-1 bg-indigo-600 rounded-l-lg"
                            >
                                <FontAwesomeIcon icon="fa-solid fa-minus" className="text-white" />
                            </button>
                            <div className="px-3 py-1 border border-1 border-indigo-600 w-16 justify-center items-center">
                                <p className="text-center">{quantity}</p>
                            </div>
                            <button
                                onClick={() => setQuantity((prevQuantity) => Math.min(stock, prevQuantity + 1))}
                                className="px-3 py-1 bg-indigo-600 rounded-r-lg"
                            >
                                <FontAwesomeIcon icon="fa-solid fa-plus" className="text-white" />
                            </button>
                        </div>
                        <div>
                            <p className="px-4 font-normal text-gray-600">Stock: {stock}</p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg ml-2">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-11/12 mx-auto mt-8">
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

                                    <div className="flex flex-row mt-4">
                                        <video src={`http://localhost:8000/${productRate.video_path}`} controls className="size-48 border border-gray-200 mr-2" />

                                        {productRate.image_path.map((image, index) => (
                                            <img key={index} src={`http://localhost:8000/${image}`} alt={`preview-${index}`} className="size-48  border border-gray-200 mr-2" />
                                        ))}
                                    </div>

                                </div>

                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;
