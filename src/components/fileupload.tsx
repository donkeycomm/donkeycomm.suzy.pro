import React, { useState, ChangeEvent, useContext, useEffect } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FileUploadState {
  selectedFile: File | null;
}
interface FileUploadProps {
  folderPath: string;
  updateFolder: () => void;
  groups: Array<any>;
  toggleCreateFileModal: () => void;
}
const FileUpload: React.FC<FileUploadProps> = ({
  folderPath,
  updateFolder,
  groups,
  toggleCreateFileModal,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [error, setError] = useState(``);
  const [success, setSuccess] = useState(``);
  const [loading, setLoading] = useState(false);

  const [selectedGroups, setSelectedGroups] = useState<Array<any>>([]);
  const [groupsMenu, setGroupsMenu] = useState<Array<any>>(groups);
  const [uploadProgress, setUploadProgress] = useState<any>(0);
  const [showGroupsMenu, setShowGroupsMenu] = useState(false);
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const refresh = () => {
    setSelectedFiles([]);
    setSelectedGroups([]);
    setUploadProgress(0);
    // empty the input file
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput.value = '';
    updateFolder();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };
  const handleFileUpload = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const storedJWT = localStorage.getItem('jwt');
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files[]', file); // Use "files[]" to handle multiple files
      });
      //convert array to string
      console.log('selectedGroups', selectedGroups);
      let groupIds = selectedGroups.map((group) => group.ID);
      //extract id from selectedGroups array

      formData.append('access_level', groupIds.join(','));
      formData.append('folder_path', folderPath);

      try {
        await axios
          .post(process.env.REACT_APP_API_URL + '/upload-file.php', formData, {
            headers: {
              Authorization: 'Bearer ' + storedJWT,
            },
            onUploadProgress: (p) => {
              //set upload progress in %
              if (p.total) {
                const percentCompleted = Math.round((p.loaded * 100) / p.total);
                setUploadProgress(percentCompleted);
              }
            },
          })
          .then((response) => {
            if (response.status === 401) {
              // Unauthorized or token expired
              logout();
              return;
            }
            if (response.data === 'Error decoding token: Expired token') {
              logout();
            }
            const jsonData = response.data;

            setLoading(false);
            if (jsonData.error && jsonData.error.length > 0) {
              setError(jsonData.error.join('<br/>'));
            } else if (jsonData.success && jsonData.success.length > 0) {
              setSuccess('Files uploaded successfully'); // Join success messages with newlines

              refresh();
            } else {
              setError('Something went wrong, please try again.');
            }
          });
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Error uploading file');
        setLoading(false);
      }
    } else {
      setError('Please select a file to upload.');
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
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
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  const removeFile = (fileName: string) => {
    const newFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(newFiles);
  };

  return (
    <div className="inline-block w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Upload files</h1>
        <svg
          onClick={toggleCreateFileModal}
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
      <div className="relative cursor-pointer grid content-center w-full py-20 px-5 h-[100px] text-center bg-shade border border-gray-400 border-dashed rounded-md">
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
          <span className="underline">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 md:text-sm">Max filesize 200MB</p>
        <input
          className="absolute w-full h-full opacity-0 cursor-pointer"
          type="file"
          name="files[]"
          multiple
          onChange={handleFileChange}
        />
      </div>
      {loading && (
        <div className="relative h-2 mt-3 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-shade"></div>
          <div
            style={{ width: `${uploadProgress}%` }}
            className="absolute inset-0 transition-all duration-500 ease-out bg-accent"
          ></div>
        </div>
      )}
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
      {selectedFiles.length > 0 && (
        <div className="mt-5 overflow-y-scroll max-h-[150px]">
          {selectedFiles.map((file, index) => {
            return (
              <p key={`file-${index}`} className="flex items-center text-xs ">
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
                    {file.name}
                  </span>
                </span>

                <span className="ml-2 rounded-lg bg-shade p-0.5">
                  {formatBytes(file.size)}
                </span>
                <button
                  type="button"
                  className="ml-2 text-[18px] text-gray-500"
                  onClick={() => removeFile(file.name)}
                >
                  &times;
                </button>
              </p>
            );
          })}
        </div>
      )}
      <div className="flex justify-between mt-7">
        <div>
          <button
            onClick={refresh}
            className="text-sm text-gray-400 outline-none"
          >
            Reset to default
          </button>
        </div>
        <div>
          <div className="flex items-center justify-end gap-7">
            <button
              onClick={toggleCreateFileModal}
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
                onClick={handleFileUpload}
              >
                Upload
              </button>
            )}
          </div>
        </div>
      </div>

      <p
        className="mt-2 text-sm font-medium text-green-600"
        dangerouslySetInnerHTML={{ __html: success }}
      />
      <p
        className="mt-2 text-sm font-medium text-red-600"
        dangerouslySetInnerHTML={{ __html: error }}
      />
    </div>
  );
};

export default FileUpload;
