import { FC, useState, useEffect } from 'react';

interface emailtemplateProps {
  template: any;
  loadTemplate: (template: any) => void;
}

const EmailTemplate: FC<emailtemplateProps> = ({ template, loadTemplate }) => {
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [hideItem, setHideItem] = useState(false);
  const uploadTemplate = async (template: any) => {
    loadTemplate(template);
  };
  const deleteTemplate = async (id: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this template?'
    );
    if (!confirmDelete) {
      return;
    }
    setLoadingDelete(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    user.email &&
      (await fetch(
        process.env.REACT_APP_API_URL + '/delete-email-template.php',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + storedJWT,
          },
          body: JSON.stringify({
            id: id,
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.message === 'success') {
            setHideItem(true);
          } else if (data.error) {
            alert(data.error);
            setLoadingDelete(false);
          } else {
            alert('Failed, try again');
            setLoadingDelete(false);
          }
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          alert(error);
          setLoadingDelete(false);
        }));
  };

  return (
    !hideItem && (
      <div className="w-[250px] fade-in h-[250px] group border hover:border-default relative overflow-hidden">
        <img
          src={`${'data:image/jpeg;base64,' + template.base64}`}
          className="absolute object-contain w-full h-full "
        />
        {/* <div
          className="w-full h-auto absolute top-0 left-0 scale-[0.1]"
          dangerouslySetInnerHTML={{ __html: template.template_html }}
        /> */}
        <div className="absolute top-2 left-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="#ffffff"
            className=" p-1 transition-colors  group-hover:inline-block   bg-opacity-50 rounded-md cursor-pointer w-7 h-7  bg-slate-700 hover:bg-green-600 `}"
            onClick={() => uploadTemplate(template)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <div className="absolute hidden top-2 right-2 group-hover:inline-block">
          {loadingDelete ? (
            <svg
              className={`w-6 h-6 animate-spin `}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#ffffff"
              className={` 
                  p-1 transition-colors  group-hover:inline-block   bg-opacity-50 rounded-md cursor-pointer w-7 h-7  bg-slate-700 hover:bg-red-700 `}
              onClick={() => deleteTemplate(template.ID)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          )}
        </div>
      </div>
    )
  );
};
export default EmailTemplate;
