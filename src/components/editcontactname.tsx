import type { FC } from 'react';
import { ChangeEvent, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';
import axios from 'axios';

interface editContactNameProps {
  refresh: () => void;
  contact: any;
  closeModal: () => void;
}

const EditContactName: FC<editContactNameProps> = ({
  refresh,
  contact,
  closeModal,
}) => {
  const [loading, setLoading] = useState(false);

  const [firstname, setFirstname] = useState(contact.firstname);
  const [lastname, setLastname] = useState(contact.lastname);

  const [title, setTitle] = useState(contact.title);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [previewImage, setPreviewImage] = useState<string | null>(
    'data:image/jpeg;base64,' + contact.base64
  );

  const context = useContext(AppContext);

  const navigate = useNavigate();

  const refreshList = () => {
    refresh();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      if (filesArray.length > 0) {
        const file = filesArray[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    }
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  const emptyForm = () => {
    setFirstname('');
    setLastname('');
    setTitle('');

    setSelectedFiles([]);
    setPreviewImage(null);
    //clear input file #image
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const updateContact = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('image', file); // Use "files[]" to handle multiple files
    });
    formData.append('id', contact.ID);
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('title', title);

    //check if any field is not empty
    if (
      firstname === '' &&
      lastname === '' &&
      title === '' &&
      selectedFiles.length === 0
    ) {
      setError('At least one field is required');
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
            //emptyForm();
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
      <div className="space-y-3">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="firstname"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              First name
            </label>

            <input
              id="firstname"
              name="firstname"
              type="text"
              required
              placeholder="First name"
              value={firstname}
              onChange={(event) => setFirstname(event.target.value)}
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
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
              id="lastname"
              name="lastname"
              placeholder="Last name"
              type="text"
              required
              value={lastname}
              onChange={(event) => setLastname(event.target.value)}
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            />
          </div>

          <div className="col-span-2">
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="folder-image"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Choose an image
          </label>

          <div
            style={{
              backgroundImage: `url(${previewImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className={`
       relative cursor-pointer grid content-center bg-shade w-full py-20 px-5 h-[100px] text-center  border border-gray-400 border-dashed rounded-md`}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-opacity-70 bg-shade" />
            <div className="relative">
              <svg
                viewBox="0 0 28 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block mx-auto mb-2 w-7 h-7"
              >
                <path
                  d="M27.2206 10.2545V27.2907C27.2206 28.9187 25.9081 30.2402 24.2878 30.2402H4.42786C2.80911 30.2402 1.49512 28.9203 1.49512 27.2907V3.81033C1.49512 2.18079 2.80758 0.86084 4.42786 0.86084H17.92C18.6965 0.86084 19.4423 1.17196 19.989 1.72643L26.3722 8.18605C26.9158 8.7359 27.2206 9.47982 27.2206 10.2545Z"
                  stroke="#0C150A"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M26.9514 9.17939L20.7858 9.09468C19.5943 9.09468 18.6279 8.12281 18.6279 6.92453V0.962402"
                  stroke="#0C150A"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M14.0791 21.5485V11.585"
                  stroke="#0C150A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.9199 15.5495L14.0916 11.4834L17.3413 15.5495"
                  stroke="#0C150A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className="mb-1 text-sm">
                <span className="underline">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-xs text-gray-400 md:text-sm">
                Max file size 3MB
              </p>
            </div>
            <input
              className="absolute w-full h-full opacity-0 cursor-pointer"
              type="file"
              name="image"
              onChange={handleFileChange}
            />
          </div>
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
    </div>
  );
};

export default EditContactName;
