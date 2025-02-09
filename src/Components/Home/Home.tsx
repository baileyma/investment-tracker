import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.scss';
import { Link } from 'react-router-dom';

//22 and 82

const Home = () => {
  const [accounts, setAccounts] = useState({});
  const [returns, setReturns] = useState({});
  const [showDelete, setShowDelete] = useState({});
  const [allBalances, setAllBalances] = useState({});
  const [cumReturnsObject, setCumReturnsObject] = useState({});

  const nfObject = new Intl.NumberFormat('en-US');

  // could i make this dynamic by calling from backend or setting to current datetime property that records when there is a new year?
  const yearsArray = [2021, 2022, 2023, 2024, 2025];

  useEffect(() => {
    if (Object.keys(accounts).length > 0) {
      const objFill = {};

      Object.keys(accounts).forEach((accountID) => {
        objFill[accountID] = 1;
        yearsArray.forEach((year) => {
          objFill[accountID] *= 1 + Number(returns?.[accountID]?.[year]) / 100;
        });
      });
      setCumReturnsObject(objFill);
    }
  }, [accounts, returns]);

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

      await Promise.all(
        Object.keys(accounts).map(async (accountID) => {
          resultingReturns[accountID] = await getReturns(accountID);
        })
      );

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
    if (Object.keys(accounts).length > 0) {
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

  console.log(allBalances);

  if (!Object.keys(accounts).length || Object.keys(returns).length === 0) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <h2>Accounts</h2>
      {/* Loop creating column names */}
      <div className="Home__account-wrapper">
        <p className="Home__account-column">Account Name</p>
        <p className="Home__year-column">Jan 2021</p>
        {yearsArray.map((year) => (
          <p key={year} className="Home__year-column">
            {year}
          </p>
        ))}
        <p className="Home__year-column">Since Jan 2021</p>
        <button className="Home__delete-button">XXXXX</button>
      </div>
      {/* Loop creating rows showing each year's returns */}
      {Object.keys(accounts).map((accountId) => (
        <>
          <div key={accounts[accountId]?.id} className="Home__account-wrapper">
            <p className="Home__account-column">{accounts[accountId]?.name}</p>
            <p className="Home__year-column-centred">
              {'£' +
                nfObject.format(
                  allBalances?.[accounts[accountId]?.id]?.[2021]?.[0]?.['start']
                ) || 'N/A'}
            </p>

            {yearsArray.map((year) => (
              <Link
                key={`${accountId}-${year}`}
                className="Home__year-column"
                to={`/accounts/${accounts[accountId]?.id}/${year}`}
              >
                <p>
                  {'£' +
                    nfObject.format(
                      allBalances?.[accounts[accountId]?.id]?.[year]?.[0]?.[
                        'end'
                      ]
                    ) || 'N/A'}
                </p>
                <p
                  className={
                    returns[accounts[accountId]?.id]?.[year] >= 0
                      ? 'Home__positive-data'
                      : 'Home__negative-data'
                  }
                >
                  {returns[accounts[accountId]?.id]?.[year] + '%' || 'N/A'}
                </p>
              </Link>
            ))}

            <p className="Home__cumret-column">
              {Number(
                nfObject.format(cumReturnsObject[accounts[accountId]?.id] * 100)
              ).toFixed(2)}
            </p>

            <button
              className="Home__delete-button"
              onClick={() => toggleDelete(accounts[accountId]?.id)}
            >
              {showDelete[accounts[accountId]?.id] ? 'Cancel' : 'Delete'}
            </button>

            <button
              className={
                showDelete[accounts[accountId]?.id]
                  ? 'Home__delete-button'
                  : 'Home__delete-button--hidden'
              }
              onClick={() => deleteAccount(accounts[accountId]?.id)}
            >
              Click here to confirm
            </button>
          </div>
        </>
      ))}

      <div className="Home__account-wrapper">
        <p className="Home__account-column">Total</p>
        <p className="Home__year-column">
          {'£' +
            nfObject.format(
              Object.keys(allBalances).reduce((sum, accountId) => {
                const balance =
                  allBalances?.[accountId]?.[2021]?.[0]?.['start'];

                return balance !== undefined && balance !== null
                  ? sum + Number(balance)
                  : sum;
              }, 0)
            ) || 'N/A'}
        </p>

        {yearsArray.map((year) => (
          <p key={year} className="Home__year-column">
            {'£' +
              nfObject.format(
                Object.keys(allBalances).reduce((sum, accountId) => {
                  const balance =
                    allBalances?.[accountId]?.[year]?.[0]?.['end'];

                  return balance !== undefined && balance !== null
                    ? sum + Number(balance)
                    : sum;
                }, 0)
              ) || 'N/A'}
          </p>
        ))}

        <p className="Home__year-column">Total</p>
        <button className="Home__delete-button">XXXXX</button>
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
