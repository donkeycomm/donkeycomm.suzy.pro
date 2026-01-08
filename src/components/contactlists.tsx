//create a react functional component in typescript
import { useEffect, useState, type FC } from 'react';

import ContactListItem from './contactlistitem';

interface groupListProps {
  refresh: () => void;
  toggleManageContactListsModal: () => void;
}

const ContactLists: FC<groupListProps> = ({
  refresh,
  toggleManageContactListsModal,
}) => {
  const [contactLists, setContactLists] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const getLists = async () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/get-contact-lists.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          email: user.email,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setContactLists(data);
          setLoading(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
        }));
  };

  //create the function to create a folder
  useEffect(() => {
    getLists();
  }, [refresh]);

  return (
    <div className="inline-block w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Manage contact lists</h1>
        <svg
          onClick={toggleManageContactListsModal}
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
        <div className="max-h-[60vh] max-w-full relative overflow-x-scroll border-b border-slate-100 pb-5">
          <div className="grid grid-cols-2">
            <div>
              <p className="px-3 mt-1 mb-3 text-xs leading-5 text-gray-500">
                Name
              </p>
            </div>
          </div>
          {Array.isArray(contactLists) &&
            contactLists.map((list) => {
              return <ContactListItem key={list.ID} list={list} />;
            })}
        </div>
      )}
    </div>
  );
};
export default ContactLists;
