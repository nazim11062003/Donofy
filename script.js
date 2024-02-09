let web3;
const connectWalletButton = document.getElementById("connect-wallet");
const donationContractAddress = "0x813c476086887001cc4d0afF2332e199A2146380";
const donationContractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "domain",
				"type": "string"
			}
		],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "domain",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "donor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "DonationReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "domain",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "ngoAddress",
				"type": "address"
			}
		],
		"name": "NGORegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "domain",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "ngoAddress",
				"type": "address"
			}
		],
		"name": "registerNGO",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "domainBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "domainDonationThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "registeredNGOAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "registeredNGOs",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("sector");
const sendButton = document.getElementById("sendButton");

connectWalletButton.addEventListener('click', connectWallet);

async function connectWallet() {
    const provider = await detectEthereumProvider();

    if (provider) {
    web3 = new Web3(provider);
    try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        multiSendContract = new web3.eth.Contract(multiSendAbi, multiSendAddress);
    } catch (error) {
        console.error('User rejected wallet connection:', error);
    }

    if (accounts && accounts.length > 0) {
        const userAddress = accounts[0].slice(0, 5) + '...' + accounts[0].slice(-5);
        const userAccount = accounts[0];
        // connectWalletButton.innerText = `Connected: ${userAddress.toUpperCase()}`;
		connectWalletButton.innerText = `Connected`;

        const userAcc = document.getElementById('userAcc');
        userAcc.innerText = `Account: ${userAccount}`;
    }

    } else {
    console.error('No Ethereum provider detected');
    }

}

// sendButton.addEventListener("click", interactContract);

async function interactContract() {
    const provider = await detectEthereumProvider();
    web3 = new Web3(provider);

    const amount = amountInput.value;
    const category = categorySelect.value;

    if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
    }

    const accounts = await web3.eth.getAccounts();
    const userAccount = accounts[0];

    const DonationContract = new web3.eth.Contract(
        donationContractABI,
        donationContractAddress
    );

    await DonationContract.methods.donate(category).send({
    from: userAccount,
        value: web3.utils.toWei(amount, "ether"),
        gas: 300000,
    })
    .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1){
            alert('Donation Successful! Here\'s the tx hash: ' + receipt.transactionHash);
        }
    });

    console.log(userAccount);

    
}
