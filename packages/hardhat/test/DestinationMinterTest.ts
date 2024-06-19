import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Destination minter", async function () {
  async function deployFixture() {
    const [owner, secondAddr, thirdAddr] = await ethers.getSigners();

    // Deploy the ABT contract
    const Abt = await ethers.getContractFactory("ABT");
    const abt = await Abt.deploy(
      "The ABT",
      "eABT",
      "https://ipfs.io/ipfs/QmXeCAr2B4MER6iAb77B8BQGPy5QEWXcyjFcs5ZMD9g2zr?filename=bwm.json",
      ethers.parseEther("1"),
    );
    await abt.waitForDeployment();

    // Deploy the destination minter contract
    const DestinationMinter = await ethers.getContractFactory("DestinationMinter");
    const destinationMinter = await DestinationMinter.deploy("0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", abt.target);
    await destinationMinter.waitForDeployment();

    return { abt, owner, destinationMinter, secondAddr, thirdAddr };
  }

  it("Should mint an ABT on receiving a message", async function () {
    const { abt, destinationMinter, owner } = await loadFixture(deployFixture);
    //
    const mintData = abt.interface.encodeFunctionData("mint", [owner.address]);

    const message = {
      data: mintData,
      sender: owner.address,
      sourceChainSelector: 0,
      destChainSelector: 0,
      feeToken: "LINK",
      fee: 0,
      nonce: 0,
      messageId: ethers.encodeBytes32String("0"),
      destTokenAmounts: [],
    };

    // expect(mintData).to.not.be.empty;

    await expect(destinationMinter.ccipReceive(message)).to.emit(destinationMinter, "MintCallSuccessfull");

    expect(await abt.balanceOf(owner.address)).to.equal(1);
  });

  it("Should revert if mint call fails", async function () {
    const { abt, destinationMinter, owner } = await loadFixture(deployFixture);

    const messageData = abt.interface.encodeFunctionData("updatePrice", [2]);

    const message = {
      data: messageData,
      sender: owner.address,
      sourceChainSelector: 0,
      destChainSelector: 0,
      feeToken: "LINK",
      fee: 0,
      nonce: 0,
      messageId: ethers.encodeBytes32String("0"),
      destTokenAmounts: [],
    };

    expect(messageData).to.not.be.empty;

    await expect(destinationMinter.ccipReceive(message)).to.be.reverted;
  });

  deployFixture();
});
