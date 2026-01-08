import { useState, FC, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';

interface sendmailProps {
  message: string;
  closeModal: () => void;
}

const SendMail: FC<sendmailProps> = ({ closeModal, message }) => {
  const [loading, setLoading] = useState(false);
  const [contactLists, setContactLists] = useState<Array<any>>([]);
  const [pressLists, setPressLists] = useState<Array<any>>([]);
  const [selectedContactLists, setSelectedContactLists] = useState<Array<any>>(
    []
  );
  const [selectedPressLists, setSelectedPressLists] = useState<Array<any>>([]);
  const [allPressLists, setAllPressLists] = useState<any>([]);
  const [allContactLists, setAllContactLists] = useState<any>([]);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showPressListMenu, setShowPressListMenu] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hide, setHide] = useState(false);
  const [subject, setSubject] = useState('');
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');
    if (subject === '') {
      setError('Subject is required');
      setLoading(false);
      return;
    }
    if (selectedContactLists.length === 0 && selectedPressLists.length === 0) {
      setError('Select at least one list');
      setLoading(false);
      return;
    }
    //ask if they are sure
    const confirmSend = window.confirm(
      'Are you sure you want to send this email to the selected contact lists?'
    );
    if (!confirmSend) {
      setLoading(false);
      return;
    }
    const contactListArray = selectedContactLists.map((list) => list.ID);
    const pressListArray = selectedPressLists.map((list) => list.ID);

    if (storedJWT) {
      await fetch(process.env.REACT_APP_API_URL + '/send-emails.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          contact_lists: contactListArray,
          press_lists: pressListArray,
          subject,
          message,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.message === 'success') {
            setSuccess('Mail sent successfully');
            setContactLists([]);
            setPressLists([]);
            setHide(true);
          } else if (data.error) {
            setError(data.error);
          }
          setLoading(false);
        })
        .catch((e) => {
          console.log(e);
          setError('Failed, try again');
          setLoading(false);
        });
    } else {
      console.log('not logged in');
      localStorage.clear();
      context?.updateLoginStatus(false);
      navigate('/login');
    }
  };
  const getContactLists = async () => {
    const storedJWT = localStorage.getItem('jwt');

    await fetch(process.env.REACT_APP_API_URL + '/get-contact-lists.php', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setContactLists(data);
        setAllContactLists(data);
        setLoading(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
        setLoading(false);
      });
  };
  const getPressLists = async () => {
    const storedJWT = localStorage.getItem('jwt');

    await fetch(process.env.REACT_APP_API_URL + '/get-press-lists.php', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPressLists(data);
        setAllPressLists(data);
        setLoading(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
        setLoading(false);
      });
  };
  const selectListItem = (item: any) => {
    if (!selectedContactLists.includes(item)) {
      setSelectedContactLists([...selectedContactLists, item]);
      //remove from groups menu
      setContactLists(contactLists.filter((list: any) => list.ID !== item.ID));
    }
    setShowListMenu(false);
  };
  const selectPressItem = (item: any) => {
    if (!selectedPressLists.includes(item)) {
      setSelectedPressLists([...selectedPressLists, item]);
      //remove from groups menu
      setPressLists(pressLists.filter((list: any) => list.ID !== item.ID));
    }
    setShowPressListMenu(false);
  };

  const handleRemoveList = (listId: number) => {
    setSelectedContactLists(
      selectedContactLists.filter((list: any) => list.ID !== listId)
    );
    //add back to groups menu
    setContactLists([
      ...contactLists,
      allContactLists.find((list: any) => list.ID === listId),
    ]);
    setShowListMenu(false);
  };
  const handleRemovePress = (listId: number) => {
    setSelectedPressLists(
      selectedPressLists.filter((list: any) => list.ID !== listId)
    );
    //add back to groups menu
    setPressLists([
      ...pressLists,
      allPressLists.find((list: any) => list.ID === listId),
    ]);
    setShowPressListMenu(false);
  };
  const togglePressListMenu = () => {
    setShowPressListMenu(!showListMenu);
  };
  const toggleListMenu = () => {
    setShowListMenu(!showListMenu);
  };
  useEffect(() => {
    getContactLists();
    getPressLists();
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contactListRef.current &&
        !contactListRef.current.contains(event.target as Node)
      ) {
        setShowListMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    const handleClickOutside2 = (event: MouseEvent) => {
      if (
        pressListRef.current &&
        !pressListRef.current.contains(event.target as Node)
      ) {
        setShowPressListMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside2);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside2);
    };
  }, []);

  const pressListRef = useRef<HTMLDivElement>(null);
  const contactListRef = useRef<HTMLDivElement>(null);

  return (
    <div className="inline-block max-w-[450px] w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Send e-mail</h1>
        <svg
          onClick={closeModal}
          className="cursor-pointer"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.40918 1.43213L13.9192 13.9421"
            stroke="#0C150A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.9189 1.43213L1.40895 13.9421"
            stroke="#0C150A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!hide && (
        <div>
          <div>
            <label
              htmlFor="subject"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div className="mt-4 mb-2">
            <label
              htmlFor="contact-list"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Contact lists
            </label>
            <div className="mt-1" id="contact-list" ref={contactListRef}>
              <div className="relative  w-full cursor-pointer bg-shade border-gray-200 border min-h-[43px] rounded-md">
                <div
                  className="relative w-full cursor-pointer"
                  onClick={toggleListMenu}
                >
                  {selectedContactLists.length === 0 && (
                    <p className="absolute top-0 left-0 w-full px-4 py-2.5 text-sm text-gray-500">
                      Select contact lists
                    </p>
                  )}
                  <svg
                    className="absolute w-5 h-5 p-1 top-3 right-4"
                    viewBox="0 0 14 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.30859 1.38867L6.85208 6.93184L12.3953 1.38867"
                      stroke="#969795"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="relative flex flex-wrap p-1">
                  <div
                    className="absolute w-full h-full"
                    onClick={toggleListMenu}
                  ></div>
                  {selectedContactLists.length > 0 &&
                    selectedContactLists.map((list: any) => {
                      return (
                        <div key={`selected-contact-list-${list.ID}`}>
                          <div className="relative flex items-center px-2 m-1 bg-white border border-gray-200 rounded text-default">
                            <span className="text-sm ">{list.name}</span>
                            <button
                              type="button"
                              className="mb-1 ml-2 text-red-400"
                              onClick={() => handleRemoveList(list.ID)}
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {showListMenu && (
                  <div className="relative z-10 -top-1">
                    <div className="absolute grid w-full px-1 py-1 rounded-br-md rounded-bl-md bg-shade">
                      {contactLists.length > 0 &&
                        contactLists.map((item: any) => {
                          return (
                            <div
                              onClick={() => selectListItem(item)}
                              key={`contact-list-${item.ID}`}
                              className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-200"
                            >
                              <label className="text-sm text-gray-700 cursor-pointer">
                                {item.name}
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>{' '}
          </div>

          {/* <div className="mt-1">
            {contactLists.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contactLists.map((list, index) => (
                  <a
                    key={index}
                    onClick={() => toggleContactList(list.ID)}
                    className={`flex cursor-pointer hover:opacity-90 text-xs items-center px-3 py-1 text-sm font-medium text-white rounded-full ${
                      selectedContactLists.includes(list.ID)
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                    }`}
                  >
                    {list.name}
                  </a>
                ))}
              </div>
            )}
            {pressLists.length > 0 && (
              <>
                <div className="w-full h-px my-4 bg-slate-100"></div>
                <div className="flex flex-wrap gap-2 ">
                  {pressLists.map((list, index) => (
                    <a
                      key={index}
                      onClick={() => togglePressList(list.ID)}
                      className={`flex cursor-pointer hover:opacity-90 text-xs items-center px-3 py-1 text-sm font-medium text-white rounded-full ${
                        selectedPressLists.includes(list.ID)
                          ? 'bg-green-500'
                          : 'bg-slate-400'
                      }`}
                    >
                      {list.name}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div> */}
          <div className="mt-4 mb-2">
            <label
              htmlFor="press-list"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Press lists
            </label>
            <div className="mt-1" id="press-list" ref={pressListRef}>
              <div className="relative  w-full cursor-pointer bg-shade border-gray-200 border min-h-[43px] rounded-md">
                <div
                  className="relative w-full cursor-pointer"
                  onClick={togglePressListMenu}
                >
                  {selectedPressLists.length === 0 && (
                    <p className="absolute top-0 left-0 w-full px-4 py-2.5 text-sm text-gray-500">
                      Select press lists
                    </p>
                  )}
                  <svg
                    className="absolute w-5 h-5 p-1 top-3 right-4"
                    viewBox="0 0 14 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.30859 1.38867L6.85208 6.93184L12.3953 1.38867"
                      stroke="#969795"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="relative flex flex-wrap p-1">
                  <div
                    className="absolute w-full h-full"
                    onClick={togglePressListMenu}
                  ></div>
                  {selectedPressLists.length > 0 &&
                    selectedPressLists.map((list: any) => {
                      return (
                        <div key={`selected-press-list-${list.ID}`}>
                          <div className="relative flex items-center px-2 m-1 bg-white border border-gray-200 rounded text-default">
                            <span className="text-sm ">{list.name}</span>
                            <button
                              type="button"
                              className="mb-1 ml-2 text-red-400"
                              onClick={() => handleRemovePress(list.ID)}
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {showPressListMenu && (
                  <div className="relative z-10 -top-1">
                    <div className="absolute grid w-full px-1 py-1 rounded-br-md rounded-bl-md bg-shade">
                      {pressLists.length > 0 &&
                        pressLists.map((item: any) => {
                          return (
                            <div
                              onClick={() => selectPressItem(item)}
                              key={`press-list-${item.ID}`}
                              className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-200"
                            >
                              <label className="text-sm text-gray-700 cursor-pointer">
                                {item.name}
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>{' '}
          </div>

          <div className="mt-7">
            {loading ? (
              <div className="flex justify-center">
                <svg
                  className="inline-blockmt-5 w-9 h-9 text-accent animate-spin"
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
                type="submit"
                onClick={handleSubmit}
                className="flex justify-center w-auto px-6 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Send
              </button>
            )}
          </div>
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      <p className="mt-2 text-sm font-medium text-green-600">{success}</p>
    </div>
  );
};
export default SendMail;
