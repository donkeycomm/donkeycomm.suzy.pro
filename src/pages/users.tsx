import type { FC } from 'react';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/userlist';
import RegisterUser from '../components/registeruser';
import RegisterGroup from '../components/registergroup';
import GroupList from '../components/grouplist';
import AppContext from '../utils/appContext';
import Icon from '../components/icons';
import Footer from '../components/footer';

const Users: FC = ({}) => {
  const [counter, setCounter] = useState(0);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [groups, setGroups] = useState<Array<any>>([]);
  const [showRegisterUser, setShowRegisterUser] = useState(false);
  const [showRegisterGroup, setShowRegisterGroup] = useState(false);
  const [showManageGroups, setShowManageGroups] = useState(false);
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
  const getgroups = async () => {
    const storedJWT = localStorage.getItem('jwt');
    await fetch(process.env.REACT_APP_API_URL + '/get-all-groups.php', {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: 'Bearer ' + storedJWT,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setGroups(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const logout = () => {
    localStorage.clear();
    context?.updateLoginStatus(false);
    navigate('/login');
  };
  const toggleRegisterUserModal = () => {
    setShowRegisterUser(!showRegisterUser);
  };
  const toggleRegisterGroupModal = () => {
    setShowRegisterGroup(!showRegisterGroup);
  };
  const toggleManageGroupsModal = () => {
    setShowManageGroups(!showManageGroups);
  };
  useEffect(() => {
    if (user.groups?.includes(0) || user.groups?.includes(1)) {
      getgroups();
    }
    checkStatus();
  }, []);

  const roles = JSON.parse(user.groups || '[]');

  return (
    <>
      <div className="px-5 lg:px-20 md:px-10">
        <div className="container min-h-screen mx-auto ">
          <div className="flex gap-3 py-2 mb-3 fade-in">
            <button
              onClick={toggleRegisterUserModal}
              className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
            >
              Register a user
            </button>
            <button
              onClick={toggleRegisterGroupModal}
              className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
            >
              Create a group
            </button>
            <button
              onClick={toggleManageGroupsModal}
              className="px-4 py-2 text-xs text-gray-500 transition-all rounded-md ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
            >
              Manage groups
            </button>
          </div>
          <UserList refreshCounter={counter} groups={groups} />
          {(roles?.includes(0) || roles?.includes(1)) && showRegisterUser && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
              <div className="w-full md:w-[500px] max-w-full mx-auto">
                <RegisterUser
                  groups={groups}
                  toggleRegisterUserModal={toggleRegisterUserModal}
                  refresh={updateCounter}
                />
              </div>
            </div>
          )}
          {roles?.includes(0) && showRegisterGroup && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
              <div className="w-full md:w-[500px] max-w-full mx-auto">
                <RegisterGroup
                  toggleRegisterGroupModal={toggleRegisterGroupModal}
                  refresh={updateCounter}
                />
              </div>
            </div>
          )}
          {roles?.includes(0) && showManageGroups && (
            <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
              <div className="w-full md:w-[500px] max-w-full mx-auto">
                <GroupList
                  toggleManageGroupsModal={toggleManageGroupsModal}
                  refreshCounter={counter}
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
export default Users;
