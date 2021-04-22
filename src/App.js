import React, { useState, useEffect, useCallback } from 'react';
import Moment from 'react-moment';
import './App.css';

const titleStyle = { textAlign: 'center', fontSize: '48px', fontWeight: 'bold', marginTop: '16px'};

const TodayBalance = ({ amt }) => (
  <div className="today-balance" data-testid="balance">
    <h1>{amt} ₹</h1>
    <p>Todays Balance</p>
  </div>
);

function App() {
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] =useState(false);
  // Modal type value 'IN' or 'OUT'
  const [modalType, setModalType] = useState('IN');
  const [inputVal, setInputVal] = useState('');
  const [noteVal, setNoteVal] = useState('');
  const [isInputError, setInputError] = useState(false);

  const getEntry = useCallback(() => {
    fetch('/entry').then(res => res.json()).then(entries => setEntries(entries));
  }, [setEntries]);

  const postEntry = (obj) => {
    setEntries([...entries, {
      amount: obj.amount,
      type: obj.type,
      note: obj.note,
      timestamp: new Date()
    }]);
    fetch('/entry', {
      method: 'POST',
      body: JSON.stringify({
        amount: obj.amount,
        type: obj.type,
        note: obj.note,
        timestamp: new Date()
      }),

      headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    }).then(res => res.json())
    .then(data => {
      setInputVal('');
      setNoteVal('');
      // Below get api is not updated hence commenting
      // getEntry();
    }).catch(err => console.log(err));
  };

  const RowEntry = ({ amount='', note='', date, type=1}) => (
    <div className="transaction">
      <div className="entry">
        <Moment>{date}</Moment>
        <h1 style={{ color: 'black' }}>{note}</h1>
      </div>
      <div className="entry out">
        <div>Out</div>
        <h1>{type === 0 ? `₹${amount}` : '-'}</h1>
      </div>
      <div className="entry in">
       <div>In</div>
        <h1>{type === 1 ? `₹${amount}` : '-'}</h1>
      </div>
    </div>
  );

  useEffect(() => {
    getEntry();
  }, [getEntry])

  useEffect(() => {
    if (entries.length) {
      let total = 0;
      entries.forEach(obj => {
        obj.type === 1 ? total += parseInt(obj.amount) : total -= parseInt(obj.amount);
      });
      setBalance(total);
    }
  }, [entries, setBalance])

  return (
    <div className="App">
      <div className="title" style={titleStyle}>My Cashbook</div>
      <TodayBalance amt={balance} />
      <div className="content" style={{backgroundColor: 'lightgrey', minHeight: '150px', marginTop: '10px'}}>
      <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: 'grey', paddingTop: '55px'}}>
        {entries.length === 0 && 'No Entry Found!'}
        <div style={{margin: '10px'}}>
          {entries && entries.map(obj => 
            <RowEntry note={obj.note} date={obj.timestamp} type={obj.type} amount={obj.amount} key={obj.timestamp} />
          )}
        </div>        
      </div>

      </div>
      <div className="action-group">
        <button className="red" data-testid="cashout-btn" onClick={() => {setModalType('OUT');setShowModal(true);}}>Out</button>
        <button className="green" data-testid="cashin-btn" onClick={() => {setModalType('IN');setShowModal(true);}}>IN</button>
      </div>
      {showModal && (
        <div className="model">
          <div className="model-content">
            <div style={{ fontSize: '16px', fontWeight: 'bold', padding: '10px'}}>New Entry</div>
            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
            <input placeholder="₹ 0.00" value={inputVal} onChange={(e) => {
                setInputVal(e.target.value);
                if (isNaN(e.target.value)) {
                  setInputError(true);
                  e.target.style.borderColor = "red";
                } else {
                  setInputError(false);
                  e.target.style.borderColor = "";
                }
              }} data-testid="amount" />
            <textarea placeholder="Entry Note" value={noteVal} onChange={(e) => {
                if (!/^[a-zA-Z]*$/g.test(e.target.value)) {
                  setInputError(true);
                  e.target.style.borderColor = "red";
                } else {
                  setInputError(false);
                  e.target.style.borderColor = "";
                }
                setNoteVal(e.target.value);
              }} rows={4} data-testid="note"/>
            {isInputError && (
              <p className="validation-message" style={{ color: 'red' }}>Amount should be numerical value. Note only accepts alphabets.</p>
            )}
            <button
              className={modalType === 'IN' ? "green-btn" : "red-btn"}
              data-testid="create-entry-btn"
              onClick={() => {
                let obj = {
                  amount: inputVal,
                  note: noteVal,
                  type: modalType === 'IN' ? 1 : 0,
                }
                postEntry(obj);
                setShowModal(false);
              }}
              disabled={!(inputVal && noteVal) || isInputError}
            >
              {modalType}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
