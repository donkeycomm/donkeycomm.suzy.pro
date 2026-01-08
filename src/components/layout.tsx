import React, { FC, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';

import Navigation from '../components/navigation';

//make an infterface for children props
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: FC<LayoutProps> = ({ children }) => {
  const [alertShown, setAlertShown] = useState(false);
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  const checkLoginStatus = async () => {
    const storedJWT = localStorage.getItem('jwt');
    try {
      await fetch(process.env.REACT_APP_API_URL + '/check-status.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data !== 'success' && !alertShown) {
            alert('Session expired. Please login again');
            setAlertShown(true);
            logout();
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
        });
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     checkLoginStatus();
  //   }, 60000);
  //   return () => clearInterval(interval); // Cleanup interval on component unmount
  // }, []);

  return (
    <main className="">
      <div className="fade-in">
        <Navigation />
        {children}
      </div>
    </main>
  );
};
export default Layout;
