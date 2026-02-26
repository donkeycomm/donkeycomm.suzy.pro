import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppContext from './utils/appContext';
import Layout from './components/layout';
import NotFound from './pages/notfound';
import Files from './pages/files';
import Email from './pages/email';
import Users from './pages/users';
import Contacts from './pages/contacts';
import PressReleases from './pages/pressreleases';
import ContactPage from './pages/contactpage';

import ProductPage from './pages/productpage';
import Unsubscribe from './pages/unsubsrcibe';
import Bin from './pages/bin';
import ActivateAccount from './pages/activate-account';
import RequestPasswordReset from './pages/request-password-reset';
import ResetPassword from './pages/reset-password';
import Login from './pages/login';
import Home from './pages/home';
import { useLocation } from 'react-router-dom';

function App() {
  const [isLoggedIn, toggleLoggedIn] = useState<boolean>(false);
  const [orderList, setOrderList] = useState<any[]>([]);

  const updateLoginStatus = (status: boolean) => {
    toggleLoggedIn(status);
  };

  const addToOrderList = (order: any) => {
    const currentOrderList = orderList;

    if (orderList.length === 0) {
      setOrderList([...orderList, order]);
    } else {
      const index = currentOrderList.findIndex(
        (o) => o.product.ID === order.product.ID
      );

      if (index === -1) {
        setOrderList([...orderList, order]);
      } else {
        const originalQuantiy = currentOrderList[index].quantity;
        const newQuantity = originalQuantiy + order.quantity;

        // Create a new array with the updated item
        const newOrderList = currentOrderList.map((item, i) =>
          i === index ? { ...item, quantity: newQuantity } : item
        );

        setOrderList(newOrderList);
      }
    }
  };

  const removeFromOrderList = (product_id: number) => {
    if (orderList.length === 0) return;
    const found = orderList.some((o) => o.product.ID === product_id);
    if (found) {
      setOrderList(orderList.filter((o) => o.product.ID !== product_id));
    }
  };

  const emptyOrderList = () => {
    setOrderList([]);
  };
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        updateLoginStatus,
        orderList,
        addToOrderList,
        removeFromOrderList,
        emptyOrderList,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/activate-account" element={<ActivateAccount />}></Route>
        <Route
          path="/request-password-reset"
          element={<RequestPasswordReset />}
        ></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        <Route path="/unsubscribe" element={<Unsubscribe />}></Route>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        ></Route>
        <Route
          path="/files"
          element={
            <Layout>
              <Files />
            </Layout>
          }
        ></Route>
        <Route path="/files/*" element={<Layout><Files /></Layout>}/>
        <Route
          path="/users"
          element={
            <Layout>
              <Users />
            </Layout>
          }
        ></Route>
        <Route
          path="/contacts"
          element={
            <Layout>
              <Contacts />
            </Layout>
          }
        ></Route>
        <Route
          path="/contacts/:id"
          element={
            <Layout>
              <ContactPage />
            </Layout>
          }
        ></Route>
        <Route
          path="/email"
          element={
            <Layout>
              <Email />
            </Layout>
          }
        ></Route>
        <Route
          path="/bin"
          element={
            <Layout>
              <Bin />
            </Layout>
          }
        ></Route>
        <Route
          path="/press-releases"
          element={
            <Layout>
              <PressReleases />
            </Layout>
          }
        ></Route>
        <Route path="*" element={<NotFound />} /> {/* 404 Route */}
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
