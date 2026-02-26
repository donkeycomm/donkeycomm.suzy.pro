import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingFileItem from './brandingfileitem';
import AppContext from '../utils/appContext';

interface FileBrowserProps {
  folderPath: string;
  refreshCounter: number;
  groups: Array<any>;
}

const BrandingBrowser: React.FC<FileBrowserProps> = ({
  folderPath,
  groups,
}) => {
  const viewList = ['medium', 'large'];
  const [files, setFiles] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [page, setPage] = useState<number>(0);

  const [showContent, toggleContent] = useState(false);
  const [view, setView] = useState(viewList[0]);
  const [loadingMoreFiles, setLoadingMoreFiles] = useState(false);

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

  const fetchData = async () => {
    try {
      toggleContent(false);

      await getInitialFiles();
      await getTotalFiles();

      folderPath !== '/' && getFolderInfo(folderPath);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getFolderInfo = async (path: string) => {
    const storedJWT = localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
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

      setLoading(false);
      toggleContent(true);

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
      console.log('fetching total files', folderPath);
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
      console.log(data);
      setTotalFiles(data.total);

      if (data === 'Error decoding token: Expired token') {
        logout();
      }
    } catch (error) {
      console.error('Error fetching total files:', error);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  useEffect(() => {
    setPage(0);
    fetchData();
  }, [folderPath]);

  useEffect(() => {
    const fetchData = async () => {
      await getTotalFiles();
    };

    fetchData();
  }, [page, totalFiles]);

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

  const roles = JSON.parse(user.groups || '[]');
  useEffect(() => {
    // If screen width is less than 1000px, set view to 'large'
    if (window.innerWidth < 1000) {
      setView('large');
    }
  }, []);

  return (
    <div
      className={`min-h-[350px] md:min-h-[350px] lg:min-h-[380px] xl:min-h-[475px] lg:pb-10 fade-in`}
    >
      <div
        className={`${
          view === 'list' ? 'max-h-[60vh] ' : 'max-h-screen '
        }  relative overflow-x-scroll  `}
      >
        {showContent && (
          <div
            className={`mb-10 mt-5 flex-wrap gap-[2rem] flex items-start relative flex-wrap w-full
          `}
          >
            {Array.isArray(files) &&
              files.length > 0 &&
              files.map((item: any) => (
                <BrandingFileItem
                  key={`file-${item.ID}`}
                  id={`file-${item.ID}`}
                  view={view}
                  file={item}
                  groups={groups}
                  activeDownloadMenu={activeDownloadMenu}
                  setActiveDownloadMenu={setActiveDownloadMenu}
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
export default BrandingBrowser;
