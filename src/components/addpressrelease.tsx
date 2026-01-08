import type { FC } from 'react';
import React, {
  useEffect,
  useRef,
  ChangeEvent,
  useState,
  useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';
import axios from 'axios';
import Editor from 'react-simple-wysiwyg';

interface addPressReleaseProps {
  refresh: () => void;
  refreshCounter: number;
  toggleAddPressReleaseModal: () => void;
}

const AddPressRelease: FC<addPressReleaseProps> = ({
  refresh,
  refreshCounter,
  toggleAddPressReleaseModal,
}) => {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const context = useContext(AppContext);
  const navigate = useNavigate();
  const refreshList = () => {
    refresh();
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImages([file]); // Set only one file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImages([]);
      setPreviewImage(null);
    }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFiles([file]); // Set only one file
    } else {
      setSelectedFiles([]);
    }
  };
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  const emptyForm = () => {
    setTitle('');
    setText('');
    setDate('');
    setSelectedFiles([]);
    setPreviewImage(null);
    setError('');
    //clear input file #image
    const imageInput = document.getElementById('image') as HTMLInputElement;
    if (imageInput) {
      imageInput.value = '';
    }
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  const addPressRelease = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');
    const formData = new FormData();
    let fileError = false;

    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        if (image.size <= 3 * 1024 * 1024) {
          // Check if image is below 3MB
          formData.append('image', image);
        } else {
          setError('Image size exceeds 3MB');
          fileError = true;
        }
      });
    } else {
      setError('No image selected');
      fileError = true;
    }

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        if (file.size <= 100 * 1024 * 1024) {
          // Check if file is below 100MB
          formData.append('file', file);
        } else {
          setError('File size exceeds 100MB');
          fileError = true;
        }
      });
    } else {
      setError('No file selected');
      fileError = true;
    }
    if (fileError) {
      setLoading(false);
      return;
    }
    if (title === '' || text === '' || date === '') {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    formData.append('title', title);
    formData.append('text', text);
    formData.append('date', date);

    if (storedJWT) {
      await axios
        .post(
          process.env.REACT_APP_API_URL + '/create-pressrelease.php',
          formData,
          {
            headers: {
              Authorization: 'Bearer ' + storedJWT,
            },
          }
        )
        .then((response: any) => {
          if (response.data === 'Error decoding token: Expired token') {
            logout();
          }
          const jsonData = response.data;

          setLoading(false);
          if (jsonData.error.length > 0) {
            setError(jsonData.error.join('<br/>'));
          } else if (jsonData.success.length > 0) {
            setSuccess('Press release created successfully'); // Join success messages with newlines
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
  const removeFile = (fileName: string) => {
    const newFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(newFiles);
  };
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  return (
    <div className="inline-block w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Add a press release</h1>
        <svg
          onClick={toggleAddPressReleaseModal}
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
          <div>
            <label
              htmlFor="date"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="date"
              name="date"
              placeholder="Date"
              type="text"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="text"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Text
          </label>
          <Editor
            containerProps={{
              style: {
                maxHeight: '200px',
                overflowY: 'scroll',
                background: '#f5f6f4',
              },
            }}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="press-release-image"
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
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="press-release-image"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Add a file
          </label>

          <div
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
                Max file size 100MB
              </p>
            </div>
            <input
              className="absolute w-full h-full opacity-0 cursor-pointer"
              type="file"
              name="file"
              onChange={handleFileChange}
            />
          </div>
          {selectedFiles.length > 0 && (
            <p className="flex items-center mt-1 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3 h-auto text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              <span className="relative max-w-[180px] ">
                <span className="ml-1 overflow-hidden filename-ellipsis">
                  {selectedFiles[0].name}
                </span>
              </span>

              <span className="ml-2 rounded-lg bg-shade p-0.5">
                {formatBytes(selectedFiles[0].size)}
              </span>
              <button
                type="button"
                className="ml-2 text-[18px] mb-1 text-gray-500"
                onClick={() => removeFile(selectedFiles[0].name)}
              >
                &times;
              </button>
            </p>
          )}
        </div>
        <div className="pt-3">
          <div className="flex justify-between mt-7">
            <div className="content-center hidden md:grid">
              <button
                onClick={emptyForm}
                className="text-sm text-gray-400 outline-none"
              >
                Reset to default
              </button>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-7">
              <button
                onClick={toggleAddPressReleaseModal}
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
                  onClick={addPressRelease}
                >
                  Create
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

export default AddPressRelease;
