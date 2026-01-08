import React, { useState } from 'react';

interface CreateProductProps {
  updatePage: () => void;
}
const CreateProduct: React.FC<CreateProductProps> = ({ updatePage }) => {
  const [error, setError] = useState(``);
  const [success, setSuccess] = useState(``);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    //empty the form
    const form = document.querySelector('form') as HTMLFormElement;
    form.reset();
    updatePage();
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData(event.currentTarget);
    const storedJWT = localStorage.getItem('jwt');

    try {
      await fetch(process.env.REACT_APP_API_URL + '/create-product.php', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + storedJWT,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error[0]);
          }
          if (data.success) {
            setSuccess(`Successfully added: ${data.success[0]}`);
            refresh();
          }
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    } catch (error) {
      console.error('Error:', error);
      setError('Error creating product');
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className="grid inline-block gap-5 pt-6 pr-6 mt-5 mb-5 bg-white fade-in md:mt-10 md:mt-5 md:rounded-lg md:shadow-md md:p-6"
    >
      <h1 className="mb-4 text-xl font-bold text-gray-800">Create a product</h1>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          required
          name="title"
          id="title"
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          name="description"
          required
          id="description"
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-5 ">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price €
          </label>
          <input
            type="number"
            required
            name="price"
            id="price"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="vat"
            className="block text-sm font-medium text-gray-700"
          >
            VAT %
          </label>
          <input
            type="number"
            name="vat"
            required
            id="vat"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="image"
          className="block mb-3 text-sm font-medium text-gray-700"
        >
          Image
        </label>
        <input
          className="block w-full text-sm text-gray-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          type="file"
          name="image"
          id="image"
        />
      </div>

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
        </div>
      ) : (
        <button className="inline-flex justify-center w-auto px-4 py-2 mt-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Create product
        </button>
      )}
      <div>
        <p
          className="text-sm font-medium text-green-600 "
          dangerouslySetInnerHTML={{ __html: success }}
        />

        <p
          className="text-sm font-medium text-red-600 "
          dangerouslySetInnerHTML={{ __html: error }}
        />
      </div>
    </form>
  );
};

export default CreateProduct;
