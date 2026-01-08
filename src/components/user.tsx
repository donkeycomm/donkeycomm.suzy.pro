import type { FC } from 'react';
import { useEffect, useState } from 'react';
interface userProps {
  user: any;
  selectedUsers: Array<number>;
  selectUser: Function;
}

const User: FC<userProps> = ({ user, selectedUsers, selectUser }) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingMail, setLoadingMail] = useState(false);
  const [hideItem, setHideItem] = useState(false);
  const [groups, setGroups] = useState([]);

  const deleteUser = async (id: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    );
    if (!confirmDelete) {
      return;
    }
    setLoadingDelete(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/delete-user.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          id: id,
          email: user.email,
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

  const sendActivationMail = async (id: number) => {
    setLoadingMail(true);

    const storedJWT = localStorage.getItem('jwt');

    await fetch(process.env.REACT_APP_API_URL + '/send-activation-mail.php', {
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
          alert('Activation mail sent successfully');
        } else if (data.error) {
          alert(data.error);
        } else {
          alert('Something went wrong, try again.');
        }
        setLoadingMail(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
        alert(error);
        setLoadingMail(false);
      });
  };

  const getgroups = async () => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-groups.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
      body: JSON.stringify({
        groups: user.groups,
      }),
    })
      .then((response) => response.json())
      .then((data: any) => {
        setGroups(data);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
      });
  };
  useEffect(() => {
    getgroups();
  }, []);
  return (
    !hideItem && (
      <div className="flex w-full py-3 border-t border-suzy-gray ">
        <div className="w-[50px] grid content-center flex-shrink-0">
          <button
            className={`${
              selectedUsers.includes(user.ID)
                ? 'bg-default border-default'
                : 'bg-white border-gray-300'
            } grid p-0.5 content-center inline-block w-5 h-5 mr-5 border rounded cursor-pointer `}
            onClick={() => selectUser(user.ID)}
          >
            <span>
              {selectedUsers.includes(user.ID) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              )}
            </span>
          </button>
        </div>
        <div className="grid content-center px-6 flex-shrink-0 w-[150px]">
          <p
            title={user.lastname}
            className="py-2 pr-2 overflow-hidden text-sm overflow-ellipsis"
          >
            {user.lastname}
          </p>
        </div>
        <div className="grid content-center px-6 flex-shrink-0 w-[150px]">
          <p
            title={user.firstname}
            className="py-2 pr-2 overflow-hidden text-sm overflow-ellipsis"
          >
            {user.firstname}
          </p>
        </div>
        <div className="grid content-center px-6 flex-shrink-0 w-[150px]">
          <div className={`relative flex content-center justify-start gap-1 `}>
            {groups?.map((group: any) => (
              <div
                key={`group-colour-${group.ID}`}
                className={`w-3 h-3 rounded-full group/groups  cursor-pointer transition-all relative`}
                style={{ backgroundColor: group.colour }}
              >
                <p className="hidden group-hover/groups:block absolute bottom-4 px-2 py-0.5 rounded bg-white text-xs left-1/2 shadow -translate-x-2/4">
                  {group.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-center px-6 flex-shrink-0 w-[150px]">
          <p
            title={user.email}
            className="py-2 pr-2 overflow-hidden text-sm overflow-ellipsis"
          >
            {user.email}
          </p>
        </div>

        <div className="grid content-center px-6 flex-shrink-0 w-[150px]">
          {user.active == 1 ? (
            <div>
              <p className="inline-block w-auto px-2 py-0.5 text-xs text-green-500 border border-green-500 rounded-full">
                Active
              </p>
            </div>
          ) : (
            <div>
              <p className="inline-block w-auto px-2 py-0.5 text-xs text-red-500 border border-red-500 rounded-full">
                Not active
              </p>
            </div>
          )}
        </div>

        <div className="grid content-center px-6 min-w-[150px]">
          {loadingMail ? (
            <svg
              className={` w-6 h-6 animate-spin`}
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
            <button
              className="flex items-center gap-1 group"
              onClick={() => sendActivationMail(user.ID)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 transition cursor-pointer stroke-gray-400 group-hover:stroke-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <span className="text-xs text-gray-400 group-hover:text-gray-500">
                Send mail
              </span>
            </button>
          )}
        </div>
      </div>
    )
  );
};
export default User;
