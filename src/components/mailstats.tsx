import { useEffect, useState, FC } from 'react';
import CircularProgress from './circlegraph';
import Dropdown from './dropdown';

interface mailStatsProps {
  toggleActiveTab: () => void;
}
const MailStats: FC<mailStatsProps> = ({ toggleActiveTab }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [percentageDelivered, setPercentageDelivered] = useState(0);
  const [percentageOpened, setPercentageOpened] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>({
    requests: '&nbsp;',
    delivered: '&nbsp;',
    opens: '&nbsp;',
  });

  const toggleTab = () => {
    toggleActiveTab();
  };
  const handleSelectItem = async (item: any) => {
    console.log(item);
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/get-mail-stats.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          tag: item.tag,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setSelectedOption(data);
          setLoading(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
        }));
  };

  const getOptions = async () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const storedJWT = localStorage.getItem('jwt');

    user.email &&
      (await fetch(process.env.REACT_APP_API_URL + '/get-mailings.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setOptions(data);
          setLoading(false);
        })
        .catch((error) => {
          // Handle network or server errors
          console.log('error');
          console.log(error);
          setLoading(false);
        }));
  };

  //create the function to create a folder
  const calculatePercentages = () => {
    const delivered = selectedOption?.delivered;
    const requests = selectedOption?.requests;
    const opens = selectedOption?.opens;

    const percentageDelivered = parseFloat(
      ((delivered / requests) * 100).toFixed(0)
    );
    const percentageOpened = parseFloat(((opens / delivered) * 100).toFixed(0));
    setPercentageDelivered(percentageDelivered);
    setPercentageOpened(percentageOpened);
  };
  useEffect(() => {
    selectedOption.requests > 0 && calculatePercentages();
  }, [selectedOption]);

  useEffect(() => {
    getOptions();
  }, []);

  return (
    <div className="fade-in">
      <div className="flex gap-10">
        <button
          onClick={toggleTab}
          className="flex outline-none text-default hover:text-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            ></path>
          </svg>
          <span className="ml-1 text-sm">back</span>
        </button>
        <h3 className="text-sm font-semibold leading-6 text-gray-700 md:text-base">
          Mail statistics
        </h3>
      </div>
      <div className="my-10">
        <div className="relative inline-block text-left">
          <div>
            <Dropdown items={options} selectItem={handleSelectItem} />
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-3">
        <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Mails sent
          </dt>
          <dd
            className="mt-1 text-2xl font-semibold tracking-tight text-gray-700 md:text-3xl"
            dangerouslySetInnerHTML={{ __html: selectedOption?.requests }}
          ></dd>
        </div>
        <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
          {selectedOption?.requests > 0 && (
            <dt className="text-sm font-medium text-gray-500 truncate">
              Mails delivered{` `}
              <span className="text-gray-400">{selectedOption?.delivered}</span>
              <CircularProgress
                percentage={percentageDelivered}
                color="#955E34"
              />
            </dt>
          )}
        </div>
        <div className="px-4 py-5 overflow-hidden bg-white rounded-lg shadow sm:p-6">
          {selectedOption?.requests > 0 && (
            <dt className="text-sm font-medium text-gray-500 truncate">
              Mails opened{` `}
              <span className="text-gray-400">{selectedOption?.opens}</span>
              <CircularProgress percentage={percentageOpened} color="#955E34" />
            </dt>
          )}
        </div>
      </dl>
    </div>
  );
};
export default MailStats;
