import {task} from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "./utils";
import { Wallet, providers } from "ethers";
import { IERC20, IERC20__factory } from "../typechain-types";
import { LINK_ADDRESSES } from "./constants";
import { Spinner } from "../utils/spinner";

task(`fill-sender`, `Transfers the provided amount of LINK token to the sender contract to serve for paying CCIP fees`)
    .addParam(`senderAddress`, `The address of a sender contract on the source blockchain`)
    .addParam(`blockchain`, `The name of the blockchain (for example ethereumSepolia)`)
    .addParam(`amount`, `Amount to send`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { senderAddress, blockchain, amount } = taskArguments;

        const privateKey = getPrivateKey();
        const rpcProviderUrl = getProviderRpcUrl(blockchain);

        const provider = new providers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const signer = wallet.connect(provider);


        const spinner: Spinner = new Spinner();


        const link: IERC20 = IERC20__factory.connect(LINK_ADDRESSES[blockchain], signer);

        console.log(`ℹ️  Attempting to send ${amount} of ${link.address} tokens from ${signer.address} to ${senderAddress}`);
        spinner.start();

        const tx = await link.transfer(senderAddress, amount);
        await tx.wait();

        spinner.stop();
        console.log(`✅ LINKs sent, transaction hash: ${tx.hash}`)

    })
