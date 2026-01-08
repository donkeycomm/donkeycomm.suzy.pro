import { useEffect, useState, type FC } from 'react';
import { useLocation } from 'react-router-dom';

const Unsubscribe: FC = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contact_id = queryParams.get('contact_id');
  const key = queryParams.get('key');
  const type = queryParams.get('type');

  const unSubscribe = async () => {
    if (!contact_id || !key || !type) {
      setError('Invalid link');
      return;
    }
    let apiLink = '';
    if (type === 'regular') {
      apiLink = '/unsubscribe-contact.php';
    } else if (type === 'press') {
      apiLink = '/unsubscribe-press-contact.php';
    } else {
      setError('Invalid link');
      return;
    }
    await fetch(process.env.REACT_APP_API_URL + apiLink, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_id,
        key,
        type,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          setMessage('');
          setError(data.error);
        } else if (data.success) {
          setMessage(data.success);
          setError('');
        } else {
          setMessage('');
          setError('Something went wrong');
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  useEffect(() => {
    unSubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen px-5 py-12 bg-shade fade-in lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-2xl text-center">TheFakeBrand</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 text-center bg-white shadow sm:rounded-lg sm:px-10">
          <p>{message}</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
