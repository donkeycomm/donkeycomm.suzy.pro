//create a react functional component in typescript
import { useEffect, useState, useContext, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import PressRelease from './pressrelease';
import AppContext from '../utils/appContext';

interface pressReleaseListProps {
  refreshCounter: number;
}

const PressReleaseList: FC<pressReleaseListProps> = ({ refreshCounter }) => {
  const [pressReleases, setPressReleases] = useState<Array<any>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
  const [loading, setLoading] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const getPressReleases = async () => {
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    // const storedJWT = localStorage.getItem('jwt');

    // user.email &&
    await fetch(process.env.REACT_APP_API_URL + '/get-pressreleases.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 20,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPressReleases(data);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
      });
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
  const selectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      let allItems = pressReleases.map((item) => item.ID);
      setSelectedItems(allItems);
    }
    setAllSelected(!allSelected);
  };

  const deleteSelected = async () => {
    const storedJWT = localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (selectedItems.length > 0) {
      if (
        window.confirm(
          'Are you sure you want to delete the selected press releases?'
        )
      ) {
        setLoading(true);

        try {
          const promises = selectedItems.map(async (selectedItem) => {
            const response = await fetch(
              process.env.REACT_APP_API_URL + '/delete-pressrelease.php',
              {
                method: 'POST',
                mode: 'cors',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + storedJWT,
                },
                body: JSON.stringify({
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
            }
          });

          await Promise.all(promises);
          setLoading(false);
          getPressReleases();
        } catch (error) {
          console.error('Error deleting files:', error);
        }
      }
    }
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };

  useEffect(() => {
    getPressReleases();
  }, [refreshCounter]);

  const roles = JSON.parse(user.groups || '[]');

  return (
    <div className="fade-in ">
      <div className="pr-2">
        <h1 className="flex flex-wrap min-h-[2rem] mb-2 gap-2  items-center text-xl md:text-2xl">
          Press releases
        </h1>
      </div>
      <div className="relative items-center justify-between mb-3 md:flex md:mb-0 md:mb-5">
        <div className="flex flex-wrap items-start gap-1">
          <button
            className="flex items-center gap-1 group"
            onClick={() => navigate('/')}
          >
            <span className="text-xs text-gray-400 transition-all md:text-sm group-hover:text-gray-300">
              Home
            </span>
          </button>

          <button className="flex items-center gap-1 ">
            <span className="text-xs text-gray-400 transition-all md:text-sm ">{`>`}</span>
            <span className="text-xs transition-all text-gray-400 md:text-sm max-w-[120px] truncate">
              Press releases
            </span>
          </button>
        </div>
        {(roles.includes(0) || roles.includes(1)) && (
          <div className="flex gap-5 my-5 md:my-0">
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
          </div>
        )}
      </div>
      <div className="grid gap-7 lg:grid-cols-2">
        {pressReleases.map((pressRelease, index) => (
          <PressRelease
            key={index}
            pressrelease={pressRelease}
            selectItem={selectItem}
            selectedItems={selectedItems}
          />
        ))}
      </div>
    </div>
  );
};
export default PressReleaseList;
