import Account from '../Account/Account';
import { Routes, BrowserRouter, Route } from 'react-router-dom';

const Overview = () => {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes></Routes>
      </BrowserRouter>
    </>
  );
};

export default Overview;
