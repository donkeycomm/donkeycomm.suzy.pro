import { useState, useContext, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';
interface productProps {
  product: any;
}

const Product: FC<productProps> = ({ product }) => {
  const navigate = useNavigate();
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [published, setPublished] = useState<boolean>(product.published === 1);
  const [loadingButton, setLoadingButton] = useState(false);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [showItem, setShowItem] = useState(true);

  const deleteProduct = async (id: number) => {
    alert('Are you sure you want to delete this product?');
    setLoadingDelete(true);
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/delete-product.php', {
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
        if (data === 'success') {
          setShowItem(false);
        } else {
          alert('Something went wrong, please try again later');
        }

        setLoadingDelete(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error', error);
        setLoadingDelete(false);
      });
  };
  const togglePublish = async (id: number) => {
    setLoadingPublish(true);
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/toggle-publish-product.php', {
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
        if (data === 'success') {
          //set the opposite of published
          setPublished(!published);
        } else {
          alert('Something went wrong, please try again later');
        }

        setLoadingPublish(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error', error);
        alert('Something went wrong, please try again later');
        setLoadingPublish(false);
      });
  };

  const context = useContext(AppContext);

  //add function from context to add product to orderlist
  const addToOrderList = context?.addToOrderList;

  const addToCart = () => {
    setLoadingButton(true);
    addToOrderList && addToOrderList({ product: product, quantity: 1 });
    setLoadingButton(false);
  };
  const roles = JSON.parse(user.roles);
  return (
    showItem &&
    !(!published && !(roles.includes(0) || roles.includes(1))) && (
      <div className="relative rounded-md shadow ">
        {(roles.includes(0) || roles.includes(1)) && (
          <>
            {loadingPublish ? (
              <svg
                className={`absolute -left-2 -top-2 text-default absolute w-6 h-6 animate-spin`}
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
            ) : published ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                onClick={() => togglePublish(product.ID)}
                className="absolute w-8 h-8 px-1 py-0 text-green-500 bg-white rounded-full shadow cursor-pointer hover:text-green-700 -left-3 -top-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                onClick={() => togglePublish(product.ID)}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="absolute w-8 h-8 px-1 py-0 text-gray-400 bg-white rounded-full shadow cursor-pointer hover:text-gray-600 -left-3 -top-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            )}
          </>
        )}

        <div className="flex p-3 group ">
          {(roles.includes(0) || roles.includes(1)) && (
            <>
              {loadingDelete ? (
                <svg
                  className={`absolute right-3 top-3 text-default absolute w-7 h-7 animate-spin`}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#ffffff"
                  className={`absolute -right-2 -top-2 xl:hidden xl:group-hover:inline-block p-1 transition-colors   bg-opacity-50 rounded-md cursor-pointer w-7 h-7  bg-slate-700 hover:bg-red-700 `}
                  onClick={() => deleteProduct(product.ID)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              )}
            </>
          )}
          <div className="w-1/4 h-24 overflow-hidden rounded-md">
            <img
              src={`${
                product.image === 'image-placeholder.jpg'
                  ? 'image-placeholder.jpg'
                  : 'data:image/jpeg;base64,' + product.base64
              }`}
              alt={product.image}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-3/4 pl-5 overflow-hidden">
            <h4 className="mb-1 text-sm max-h-[40px] overflow-hidden overflow-ellipsis whitespace-nowrap">
              {product.title}
            </h4>
            <p className="text-sm">
              {new Intl.NumberFormat('nl-NL', {
                style: 'currency',
                currency: 'EUR',
              }).format(product.price)}{' '}
              <span className="text-xs text-gray-400">
                incl {product.vat}% VAT
              </span>
            </p>
            <div className="flex flex-wrap">
              {loadingButton ? (
                <div className="w-[87px] mt-3 text-center h-auto mr-5">
                  <svg
                    className="inline-block w-4 h-4 text-accent animate-spin"
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
                </div>
              ) : (
                <button
                  onClick={addToCart}
                  className="justify-center inline-block w-auto px-3 py-1 mt-3 mr-5 text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="flex md:hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                    <span>+</span>
                  </span>
                  <span className="hidden md:block">Add to cart</span>
                </button>
              )}
              <div>
                <button
                  onClick={() => navigate(`/products/${product.ID}`)}
                  className="justify-center inline-block w-auto px-3 py-1 mt-3 text-xs font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="block md:hidden">
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
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <span className="hidden md:block">Read more</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default Product;
