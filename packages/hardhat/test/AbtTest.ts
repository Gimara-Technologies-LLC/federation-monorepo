import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ABT Token", function () {
    
    async function deployFixture() {
        const Abt = await ethers.getContractFactory("ABT")
        const abt = await Abt.deploy("The ABT", "eABT", "https://ipfs.io/ipfs/QmXeCAr2B4MER6iAb77B8BQGPy5QEWXcyjFcs5ZMD9g2zr?filename=bwm.json", ethers.parseEther('1'));
        const [owner, secondAddr, thirdAddr] = await ethers.getSigners();
        const minttx = await abt.mint(owner.address);
        await minttx.wait()
        await abt.waitForDeployment()
        return { abt, owner, secondAddr, thirdAddr }

    }    

    it("Should deploy with the correct values", async function () {
        const {abt} = await loadFixture(deployFixture)
        expect(await abt.name()).to.equal("The ABT")
        expect(await abt.symbol()).to.equal("eABT")
        expect(await abt.TOKEN_URI()).to.equal("https://ipfs.io/ipfs/QmXeCAr2B4MER6iAb77B8BQGPy5QEWXcyjFcs5ZMD9g2zr?filename=bwm.json")
        expect(await abt.abtPrice()).to.equal(ethers.parseEther('1000000000000000000'))

    })

    it("Should have the right owner i.e the deployer", async function () {
        const {owner, abt} = await loadFixture(deployFixture)
        expect(await abt.owner()).to.equal(owner.address)
        expect(await abt.ownerOf(0)).to.equal(owner.address)
    })

    it("Should check that an ABT was minted to the owner", async function () {
        const {owner, abt} = await loadFixture(deployFixture)
        expect(await abt.balanceOf(owner.address)).to.equal(1)

    }); 

    it("Should update the price of the ABT", async function () {
        const {owner, abt} = await loadFixture(deployFixture)
        await abt.connect(owner).updatePrice(ethers.parseEther("2"))
        expect(await abt.abtPrice()).to.equal(ethers.parseEther("2"))
    })

    it("Should not mint if only the non-owner calls the function", async function () {
        const {abt, secondAddr} = await loadFixture(deployFixture)
        await expect(abt.connect(secondAddr).mint(secondAddr.address)).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should not allow non-owners to update the price of the ABT", async function () {
        const {abt, secondAddr} = await loadFixture(deployFixture)
        await expect(abt.connect(secondAddr).updatePrice(ethers.parseEther('2'))).to.be.rejectedWith("Ownable: caller is not the owner")
    })
    
    it("Should be transferable to a new owner", async function () {
        const {abt, secondAddr, thirdAddr} = await loadFixture(deployFixture)
        
        await abt.transferOwnership(secondAddr.address);
        expect(await abt.owner()).to.equal(secondAddr.address)

        await abt.connect(secondAddr).transferOwnership(thirdAddr.address)
        expect(await abt.owner()).to.equal(thirdAddr.address)
    })


    deployFixture()
})