// call smart contract
const Web3 = require('web3')
const contractArtifact = require('../../build/contracts/MultiSignWallet.json'); //produced by Truffle compile
const Contract = require('@truffle/contract');
const fs = require('fs');
const solc = require('solc');

// funtion to build and deploy the contract
const build_contrat = async (req,res,next) =>{
    try{
        // // infura url
        // const url = 'https://rinkeby.infura.io/v3/34e4897b55e344b79a408be52ff87712'

        // // local url
        const url = 'http://127.0.0.1:9545/'
        const web3 = new Web3(url)

        // source to load the contract
        const source = fs.readFileSync('./contracts/MultiSignWallet.sol', "utf8");

        // input config fro solc to build the contract
        const input = {
        language: "Solidity",
        sources: {
            'MultiSignWallet.sol': {
            content: source,
            },
        },
        settings: {
            outputSelection: {
            "*": {
                "*": ["*"],
            },
            },
        },
        };

        // etract the abi and evm form builded contract
        const {abi,evm} = JSON.parse(solc.compile(JSON.stringify(input))).contracts['MultiSignWallet.sol'].MultiSignWallet

        // // import account by sececret key
        // const signer = web3.eth.accounts.privateKeyToAccount(
        //     "62d1ee90b52bfbc5f8051153d7273c78d5a19a9e7ff5b98449f4146a426564b1"
        //   );
        // web3.eth.accounts.wallet.add(signer);

        // local account
        const accounts = await web3.eth.getAccounts();
        
        // conctract
        const contract = new web3.eth.Contract(abi);
        // set evm data to the contract
        contract.options.data = evm.bytecode.object;
        // to deploy the contract to the block network
        const deployTx = contract.deploy();
        const deployedContract = await deployTx.send({
            from: accounts[0],
            gas: await deployTx.estimateGas() + 100000,
        }).once("transactionHash", (txhash) => {
            console.log(`Mining deployment transaction ...`);
            console.log(txhash);
        });
        // console.log(`Contract deployed at ${deployedContract.options.address}`);
        // const balance = await deployedContract.methods.getBalance().call()
        // console.log(balance)
        // const address = await deployedContract.methods.wallet_address().call();
        // console.log(address)
        // const owners = await deployedContract.methods.getOwners().call();
        // console.log(owners)

        return res.send(`Contract deployed at ${deployedContract.options.address}`)
    }
    catch(err){
        console.log(err)
        return res.send(err)
    }
}

// funtion to get the ownwer of the contract
const getOwners = async (req,res) => {
    try{
        // // infura url
        // const url = 'https://rinkeby.infura.io/v3/34e4897b55e344b79a408be52ff87712'

        //local node url
        const url = 'http://127.0.0.1:9545/'

        const web3 = new Web3(url)

        // source to load the contract
        const source = fs.readFileSync('./contracts/MultiSignWallet.sol', "utf8");

        // input config fro solc to build the contract
        const input = {
        language: "Solidity",
        sources: {
            'MultiSignWallet.sol': {
            content: source,
            },
        },
        settings: {
            outputSelection: {
            "*": {
                "*": ["*"],
            },
            },
        },
        };

        // etract the abi and evm form builded contract
        const {abi,evm} = JSON.parse(solc.compile(JSON.stringify(input))).contracts['MultiSignWallet.sol'].MultiSignWallet

        //conctract
        const contract = new web3.eth.Contract(abi,'0x1d1ddAA523196D8a2B4690449626FBA81e2Bbcd3');

        // call to get the owners from deployed contranct's getOners() function 
        const owners = await contract.methods.getOwners().call();
        
        // return the owners
        res.send(owners)

    }
    catch(err){
        res.error(ere)
    }
}

// function for testing and playgroud
const solidity_test = async (req,res) => {
    try{
        //// infura url
        // const url = 'https://rinkeby.infura.io/v3/34e4897b55e344b79a408be52ff87712'
        //// local node url
        const url = 'http://127.0.0.1:9545/'
        const web3 = new Web3(url)
        eth = await web3.eth.getBalance("0xd520cc14ef05eadc4eebe1312cdb22e2cdd03018")
        // console.log(eth)
        // console.log(web3.currentProvider)

        const source = fs.readFileSync('./contracts/MultiSignWallet.sol', "utf8");

        const input = {
        language: "Solidity",
        sources: {
            'MultiSignWallet.sol': {
            content: source,
            },
        },
        settings: {
            outputSelection: {
            "*": {
                "*": ["*"],
            },
            },
        },
        };

        // abi and evm
        const {abi,evm} = JSON.parse(solc.compile(JSON.stringify(input))).contracts['MultiSignWallet.sol'].MultiSignWallet

        const accounts = await web3.eth.getAccounts();

        const contract = new web3.eth.Contract(abi,'0x1d1ddAA523196D8a2B4690449626FBA81e2Bbcd3');
        // const balance = await contract.methods.getBalance().call()
        // console.log(balance)
        // const address = await contract.methods.wallet_address().call();
        // console.log(address)
        // const addOwners = await contract.methods.addOwner(["owner_02"],["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"],2).send({from:accounts[0]}).then(console.log());
        // console.log(addOwners)
        const fee = await contract.methods.addOwner(['owner_04'],[accounts[3]],3).estimateGas({from: accounts[0],to: 0x1d1ddAA523196D8a2B4690449626FBA81e2Bbcd3});
        console.log(fee)
        // await contract.methods.addOwner(['owner_03'],[accounts[2]],2).send({from:accounts[0],gas:700000});
        const owners = await contract.methods.getOwners().call();
        console.log(owners)
        // console.log(addOwners)

        // const MyContract = Contract(contractArtifact);
        // MyContract.setProvider(web3.currentProvider);
        // const multiSig = await MyContract.deployed();
        // let balance = await multiSig.getBalance();
        // const address = await multiSig.wallet_address();
        // const owners = await multiSig.getOwners();
        // console.log(balance);
        // console.log(address);
        // console.log(owners);
        // console.log(contractArtifact.networks['5777'].address);

        return res.send("success")
    }
    catch(err){
        console.log(err)
        return res.send(err)
    }
}

module.exports = {
    getOwners,
    solidity_test,
    build_contrat
}