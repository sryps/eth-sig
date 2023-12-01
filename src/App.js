import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './styles.css';

function App() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [formData, setFormData] = useState('');
  const contractAddressInput = "0x8e22f3F44A6b4E1DFFe22587A06E22283E7AbFB1";
  const contractAddressURL = "https://goerli.etherscan.io/address/" + contractAddressInput;
  

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await window.web3.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(window.web3);
      } else {
        console.log('MetaMask not detected!');
      }
    };

    loadWeb3();
  }, []);

  useEffect(() => {
    if (web3 && contractAddressInput) {
      const contractABI = [{"constant":true,"inputs":[],"name":"DEPOSIT_CONTRACT_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes[]","name":"pubkeys","type":"bytes[]"},{"internalType":"bytes[]","name":"withdrawal_credentials","type":"bytes[]"},{"internalType":"bytes[]","name":"signatures","type":"bytes[]"},{"internalType":"bytes32[]","name":"deposit_data_roots","type":"bytes32[]"}],"name":"batchDeposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"DEPOSIT_AMOUNT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LogSendDepositLeftover","type":"event"}]

      try {
        const contractInstance = new web3.eth.Contract(contractABI, contractAddressInput);
        setContract(contractInstance);
        
        console.log('Contract Address:', contractAddressInput);
  
      } catch (error) {
        console.error('Error initializing contract instance:', error);
      }
    }
  }, [web3, contractAddressInput]);

  const handleSendTransaction = async () => {
    if (web3 && contract) {
      let transactionParameters = {};
      try {
        isValidJSON(formData["message"]);

        const contractData = JSON.parse(formData["message"]);

        let pubkeys = []
        let withdrawals = []
        let signatures = []
        let deposit_data_roots = []
        
        
        for (let i in contractData) {
          pubkeys.push(keyToHex(contractData[i]["pubkey"]));
          withdrawals.push(keyToHex(contractData[i]["withdrawal_credentials"]));
          signatures.push(keyToHex(contractData[i]["signature"]));
          deposit_data_roots.push(keyToHex(contractData[i]["deposit_data_root"]));
        }

        let amount = web3.utils.toWei((pubkeys.length * 32).toString(), 'ether');
        

        transactionParameters = {
          from: account,
          to: contractAddressInput,
          value: amount,
          data: contract.methods.batchDeposit(pubkeys,withdrawals,signatures,deposit_data_roots).encodeABI()
        };
        
      }
      catch (error) {
        console.error('Preparation Error:', error.message);
      }
      try {
        const transactionHash = await web3.eth.sendTransaction(transactionParameters);
        console.log('Transaction sent:', transactionHash);
      } catch (error) {
        console.error('Transaction error:', error);
      }
    }
  };

  const handleInputChange = (event) => {
    setFormData({ message: event.target.value });
  };

  return (
    <div className="container">
      <h1 className="header">Goerli - Batch Deposit Validators</h1>
      <div>
        <p className="account-info">Connected Account: {account}</p>
        <a rel="noreferrer" target="_blank" href={contractAddressURL} className="contract-info">Deposit to contract: {contractAddressInput}</a>
        <div className='spacer'></div>
        <textarea
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Enter deposit_data JSON..."
          className="textarea"
        />
        <br></br>
        <button onClick={handleSendTransaction} className="button">
          Send Transaction
        </button>
      </div>
    </div>
  );
}

function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    console.error("JSON is not valid: ",error);
    return false;
  }
}

function keyToHex(value) {
  if (value.slice(0,2) === "0x") {
    return value;
  }
  return "0x" + value;
}

export default App;
