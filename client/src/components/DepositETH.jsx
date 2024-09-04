import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { Button, Input, DepositContainer } from '../assets/deposit.style';
import { depositABI } from '../abi/withdrawAbi';

const depositAddressETH = '0xf0aF86FcE8111A551069f318D7882400B4cAF53D';

const DepositETH = () => {

    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [amount, setAmount] = useState('');
    const [userBalance, setUserBalance] = useState('0');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawalStatus, setWithdrawalStatus] = useState('');
    const [lastWithdrawalTime, setLastWithdrawalTime] = useState('0');

      useEffect(() => {
        const setupProvider = async () => {
            try {
                const provider = await detectProvider();
                if (provider) {
                    const web3Provider = new Web3Provider(provider);
                    const signer = web3Provider.getSigner();
                    setSigner(signer);
                    const contract = new ethers.Contract(depositAddressETH, depositABI, signer);
                    setContract(contract);
                    await updateUserBalance(contract, await signer.getAddress());
                } else {
                    console.log('Please install MetaMask!');
                }
            } catch (err) {
                console.error('Error setting up provider:', err.message);
            }
        };

        setupProvider();
    }, []);

    const updateUserBalance = async (contract, userAddress) => {
        if (contract) {
            try {
                const userBalance = await contract.getUserBalance(userAddress);
                setUserBalance(ethers.formatEther(userBalance));
    
                const lastTime = await contract.getLastWithdrawalTime(userAddress);
                setLastWithdrawalTime(lastTime.toString()); 
            } catch (err) {
                console.error('Failed to fetch user balance:', err.message);
            }
        }
    };

    const handleWithdraw = async () => {
        if (contract && signer) {
            try {
                const parsedAmount = ethers.parseUnits(withdrawAmount, 'ether');
                console.log(`Withdrawing ${withdrawAmount} ETH...`);
                const tx = await contract.withdraw(parsedAmount);
                console.log('Transaction hash:', tx.hash);
                await tx.wait();
                console.log('Withdrawal completed!');
                await updateUserBalance(contract, await signer.getAddress());
                setWithdrawalStatus('Withdrawal successful!');
            } catch (err) {
                console.error('Transaction failed:', err.message);
                setWithdrawalStatus('Withdrawal failed. Please check the console for errors.');
            }
        }
    };

    const handleDeposit = async () => {
        if (contract && signer) {
            try {
                const parsedAmount = ethers.parseUnits(amount, 'ether');

                console.log(`Depositing ${amount} ETH...`);
                const tx = await contract.deposit({
                    value: parsedAmount
                });

                console.log('Transaction hash:', tx.hash);

                // Ждем завершения транзакции
                await tx.wait();

                console.log('Deposit completed!');

                await updateUserBalance(contract, await signer.getAddress());
            } catch (err) {
                console.error('Transaction failed:', err.message);
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        // Преобразование UNIX-временной метки в объект Date
        const date = new Date(timestamp * 1000); // Умножаем на 1000, чтобы преобразовать секунды в миллисекунды
        // Форматирование даты в читаемый формат
        return date.toLocaleString(); // Используйте toLocaleString() для форматирования по локали
    };

    return (
        <DepositContainer>
            <h2>Deposit ETH</h2>
            <Input
                type="text"
                placeholder="Amount of ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={handleDeposit}>Deposit</Button>

            <div>Your Balance: {userBalance} ETH</div>

            <h2>Withdraw ETH</h2>
            <Input
                type="text"
                placeholder="Amount of ETH"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button onClick={handleWithdraw}>Withdraw</Button>
            {withdrawalStatus && <div>{withdrawalStatus}</div>}
            <div>Last Withdrawal Time: {formatTimestamp(lastWithdrawalTime)}</div>
        </DepositContainer>

    );
};

export default DepositETH;



// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import detectProvider from '@metamask/detect-provider';
// import { Web3Provider } from '@ethersproject/providers';
// import { Button, Input, DepositContainer } from '../assets/deposit.style';
// import { depositABI } from '../abi/withdrawAbi';

// const depositAddressETH = '0xF65C53d2a6755e75405504d5447A0fED4A12a5f7';

// const DepositETH = () => {
//     const [signer, setSigner] = useState(null);
//     const [contract, setContract] = useState(null);
//     const [amount, setAmount] = useState('');
//     const [userBalance, setUserBalance] = useState('0');
//     const [withdrawAmount, setWithdrawAmount] = useState('');
//     const [withdrawalStatus, setWithdrawalStatus] = useState('');
//     const [queueTxHash, setQueueTxHash] = useState('');
//     const [delay, setDelay] = useState(15); // default delay in seconds

//     useEffect(() => {
//         const setupProvider = async () => {
//             try {
//                 const provider = await detectProvider();
//                 if (provider) {
//                     const web3Provider = new Web3Provider(provider);
//                     const signer = web3Provider.getSigner();
//                     setSigner(signer);
//                     const contract = new ethers.Contract(depositAddressETH, depositABI, signer);
//                     setContract(contract);
//                     await updateUserBalance(contract, await signer.getAddress());
//                 } else {
//                     console.log('Please install MetaMask!');
//                 }
//             } catch (err) {
//                 console.error('Error setting up provider:', err.message);
//             }
//         };

//         setupProvider();
//     }, []);

//     const updateUserBalance = async (contract, userAddress) => {
//         if (contract) {
//             try {
//                 const userBalance = await contract.getUserBalance(userAddress);
//                 setUserBalance(ethers.formatEther(userBalance)); 
//             } catch (err) {
//                 console.error('Failed to fetch user balance:', err.message);
//             }
//         }
//     };

//     const handleQueueDeposit = async () => {
//         if (contract && signer) {
//             try {
//                 // Получаем значение из инпута
//                 const depositAmount = amount;
        
//                 if (!depositAmount || isNaN(depositAmount)) {
//                     console.error('Invalid amount value');
//                     return;
//                 }
        
//                 // Преобразуем значение эфиров в wei
//                 const parsedAmount = ethers.parseUnits(depositAmount, 'ether');
        
//                 // Текущая временная метка (в секундах)
//                 const currentTimestamp = Math.floor(Date.now() / 1000);
        
//                 // Расчёт временной метки с учетом задержки
//                 const scheduledTimestamp = currentTimestamp + delay; // delay в секундах
        
//                 console.log(`Queueing deposit of ${depositAmount} ETH (${parsedAmount.toString()} Wei) with a delay of ${delay} seconds...`);
//                 console.log(`Scheduled Timestamp: ${scheduledTimestamp}`);
        
//                 // Вызов метода контракта с двумя параметрами: сумма и временная метка
//                 const tx = await contract.queueDeposit(parsedAmount, scheduledTimestamp, { value: parsedAmount });
                
//                 console.log('Transaction queued with hash:', tx.hash);
//                 setQueueTxHash(tx.hash);
//             } catch (err) {
//                 console.error('Failed to queue deposit:', err.message);
//             }
//         }
//     };
    
    
    
//     const handleExecuteDeposit = async () => {
//     if (contract && signer && queueTxHash) {
//         try {
//             // Получаем сумму из инпута и преобразуем её в wei
//             const parsedAmount = ethers.parseUnits(amount, 'ether');
            
//             // Текущая временная метка (в секундах)
//             const currentTimestamp = Math.floor(Date.now() / 1000);
            
//             // Вызов функции executeDeposit с двумя параметрами
//             const tx = await contract.executeDeposit(
//                 parsedAmount, // Сумма в wei
//                 currentTimestamp // Текущая временная метка
//             );
            
//             console.log('Executing deposit transaction hash:', tx.hash);
//             await tx.wait();
//             console.log('Deposit executed successfully!');
//             await updateUserBalance(contract, await signer.getAddress());
//         } catch (err) {
//             console.error('Failed to execute deposit:', err.message);
//         }
//     }
// };

    

//     const handleQueueWithdraw = async () => {
//         if (contract && signer) {
//             try {
//                 const parsedAmount = ethers.parseUnits(withdrawAmount, 'ether');
//                 const currentTimestamp = Math.floor(Date.now() / 1000);
//                 const scheduledTimestamp = currentTimestamp + delay;
                
//                 console.log(`Queueing withdrawal of ${withdrawAmount} ETH with a delay of ${delay} seconds...`);
//                 const tx = await contract.queueWithdraw(await signer.getAddress(), parsedAmount, scheduledTimestamp);
                
//                 console.log('Transaction queued with hash:', tx.hash);
//                 setQueueTxHash(tx.hash);
//             } catch (err) {
//                 console.error('Failed to queue withdrawal:', err.message);
//             }
//         }
//     };

//     const handleExecuteWithdraw = async () => {
//         if (contract && signer && queueTxHash) {
//             try {
//                 const tx = await contract.executeWithdraw(await signer.getAddress(), ethers.parseUnits(withdrawAmount, 'ether'), Math.floor(Date.now() / 1000));
                
//                 console.log('Executing withdrawal transaction hash:', tx.hash);
//                 await tx.wait();
//                 console.log('Withdrawal executed successfully!');
//                 await updateUserBalance(contract, await signer.getAddress());
//             } catch (err) {
//                 console.error('Failed to execute withdrawal:', err.message);
//             }
//         }
//     };

//     return (
//         <DepositContainer>
//             <h2>Deposit ETH</h2>
//             <Input
//                 type="text"
//                 placeholder="Amount of ETH"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//             />
//             <Button onClick={handleQueueDeposit}>Queue Deposit</Button>
//             <Button onClick={handleExecuteDeposit}>Execute Deposit</Button>

//             <div>Your Balance: {userBalance} ETH</div>

//             <h2>Withdraw ETH</h2>
//             <Input
//                 type="text"
//                 placeholder="Amount of ETH"
//                 value={withdrawAmount}
//                 onChange={(e) => setWithdrawAmount(e.target.value)}
//             />
//             <Button onClick={handleQueueWithdraw}>Queue Withdraw</Button>
//             <Button onClick={handleExecuteWithdraw}>Execute Withdraw</Button>

//             {withdrawalStatus && <div>{withdrawalStatus}</div>}
//         </DepositContainer>
//     );
// };

// export default DepositETH;
