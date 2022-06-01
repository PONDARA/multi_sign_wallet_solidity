// call smart contract
const Web3 = require('web3')
const Web3EthContract = require('web3-eth-contract')
const contractArtifact = require('../../build/contracts/MultiSignWallet.json'); //produced by Truffle compile
const contract = require('@truffle/contract');

// build contract
const fs = require('fs');
const solc = require('solc');

const solidity_test = async (req,res,next) => {
    try{
        //// infura url
        // const url = 'https://rinkeby.infura.io/v3/34e4897b55e344b79a408be52ff87712'
        //// local node url
        const url = 'http://127.0.0.1:9545/'
        const web3 = new Web3(url)
        eth = await web3.eth.getBalance("0xd520cc14ef05eadc4eebe1312cdb22e2cdd03018")
        // console.log(eth)
        // console.log(web3.currentProvider)

        const MyContract = contract(contractArtifact);
        MyContract.setProvider(web3.currentProvider);
        const multiSig = await MyContract.deployed();
        let balance = await multiSig.getBalance();
        const address = await multiSig.wallet_address();
        const owners = await multiSig.getOwners();
        console.log(balance.toNumber());
        console.log(address);
        console.log(owners);
        console.log(contractArtifact.networks['5777'].address);

        return res.send("success")
    }
    catch(err){
        console.log(err)
        return res.send(err)
    }
}

const build_contrat = async (req,res,next) =>{
    try{
        const url = 'http://127.0.0.1:9545/'
        const web3 = new Web3(url)

        /*
        * Compile Contract and Fetch ABI
        */ 

        var input = {
            language: 'Solidity',
            sources: {
              './contracts/MultiSignWallet.sol': {
                content: 'contract C { function f() public { } }'
              }
            },
            settings: {
              outputSelection: {
                '*': {
                  '*': ['*']
                }
              }
            }
          };
        
        var output = JSON.parse(solc.compile(JSON.stringify(input)));

        // `output` here contains the JSON output as specified in the documentation
        for (var contractName in output.contracts['./contracts/MultiSignWallet.sol']) {
            console.log(
            contractName +
                ': ' +
                output.contracts['./contracts/MultiSignWallet.sol'][contractName].evm.bytecode.object
            );
        }
        // console.log(output)

        // let source = fs.readFileSync("./contracts/MultiSignWallet.sol", 'utf8');

        // console.log('compiling contract...');
        // let compiledContract = await solc.compile(source);
        // console.log('done');

        // for (let contractName in compiledContract.contracts) {
        //     // code and ABI that are needed by web3 
        //     // console.log(contractName + ': ' + compiledContract.contracts[contractName].bytecode);
        //     // console.log(contractName + '; ' + JSON.parse(compiledContract.contracts[contractName].interface));
        //     var bytecode = compiledContract.contracts[contractName].bytecode;
        //     var abi = JSON.parse(compiledContract.contracts[contractName].interface);
        // }

        // console.log(JSON.stringify(abi, undefined, 2));

        return res.send("build smart contract function")
    }
    catch(err){
        console.log(err)
        return res.send(err)
    }
}

module.exports = {
    solidity_test,
    build_contrat
}