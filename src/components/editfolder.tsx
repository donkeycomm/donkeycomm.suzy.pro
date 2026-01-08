import type { FC } from 'react';
import React, { useState, ChangeEvent, useContext, useEffect } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface editFolderProps {
  folder: any;
  closePopup: () => void;
  refresh: () => void;
  groups: Array<any>;
}

const EditFolder: FC<editFolderProps> = ({
  folder,
  closePopup,
  refresh,
  groups,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [previewImage, setPreviewImage] = useState<string | null>(
    'data:image/jpeg;base64,' + folder.base64
  );
  const [groupsMenu, setGroupsMenu] = useState<Array<any>>(groups);
  const [folderError, setFolderError] = useState('');
  const [folderSuccess, setFolderSuccess] = useState('');
  const [showGroupsMenu, setShowGroupsMenu] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Array<any>>([]);
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const updateFolder = async () => {
    setLoading(true);
    setFolderError('');
    setFolderSuccess('');
    const storedJWT = localStorage.getItem('jwt');
    const formData = new FormData();
    if (selectedFiles.length > 0) {
      const image = selectedFiles[0];
      const imageType = image.type;
      if (imageType !== 'image/jpeg' && imageType !== 'image/png') {
        setFolderError('Image must be jpg or png');
        setLoading(false);
        return;
      }
    }
    selectedFiles.forEach((file) => {
      formData.append('image', file); // Use "files[]" to handle multiple files
    });

    //convert array to string
    let groupIds = selectedGroups.map((group) => group.ID);
    //extract id from selectedGroups array
    formData.append('access_level', groupIds.join(','));
    formData.append('folder_name', folderName);
    formData.append('id', folder.ID);
    console.log('access_level', groupIds.join(','));

    if (
      (folderName.trim() === '' && selectedFiles.length === 0) ||
      (folder.folder_name === folderName.trim() && selectedFiles.length === 0)
    ) {
      setFolderError('Set new folder name or image');
      setLoading(false);
    } else {
      await axios
        .post(process.env.REACT_APP_API_URL + '/update-folder.php', formData, {
          headers: {
            Authorization: 'Bearer ' + storedJWT,
          },
        })
        .then((response: any) => {
          const jsonData = response.data;

          if (jsonData.message) {
            setFolderSuccess(jsonData.message);
            if (jsonData.message === 'Folder updated successfully.') {
              setFolderName('');
              setFolderError('');
              setSelectedFiles([]);
              setPreviewImage(null);
              setSelectedGroups([]);
              refresh();
              //wait 2 seconds and close the popup
              setTimeout(() => {
                closePopup();
              }, 2000);
            } else {
              setFolderError(jsonData.response.error);
              setLoading(false);
            }
          } else if (jsonData.error) {
            setFolderError(jsonData.error);
            setLoading(false);
          } else if (jsonData === 'Error decoding token: Expired token') {
            logout();
          }
        })
        .catch((error) => {
          // Handle network or server errors
          let message = 'An unexpected error occurred. Please try again later.';

          if (error.response) {
            // Server responded with a status code outside 2xx
            if (error.response.status === 500) {
              message =
                error.response.data?.error ||
                'Server error. Please try again. Make sure the image is a valid jpg or png.';
            } else if (error.response.status === 403) {
              message = 'You do not have permission to perform this action.';
            } else if (error.response.data?.error) {
              message = error.response.data.error;
            }
          } else if (error.request) {
            // Request was made but no response
            message = 'No response from server. Check your connection.';
          } else {
            // Something else (setup issue, code error, etc.)
            message = error.message;
          }

          setFolderError(message);
          setLoading(false);
        });
    }
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
  const deleteFolder = async (id: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this folder?'
    );
    if (!confirmDelete) {
      return;
    }
    setLoading(true);

    const storedJWT = localStorage.getItem('jwt');

    await fetch(process.env.REACT_APP_API_URL + '/delete-folder.php', {
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
        console.log(data);
        if (data.error) {
          alert(data.error);
          setLoading(false);
        } else {
          refresh();
          setTimeout(() => {
            closePopup();
            setLoading(false);
          }, 2000);
        }
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
        alert(error);
        setLoading(false);
      });
  };
  const selectGroupItem = (item: any) => {
    if (!selectedGroups.includes(item)) {
      setSelectedGroups([...selectedGroups, item]);
      //remove from groups menu
      setGroupsMenu(groupsMenu.filter((group) => group.ID !== item.ID));
    }
    setShowGroupsMenu(false);
  };
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  const toggleGroupsMenu = () => {
    setShowGroupsMenu(!showGroupsMenu);
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
  useEffect(() => {
    let groupsArray: Array<any> = [];
    let accessLevelList = JSON.parse(folder.access_level);
    let groupMenuitems = groups;
    Array.isArray(accessLevelList) &&
      accessLevelList.length > 0 &&
      accessLevelList.map((groupID: number) => {
        groups.map((group) => {
          if (group.ID === groupID) {
            groupsArray.push(group);
          }
        });
      });
    setGroupsMenu(
      groupMenuitems.filter((group) => !groupsArray.includes(group))
    );
    setSelectedGroups(groupsArray);
  }, []);

  return (
    <div
      className={`fade-in relative inline-block md:w-[600px] mx-auto mt-5 bg-white rounded-lg md:shadow-md p-5 md:p-6`}
    >
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Edit folder</h1>
        <svg
          onClick={closePopup}
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
            htmlFor="folder-name"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Folder name
          </label>
          <input
            className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            type="text"
            name="folder-name"
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="groups"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Groups
          </label>
          <div className="relative  w-full cursor-pointer bg-shade border-gray-200 border min-h-[43px] rounded-md">
            <div
              className="relative w-full cursor-pointer"
              onClick={toggleGroupsMenu}
            >
              {selectedGroups.length === 0 && (
                <p className="absolute top-0 left-0 w-full px-4 py-2.5 text-sm text-gray-400">
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
                        className="mb-1 ml-2 text-white"
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
              <div className="relative z-10 ">
                <div className="absolute grid w-full py-1 rounded-br-md rounded-bl-md bg-shade -top-1">
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
      <div className="relative">
        <div className="mt-7">
          <label
            htmlFor="folder-image"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Folder image
          </label>
        </div>
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
        <div className="mt-7">
          {loading ? (
            <svg
              className="inline-block w-8 h-8 text-accent animate-spin"
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
            <div className="flex items-center justify-between">
              <div>
                <button
                  className="text-sm font-medium text-red-700 underline hover:text-red-600 focus:outline-none focus:ring-none"
                  onClick={() => deleteFolder(folder.ID)}
                >
                  Delete folder
                </button>
              </div>
              <div>
                <div className="flex items-center justify-end gap-7">
                  <button
                    onClick={closePopup}
                    className="text-sm outline-none text-default"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex justify-center w-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default focus:outline-none focus:ring-2 focus:ring-none"
                    onClick={updateFolder}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-green-600">
          {folderSuccess}
        </p>
        <p className="mt-2 text-sm font-medium text-red-600">{folderError}</p>
      </div>
    </div>
  );
};

export default EditFolder;
