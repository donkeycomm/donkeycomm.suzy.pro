import type { FC } from 'react';
import { useEffect, useState } from 'react';
interface fileitemProps {
  view: string;
  file: any;
  select: () => void;
  selected: boolean;
}

const BinItem: FC<fileitemProps> = ({ view, file, select, selected }) => {
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [hideItem, setHideItem] = useState(false);
  //check file extension
  const fileExtension = file.file_name.split('.').pop();

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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    user.email &&
      (await fetch(
        process.env.REACT_APP_API_URL + '/download-file-from-trash.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            id: id,
            email: user.email,
          }),
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
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
        }));
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

  return (
    <>
      {!hideItem && view === 'list' ? (
        <div className="flex w-full py-3 border-t border-suzy-gray ">
          <div className="w-[50px] grid content-center flex-shrink-0">
            <button
              className={`${
                selected
                  ? 'bg-default border-default'
                  : 'bg-white border-gray-300'
              } grid p-0.5 content-center inline-block w-5 h-5 mr-5 border rounded cursor-pointer `}
              onClick={select}
            >
              <span>
                {selected && (
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
                )}
              </span>
            </button>
          </div>
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
                  src={placeholder}
                  alt={file.file}
                  className={`w-full h-full object-scale-down absolute top-0 left-0'`}
                />
              )}
            </div>
          </div>
          <div className="grid content-center px-6 flex-grow min-w-[100px]">
            <p
              title={file.file_name}
              className="relative m-0 overflow-hidden text-xs md:text-sm filename-ellipsis"
            >
              {file.file_name}
            </p>
          </div>

          <div className="w-[150px] px-6 grid content-center flex-shrink-0">
            <p className="relative m-0 text-xs text-gray-400 md:text-sm">
              {readableDate}
            </p>
          </div>
          <div className="px-6 w-[120px] grid content-center flex-shrink-0">
            <p className="relative m-0 text-xs text-gray-400 md:text-sm">
              {formatBytes(file.size)}
            </p>
          </div>
          <div className="px-6 w-[160px] grid content-center relative flex-shrink-0">
            {loadingDownload ? (
              <svg
                className={`${
                  view !== 'list' && 'absolute right-1 top-1'
                } w-5 h-5 md:w-6 md:h-6 text-accent animate-spin`}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                onClick={() => downloadFile(file.ID, file.file_name)}
                className={`p-[3px] stroke-gray-400 hover:stroke-default transition-color download-button h-6 w-6 inline-block transition-colors bg-opacity-50 cursor-pointer `}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            )}
          </div>
        </div>
      ) : (
        <>
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
        ${view === 'large' && ' w-full mb-10'} `}
          >
            <div
              className={`border-gray-100 border  rounded-md grid content-end items-end relative p-3 h-full relative overflow-hidden group`}
              key={file.ID}
            >
              <div
                className={`md:rounded-md grid content-end 
                ${view === 'small' && 'h-[160px]'} 
                ${view === 'medium' && 'h-[290px] lg:h-[300px]'}
                ${view === 'large' && 'h-[180px] md:h-[500px]'}`}
              >
                {file.base64 ? (
                  <img
                    src={`data:image/jpeg;base64,${file.base64}`}
                    alt={file.file}
                    className={`w-full h-full  absolute top-0 left-0 object-cover `}
                  />
                ) : (
                  <img
                    src={placeholder}
                    alt={file.file}
                    className={`w-full h-full object-scale-down absolute top-0 left-0`}
                  />
                )}
              </div>

              <button
                className={`${
                  selected
                    ? 'bg-default border-default'
                    : 'border-gray-300 hidden group-hover:block'
                } grid p-0.5 content-center inline-block w-5 h-5  border absolute top-3 right-3 rounded cursor-pointer `}
                onClick={select}
              >
                <span>
                  {selected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between px-2 mt-1">
              <div
                className={`${
                  view === 'small' ? 'max-w-[120px]' : 'max-w-[70%]'
                } relative flex items-center justify-start gap-2`}
              >
                <p
                  title={file.file_name}
                  className={`${
                    view === 'small' ? 'text-sm' : 'text-sm md:text-base'
                  } relative text-default overflow-hidden filename-ellipsis`}
                >
                  {file.file_name}
                </p>
                <div className="relative ">
                  {loadingDownload ? (
                    <svg
                      className={`my-[3px] w-5 h-5 text-accent animate-spin`}
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
                      className="cursor-pointer hover:opacity-80 group"
                      onClick={() => {
                        downloadFile(file.ID, file.file_name);
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
                    </button>
                  )}
                </div>
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
        </>
      )}
    </>
  );
};
export default BinItem;
