import React, { useState, ChangeEvent, useContext, useEffect } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/cartitem';

interface CreateProductProps {}
const Cart: React.FC<CreateProductProps> = ({}) => {
  const [error, setError] = useState(``);
  const [counter, setCounter] = useState(0);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [success, setSuccess] = useState(``);
  const [loading, setLoading] = useState(false);
  //get orderlist from context
  const context = useContext(AppContext);
  const orderList = context?.orderList;
  const emptyOrderList = context?.emptyOrderList;
  const refresh = () => {
    //empty the form
    const form = document.querySelector('form') as HTMLFormElement;
    form.reset();
    setError('');
    setSuccess('');
    alert('Order sent successfully!');
    emptyOrderList && emptyOrderList();
  };
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');
    //get comments
    const comments = (document.getElementById('comments') as HTMLInputElement)
      .value;

    try {
      await fetch(process.env.REACT_APP_API_URL + '/send-order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          user,
          orderList,
          comments,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data === 'success') {
            refresh();
          } else {
            setError('Error sending order');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    } catch (error) {
      console.error('Error:', error);
      setError('Error sending order');
      setLoading(false);
    }
  };

  useEffect(() => {
    setCounter((counter) => counter + 1);
  }, [context]);

  return (
    <form
      onSubmit={submitForm}
      className={`${counter} inline-block w-full pt-6 pr-6 mt-5 md:mt-10 mb-5 bg-white md:mt-5 md:rounded-lg md:shadow-md md:p-6`}
    >
      <h1 className="mb-4 text-xl font-bold text-gray-800">Your order</h1>
      {orderList && orderList.length > 0 ? (
        <>
          {orderList.map((item, index) => (
            <CartItem key={index} item={item} />
          ))}
          <div className="mt-10">
            <textarea
              name="comments"
              id="comments"
              placeholder="Any additional comments?"
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-start mt-5">
              <svg
                className="inline-block w-5 h-5 mr-3 text-accent animate-spin"
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
            <div className="mt-5">
              <button className="inline-flex justify-center w-full px-4 py-2 mt-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Place order
              </button>
            </div>
          )}
          <div className="pt-3">
            <p
              className="text-sm font-medium text-green-600 "
              dangerouslySetInnerHTML={{ __html: success }}
            />

            <p
              className="text-sm font-medium text-red-600 "
              dangerouslySetInnerHTML={{ __html: error }}
            />
          </div>
        </>
      ) : (
        <p className="text-sm font-medium text-indigo-600 ">
          Your cart is empty
        </p>
      )}
    </form>
  );
};

export default Cart;
