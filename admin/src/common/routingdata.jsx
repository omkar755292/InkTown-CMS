import AddQuality from "../component/superAdmin/Settings/addquality";

import UserList from "../component/superAdmin/UserList/UserList";
import OrderList from "../component/superAdmin/OrderHistory/OrderList";

import Home from "../component/superAdmin/Dashboard/AddAdminButton";

import NewOrderFormLayout from "../component/NewOrderFormLayout/NewOrderFormLayout";

import ProfileForm from "../component/ProfilePage/ProfilePage";

import SettingsNav from "../component/superAdmin/Settings/settingsnav";

import AddAdmin from "../component/superAdmin/Dashboard/AddAdminForm";
import ItemList from "../component/superAdmin/OrderHistory/ItemList/ItemList";
import LogIn from "../component/superAdmin/Dashboard/logInForm";
import AdminList from "../component/superAdmin/AdminList/adminList";
import LogFile from "../component/superAdmin/UserList/logFile";
import Recharge from "../component/superAdmin/UserList/recharge";
import AdminLogFile from "../component/superAdmin/adminLogFile";
import AdminChat from "../component/superAdmin/Chats/adminChat";
import UserChat from "../component/superAdmin/Chats/userChat";
import CashbackWallet from "../component/superAdmin/UserList/cashbackWallet";
import WalletPage from "../component/superAdmin/UserList/wallet";
import LogOut from "../component/LogIn/logOut";
import ItemOtherPrice from "../component/superAdmin/OrderHistory/ItemList/itemOtherPrice";
import Notice from "../component/superAdmin/Notice/Notice";


export const RouteData = [

    { path: `${ import.meta.env.BASE_URL }home`, element: <Home />, title: '' },
    { path: `${ import.meta.env.BASE_URL }login`, element: <LogIn />, title: '' },
    { path: `${ import.meta.env.BASE_URL }addAdmin`, element: <AddAdmin />, title: '' },
    { path: `${ import.meta.env.BASE_URL }new-order/:phoneNumber`, element: <NewOrderFormLayout />, title: '' },
    { path: `${ import.meta.env.BASE_URL }orderHistory`, element: <OrderList /> },
    { path: `${ import.meta.env.BASE_URL }vieworderUser/:phoneNumber`, element: <OrderList /> },
    { path: `${ import.meta.env.BASE_URL }adminList`, element: <AdminList /> },
    { path: `${ import.meta.env.BASE_URL }userList`, element: <UserList /> },
    { path: `${ import.meta.env.BASE_URL }viewItem/:orderId`, element: <ItemList /> },
    { path: `${ import.meta.env.BASE_URL }viewItem/:orderId/:itemId`, element: <ItemOtherPrice />, title: '' },

    { path: `${ import.meta.env.BASE_URL }profile`, element: <ProfileForm />, title: '' },
    { path: `${ import.meta.env.BASE_URL }settingsnav`, element: <SettingsNav />, title: '' },
    { path: `${ import.meta.env.BASE_URL }noticenav`, element: <Notice />, title: '' },
    { path: `${ import.meta.env.BASE_URL }addquality`, element: <AddQuality />, title: '' },
    { path: `${ import.meta.env.BASE_URL }recharge/:phoneNumber`, element: <Recharge />, title: '' },
    { path: `${ import.meta.env.BASE_URL }cashbackWallet/:phoneNumber`, element: <CashbackWallet />, title: '' },
    { path: `${ import.meta.env.BASE_URL }wallet/:phoneNumber`, element: <WalletPage />, title: '' },
    { path: `${ import.meta.env.BASE_URL }logFile/:phoneNumber`, element: <LogFile />, title: '' },
    { path: `${ import.meta.env.BASE_URL }adminLogfile`, element: <AdminLogFile />, title: '' },
    { path: `${ import.meta.env.BASE_URL }userChat/:orderId`, element: <UserChat />, title: '' },
    { path: `${ import.meta.env.BASE_URL }adminChat/:orderId`, element: <AdminChat />, title: '' },
    { path: `${ import.meta.env.BASE_URL }log-out`, element: <LogOut />, title: '' },


]





