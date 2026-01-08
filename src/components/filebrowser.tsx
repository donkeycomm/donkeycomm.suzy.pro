import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FileItem from './fileitem';
import FolderItem from './folderitem';
import AppContext from '../utils/appContext';
import SearchFiles from './searchfiles';
interface FileBrowserProps {
  folderPath: string;
  changeFolderPath: (path: string) => void;
  refreshCounter: number;
  groups: Array<any>;
  toggleActiveTab: () => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  folderPath,
  changeFolderPath,
  refreshCounter,
  groups,
  toggleActiveTab,
}) => {
  const viewList = ['small', 'medium', 'large'];
  const [files, setFiles] = useState<Array<any>>([]);
  const [unfilteredFiles, setUnfilteredFiles] = useState<Array<any>>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [folders, setFolders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const [showContent, toggleContent] = useState(false);
  const [view, setView] = useState(viewList[1]);
  const [loadingMoreFiles, setLoadingMoreFiles] = useState(false);
  const [folderError, setFolderError] = useState('');
  const [folderSuccess, setFolderSuccess] = useState('');
  const [pathMenu, setPathMenu] = useState<Array<string>>([]);
  const [folderNames, setFolderNames] = useState<Array<any>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Array<any>>(
    []
  );
  const [folderImage, setFolderImage] = useState('');
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [groupLabels, setGroupLabels] = useState<Array<any>>([]);

  const [activeDownloadMenu, setActiveDownloadMenu] = useState<string | null>(
    null
  );

  const refresh = () => {
    getFolders().then(() => getInitialFiles());
    setFolderSuccess('');
  };

  const fetchData = async () => {
    try {
      toggleContent(false);
      await getFolders();
      await getInitialFiles();
      await getTotalFiles();
      updatePathMenu(folderPath);
      getPathNames(folderPath);
      setFolderSuccess('');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getFolderInfo = async (path: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
      console.log('path', path);
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-folder-by-path.php',
        {
          method: 'POST',
          mode: 'cors',
          headers,
          body: JSON.stringify({
            path,
            email: user.email || null,
          }),
        }
      );

      const data = await response.json();
      console.log(data);
      //check each data item, if a number from the access level is found as an ID in the groups array add the groups array items to the groupLabels array
      let groupItems: Array<any> = [];
      let accessLevels = data.access_level;

      let accessLevelArray = JSON.parse(accessLevels);

      Array.isArray(accessLevelArray) &&
        accessLevelArray.forEach((item: any) => {
          //check if item matches an ID in the groups array, skip 0 and 1
          if (groups.some((group) => group.ID === item && item > 1)) {
            //if it does, add the group to the groupItems array
            groups.forEach((group) => {
              if (group.ID === item) {
                groupItems.push(group);
              }
            });
          }
        });
      setFolderImage(data.base64);
      setGroupLabels(groupItems);

      if (data === 'Error decoding token: Expired token') {
        logout();
      }
    } catch (error) {
      console.error('Error fetching folder:', error);
    }
  };

  const getInitialFiles = async () => {
    setLoading(true);
    setFolderError('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    let thumb = view === 'list' ? 'small' : view;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-folder-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers,
          body: JSON.stringify({
            email: user.email,
            path: folderPath,
            size: thumb,
            page: 0,
          }),
        }
      );

      const data = await response.json();
      setFiles(data);
      setUnfilteredFiles(data);
      setLoading(false);
      toggleContent(true);
      updatePermissionList(data);

      if (data === 'Error decoding token: Expired token') {
        logout();
      }
    } catch (error) {
      console.error('Error fetching initial files:', error);
      setLoading(false);
      toggleContent(true);
    }
  };

  const getFiles = async () => {
    setLoading(true);
    setLoadingMoreFiles(true);
    setFolderError('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    let thumb = view === 'list' ? 'small' : view;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-folder-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers,
          body: JSON.stringify({
            email: user.email,
            path: folderPath,
            size: thumb,
            page: page,
          }),
        }
      );

      const data = await response.json();

      setFiles([...files, ...data]);
      setLoading(false);
      setLoadingMoreFiles(false);
      toggleContent(true);

      if (data === 'Error decoding token: Expired token') {
        logout();
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
      setLoadingMoreFiles(false);
      toggleContent(true);
    }
  };

  const getTotalFiles = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-total-folder-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers,
          body: JSON.stringify({
            email: user.email,
            path: folderPath,
          }),
        }
      );

      const data = await response.json();
      setTotalFiles(data.total);

      if (data === 'Error decoding token: Expired token') {
        logout();
      }
    } catch (error) {
      console.error('Error fetching total files:', error);
      setLoading(false);
    }
  };

  const getFolders = async () => {
    setLoading(true);
    setGroupLabels([]);
    setFolderError('');
    let thumb = view === 'list' || view === 'small' ? 'medium' : view;

    const storedJWT = localStorage.getItem('jwt');

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-folders.php',
        {
          method: 'POST',
          mode: 'cors',
          headers,
          body: JSON.stringify({
            path: folderPath,
            size: thumb,
          }),
        }
      );

      const data = await response.json();

      setFolders(data);
      setLoading(false);

      if (data.error) {
        setFolderError(data.error);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setLoading(false);
    }
  };

  const toggleView = () => {
    setView(viewList[(viewList.indexOf(view) + 1) % viewList.length]);
  };

  const sendUpFolderPath = (path: string) => {
    changeFolderPath(path);
  };

  const goToFolder = (index: number) => {
    let newPath = '';
    let pathArray = pathMenu.slice(0, index + 1);
    newPath = '/' + pathArray.join('/');
    sendUpFolderPath(newPath);
  };

  const updatePathMenu = (folderPath: string) => {
    let pathArray: string[] = [];
    if (folderPath !== '/') {
      let newArray = folderPath.split('/');
      newArray.shift(); // remove the first empty item
      pathArray = newArray;
    }
    setPathMenu(pathArray);
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  const toggleTab = () => {
    toggleActiveTab();
  };

  const getPathNames = async (folderPath: string) => {
    const storedJWT = localStorage.getItem('jwt');

    if (folderPath !== '/') {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
        };
        const response = await fetch(
          process.env.REACT_APP_API_URL + '/get-folder-names.php',
          {
            method: 'POST',
            mode: 'cors',
            headers,
            body: JSON.stringify({
              path: folderPath,
            }),
          }
        );

        const data = await response.json();

        //add data to existing array:

        setFolderNames(data);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    } else {
      setFolderNames([]);
    }
  };

  const selectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      let newItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(newItems);
    } else {
      let newItems = [...selectedItems, id];
      setSelectedItems(newItems);
    }
  };

  const updatePermissionList = (items: Array<any>) => {
    let newPermissions: Array<any> = [];

    Array.isArray(items) &&
      items.length > 0 &&
      items.forEach((file) => {
        let permissions = JSON.parse(file.access_level);
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
    if (e.target.value === 'all') {
      setFiles(unfilteredFiles);
    } else {
      let groupID = parseInt(e.target.value);
      let newFiles = unfilteredFiles.filter((file) => {
        let permissions = JSON.parse(file.access_level);

        return permissions.includes(groupID);
      });

      setFiles(newFiles);
    }
  };

  const selectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      let allItems = files.map((file) => file.ID);
      setSelectedItems(allItems);
    }
    setAllSelected(!allSelected);
  };

  const deleteSelected = async () => {
    const storedJWT = localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (selectedItems.length > 0) {
      if (
        window.confirm('Are you sure you want to delete the selected files?')
      ) {
        setLoading(true);

        try {
          const headers = {
            'Content-Type': 'application/json',
            ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
          };
          const promises = selectedItems.map(async (selectedItem) => {
            const response = await fetch(
              process.env.REACT_APP_API_URL + '/move-to-trash.php',
              {
                method: 'POST',
                mode: 'cors',
                headers,
                body: JSON.stringify({
                  email: user.email,
                  id: selectedItem,
                }),
              }
            );

            const data = await response.json();

            if (data === 'Error decoding token: Expired token') {
              logout();
            }

            if (data.error) {
              alert(data.error);
            } else {
              setSelectedItems([]);
              setAllSelected(false);
              refresh();
            }
          });

          await Promise.all(promises);
          setLoading(false);
        } catch (error) {
          console.error('Error deleting files:', error);
        }
      }
    }
  };

  useEffect(() => {
    getFolders().then(() => getInitialFiles());
    setFolderSuccess('');
  }, [view, refreshCounter]);

  useEffect(() => {
    setPage(0);
    fetchData();
    setSelectedItems([]);
    setAllSelected(false);
    if (folderPath === '/') {
      setFolderImage('');
    }
  }, [folderPath]);

  useEffect(() => {
    const getInitialData = async () => {
      await getTotalFiles();
    };

    getInitialData();

    const div = scrollRef.current!;
    const handleScroll = () => {
      if (div) {
        const isAtBottom =
          div.scrollTop + div.clientHeight >= div.scrollHeight - 1;

        if (isAtBottom) {
          if (page * 20 < totalFiles) {
            setPage((page) => page + 1);
          }
        }
      }
    };

    if (div) {
      div.addEventListener('scroll', handleScroll);

      return () => {
        div.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollRef.current, page, totalFiles]);

  useEffect(() => {
    if (page !== 0 && page * 20 < totalFiles) {
      getFiles();
    }
  }, [page]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const parentButton = target.closest('button');
      if (
        !parentButton?.classList.contains('size-button') &&
        !target.closest('.download-menu') &&
        !target.closest('.download-button')
      ) {
        setActiveDownloadMenu(null);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDownloadMenu]);

  useEffect(() => {
    folderPath !== '/' && showContent && getFolderInfo(folderPath);
  }, [showContent]);
  useEffect(() => {
    // If screen width is less than 1000px, set view to 'list'
    if (window.innerWidth < 1000) {
      setView('list');
    }
    //add event listener to set activeDownloadMenu to null when clicking outside of the download menu or download button
  }, []);

  const roles = JSON.parse(user.groups || '[]');

  return (
    <div className={`min-h-[300px] lg:pb-20 fade-in`}>
      <div
        className={`grid items-end relative  my-5 py-3 md:py-5 `}
        // style={
        //   folderImage
        //     ? { backgroundImage: `url(data:image/jpeg;base64,${folderImage})` }
        //     : { backgroundImage: `url('/folder-placeholder.jpg')` }
        // }
      >
        {/* <div className={`absolute w-full h-full bg-default opacity-20`}></div> */}

        <h1 className="flex relative flex-wrap md:min-h-[2rem]  gap-2 items-center text-xl md:text-2xl">
          {showContent && (
            <>
              <span className={` fade-in`}>
                {folderNames[folderNames?.length - 1]
                  ? folderNames[folderNames?.length - 1]?.folder_name
                  : 'Browse our files'}
              </span>
              {folderPath !== '/' && groupLabels.length > 0 && (
                <span className="inline-flex gap-1 fade-in">
                  {groupLabels.map((group: any, index: number) => (
                    <span
                      key={`index-${group.ID}`}
                      style={{ backgroundColor: group.colour }}
                      className={`text-xs text-white px-2 py-0.5 rounded`}
                    >
                      {group.name}
                    </span>
                  ))}
                </span>
              )}
            </>
          )}
        </h1>
      </div>
      <div className="relative items-center justify-between mb-3 md:flex md:mb-0 md:mb-5">
        <div className="flex items-center justify-between gap-5 mb-3 md:mb-0 md:order-2 md:justify-end">
          {(roles.includes(0) || roles.includes(1)) && (
            <div>
              <button
                className="px-4 py-1.5 my-1 text-xs transition-all rounded-md text-gray-500 ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
                onClick={toggleTab}
              >
                File stats
              </button>
            </div>
          )}
          <SearchFiles path={folderPath} updateFolderPath={changeFolderPath} />
          <div className="flex justify-between h-[30px] overflow-hidden border rounded-full  border-suzy-gray">
            <button
              className={`${
                view === 'list'
                  ? 'bg-shade border-suzy-gray rounded-full'
                  : 'border-white bg-white'
              } relative inline-grid py-0 gap-[3px] w-[45px] border-r h-[30px] content-center border px-[12px]  -mt-px -ml-px `}
              onClick={() => setView('list')}
            >
              <div className={`h-px w-full bg-default`} />
              <div className={`h-px w-full bg-default `} />
              <div className={`h-px w-full bg-default `} />
            </button>

            <div
              className={`${
                view !== 'list'
                  ? 'bg-shade border-suzy-gray rounded-full'
                  : 'border-white bg-white'
              }  p-[10px] border w-[45px] h-[30px] inline-grid content-center -mr-px -mt-px`}
            >
              <button
                onClick={toggleView}
                className={` hidden md:flex group gap-[2px] md:flex-wrap justify-center content-center
       `}
              >
                <div
                  className={`rounded-xs border border-default rounded-sm
                  ${view === 'list' && 'w-[calc(33.333%-2px)] h-1.5'} 
                  ${view === 'small' && 'w-[calc(33.333%-2px)] h-1.5'}
                  ${view === 'medium' && 'w-[calc(50%-2px)] h-2'} 
                  ${view === 'large' && 'w-4 h-4'} 
              `}
                ></div>

                {view !== 'large' && (
                  <>
                    <div
                      className={` rounded-xs border border-default rounded-sm
                  ${view === 'list' && 'w-[calc(33.333%-2px)] h-1.5'} 
                  ${view === 'small' && 'w-[calc(33.333%-2px)] h-1.5'}
                  ${view === 'medium' && 'w-[calc(50%-2px)] h-2'} 
              
            `}
                    ></div>
                    <div
                      className={` rounded-xs border border-default rounded-sm
         ${view === 'list' && 'w-[calc(33.333%-2px)] h-1.5'} 
            ${view === 'small' && 'w-[calc(33.333%-2px)] h-1.5'}
            ${view === 'medium' && 'w-[calc(50%-2px)]  h-2'}  
            `}
                    ></div>
                    <div
                      className={` rounded-xs border border-default rounded-sm
                   ${view === 'list' && 'w-[calc(33.333%-2px)] h-1.5'} 
            ${view === 'small' && 'w-[calc(33.333%-2px)] h-1.5'}
            ${view === 'medium' && 'w-[calc(50%-2px)]  h-2'} 
            `}
                    ></div>
                  </>
                )}

                {(view === 'small' || view === 'list') && (
                  <>
                    <div
                      className={`
             w-[calc(33.333%-2px)] h-1.5
              
                 rounded-xs border  border-default rounded-sm`}
                    ></div>
                    <div
                      className={`
               w-[calc(33.333%-2px)] h-1.5
               rounded-xs border  border-default rounded-sm`}
                    ></div>
                  </>
                )}
              </button>
              <button
                onClick={() => setView('large')}
                className={`grid md:hidden  justify-items-center	content-center gap-0.5 group `}
              >
                <div
                  className={`rounded-xs border border-default rounded-sm w-4 h-4`}
                ></div>
              </button>
            </div>
          </div>
          <p className="absolute text-sm italic text-red-700 -bottom-5">
            {folderError}
          </p>
          <p className="absolute text-sm italic text-green-600 -bottom-5">
            {folderSuccess}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-1 md:order-1">
          <button
            className="flex items-center gap-1 group"
            onClick={() => sendUpFolderPath('/')}
          >
            <span className="text-xs text-gray-400 transition-all md:text-sm group-hover:text-gray-300">
              Home
            </span>
          </button>
          {pathMenu.length > 0 &&
            pathMenu.map((path, index) => (
              <button
                className="flex items-center gap-1 group"
                key={path + index}
                onClick={() => goToFolder(index)}
              >
                <span className="text-xs text-gray-400 transition-all md:text-sm group-hover:text-gray-300">{`>`}</span>
                <span
                  title={folderNames[index]?.folder_name}
                  className="text-xs transition-all text-gray-400 md:text-sm group-hover:text-gray-300 max-w-[120px] truncate"
                >
                  {folderNames[index]?.folder_name}
                </span>
              </button>
            ))}
          {loading && (
            <svg
              className="inline-block w-4 h-4 ml-1 md:mt-0.5 md:w-4 md:h-4 text-accent animate-spin"
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
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`${
          view === 'list' ? 'max-h-[60vh] ' : 'max-h-screen '
        }  border-b relative overflow-x-scroll border-slate-100 `}
      >
        {showContent && Array.isArray(folders) && folders.length > 0 && (
          <div
            className={`${
              view === 'list'
                ? ' mt-5 mb-10 min-w-[800px] '
                : 'mb-10 mt-5 gap-[2rem]'
            } 
             w-full flex-wrap  items-start relative
              flex `}
          >
            {view === 'list' && (
              <div className="flex w-full ">
                <div className="grid content-center flex-shrink-0 w-[50px]"></div>
                <div className=" w-[60px] py-3 border-r border-suzy-gray flex-shrink-0 "></div>
                <div className="px-6 flex-grow py-3 border-r border-suzy-gray min-w-[100px]">
                  <p className="text-xs text-gray-400 md:text-sm">Name</p>
                </div>
                {(roles.includes(0) || roles.includes(1)) && (
                  <div className="px-6 w-[150px] py-3 border-r border-suzy-gray flex-shrink-0">
                    <p className="text-xs text-gray-400 md:text-sm">
                      Permissions
                    </p>
                  </div>
                )}
                <div className="px-6 w-[150px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Date</p>
                </div>
                <div className="px-6 w-[120px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">File count</p>
                </div>
                <div className="px-6 w-[160px] py-3 flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Size</p>
                </div>
              </div>
            )}
            {folders.map((folder: any) => (
              <FolderItem
                refresh={refresh}
                key={`folder-${folder.ID}`}
                view={view}
                folder={folder}
                selectFolder={sendUpFolderPath}
                groups={groups}
              />
            ))}
          </div>
        )}

        {showContent &&
          (roles.includes(0) || roles.includes(1)) &&
          Array.isArray(files) &&
          files.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-5 mb-10">
              <button
                className="flex content-center items-center py-2.5 px-3 text-xs transition-all rounded-md  ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
                onClick={selectAll}
              >
                <div
                  className={`${
                    allSelected
                      ? 'bg-default border-default'
                      : 'bg-white border-suzy-gray'
                  } grid p-0.5 content-center inline-block w-4 h-4 mr-2 border rounded cursor-pointer `}
                >
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
                  )}{' '}
                </div>
                <span className="text-gray-500">Select all</span>
              </button>
              {availablePermissions.length > 0 && (
                <div className="relative flex content-center text-xs transition-all bg-white text-default ">
                  <select
                    className="text-xs block relative text-gray-500 cursor-pointer bg-none w-full appearance-none hover:bg-shade border py-2.5 pl-3 pr-7 rounded-md outline-none rounded-md border-suzy-gray"
                    name="permissions"
                    id="permissions"
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
              {selectedItems.length > 0 && (
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
        {showContent && (
          <div
            className={`${
              view === 'list'
                ? ' my-5  min-w-[800px]'
                : 'mb-10 mt-5 flex-wrap gap-[2rem]'
            } flex items-start relative flex-wrap w-full
          `}
          >
            {Array.isArray(files) && files.length > 0 && view === 'list' && (
              <div className="flex w-full">
                {(roles.includes(0) || roles.includes(1)) && (
                  <div className="grid content-center flex-shrink-0 w-[50px]"></div>
                )}
                <div className=" w-[60px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Image</p>
                </div>
                <div className="px-6 flex-grow py-3 border-r border-suzy-gray min-w-[100px]">
                  <p className="text-xs text-gray-400 md:text-sm">Name</p>
                </div>
                {(roles.includes(0) || roles.includes(1)) && (
                  <div className="px-6 w-[150px] py-3 border-r border-suzy-gray flex-shrink-0">
                    <p className="text-xs text-gray-400 md:text-sm">
                      Permissions
                    </p>
                  </div>
                )}
                <div className="px-6 w-[150px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Date</p>
                </div>
                <div className="px-6 w-[120px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Size</p>
                </div>
                <div className="px-6 w-[160px] py-3 flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Download</p>
                </div>
              </div>
            )}
            {Array.isArray(files) &&
              files.length > 0 &&
              files.map((item: any) => (
                <FileItem
                  key={`file-${item.ID}`}
                  id={`file-${item.ID}`}
                  view={view}
                  file={item}
                  groups={groups}
                  activeDownloadMenu={activeDownloadMenu}
                  setActiveDownloadMenu={setActiveDownloadMenu}
                  selectItem={selectItem}
                  selectedItems={selectedItems}
                />
              ))}
            {loadingMoreFiles && (
              <div className="absolute top-0 left-0 grid items-center content-center w-full h-full bg-opacity-50 bg-shade">
                <div className="text-center ">
                  <svg
                    className={`w-[30px] h-[30px] inline-block text-accent animate-spin absolute bottom-12 mx-auto`}
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default FileBrowser;
