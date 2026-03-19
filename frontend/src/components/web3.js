import Web3 from "web3";
import PharmaChainABI from "./PharmaChain.json";

const MANUFACTURER_ROLE = Web3.utils.keccak256("MANUFACTURER_ROLE");
const ADMIN_ROLE = Web3.utils.keccak256("ADMIN_ROLE");
const RETAILER_ROLE = Web3.utils.keccak256("RETAILER_ROLE");

const getWeb3 = async () => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        // Check if the user is already connected
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            // Request accounts if not already connected
            await window.ethereum.request({ method: "eth_requestAccounts" });
        }

        return web3;
    } else {
        console.log("Please install MetaMask");
        return null;
    }
};

const getContract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = PharmaChainABI.networks[networkId];
    console.log(deployedNetwork.address);
    return new web3.eth.Contract(
        PharmaChainABI.abi,
        deployedNetwork && deployedNetwork.address
    );
};

export { 
    getWeb3, 
    getContract,
    MANUFACTURER_ROLE,
    ADMIN_ROLE,
    RETAILER_ROLE
};