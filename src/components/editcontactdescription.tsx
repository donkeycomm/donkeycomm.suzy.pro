import type { FC } from 'react';
import { useRef, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';
import Editor from 'react-simple-wysiwyg';
import axios from 'axios';

interface editDescriptionProps {
  refresh: () => void;
  contact: any;
  closeModal: () => void;
}

const EditContactDescription: FC<editDescriptionProps> = ({
  refresh,
  contact,
  closeModal,
}) => {
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState(contact.description);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const context = useContext(AppContext);

  const navigate = useNavigate();

  const refreshList = () => {
    refresh();
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  const emptyForm = () => {
    setDescription('');
  };

  const updateContact = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');
    const formData = new FormData();
    formData.append('id', contact.ID);
    formData.append('description', description);

    //check if any field is not empty
    if (description === '') {
      setError('Field is required');
      setLoading(false);
      return;
    }
    if (storedJWT) {
      await axios
        .post(process.env.REACT_APP_API_URL + '/update-contact.php', formData, {
          headers: {
            Authorization: 'Bearer ' + storedJWT,
          },
        })
        .then((response: any) => {
          if (response.data === 'Error decoding token: Expired token') {
            logout();
          }
          const jsonData = response.data;

          setLoading(false);
          if (jsonData.error.length > 0) {
            setError(jsonData.error.join('<br/>'));
          } else if (jsonData.success.length > 0) {
            setSuccess('Contact updated successfully'); // Join success messages with newlines
            emptyForm();
            refreshList();
          } else {
            setError('Something went wrong, please try again.');
          }
        })
        .catch((e) => {
          console.log(e);
          setError('Failed, try again');
          setLoading(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error?.response?.data?.error);

          setLoading(false);
        });
    } else {
      console.log('not logged in');
      localStorage.clear();
      context?.updateLoginStatus(false);
      navigate('/login');
    }
  };

  return (
    <div className="inline-block w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Update contact</h1>
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

      <div>
        <label
          htmlFor="description"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <Editor
          containerProps={{
            style: {
              maxHeight: '200px',
              overflowY: 'scroll',
              background: '#f5f6f4',
            },
          }}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="pt-3">
        <div className="flex justify-between mt-7">
          <div className="grid content-center">
            <button
              onClick={emptyForm}
              className="text-sm text-gray-400 outline-none"
            >
              Reset to default
            </button>
          </div>

          <div className="flex items-center justify-end gap-7">
            <button
              onClick={closeModal}
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
                onClick={updateContact}
              >
                Update
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

export default EditContactDescription;
