import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AccountDetails.scss';
import { Link } from 'react-router-dom';

const AccountDetails = () => {
  const [payments, setPayments] = useState([]);
  const [balances, setBalances] = useState('');
  const [accounts, setAccounts] = useState({});
  const [XIRR, setXIRR] = useState('');

  payments.sort((a, b) => {
    return new Date(a.when) - new Date(b.when);
  });

  let total = 0;
  let deposits = 0;
  let withdrawals = 0;

  if (payments.length) {
    total = payments.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    }, 0);
    deposits = payments.reduce((acc, cur) => {
      return Number(cur.amount) >= 0 ? (acc += Number(cur.amount)) : (acc += 0);
    }, 0);
    withdrawals = payments.reduce((acc, cur) => {
      return Number(cur.amount) < 0 ? (acc += Number(cur.amount)) : (acc += 0);
    }, 0);
  }

  const { year, id } = useParams();

  const getAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/accounts');
      return response.data;
    } catch (error) {
      console.error(`Error retrieving players: ${error}`);
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await getAccounts();
      setAccounts(response);
    };
    fetchAccounts();
  }, [id]);

  const getPayments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/accounts/payments/${id}/${year}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error retrieving payments: ${error}`);
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      const response = await getPayments();
      setPayments(response);
    };
    fetchPayments();
  }, [id, year]);

  const getBalances = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/accounts/balances/${id}/${year}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error retrieving payments: ${error}`);
    }
  };

  useEffect(() => {
    const fetchBalances = async () => {
      const response = await getBalances();
      setBalances(response);
    };
    fetchBalances();
  }, [id, year]);

  const getXIRR = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/accounts/returns/${id}/${year}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error retrieving payments: ${error}`);
    }
  };

  useEffect(() => {
    const fetchXIRR = async () => {
      const response = await getXIRR();
      setXIRR(response);
    };
    fetchXIRR();
  }, [id, year]);

  const nfObject = new Intl.NumberFormat('en-US');

  const postPayment = async (event) => {
    event.preventDefault();

    const paymentObj = {
      amount: event.target.amount.value,
      month: event.target.month.value,
      day: event.target.day.value,
    };
    console.log(paymentObj);
    const ID = await axios.post(
      `http://localhost:8080/updates/payment/${id}/${year}`,
      paymentObj
    );
    const response = await getPayments();
    setPayments(response);
    const responseXIRR = await getXIRR();
    setXIRR(responseXIRR);
    return ID;
  };

  const postBalances = async (event) => {
    event.preventDefault();
    const balancesObj = {
      start: event.target.start.value,
      end: event.target.end.value,
      month: event.target.month.value,
      day: event.target.day.value,
    };
    console.log(balancesObj);
    const ID = await axios.post(
      `http://localhost:8080/updates/balances/${id}/${year}`,
      balancesObj
    );
    const response = await getBalances();
    console.log(response);
    setBalances(response);
    const responseXIRR = await getXIRR();
    setXIRR(responseXIRR);
    return ID;
  };

  const deletePayment = async (paymentID) => {
    const ID = await axios.delete(
      `http://localhost:8080/updates/delete/${id}/${year}/${paymentID}`
    );
    const response = await getPayments();
    setPayments(response);
    const responseXIRR = await getXIRR();
    setXIRR(responseXIRR);

    return ID;
  };

  // problem when you make 2026 or a new account, it starts empty so then page won't load
  if (!Object.keys(accounts).length || !balances.length) {
    return <h2>Loading....</h2>;
  }

  return (
    <>
      <p className="Details__last-updated">
        Latest balance:{' '}
        {balances[0]?.day && balances[0]?.month
          ? `${balances[0]?.day}/${balances[0]?.month}/${year}`
          : 'N/A'}
      </p>
      <Link to={`/accounts/${id}/${+year + 1}`}>
        <button>Next Year</button>
      </Link>
      <Link to={`/accounts/${id}/${+year - 1}`}>
        <button>Previous Year</button>
      </Link>
      <Link to={`/accounts/${+id + 1}/${year}`}>
        <button>Next Account</button>
      </Link>
      <Link to={`/accounts/${+id - 1}/${year}`}>
        <button>Previous Account</button>
      </Link>

      <Link to={`/`}>
        <button>Back to overview</button>
      </Link>

      <div className="Details__title-wrapper">
        <h2 className="Details__title">
          Account: <br /> {accounts?.[id]?.name}{' '}
        </h2>
        <h2 className="Details__year">
          Year: <br /> {year}{' '}
        </h2>
      </div>

      <h2 className="Details__xirr">
        Return (XIRR): {(XIRR * 100).toFixed(2)}%
      </h2>

      <div className="Details__balance-wrapper">
        <div>
          <h2>
            Balance 1st Jan: <br /> £{nfObject.format(balances[0]?.start)}
          </h2>
          <button>Edit</button>
          <h2>
            Balance {balances[0]?.day}/{balances[0]?.month}: <br /> £
            {nfObject.format(balances[0]?.end)}
          </h2>
          <button>Edit</button>
        </div>

        <div className="Details__balance-inputs">
          <form className="Details__form" onSubmit={(e) => postBalances(e)}>
            <label name="start">Jan 1st</label>
            <input
              name="start"
              id="start"
              type="number"
              defaultValue={balances[0]?.start || 0}
            />

            <br />
            <br />
            <br />
            <br />

            <label name="end">Balance</label>

            <input
              name="end"
              id="end"
              type="number"
              defaultValue={balances[0]?.end || 0}
            />
            <br />

            <select name="month" id="month">
              <option disabled selected>
                ---Month---
              </option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option value={month}>{month}</option>
              ))}
            </select>

            <label name="day">Day</label>
            <select name="day" id="day">
              <option disabled selected>
                ---Day---
              </option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option value={day}>{day}</option>
              ))}
            </select>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <div className="Details__payments-wrapper">
        <div className="Details__payments-list">
          <h2>Payments</h2>
          {!payments.length && <p>No payments entered</p>}
          {payments &&
            payments.map((payment) => {
              return (
                <>
                  <div key={payment.id} className="Details__payment-item">
                    <h3
                      className={
                        payment.amount >= 0
                          ? 'Details__deposited'
                          : 'Details__withdrawn'
                      }
                    >
                      {nfObject.format(Math.abs(payment.amount))} ---
                      {new Date(payment.when).toLocaleDateString('en-GB')}
                    </h3>

                    <button onClick={() => deletePayment(payment.id)}>
                      Delete
                    </button>
                  </div>
                </>
              );
            })}
        </div>
        <div>
          <h2>Add payment</h2>
          <form onSubmit={(e) => postPayment(e)}>
            <div className="Details__form">
              <label name="amount">Amount</label>
              <input name="amount" id="amount" type="number" />
            </div>

            <div className="Details__form">
              <label name="month">Month</label>
              <select name="month" id="month" type="number">
                <option disabled selected>
                  ---Month---
                </option>

                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="Details__form">
              <label name="day">Day</label>

              <select name="day" id="day" type="number">
                <option disabled selected>
                  ---Day---
                </option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option value={day}>{day}</option>
                ))}
              </select>
            </div>

            <button type="submit">Submit</button>
          </form>
          <h2>Total net payments</h2>
          <p>{total ? `£${nfObject.format(total)}` : 'N/A'}</p>
          <h2>Total deposits</h2>
          <p>{deposits ? `£${nfObject.format(deposits)}` : 'N/A'}</p>
          <h2>Total withdrwals</h2>
          <p>
            {withdrawals ? `£${nfObject.format(withdrawals)}` : 'N/A'} :{' '}
            {((withdrawals / balances[0]?.start) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
