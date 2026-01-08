import type { FC } from 'react';

import { useState } from 'react';

import PublicFileBrowser from '../components/publicfilebrowser';
import SearchFiles from '../components/searchpublicfiles';

const Public: FC = () => {
  const [folderPath, setFolderPath] = useState<string>('/');

  const updateFolderPath = (path: string) => {
    setFolderPath(path);
  };
  const goBack = () => {
    if (folderPath === '/') {
      return;
    }
    const path = folderPath.split('/');
    path.pop();
    setFolderPath('/' + path[path.length - 1]);
  };
  return (
    <div className="max-w-[1400px] mx-auto p-5 md:px-5 lg:px-10 xl:px-16 ">
      <div className="flex justify-between border-b border-gray-300">
        <button
          onClick={goBack}
          className="text-xs uppercase transition-all outline-none hover:text-gray-400"
        >{`< back`}</button>
        <SearchFiles updateFolderPath={updateFolderPath} path={folderPath} />
      </div>
      <div className="text-center mt-7">
        <img
          src="/Logo.png"
          alt="Suzy"
          className="inline-block w-auto cursor-pointer max-h-12 md:max-h-16 lg:max-h-24"
          onClick={() => updateFolderPath('/')}
        />
      </div>
      <PublicFileBrowser
        folderPath={folderPath}
        changeFolderPath={updateFolderPath}
      />
      <div className="flex justify-between">
        <a
          href="/login"
          className="text-sm transition-all outline-none hover:text-gray-400"
        >{`login`}</a>
        <img src="/Suzy-single.png" alt="Suzy" className="w-auto max-h-5" />
      </div>
    </div>
  );
};
export default Public;
