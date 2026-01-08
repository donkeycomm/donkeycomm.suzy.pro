import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AppContext from '../utils/appContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    await fetch(process.env.REACT_APP_API_URL + '/login-user.php', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        const jsonData = JSON.parse(data);
        console.log(jsonData);
        setLoading(false);
        if (jsonData) {
          if (jsonData.jwt) {
            localStorage.setItem('jwt', jsonData.jwt);
            localStorage.setItem('user', JSON.stringify(jsonData.user));

            context?.updateLoginStatus(true);
            navigate('/');
          } else if (jsonData.error) {
            // Handle authentication failure
            setError(jsonData.error);
          }
        } else {
          setError('Failed, try again.');
          console.log('Response is empty or not valid JSON');
        }
      })

      .catch((error) => {
        setLoading(false);
        // Handle network or server errors
        console.log(error);
      });
  };

  return (
    <div className="flex flex-col min-h-screen px-5 py-12 bg-shade fade-in lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1
          className="text-2xl text-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          TheFakeBrand
        </h1>
        <h2 className="mt-5 text-base font-normal text-center text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/request-password-reset"
                  className="font-medium text-slate-600 hover:text-slate-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center">
                <svg
                  className="inline-block mt-5 w-9 h-9 text-accent animate-spin"
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
              <div>
                <button
                  type="submit"
                  className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-default hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Sign in
                </button>
                <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
