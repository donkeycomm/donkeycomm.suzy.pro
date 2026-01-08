import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface contactProps {
  contact: any;
  selectedContacts: Array<number>;
  selectContact: Function;
  contactLists: Array<any>;
}

const Contact: FC<contactProps> = ({
  contact,
  selectedContacts,
  selectContact,
  contactLists,
}) => {
  const [hideItem, setHideItem] = useState(false);
  const navigate = useNavigate();
  const contactList = JSON.parse(contact.contact_list);

  const contactListNames = contactList.map((list: number | string) => {
    const listName = contactLists.find((l: any) => l.ID === Number(list));
    return listName?.name;
  });
  return (
    !hideItem && (
      <div className="flex w-full py-1 border-t border-suzy-gray ">
        <div className="w-[50px] grid content-center flex-shrink-0">
          <button
            className={`${
              selectedContacts.includes(contact.ID)
                ? 'bg-default border-default'
                : 'bg-white border-gray-300'
            } grid p-0.5 content-center inline-block w-5 h-5 mr-5 border rounded cursor-pointer `}
            onClick={() => selectContact(contact.ID)}
          >
            <span>
              {selectedContacts.includes(contact.ID) && (
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
        </div>
        <div className="grid content-center py-2 px-6 flex-shrink-0 w-[150px]">
          <p
            onClick={() => navigate(`/contacts/${contact.ID}`)}
            title={contact.lastname}
            className="overflow-hidden text-sm cursor-pointer overflow-ellipsis"
          >
            {contact.lastname}
          </p>
        </div>
        <div className="grid content-center py-2 px-6 flex-shrink-0 w-[150px]">
          <p
            onClick={() => navigate(`/contacts/${contact.ID}`)}
            title={contact.firstname}
            className="overflow-hidden text-sm cursor-pointer overflow-ellipsis"
          >
            {contact.firstname}
          </p>
        </div>
        <div className="grid content-center py-2 px-6 flex-shrink-0 w-[180px]">
          <p
            title={contact.email}
            className="overflow-hidden text-sm overflow-ellipsis"
          >
            {contact.email}
          </p>
        </div>
        <div className="grid content-center py-2 px-6 flex-shrink-0 w-[180px]">
          <p
            title={contact.phone}
            className="overflow-hidden text-sm overflow-ellipsis"
          >
            {contact.phone}
          </p>
        </div>
        <div className="grid content-center py-2 px-6 flex-shrink-0 w-[150px]">
          <p
            title={contact.title}
            className="overflow-hidden text-sm overflow-ellipsis"
          >
            {contact.title}
          </p>
        </div>

        <div className="grid content-center py-2 flex-shrink-0 px-6 min-w-[150px]">
          {' '}
          <p
            title={contact.company}
            className="overflow-hidden text-sm overflow-ellipsis"
          >
            {contact.company}
          </p>
        </div>
        <div className="grid content-center py-2 flex-grow px-6 w-[180px]">
          {' '}
          <p title={contactListNames.join(', ')} className="text-sm ">
            {contactListNames.join(', ')}
          </p>
        </div>
      </div>
    )
  );
};
export default Contact;
