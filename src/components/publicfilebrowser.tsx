import React, { useEffect, useRef, useState } from 'react';
import FileItem from './publicfileitem';
import FolderItem from './publicfolderitem';

interface FileBrowserProps {
  folderPath: string;
  changeFolderPath: (path: string) => void;
}

const PublicFileBrowser: React.FC<FileBrowserProps> = ({
  folderPath,
  changeFolderPath,
}) => {
  const viewList = ['small', 'medium', 'large'];

  const [files, setFiles] = useState<Array<any>>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [folders, setFolders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const [showContent, toggleContent] = useState(1);
  const [view, setView] = useState(viewList[1]);

  const [folderError, setFolderError] = useState('');
  const [folderSuccess, setFolderSuccess] = useState('');
  const [pathMenu, setPathMenu] = useState<Array<string>>([]);
  const [folderNames, setFolderNames] = useState<Array<any>>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
    try {
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

  const getInitialFiles = async () => {
    setLoading(true);
    setFolderError('');

    let thumb = view === 'list' ? 'small' : view;

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-public-folder-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: folderPath,
            size: thumb,
            page: 0,
          }),
        }
      );

      const data = await response.json();
      setFiles(data);
      setLoading(false);
      toggleContent(1);
    } catch (error) {
      console.error('Error fetching initial files:', error);
      setLoading(false);
      toggleContent(1);
    }
  };

  const getFiles = async () => {
    setLoading(true);
    setFolderError('');

    let thumb = view === 'list' ? 'small' : view;

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-public-folder-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: folderPath,
            size: thumb,
            page: page,
          }),
        }
      );

      const data = await response.json();
      setFiles([...files, ...data]);
      setLoading(false);
      toggleContent(1);
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
      toggleContent(1);
    }
  };

  const getTotalFiles = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-total-public-folder-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: folderPath,
          }),
        }
      );

      const data = await response.json();
      setTotalFiles(data.total);
    } catch (error) {
      console.error('Error fetching total files:', error);
      setLoading(false);
    }
  };

  const getFolders = async () => {
    setLoading(true);
    setFolderError('');
    let thumb = view === 'list' || view === 'small' ? 'medium' : view;

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-public-folders.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
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

    console.log('get path names', path);
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
  const getPathNames = async (folderPath: string) => {
    //reset folder names
    setFolderNames([]);
    //loop through path menu and get folder data and add it to the folder array

    if (folderPath !== '/') {
      try {
        const response = await fetch(
          process.env.REACT_APP_API_URL + '/get-public-folder-data.php',
          {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: folderPath,
            }),
          }
        );

        const data = await response.json();
        //add data to existing array:
        setFolderNames([...folderNames, data]);
        console.log(data);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    }
  };
  useEffect(() => {
    getFolders().then(() => getInitialFiles());
    setFolderSuccess('');
  }, [view]);

  useEffect(() => {
    setPage(0);
    fetchData();
  }, [folderPath]);

  useEffect(() => {
    const fetchData = async () => {
      await getTotalFiles();
    };

    fetchData();

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
    // If screen width is less than 1000px, set view to 'list'
    if (window.innerWidth < 1000) {
      setView('list');
    }
  }, []);

  return (
    <div className={`min-h-[300px] py-3 lg:pb-10 fade-in`}>
      <div className="relative flex mb-3 md:mb-0 md:min-h-[45px] items-center justify-between pr-2 md:pr-7">
        <div className="flex flex-wrap gap-1 ">
          <button
            className="flex items-center gap-1 group"
            onClick={() => sendUpFolderPath('/')}
          >
            <span className="group-hover:text-slate-300">/</span>
          </button>
          {pathMenu.length > 0 &&
            pathMenu.map(
              (path, index) =>
                folderNames[index]?.folder_name && (
                  <button
                    className="flex items-center gap-1 group"
                    key={path + index}
                    onClick={() => goToFolder(index)}
                  >
                    <span className="text-xs uppercase transition-all group-hover:text-slate-400">
                      {folderNames[index]?.folder_name}
                    </span>
                    <span className="group-hover:text-slate-300">/</span>
                  </button>
                )
            )}
          {loading && (
            <svg
              className="inline-block mt-0.5 w-5 h-5 text-accent animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-10"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-50"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </div>
        <div className="flex justify-end gap-5">
          <div className="flex gap-2 md:gap-5">
            <button
              onClick={() => setView('list')}
              className={`${
                view !== 'list' && 'opacity-50'
              } min-h-[26px] grid content-center gap-[2px] group grid-cols-3`}
            >
              <div
                className={`rounded-xs bg-slate-400 group-hover:bg-slate-300 w-2 h-[3px] col-span-1`}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-4 h-[3px] col-span-2`}
              ></div>
              <div
                className={`rounded-xs bg-slate-400 group-hover:bg-slate-300 w-2 h-[3px] col-span-1`}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-4 h-[3px] col-span-2`}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-2 h-[3px] col-span-1`}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-4 h-[3px] col-span-2 `}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-2 h-[3px] col-span-1`}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-4 h-[3px] col-span-2 `}
              ></div>
            </button>
            <button
              onClick={toggleView}
              className={` hidden md:grid justify-items-end	content-center  group 
         ${
           view === 'list' &&
           'grid-cols-3 opacity-50 min-h-[30px] min-w-[25px] gap-[2px]'
         } 
          ${
            view === 'small' &&
            'grid-cols-3 min-h-[26px] min-w-[25px] gap-[2px]'
          } 
          ${
            view === 'medium' &&
            'grid-cols-2 min-h-[22px] ml-[3px] min-w-[22px] gap-[2px]'
          } 
          ${
            view === 'large' &&
            'grid-cols-1 min-h-[22px] min-w-[25px] gap-[2px]'
          }`}
            >
              <div
                className={`rounded-xs bg-slate-400 group-hover:bg-slate-300
                  ${view === 'list' && 'w-[7px] h-[7px]'} 
              ${view === 'small' && 'w-[7px] h-[7px]'} 
              ${view === 'medium' && 'w-[9px] h-[9px]'} 
              ${view === 'large' && 'w-4 h-3'} 
              `}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300
                 ${view === 'list' && 'w-[7px] h-[7px]'} 
              ${view === 'small' && 'w-[7px] h-[7px]'} 
              ${view === 'medium' && 'w-[9px] h-[9px]'} 
              ${view === 'large' && 'w-4 h-3'} 
            `}
              ></div>
              {view !== 'large' && (
                <>
                  <div
                    className={` rounded-xs bg-slate-400 group-hover:bg-slate-300
          ${view === 'list' && 'w-[7px] h-[7px]'} 
              ${view === 'small' && 'w-[7px] h-[7px]'} 
            ${view === 'medium' && 'w-[9px] h-[9px]'} 
            `}
                  ></div>
                  <div
                    className={` rounded-xs bg-slate-400 group-hover:bg-slate-300
                    ${view === 'list' && 'w-[7px] h-[7px]'} 
              ${view === 'small' && 'w-[7px] h-[7px]'} 
            ${view === 'medium' && 'w-[9px] h-[9px]'} 
            `}
                  ></div>
                </>
              )}

              {(view === 'small' || view === 'list') && (
                <>
                  <div
                    className={`w-[7px] h-[7px] rounded-xs bg-slate-400 group-hover:bg-slate-300`}
                  ></div>
                  <div
                    className={` w-[7px] h-[7px] rounded-xs bg-slate-400 group-hover:bg-slate-300`}
                  ></div>
                </>
              )}
            </button>
            <button
              onClick={() => setView('large')}
              className={`min-h-[26px] min-w-[28px] grid md:hidden grid-cols-1 justify-items-end	content-center gap-0.5 group 
         ${view === 'list' && 'opacity-50'} `}
            >
              <div
                className={`rounded-xs bg-slate-400 group-hover:bg-slate-300 w-4 h-3
               
              `}
              ></div>
              <div
                className={` rounded-xs bg-slate-400 group-hover:bg-slate-300 w-4 h-3
             
            `}
              ></div>
            </button>
          </div>
          <p className="absolute text-sm italic text-red-700 -bottom-5">
            {folderError}
          </p>
          <p className="absolute text-sm italic text-green-600 -bottom-5">
            {folderSuccess}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`${
          view === 'list' ? 'max-h-[60vh] ' : 'max-h-auto'
        }  overflow-y-scroll border-b relative border-slate-100 pr-2 md:pr-5 `}
      >
        {Array.isArray(folders) && folders.length > 0 && (
          <div
            className={`${view === 'list' ? 'gap-1 my-5 ' : 'mt-5'} 
           w-full grid 
           ${view === 'small' && 'grid-cols-3 gap-2 md:gap-16'}
           ${view === 'medium' && 'grid-cols-2 gap-2 md:gap-16'}
           ${view === 'large' && 'grid-cols-1 gap-2 md:gap-16'}`}
          >
            {folders.map((folder: any, index: number) => (
              <FolderItem
                index={index}
                key={`folder-${folder.ID}`}
                view={view}
                folder={folder}
                selectFolder={sendUpFolderPath}
              />
            ))}
            <div className={` w-full p-2`}>
              {folderPath === '/' && !loading && (
                <div
                  className={`${
                    (view === 'medium' || view === 'small') &&
                    'h-[290px] lg:h-[300px] xl:h-[300px]'
                  } ${
                    view === 'large' && 'h-[250px] md:h-[550px] lg:h-[250px]'
                  } relative w-full h-full grid content-end`}
                >
                  <div
                    className={`${
                      view === 'list' ? 'py-5' : 'py-5 md:p-5'
                    } relative`}
                  >
                    <p className={` text-xs  text-grey-400 mb-3`}>
                      For press enquiries and press release sign-ups, please
                      contact press@suzy.pro
                    </p>
                    <p className={` text-xs  text-grey-400 mb-3`}>
                      Suzy Brand Asset Manager <br />
                      Britselei 23, 2000 Antwerp Belgium
                    </p>
                    <p className={` text-xs  text-grey-400 mb-3`}>
                      <a
                        className="underline hover:text-accent"
                        href="mailto:hello@suzy.pro"
                      >
                        hello@suzy.pro
                      </a>
                      <br />
                      <a
                        className="underline hover:text-accent"
                        href="https://suzy.pro"
                      >
                        www.suzy.pro
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={`${view === 'list' ? 'gap-1 my-5 ' : 'mb-10 mt-5 md:mt-7'} 
         
          w-full
          grid 
           ${view === 'small' && 'grid-cols-5 gap-2 md:gap-6'}
           ${view === 'medium' && 'grid-cols-2 gap-2 md:gap-16'}
           ${view === 'large' && 'grid-cols-1 gap-2 md:gap-16'}
          `}
        >
          {Array.isArray(files) &&
            files.length > 0 &&
            files.map((item: any) => (
              <FileItem key={`file-${item.ID}`} view={view} file={item} />
            ))}
        </div>
      </div>
    </div>
  );
};
export default PublicFileBrowser;
