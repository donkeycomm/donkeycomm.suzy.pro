//create a react functional component in typescript
import { useEffect, useState, useContext, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import User from './user';
import AppContext from '../utils/appContext';
import { get } from 'jquery';

interface userListProps {
  refreshCounter: number;
  groups: Array<any>;
}

const UserList: FC<userListProps> = ({ refreshCounter, groups }) => {
  const [users, setUsers] = useState<Array<any>>([]);
  const [unfilteredUsers, setUnfilteredUsers] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Array<number>>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState('all');
  const [availablePermissions, setAvailablePermissions] = useState<Array<any>>(
    []
  );
  const [searchMessage, setSearchMessage] = useState('');
  const [search, setSearch] = useState('');
  const context = useContext(AppContext);

  const navigate = useNavigate();
  const getUsers = async () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/get-users.php', {
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
          setUsers(data);

          setUnfilteredUsers(data);
          setLoading(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
        }));
  };
  const selectUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      let newItems = selectedUsers.filter((item) => item !== id);
      setSelectedUsers(newItems);
    } else {
      let newItems = [...selectedUsers, id];
      setSelectedUsers(newItems);
    }
  };
  const selectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      let allItems = users.map((user) => user.ID);
      setSelectedUsers(allItems);
    }
    setAllSelected(!allSelected);
  };
  //create the function to create a folder
  const updatePermissionList = (items: Array<any>) => {
    let newPermissions: Array<any> = [];

    Array.isArray(items) &&
      items.length > 0 &&
      items.forEach((item) => {
        let permissions = JSON.parse(item.groups);
        permissions.forEach((permission: any) => {
          if (
            permission > 1 &&
            !newPermissions.some((item) => item.ID === permission)
          ) {
            let obj = groups.find((group) => group.ID === permission);
            if (obj) {
              newPermissions.push(obj);
            }
          }
        });
      });

    // Sort alphabetically
    newPermissions.sort((a, b) => a.name.localeCompare(b.name));

    // Update state
    setAvailablePermissions(newPermissions);
  };
  const filterByGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearch('');
    setSearchMessage('');
    if (e.target.value === 'all') {
      setUsers(unfilteredUsers);
    } else {
      let groupID = parseInt(e.target.value);
      let newUsers = unfilteredUsers.filter((user) => {
        let permissions = JSON.parse(user.groups);

        return permissions.includes(groupID);
      });

      setUsers(newUsers);
    }
    setSelectedPermission(e.target.value);
  };
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  const deleteSelected = async () => {
    const storedJWT = localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (selectedUsers.length > 0) {
      if (
        window.confirm('Are you sure you want to delete the selected users?')
      ) {
        setLoading(true);

        try {
          const promises = selectedUsers.map(async (selectedUser) => {
            const response = await fetch(
              process.env.REACT_APP_API_URL + '/delete-user.php',
              {
                method: 'POST',
                mode: 'cors',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + storedJWT,
                },
                body: JSON.stringify({
                  email: user.email,
                  id: selectedUser,
                }),
              }
            );

            const data = await response.json();
            console.log(data);
            if (data === 'Error decoding token: Expired token') {
              logout();
            }

            if (data.error) {
              alert(data.error);
            } else {
              setSelectedUsers([]);
              setAllSelected(false);
            }
          });

          await Promise.all(promises);
          getUsers();
        } catch (error) {
          console.error('Error deleting users:', error);
        }
      }
    }
  };
  const searchUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    let search = e.target.value;
    setSearch(search);
    setSearchMessage('');

    if (search !== '') {
      setSelectedPermission('all');
      let newUsers = unfilteredUsers.filter((user) => {
        return (
          user.firstname.toLowerCase().includes(search.toLowerCase()) ||
          user.lastname.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      });
      if (newUsers.length === 0) {
        setSearchMessage('No users found');
      } else {
        setUsers(newUsers);
      }
    } else {
      setUsers(unfilteredUsers);
    }
  };
  const emptySearch = () => {
    setSearch('');
    setSearchMessage('');
    setUsers(unfilteredUsers);
    setSelectedPermission('all');
  };

  useEffect(() => {
    getUsers();
  }, [refreshCounter]);

  useEffect(() => {
    updatePermissionList(unfilteredUsers);
  }, [unfilteredUsers]);

  return (
    <div className="fade-in ">
      <div className="pr-2">
        <h1 className="flex flex-wrap min-h-[2rem] mb-2 gap-2  items-center text-xl md:text-2xl">
          Users
        </h1>
      </div>
      <div className="relative items-center justify-between pr-2 mb-3 md:flex md:mb-0 md:pr-7 md:mb-5">
        <div className="flex flex-wrap items-start gap-1 md:order-1">
          <button
            className="flex items-center gap-1 group"
            onClick={() => navigate('/')}
          >
            <span className="text-xs text-gray-400 transition-all md:text-sm group-hover:text-gray-300">
              Home
            </span>
          </button>

          <button className="flex items-center gap-1 ">
            <span className="text-xs text-gray-400 transition-all md:text-sm ">{`>`}</span>
            <span className="text-xs transition-all text-gray-400 md:text-sm max-w-[120px] truncate">
              Users
            </span>
          </button>
        </div>
      </div>
      {Array.isArray(users) && users.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-5 mb-10">
          <div className="relative flex items-center content-center gap-1 text-xs transition-all border rounded-md text-default hover:bg-shade">
            <input
              className="py-2.5 px-3 rounded-md outline-none placeholder-gray-400 rounded-md border-suzy-gray"
              type="text"
              value={search}
              placeholder="Search users"
              onChange={searchUsers}
            />
            <div className="absolute right-1 top-1/2 -translate-y-2/4">
              {search.length > 0 && (
                <svg
                  className="w-4 h-4 cursor-pointer"
                  onClick={emptySearch}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div className="absolute text-xs text-red-700 left-1 -bottom-5">
              <p>{searchMessage}</p>
            </div>
          </div>
          {availablePermissions.length > 0 && (
            <div className="relative flex content-center text-xs transition-all bg-white text-default ">
              <select
                className="text-xs block relative text-gray-500 cursor-pointer bg-none w-full appearance-none hover:bg-shade border py-2.5 pl-3 pr-7 rounded-md outline-none rounded-md border-suzy-gray"
                name="permissions"
                id="permissions"
                value={selectedPermission}
                onChange={filterByGroup}
              >
                <option value="all">All groups</option>
                {availablePermissions.map((permission) => (
                  <option key={permission.ID} value={permission.ID}>
                    {permission.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute w-3 h-3 stroke-gray-400 top-3.5 right-2 pointer-events-none"
                viewBox="0 0 14 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.30859 1.38867L6.85208 6.93184L12.3953 1.38867"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          )}
          {selectedUsers.length > 0 && (
            <button
              className="flex content-center py-2.5 px-3 items-center gap-1 text-xs transition-all rounded-md text-default ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              onClick={deleteSelected}
            >
              <span className="text-gray-500">Delete selected</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                className="w-4 stroke-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
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
          <div className="flex w-full">
            <div className="grid content-center flex-shrink-0 w-[50px]">
              <button
                className={`${
                  allSelected
                    ? 'bg-default border-default'
                    : 'bg-white border-gray-300'
                } grid p-0.5 content-center inline-block w-5 h-5 mr-5 border rounded cursor-pointer `}
                onClick={selectAll}
              >
                <span>
                  {allSelected && (
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
            <div className="px-6 flex-shrink-0 py-3 border-r border-suzy-gray w-[150px]">
              <p className="text-xs text-gray-400 md:text-sm">Last name</p>
            </div>
            <div className="px-6 flex-shrink-0 py-3 border-r border-suzy-gray w-[150px]">
              <p className="text-xs text-gray-400 md:text-sm">First name</p>
            </div>
            <div className="px-6 flex-shrink-0 py-3 border-r border-suzy-gray w-[150px]">
              <p className="text-xs text-gray-400 md:text-sm">Groups</p>
            </div>
            <div className="px-6 flex-shrink-0 py-3 border-r border-suzy-gray w-[150px]">
              <p className="text-xs text-gray-400 md:text-sm">E-mail</p>
            </div>

            <div className="px-6 flex-shrink-0 py-3 border-r border-suzy-gray w-[150px]">
              <p className="text-xs text-gray-400 md:text-sm">Status</p>
            </div>
            <div className="flex-grow px-6 py-3 min-w-[150px]">
              <p className="text-xs text-gray-400 md:text-sm">
                Send activation mail
              </p>
            </div>
          </div>
          {Array.isArray(users) &&
            users.map((user) => {
              return (
                <User
                  selectUser={selectUser}
                  selectedUsers={selectedUsers}
                  key={user.ID}
                  user={user}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};
export default UserList;
