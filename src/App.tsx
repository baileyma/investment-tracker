import { Routes, BrowserRouter, Route } from 'react-router-dom';
import AccountDetails from './Components/AccountDetails/AccountDetails';
import Header from './Components/Header/Header';
import Home from './Components/Home/Home';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accounts/:id/:year" element={<AccountDetails />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
