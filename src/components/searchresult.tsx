import { FC, useState, useEffect } from 'react';

interface searchresultProps {
  result: any;
  updateFolderPath: (path: string) => void;
}

const SearchResult: FC<searchresultProps> = ({ result, updateFolderPath }) => {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const goToFolder = (path: string) => {
    updateFolderPath(path);
  };

  const downloadFile = async (id: number, filename: string) => {
    setLoadingDownload(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');
    const headers = {
      'Content-Type': 'application/json',
      ...(storedJWT && { Authorization: 'Bearer ' + storedJWT }),
    };
    await fetch(process.env.REACT_APP_API_URL + '/download-file.php', {
      method: 'POST',
      mode: 'cors',
      headers,
      body: JSON.stringify({
        id: id,
        email: user.email || null,
        size: 'file',
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // the filename you want
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setLoadingDownload(false);
      })
      .catch((error) => {
        // Handle network or server errors
        console.log('error');
        alert(error);
        setLoadingDownload(false);
      });
  };
  const fileExtension = result.file.split('.').pop();

  const getPlaceholder = (fileExtension: string): string => {
    const extensionToPlaceholder: { [key: string]: string } = {
      mp4: '/placeholder-video.svg',
      mov: '/placeholder-video.svg',
      avi: '/placeholder-video.svg',
      wmv: '/placeholder-video.svg',
      doc: '/placeholder-word.svg',
      docx: '/placeholder-word.svg',
      xls: '/placeholder-excel.svg',
      xlsx: '/placeholder-excel.svg',
      svg: '/placeholder-svg.svg',
      pdf: '/placeholder-pdf.svg',
      eps: '/placeholder-eps.svg',
      ai: '/placeholder-illustrator.svg',
      psd: '/placeholder-photoshop.svg',
      indd: '/placeholder-indesign.svg',
    };

    return extensionToPlaceholder[fileExtension] || 'placeholder-document.svg';
  };

  let placeholder = getPlaceholder(fileExtension);

  return (
    <div className="flex items-center relative justify-between max-w-full gap-3 p-2 hover:bg-[#F5F6F4]">
      <div className="flex items-center gap-4">
        {result.base64 ? (
          <img
            src={`data:image/jpeg;base64,${result.base64}`}
            alt={result.file}
            className="w-12 h-12 rounded-sm cursor-pointer"
            onClick={() => goToFolder(result.path)}
          />
        ) : (
          <img
            src={placeholder}
            alt={result.file}
            className="w-12 h-12 rounded-sm cursor-pointer"
            onClick={() => goToFolder(result.path)}
          />
        )}
        <div className="max-w-[100px]">
          <p className="text-xs filename-ellipsis ">{result.file}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => goToFolder(result.path)}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 cursor-pointer hover:text-accent"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
          />
        </svg>

        {loadingDownload ? (
          <svg
            className={`w-5 h-5 text-accent animate-spin`}
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
            onClick={() => downloadFile(result.ID, result.file)}
            className={`p-[3px] stroke-default download-button h-6 w-6 inline-block transition-colors bg-opacity-50 cursor-pointer `}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
export default SearchResult;
