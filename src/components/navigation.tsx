import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../utils/appContext';

const Navigation = () => {
  const context = useContext(AppContext);
  const [show, setShow] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );

  const [navigation, setNavigation] = useState([
    { name: 'Dashboard', href: '/' },
  ]);
  const [activePage, setActivePage] = useState('');

  useEffect(() => {
    setActivePage(location.pathname.split('/')[1]);
  }, [location]);

  const roles = JSON.parse(user.groups || '[]');

  useEffect(() => {
    const newNavigation = [
      { name: 'Home', href: '/' },
      { name: 'Files', href: '/files' },
      { name: 'Press releases', href: '/press-releases' },
    ];

    if (roles.includes(0) || roles.includes(1)) {
      //push two items to the array

      newNavigation.push(
        {
          name: 'Users',
          href: '/users',
        },
        { name: 'Contacts', href: '/contacts' },
        { name: 'Mail', href: '/email' }
      );
    }

    if (roles.includes(0)) {
      newNavigation.push({ name: 'Bin', href: '/bin' });
    }

    setNavigation(newNavigation);
    setShow(true);
  }, []);

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  return (
    <>
      <div className="px-5 lg:px-20 md:px-10">
        {show && (
          <div className="container relative z-30 w-full py-2 mx-auto fade-in md:py-10 ">
            <div className="flex justify-between">
              <div>
                <h1
                  onClick={() => navigate('/')}
                  className="text-2xl cursor-pointer"
                >
                    DonkeyComm
                </h1>
              </div>

              <nav className="items-center hidden lg:grid">
                <ul
                  role="list"
                  className="flex items-center justify-center lg:gap-7 "
                >
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        onClick={() => {
                          navigate(item.href);
                          if ('/' + activePage === item.href) {
                            window.location.reload();
                          }
                        }}
                        className={`${
                          '/' + activePage === item.href
                            ? 'text-gray-400'
                            : ' text-default'
                        }
                  cursor-pointer text-sm transition-all`}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="items-center hidden lg:flex">
                {user?.firstname ? (
                  <>
                    <p
                      className="hidden text-xs font-medium leading-6 md:block md:text-sm "
                      aria-hidden="true"
                    >
                      {user?.firstname} {user?.lastname}
                    </p>

                    <a
                      onClick={logout}
                      className={`cursor-pointer hover:text-slate-500
                    group  gap-x-2 p-2 text-sm leading-6 flex justify-center lg:justify-start items-center`}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 8 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.26366 1.5929C6.43787 2.08954 7.2627 3.25252 7.2627 4.60768C7.2627 6.41455 5.79773 7.88076 3.98961 7.88076C2.18149 7.88076 0.717773 6.41455 0.717773 4.60768C0.717773 3.26625 1.52388 2.11449 2.67938 1.60912"
                          stroke="#0C150A"
                          strokeWidth="0.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.99365 0.374512V4.73571"
                          stroke="#0C150A"
                          strokeWidth="0.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className={`cursor-pointer hover:text-slate-500
                    group  gap-x-2 p-2 text-sm leading-6 flex justify-center lg:justify-start items-center`}
                  >
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center justify-center rounded-md outline-none focus:outline-none focus:ring-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showMobileMenu ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showMobileMenu && (
        <div className="fixed top-0 right-0 z-20 grid content-center w-1/2 h-screen p-10 bg-white md:w-auto">
          <nav>
            <ul role="list" className="grid items-center gap-5 text-right ">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    onClick={() => {
                      navigate(item.href);
                      if ('/' + activePage === item.href) {
                        window.location.reload();
                      }
                    }}
                    className={`${
                      '/' + activePage === item.href
                        ? 'bg-[#fffefe] '
                        : ' hover:bg-[#fffefe]'
                    }
                  cursor-pointer transition-all`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center justify-end gap-2 mt-10">
            {user?.firstname ? (
              <>
                {' '}
                <p
                  className="hidden text-xs font-medium leading-6 md:block md:text-sm "
                  aria-hidden="true"
                >
                  {user?.firstname} {user?.lastname}
                </p>
                <a
                  onClick={logout}
                  className={`cursor-pointer hover:text-slate-500 group gap-x-2 text-sm leading-6 flex justify-center lg:justify-start items-center`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 8 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.26366 1.5929C6.43787 2.08954 7.2627 3.25252 7.2627 4.60768C7.2627 6.41455 5.79773 7.88076 3.98961 7.88076C2.18149 7.88076 0.717773 6.41455 0.717773 4.60768C0.717773 3.26625 1.52388 2.11449 2.67938 1.60912"
                      stroke="#0C150A"
                      strokeWidth="0.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.99365 0.374512V4.73571"
                      stroke="#0C150A"
                      strokeWidth="0.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className={`cursor-pointer hover:text-slate-500
                    group  gap-x-2  text-sm leading-6 flex justify-center lg:justify-start items-center`}
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default Navigation;
