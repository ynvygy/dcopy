import { useState } from "react";
import { ethers } from "ethers";
const axios = require("axios");

export default function List({decode}) {
  const API_KEY = 'JKDHQNED6KA3U4R935QFGXZD4ZJRG1VIQZ';
  //const address = '0x3e702E39e0649bd8581D07a5bf1b9e5924d94Ce0';
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [decodedList, setDecodedList] = useState([]);

  const tx = "0x18cbafe5000000000000000000000000000000000000000000000e8f081db951143df68000000000000000000000000000000000000000000000000006933ad0f3466c0500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000003e702e39e0649bd8581d07a5bf1b9e5924d94ce00000000000000000000000000000000000000000000000000000000060818d920000000000000000000000000000000000000000000000000000000000000002000000000000000000000000fa14fa6958401314851a17d6c5360ca29f74b57b000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

  const handleFetchTransactions = async () => {
    try {
      const response = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${API_KEY}`);
  
      const filteredTransactions = response.data.result.filter(transaction => {
        return (transaction.functionName.startsWith('swapExactTokensForETH') || transaction.functionName.startsWith('swapETHForExactTokens'));
      });
  
      const decodedPromises = filteredTransactions.map(async transaction => {
        const decodedInput = await decode(transaction.input);
        return JSON.parse(decodedInput);
      });
  
      const decodedList = await Promise.all(decodedPromises);
  
      setTransactions(filteredTransactions);
      setDecodedList(decodedList);
      console.log(filteredTransactions.length);
      console.log(decodedList);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

	return (
    <div>
      <input
        type="text"
        value={address}
        onChange={handleAddressChange}
        placeholder="Enter an address"
      />
      <p>For demo purposes: 0x965b1a0b5b56b113253678b4b04da469d1316ce4</p>
      <button onClick={handleFetchTransactions}>Fetch Transactions</button>
      <div>
        {transactions.length > 0  && <table>
            <thead>
              <tr>
                <th>Tx Hash</th>
                <th>Type</th>
                <th>Token</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                (decodedList[index]['params'].length === 5) ? (
                  <tr key={index}>
                    <td>{tx.hash}</td>
                    <td>Sold </td>
                    <td>{decodedList[index]['params'][2]['value'][0]}</td>
                    <td>{ethers.utils.formatUnits(decodedList[index]['params'][1]['value'], 'ether').slice(0,7)} ETH</td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td>{tx.hash}</td>
                    <td>Bought</td>
                    <td>{decodedList[index]['params'][1]['value'][1]}</td>
                    <td>{ethers.utils.formatUnits(tx['value'], 'ether').slice(0,7)} ETH</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        }
        </div>
      <ul>
          {/*
          {transactions.map((tx, index) => (
            (decodedList[index]['params'].length === 5) ? 
              (<li key={index}>{tx.hash} - {decodedList[index]['params'][2]['value'][0]} - {decodedList[index]['params'][2]['value'][1]} - {decodedList[index]['params'][0]['value']} - {decodedList[index]['params'][1]['value']}</li>)
              : (<li key={index}>{tx.hash} - {decodedList[index]['params'][1]['value'][0]} - {decodedList[index]['params'][1]['value'][1]} - {decodedList[index]['params'][0]['value']} - {tx['value']}</li>)
          ))}ethers.utils.formatUnits(valueInGwei, 'gwei');
          
          {transactions.map((tx, index) => (
            (decodedList[index]['params'].length === 5) ? 
              (<li key={index}>{tx.hash} - Sold {decodedList[index]['params'][2]['value'][0]} for {ethers.utils.formatUnits(decodedList[index]['params'][1]['value'], 'ether')} ETH</li>)
              : (<li key={index}>{tx.hash} - Bought {decodedList[index]['params'][1]['value'][1]} for {ethers.utils.formatUnits(tx['value'], 'ether')} ETH</li>)
          ))}
          */}
        </ul>
    </div>
  );
}