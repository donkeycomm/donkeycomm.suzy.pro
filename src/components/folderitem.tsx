import type { FC } from 'react';
import { useEffect, useState } from 'react';
import EditFolder from './editfolder';
interface folderitemProps {
  view: string;
  folder: any;
  selectFolder: (path: string) => void;
  groups: Array<any>;
  refresh: () => void;
}

const FolderItem: FC<folderitemProps> = ({
  view,
  folder,
  selectFolder,
  groups,
  refresh,
}) => {
  const [groupColours, setGroupColours] = useState<Array<any>>([]);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [visibility, setVisibility] = useState<Array<number>>([0, 1]);
  const [popUp, setPopup] = useState(false);
  const [folderStats, setFolderStats] = useState<any>(null);
  // Assuming you have a state to track the dragged folder ID

  const [dragOverFolder, setDragoverFolder] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    folderId: number
  ) => {
    e.dataTransfer.setData('text/plain', folderId.toString());
  };

  const reorderRank = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const folderId = e.dataTransfer.getData('text/plain');

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + '/update-folder-rank.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('jwt'),
          },
          body: JSON.stringify({
            folder_id: folderId,
            hovered_folder_id: dragOverFolder,
          }),
        }
      );

      if (response.status === 401) {
        alert('Unauthorized: Please log in to change order.');
        // Optionally, you can redirect the user to the login page
        // window.location.href = '/login';
        return;
      }
      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setDragoverFolder(null);
        refresh();
      }
    } catch (error) {
      // Handle network or server errors
      console.log('error');
      console.log(error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetFolderId = e.currentTarget.getAttribute('data-id');
    setDragoverFolder(targetFolderId ? parseInt(targetFolderId) : null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragoverFolder(null); // Reset the state
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  const date = new Date(folder.date);

  const readableDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getFolderStats = async () => {
    await fetch(process.env.REACT_APP_API_URL + '/get-folder-stats.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('jwt'),
      },
      body: JSON.stringify({
        path: folder.path,
        email: user.email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFolderStats(data);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
      });
  };
  const updateGroupColours = () => {
    const vis_array = JSON.parse(folder.access_level);

    setVisibility(vis_array);
    setGroupColours([]);
    if (!Array.isArray(groups)) {
      console.error('groups is not an array');
      return;
    }
    for (const groupID of vis_array) {
      //check if groupID is in groups then add to groupColours
      const group = groups.find((group) => group.ID === groupID);
      if (group) {
        setGroupColours((prev) => [...prev, group]);
      }
    }
  };

  useEffect(() => {
    getFolderStats();
    updateGroupColours();
  }, [folder]);

  const roles = JSON.parse(user.groups || '[]');

  return (
    <>
      {view === 'list' ? (
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, folder.ID)} // Replace 1 with the actual folder ID
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={reorderRank}
          className={`flex w-full py-2 fade-in transition-all border-t border-suzy-gray group ${
            dragOverFolder === folder.ID ? 'bg-slate-100' : ''
          }`}
          data-id={folder.ID}
        >
          <div className="flex-shrink-0 w-[50px] flex-shrink-0"></div>
          <div className={`flex mb-2 md:mb-0 w-[60px] flex-shrink-0`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              viewBox="0 0 256 250"
              xmlSpace="preserve"
              className={` ${
                view === 'list' ? ' w-8 h-8' : 'w-32 h-30'
              }   transition-fill cursor-pointer`}
              onClick={() => selectFolder(folder.path)}
            >
              <defs></defs>
              <g
                style={{
                  stroke: 'none',
                  strokeWidth: 0,
                  strokeDasharray: 'none',
                  strokeLinecap: 'butt',
                  strokeLinejoin: 'miter',
                  strokeMiterlimit: 10,
                  fill: 'none',
                  fillRule: 'nonzero',
                  opacity: 1,
                }}
                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
              >
                <path
                  d="M 3.649 80.444 h 82.703 c 2.015 0 3.649 -1.634 3.649 -3.649 v -56.12 c 0 -2.015 -1.634 -3.649 -3.649 -3.649 H 35.525 c -1.909 0 -3.706 -0.903 -4.846 -2.435 l -2.457 -3.301 c -0.812 -1.092 -2.093 -1.735 -3.454 -1.735 H 3.649 C 1.634 9.556 0 11.19 0 13.205 v 63.591 C 0 78.81 1.634 80.444 3.649 80.444 z"
                  style={{
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: 'none',
                    strokeLinecap: 'butt',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 10,
                    fill: '#e2e8f0', // Changed color
                    fillRule: 'nonzero',
                    opacity: 1,
                  }}
                  transform=" matrix(1 0 0 1 0 0) "
                  strokeLinecap="round"
                />
                <path
                  d="M 86.351 80.444 H 3.649 C 1.634 80.444 0 78.81 0 76.795 V 29.11 c 0 -2.015 1.634 -3.649 3.649 -3.649 h 82.703 c 2.015 0 3.649 1.634 3.649 3.649 v 47.685 C 90 78.81 88.366 80.444 86.351 80.444 z"
                  style={{
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: 'none',
                    strokeLinecap: 'butt',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 10,
                    fill: '#cbd5e1', // Changed color
                    fillRule: 'nonzero',
                    opacity: 1,
                  }}
                  transform=" matrix(1 0 0 1 0 0) "
                  strokeLinecap="round"
                />
                <path
                  d="M 85.106 76.854 H 4.894 c -0.276 0 -0.5 -0.224 -0.5 -0.5 s 0.224 -0.5 0.5 -0.5 h 80.213 c 0.276 0 0.5 0.224 0.5 0.5 S 85.383 76.854 85.106 76.854 z"
                  style={{
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: 'none',
                    strokeLinecap: 'butt',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 10,
                    fill: '#fafbfa', // Changed color
                    fillRule: 'nonzero',
                    opacity: 1,
                  }}
                  transform=" matrix(1 0 0 1 0 0) "
                  strokeLinecap="round"
                />
                <path
                  d="M 85.106 72.762 H 4.894 c -0.276 0 -0.5 -0.224 -0.5 -0.5 s 0.224 -0.5 0.5 -0.5 h 80.213 c 0.276 0 0.5 0.224 0.5 0.5 S 85.383 72.762 85.106 72.762 z"
                  style={{
                    stroke: 'none',
                    strokeWidth: 1,
                    strokeDasharray: 'none',
                    strokeLinecap: 'butt',
                    strokeLinejoin: 'miter',
                    strokeMiterlimit: 10,
                    fill: '#e2e8f0', // Changed color
                    fillRule: 'nonzero',
                    opacity: 1,
                  }}
                  transform=" matrix(1 0 0 1 0 0) "
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
          <div className="grid content-center px-6 flex-grow min-w-[100px]">
            <p
              onClick={() => selectFolder(folder.path)}
              title={folder.name}
              className="relative m-0 overflow-hidden text-xs cursor-pointer md:text-sm filename-ellipsis"
            >
              {folder.name}
            </p>
          </div>
          <div className="w-[150px] px-6 grid content-center flex-shrink-0 ">
            {(roles.includes(0) || roles.includes(1)) && (
              <div
                className={`relative flex content-center justify-start gap-1 `}
              >
                {groupColours.length > 0 &&
                  groupColours.map((item) => (
                    <div
                      key={`group-colour-${item.ID}`}
                      className={`w-3 h-3 border border-white rounded-full group/groups  cursor-pointer transition-all  relative`}
                      style={{ backgroundColor: item.colour }}
                    >
                      <p className="hidden group-hover/groups:block absolute bottom-4 px-2 py-0.5 rounded bg-white text-xs -left-1 shadow ">
                        {item.name}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="w-[150px] flex-shrink-0 pl-6 pr-3 grid content-center">
            <p className={`relative  text-xs md:text-sm text-gray-400`}>
              {readableDate}
            </p>
          </div>
          <div className="px-6 w-[120px] content-center">
            {folderStats && (
              <p className="text-xs text-gray-400 md:text-sm">
                {folderStats?.file_count} files
              </p>
            )}
          </div>
          <div className="px-6 w-[160px] content-center flex justify-between">
            <div className="grid content-center">
              {folderStats && (
                <p className="text-xs text-gray-400 md:text-sm">
                  {folderStats.total_size &&
                    formatBytes(folderStats.total_size)}
                </p>
              )}
            </div>
            <div className="grid content-center">
              {(roles.includes(0) || roles.includes(1)) && (
                <>
                  <div
                    onClick={() => setPopup(true)}
                    className={` grid gap-0.5 p-1.5 cursor-pointer `}
                  >
                    <div className="w-1 h-1 bg-gray-400 rounded-full "></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full "></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`${
            view === 'small' &&
            ' w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] xl:w-[calc(20%-1.6rem)]'
          }
                    ${
                      view === 'medium' &&
                      ' w-[calc(50%-1rem)] lg:w-[calc(33.3%-1.33rem)]'
                    } 
                    ${view === 'large' && 'w-full'}`}
        >
          <div
            className={` 
              ${view === 'small' && 'h-[180px] lg:h-[160px]'}
               ${
                 view === 'medium' &&
                 'h-[290px] lg:h-[220px] xl:h-[250px] 2xl:h-[300px]'
               }

              ${view === 'large' && 'h-[250px] md:h-[500px]'}
              relative w-full  overflow-hidden rounded-tr-md rounded-tl-md group grid  transition-all content-end cursor-pointer`}
          >
            {folder.base64 ? (
              <img
                src={`data:image/jpeg;base64,${folder.base64}`}
                alt={folder.name}
                className="absolute object-cover w-full h-full"
              />
            ) : (
              <img
                src={`/folder-placeholder.jpg`}
                alt={folder.name}
                className="absolute object-cover w-full h-full"
              />
            )}
            <div
              onClick={() => selectFolder(folder.path)}
              className="absolute top-0 left-0 w-full h-full bg-black opacity-20"
            ></div>
            {folderStats && (
              <div className="relative flex flex-wrap justify-between w-full px-3 py-1">
                <p className="text-xs text-white">
                  {folderStats?.file_count} files
                </p>
                <p className="text-xs text-white">
                  {folderStats.total_size &&
                    formatBytes(folderStats.total_size)}
                </p>
              </div>
            )}
            {(roles.includes(0) || roles.includes(1)) && (
              <>
                <div
                  onClick={() => setPopup(true)}
                  className={`${
                    view === 'small' ? 'top-2 right-2' : 'top-3 right-3'
                  } absolute  grid gap-1 p-1.5 cursor-pointer `}
                >
                  <div className="w-1 h-1 bg-white rounded-full group-hover:bg-shade"></div>
                  <div className="w-1 h-1 bg-white rounded-full group-hover:bg-shade"></div>
                  <div className="w-1 h-1 bg-white rounded-full group-hover:bg-shade"></div>
                </div>
              </>
            )}
          </div>
          <div className="relative flex items-start justify-between w-full px-3 py-2 bg-shade rounded-bl-md rounded-br-md">
            <div className="overflow-hidden">
              <p
                title={folder.name}
                className={`${
                  view === 'small' && 'text-xs lg:text-xs'
                } text-xs lg:text-base text-default relative truncate pr-1`}
              >
                {folder.name}
              </p>
            </div>
            <div>
              {(roles.includes(0) || roles.includes(1)) && (
                <>
                  {visibility.length > 1 && (
                    <div className="flex w-full gap-1 ">
                      {(roles.includes(0) || roles.includes(1)) && (
                        <div
                          className={`relative ${
                            view === 'list' && 'mr-5'
                          } flex content-center justify-end gap-1`}
                        >
                          {groupColours.map((item) => (
                            <div
                              title={item.name}
                              key={`group-colour-${item.ID}`}
                              className={`w-3 h-3 border border-white rounded-full  group/groups  cursor-pointer transition-all relative`}
                              style={{ backgroundColor: item.colour }}
                            >
                              <p className="hidden group-hover/groups:block absolute bottom-4 px-2 py-0.5 rounded bg-white text-xs -right-1 shadow ">
                                {item.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {popUp && (
        <div className="fixed top-0 left-0 z-30 grid items-center content-center w-full h-full bg-black bg-opacity-50">
          <EditFolder
            refresh={refresh}
            closePopup={() => setPopup(false)}
            folder={folder}
            groups={groups}
          />
        </div>
      )}
    </>
  );
};
export default FolderItem;
