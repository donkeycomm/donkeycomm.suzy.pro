import { type FC, useState, useEffect } from 'react';

interface pressreleaseProps {
  pressrelease: any;
  selectItem: (id: number) => void;
  selectedItems: Array<number>;
}

const PressRelease: FC<pressreleaseProps> = ({
  pressrelease,
  selectItem,
  selectedItems,
}) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const roles = JSON.parse(user.groups || '[]');
  useEffect(() => {
    console.log(selectedItems);
  }, [selectedItems]);
  return (
    <div className="grid content-between mb-5 md:mb-10">
      <div className="top">
        <div className="relative h-[250px] md:h-[300px] group rounded-lg overflow-hidden">
          {pressrelease.base64 ? (
            <img
              src={`data:image/jpeg;base64,${pressrelease.base64}`}
              alt={pressrelease.name}
              className="absolute object-cover w-full h-full"
            />
          ) : (
            <img
              src={`/folder-placeholder.jpg`}
              alt={pressrelease.name}
              className="absolute object-cover w-full h-full"
            />
          )}
          {(roles.includes(0) || roles.includes(1)) && (
            <>
              <div className="absolute top-0 left-0 w-full h-full transition-opacity opacity-0 bg-default group-hover:opacity-40" />
              <button
                className={`${
                  selectedItems.includes(pressrelease.ID)
                    ? 'bg-default border-default'
                    : 'border-gray-300 hidden group-hover:block'
                } grid p-0.5 content-center inline-block w-5 h-5  border absolute top-3 right-3 rounded cursor-pointer `}
                onClick={() => selectItem(pressrelease.ID)}
              >
                <span>
                  {selectedItems.includes(pressrelease.ID) && (
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
            </>
          )}
        </div>
        <p className="my-3 text-sm text-gray-400"> {pressrelease.date}</p>
        <h3 className="mb-3 text-lg md:text-xl">{pressrelease.title}</h3>
        <div
          dangerouslySetInnerHTML={{ __html: pressrelease.text }}
          className="text-gray-400"
        />
      </div>
      <div className="bottom">
        <a
          download
          target="_blank"
          href={
            process.env.REACT_APP_CUSTOMER_PUBLIC_FILES_URL +
            '/' +
            pressrelease.file
          }
          className="flex items-center gap-2 mt-5 transition cursor-pointer hover:text-gray-500"
        >
          <span>Download press release</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            className="p-[3px] stroke-default h-6 w-6 inline-block transition-colors bg-opacity-50 cursor-pointer "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  );
};
export default PressRelease;
