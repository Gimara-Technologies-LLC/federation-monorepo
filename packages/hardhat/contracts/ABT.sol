// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract ABT is ERC721URIStorage, Ownable {

    uint256 public abtPrice;

    // A constant URL pointing to the metadata for the token on IPFS
    string public TOKEN_URI;
    // "https://ipfs.io/ipfs/QmYuKY45Aq87LeL1R5dhb1hqHLp6ZFbJaCP8jxqKM1MX6y/babe_ruth_1.json";

    // Internal variable to keep track of the latest token ID issued
    uint256 internal tokenId;

    // Constructor for the contract, initializing it with a name and symbol.
    constructor(
        string memory name,
        string memory symbol,
        string memory tokenURi,
        uint256 initialPrice
        ) ERC721(name, symbol) Ownable() {
            abtPrice = initialPrice * 1e18;
            TOKEN_URI = tokenURi;
        }

    // A function to mint a new abt, Can only be called by the owner of the contract
    function mint(address to) public {
        uint256 token_ID = tokenId++;
        // Minting a new ABT to the specified address with the current token_ID
        _safeMint(to, token_ID);
        // Setting the URI for the newly minted token to point to the IPFS metadata
        _setTokenURI(token_ID, TOKEN_URI);

    }

    function updatePrice(uint256 _price) public onlyOwner returns (uint256) {
        abtPrice = _price;
        return abtPrice;
    }

}
