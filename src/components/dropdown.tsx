import { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface dropdownProps {
  items: any[];
  selectItem: (item: any) => void;
}

const Dropdown: React.FC<dropdownProps> = ({ items, selectItem }) => {
  const [selectedSubject, setSelectedSubject] = useState('Select a mailing');
  const setSubjectString = (item: any) => {
    const dateString = new Date(item.date)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      })
      .replace(/(\d{2})$/, "'$1");

    setSelectedSubject(dateString + ' - ' + item.subject);
  };
  return (
    <Menu
      as="div"
      className="relative flex-grow max-w-[300px] md:max-w-[350px] inline-block text-left"
    >
      <div>
        <MenuButton className="inline-flex w-full  items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-xs md:text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <span className="flex-auto truncate">{selectedSubject}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="w-5 h-5 -mr-1 text-gray-400"
          />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute left-0 z-10 mt-2 w-full min-w-[300px] max-w-full md:max-w-[400px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          {Array.isArray(items) &&
            items.length > 0 &&
            items.map((item) => (
              <MenuItem key={item.tag}>
                <a
                  onClick={() => {
                    selectItem(item);
                    setSubjectString(item);
                  }}
                  className="flex gap-4 items-center px-4 py-2 text-sm cursor-pointer text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-700"
                >
                  <span className="block min-w-[80px] px-2 py-1 text-xs leading-none uppercase bg-gray-200 rounded-sm">
                    {new Date(item.date)
                      .toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })
                      .replace(/(\d{2})$/, "'$1")}
                  </span>
                  <span className="flex-auto truncate">{item.subject}</span>
                </a>
              </MenuItem>
            ))}
        </div>
      </MenuItems>
    </Menu>
  );
};
export default Dropdown;
