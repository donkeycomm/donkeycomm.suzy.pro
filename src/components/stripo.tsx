import React, { useEffect, useState, useRef } from 'react';
import EmailTemplate from './emailtemplate';
import html2canvas from 'html2canvas';
import SendMail from './sendmail';
import SendTestMail from './sendtestmail';
import defaultHtml from '../data/stripo/html';
import defaultCss from '../data/stripo/css';
// Define types for Stripo initialization
interface StripoTemplate {
  html: string;
  css: string;
}

interface Notifications {
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  loader: (message: string) => void;
  hide: (message: string) => void;
  success: (message: string) => void;
}

declare global {
  interface Window {
    Stripo: any;
    StripoApi: any;
  }
}
interface mailBuilderProps {
  toggleActiveTab: () => void;
}

const StripoEmailBuilder: React.FC<mailBuilderProps> = ({
  toggleActiveTab,
}) => {
  const stripoSettingsRef = useRef<HTMLDivElement>(null);
  const stripoPreviewRef = useRef<HTMLDivElement>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<Array<any>>([]);
  const [saveText, setSaveText] = useState('');
  const [modal, showModal] = useState(false);
  const [testModal, showTestModal] = useState(false);
  const [message, setMessage] = useState<string>('');

  const request = (
    method: string,
    url: string,
    data: string | null,
    callback: (response: string) => void
  ) => {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState === 4 && req.status === 200) {
        callback(req.responseText);
      } else if (req.readyState === 4 && req.status !== 200) {
        console.error(
          'Cannot complete request. Please check you entered valid PLUGIN_ID and SECRET_KEY values'
        );
      }
    };
    req.open(method, url, true);
    if (method !== 'GET') {
      req.setRequestHeader('Content-Type', 'application/json');
    }
    req.send(data);
  };
  const loadDemoTemplate = (callback: (template: StripoTemplate) => void) => {
    callback({ html: defaultHtml, css: defaultCss });
  };
  const saveTemplate = async (html: string, css: string) => {
    setLoadingSave(true);
    const storedJWT = localStorage.getItem('jwt');
    const savedimage = await takeScreenshotAndSaveit();

    await fetch(process.env.REACT_APP_API_URL + '/create-email-template.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
      body: JSON.stringify({
        html,
        css,
        image: savedimage,
      }),
    })
      .then((response) => response.json())
      .then((data: any) => {
        console.log(data);
        getAllTemplates();
        setLoadingSave(false);
        setSaveText('Template saved!');
        setTimeout(() => {
          setSaveText('');
        }, 3000);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
        setLoadingSave(false);
      });
  };
  const getAllTemplates = async () => {
    const storedJWT = localStorage.getItem('jwt');

    await fetch(process.env.REACT_APP_API_URL + '/get-email-templates.php', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + storedJWT,
      },
    })
      .then((response) => response.json())
      .then((data: any) => {
        if (Array.isArray(data)) {
          setEmailTemplates(data);
        } else {
          console.error('Fetched data is not an array:', data);
        }
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        console.log(error);
      });
  };

  const takeScreenshotAndSaveit = async () => {
    try {
      const storedJWT = localStorage.getItem('jwt');
      let user = JSON.parse(localStorage.getItem('user') || '{}');

      // Compile the email and handle the response
      return new Promise((resolve, reject) => {
        window.StripoApi.compileEmail(async function (
          error: any,
          html: any,
          ampHtml: any
        ) {
          if (html) {
            // Create a new hidden div to hold the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.fontFamily = 'sans-serif';
            tempDiv.style.display = 'block';
            tempDiv.style.height = '1000px';
            tempDiv.style.width = '600px';
            tempDiv.style.left = '-9999px';
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv);

            // Use html2canvas to create a canvas from the HTML content
            const canvas = await html2canvas(tempDiv, {
              useCORS: true,
              logging: true,
              allowTaint: true,
            });

            //Remove the temporary div
            document.body.removeChild(tempDiv);

            //Convert the canvas to a Blob and handle it
            const blobToPromise = new Promise<Blob | null>((resolve) => {
              canvas.toBlob((blob) => resolve(blob));
            });

            const blob = await blobToPromise;

            if (blob) {
              // Create a unique filename
              const filename =
                'email-template-' +
                (user.email || 'user') +
                '-' +
                Date.now() +
                '.png';

              const formData = new FormData();
              formData.append('file', blob, filename);

              // Send the FormData to the PHP API endpoint
              const response = await fetch(
                process.env.REACT_APP_API_URL +
                  '/upload-template-screenshot.php',
                {
                  method: 'POST',
                  headers: storedJWT
                    ? { Authorization: 'Bearer ' + storedJWT }
                    : {},
                  body: formData, // FormData will be sent as multipart/form-data
                }
              );

              if (!response.ok) {
                throw new Error('Network response was not ok.');
              }
              const data = await response.json();

              // Return the filename
              resolve(filename);
            } else {
              console.error('Failed to convert canvas to Blob');
              reject(new Error('Failed to convert canvas to Blob'));
            }
            return 'yup';
          } else {
            reject(new Error('Failed to compile email'));
          }
        });
      });
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const toggleTab = () => {
    toggleActiveTab();
  };

  useEffect(() => {
    const initPlugin = (template: StripoTemplate) => {
      const script = document.createElement('script');
      script.id = 'stripoScript';
      script.type = 'text/javascript';
      script.src = 'https://plugins.stripo.email/static/latest/stripo.js';
      script.onload = function () {
        if (stripoSettingsRef.current && stripoPreviewRef.current) {
          window.Stripo.init({
            settingsId: stripoSettingsRef.current?.id,
            previewId: stripoPreviewRef.current?.id,
            codeEditorButtonId: 'codeEditor',
            undoButtonId: 'undo',
            redoButtonId: 'redo',
            locale: 'en',
            baseSourcePath: 'https://plugins.stripo.email/static/latest',
            html: template.html,
            css: template.css,
            notifications: {
              info: (message: string) => alert(`Info: ${message}`),
              error: (message: string) => alert(`Error: ${message}`),
              warn: (message: string) => alert(`Warning: ${message}`),
              loader: (message: string) => alert(`Loader: ${message}`),
              hide: (message: string) => alert(`Hide: ${message}`),
              success: (message: string) => alert(`Success: ${message}`),
            },
            apiRequestData: { emailId: 123 },
            userFullName: 'Suzy',
            versionHistory: {
              changeHistoryLinkId: 'changeHistoryLink',
              onInitialized: function () {
                document.getElementById(
                  'changeHistoryContainer'
                )!.style.display = 'block';
              },
            },
            getAuthToken: function (callback: (token: string) => void) {
              request(
                'POST',
                'https://plugins.stripo.email/api/v1/auth',
                JSON.stringify({
                  pluginId: process.env.REACT_APP_STRIPO_PLUGIN_ID,
                  secretKey: process.env.REACT_APP_STRIPO_SECRET_KEY,
                }),
                (data) => {
                  callback(JSON.parse(data).token);
                }
              );
            },
          });
        }
      };
      document.body.appendChild(script);
    };

    loadDemoTemplate(initPlugin);
    getAllTemplates();
  }, []);

  const loadTemplate = (template: any) => {
    const confirmLoad = window.confirm(
      'Are you sure you want to load this template?'
    );
    if (!confirmLoad) {
      return;
    }
    window.StripoApi.stop();
    window.Stripo.init({
      settingsId: stripoSettingsRef.current?.id,
      previewId: stripoPreviewRef.current?.id,
      codeEditorButtonId: 'codeEditor',
      undoButtonId: 'undo',
      redoButtonId: 'redo',
      locale: 'en',
      baseSourcePath: 'https://plugins.stripo.email/static/latest',
      html: template.template_html,
      css: template.template_css,
      notifications: {
        info: (message: string) => alert(`Info: ${message}`),
        error: (message: string) => alert(`Error: ${message}`),
        warn: (message: string) => alert(`Warning: ${message}`),
        loader: (message: string) => alert(`Loader: ${message}`),
        hide: (message: string) => alert(`Hide: ${message}`),
        success: (message: string) => alert(`Success: ${message}`),
      },
      apiRequestData: { emailId: 123 },
      userFullName: 'Suzy',
      versionHistory: {
        changeHistoryLinkId: 'changeHistoryLink',
        onInitialized: function () {
          document.getElementById('changeHistoryContainer')!.style.display =
            'block';
        },
      },
      getAuthToken: function (callback: (token: string) => void) {
        request(
          'POST',
          'https://plugins.stripo.email/api/v1/auth',
          JSON.stringify({
            pluginId: process.env.REACT_APP_STRIPO_PLUGIN_ID,
            secretKey: process.env.REACT_APP_STRIPO_SECRET_KEY,
          }),
          (data) => {
            callback(JSON.parse(data).token);
          }
        );
      },
    });
  };

  const sendEmail = async () => {
    window.StripoApi.compileEmail(
      (error: any, html: string, ampHtml: string, ampErrors: any) => {
        setMessage(html);
        showModal(true);
      }
    );
  };

  const sendTestEmail = async () => {
    window.StripoApi.compileEmail(
      (error: any, html: string, ampHtml: string, ampErrors: any) => {
        setMessage(html);
        showTestModal(true);
      }
    );
  };

  return (
    <>
      <div>
        <div>
          <h1 className="flex flex-wrap min-h-[2rem] mb-2 gap-2  items-center text-xl md:text-2xl">
            <span>Email marketing</span>
          </h1>
        </div>
        <div
          className="flex flex-wrap mb-5 md:justify-between"
          id="externalSystemContainer"
        >
          <div>
            <button
              className="px-4 py-1.5 m-1 text-xs transition-all rounded-md text-gray-500 ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              onClick={toggleTab}
            >
              Mail stats
            </button>
          </div>
          {/* <div>
            <button id="undo">Undo</button>
            <button id="redo">Redo</button>

            <span id="changeHistoryContainer" style={{ display: 'none' }}>
              Last change: <a id="changeHistoryLink"></a>
            </span>
          </div> */}
          <div className="flex flex-wrap items-center">
            <p className="hidden mr-5 text-xs text-green-600 md:inline-block ">
              {saveText}
            </p>
            {loadingSave ? (
              <svg
                className={`text-slate-400 w-14 h-5 animate-spin inline-block`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25 "
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
              <button
                type="button"
                id="saveButton"
                onClick={() => {
                  window.StripoApi.getTemplate((html: string, css: string) => {
                    saveTemplate(html, css);
                  });
                }}
                className="px-4 py-1.5 m-1 text-xs transition-all rounded-md text-gray-500 ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              >
                Save
              </button>
            )}
            <button
              id="exportButton"
              className="px-4 py-1.5 m-1 text-xs transition-all rounded-md text-gray-500 ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              onClick={sendTestEmail}
            >
              Test
            </button>
            <button
              id="exportButton"
              className="px-4 py-1.5 m-1 text-xs transition-all rounded-md text-gray-500 ring-1 ring-inset ring-suzy-gray hover:bg-shade control-button"
              onClick={sendEmail}
            >
              Send
            </button>
          </div>
          <p className="mr-5 text-xs text-green-600 md:hidden md:inline-block ">
            {saveText}
          </p>
        </div>
        <div className="notification-zone"></div>
        <div className="bg-[#F6F6F6] inline-block w-full lg:flex relative overflow-x-scroll">
          <div
            id="stripoSettingsContainer"
            ref={stripoSettingsRef}
            className="w-full max-w-[400px]"
          >
            Loading...
          </div>

          <div
            id="stripoPreviewContainer"
            ref={stripoPreviewRef}
            className="w-full min-h-[600px] max-h-[1000px]"
          />
        </div>
        <div className="inline-block"></div>
        {emailTemplates.length > 0 && (
          <div className="block my-20">
            <h2 className="items-center mb-2 text-xl md:text-2xl">
              Saved emails
            </h2>
            <div className="flex flex-wrap gap-5 my-10">
              {emailTemplates.map((item: any, index: number) => (
                <EmailTemplate
                  key={index}
                  loadTemplate={() => loadTemplate(item)}
                  template={item}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
          <div className="w-full md:w-[600px] max-w-full mx-auto">
            <SendMail closeModal={() => showModal(false)} message={message} />
          </div>
        </div>
      )}
      {testModal && (
        <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-opacity-50 p-7 bg-default">
          <div className="w-full md:w-[600px] max-w-full mx-auto">
            <SendTestMail
              closeModal={() => showTestModal(false)}
              message={message}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StripoEmailBuilder;
