import { FC, useState } from 'react';
import CropperTool from './cropper';
interface fileitemProps {
  view: string;
  file: any;
}

const FileItem: FC<fileitemProps> = ({ view, file }) => {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingLowResDownload, setLoadingLowResDownload] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [loadingCropTool, setLoadingCropTool] = useState(false);
  const [cropImage, setCropImage] = useState<any>('');
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

  const downloadFile = async (id: number, filename: string) => {
    setLoadingDownload(true);

    await fetch(process.env.REACT_APP_API_URL + '/download-public-file.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
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
        setLoadingDownload(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        alert(error);
        setLoadingDownload(false);
      });
  };

  const downloadLowResFile = async (id: number, filename: string) => {
    setLoadingLowResDownload(true);

    await fetch(
      process.env.REACT_APP_API_URL + '/download-public-lowres-file.php',
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
        }),
      }
    )
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
        setLoadingLowResDownload(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        alert(error);
        setLoadingLowResDownload(false);
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
  //create a readable date from file.date
  const date = new Date(file.date);

  const readableDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const openCropTool = async (id: number) => {
    setLoadingCropTool(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/get-public-cropper-image.php`,
        {
          method: 'POST',
          mode: 'cors',

          body: JSON.stringify({
            id: id,
          }),
        }
      );

      const data = await response.json();
      console.log(data);
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
  return (
    <div
      className={` ${
        view === 'list'
          ? 'mb-5 md:mb-2 h-auto xl:flex transition justify-between max-w-full '
          : 'relative fade-in'
      }  w-full `}
    >
      <div
        className={`
        ${
          view === 'list'
            ? 'md:mb-2 py-3 w-full md:py-5 xl:py-0 border-b xl:border-none h-auto xl:flex transition justify-between max-w-full  '
            : 'border-gray-100 border grid content-end items-end relative p-3 '
        }
          relative  group`}
        key={file.ID}
      >
        <div
          className={`${
            view !== 'list' ? 'mb-2 grid content-end' : 'flex  mb-4 xl:mb-0'
          } 
            ${view === 'small' && 'h-[200px] lg:h-[200px] xl:h-[200px]'} 
            ${view === 'medium' && 'h-[290px] lg:h-[300px] xl:h-[400px]'}
            ${
              view === 'large' &&
              'h-[250px] md:h-[500px] lg:h-[550px] xl:h-[650px]'
            }`}
        >
          {file.base64 ? (
            <img
              src={`data:image/jpeg;base64,${file.base64}`}
              alt={file.file}
              className={`${
                view === 'list'
                  ? 'h-10 w-10 inline-block object-contain mb-1 md:mb-0 mr-3 md:mr-5 object-left'
                  : 'w-full h-full  absolute top-0 left-0 object-cover'
              } 
        `}
            />
          ) : (
            <img
              src={placeholder}
              alt={file.file}
              className={`${
                view === 'list'
                  ? 'h-10 w-10 inline-block mr-3 md:mr-5 object-contain object-left'
                  : 'w-full h-full object-scale-down absolute top-0 left-0 '
              }  
    `}
            />
          )}
          {view !== 'list' && (
            <div className="absolute top-0 left-0 w-full h-full transition-opacity opacity-50 bg-gradient-to-t via-transparent from-black group-hover:opacity-0" />
          )}

          <div
            className={`${
              view === 'list' && ' max-w-[400px]'
            } grid items-center content-center w-full`}
          >
            <p
              title={file.file}
              className={`relative ${
                view === 'list'
                  ? 'text-default pr-12 max-h-[42px]  md:max-h-auto  '
                  : 'text-white '
              }
         text-xs md:text-sm
           pr-5 overflow-hidden filename-ellipsis `}
            >
              {file.file}
            </p>
          </div>
        </div>

        <div
          className={`${
            view !== 'list'
              ? 'flex justify-between flex-wrap'
              : 'flex items-center align-right '
          } `}
        >
          {view === 'list' && (
            <div className="relative flex flex-wrap items-center gap-5 mr-5">
              {fileExtension === 'jpg' ||
              fileExtension === 'jpeg' ||
              fileExtension === 'png' ? (
                <>
                  {loadingCropTool ? (
                    <svg
                      className={` w-5 h-5  text-accent animate-spin`}
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
                    <a
                      className="text-xs cursor-pointer hover:text-accent"
                      onClick={() => openCropTool(file.ID)}
                    >
                      Crop
                    </a>
                  )}
                  <div className="relative grid text-xs cursor-pointer group/download-image">
                    {loadingLowResDownload || loadingDownload ? (
                      <div className="w-[77px] flex justify-center">
                        {' '}
                        <svg
                          className={` w-5 h-5  text-accent animate-spin`}
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
                      <>
                        <p className="flex gap-1 py-0.5">
                          Download{' '}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-auto"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </p>
                        <div className="absolute hidden gap-1 -bottom-[44px] left-0 group-hover/download-image:grid w-[100px] p-1">
                          <a
                            className="hover:text-accent"
                            onClick={() =>
                              downloadLowResFile(file.ID, file.file)
                            }
                          >
                            Low-res
                          </a>
                          <a
                            className="hover:text-accent"
                            onClick={() => downloadFile(file.ID, file.file)}
                          >
                            High-res
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <a
                  className="cursor-pointer group/download"
                  onClick={() => downloadFile(file.ID, file.file)}
                >
                  {loadingDownload ? (
                    <svg
                      className={` w-5 h-5 text-accent animate-spin`}
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
                    <span className={`${'text-xs'} py-0.5`}>Download</span>
                  )}
                </a>
              )}
            </div>
          )}
          <p
            className={`relative ${
              view === 'list'
                ? 'hidden md:block text-gray-500 pr-12 text-xs'
                : ' text-white'
            }
       text-sm
           pr-5`}
          >
            {readableDate}
          </p>
          <p
            className={`relative ${
              view === 'list'
                ? 'hidden text-xs xl:text-sm  md:block text-gray-500 pr-5'
                : 'text-white '
            }
         text-sm
         `}
          >
            {formatBytes(file.size)}
          </p>
        </div>
      </div>
      {view !== 'list' && (
        <div
          className={`${
            view === 'small' ? 'lg:p-3  mt-1' : 'lg:p-5 md:mt-3'
          } relative p-2  `}
        >
          {fileExtension === 'jpg' ||
          fileExtension === 'JPEG' ||
          fileExtension === 'JPG' ||
          fileExtension === 'PNG' ||
          fileExtension === 'jpeg' ||
          fileExtension === 'png' ? (
            <>
              <div className="flex flex-wrap justify-between w-full gap-5">
                <>
                  <div className="relative z-10 grid text-xs cursor-pointer md:text-base group/download-image">
                    {loadingLowResDownload || loadingDownload ? (
                      <div className="w-[77px] flex justify-center">
                        {' '}
                        <svg
                          className={`${view === 'small' && 'w-5 h-5'} 
                              ${view === 'medium' && ' w-5 h-5'}
                              ${view === 'large' && 'w-5 h-5 md:w-6 md:h-6'}
                                text-accent animate-spin`}
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
                      <>
                        <p
                          className={`${
                            view === 'small' ? 'text-xs' : 'text-xs lg:text-sm'
                          } flex gap-1 py-0.5`}
                        >
                          Download{' '}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-4 h-auto`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </p>
                        <div
                          className={`${
                            view === 'small' && 'text-xs -bottom-[48px] pt-2'
                          }
                            ${
                              view === 'medium' &&
                              'text-xs lg:text-sm  -bottom-[54px] pt-2'
                            } 
                               ${
                                 view === 'large' &&
                                 'text-xs lg:text-sm  -bottom-[54px] pt-2'
                               } 
                          } absolute bg-white hidden gap-1  left-0 group-hover/download-image:grid w-[100px] p-1`}
                        >
                          <a
                            className="hover:text-accent"
                            onClick={() =>
                              downloadLowResFile(file.ID, file.file)
                            }
                          >
                            Low-res
                          </a>
                          <a
                            className="hover:text-accent"
                            onClick={() => downloadFile(file.ID, file.file)}
                          >
                            High-res
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                  {loadingCropTool ? (
                    <svg
                      className={` w-5 h-5  text-accent animate-spin`}
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
                    <a
                      className={`${
                        view === 'small' ? 'text-xs' : 'text-xs lg:text-sm'
                      } cursor-pointer  hover:text-accent`}
                      onClick={() => openCropTool(file.ID)}
                    >
                      Crop
                    </a>
                  )}
                </>
              </div>
            </>
          ) : (
            <a
              className="items-center inline-block w-auto gap-2 cursor-pointer hover:text-accent group"
              onClick={() => downloadFile(file.ID, file.file)}
            >
              {loadingDownload ? (
                <svg
                  className={` w-5 h-5 md:w-6 md:h-6 text-accent animate-spin`}
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
                <span
                  className={`${
                    view === 'small' ? 'text-xs' : 'text-xs lg:text-sm'
                  } py-0.5`}
                >
                  Download
                </span>
              )}
            </a>
          )}
        </div>
      )}
      {showCropTool && (
        <CropperTool
          file={file}
          toggleCropper={closeCropTool}
          image={`data:image/jpeg;base64,${cropImage}`}
        />
      )}
    </div>
  );
};
export default FileItem;
