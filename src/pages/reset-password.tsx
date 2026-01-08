import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    await fetch(process.env.REACT_APP_API_URL + '/set-password.php', {
      body: JSON.stringify({
        email,
        password,
        token,
      }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message == 'success') {
          setRegistered(true);
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
  };

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center min-h-screen px-5 py-12 bg-gray-100 fade-in lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          src="/Suzy-logo.svg"
          alt="Logo"
          className="w-auto h-10 mx-auto md:h-16"
          onClick={() => navigate('/')}
        />
        <h2 className="mt-5 text-xl font-normal text-center text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          {!registered ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Choose a password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    pattern="^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                  <p className="mt-1 ml-1 text-xs italic text-slate-400">
                    Minimum 8 characters and at least 1 special character
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="current-password"
                    pattern="^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  />
                  <p className="mt-1 ml-1 text-xs italic text-slate-400">
                    Minimum 8 characters and at least 1 special character
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <Link
                  to="/login"
                  className="flex items-center font-medium text-slate-600 hover:text-slate-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                    />
                  </svg>
                  <span> To login page</span>
                </Link>
              </div>
              <div>
                {loading ? (
                  <div className="flex justify-center">
                    <svg
                      className="inline-blockmt-5 w-9 h-9 text-accent animate-spin"
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
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                  >
                    Submit
                  </button>
                )}
                <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <h2 className="px-5 py-10 text-xl font-normal text-center text-gray-900">
                Your password has been updated successfully, you can login{' '}
                <a
                  className="underline"
                  href={`${process.env.REACT_APP_URL}/login`}
                >
                  here
                </a>
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
