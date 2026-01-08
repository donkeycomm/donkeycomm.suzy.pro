import React from 'react';
import Home from '../icons/home'; // Import icons from React Icons
import Members from '../icons/members';
import Files from '../icons/files';
import Logout from '../icons/logout';
import Bin from '../icons/bin';
import Contact from '../icons/contact';
import Cart from '../icons/cart';
import Email from '../icons/email';
import Groups from '../icons/groups';
interface IconProps {
  iconName: string; // Specify the allowed icon names
}
const Icon: React.FC<IconProps> = ({ iconName }) => {
  switch (iconName) {
    case 'home':
      return <Home />;
    case 'members':
      return <Members />;
    case 'contact':
      return <Contact />;
    case 'files':
      return <Files />;
    case 'cart':
      return <Cart />;
    case 'bin':
      return <Bin />;
    case 'groups':
      return <Groups />;
    case 'email':
      return <Email />;
    case 'logout':
      return <Logout />;
    default:
      return null; // Handle unknown icons or return a default icon
  }
};

export default Icon;
