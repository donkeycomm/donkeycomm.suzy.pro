//create a react functional component in typescript
import { useEffect, useRef, useState, type FC } from 'react';

import BinItem from './binitem';

interface binbrowserProps {}

const BinBrowser: FC<binbrowserProps> = ({}) => {
  const viewList = ['small', 'medium', 'large'];
  const [files, setFiles] = useState<Array<any>>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingDeleteSelected, setLoadingDeleteSelected] = useState(false);
  const [loadingRestoreSelected, setLoadingRestoreSelected] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [view, setView] = useState('list');
  const [selectedFiles, setSelectedFiles] = useState<Array<number>>([]);
  const [allSelected, setAllSelected] = useState(false);

  const getInitialFiles = async () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    let thumb = view === 'list' ? 'small' : view;

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/get-bin-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            email: user.email,
            size: thumb,
            page: 0,
          }),
        }
      );

      const data = await response.json();
      setFiles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial files:', error);
      setLoading(false);
    }
  };
  const getFiles = async () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    let thumb = view;
    if (view === 'list') {
      thumb = 'small';
    }
    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/get-bin-content.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          email: user.email,
          size: thumb,
          page: page,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          //add to existing array
          setFiles((files) => [...files, ...data]);
          setLoading(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
        }));
  };
  const getTotalFiles = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(
        process.env.REACT_APP_API_URL + '/get-total-bin-content.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            email: user.email,
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          //add to existing array
          setTotalFiles(data.total);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
        }));
  };

  const toggleView = () => {
    setView(viewList[(viewList.indexOf(view) + 1) % viewList.length]);
  };

  const emptyBin = async () => {
    setLoadingDelete(true);
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete all the files in the bin?'
    );
    if (!confirmDelete) {
      setLoadingDelete(false);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/empty-bin.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          email: user.email,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setFiles([]);
          setSelectedFiles([]);
          setLoading(false);
          setLoadingDelete(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
          setLoadingDelete(false);
        }));
  };

  const selectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((item) => item.ID));
    }
    setAllSelected(!allSelected);
  };

  const deleteSelected = async () => {
    setLoadingDeleteSelected(true);
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete the selected files?'
    );
    if (!confirmDelete) {
      setLoadingDeleteSelected(false);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(
        process.env.REACT_APP_API_URL + '/delete-selected-files.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            email: user.email,
            files: selectedFiles,
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setFiles(files.filter((item) => !selectedFiles.includes(item.ID)));
          setSelectedFiles([]);
          setLoadingDeleteSelected(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
          setLoadingDelete(false);
        }));
  };

  const toggleSelectItem = (id: number) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter((item) => item !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const restoreSelected = async () => {
    setLoadingRestoreSelected(true);
    const confirmDelete = window.confirm(
      'Are you sure you want to restore the selected files?'
    );
    if (!confirmDelete) {
      setLoadingDeleteSelected(false);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(
        process.env.REACT_APP_API_URL + '/restore-selected-files.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            email: user.email,
            files: selectedFiles,
          }),
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else if (data == 'success') {
            setFiles(files.filter((item) => !selectedFiles.includes(item.ID)));
            setSelectedFiles([]);
          }
          setLoadingRestoreSelected(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);

          setLoadingRestoreSelected(false);
        }));
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getInitialFiles();
  }, [view]);

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
  }, [page, totalFiles]);

  useEffect(() => {
    if (page !== 0 && page * 20 < totalFiles) {
      getFiles();
    }
  }, [page]);

  return (
    <div className="fade-in lg:py-10">
      <div>
        <h1 className="flex flex-wrap min-h-[2rem] mb-2 gap-2  items-center text-xl md:text-2xl">
          <span>Bin</span>
          {loading && (
            <svg
              className="inline-block w-5 h-5 mt-0.5 text-accent animate-spin"
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
        </h1>
      </div>
      <div className="relative flex min-h-[45px] items-center justify-between pr-7">
        <div className="flex gap-2 md:gap-5">
          {files.length > 0 && (
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
          )}

          {selectedFiles.length > 0 &&
            (loadingRestoreSelected ? (
              <svg
                className="inline-block w-5 h-5 mt-0.5  text-accent animate-spin"
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
              <button
                onClick={restoreSelected}
                className="flex items-center gap-2 px-4 py-2 text-xs text-blue-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>

                <span>Restore selected</span>
              </button>
            ))}

          {selectedFiles.length > 0 &&
            (loadingDeleteSelected ? (
              <svg
                className="inline-block w-5 h-5 mt-0.5  text-accent animate-spin"
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
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 text-xs text-red-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
                <span>Delete selected</span>
              </button>
            ))}
        </div>
        <div className="flex gap-2 md:gap-5">
          {loadingDelete ? (
            <svg
              className="inline-block w-5 h-5 mt-0.5 mr-5 text-accent animate-spin"
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
            <div>
              {files.length > 0 && (
                <button
                  onClick={emptyBin}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-red-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  <span className="whitespace-nowrap">Empty bin</span>
                </button>
              )}
            </div>
          )}
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
                                  ${
                                    view === 'list' &&
                                    'w-[calc(33.333%-2px)] h-1.5'
                                  } 
                                  ${
                                    view === 'small' &&
                                    'w-[calc(33.333%-2px)] h-1.5'
                                  }
                                  ${
                                    view === 'medium' && 'w-[calc(50%-2px)] h-2'
                                  } `}
                    ></div>
                    <div
                      className={` rounded-xs border border-default rounded-sm
                              ${
                                view === 'list' && 'w-[calc(33.333%-2px)] h-1.5'
                              } 
                              ${
                                view === 'small' &&
                                'w-[calc(33.333%-2px)] h-1.5'
                              }
                              ${
                                view === 'medium' && 'w-[calc(50%-2px)]  h-2'
                              }  `}
                    ></div>
                    <div
                      className={` rounded-xs border border-default rounded-sm
                      ${view === 'list' && 'w-[calc(33.333%-2px)] h-1.5'} 
                      ${view === 'small' && 'w-[calc(33.333%-2px)] h-1.5'}
                      ${view === 'medium' && 'w-[calc(50%-2px)]  h-2'} `}
                    ></div>
                  </>
                )}

                {(view === 'small' || view === 'list') && (
                  <>
                    <div
                      className={` w-[calc(33.333%-2px)] h-1.5 rounded-xs border  border-default rounded-sm`}
                    ></div>
                    <div
                      className={` w-[calc(33.333%-2px)] h-1.5 rounded-xs border  border-default rounded-sm`}
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
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`${
          view === 'list' ? 'max-h-[60vh] ' : 'max-h-screen '
        }  border-b relative overflow-x-scroll border-slate-100 pr-2 md:pr-5 `}
      >
        <div
          className={`${
            view === 'list'
              ? ' mt-5 mb-10 min-w-[800px] '
              : 'mb-10 mt-5 gap-[2rem]'
          } 
           w-full flex-wrap  items-start relative
            flex `}
        >
          {Array.isArray(files) && files.length > 0 && view === 'list' && (
            <div className="flex w-full">
              <div className="grid content-center flex-shrink-0 w-[50px]"></div>
              <div className=" w-[60px] py-3 border-r border-suzy-gray flex-shrink-0">
                <p className="text-xs text-gray-400 md:text-sm">Image</p>
              </div>
              <div className="px-6 flex-grow py-3 border-r border-suzy-gray min-w-[100px]">
                <p className="text-xs text-gray-400 md:text-sm">Name</p>
              </div>
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
          {Array.isArray(files) && files.length > 0 ? (
            files.map((item: any) => (
              <BinItem
                key={item.file_id}
                view={view}
                file={item}
                select={() => toggleSelectItem(item.ID)}
                selected={selectedFiles.includes(item.ID)}
              />
            ))
          ) : (
            <div>
              <p>No files in the bin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BinBrowser;
