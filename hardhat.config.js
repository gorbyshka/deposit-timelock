require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ignition');

module.exports = {
    solidity: "0.8.24",
    networks: {
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: [
                "0xcf4a6699e5dfdd0a903186579b573cff3ba84412d1eedf04918d794b22c349b8",
        
            ],
            chainId: 97,
            gasPrice: 20000000000,
        },
        ganache: {
            url: "http://localhost:8545",
            accounts: [
                "0x23be0de40518128df2f1f723e172839a53da60abb3f19bb4db6b9d426cf19f46",
                "0xaa2419495055d427990cada073271c09a4e631c361f1c02f2d0adc2c15663c9e"
            ],
            chainId: 1337,
        }
    }
};
