import { useEffect, useState, FC, useRef } from 'react';

import SearchResult from '../components/searchresultpublic';
interface SearchfilesProps {
  path: string;
  updateFolderPath: (path: string) => void;
}

const SearchFiles: FC<SearchfilesProps> = ({ path, updateFolderPath }) => {
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);

  const [results, setResults] = useState<Array<any>>([]);
  const [showX, setShowX] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);

  const searchFiles = async (path: string, text: string) => {
    setSearching(true);
    //Use the path to search for files
    if (text.trim() === '') {
      setSearching(false);
      return;
    }

    await fetch(process.env.REACT_APP_API_URL + '/search-public-files.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        text,
      }),
    })
      .then((response) => response.json())
      .then((data: any) => {
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

  const resultsRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchFiles(path, searchText);
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setResults([]); // Step 2
        setSearchText('');
        setShowX(false);
        setShowNoResults(false);
      }
    }

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
    <div className="relative">
      <div className="relative flex items-center justify-between w-full pr-2 ">
        <input
          type="text"
          name="search"
          autoComplete="off"
          value={searchText}
          onKeyDown={handleKeyDown}
          placeholder="Search folder..."
          className="px-2 py-1 text-xs bg-transparent outline-none md:text-sm text-default placeholder-default focus:bg-transparent"
          onChange={(e) => setSearchText(e.target.value)}
        />

        {showX ? (
          <svg
            onClick={() => {
              setSearchText('');
              setShowX(false);
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 cursor-pointer text-default hover:text-gray-400"
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
            className="w-5 h-5 cursor-pointer text-default hover:text-gray-400"
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
            className="inline-block w-5 h-5 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="black"
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
          <div
            ref={resultsRef}
            className="absolute shadow right-10 lg:right-0 top-10 max-h-[300px]  z-10 w-[250px] overflow-x-hidden overflow-y-scroll bg-white"
          >
            {results.map((result: any, index: number) => (
              <SearchResult
                updateFolderPath={updateFolderPath}
                key={`result-${index}`}
                result={result}
              />
            ))}
          </div>
        )}
      </div>
      {showNoResults && (
        <p className="absolute text-xs left-2 text-default -bottom-7">
          No results...
        </p>
      )}
    </div>
  );
};
export default SearchFiles;
