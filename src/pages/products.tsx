import type { FC } from 'react';
import React, { useEffect, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CreateProduct from '../components/createproduct';
import Cart from '../components/cart';
import ProductBrowser from '../components/productbrowser';
import Footer from '../components/footer';

//files interface
interface filesProps {}
const Products: FC<filesProps> = ({}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [counter, setCounter] = useState(0);

  const context = useContext(AppContext);
  const navigate = useNavigate();
  const updatePage = () => {
    console.log('update folder');
    setCounter((counter) => counter + 1);
  };
  const checkStatus = async () => {
    const storedJWT = localStorage.getItem('jwt');

    if (storedJWT) {
      await fetch(process.env.REACT_APP_API_URL + '/check-status.php', {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: 'Bearer ' + storedJWT,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data == 'success') {
            console.log('success');
            setLoading(false);
          } else {
            localStorage.clear();
            context?.updateLoginStatus(false);
            navigate('/login');
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          localStorage.clear();
          context?.updateLoginStatus(false);
          navigate('/login');
        });
    } else {
      console.log('not logged in');
      localStorage.clear();
      context?.updateLoginStatus(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);
  const roles = JSON.parse(user.roles);
  return (
    <>
      <ProductBrowser updatePage={updatePage} refreshCounter={counter} />
      <div className="grid max-w-3xl gap-5 mb-10 md:gap-10 lg:grid-cols-2 md:mb-0">
        {(roles.includes(0) || roles.includes(1)) && (
          <CreateProduct updatePage={updatePage} />
        )}
        <Cart />
      </div>
      <Footer />
    </>
  );
};
export default Products;
