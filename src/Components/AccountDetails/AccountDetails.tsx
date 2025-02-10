import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AccountDetails.scss';
import { Link } from 'react-router-dom';
import Popup from 'reactjs-popup';

const AccountDetails = () => {
  const [payments, setPayments] = useState([]);
  const [balances, setBalances] = useState('');
  const [accounts, setAccounts] = useState({});
  const [XIRR, setXIRR] = useState('');

  const { year, id } = useParams();

  payments.sort((a, b) => {
    return new Date(a.when) - new Date(b.when);
  });

  const monthsArray = [
    { month: 'January', value: 0 },
    { month: 'February', value: 1 },
    { month: 'March', value: 2 },
    { month: 'April', value: 3 },
    { month: 'May', value: 4 },
    { month: 'June', value: 5 },
    { month: 'July', value: 6 },
    { month: 'August', value: 7 },
    { month: 'September', value: 8 },
    { month: 'October', value: 9 },
    { month: 'November', value: 10 },
    { month: 'December', value: 11 },
  ];

  // Calculating Payments Overview figures for each account and year

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
      console.error(`Error retrieving balances: ${error}`);
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
      console.error(`Error retrieving xirr: ${error}`);
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
      end: event.target.end.value,
      month: event.target.month.value,
      day: event.target.day.value,
    };
    console.log(typeof balancesObj.end);
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
            <button className='"Details__button'>Previous Account</button>
          </Link>
          <Link to={`/accounts/${+id + 1}/${year}`}>
            <button className='"Details__button'>Next Account</button>
          </Link>
          <h2 className="Details__title">Account: {accounts?.[id]?.name} </h2>
        </div>
        <div className="Details__overview-button">
          <Link to={`/`}>
            <button className='"Details__button'>Back to overview</button>
          </Link>
        </div>
        <div className="Details__title-subwrap">
          <Link to={`/accounts/${id}/${+year - 1}`}>
            <button className='"Details__button'>Previous Year</button>
          </Link>
          <Link to={`/accounts/${id}/${+year + 1}`}>
            <button className='"Details__button'>Next Year</button>
          </Link>
          <h2 className="Details__title">Year: {year} </h2>
        </div>
      </div>

      <div className="Details__Main">
        <div className="Details__First">
          <div className="Details__balance-list">
            <div className="Details__balance-list-header">
              <h2>Balances/payments list</h2>

              <Popup
                trigger={
                  <button className="Details__addpayment-button">
                    {' '}
                    Add payment
                  </button>
                }
                position="right center"
              >
                {(close: () => void) => (
                  <>
                    <div className="Details__popup">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          postPayment(e);
                          close();
                        }}
                      >
                        <h2>Amount</h2>
                        <button
                          className="Details__popup-close"
                          onClick={close}
                        >
                          &times;
                        </button>
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
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option value={day}>{day}</option>
                            )
                          )}
                        </select>
                        <select name="month" id="month">
                          <option disabled selected>
                            ---Month---
                          </option>
                          {monthsArray.map((month) => (
                            <option value={month.value}>{month.month}</option>
                          ))}
                        </select>

                        <br />
                        <br />

                        <button type="submit">Submit</button>
                      </form>
                    </div>
                  </>
                )}
              </Popup>
            </div>

            <h3>
              1 January: Balance of £{nfObject.format(balances[0]?.start)}
            </h3>

            {!payments.length && <h3>No payments entered</h3>}

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

                      <button
                        className="Details__payment-button"
                        onClick={() => deletePayment(payment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                );
              })}

            <div className="Details__payment-item">
              <h3 className="Details__balance-item">
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
              <Popup
                trigger={
                  <button className="Details__payment-button"> Edit</button>
                }
                position="right center"
              >
                {(close: () => void) => (
                  <>
                    <div className="Details__popup">
                      <form
                        className="Details__popup-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          postBalances(e);
                          close();
                        }}
                      >
                        <div className="Details__popup-title">
                          <h2>Enter Balance Date and Amount</h2>
                          <button
                            className="Details__popup-close"
                            onClick={close}
                          >
                            &times;
                          </button>
                        </div>

                        <div className="Details__popup-form-item">
                          <label>Balance as of </label>

                          <select name="day" id="day">
                            <option disabled selected>
                              ---Day---
                            </option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <option value={day}>{day}</option>
                              )
                            )}
                          </select>

                          <select name="month" id="month">
                            <option disabled selected>
                              ---Month---
                            </option>
                            {monthsArray.map((month) => (
                              <option value={month.value}>{month.month}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          name="end"
                          id="end"
                          type="number"
                          defaultValue={balances[0]?.end || 0}
                        />

                        <button type="submit">Submit</button>
                      </form>
                    </div>
                  </>
                )}
              </Popup>
            </div>
          </div>
        </div>

        <div className="Details__Analysis">
          <h2>Payments overview</h2>
          <div className="Details__Analysis-wrapper">
            <p className="Details__Analysis-property">Total deposits </p>
            <p>
              {deposits ? `£${nfObject.format(deposits)}` : '£0'} (
              {((deposits / balances[0]?.start) * 100).toFixed(2)}%)
            </p>
          </div>
          <div className="Details__Analysis-wrapper">
            <p className="Details__Analysis-property">Total withdrawals</p>
            <p>
              {' '}
              {withdrawals ? `£${nfObject.format(withdrawals)}` : '£0'} (
              {((withdrawals / balances[0]?.start) * 100).toFixed(2)}%)
            </p>
          </div>
          <div className="Details__Analysis-wrapper">
            <p className="Details__Analysis-property">Total net payments </p>
            <p>
              {total ? `£${nfObject.format(total)}` : '£0'} :(
              {((total / balances[0]?.start) * 100).toFixed(2)}%)
            </p>
          </div>
          <h2>Returns overview</h2>
          <div className="Details__Analysis-wrapper">
            <p className="Details__Analysis-property">Return (XIRR) </p>
            <p>{(XIRR * 100).toFixed(2)}%</p>
          </div>
          <div className="Details__Analysis-wrapper">
            <p className="Details__Analysis-property">
              Growth (net payments + XIRR return)
            </p>
            <p>
              {((total / balances[0]?.start) * 100 + XIRR * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="Details__Editing">
        <div className="Details__payments-wrapper"></div>
      </div>
    </>
  );
};

export default AccountDetails;
