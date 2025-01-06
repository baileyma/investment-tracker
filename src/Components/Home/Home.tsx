import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.scss';
import { Link } from 'react-router-dom';

const Home = () => {
  const [accounts, setAccounts] = useState([]);
  const [returns, setReturns] = useState({});
  const [showDelete, setShowDelete] = useState({});

  const getAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/accounts');
      return response.data;
    } catch (error) {
      console.error(`Error retrieving players: ${error}`);
    }
  };

  const addAccount = async (e) => {
    const accountObj = {
      accName: e.target.accName.value,
    };
    try {
      const ID = await axios.post('http://localhost:8080/accounts', accountObj);
      const response = await getAccounts();
      setAccounts(response);
      return ID;
    } catch (error) {
      console.error(`Error adding new account: ${error}`);
    }
  };

  const deleteAccount = async (accID) => {
    try {
      const ID = await axios.delete(`http://localhost:8080/accounts/${accID}`);
      const response = await getAccounts();
      setAccounts(response);
      return ID;
    } catch (error) {
      console.error(`Error deleting account: ${error}`);
    }
  };

  const getReturns = async (id: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/accounts/all-returns/${id}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error getting returns: ${error}`);
    }
  };

  const getAllReturns = async () => {
    console.log(accounts[1].id);
    try {
      const resultingReturns = {};

      for (let i = 0; i < accounts.length; i++) {
        const IDArg: number = accounts[i].id;
        resultingReturns[IDArg] = await getReturns(IDArg);
      }
      console.log(resultingReturns);
      return resultingReturns;
    } catch (error) {
      console.error(`Error getting all returns: ${error}`);
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await getAccounts();
        setAccounts(response); // Wait for accounts to be set
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    fetchAccounts();
  }, []); // Runs only once on mount

  useEffect(() => {
    if (accounts.length > 0) {
      const fetchAllReturns = async () => {
        try {
          const responseReturns = await getAllReturns();
          setReturns(responseReturns); // Fetch returns only after accounts are populated
        } catch (error) {
          console.error('Error fetching returns:', error);
        }
      };
      fetchAllReturns();
    }
  }, [accounts]);

  const toggleDelete = (accountID) => {
    setShowDelete((previousState) => ({
      ...previousState,
      [accountID]: !previousState[accountID],
    }));
  };

  // if (!accounts.length || Object.keys(returns).length === 0) {
  //   return <h2>Loading...</h2>;
  // }

  return (
    <>
      <h2>Home</h2>

      <h2>Accounts</h2>

      <div className="Home__account-wrapper">
        <p className="Home__account-column">Account Name</p>
        <p className="Home__year-column">2021</p>
        <p className="Home__year-column">2022</p>
        <p className="Home__year-column">2023</p>
        <p className="Home__year-column">2024</p>
      </div>

      {accounts.map((account) => {
        return (
          <>
            <div className="Home__account-wrapper">
              <p className="Home__account-column">{account.name}</p>
              <Link
                className="Home__year-column"
                to={`/accounts/${account.id}/2021`}
              >
                <p
                  className={
                    returns[account.id]?.[2021] >= 0
                      ? 'Home__positive-data'
                      : 'Home__negative-data'
                  }
                >
                  {returns[account.id]?.[2021] + '%' || 'N/A'}
                </p>
              </Link>
              <Link
                className="Home__year-column"
                to={`/accounts/${account.id}/2022`}
              >
                <p
                  className={
                    returns[account.id]?.[2022] >= 0
                      ? 'Home__positive-data'
                      : 'Home__negative-data'
                  }
                >
                  {returns[account.id]?.[2022] + '%' || 'N/A'}
                </p>
              </Link>
              <Link
                className="Home__year-column"
                to={`/accounts/${account.id}/2023`}
              >
                <p
                  className={
                    returns[account.id]?.[2023] >= 0
                      ? 'Home__positive-data'
                      : 'Home__negative-data'
                  }
                >
                  {returns[account.id]?.[2023] + '%' || 'N/A'}
                </p>
              </Link>
              <Link
                className="Home__year-column"
                to={`/accounts/${account.id}/2024`}
              >
                <p
                  className={
                    returns[account.id]?.[2024] >= 0
                      ? 'Home__positive-data'
                      : 'Home__negative-data'
                  }
                >
                  {returns[account.id]?.[2024] + '%' || 'N/A'}
                </p>
              </Link>
              <button
                className="Home__delete-button"
                onClick={() => toggleDelete(account.id)}
              >
                Delete
              </button>
              <button
                className={
                  showDelete[account.id]
                    ? 'Home__delete-button'
                    : 'Home__delete-button--hidden'
                }
                onClick={() => deleteAccount(account.id)}
              >
                Are you sure?
              </button>
            </div>
          </>
        );
      })}

      <form onSubmit={(e) => addAccount(e)}>
        <label name="accName">Account Name</label>
        <input name="accName" id="accName" />

        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default Home;
