import React, { useRef, useEffect, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface CropperToolProps {
  image: string;
  toggleCropper: () => void;
  file: any;
}

const CropperTool: React.FC<CropperToolProps> = ({
  image,
  toggleCropper,
  file,
}) => {
  const closeRef = useRef<HTMLDivElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);

  const cropMenu1 = useRef<HTMLDivElement>(null);
  const cropMenu2 = useRef<HTMLDivElement>(null);
  const cropMenu3 = useRef<HTMLDivElement>(null);
  const cropMenu4 = useRef<HTMLDivElement>(null);

  const [loadingDownload, setLoadingDownload] = useState(false);

  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMode, setSelectedMode] = useState('crop');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState({ width: 0, height: 0 });

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    const cropData = cropper?.getData();
    setMeasurements({
      width: cropData?.width || 0,
      height: cropData?.height || 0,
    });
  };
  const downloadImage = () => {
    setLoadingDownload(true);
    const fileName = file.file.replace(/\.[^/.]+$/, '');
    const cropper = cropperRef.current?.cropper;
    cropper?.getCroppedCanvas().toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + '.jpg';
        a.click();
        URL.revokeObjectURL(url);
        setLoadingDownload(false);
      },
      'image/jpeg',
      1
    );
    saveDownloadInfo();
  };
  const saveDownloadInfo = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    const headers = {
      'Content-Type': 'application/json',
      ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
    };

    await fetch(
      process.env.REACT_APP_API_URL + '/save-cropper-download-info.php',
      {
        method: 'POST',
        mode: 'cors',
        headers,
        body: JSON.stringify({
          id: file.ID,
          email: user.email || null,
          file: file.file,
        }),
      }
    ).then((response) => {
      console.log(response);
    });
  };
  const setAspectRatio = (ratio: number) => {
    const cropper = cropperRef.current?.cropper;
    cropper?.setAspectRatio(ratio);
    // let currentType = selectedCrop;
    // if (currentType === type) {
    //   setSelectedCrop('');
    //   cropper?.setAspectRatio(NaN);
    //   return;
    // }
    // setSelectedCrop(type);

    // if (type === 'fb') cropper?.setAspectRatio(1.777);
    // if (type === 'ig') cropper?.setAspectRatio(1);
    // if (type === 'ldn') cropper?.setAspectRatio(1.91);
    // if (type === 'pnt') cropper?.setAspectRatio(0.666);
  };
  const toggleMode = (mode: string) => {
    const cropper = cropperRef.current?.cropper;
    mode === 'move' && cropper?.setDragMode('move');
    mode === 'crop' && cropper?.setDragMode('crop');
    setSelectedMode(mode);
    setSelectedCrop('');
    cropper?.setAspectRatio(NaN);
  };

  const handleCropperClick = () => {
    setSelectedCrop('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeRef.current &&
        !closeRef.current.contains(event.target as Node)
      ) {
        toggleCropper();
      }

      if (
        cropMenu1.current &&
        !cropMenu1.current.contains(event.target as Node) &&
        cropMenu2.current &&
        !cropMenu2.current.contains(event.target as Node) &&
        cropMenu3.current &&
        !cropMenu3.current.contains(event.target as Node) &&
        cropMenu4.current &&
        !cropMenu4.current.contains(event.target as Node)
      ) {
        setSelectedCrop('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [toggleCropper]);

  return (
    <div className="fixed top-0 left-0 z-30 grid content-center w-full h-full bg-black bg-opacity-60">
      <div className="relative w-full p-5 mx-auto md:p-10 lg:p-12 xl:p-20">
        <div ref={closeRef} className="inline-block">
          <div className="relative inline-block ">
            <div
              className="overflow-hidden lg:max-h-[80vh]"
              id="cropper-tool"
              onClick={handleCropperClick}
            >
              <Cropper
                src={image}
                // Cropper.js options
                initialAspectRatio={16 / 9}
                guides={false}
                background={false}
                crop={onCrop}
                ref={cropperRef}
                className="max-h-[80vh] overflow-hidden"
              />
            </div>
            <svg
              onClick={toggleCropper}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="absolute w-8 h-8 transition-all cursor-pointer lg:w-7 lg:h-7 fill-white stroke-white top-3 right-3 lg:right-5 lg:top-5 hover:stroke-white "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <a
              className={`transition-all inline-block border-2 p-[3px] bg-default rounded-md cursor-pointer hover:opacity-80
                ${
                  selectedMode === 'move'
                    ? ' border-white'
                    : 'border-transparent'
                }`}
              onClick={() => toggleMode('move')}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                height="16"
                viewBox="0 0 16 16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z"
                  fillRule="evenodd"
                />
              </svg>
            </a>
            <a
              className={`transition-all border-2 inline-block p-[3px] bg-default rounded-md cursor-pointer hover:opacity-80
                ${
                  selectedMode === 'crop'
                    ? ' border-white'
                    : 'border-transparent'
                }`}
              onClick={() => toggleMode('crop')}
            >
              <svg
                className="w-5 h-5 text-white fill-white"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M6 1V18H23V20H20V23H18V20H4V6H1V4H4V1H6Z" />
                <path d="M8 4H20V16H18V6H8V4Z" />
              </svg>
            </a>
            <div ref={cropMenu1} className="relative grid content-center">
              {selectedCrop === 'pnt' && (
                <div className="absolute grid w-[120px]  bottom-12 items-start content-start gap-1 p-2 bg-white rounded-md">
                  <button
                    onClick={() => setAspectRatio(2 / 3)}
                    className="text-xs text-left opacity-90"
                  >
                    Standard 2:3
                  </button>
                  <button
                    onClick={() => setAspectRatio(1)}
                    className="text-xs text-left opacity-90"
                  >
                    Square 1:1
                  </button>
                  <button
                    onClick={() => setAspectRatio(1 / 2.6)}
                    className="text-xs text-left opacity-90"
                  >
                    Long 1:2.6
                  </button>
                  <button
                    onClick={() => setAspectRatio(9 / 16)}
                    className="text-xs text-left opacity-90"
                  >
                    Story 9:16
                  </button>
                </div>
              )}
              <a
                className={`transition-all border-2 inline-block p-[3px] bg-default rounded-md cursor-pointer hover:opacity-80
                ${
                  selectedCrop === 'pnt'
                    ? ' border-white'
                    : 'border-transparent'
                }`}
                onClick={() => {
                  if (selectedCrop !== 'pnt') {
                    setSelectedCrop('pnt');
                  } else {
                    setSelectedCrop('');
                    setAspectRatio(NaN);
                  }
                }}
              >
                <img
                  src="./pinterest.png"
                  alt="Pinterest"
                  className="object-contain object-center w-5 h-5"
                />
              </a>
            </div>
            <div ref={cropMenu2} className="relative grid content-center">
              {selectedCrop === 'ldn' && (
                <div className="absolute grid w-[120px]  bottom-12 items-start content-start gap-1 p-2 bg-white rounded-md">
                  <button
                    onClick={() => setAspectRatio(16 / 9)}
                    className="text-xs text-left opacity-90"
                  >
                    Landscape 16:9
                  </button>
                  <button
                    onClick={() => setAspectRatio(9 / 16)}
                    className="text-xs text-left opacity-90"
                  >
                    Portrait 9:16
                  </button>
                  <button
                    onClick={() => setAspectRatio(1)}
                    className="text-xs text-left opacity-90"
                  >
                    Square 1:1
                  </button>
                </div>
              )}
              <a
                className={`transition-all border-2 w-8 h-8 grid content-center text-center inline-block p-[3px] bg-default rounded-md cursor-pointer hover:opacity-80
              ${
                selectedCrop === 'ldn' ? ' border-white' : 'border-transparent'
              }`}
                onClick={() => {
                  if (selectedCrop !== 'ldn') {
                    setSelectedCrop('ldn');
                  } else {
                    setSelectedCrop('');
                    setAspectRatio(NaN);
                  }
                }}
              >
                <img
                  src="./linkedin.png"
                  alt="LinkedIn"
                  className="object-contain object-center w-[19px] h-[19px] mx-auto"
                />
              </a>
            </div>
            <div ref={cropMenu3} className="relative grid content-center">
              {selectedCrop === 'ig' && (
                <div className="absolute grid w-[120px]  bottom-12 items-start content-start gap-1 p-2 bg-white rounded-md">
                  <button
                    onClick={() => setAspectRatio(1)}
                    className="text-xs text-left opacity-90"
                  >
                    Square 1:1
                  </button>
                  <button
                    onClick={() => setAspectRatio(1.91)}
                    className="text-xs text-left opacity-90"
                  >
                    Horizontal 1.91:1
                  </button>
                  <button
                    onClick={() => setAspectRatio(4 / 5)}
                    className="text-xs text-left opacity-90"
                  >
                    Vertical 4:5
                  </button>
                </div>
              )}
              <a
                className={`transition-all border-2 w-8 h-8 grid content-center text-center inline-block p-[3px] bg-default rounded-md cursor-pointer hover:opacity-80
              ${
                selectedCrop === 'ig' ? ' border-white' : 'border-transparent'
              }`}
                onClick={() => {
                  if (selectedCrop !== 'ig') {
                    setSelectedCrop('ig');
                  } else {
                    setSelectedCrop('');
                    setAspectRatio(NaN);
                  }
                }}
              >
                <img
                  src="./instagram.png"
                  alt="Instagram"
                  className="object-contain object-center w-6 h-6 mx-auto"
                />
              </a>
            </div>
            <div ref={cropMenu4} className="relative grid content-center">
              {selectedCrop === 'fb' && (
                <div className="absolute grid w-[120px]  bottom-12 items-start content-start gap-1 p-2 bg-white rounded-md">
                  <button
                    onClick={() => setAspectRatio(16 / 9)}
                    className="text-xs text-left opacity-90"
                  >
                    Landscape 16:9
                  </button>
                  <button
                    onClick={() => setAspectRatio(9 / 16)}
                    className="text-xs text-left opacity-90"
                  >
                    Portrait 9:16
                  </button>
                  <button
                    onClick={() => setAspectRatio(1)}
                    className="text-xs text-left opacity-90"
                  >
                    Square 1:1
                  </button>
                </div>
              )}
              <a
                className={`transition-all border-2 w-8 h-8 grid content-end inline-block bg-default rounded-md cursor-pointer hover:opacity-80  p-[3px]
              ${
                selectedCrop === 'fb' ? ' border-white' : 'border-transparent'
              }`}
                onClick={() => {
                  if (selectedCrop !== 'fb') {
                    setSelectedCrop('fb');
                  } else {
                    setSelectedCrop('');
                    setAspectRatio(NaN);
                  }
                }}
              >
                <img
                  src="./facebook.png"
                  alt="Facebook"
                  className="object-contain object-center w-6 h-6 mx-auto"
                />
              </a>
            </div>
            <a
              className={`transition-all border-2 border-[#EE3441] w-8 h-8 grid content-center text-center inline-block bg-[#EE3441] rounded-md cursor-pointer hover:opacity-80  p-[3px]`}
              onClick={downloadImage}
            >
              {loadingDownload ? (
                <svg
                  className={` w-5 h-5 text-white animate-spin`}
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
                  className={`h-5 w-5 rounded-md
               inline-block transition-colors mx-auto`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              )}
            </a>
          </div>
          <div className="my-5 text-center">
            <p className="text-xs text-center text-white">
              {measurements.width.toFixed(0)} x {measurements.height.toFixed(0)}{' '}
              px
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropperTool;
