import type { FC } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';

interface registeruserProps {
  groups: Array<any>;
  refresh: () => void;
  toggleRegisterUserModal: () => void;
}

const RegisterUser: FC<registeruserProps> = ({
  refresh,
  toggleRegisterUserModal,
  groups,
}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedGroups, setSelectedGroups] = useState<Array<any>>([]);
  const [groupsMenu, setGroupsMenu] = useState<Array<any>>(groups);
  const [showGroupsMenu, setShowGroupsMenu] = useState(false);

  const context = useContext(AppContext);
  const navigate = useNavigate();

  const refreshList = () => {
    refresh();
  };
  const resetForm = () => {
    setEmail('');
    setFirstname('');
    setLastname('');
    setPhone('');
    setSelectedGroups([]);
    setGroupsMenu(groups);
  };
  const registerUser = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    let groups = selectedGroups.map((group) => group.ID);
    //extract id from selectedGroups array

    const storedJWT = localStorage.getItem('jwt');

    if (
      firstname.trim() === '' ||
      lastname.trim() === '' ||
      phone.trim() === '' ||
      email.trim() === ''
    ) {
      setError('Please fill in all fields');
      setLoading(false);
    } else {
      //check if email is valid
      const emailRegEx = /\S+@\S+\.\S+/;
      if (!emailRegEx.test(email)) {
        setError('Invalid email');
        setLoading(false);
        return;
      }
      if (storedJWT) {
        await fetch(process.env.REACT_APP_API_URL + '/register-user.php', {
          body: JSON.stringify({
            email,
            firstname,
            lastname,
            phone,
            groups,
          }),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          method: 'POST',
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message == 'User registered successfully') {
              setSuccess(data.message);
              clearForm();
              refreshList();
            } else if (data.error == 'Email already exists') {
              setError('User already registered');
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
    }
  };

  const clearForm = () => {
    setEmail('');
    setFirstname('');
    setLastname('');
    setPhone('');
    setSelectedGroups([]);
  };
  const selectGroupItem = (item: any) => {
    if (!selectedGroups.includes(item)) {
      setSelectedGroups([...selectedGroups, item]);
      //remove from groups menu
      setGroupsMenu(groupsMenu.filter((group) => group.ID !== item.ID));
    }
    setShowGroupsMenu(false);
  };

  const handleRemoveGroup = (groupId: number) => {
    setSelectedGroups(selectedGroups.filter((group) => group.ID !== groupId));
    //add back to groups menu
    setGroupsMenu([
      ...groupsMenu,
      groups.find((group) => group.ID === groupId),
    ]);
    setShowGroupsMenu(false);
  };

  const toggleGroupsMenu = () => {
    setShowGroupsMenu(!showGroupsMenu);
  };

  return (
    <div className="inline-block w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Register user</h1>
        <svg
          onClick={toggleRegisterUserModal}
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

      <div className="grid gap-5 mb-3 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstname"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            First name
          </label>
          <input
            className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            id="firstname"
            name="firstname"
            placeholder="First name"
            type="text"
            required
            value={firstname}
            onChange={(event) => setFirstname(event.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="lastname"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Last name
          </label>
          <input
            className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            id="lastname"
            name="lastname"
            placeholder="Last name"
            type="text"
            required
            value={lastname}
            onChange={(event) => setLastname(event.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            E-mail
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <div className="mt-1">
            <input
              id="phone"
              name="phone"
              placeholder="Phone"
              type="text"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 mb-2">
        <label
          htmlFor="access-level"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Groups
        </label>
        <div className="mt-1">
          <div className="relative  w-full cursor-pointer bg-shade border-gray-200 border min-h-[43px] rounded-md">
            <div
              className="relative w-full cursor-pointer"
              onClick={toggleGroupsMenu}
            >
              {selectedGroups.length === 0 && (
                <p className="absolute top-0 left-0 w-full px-4 py-2.5 text-sm text-gray-500">
                  Select groups
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
                onClick={toggleGroupsMenu}
              ></div>
              {selectedGroups.map((selectedGroup) => {
                return (
                  <div key={`selected-group-${selectedGroup.ID}`}>
                    <div
                      style={{ backgroundColor: selectedGroup.colour }}
                      className="relative flex items-center px-2 m-1 text-white bg-blue-500 rounded"
                    >
                      <span className="text-sm ">{selectedGroup.name}</span>
                      <button
                        type="button"
                        className="mb-1 ml-2 text-white "
                        onClick={() => handleRemoveGroup(selectedGroup.ID)}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {showGroupsMenu && (
              <div className="relative z-10 -top-1">
                <div className="absolute grid w-full px-1 py-1 rounded-br-md rounded-bl-md bg-shade">
                  {groupsMenu.map((group) => {
                    return (
                      <div
                        onClick={() => selectGroupItem(group)}
                        key={`group-${group.ID}`}
                        className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-200"
                      >
                        <label className="text-sm text-gray-700 cursor-pointer">
                          {group.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-7">
        <div className="grid content-center">
          <button
            onClick={resetForm}
            className="text-sm text-gray-400 outline-none"
          >
            Reset to default
          </button>
        </div>
        <div>
          <div className="flex items-center justify-end gap-7">
            <button
              onClick={toggleRegisterUserModal}
              className="text-sm outline-none text-default"
            >
              Cancel
            </button>
            {loading ? (
              <div className="flex items-center justify-start">
                <svg
                  className="inline-block w-5 h-5 mr-3 text-accent animate-spin"
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
                <span className="text-sm font-medium text-gray-500">
                  Uploading...
                </span>
              </div>
            ) : (
              <button
                className="inline-flex justify-center w-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                onClick={registerUser}
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-red-400">{error}</p>
      <p className="text-sm text-green-400">{success}</p>
    </div>
  );
};

export default RegisterUser;
