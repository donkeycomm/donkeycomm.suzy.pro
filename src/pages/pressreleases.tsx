import type { FC } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import PressReleaseList from '../components/pressreleaselist';
import AddPressRelease from '../components/addpressrelease';
import Footer from '../components/footer';

//make an infterface for the props

const PressReleases: FC = () => {
  const [counter, setCounter] = useState(0);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [showAddPressRelease, setShowAddPressRelease] = useState(false);

  const updateCounter = () => {
    setCounter(counter + 1);
  };

  const toggleAddPressReleaseModal = () => {
    setShowAddPressRelease(!showAddPressRelease);
  };

  const roles = JSON.parse(user.groups || '[]');

  return (
    <>
      <div className="px-5 pb-10 lg:px-20 md:px-10 md:pb-20 lg:pb-32">
        <div className="container min-h-screen mx-auto">
          {(roles.includes(0) || roles.includes(1)) && (
            <div className="flex gap-3 py-2 mb-3 fade-in">
              <button
                onClick={toggleAddPressReleaseModal}
                className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              >
                Add a press release
              </button>
            </div>
          )}

          {(roles.includes(0) || roles.includes(1)) && showAddPressRelease && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
              <div className="w-full md:w-[500px] overflow-y-scroll max-w-full mx-auto">
                <AddPressRelease
                  toggleAddPressReleaseModal={toggleAddPressReleaseModal}
                  refreshCounter={counter}
                  refresh={updateCounter}
                />
              </div>
            </div>
          )}
          <div className="mb-10">
            <PressReleaseList refreshCounter={counter} />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default PressReleases;
