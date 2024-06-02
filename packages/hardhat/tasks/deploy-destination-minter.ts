import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl, getRouterConfig } from "./utils";
import { Wallet, providers } from "ethers";
import { DestinationMinter, DestinationMinter__factory, ABT, ABT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";
const {ethers} = require('ethers');

task(`deploy-destination-minter`, `Deploys ABT.sol and DestinationMinter.sol smart contracts`)
    .addOptionalParam(`router`, `The address of the Router contract on the destination blockchain`)
    .addParam(`name`, `The name of the ABT to deploy`)
    .addParam(`symbol`, `The symbol of the ABT to deploy`)
    .addParam(`tokenuri`, `The token uri for the ABT on ipfs`)
    .addParam(`initialprice`, `The initial price for the ABT`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const routerAddress = taskArguments.router ? taskArguments.router : getRouterConfig(hre.network.name).address;
        const { name, symbol, tokenuri, initialprice } = taskArguments;

        const privateKey = getPrivateKey();
        const rpcProviderUrl = getProviderRpcUrl(hre.network.name);

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const deployer = wallet.connect(provider);

        const spinner: Spinner = new Spinner();

        console.log(`ℹ️  Attempting to deploy ABT smart contract on the ${hre.network.name} blockchain using ${deployer.address} address`);
        spinner.start();

        const myAbtFactory: ABT__factory = await hre.ethers.getContractFactory('ABT') as ABT__factory;
        const myAbt: ABT = await myAbtFactory.deploy(name, symbol, tokenuri, initialprice);
        await myAbt.waitForDeployment();

        spinner.stop();
        console.log(myAbt);

        console.log(`✅ ABT contract deployed at address ${myAbt.target} on the ${hre.network.name} blockchain`)

        console.log(`ℹ️  Attempting to deploy DestinationMinter smart contract on the ${hre.network.name} blockchain using ${deployer.address} address, with the Router address ${routerAddress} provided as constructor argument`);
        spinner.start();

        const destinationMinterFactory: DestinationMinter__factory = await hre.ethers.getContractFactory('DestinationMinter') as DestinationMinter__factory;
        const destinationMinter: DestinationMinter = await destinationMinterFactory.deploy(routerAddress, myAbt.target);
        await destinationMinter.waitForDeployment();

        spinner.stop();
        console.log(`✅ DestinationMinter contract deployed at address ${destinationMinter.target} on the ${hre.network.name} blockchain`);

        console.log(`ℹ️  Attempting to grant the minter role to the DestinationMinter smart contract`);
        spinner.start();

        const tx = await myAbt.transferOwnership(destinationMinter.target);
        await tx.wait();

        spinner.stop();
        console.log(`✅ DestinationMinter can now mint ABTs. Transaction hash: ${tx.hash}`);
    })
