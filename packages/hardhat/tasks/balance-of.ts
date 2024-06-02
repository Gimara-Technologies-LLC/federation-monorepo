import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { providers } from "ethers";
import { ABT, ABT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task('balance-of', 'Gets the balance of ABTs for provided address')
    .addParam(`myAbt`, `The address of the ABT smart contract`)
    .addParam(`blockchain`, `The blockchain where the ABT smart contract was deployed`)
    .addParam(`owner`, `The address to check the balance of ABTs`)
    .setAction(async (taskArguments: TaskArguments) => {
        const rpcProviderUrl = getProviderRpcUrl(taskArguments.blockchain);
        const provider = new providers.JsonRpcProvider(rpcProviderUrl);

        const spinner: Spinner = new Spinner();

        const myAbt: ABT = ABT__factory.connect(taskArguments.myNft, provider);

        console.log(`ℹ️  Attempting to check the balance of ABTs (${taskArguments.myNft}) for the ${taskArguments.owner} account`);
        spinner.start();

        const balanceOf = await myAbt.balanceOf(taskArguments.owner);

        spinner.stop();
        console.log(`ℹ️  The balance of ABTs of the ${taskArguments.owner} account is ${balanceOf.toNumber()}`);
    })
