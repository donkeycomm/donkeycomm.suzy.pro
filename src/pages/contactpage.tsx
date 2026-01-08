import { FC, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

import AppContext from '../utils/appContext';

import EditContactPersonalInformation from '../components/editcontactpersonalinformation';
import EditContactDescription from '../components/editcontactdescription';
import Footer from '../components/footer';

const ContactPage: FC = ({}) => {
  //get the product id from the url
  const { id } = useParams<{ id: string }>();
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [contact, setContact] = useState<any>({});
  const [contactList, setContactList] = useState<any>([]);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [visibleModal, setVisibleModal] = useState<number | null>(null);

  const getContact = async (id: number) => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-contact-by-id.php', {
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
        if (data[0]) {
          setContact(data[0]);

          let listids = JSON.parse(data[0].contact_list);

          getContactLists(listids);
        }
        setLoading(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error', error);
        setLoading(false);
      });
  };

  const getContactLists = async (listIds: Array<number>) => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-contact-list-names.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: 'Bearer ' + storedJWT,
      },
      body: JSON.stringify({
        ids: listIds,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setContactList(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  useEffect(() => {
    if (id) {
      getContact(parseInt(id));
    }
  }, []);

  const roles = JSON.parse(user.groups || '[]');

  return (
    <>
      <div className="px-5 lg:px-20 md:px-10">
        <div className="container min-h-screen mx-auto">
          <div className="my-5 md:mt-10 fade-in">
            <button
              className="flex outline-none text-default hover:text-slate-700"
              onClick={() => navigate('/contacts')}
            >
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
                  d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                />
              </svg>
              <span className="ml-1 text-sm">Go back</span>
            </button>
          </div>
          <div className="mb-10 fade-in lg:py-10 md:mb-0 ">
            {loading && (
              <div className="flex justify-center">
                <svg
                  className="inline-block mt-5 w-9 h-9 text-accent animate-spin"
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
            )}

            <div>
              <div className="p-2 mb-5 border border-gray-200 rounded-lg md:p-5">
                <div className="flex items-center justify-between gap-7">
                  <div className="flex items-center gap-7 ">
                    <div className=" w-[100px] h-[100px] relative">
                      {contact.base64 ? (
                        <img
                          src={`data:image/jpeg;base64,${contact.base64}`}
                          alt={contact.firstname + ' ' + contact.lastname}
                          className="object-cover w-full h-full rounded-lg bg-gray-50"
                        />
                      ) : (
                        <img
                          src={`../contact-image-placeholder.jpg`}
                          alt={contact.firstname + ' ' + contact.lastname}
                          className="object-cover w-full h-full rounded-lg bg-gray-50"
                        />
                      )}
                    </div>

                    <div>
                      <h1 className="text-base text-default">
                        {contact.firstname} {contact.lastname}
                      </h1>
                      <p className="max-w-2xl mt-1 text-sm leading-6 text-gray-500">
                        {contact.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 mb-5 border border-gray-200 rounded-lg md:p-5">
                <div className="flex justify-between mb-5">
                  <div>
                    <h2 className="text-xl">Personal information</h2>
                  </div>
                  <div>
                    <button
                      onClick={() => setVisibleModal(1)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-shade transition-bg"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-8">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400">First name</p>
                    <p className="text-gray-700">{contact.firstname}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400">Last name</p>
                    <p className="text-gray-700">{contact.lastname}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400">Email address</p>
                    <p className="text-gray-700">{contact.email}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-gray-700">{contact.phone}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400">Company</p>
                    <p className="text-gray-700">{contact.company}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400">Contact lists</p>
                    <p className="text-gray-700">
                      {contactList.length > 0 &&
                        contactList
                          .map((item: any, index: number) => item.name)
                          .join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2 border border-gray-200 rounded-lg md:p-5">
                <div className="flex justify-between mb-5">
                  <div>
                    <h2 className="text-xl">Notes</h2>
                  </div>
                  <div>
                    <button
                      onClick={() => setVisibleModal(2)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-shade transition-bg"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div
                  className="default-html"
                  dangerouslySetInnerHTML={{ __html: contact?.description }}
                />
              </div>
            </div>
          </div>

          {(roles.includes(0) || roles.includes(1)) && visibleModal === 1 && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full p-5 bg-opacity-50 md:p-7 bg-default">
              <div className="w-full md:w-[600px] max-w-full mx-auto">
                <EditContactPersonalInformation
                  closeModal={() => setVisibleModal(null)}
                  contact={contact}
                  refresh={() => id && getContact(parseInt(id))}
                />
              </div>
            </div>
          )}
          {(roles.includes(0) || roles.includes(1)) && visibleModal === 2 && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full p-5 bg-opacity-50 md:p-7 bg-default">
              <div className="w-full md:w-[600px] max-w-full overflow-hidden mx-auto">
                <EditContactDescription
                  closeModal={() => setVisibleModal(null)}
                  contact={contact}
                  refresh={() => id && getContact(parseInt(id))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default ContactPage;
