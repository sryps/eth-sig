import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './styles.css';

function App() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [formData, setFormData] = useState('');
  const [contractAddressInput, setContractAddressInput] = useState('');
  

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
      // contract ABI - https://goerli.etherscan.io/address/0xff50ed3d0ec03ac01d4c79aad74928bff48a7b2b#code
      const contractABI = [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "pubkey",
              "type": "bytes"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "withdrawal_credentials",
              "type": "bytes"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "amount",
              "type": "bytes"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            },
            {
              "indexed": false,
              "internalType": "bytes",
              "name": "index",
              "type": "bytes"
            }
          ],
          "name": "DepositEvent",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "bytes",
              "name": "pubkey",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "withdrawal_credentials",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "deposit_data_root",
              "type": "bytes32"
            }
          ],
          "name": "deposit",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "get_deposit_count",
          "outputs": [
            {
              "internalType": "bytes",
              "name": "",
              "type": "bytes"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "get_deposit_root",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        }
      ];

      try {
        const contractInstance = new web3.eth.Contract(contractABI, contractAddressInput);
        setContract(contractInstance);
  
        // Log the contract address
        console.log('Contract Address:', contractAddressInput);
  
        // Log the contract methods for debugging
        console.log('Contract Methods:', contractInstance.methods);
  
      } catch (error) {
        console.error('Error initializing contract instance:', error);
      }
    }
  }, [web3, contractAddressInput]);

  const handleSendTransaction = async () => {
    if (web3 && contract) {
      try {
        const isValid = isValidJSON(formData["message"]);
        console.log(`Is JSON valid? ${isValid}`);

        const contractData = JSON.parse(formData["message"]);
        console.log(contractData);

        const transactionParameters = {
          to: contractAddressInput,
          data: contract.methods.storeData(contractData).encodeABI()
        };

        const gas = await contract.methods.storeData(contractData).estimateGas({ from: account });
        transactionParameters.gas = web3.utils.toHex(gas);

        const signedTransaction = await web3.eth.accounts.signTransaction(transactionParameters, account);

        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        console.log('Transaction Receipt:', receipt);
      } catch (error) {
        console.error('Transaction Error:', error.message);
      }
    }
  };

  const handleInputChange = (event) => {
    setFormData({ message: event.target.value });
  };

  const handleContractAddressInputChange = (event) => {
    setContractAddressInput(event.target.value);
  };

  return (
    <div className="container">
      <h1 className="header">MetaMask Web App</h1>
      <div>
        <p className="account-info">Connected Account: {account}</p>
        <input
          type="text"
          value={contractAddressInput}
          onChange={handleContractAddressInputChange}
          placeholder="Enter contract address..."
          className="input"
        />
        <textarea
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Enter message..."
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
    return false;
  }
}

export default App;
