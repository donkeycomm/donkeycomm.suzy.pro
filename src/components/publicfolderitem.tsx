import type { FC } from 'react';
import { useState } from 'react';

interface folderitemProps {
  view: string;
  folder: any;
  selectFolder: (path: string) => void;
  index: number;
}

const FolderItem: FC<folderitemProps> = ({
  view,
  folder,
  selectFolder,

  index,
}) => {
  const date = new Date(folder.date);

  const readableDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      {view === 'list' ? (
        <div
          className={`flex justify-between w-full fade-in group xl:hover:bg-slate-100`}
          data-id={folder.ID}
        >
          <div className={`flex mb-2 md:mb-0 `}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              viewBox="0 0 256 250"
              xmlSpace="preserve"
              className={` ${
                view === 'list' ? ' min-w-[47px] w-12 h-12' : 'w-32 h-30'
              } mr-3 md:mr-5   transition-fill cursor-pointer`}
              onClick={() => {
                selectFolder(folder.path);
              }}
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
            <div
              className={`flex overflow-hidden max-w-full  flex items-center `}
            >
              <p
                className={`relative text-default text-xs md:text-sm overflow-hidden overflow-ellipsis max-h-[37px] md:max-h-auto`}
              >
                {folder.name}
              </p>
            </div>
          </div>
          <div className={`${'flex items-center'}`}>
            <p
              className={`relative ${
                view === 'list' && 'hidden lg:grid content-center'
              }
       text-xs text-gray-500`}
            >
              {readableDate}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div
            className={`${
              view === 'small' && 'h-[290px] lg:h-[300px] xl:h-[300px]'
            } 
              ${view === 'medium' && 'h-[290px] lg:h-[300px] xl:h-[400px]'}
              ${
                view === 'large' &&
                'h-[250px] md:h-[500px] lg:h-[550px] xl:h-[650px]'
              } relative w-full overflow-hidden  group grid shadow-md hover:shadow-none transition-shadow content-end cursor-pointer`}
          >
            {folder.base64 ? (
              <img
                src={`data:image/jpeg;base64,${folder.base64}`}
                alt={folder.name}
                className="absolute object-cover w-full h-full"
                onClick={() => selectFolder(folder.path)}
              />
            ) : (
              <img
                src={`/image-placeholder.jpg`}
                alt={folder.name}
                className="absolute object-cover w-full h-full"
                onClick={() => selectFolder(folder.path)}
              />
            )}
          </div>
          <div className="relative p-3 md:px-5 md:pb-0 md:pt-5">
            <p
              className={` text-xs  text-grey-400 uppercase w-auto inline-block`}
            >
              {folder.name}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
export default FolderItem;
