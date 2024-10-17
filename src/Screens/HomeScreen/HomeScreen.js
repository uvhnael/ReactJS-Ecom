import React, { useState, useEffect } from "react";
import axios from 'axios';
import ProductCard from "../../components/productCard";
import Banner from "./Banner";

async function fetchData() {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/product/getProducts`);
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.error(error);

    }
}


function HomeScreen() {
    const [products, setProducts] = useState([{ id: '', product_name: '', regular_price: '', image_path: '', quantity: '' }]);

    useEffect(() => {
        fetchData().then((data) => {
            setProducts(data);
        });
    }, []);

    return (
        <div>
            <Banner />
            <div className="container mx-auto p-4">
                <div className="text-2xl font-bold mb-4 bg-white rounded-md shadow-lg p-4 justify-center flex ">
                    <p>Recommend Products</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;