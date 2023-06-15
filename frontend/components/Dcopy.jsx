import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
const ethers = require("ethers"); // Ethereum library for interacting with the blockchain
const abi = require("./uniswap-abi.json"); // ABI (Application Binary Interface) for the smart contract
const tokenSwapContractABI = require("./tokenSwapAbi.json");
const ierc20ABI = require("./ierc20-abi.json")
const axios = require("axios"); // HTTP client library for making API requests
const abiDecoder = require("abi-decoder"); // Library for decoding transaction data
import { useEffect, useState } from "react";
import { useSigner, useNetwork, useBalance } from "wagmi";
import List from "./List"

const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

//const wssUrl = 'wssurl'


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

export default function Dcopy() {
	const { data: signer } = useSigner();
	const [address, setAddress] = useState("");
	const [fetchData, setFetchData] = useState(false);
	const [stop, setStop] = useState(false);
	const [transactionList, setTransactionList] = useState([]);
	const [decodedList, setDecodedList] = useState([]);

	//const goerli_provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/ALCHEMY_KEY');
	const tokenSwapAddress = '0x6073e41DF217B86bfDD5C910A7AFfc1c68D4BeDB'
	const wethAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

	const tokenSwapContract = new ethers.Contract(tokenSwapAddress, tokenSwapContractABI, signer);
	const wethContract = new ethers.Contract(wethAddress, ierc20ABI, signer);

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
						const parsedData = JSON.parse(decodedData)
						console.log(parsedData['name']); // Print the decoded data
						if (parsedData && (parsedData['name'] == 'swapTokensForExactETH' || parsedData['name'] == 'swapExactETHForTokens' || parsedData['name'] == 'swapETHForExactTokens' || parseData['name'] == 'swapTokensForTokens')) {
							addTransactionToList(txnData)
							addDecodedToList(parsedData)
						}
						//addDecodedToList(decodedData)
						// Perform further processing or store the data in a database
						console.log('da', decodedList.length)
						console.log('nu', transactionList.length)
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

	const addDecodedToList = (decoded) => {
		setDecodedList((prevDecoded) => [...prevDecoded, decoded]);
	}

  const handleTokenSwap = async () => {
    const tokenIn = '0xa2bd28f23A78Db41E49db7d7B64b6411123a8B85'; 
    const tokenOut = '0x509Ee0d083DdF8AC028f2a56731412edD63223B9'; 
    const amountMin = '10000'; 
    const amountOutMin = '1'; 
    const to = '0x965b1a0b5b56b113253678b4b04da469d1316ce4'; 

    try {
			const approveTx = await wethContract.connect(signer).approve(tokenSwapAddress, '1');

			await approveTx.wait();

			const swapTx = await tokenSwapContract.connect(signer)
				.swap(tokenIn, tokenOut, amountMin, amountOutMin, to)
			
			await swapTx.wait();
    } catch (error) {
      // Handle error, display an error message, or perform other actions
      console.error('Error:', error);
    }
  };

	return (
		<div className={styles.container}>
			<List decode={decode}></List>
			<div className={styles.buttons_container}>
				<input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter an address"
        />
				<button onClick={handleFetchData}>Fetch data</button>
				<button onClick={handleStop}>Stop</button>
				<button onClick={handleTokenSwap}>Swap Tokens</button>
				<ul>
					{decodedList.map((decoded, index) => (
						<li key={index}>
							<div>
								<strong>From:</strong> {transactionList[index].from}
								<br />
								<strong>Tx Hash:</strong> {transactionList[index].hash}
								<br />
								<strong>Tx Type:</strong> {transactionList[index].name}
							</div>
							<div>
								<strong>Selling:</strong> {decoded['params'][1]['value'][0]} - {decoded['params'][0]['value']} 
							</div>
							<div>
								<strong>Buying:</strong> {decoded['params'][1]['value'][1]} 
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
