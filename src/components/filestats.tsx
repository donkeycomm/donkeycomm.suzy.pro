import { useEffect, useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from './dropdown';

interface mailStatsProps {
  toggleActiveTab: () => void;
}
const FileStats: FC<mailStatsProps> = ({ toggleActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [files, setFiles] = useState<any>([]);
  const navigate = useNavigate();
  const toggleTab = () => {
    toggleActiveTab();
  };
  const searchFiles = async () => {
    setLoading(true);
    setErrorMessage('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    //check if dateTo and dateFrom are not empty
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    if (dateFrom && dateTo && fromDate <= toDate) {
      user.email &&
        (await fetch(process.env.REACT_APP_API_URL + '/get-file-stats.php', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            date_from: dateFrom,
            date_to: dateTo,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            setFiles(data);
            setLoading(false);
          })
          .catch((error) => {
            // Handle network or server errors
            console.log('error');
            console.log(error);
            setLoading(false);
          }));
    } else {
      setErrorMessage('Please set the correct dates');
      setLoading(false);
    }
  };
  const getInitialStats = async () => {
    setLoading(true);
    setErrorMessage('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    //check if dateTo and dateFrom are not empty
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Setting the dates
    const dateFromValue = lastWeek.toISOString().split('T')[0];
    const dateToValue = today.toISOString().split('T')[0];

    setDateFrom(dateFromValue);
    setDateTo(dateToValue);

    await fetch(process.env.REACT_APP_API_URL + '/get-file-stats.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
      body: JSON.stringify({
        date_from: dateFromValue,
        date_to: dateToValue,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
        setLoading(false);
      });
  };
  //set the initial dates to one week from now and search for files
  useEffect(() => {
    getInitialStats();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="relative max-w-full fade-in">
      <div className="flex gap-10 mb-10">
        <button
          onClick={toggleTab}
          className="flex outline-none text-default hover:text-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            ></path>
          </svg>
          <span className="ml-1 text-sm">Go back</span>
        </button>
      </div>
      <div className="pr-2">
        <h1 className="flex flex-wrap min-h-[2rem] mb-2 gap-2  items-center text-xl md:text-2xl">
          File statistics
        </h1>
      </div>

      <div className="flex flex-wrap items-end gap-4 my-5">
        <div id="date_from" className="flex items-center gap-3">
          <label className="text-sm text-gray-700">From</label>
          <input
            type="date"
            className="w-full px-2 py-2 mt-1 text-sm border border-gray-300 rounded-md"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div id="date_to" className="flex items-center gap-3">
          <label className="text-sm text-gray-700">To</label>
          <input
            type="date"
            className="w-full px-2 py-2 mt-1 text-sm border border-gray-300 rounded-md"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          {loading ? (
            <svg
              className="inline-block w-5 h-5 mb-1.5 text-accent animate-spin"
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
              className="inline-flex justify-center w-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              onClick={searchFiles}
            >
              Search
            </button>
          )}
        </div>
      </div>
      <div>
        <p className="text-sm text-red-600">{errorMessage}</p>
      </div>
      {files.length > 0 ? (
        <div className="relative flow-root p-3 overflow-x-scroll ">
          <div className="overflow-x-auto ">
            <div
              className={`mb-10 min-w-[800px] w-full flex-wrap items-start relative flex`}
            >
              <div className="flex w-full">
                <div className=" w-[60px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Image</p>
                </div>
                <div className="px-6 flex-grow py-3 border-r border-suzy-gray min-w-[100px]">
                  <p className="text-xs text-gray-400 md:text-sm">Name</p>
                </div>

                <div className="px-6 w-[300px] py-3 border-r border-suzy-gray flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Path</p>
                </div>

                <div className="px-6 w-[160px] py-3 flex-shrink-0">
                  <p className="text-xs text-gray-400 md:text-sm">Downloads</p>
                </div>
              </div>
              <div className="relative w-full bg-white divide-y divide-gray-200">
                {files.map((file: any) => (
                  <div
                    key={`filestat-${file.file_id}`}
                    className="flex w-full py-3 border-t border-suzy-gray "
                  >
                    <div className="grid content-center w-[60px] flex-shrink-0">
                      <div className="relative w-8 h-8 overflow-hidden rounded">
                        {file.base64 ? (
                          <img
                            src={`data:image/jpeg;base64,${file.base64}`}
                            alt={file.file}
                            className={`w-full h-full  absolute top-0 left-0 object-cover `}
                          />
                        ) : (
                          <img
                            src={'/image-placeholder.jpg'}
                            alt={file.file}
                            className={`w-full h-full object-scale-down absolute top-0 left-0'`}
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid content-center px-6 flex-grow min-w-[100px]">
                      <p
                        title={file.file}
                        className="relative m-0 overflow-hidden filename-ellipsis"
                      >
                        {file.file}
                      </p>
                    </div>
                    <div className="grid content-center px-6 w-[300px]">
                      <p className="text-gray-400">{file.path}</p>
                    </div>
                    <div className="grid content-center px-6 w-[150px]">
                      {file.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-default">
            No files downloaded during this period.
          </p>
        </div>
      )}
    </div>
  );
};
export default FileStats;
