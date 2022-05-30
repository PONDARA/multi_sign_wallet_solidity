// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

contract MultiSigWallet {
    // Struct
    // owner struct
    struct Owner {
        string name;
        address owner_address;
    }
    // transactions struct
    struct Transaction {
        address to;
        uint value;
        string desc;
        bool executed;
        uint numConfirmations;
        mapping(address=>bool) isConfirmed;

    }

    // Event
    event Deposit(address indexed sender,uint amount,uint contract_balance);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);

    // Variable
    address payable public wallet_address;
    Owner[] public owners;
    Transaction[] public transactions;
    mapping(address => bool) public isOwner;
    uint confirmationOfOwner;

    // Constructor
    constructor(string[] memory _name, address[] memory _owner_address,uint _confirmationOfOwner) {
        require(_owner_address.length > 0,"Owner is required");
        require(_name.length > 0,"Owner's name is required");
        require(_owner_address.length == _name.length,"Each owner mush have name");
        require(_confirmationOfOwner > 0 && _confirmationOfOwner <= _owner_address.length,"Confirmation of the owner is required");
        wallet_address = payable(address(this));
        for(uint i = 0; i <_owner_address.length; i++ ){
            
            require(_owner_address[i] != address(0), "invalid owner");
            require(!isOwner[_owner_address[i]], "owner not unique");

            isOwner[_owner_address[i]] = true;
            owners.push(Owner({name:_name[i],owner_address:_owner_address[i]}));
        }
        confirmationOfOwner = _confirmationOfOwner;
    }

    // Modifier
    // to verify the owner of this contract
    modifier onlyOwner(){
        require(isOwner[msg.sender], "not owner");
        _;
    }
    // to check the transaction is not yet confirmed by msg.sender
    modifier notConfirmed(uint _txIndex) {
        require(!transactions[_txIndex].isConfirmed[msg.sender], "tx already confirmed");
        _;
    }
    // to check the transaction is exist or not
    modifier txExists(uint _txIndex) {
        require(_txIndex >= 0 && _txIndex < transactions.length, "tx does not exist");
        _;
    }
    // to check is the transaction is not yet executed
    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }


    // Function
    fallback() payable external {
        emit Deposit(msg.sender, msg.value, wallet_address.balance);
    }

    receive() external payable {
       emit Deposit(msg.sender, msg.value, wallet_address.balance);
    }

    // deposit to this contract
    function deposit() payable external {
        // if(!wallet_address.send(msg.value)){
        //     revert("doposit fail");
        // }
    }

    // get the balances from this contract
    function getBalance() public view returns(uint){
        return wallet_address.balance;
    }

    // submit transaction from this contract
    function submitTransaction(address _to,uint _value,string memory _desc) public 
    onlyOwner 
    {
        require(_value <= wallet_address.balance,"This wallet does not have enough balace to send");
        // transactions.push(Transaction({
        //     to: _to,
        //     value: _value,
        //     desc: _desc,
        //     executed: false,
        //     numConfirmations: 0,
        //     isconfirmed: msg.sender
        // }));
        Transaction storage newTransaction = transactions.push();
        newTransaction.to = _to;
        newTransaction.value = _value;
        newTransaction.desc = _desc;
        newTransaction.executed = false;
        newTransaction.numConfirmations = 1;
        newTransaction.isConfirmed[msg.sender] = true;
    }

    // confirm transaction
    function confirmTransaction(uint _txIndex) public 
    onlyOwner
    txExists(_txIndex)
    notConfirmed(_txIndex)
    notExecuted(_txIndex)
    {
        // first step is to update the confirmation of the owner to the transaction
        Transaction storage transaction = transactions[_txIndex];
        transaction.isConfirmed[msg.sender] = true;
        transaction.numConfirmations += 1;

        // second step is to check the transaction's confirmation with the comfirmationOfowner is meet the requirement yet
        if(transaction.numConfirmations >= confirmationOfOwner){
            (bool success, ) = transaction.to.call{value:transaction.value}("");
            if(success){
                transaction.executed = true;
                emit ConfirmTransaction(msg.sender, _txIndex);
                emit ExecuteTransaction(msg.sender, _txIndex);
            }
            else{
                transaction.executed = false;
                transaction.isConfirmed[msg.sender] = false;
                transaction.numConfirmations -= 1;
                revert("Transfer is failed");
            }
        }

    }

    // revoke confirmation
    function revokeConfirmation(uint _txIndex)
    public
    onlyOwner
    txExists(_txIndex)
    notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.isConfirmed[msg.sender], "tx not confirmed");

        transaction.isConfirmed[msg.sender] = false;
        transaction.numConfirmations -= 1;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // to get the owner of this contract
    function getOwners() public view returns (Owner[] memory) {
        return owners;
    }

    // to get total count of the transaction of this contract
    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    // to get the transaction
    function getTransaction(uint _txIndex)
        public
        view
        returns (address to, uint value, string memory desc, bool executed, uint numConfirmations)
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.desc,
            transaction.executed,
            transaction.numConfirmations
        );
    }

    // to check the confirmation of the transaction
    function isConfirmed(uint _txIndex, address _owner)
        public
        view
        returns (bool)
    {
        Transaction storage transaction = transactions[_txIndex];

        return transaction.isConfirmed[_owner];
    }
}

// owner's name 
// ["owner01","owner02"]

// owner's address
// ["0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2","0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"]

// confirmation of the owner
// 2