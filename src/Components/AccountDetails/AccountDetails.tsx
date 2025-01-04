import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AccountDetails.scss';

const AccountDetails = () => {
  const [payments, setPayments] = useState('');
  const [balances, setBalances] = useState('');
  const [accounts, setAccounts] = useState('');
  const [XIRR, setXIRR] = useState('');

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  const nfObject = new Intl.NumberFormat('en-US');

  const postPayment = async (event) => {
    event.preventDefault();
    const paymentObj = {
      amount: event.target.amount.value,
      month: event.target.month.value,
      day: event.target.day.value,
    };
    const response = await axios.post('http://localhost:8080/', paymentObj);
    return response;
  };

  if (!payments || !accounts || !balances || !XIRR) {
    return <h2>Loading....</h2>;
  }

  return (
    <>
      <p className="Details__last-updated">Last updated: xx/xx/xx</p>

      <div className="Details__title-wrapper">
        <h2 className="Details__title">
          Account: <br /> {accounts[Number(id - 1)].name}{' '}
        </h2>
        <h2 className="Details__year">
          Year: <br /> {year}{' '}
        </h2>
      </div>

      <h2 className="Details__xirr">XIRR : {(XIRR * 100).toFixed(2)}%</h2>

      <div className="Details__balance-wrapper">
        <div>
          <h2>
            Balance 1st Jan: <br /> £{nfObject.format(balances[0].start)}
          </h2>
          <h2>
            Balance 31st Dec: <br /> £{nfObject.format(balances[0].end)}
          </h2>
        </div>
        <div>
          <h2>Add balances</h2>
          <form onSubmit={(e) => postPayment(e)}>
            <div>
              <label name="amount">Jan 1st</label>
              <input name="amount" id="amount" type="number" />
            </div>

            <div className="Details__form">
              <label name="month">Dec 31st</label>
              <input name="month" id="month" type="number" />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <div className="Details__payments-wrapper">
        <div>
          <h2>Payments</h2>
          {payments.map((payment) => {
            return (
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
              <input name="month" id="month" type="number" />
            </div>

            <div className="Details__form">
              <label name="day">Day</label>
              <input name="day" id="day" type="number" />
            </div>

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
