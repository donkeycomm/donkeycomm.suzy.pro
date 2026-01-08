import { type FC, useState, useEffect } from 'react';

interface pressreleaseProps {
  pressrelease: any;
}

const PressReleaseHome: FC<pressreleaseProps> = ({ pressrelease }) => {
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
export default PressReleaseHome;
