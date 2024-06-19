import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("E2E test for abts, destination minter and the source minter", async function () {
    async function deployFixture() {
        const [owner, secondAddr, thirdAddr] = await ethers.getSigners();

        // Deploy Router
        const MockRouter = await ethers.getContractFactory("MockRouterClient");
        const mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment();

        // Deploy ERC20
        const MockLinkToken = await ethers.getContractFactory("MockERC20");
        const mockLinkToken = await MockLinkToken.deploy("MockToken", "LINK");
        await mockLinkToken.waitForDeployment();

        // Deploy the ABT contract
        const Abt = await ethers.getContractFactory("ABT");
        const abt = await Abt.deploy(
          "The ABT",
          "eABT",
          "https://ipfs.io/ipfs/QmXeCAr2B4MER6iAb77B8BQGPy5QEWXcyjFcs5ZMD9g2zr?filename=bwm.json",
          ethers.parseEther("1"),
        );
        await abt.waitForDeployment();

        // Deploy source minter
        const SourceMinter = await ethers.getContractFactory("SourceMinter");
        const sourceMinter = await SourceMinter.deploy(mockRouter.target, mockLinkToken.target);
        await sourceMinter.waitForDeployment();


        // Deploy the destination minter contract
        const DestinationMinter = await ethers.getContractFactory("DestinationMinter");
        const destinationMinter = await DestinationMinter.deploy("0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", abt.target);
        await destinationMinter.waitForDeployment();

        await mockLinkToken.mint(sourceMinter.target, ethers.parseEther("1000"));

        return { owner, mockLinkToken, mockRouter, sourceMinter, secondAddr, destinationMinter, thirdAddr, abt };
    }

    it("Should deploy with the correct values", async function () {
        const { abt } = await loadFixture(deployFixture);
        expect(await abt.name()).to.equal("The ABT");
        expect(await abt.symbol()).to.equal("eABT");
        expect(await abt.TOKEN_URI()).to.equal(
          "https://ipfs.io/ipfs/QmXeCAr2B4MER6iAb77B8BQGPy5QEWXcyjFcs5ZMD9g2zr?filename=bwm.json",
        );
        expect(await abt.abtPrice()).to.equal(ethers.parseEther("1000000000000000000"));
      });

    it("Should check that an ABT was minted to the owner", async function () {
        const { owner, abt } = await loadFixture(deployFixture);
        const minttx = await abt.mint(owner.address);
        await minttx.wait();
        expect(await abt.balanceOf(owner.address)).to.equal(1);
    });

    it("Should transfer the destination minter contract", async function () {
        const {destinationMinter, abt} = await loadFixture(deployFixture)
        await abt.transferOwnership(destinationMinter.target);
        expect(await abt.owner()).to.equal(destinationMinter.target);


    })

    it("Should receive message and mint ABT in DestinationMinter", async function () {
      const { owner, abt, destinationMinter, secondAddr, mockLinkToken, sourceMinter } = await loadFixture(deployFixture);
      // Mock message data
      const mintFunction = abt.interface.encodeFunctionData("mint", [secondAddr.address]);
      const message = {
            receiver: ethers.AbiCoder.encode(["address"], [destinationMinter.target]),
            data: mintFunction,
            tokenAmounts: [],
            sourceChainSelector: 0,
            extraArgs: "0x",
            feeToken: mockLinkToken.target,
            messageId: ethers.encodeBytes32String("0"),
            destTokenAmounts: [],
            fee: 0,
            nonce: 0,
            sender: owner.address,
        };

      await destinationMinter.ccipReceive(message);

      expect(await abt.ownerOf(0)).to.equal(secondAddr.address);
      expect(await abt.tokenURI(0)).to.equal("https://ipfs.io/ipfs/QmXeCAr2B4MER6iAb77B8BQGPy5QEWXcyjFcs5ZMD9g2zr?filename=bwm.json");
    });

    deployFixture()
})