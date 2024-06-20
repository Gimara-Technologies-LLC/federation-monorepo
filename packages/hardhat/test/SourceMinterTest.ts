import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Source Minter Contract", async function () {
    async function deployFixture() {
        const [owner, secondAddr] = await ethers.getSigners();

        // Deploy Router
        const MockRouter = await ethers.getContractFactory("MockRouterClient")
        const mockRouter = await MockRouter.deploy();
        await mockRouter.waitForDeployment()

        // Deploy ERC20
        const MockLinkToken = await ethers.getContractFactory("MockERC20")
        const mockLinkToken = await MockLinkToken.deploy("MockToken", "LINK")
        await mockLinkToken.waitForDeployment()

        // Deploy source minter
        const SourceMinter = await ethers.getContractFactory("SourceMinter")
        const sourceMinter = await SourceMinter.deploy(mockRouter.target, mockLinkToken.target)
        await sourceMinter.waitForDeployment()
        
        await mockLinkToken.mint(sourceMinter.target, ethers.parseEther("1000"))
        return {owner, mockLinkToken, mockRouter, sourceMinter, secondAddr}
    }

    it("Should return the correct mock link balance", async function () {
        const {sourceMinter} = await loadFixture(deployFixture)
        const balance = await sourceMinter.linkBalance()
        await expect(balance).to.be.equal(ethers.parseEther("1000"))
    })

    it("Should initiallize the contract with router and link addresses", async function () {
        const {sourceMinter, mockLinkToken, mockRouter} = await loadFixture(deployFixture)
        expect(await sourceMinter.s_chain_router()).to.equal(mockRouter.target)
        expect(await sourceMinter.s_chain_link_address()).to.equal(mockLinkToken.target)
    })

    it("Should revert if there is not enough mock link to pay fees", async function () {
        const {sourceMinter, mockLinkToken, owner, secondAddr} = await loadFixture(deployFixture)
        await sourceMinter.withdrawToken(owner.address, mockLinkToken.target)

        await expect(sourceMinter.mint(1, secondAddr.address)).to.be.reverted
    })

    // it("Should send the message to mint and emit the correct event", async function () {
    //     const {sourceMinter, mockLinkToken, owner, secondAddr} = await loadFixture(deployFixture)

    //     await expect(sourceMinter.mint(1878768, secondAddr.address)).to.emit(sourceMinter, "MessageSent")
    // })

    it("Should allow the owner to withdraw tokens", async function () {
        const {sourceMinter, mockLinkToken, owner} = await loadFixture(deployFixture)
        await sourceMinter.withdrawToken(owner.address, mockLinkToken.target)
        const balance = await mockLinkToken.balanceOf(owner.address)
        expect(balance).to.equal(ethers.parseEther("1000"))
    })


    it("Should revert when trying to withdraw tokens when the token balance is zero", async function () {
        const {sourceMinter, mockLinkToken, owner} = await loadFixture(deployFixture)
        await sourceMinter.withdrawToken(owner.address, mockLinkToken.target)
        
        await expect(sourceMinter.withdrawToken(owner.address, mockLinkToken.target)).to.be.revertedWithCustomError(sourceMinter,"NothingToWithdraw")
    })

    deployFixture()
})