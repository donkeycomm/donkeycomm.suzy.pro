import type { FC } from 'react';
import { useState } from 'react';
interface groupProps {
  list: any;
}

const ContactListItem: FC<groupProps> = ({ list }) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [hideItem, setHideItem] = useState(false);

  const deleteList = async (id: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this list?'
    );
    if (!confirmDelete) {
      return;
    }
    setLoadingDelete(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/delete-contact-list.php', {
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
          if (data.message === 'success') {
            setHideItem(true);
          } else if (data.error) {
            alert(data.error);
            setLoadingDelete(false);
          } else {
            alert('Failed, try again');
            setLoadingDelete(false);
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          alert(error);
          setLoadingDelete(false);
        }));
  };

  return (
    !hideItem && (
      <div className="flex items-center justify-between border-b border-gray-200 fade-in ">
        <div>
          <p className="px-3 py-2 overflow-hidden text-sm overflow-ellipsis">
            {list.name}
          </p>
        </div>

        <div className="flex items-center justify-end">
          {loadingDelete ? (
            <svg
              className={` w-5 h-5 animate-spin `}
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
          ) : (
            <svg
              onClick={() => deleteList(list.ID)}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      </div>
    )
  );
};
export default ContactListItem;
