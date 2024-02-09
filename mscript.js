
    let web3;
    let accounts = [];
    let multiSendContract;
    const multiSendAbi = [
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "recipients",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			}
		],
		"name": "multiSendETH",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
];
    const multiSendAddress = '0x76f942e43850210479d3134747167a14F185e144';

    const connectWalletButton = document.getElementById('connect-wallet');
    const addForm = document.getElementById('add-form');
    const tableBody = document.getElementById('table-body');
    const sendButton = document.getElementById('sendButton');
    const counter = document.getElementById('counter');
    const linkCheckbox = document.getElementById("link-checkbox");

    linkCheckbox.addEventListener("change", () => {
        sendButton.disabled = !linkCheckbox.checked;
    });
    sendButton.disabled = true;

    const recipients = [];
    const amounts = [];

    connectWalletButton.addEventListener('click', connectWallet);
    addForm.addEventListener('submit', addRecipient);
    sendButton.addEventListener('click', sendMultiSendTransaction);

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
        // Update button text and user account with user address
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

    function addRecipient(event) {
    event.preventDefault();

    const addressInput = document.getElementById('address');
    const amountInput = document.getElementById('amount');

    const address = addressInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (address && !isNaN(amount)) {
        if (address.length !== 42) {
            showError_ad("*Invalid address");
        } else if (amount > 121000000) {
            showError_am("*Invalid amount");
        } else {
                // Rest of the code to add recipients and amounts
                // Add the recipient and amount to the arrays
        recipients.push(address);
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        amounts.push(amountWei);


        // Update the table with the new recipient and amount
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${address}</td>
            <td>${web3.utils.fromWei(amountWei, 'ether')}</td>
            <td><button class="btn btn-sm delete-btn delete-button remove-recipient"><img class="delete-button-icon" src="./cancel.svg"</button></td>`;

        newRow.querySelector('.remove-recipient').addEventListener('click', () => {
            // Remove the recipient and amount from the arrays
            const index = recipients.indexOf(address);
            recipients.splice(index, 1);
            amounts.splice(index, 1);

            // Remove the row from the table
            newRow.remove();

            // Update the total amount and counter
            updateTotalAmountAndCounter();
        });

        // Update the total amount and counter
        updateTotalAmountAndCounter();

        // Clear the input fields
        addressInput.value = '';
        amountInput.value = '';

                hideError_ad();
                hideError_am();
            }
        } else {
            if (!address || address.length !== 42) {
                showError_ad("*Invalid address");
            } else {
                hideError_ad();
            }

            if (isNaN(amount) || amount > 121000000) {
                showError_am("*Invalid amount");
            } else {
                hideError_am();
            }
        }

    
    }

        function removeRecipient(e) {
            const index = Array.from(tableBody.children).indexOf(e.target.closest('tr'));
            recipients.splice(index, 1);
            amounts.splice(index, 1);

            e.target.closest('tr').remove();
            updateCounter();
        }

        function updateTotalAmountAndCounter() {
        let totalAmountWei = web3.utils.toBN('0');
        for (let i = 0; i < amounts.length; i++) {
            totalAmountWei = totalAmountWei.add(web3.utils.toBN(amounts[i]));
        }
        const totalAmountEther = web3.utils.fromWei(totalAmountWei, 'ether');
        counter.textContent = `${totalAmountEther} ETH to ${recipients.length} Addresses`;

    }

    async function sendMultiSendTransaction() {
        if (recipients.length === 0 || amounts.length === 0) {
        console.error('No recipients or amounts to send');
        return;
        }

        const totalAmountWei = amounts.reduce((a, b) => web3.utils.toBN(a).add(web3.utils.toBN(b)), web3.utils.toBN('0'));
        const nonce = await web3.eth.getTransactionCount(accounts[0]);

        const txData = {
            from: accounts[0],
            to: multiSendAddress,
            value: totalAmountWei,
            gas: 3000000,
            nonce: nonce,
            data: multiSendContract.methods.multiSendETH(recipients, amounts).encodeABI()
        };

        try {
            const transactionReceipt = await web3.eth.sendTransaction(txData);
            console.log('Transaction receipt:', transactionReceipt);

            const confirmation = await checkTransactionconfirmation(transactionReceipt.transactionHash);
           alert('Transaction submitted and ' + confirmation.status + '. Transaction Hash: ' + confirmation.txHash);

        } catch (error) {
            console.error('Transaction failed:', error);
        }
    }

    function checkTransactionconfirmation(txhash) {
        let checkTransactionLoop = () => {
            return ethereum.request({method:'eth_getTransactionReceipt',params:[txhash]}).then(r => {
                if(r != null) return {status: 'confirmed', txHash: txhash};
                else return checkTransactionLoop();
            });
        };

        return checkTransactionLoop();
    }


    function showError_ad(message) {
        const errorMessage = document.querySelector(".error-message-ad");
        errorMessage.textContent = message;
    }

    function showError_am(message) {
        const errorMessage = document.querySelector(".error-message-am");
        errorMessage.textContent = message;
    }

    function hideError_ad() {
        const errorMessage = document.querySelector(".error-message-ad");
        errorMessage.textContent = "";
    }

    function hideError_am() {
        const errorMessage = document.querySelector(".error-message-am");
        errorMessage.textContent = "";
    }