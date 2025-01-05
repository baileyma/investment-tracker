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
    console.log('this gets called');
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

  if (!accounts) {
    return <h2>Loading....</h2>;
  }

  return (
    <>
      <p className="Details__last-updated">
        Latest balance: {balances[0]?.day}/{balances[0]?.month}/{year}
      </p>

      <div className="Details__title-wrapper">
        <h2 className="Details__title">
          Account: <br /> {accounts[Number(id - 1)].name}{' '}
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
              <option value={0}>1</option>
              <option value={1}>2</option>
              <option value={2}>3</option>
              <option value={3}>4</option>
              <option value={4}>5</option>
              <option value={5}>6</option>
              <option value={6}>7</option>
              <option value={7}>8</option>
              <option value={8}>9</option>
              <option value={9}>10</option>
              <option value={10}>11</option>
              <option value={11}>12</option>
            </select>

            <label name="day">Day</label>
            <select name="day" id="day">
              <option disabled selected>
                ---Day---
              </option>
              <option value={0}>1</option>
              <option value={1}>2</option>
              <option value={2}>3</option>
              <option value={3}>4</option>
              <option value={4}>5</option>
              <option value={5}>6</option>
              <option value={6}>7</option>
              <option value={7}>8</option>
              <option value={8}>9</option>
              <option value={9}>10</option>
              <option value={10}>11</option>
              <option value={11}>12</option>
              <option value={12}>13</option>
              <option value={13}>14</option>
              <option value={14}>15</option>
              <option value={15}>16</option>
              <option value={16}>17</option>
              <option value={17}>18</option>
              <option value={18}>19</option>
              <option value={19}>20</option>
              <option value={20}>21</option>
              <option value={21}>22</option>
              <option value={22}>23</option>
              <option value={23}>24</option>
              <option value={24}>25</option>
              <option value={25}>26</option>
              <option value={26}>27</option>
              <option value={27}>28</option>
              <option value={28}>29</option>
              <option value={29}>30</option>
              <option value={30}>31</option>
            </select>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
      <div className="Details__payments-wrapper">
        <div className="Details__payments-list">
          <h2>Payments</h2>
          {!payments.length && <p>No payments entered</p>}
          {payments.map((payment) => {
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
                <option value={0}>1</option>
                <option value={1}>2</option>
                <option value={2}>3</option>
                <option value={3}>4</option>
                <option value={4}>5</option>
                <option value={5}>6</option>
                <option value={6}>7</option>
                <option value={7}>8</option>
                <option value={8}>9</option>
                <option value={9}>10</option>
                <option value={10}>11</option>
                <option value={11}>12</option>
              </select>
            </div>

            <div className="Details__form">
              <label name="day">Day</label>

              <select name="day" id="day" type="number">
                <option disabled selected>
                  ---Day---
                </option>
                <option value={0}>1</option>
                <option value={1}>2</option>
                <option value={2}>3</option>
                <option value={3}>4</option>
                <option value={4}>5</option>
                <option value={5}>6</option>
                <option value={6}>7</option>
                <option value={7}>8</option>
                <option value={8}>9</option>
                <option value={9}>10</option>
                <option value={10}>11</option>
                <option value={11}>12</option>
                <option value={12}>13</option>
                <option value={13}>14</option>
                <option value={14}>15</option>
                <option value={15}>16</option>
                <option value={16}>17</option>
                <option value={17}>18</option>
                <option value={18}>19</option>
                <option value={19}>20</option>
                <option value={20}>21</option>
                <option value={21}>22</option>
                <option value={22}>23</option>
                <option value={23}>24</option>
                <option value={24}>25</option>
                <option value={25}>26</option>
                <option value={26}>27</option>
                <option value={27}>28</option>
                <option value={28}>29</option>
                <option value={29}>30</option>
                <option value={30}>31</option>
              </select>
            </div>

            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
