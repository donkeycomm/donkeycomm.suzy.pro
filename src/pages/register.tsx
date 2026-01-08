import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    await fetch(process.env.REACT_APP_API_URL + '/register-user.php', {
      body: JSON.stringify({
        email,
        password,
        firstname,
        lastname,
        phone,
        key,
      }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data == 'invalid-key') {
          setError('Invalid url, contact helpdesk for a new link.');
        } else if (data.message == 'User registered successfully') {
          setRegistered(true);
        } else if (data.error == 'Email already exists') {
          setError('User already registered');
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
    const keyParam = searchParams.get('key');
    if (keyParam) {
      setKey(keyParam);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center min-h-screen px-2 py-12 bg-gray-100 fade-in sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/logo.svg" alt="Logo" className="w-auto h-10 mx-auto" />
        <h2 className="mt-12 text-xl font-normal text-center text-gray-900">
          Register for an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          {!registered ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Firstname
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstname"
                      name="firstname"
                      type="text"
                      required
                      value={firstname}
                      onChange={(event) => setFirstname(event.target.value)}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Lastname
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      required
                      value={lastname}
                      onChange={(event) => setLastname(event.target.value)}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    E-mail
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
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
                    pattern="^(?=.*[a-zA-Z0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 ml-1 text-xs italic text-slate-400">
                    Minimum 8 characters and at least 1 special character
                  </p>
                </div>
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
                    className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Register
                  </button>
                )}
                <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <h2 className="px-5 py-10 text-xl font-normal text-center text-gray-900">
                Thank you for your registration,
                <br />
                you can login{' '}
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

export default RegisterPage;
