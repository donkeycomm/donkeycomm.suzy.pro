import type { FC } from 'react';
import { useState, useEffect } from 'react';
import CropperTool from './cropper';
interface fileitemProps {
  id: string;
  view: string;
  file: any;
  groups: Array<any>;
  activeDownloadMenu: string | null;
  setActiveDownloadMenu: Function;
}

const BrandingFileItem: FC<fileitemProps> = ({
  view,
  file,
  groups,
  id,
  activeDownloadMenu,
  setActiveDownloadMenu,
}) => {
  const dimensions = JSON.parse(file.dimensions);

  const [downloadingSize, setDownloadingSize] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [hideItem, setHideItem] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [groupColours, setGroupColours] = useState<Array<any>>([]);
  const [showCropTool, setShowCropTool] = useState(false);
  const [loadingCropTool, setLoadingCropTool] = useState(false);
  const [cropImage, setCropImage] = useState<any>('');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [visibility, setVisibility] = useState<Array<number>>([0, 1]);

  //check file extension
  const fileExtension = file.file.split('.').pop();

  const getPlaceholder = (fileExtension: string): string => {
    const extensionToPlaceholder: { [key: string]: string } = {
      mp4: '/placeholder-video.svg',
      mov: '/placeholder-video.svg',
      avi: '/placeholder-video.svg',
      wmv: '/placeholder-video.svg',
      doc: '/placeholder-word.svg',
      docx: '/placeholder-word.svg',
      xls: '/placeholder-excel.svg',
      xlsx: '/placeholder-excel.svg',
      svg: '/placeholder-svg.svg',
      pdf: '/placeholder-pdf.svg',
      eps: '/placeholder-eps.svg',
      ai: '/placeholder-illustrator.svg',
      psd: '/placeholder-photoshop.svg',
      indd: '/placeholder-indesign.svg',
    };

    return extensionToPlaceholder[fileExtension] || 'placeholder-document.svg';
  };

  let placeholder = getPlaceholder(fileExtension);

  const downloadFile = async (id: number, filename: string, size: string) => {
    setDownloadingSize(size);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    const headers = {
      'Content-Type': 'application/json',
      ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
    };
    await fetch(process.env.REACT_APP_API_URL + '/download-file.php', {
      method: 'POST',
      mode: 'cors',
      headers,
      body: JSON.stringify({
        id: id,
        email: user.email || null,
        size,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // the filename you want
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setDownloadingSize('');
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        alert(error);
        setDownloadingSize('');
      });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const openCropTool = async (id: number) => {
    setLoadingCropTool(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
      };
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/get-cropper-image.php`,
        {
          method: 'POST',
          mode: 'cors',
          headers,
          body: JSON.stringify({
            id: id,
            email: user.email || null,
          }),
        }
      );

      const data = await response.json();

      if (data.base64) {
        setCropImage(data.base64);
        setShowCropTool(true);
      } else {
        alert('No image found');
      }
      setLoadingCropTool(false);
    } catch (error) {
      console.error('Error:', error);
      setLoadingCropTool(false);
      return null;
    }
  };
  const closeCropTool = () => {
    setShowCropTool(false);
  };

  useEffect(() => {
    const vis_array = JSON.parse(file.access_level);
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
  }, []);

  useEffect(() => {
    if (activeDownloadMenu === id) {
      setShowDownloadMenu(true);
    } else {
      setShowDownloadMenu(false);
    }
  }, [activeDownloadMenu]);

  const toggleActiveDownloadMenu = (id: string) => {
    if (activeDownloadMenu === id) {
      setActiveDownloadMenu(null);
    } else {
      setActiveDownloadMenu(id);
    }
  };

  const roles = JSON.parse(user.groups || '[]');

  const isSvg = file.file.endsWith('.svg');
  const mimeType = isSvg ? 'image/png' : 'image/jpeg'; // Default to PNG if not SVG

  return (
    <>
      {!hideItem && (
        <div
          className={`relative fade-in
        ${
          view === 'small' &&
          ' w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] xl:w-[calc(20%-1.6rem)] mb-3'
        }
        ${
          view === 'medium' &&
          '  w-[calc(50%-1rem)] lg:w-[calc(33.3%-1.33rem)] mb-5'
        } 
        ${view === 'large' && ' w-full lg:mb-10'} `}
        >
          <div
            className={`border-gray-100 border  rounded-md grid content-end items-end relative p-3 h-full relative overflow-hidden group`}
            key={file.ID}
          >
            <div
              className={`md:rounded-md grid content-end 
                ${view === 'small' && 'h-[160px]'} 
                ${view === 'medium' && 'h-[290px] lg:h-[200px] xl:h-[300px]'}
                ${view === 'large' && 'h-[180px] md:h-[500px]'}`}
            >
              {file.base64 ? (
                <img
                  src={`data:${mimeType};base64,${file.base64}`}
                  alt={file.file}
                  className={`${
                    isSvg ? 'object-scale-down p-2' : 'object-cover'
                  } w-full h-full  absolute top-0 left-0  `}
                />
              ) : (
                <img
                  src={placeholder}
                  alt={file.file}
                  className={`w-full h-full object-scale-down absolute top-0 left-0`}
                />
              )}

              {visibility.length > 1 && (
                <div className="relative flex-wrap content-center w-full gap-1 mr-5">
                  {(roles.includes(0) || roles.includes(1)) && (
                    <div className={`relative flex gap-1 `}>
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
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-2 mt-1">
            <div
              className={` ${
                view === 'small' ? 'max-w-[120px]' : 'max-w-[70%]'
              } relative flex items-center justify-start gap-2`}
            >
              <p
                title={file.file}
                className={`${
                  view === 'small' ? 'text-sm' : 'text-sm  lg:text-sm '
                } relative text-default overflow-hidden filename-ellipsis`}
              >
                {file.file}
              </p>
              {fileExtension === 'jpg' ||
              fileExtension === 'jpeg' ||
              fileExtension === 'JPEG' ||
              fileExtension === 'JPG' ||
              fileExtension === 'PNG' ||
              fileExtension === 'png' ? (
                <>
                  <div className="relative ">
                    <a
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80 group"
                      onClick={() => {
                        toggleActiveDownloadMenu(id);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        className={`p-[3px] stroke-default download-button h-6 w-6 inline-block transition-colors bg-opacity-50 cursor-pointer `}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                    </a>
                  </div>
                  {showDownloadMenu && (
                    <div className="download-menu absolute left-3 w-[150px] shadow py-1 bg-white rounded bottom-10">
                      {downloadingSize === 'small' ? (
                        <div className="my-[3px] mx-2">
                          <svg
                            className={`w-[20px] h-[20px] text-accent animate-spin`}
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
                      ) : (
                        <button
                          onClick={() =>
                            downloadFile(file.ID, file.file, 'small')
                          }
                          className="inline-block px-2 py-1 text-xs text-left hover:text-gray-400 size-button"
                        >
                          <span>Small</span>
                          {'  '}
                          <span className="text-gray-400">
                            ({dimensions?.small?.width}x
                            {dimensions?.small?.height})
                          </span>
                        </button>
                      )}
                      {downloadingSize === 'medium' ? (
                        <div className="my-[3px] mx-2">
                          <svg
                            className={`w-[20px] h-[20px] text-accent animate-spin`}
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
                      ) : (
                        <button
                          onClick={() =>
                            downloadFile(file.ID, file.file, 'medium')
                          }
                          className="inline-block px-2 py-1 text-xs text-left hover:text-gray-400 size-button"
                        >
                          <span>Medium</span>
                          {'  '}
                          <span className="text-gray-400">
                            ({dimensions?.medium?.width}x
                            {dimensions?.medium?.height})
                          </span>
                        </button>
                      )}
                      {downloadingSize === 'large' ? (
                        <div className="my-[3px] mx-2">
                          <svg
                            className={`w-[20px] h-[20px] text-accent animate-spin`}
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
                      ) : (
                        <button
                          onClick={() =>
                            downloadFile(file.ID, file.file, 'large')
                          }
                          className="inline-block px-2 py-1 text-xs text-left hover:text-gray-400 size-button"
                        >
                          <span>Large</span>
                          {'  '}
                          <span className="text-gray-400">
                            ({dimensions?.large?.width}x
                            {dimensions?.large?.height})
                          </span>
                        </button>
                      )}
                      <div className="w-full my-[3px] border-b border-gray-200"></div>
                      {downloadingSize === 'file' ? (
                        <div className="my-[3px] mx-2">
                          <svg
                            className={`w-[20px] h-[20px] text-accent animate-spin`}
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
                      ) : (
                        <button
                          onClick={() =>
                            downloadFile(file.ID, file.file, 'file')
                          }
                          className="inline-block px-2 py-1 mb-1 text-xs text-left hover:text-gray-400 size-button"
                        >
                          <span>Original</span>
                          {'  '}
                          <span className="text-gray-400">
                            ({dimensions?.original?.width}x
                            {dimensions?.original?.height})
                          </span>
                        </button>
                      )}
                      {loadingCropTool ? (
                        <div className="my-[3px] mx-2">
                          <svg
                            className={`w-[20px] h-[20px]  text-accent animate-spin`}
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
                      ) : (
                        <button
                          onClick={() => openCropTool(file.ID)}
                          className="inline-flex gap-2 px-2 py-1 text-xs text-left hover:text-gray-400 size-button"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 19 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.15234 1.06006V13.1154C4.15234 13.8752 4.76808 14.4909 5.52789 14.4909H17.5999"
                              stroke="#0C150A"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.5466 17.494V5.43868C14.5466 4.67887 13.9309 4.06314 13.1711 4.06314H1.10059"
                              stroke="#0C150A"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span> Crop image</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : downloadingSize === 'file' ? (
                <svg
                  className={`w-5 h-5  my-0.5 text-accent animate-spin`}
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
                  onClick={() => downloadFile(file.ID, file.file, 'file')}
                  className="inline-block text-xs text-left hover:text-gray-400 "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    className={`p-[3px] stroke-default  h-6 w-6 inline-block transition-colors bg-opacity-50 cursor-pointer `}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <p
                className={`relative text-gray-400
        ${view === 'small' ? 'text-xs' : 'text-sm'}
       `}
              >
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
        </div>
      )}
      {showCropTool && (
        <CropperTool
          file={file}
          toggleCropper={closeCropTool}
          image={`data:image/jpeg;base64,${cropImage}`}
        />
      )}
    </>
  );
};
export default BrandingFileItem;
