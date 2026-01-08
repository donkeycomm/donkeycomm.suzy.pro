import type { FC } from 'react';
import { useContext } from 'react';
import AppContext from '../utils/appContext';

interface cartItemProps {
  item: any;
}

const CartItem: FC<cartItemProps> = ({ item }) => {
  const context = useContext(AppContext);
  const removeFromOrderList = context?.removeFromOrderList;
  const deleteItem = (id: number) => {
    removeFromOrderList && removeFromOrderList(id);
  };
  return (
    <div className="relative flex content-center py-3 pr-10 border-b border-gray-200">
      <p className="text-sm min-w-[30px]">{item.quantity}x</p>{' '}
      <p className="text-sm max-h-[40px] overflow-hidden overflow-ellipsis whitespace-nowrap">
        {item.product.title}
      </p>{' '}
      <svg
        className="absolute right-0 w-6 h-6 text-red-400 cursor-pointer hover:text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        onClick={() => deleteItem(item.product.ID)}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
};
export default CartItem;
