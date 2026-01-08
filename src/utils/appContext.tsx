import { createContext } from 'react';

interface AppContextInterface {
  isLoggedIn: Boolean;
  updateLoginStatus: (status: boolean) => void;
  orderList: any[];
  addToOrderList: (order: any) => void;
  removeFromOrderList: (order: any) => void;
  emptyOrderList: () => void;
}

const AppContext = createContext<AppContextInterface | null>(null);

export default AppContext;
