import type { FC } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactList from '../components/contactlist';
import RegisterContact from '../components/registercontact';
import CreateContactList from '../components/createcontactlist';
import ContactLists from '../components/contactlists';
import AppContext from '../utils/appContext';
import Icon from '../components/icons';
import Footer from '../components/footer';

//make an infterface for the props
interface ContactsProps {}
const Contacts: FC<ContactsProps> = ({}) => {
  const [counter, setCounter] = useState(0);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateContactList, setShowCreateContactList] = useState(false);
  const [showManageContactLists, setShowManageContactLists] = useState(false);
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const updateCounter = () => {
    setCounter(counter + 1);
  };
  const checkStatus = async () => {
    const storedJWT = localStorage.getItem('jwt');

    if (storedJWT) {
      await fetch(process.env.REACT_APP_API_URL + '/check-status.php', {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: 'Bearer ' + storedJWT,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data == 'success') {
            console.log('success');
          } else {
            localStorage.clear();
            context?.updateLoginStatus(false);
            navigate('/login');
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          localStorage.clear();
          context?.updateLoginStatus(false);
          navigate('/login');
        });
    } else {
      console.log('not logged in');
      localStorage.clear();
      context?.updateLoginStatus(false);
      navigate('/login');
    }
  };

  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  const toggleAddContactModal = () => {
    setShowAddContact(!showAddContact);
    setShowCreateContactList(false);
    setShowManageContactLists(false);
  };
  const toggleCreateContactListModal = () => {
    setShowCreateContactList(!showCreateContactList);
    setShowAddContact(false);
    setShowManageContactLists(false);
  };
  const toggleManageContactListsModal = () => {
    setShowManageContactLists(!showManageContactLists);
    setShowCreateContactList(false);
    setShowAddContact(false);
  };
  useEffect(() => {
    checkStatus();
  }, []);
  const roles = JSON.parse(user.groups || '[]');

  return (
    <>
      <div className="px-5 lg:px-20 md:px-10">
        <div className="container min-h-screen mx-auto">
          <div className="flex gap-3 py-2 mb-3 fade-in">
            <button
              onClick={toggleAddContactModal}
              className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
            >
              Add a contact
            </button>
            <button
              onClick={toggleCreateContactListModal}
              className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
            >
              Create a contact list
            </button>
            <button
              onClick={toggleManageContactListsModal}
              className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
            >
              Manage contact lists
            </button>
          </div>
          <ContactList refreshCounter={counter} />
          {(roles.includes(0) || roles.includes(1)) && showAddContact && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
              <div className="w-full md:w-[500px] overflow-y-scroll max-w-full mx-auto">
                <RegisterContact
                  toggleAddContactModal={toggleAddContactModal}
                  refreshCounter={counter}
                  refresh={updateCounter}
                />
              </div>
            </div>
          )}
          {(roles.includes(0) || roles.includes(1)) &&
            showCreateContactList && (
              <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
                <div className="w-full md:w-[400px] max-w-full mx-auto">
                  <CreateContactList
                    toggleCreateContactListModal={toggleCreateContactListModal}
                    refresh={updateCounter}
                  />
                </div>
              </div>
            )}
          {(roles.includes(0) || roles.includes(1)) &&
            showManageContactLists && (
              <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
                <div className="w-full md:w-[400px] max-w-full mx-auto">
                  <ContactLists
                    toggleManageContactListsModal={
                      toggleManageContactListsModal
                    }
                    refresh={updateCounter}
                  />
                </div>
              </div>
            )}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default Contacts;
