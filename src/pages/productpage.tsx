import type { FC } from 'react';
import React, { useEffect, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import Cart from '../components/cart';
import Footer from '../components/footer';

const ProductPage: FC = ({}) => {
  //get the product id from the url
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<string>('');

  const [product, setProduct] = useState<any>({});
  const context = useContext(AppContext);
  //get orderlist from context
  const orderList = context?.orderList;
  //add function from context to add product to orderlist
  const addToOrderList = context?.addToOrderList;
  //remove function from context to remove product from orderlist
  const removeFromOrderList = context?.removeFromOrderList;

  const handleQuantity = (e: any) => {
    setQuantity(e.target.value);
  };
  const addToCart = () => {
    const qty = parseInt(quantity);
    if (qty > 0) {
      setLoadingCart(true);
      addToOrderList && addToOrderList({ product: product, quantity: qty });
      setQuantity('');
      setLoadingCart(false);
    }
  };

  const getProduct = async (id: number) => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-product.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
      body: JSON.stringify({
        id: id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data[0]) {
          setProduct(data[0]);
        }
        setLoading(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error', error);

        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      getProduct(parseInt(id));
    }
  }, []);

  return (
    <>
      <div className="lg:py-10">
        {loading && (
          <svg
            className="inline-block mt-5 mb-10 w-7 h-7 text-accent animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        <div className="grid max-w-4xl grid-cols-3 gap-0 pr-2 lg:gap-10 md:pr-0">
          {product.base64 && (
            <div className="col-span-3 lg:col-span-1">
              <img
                className="w-full h-auto"
                src={`data:image/jpeg;base64,${product.base64}`}
                alt={product.image}
              />
            </div>
          )}
          <div className="col-span-3 py-5 lg:col-span-2">
            <h1 className="mb-3 text-base md:text-xl md:mb-5">
              {product.title && product.title}
            </h1>
            {product.description && (
              <div
                className="text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
            {product.description && (
              <p className="mt-10 md:text-xl">
                {new Intl.NumberFormat('nl-NL', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(product.price)}{' '}
                {product.vat && (
                  <span className="text-gray-500 md:text-lg">
                    {' '}
                    incl {product.vat}% VAT
                  </span>
                )}
              </p>
            )}
            <div className="flex items-center mt-12">
              <input
                onChange={handleQuantity}
                type="number"
                min="1"
                step="1"
                max="1000"
                value={quantity}
                placeholder="Quantity"
                className="w-32 px-5 py-2 mr-5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              />

              {loadingCart ? (
                <svg
                  className="inline-block w-7 h-7 text-accent animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <button
                  onClick={addToCart}
                  className="w-auto px-5 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add to cart
                </button>
              )}
            </div>
            <div className="mt-10">
              <button
                className="flex text-indigo-600 hover:text-indigo-700"
                onClick={() => navigate('/products')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                  />
                </svg>
                <span className="ml-1 text-sm">back</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-lg">
          <Cart />
        </div>
      </div>
      <Footer />
    </>
  );
};
export default ProductPage;
