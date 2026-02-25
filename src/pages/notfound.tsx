import type { FC } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactList from '../components/contactlist';
import RegisterContact from '../components/registercontact';
import CreateContactList from '../components/createcontactlist';
import ContactLists from '../components/contactlists';
import AppContext from '../utils/appContext';
import AddPressRelease from '../components/addpressrelease';
import Footer from '../components/footer';

//make an infterface for the props

const NotFound: FC = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );

  const roles = JSON.parse(user.groups || '[]');

  return (
    <div className="flex flex-col min-h-screen px-5 py-12 bg-shade fade-in lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-2xl text-center">DonkeyComm</h1>
        <h2 className="mt-10 text-base font-normal text-center text-gray-900">
          Page not found...
        </h2>
        <div className="text-center mt-7">
          <a
            href="/"
            className="justify-center w-auto px-4 py-2 mx-auto text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
