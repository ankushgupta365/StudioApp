import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const PageLayout = () => (
    <>
        <Sidebar />
        <Outlet />
    </>
);

export default PageLayout
