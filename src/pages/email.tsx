import { useEffect, FC, useState, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import StripoEmailBuilder from '../components/stripo';
import MailStats from '../components/mailstats';
import Icon from '../components/icons';
import Footer from '../components/footer';

const Email: FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
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
  const [activeTab, setActiveTab] = useState(0);
  const toggleActiveTab = () => {
    setActiveTab((prevTab) => (prevTab === 0 ? 1 : 0));
  };
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <>
      <div className="px-5 lg:px-20 md:px-10">
        <div className="container min-h-screen mx-auto">
          <div className="relative block pt-5 mb-10 fade-in md:mb-0 lg:pt-10 ">
            {activeTab === 0 && (
              <StripoEmailBuilder toggleActiveTab={toggleActiveTab} />
            )}
            {activeTab === 1 && <MailStats toggleActiveTab={toggleActiveTab} />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default Email;
