import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.scss';
import { Link } from 'react-router-dom';

const Home = () => {
  const [accounts, setAccounts] = useState([]);
  const [returns, setReturns] = useState({});
  const [showDelete, setShowDelete] = useState({});
  const [allBalances, setAllBalances] = useState({});
  const [cumReturnsObject, setCumReturnsObject] = useState({});

  const nfObject = new Intl.NumberFormat('en-US');

  console.log(cumReturnsObject);

  // could i make this dynamic by calling from backend or setting to current datetime property that records when there is a new year?
  const yearsArray = [2021, 2022, 2023, 2024, 2025];

  useEffect(() => {
    if (Object.keys(returns).length > 0) {
      const objFill = {};

      objFill['1'] =
        (1 + Number(returns?.['1']?.['2021']) / 100) *
        (1 + Number(returns?.['1']?.['2022']) / 100) *
        (1 + Number(returns?.['1']?.['2023']) / 100) *
        (1 + Number(returns?.['1']?.['2024']) / 100);
      objFill['2'] =
        (1 + Number(returns?.['2']?.['2021']) / 100) *
        (1 + Number(returns?.['2']?.['2022']) / 100) *
        (1 + Number(returns?.['2']?.['2023']) / 100) *
        (1 + Number(returns?.['2']?.['2024']) / 100);
      objFill['3'] =
        (1 + Number(returns?.['3']?.['2021']) / 100) *
        (1 + Number(returns?.['3']?.['2022']) / 100) *
        (1 + Number(returns?.['3']?.['2023']) / 100) *
        (1 + Number(returns?.['3']?.['2024']) / 100);
      objFill['4'] =
        (1 + Number(returns?.['4']?.['2021']) / 100) *
        (1 + Number(returns?.['4']?.['2022']) / 100) *
        (1 + Number(returns?.['4']?.['2023']) / 100) *
        (1 + Number(returns?.['4']?.['2024']) / 100);
      objFill['5'] =
        (1 + Number(returns?.['5']?.['2021']) / 100) *
        (1 + Number(returns?.['5']?.['2022']) / 100) *
        (1 + Number(returns?.['5']?.['2023']) / 100) *
        (1 + Number(returns?.['5']?.['2024']) / 100);

      setCumReturnsObject(objFill);
    }
  }, [returns]);

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

  const getAllBalances = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/accounts/allbalances/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error retrieving payments: ${error}`);
    }
  };

  useEffect(() => {
    const fetchAllBalances = async () => {
      const response = await getAllBalances();
      setAllBalances(response);
    };
    fetchAllBalances();
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
        {yearsArray.map((year) => (
          <p className="Home__year-column">{year}</p>
        ))}
        <p className="Home__year-column">Since 2021</p>
      </div>
      {accounts.map((account) => (
        <div className="Home__account-wrapper">
          <p key={account.id} className="Home__account-column">
            {account.name}
          </p>

          {yearsArray.map((year) => (
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/${year}`}
            >
              <p
                className={
                  returns[account.id]?.[year] >= 0
                    ? 'Home__positive-data'
                    : 'Home__negative-data'
                }
              >
                {returns[account.id]?.[year] + '%' || 'N/A'}
              </p>
            </Link>
          ))}
          <div className="Home__account-wrapper">
            <p className="Home__account-column">End of year</p>
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/2021`}
            >
              <p>
                {'£' +
                  nfObject.format(
                    allBalances?.[account.id]?.['2021']?.[0]?.['end']
                  ) || 'N/A'}
              </p>
            </Link>
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/2022`}
            >
              <p>
                {'£' +
                  nfObject.format(
                    allBalances?.[account.id]?.['2022']?.[0]?.['end']
                  ) || 'N/A'}
              </p>
            </Link>
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/2023`}
            >
              <p>
                {'£' +
                  nfObject.format(
                    allBalances?.[account.id]?.['2023']?.[0]?.['end']
                  ) || 'N/A'}
              </p>
            </Link>
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/2024`}
            >
              <p>
                {'£' +
                  nfObject.format(
                    allBalances?.[account.id]?.['2024']?.[0]?.['end']
                  ) || 'N/A'}
              </p>
            </Link>
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/2025`}
            >
              <p>
                {'£' +
                  nfObject.format(
                    allBalances?.[account.id]?.['2024']?.[0]?.['end']
                  ) || 'N/A'}
              </p>
            </Link>
            <Link
              className="Home__year-column"
              to={`/accounts/${account.id}/2025`}
            >
              <p>{'TBC' || 'N/A'}</p>
            </Link>
          </div>
        </div>
      ))}
      ;
      <div className="Home__account-wrapper">
        <p className="Home__account-column">Total</p>

        {yearsArray.map((year) => (
          <p key={year} className="Home__year-column">
            {'£' +
              nfObject.format(
                Object.keys(allBalances).reduce(
                  (sum, accountId) =>
                    sum +
                      Number(allBalances?.[accountId]?.[year]?.[0]?.['end']) ||
                    0,
                  0
                )
              ) || 'N/A'}
          </p>
        ))}

        <p className="Home__year-column">Total</p>
      </div>
      <form onSubmit={(e) => addAccount(e)}>
        <label name="accName">Account Name</label>
        <input name="accName" id="accName" />

        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default Home;

{
  /* <Link
                className="Home__year-column"
                to={`/accounts/${account.id}/2025`}
              >
                <p
                  className={
                    (cumReturnsObject?.[account.id] - 1) * 100 >= 0
                      ? 'Home__positive-data'
                      : 'Home__negative-data'
                  }
                >
                  {(cumReturnsObject?.[account.id] * 100).toFixed(2) || 'N/A'}
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
            </div> */
}
