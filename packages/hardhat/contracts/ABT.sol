// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ABT Token Contract.
/// @author Da..
/// @notice This is a token extending functionality from ERC721URIStorage and Ownable
/// @dev ERC721URIStorage which ABT inherits from is also inheriting from ERC721

contract ABT is ERC721URIStorage, Ownable {
	/// @notice Global variable representing the price of the token
	uint256 public abtPrice;

	/// @notice Global variable to hold the token metadata
	string public TOKEN_URI;

	/// @notice Internal variable to keep track of the latest token ID issued
	uint256 internal tokenId;

	/// @notice Instanciate the varibles on contract deployment
	constructor(
		string memory name,
		string memory symbol,
		string memory tokenURi,
		uint256 initialPrice
	) ERC721(name, symbol) Ownable() {
		abtPrice = initialPrice * 1e18;
		TOKEN_URI = tokenURi;
	}

	/// @notice This fuction is used to mint ABTs
	/// @dev This function can only transact if called by the owner
	/// @param to Address to whom the minted item is going to begin
	function mint(address to) public onlyOwner {
		uint256 token_ID = tokenId++;
		// Minting a new ABT to the specified address with the current token_ID
		_safeMint(to, token_ID);
		// Setting the URI for the newly minted token to point to the IPFS metadata
		_setTokenURI(token_ID, TOKEN_URI);
	}

	/// @notice This function is for updating the price of the ABT
	/// @param _price the new price to update
	/// @return abtPrice
	function updatePrice(uint256 _price) public onlyOwner returns (uint256) {
		abtPrice = _price;
		return abtPrice;
	}
}
