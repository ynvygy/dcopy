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
			try {
				provider.on("pending", async (tx) => {
					const txnData = await provider.getTransaction(tx);
					if (txnData) {
						// Check if the transaction is sent to the router contract
						console.log(txnData)
						if (txnData.to == router) {
							
								//handleTokenSwap()
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
							
						}
					}
				});
			} catch {
				console.error('error')
			}
		
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
    const tokenOut = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'; 
    const tokenIn = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'; 
    const amountMin = '1000000000000000'; 
    const amountOutMin = '20000'; 
    const to = '0x3e702E39e0649bd8581D07a5bf1b9e5924d94Ce0'; 

    try {
			const approveTx = await wethContract.connect(signer).approve(tokenSwapAddress, amountMin);

			await approveTx.wait();

			const swapTx = await tokenSwapContract.connect(signer)
				.swap(tokenIn, tokenOut, amountMin, amountOutMin, to)
			
			await swapTx.wait();
    } catch (error) {
      // Handle error, display an error message, or perform other actions
      console.error('Error:', error);
    }
  };

	const handleEthValueChange = (event) => {
    setEthValue(event.target.value);
  };

	return (
		<div className={styles.container}>
			<div className={styles.buttons_container}>
				<List decode={decode}></List>
			</div>
			<div className={styles.buttons_container}>
				<h4>Transactions scanner</h4>
				<br/>
				<input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter an address"
        />
				<p>Demo address: 0xd3e62BD441d59e5ad9cCF797f53934062A22c8fb</p>
				<button onClick={handleFetchData}>Fetch data</button>
				<ul className={styles.txlist}>
					{decodedList.map((decoded, index) => (
						<li key={index}>
							<div>
								<strong>From:</strong> {transactionList[index].from}
								<br />
								<strong>Tx Hash:</strong> {transactionList[index].hash}
								<br />
								<strong>Tx Type:</strong> {decoded['name']}
							</div>
							<div>
								<strong>Selling:</strong> {decoded['params'][1]['value'][0]}
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
