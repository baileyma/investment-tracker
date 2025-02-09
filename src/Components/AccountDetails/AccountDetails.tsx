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
      dep: event.target.dep.value,
      month: event.target.month.value,
      day: event.target.day.value,
    };
    console.log(paymentObj.dep);
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
        Last updated:{' '}
        {balances[0]?.day && balances[0]?.month
          ? `${new Date(
              Number(year),
              Number(balances[0]?.month),
              Number(balances[0]?.day)
            ).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}`
          : 'N/A'}
      </p>
      <div className="Details__title-wrapper">
        <div className="Details__title-subwrap">
          <Link to={`/accounts/${+id - 1}/${year}`}>
            <button>Previous Account</button>
          </Link>
          <h2 className="Details__title">Account: {accounts?.[id]?.name} </h2>
          <Link to={`/accounts/${+id + 1}/${year}`}>
            <button>Next Account</button>
          </Link>
        </div>
        <div className="Details__overview-button">
          <Link to={`/`}>
            <button>Back to overview</button>
          </Link>
        </div>
        <div className="Details__title-subwrap">
          <Link to={`/accounts/${id}/${+year - 1}`}>
            <button>Previous Year</button>
          </Link>
          <h2 className="Details__title">Year: {year} </h2>
          <Link to={`/accounts/${id}/${+year + 1}`}>
            <button>Next Year</button>
          </Link>
        </div>
      </div>
      <div className="Details__buttons-wrapper"></div>

      <div className="Details__Main">
        <div className="Details__First">
          <div>
            <h2>Balances/payments list</h2>
            <h3>
              1 January: Balance of £{nfObject.format(balances[0]?.start)}
            </h3>
            <div className="Details__payments-list">
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
                          {new Date(payment.when).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                          })}
                          {': '}£{nfObject.format(Math.abs(payment.amount))}{' '}
                          {payment.amount >= 0 ? 'deposited' : 'withdrawn'}
                        </h3>

                        <button onClick={() => deletePayment(payment.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })}
            </div>
            <h3>
              {`${new Date(
                Number(year),
                Number(balances[0]?.month),
                Number(balances[0]?.day)
              ).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
              })}`}
              : Balance of £{nfObject.format(balances[0]?.end)}
            </h3>
          </div>
        </div>

        <div className="Details__Analysis">
          <h2>Total deposits</h2>
          <p>
            {deposits ? `£${nfObject.format(deposits)}` : '£0'} :{' '}
            {((deposits / balances[0]?.start) * 100).toFixed(2)}%
          </p>
          <h2>Total withdrwals</h2>
          <p>
            {withdrawals ? `£${nfObject.format(withdrawals)}` : '£0'} :{' '}
            {((withdrawals / balances[0]?.start) * 100).toFixed(2)}%
          </p>
          <h2>Total net payments</h2>
          <p>
            {total ? `£${nfObject.format(total)}` : '£0'} :{' '}
            {((total / balances[0]?.start) * 100).toFixed(2)}%
          </p>
          <h2>Return (XIRR): {(XIRR * 100).toFixed(2)}%</h2>
          <h2>Growth (net payments + return)</h2>
          <p>{((total / balances[0]?.start) * 100 + XIRR * 100).toFixed(2)}%</p>
        </div>
      </div>

      <div className="Details__Editing">
        <div className="Details__Edit-balances">
          <h2>Edit balances</h2>
          <form className="Details__form" onSubmit={(e) => postBalances(e)}>
            <label name="start">
              Balance on 1 January <br /> <br />
            </label>
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

            <label name="end">Balance on</label>
            <select name="day" id="day">
              <option disabled selected>
                ---Day---
              </option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option value={day}>{day}</option>
              ))}
            </select>
            <select name="month" id="month">
              <option disabled selected>
                ---Month---
              </option>

              <option value={0}>January</option>
              <option value={1}>February</option>
              <option value={2}>March</option>
              <option value={3}>April</option>
              <option value={4}>May</option>
              <option value={5}>June</option>
              <option value={6}>July</option>
              <option value={7}>August</option>
              <option value={8}>September</option>
              <option value={9}>October</option>
              <option value={10}>November</option>
              <option value={1}>December</option>
            </select>
            <br />
            <br />
            <input
              name="end"
              id="end"
              type="number"
              defaultValue={balances[0]?.end || 0}
            />
            <br />
            <br />

            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="Details__payments-wrapper">
          <h2>Add payment</h2>
          <form onSubmit={(e) => postPayment(e)}>
            <h2>Amount</h2>
            <input name="amount" id="amount" type="number" />
            <br />
            <br />
            <label name="dep">Deposit or Withdrawal</label>
            <select name="dep" id="dep" type="boolean">
              <option disabled selected>
                ---Choose an option---
              </option>
              <option value={true}>Deposit</option>
              <option value={false}>Withdrawal</option>
            </select>

            <h2>On</h2>
            <select name="day" id="day" type="number">
              <option disabled selected>
                ---Day---
              </option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option value={day}>{day}</option>
              ))}
            </select>
            <select name="month" id="month">
              <option disabled selected>
                ---Month---
              </option>

              <option value={0}>January</option>
              <option value={1}>February</option>
              <option value={2}>March</option>
              <option value={3}>April</option>
              <option value={4}>May</option>
              <option value={5}>June</option>
              <option value={6}>July</option>
              <option value={7}>August</option>
              <option value={8}>September</option>
              <option value={9}>October</option>
              <option value={10}>November</option>
              <option value={1}>December</option>
            </select>

            <br />
            <br />

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
