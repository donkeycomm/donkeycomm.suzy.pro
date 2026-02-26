import type { FC } from 'react';
import React, { useEffect, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FileUpload from '../components/fileupload';
import CreateFolder from '../components/createfolder';
import FileBrowser from '../components/filebrowser';
import Footer from '../components/footer';
import { useLocation } from 'react-router-dom';

import FileSats from '../components/filestats';
//files interface
interface filesProps {}
const Files: FC<filesProps> = ({}) => {
  const location = useLocation();
  const receivedData = location.state;
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  let initialPath = '/';
  if (receivedData) {
    initialPath = receivedData;
  }

  const [folderPath, setFolderPath] = useState<string>(initialPath);
  const [counter, setCounter] = useState(0);
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Array<any>>([]);
  const [showUploadFiles, setShowUploadFiles] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const checkStatus = async () => {
    const storedJWT = localStorage.getItem('jwt');

    if (storedJWT) {
      await fetch(process.env.REACT_APP_API_URL + '/check-status.php', {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: 'Bearer ' + storedJWT,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data == 'success') {
            setLoading(false);
          } else {
            localStorage.clear();
            context?.updateLoginStatus(false);
            navigate('/login');
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          localStorage.clear();
          context?.updateLoginStatus(false);
          navigate('/login');
        });
    } else {
      console.log('not logged in');
      localStorage.clear();
      context?.updateLoginStatus(false);
      navigate('/login');
    }
  };
  const updateFolder = () => {
    setCounter((counter) => counter + 1);
  };
  const updateFolderPath = (path: string) => {
    setFolderPath(path);
    setActiveTab(0);
  };
  const getgroups = async () => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-all-groups.php', {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: 'Bearer ' + storedJWT,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        //check if data is an array
        if (!Array.isArray(data)) {
          return;
        }
        setGroups(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const toggleActiveTab = () => {
    setActiveTab((prevTab) => (prevTab === 0 ? 1 : 0));
  };
  const toggleCreateFileModal = () => {
    setShowUploadFiles(!showUploadFiles);
    setShowCreateFolder(false);
  };
  const toggleCreateFolderModal = () => {
    setShowCreateFolder(!showCreateFolder);
    setShowUploadFiles(false);
  };
  useEffect(() => {
    if (showUploadFiles) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showUploadFiles]);

  useEffect(() => {
    if (user.groups?.includes(0) || user.groups?.includes(1)) {
      getgroups();
    }
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    const path = location.pathname
        .replace("/files", "/")
        .replace("//", "/")
    updateFolderPath(path);
  }, [location.pathname]);

  const roles = JSON.parse(user.groups || '[]');

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  return (
    pageLoaded && (
      <>
        <div className="px-5 lg:px-20 md:px-10">
          <div className="container min-h-screen mx-auto">
            {activeTab === 0 ? (
              <>
                {(roles.includes(0) || roles.includes(1)) && (
                  <div className="flex gap-3 py-2 fade-in">
                    <button
                      onClick={toggleCreateFileModal}
                      className="items-center px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
                    >
                      Upload files
                    </button>
                    <button
                      onClick={toggleCreateFolderModal}
                      className="items-center px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
                    >
                      Create folder
                    </button>
                  </div>
                )}
                <FileBrowser
                  toggleActiveTab={toggleActiveTab}
                  folderPath={folderPath}
                  refreshCounter={counter}
                  groups={groups}
                />

                {(roles.includes(0) || roles.includes(1)) &&
                  showUploadFiles && (
                    <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full p-5 bg-opacity-50 md:p-7 bg-default">
                      <div className="w-full md:w-[500px] max-w-full mx-auto">
                        <FileUpload
                          updateFolder={updateFolder}
                          folderPath={folderPath}
                          groups={groups}
                          toggleCreateFileModal={toggleCreateFileModal}
                        />
                      </div>
                    </div>
                  )}
                {(roles.includes(0) || roles.includes(1)) &&
                  showCreateFolder && (
                    <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full p-5 bg-opacity-50 md:p-7 bg-default">
                      <div className="w-full md:w-[600px] max-w-full mx-auto">
                        <CreateFolder
                          folderPath={folderPath}
                          groups={groups}
                          updateFolder={updateFolder}
                          toggleCreateFolderModal={toggleCreateFolderModal}
                        />
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <div className="relative z-10 lg:pb-20 md:pt-10 fade-in">
                <FileSats toggleActiveTab={toggleActiveTab} />
              </div>
            )}
          </div>
        </div>
        <Footer />
      </>
    )
  );
};
export default Files;
