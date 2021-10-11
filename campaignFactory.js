import web3 from "./web3";
import CampaignFactory from "./artifacts/contracts/Campaign.sol/CampaignFactory.json";

const abi = CampaignFactory.abi;

const address = "0x32f09e860AEf42985a33ee1396B2112dA22F9920";

export default new web3.eth.Contract(abi, address);
