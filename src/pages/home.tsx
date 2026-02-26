import type { FC } from 'react';
import React, { useEffect, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../components/footer';
import CollectionsSwiper from '../components/collectionsswiper';
import SearchFilesHome from '../components/searchfileshome';
import GallerySwiper from '../components/galleryswiper';
import BrandingBrowser from '../components/brandingbrowser';
import PressReleaseHome from '../components/pressreleasehome';

//files interface
interface filesProps {}
const Home: FC<filesProps> = ({}) => {
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [visitorName, setVisitorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [folderPath, setFolderPath] = useState<string>('/');
  const [counter, setCounter] = useState(0);
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Array<any>>([]);
  const [pressReleases, setPressReleases] = useState<Array<any>>([]);
  const [brandingPath, setBrandingPath] = useState<string>('/branding/logo');

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

  const getgroups = async () => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-all-groups.php', {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: 'Bearer ' + storedJWT,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        //check if data is an array
        if (!Array.isArray(data)) {
          return;
        }
        setGroups(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const getPressReleases = async () => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-pressreleases.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: 'Bearer ' + storedJWT,
      },
      body: JSON.stringify({ limit: 2 }),
    })
      .then((response) => response.json())
      .then((data) => {
        //check if data is an array
        if (!Array.isArray(data)) {
          return;
        }
        setPressReleases(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    //checkStatus();
    if (user.groups?.includes(0) || user.groups?.includes(1)) {
      getgroups();
    }
    user.firstname && setVisitorName(user.firstname);
    getPressReleases();
    setPageLoaded(true);
  }, []);

  const roles = JSON.parse(user.groups || '[]');
  const galleryArray = [
    '/gallery/sample-image-1.jpg',
    '/gallery/sample-image-2.jpg',
    '/gallery/sample-image-3.jpg',
    '/gallery/sample-image-4.jpg',
  ];
  const collectionsArray = [
    {
      image: '/collections-gallery/sample-image-1.jpg',
      path: '/collections/winter',
      title: 'Winter',
    },
    {
      image: '/collections-gallery/sample-image-2.jpg',
      path: '/collections/summer',
      title: 'Summer',
    },
    {
      image: '/collections-gallery/sample-image-3.jpg',
      path: '/collections/spring',
      title: 'Spring',
    },
    {
      image: '/collections-gallery/sample-image-4.jpg',
      path: '/collections/autumn',
      title: 'Autumn',
    },
  ];
  return (
    pageLoaded && (
      <>
        <div className="px-5 lg:px-20 md:px-10">
          <div className="container mx-auto ">
            <div className="relative ">
              <GallerySwiper images={galleryArray} />
              <div className="absolute z-10 w-full p-5 md:w-auto top-1/2 -translate-y-2/4 left-1/2 -translate-x-2/4">
                <h2 className="text-xl text-center text-white md:text-2xl lg:text-4xl">
                  Welcome{` ` + visitorName},
                  <br />
                  to the Donkeycomm library
                </h2>
                <div className="mt-5">
                  <SearchFilesHome path={folderPath} />
                </div>
              </div>
            </div>
            <div className="my-10 md:my-20 lg:my-20 xl:my-32">
              <h2 className="flex md:mb-7 flex-wrap min-h-[2rem] mb-3 gap-2  items-center text-xl md:text-2xl">
                Products
              </h2>
              <div className="grid gap-5 lg:grid-cols-3 md:gap-7">
                <div
                  onClick={() => {
                    navigate('/files/products/decoration' );
                  }}
                  className="px-8 py-8 rounded-md cursor-pointer bg-shade"
                >
                  <div className="flex justify-start mb-5">
                    <img
                      src="./images/products-decoration.png"
                      className="inline-block max-h-44"
                      alt="Suzy"
                    />
                  </div>
                  <h2 className="mt-3 mb-2 text-xl md:text-2xl">Decoration</h2>
                  <p className="leading-tight text-gray-400 xl:text-lg">
                    Sunt deserunt in culpa qui officia consectetur adipiscing
                    elit, sed
                  </p>
                  <button className="flex items-center gap-2 mt-5 transition cursor-pointer hover:text-gray-500">
                    <span>view more</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mt-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  onClick={() => {
                    navigate('/files/products/indoor' );
                  }}
                  className="p-8 cursor-pointer rounded-md bg-gradient-to-b from-[#3F7658] to-[#4B8968]/90"
                >
                  <h2 className="mb-2 text-xl text-white md:text-2xl">
                    Indoor
                  </h2>
                  <p className="leading-tight text-gray-100 xl:text-lg">
                    Sunt deserunt in culpa qui officia consectetur adipiscing
                    elit, sed
                  </p>
                  <button className="flex items-center gap-2 my-5 text-white transition cursor-pointer hover:text-gray-200">
                    <span>view more</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mt-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </button>
                  <div className="mt-12">
                    <img src="./images/products-indoor.png" alt="Suzy" />
                  </div>
                </div>
                <div
                  onClick={() => {
                    navigate('/files/products/outdoor' );
                  }}
                  className="p-8 rounded-md cursor-pointer bg-shade"
                >
                  <h2 className="mb-2 text-xl md:text-2xl">Outdoor</h2>
                  <p className="leading-tight text-gray-400 xl:text-lg">
                    Sunt deserunt in culpa qui officia consectetur adipiscing
                    elit, sed
                  </p>
                  <button className="flex items-center gap-2 my-5 transition cursor-pointer hover:text-gray-500">
                    <span>view more</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mt-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </button>
                  <div className="flex justify-end">
                    <img
                      src="./images/products-outdoor.png"
                      className="max-h-52"
                      alt="Suzy"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="my-10 md:my-20 lg:my-20 xl:my-32">
              <div className="flex items-center justify-between mb-3 md:mb-7">
                <h2 className="flex flex-wrap min-h-[2rem]  gap-2  items-center text-xl md:text-2xl">
                  Collections
                </h2>
                <button
                  onClick={() => {
                    navigate('/files/collections' );
                  }}
                  className="flex items-center gap-2 text-sm transition cursor-pointer md:text-base hover:text-gray-500"
                >
                  <span>view more</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mt-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                    />
                  </svg>
                </button>
              </div>
              <CollectionsSwiper collections={collectionsArray} />
            </div>
            <div className="my-10 md:my-20 lg:my-20 xl:my-32">
              <div className="grid items-center justify-between grid-cols-3 mb-3 md:mb-7">
                <h2 className="flex  flex-wrap min-h-[2rem] gap-2  items-center text-xl md:text-2xl">
                  Branding
                </h2>
                <div className="flex justify-center ">
                  <div className="items-center hidden border border-gray-200 rounded-full lg:inline-flex">
                    <div>
                      <button
                        onClick={() => setBrandingPath('/branding/logo')}
                        className={`${
                          brandingPath === '/branding/logo'
                            ? 'bg-shade border-gray-200 text-default'
                            : ' text-gray-400 bg-white border-white'
                        } rounded-full text-sm border-l border-r px-4 py-2 transition`}
                      >
                        Logo
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => setBrandingPath('/branding/colours')}
                        className={`${
                          brandingPath === '/branding/colours'
                            ? 'bg-shade border-gray-200 text-default'
                            : ' text-gray-400 bg-white border-white'
                        } rounded-full text-sm border-l border-r px-4 py-2 transition`}
                      >
                        Colours
                      </button>
                    </div>
                    {(roles.includes(0) ||
                      roles.includes(1) ||
                      roles.includes(6)) && (
                      <div>
                        <button
                          onClick={() =>
                            setBrandingPath('/branding/typography')
                          }
                          className={`${
                            brandingPath === '/branding/typography'
                              ? 'bg-shade border-gray-200 text-default'
                              : ' text-gray-400 bg-white border-white'
                          } rounded-full text-sm border-l border-r px-4 py-2 transition`}
                        >
                          Typography
                        </button>
                      </div>
                    )}
                    {(roles.includes(0) ||
                      roles.includes(1) ||
                      roles.includes(6)) && (
                      <div>
                        <button
                          onClick={() =>
                            setBrandingPath('/branding/stationary')
                          }
                          className={`${
                            brandingPath === '/branding/stationary'
                              ? 'bg-shade border-gray-200 text-default'
                              : ' text-gray-400 bg-white border-white'
                          } rounded-full text-sm border-l border-r px-4 py-2 transition`}
                        >
                          Stationary
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      navigate('/files/branding' );
                    }}
                    className="flex items-center gap-2 text-sm transition cursor-pointer md:text-base hover:text-gray-500"
                  >
                    <span>view more</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mt-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mb-5 lg:hidden">
                <div className="inline-flex items-center border border-gray-200 rounded-full">
                  <div>
                    <button
                      onClick={() => setBrandingPath('/branding/logo')}
                      className={`${
                        brandingPath === '/branding/logo'
                          ? 'bg-shade border-gray-200 text-default'
                          : ' text-gray-400 bg-white border-white'
                      } rounded-full text-xs md:text-sm border-l border-r px-3 py-1.5 md:px-4 md:py-2 transition`}
                    >
                      Logo
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setBrandingPath('/branding/colours')}
                      className={`${
                        brandingPath === '/branding/colours'
                          ? 'bg-shade border-gray-200 text-default'
                          : ' text-gray-400 bg-white border-white'
                      } rounded-full text-xs md:text-sm border-l border-r px-3 py-1.5 md:px-4 md:py-2 transition`}
                    >
                      Colours
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setBrandingPath('/branding/typography')}
                      className={`${
                        brandingPath === '/branding/typography'
                          ? 'bg-shade border-gray-200 text-default'
                          : ' text-gray-400 bg-white border-white'
                      } rounded-full text-xs md:text-sm border-l border-r px-3 py-1.5 md:px-4 md:py-2 transition`}
                    >
                      Typography
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setBrandingPath('/branding/stationary')}
                      className={`${
                        brandingPath === '/branding/stationary'
                          ? 'bg-shade border-gray-200 text-default'
                          : ' text-gray-400 bg-white border-white'
                      } rounded-full text-xs md:text-sm border-l border-r px-3 py-1.5 md:px-4 md:py-2 transition`}
                    >
                      Stationary
                    </button>
                  </div>
                </div>
              </div>
              <BrandingBrowser
                folderPath={brandingPath}
                refreshCounter={counter}
                groups={groups}
              />
            </div>
            <div className="my-10 md:my-20 lg:mt-10 lg:mb-20 xl:mt-20 xl:mb-32">
              <div className="flex items-center justify-between mb-3 md:mb-7">
                <h2 className="flex  flex-wrap min-h-[2rem]  gap-2  items-center text-xl md:text-2xl">
                  Press
                </h2>
                <button
                  onClick={() => navigate('/press-releases')}
                  className="flex items-center gap-2 text-sm transition cursor-pointer md:text-base hover:text-gray-500"
                >
                  <span>view more</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mt-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid gap-7 lg:grid-cols-2">
                {pressReleases.map((pressRelease, index) => (
                  <PressReleaseHome
                    pressrelease={pressRelease}
                    key={`pressrelease-${index}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  );
};
export default Home;
