import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
const ethers = require("ethers"); // Ethereum library for interacting with the blockchain
const abi = require("./abi.json"); // ABI (Application Binary Interface) for the smart contract
const axios = require("axios"); // HTTP client library for making API requests
const abiDecoder = require("abi-decoder"); // Library for decoding transaction data
import { useEffect, useState } from "react";

const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const wssUrl = 'wssurl'

abiDecoder.addABI(abi);

const decode = async (DATA) => {
  const decodedData = abiDecoder.decodeMethod(DATA);

  // Decode the inner transaction data
  const innerDecodedData = abiDecoder.decodeMethod(
    decodedData.params[1].value[0]
  );

  console.log("=================");

  // Return the decoded data as a JSON string
  return JSON.stringify(decodedData, null, 1);
};

export default function InstructionsComponent() {
	const [address, setAddress] = useState("");
	const [fetchData, setFetchData] = useState(false);
	const [stop, setStop] = useState(false);
	const [transactionList, setTransactionList] = useState([]);

	async function main() {
		if (!stop) {
			const provider = new ethers.providers.WebSocketProvider(wssUrl);
		
			// Listen for the "pending" event
			provider.on("pending", async (tx) => {
				const txnData = await provider.getTransaction(tx);
				if (txnData) {
					// Check if the transaction is sent to the router contract
					console.log(txnData)
					if (txnData.to == router) {
						addTransactionToList(txnData)
						const decodedData = await decode(txnData.data); // Decode the transaction data
						console.log(decodedData); // Print the decoded data
						// Perform further processing or store the data in a database
					}
				}
			});
		
			// Recursive setTimeout loop to run the main function repeatedly
			if (fetchData && !stop) {
				setTimeout(main, 1000); // Adjust the interval as needed (e.g., 1000 milliseconds = 1 second)
			}
		}
	}

	const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

	const handleFetchData = () => {
		setFetchData(!fetchData);
		main();
	};

	const handleStop = () => {
		setStop(true);
	}

	const addTransactionToList = (transaction) => {
    setTransactionList((prevList) => [...prevList, transaction]);
  };

	return (
		<div className={styles.container}>
			<header className={styles.header_container}>

			</header>

			<div className={styles.buttons_container}>
				<input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter an address"
        />
				<button onClick={handleFetchData}>Fetch data</button>
				<button onClick={handleStop}>Stop</button>
				<ul>
					{transactionList.map((transaction, index) => (
						<li key={index}>{transaction.from} - {transaction.hash}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
