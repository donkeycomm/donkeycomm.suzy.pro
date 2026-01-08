import { useEffect, useState, type FC } from 'react';
import Product from './product';

interface productbrowserProps {
  updatePage: () => void;
  refreshCounter: number;
}

const ProductBrowser: FC<productbrowserProps> = ({ refreshCounter }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getProducts = async () => {
    const storedJWT = localStorage.getItem('jwt');
    const response = await fetch(
      process.env.REACT_APP_API_URL + '/get-products.php',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + storedJWT,
        },
      }
    );
    const data = await response.json();
    setLoading(false);
    setProducts(data);
  };

  useEffect(() => {
    getProducts();
  }, [refreshCounter]);

  return (
    <div className="pr-5 lg:py-10">
      <h1 className="mb-10">Order a product</h1>
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
      <div className="grid max-w-[1600px] gap-5 md:gap-10 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 ">
        {products.map((product: any) => (
          <Product key={product.ID} product={product} />
        ))}
      </div>
    </div>
  );
};
export default ProductBrowser;
