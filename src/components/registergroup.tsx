import type { FC } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';

interface groupProps {
  refresh: () => void;
  toggleRegisterGroupModal: () => void;
}

const RegisterGroup: FC<groupProps> = ({
  refresh,
  toggleRegisterGroupModal,
}) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [colour, setColour] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const context = useContext(AppContext);
  const navigate = useNavigate();
  const refreshList = () => {
    refresh();
  };
  const registerGroup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');

    if (storedJWT) {
      await fetch(process.env.REACT_APP_API_URL + '/register-group.php', {
        body: JSON.stringify({
          name,
          colour,
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
          if (data.message == 'Group added successfully') {
            setSuccess(data.message);
            clearForm();
            refreshList();
          } else if (data.error == 'Name already exists') {
            setError('group already registered');
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

  const clearForm = () => {
    setName('');
    setColour('');
  };

  // Function to generate a random hex color
  const generateRandomColor = () => {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  };
  // UseEffect to set the default color when the component mounts
  useEffect(() => {
    setColour(generateRandomColor());
  }, []);

  return (
    <div className="inline-block w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Register group</h1>
        <svg
          onClick={toggleRegisterGroupModal}
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

      <div className="grid gap-5 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="lg:col-span-1">
          <label
            htmlFor="colour"
            className="block text-sm font-medium text-gray-700"
          >
            Colour
          </label>
          <div className="py-1 mt-1">
            <div className="relative inline-block overflow-hidden rounded-full w-9 h-9">
              <input
                id="colour"
                name="colour"
                type="color"
                required
                value={colour}
                onChange={(event) => setColour(event.target.value)}
                className="block px-1 -mt-2 -ml-2 overflow-hidden appearance-none cursor-pointer w-14 h-14 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-7">
        <div className="grid content-center">
          <button
            onClick={clearForm}
            className="text-sm text-gray-400 outline-none"
          >
            Reset to default
          </button>
        </div>
        <div>
          <div className="flex items-center justify-end gap-7">
            <button
              onClick={toggleRegisterGroupModal}
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
                onClick={registerGroup}
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      <p className="mt-2 text-sm font-medium text-green-600">{success}</p>
    </div>
  );
};

export default RegisterGroup;
