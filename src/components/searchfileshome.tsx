import { useEffect, useState, FC, useRef, useContext } from 'react';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';
import SearchResultHome from './searchresulthome';
interface SearchfilesProps {
  path: string;
  updateFolderPath: (path: string) => void;
}

const SearchFilesHome: FC<SearchfilesProps> = ({ path, updateFolderPath }) => {
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);

  const [results, setResults] = useState<Array<any>>([]);
  const [showX, setShowX] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const searchFiles = async (path: string, text: string) => {
    const storedJWT = localStorage.getItem('jwt');
    setSearching(true);
    //Use the path to search for files
    if (text.trim() === '') {
      setSearching(false);
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
    };
    await fetch(process.env.REACT_APP_API_URL + '/search-files.php', {
      method: 'POST',
      mode: 'cors',
      headers,
      body: JSON.stringify({
        path,
        text,
      }),
    })
      .then((response) => response.json())
      .then((data: any) => {
        if (data === 'Error decoding token: Expired token') {
          logout();
        }
        //check if the data is an array
        if (!Array.isArray(data)) {
          setSearching(false);
          return;
        } else {
          setResults(data);
          setShowX(true);
          if (data.length === 0) {
            setShowNoResults(true);
          }
        }
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);

        setSearching(false);
      });
    setSearching(false);
  };
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      resultsRef.current &&
      !resultsRef.current.contains(event.target as Node)
    ) {
      console.log('clicked outside');
      setResults([]); // Step 2
      setSearchText('');
      setShowX(false);
      setShowNoResults(false);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchFiles(path, searchText);
    }
  };

  useEffect(() => {
    // Add click event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside); // Step 3
    };
  }, []);

  useEffect(() => {
    setShowX(false);
    setShowNoResults(false);
  }, [searchText]);

  return (
    <div className="relative" ref={resultsRef}>
      <div className="relative flex items-center justify-between w-full pr-2 bg-white border rounded-full border-suzy-gray text-border">
        <input
          type="text"
          name="search"
          autoComplete="off"
          value={searchText}
          onKeyDown={handleKeyDown}
          placeholder="Search a file..."
          className="w-full px-4 py-2 text-sm placeholder-gray-400 bg-transparent rounded-md outline-none text-default focus:bg-transparent"
          onChange={(e) => setSearchText(e.target.value)}
        />

        {showX ? (
          <svg
            onClick={() => {
              setSearchText('');
              setShowX(false);
              setResults([]);
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        ) : !searching ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-200"
            onClick={() => searchFiles(path, searchText)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        ) : (
          <svg
            className="inline-block w-5 h-5 text-gray-400 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="gray"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {results.length > 0 && (
          <div className="absolute shadow rounded-md  top-11 max-h-[300px]  mx-auto w-full overflow-x-hidden overflow-y-scroll bg-white">
            {results.map((result: any, index: number) => (
              <SearchResultHome
                updateFolderPath={updateFolderPath}
                key={`result-${index}`}
                result={result}
              />
            ))}
          </div>
        )}
      </div>
      {showNoResults && (
        <p className="absolute text-xs text-white drop-shadow -bottom-5 left-2">
          No results...
        </p>
      )}
    </div>
  );
};
export default SearchFilesHome;
