import type { FC } from 'react';
import { useEffect, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../components/icons';
import BinBrowser from '../components/binbrowser';
import Footer from '../components/footer';

interface BinProps {}
const Bin: FC<BinProps> = ({}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const context = useContext(AppContext);
  const navigate = useNavigate();

  //parse object to JSON

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

  return (
    <>
      <div className="px-5 lg:px-20 md:px-10">
        <div className="container min-h-screen mx-auto">
          <BinBrowser />
        </div>{' '}
      </div>
      <Footer />
    </>
  );
};
export default Bin;
