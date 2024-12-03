import React, { useState, useEffect } from "react";
import axios from 'axios';
import ProductCard from "../../components/productCard";
import Banner from "./Banner";
import Cookies from 'js-cookie';

async function fetchProducts() {
    try {
        const response = await axios.get(`${process.env.REACT_APP_JAVA_API}/products/random?size=60`);
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}

async function fetchRecommendProducts(customerId) {
    try {
        const response = await axios.get(`${process.env.REACT_APP_JAVA_API}/products/recommend/customer/${customerId}?size=60`);
        console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}


function HomeScreen() {
    const [products, setProducts] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = Cookies.get('user');
        if (data) {
            fetchRecommendProducts(JSON.parse(data).id).then((data) => {
                setProducts(data);
                setIsLoading(false);
            });
        }
        else
            fetchProducts().then((data) => {
                setProducts(data);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-2xl font-bold">Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <Banner />
            <div className="container mx-auto p-4">
                <div className="text-2xl font-bold mb-4 bg-white rounded-md shadow-lg p-4 justify-center flex ">
                    <p>Recommend Products</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {/* check if products != null  */}
                    {products && products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;