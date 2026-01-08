import { useState, FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../utils/appContext';

interface sendmailProps {
  message: string;
  closeModal: () => void;
}

const SendTestMail: FC<sendmailProps> = ({ closeModal, message }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hide, setHide] = useState(false);
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedJWT = localStorage.getItem('jwt');

    if (storedJWT) {
      await fetch(process.env.REACT_APP_API_URL + '/send-test-email.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + storedJWT,
        },
        body: JSON.stringify({
          email,
          subject,
          message,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === 'success') {
            setSuccess('Mail sent successfully');
            setEmail('');
            setSubject('');
            setError('');
          } else if (data.error) {
            setError(data.error);
          }
          setLoading(false);
        })
        .catch((e) => {
          console.log(e);
          setError('Failed, try again');
          setLoading(false);
        });
    } else {
      console.log('not logged in');
      localStorage.clear();
      context?.updateLoginStatus(false);
      navigate('/login');
    }
  };
  const clearForm = () => {
    setEmail('');
    setSubject('');
    setError('');
    setSuccess('');
  };
  return (
    <div className="inline-block max-w-[450px] w-full p-6 pt-6 pr-6 mt-10 bg-white rounded-lg shadow-md fade-in md:mt-5">
      <div className="flex justify-between mb-3">
        <h1 className="mb-4 text-xl text-default">Send test e-mail</h1>
        <svg
          onClick={closeModal}
          className="cursor-pointer"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.40918 1.43213L13.9192 13.9421"
            stroke="#0C150A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.9189 1.43213L1.40895 13.9421"
            stroke="#0C150A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="grid gap-5 ">
        <div className="">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            E-mail
          </label>
          <input
            className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            id="email"
            name="email"
            type="email"
            required
            placeholder="E-mail"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Subject
          </label>
          <input
            className="block w-full px-4 py-2.5 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-md bg-shade"
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between mt-7">
        <div className="grid content-center">
          <button
            onClick={clearForm}
            className="text-sm text-gray-400 outline-none"
          >
            Reset to default
          </button>
        </div>
        <div>
          <div className="flex items-center justify-end gap-7">
            <button
              onClick={closeModal}
              className="text-sm outline-none text-default"
            >
              Cancel
            </button>
            {loading ? (
              <div className="flex items-center justify-start">
                <svg
                  className="inline-block w-5 h-5 mr-3 text-accent animate-spin"
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
                <span className="text-sm font-medium text-gray-500">
                  Uploading...
                </span>
              </div>
            ) : (
              <button
                className="inline-flex justify-center w-auto px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                onClick={handleSubmit}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      <p className="mt-2 text-sm font-medium text-green-600">{success}</p>
    </div>
  );
};
export default SendTestMail;
