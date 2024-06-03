// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// Import CCIPReceiver contract that allows the contract to receive messages from other chains
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
// Import Client Library which provides structures to interact with the CCIP,
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { ABT } from "./ABT.sol";

/// @title Destination Minter
/// @author Da..
/// @notice This contract receives the message from the source minter and mints the nft.

contract DestinationMinter is CCIPReceiver {
	/// @notice Creating global an abt of type ABT
	ABT public abt;

	/// @notice Event emitted on successful mint
	event MintCallSuccessfull();

	// The constructor initializes the contract with the router's address and the ABT contract's address
	constructor(address router, address abtAddress) CCIPReceiver(router) {
		// Assign the ABT instance
		abt = ABT(abtAddress);
	}

	/// @notice This function is tasked with the responsibility of minting the ABT
	/// @dev The function receives the message from the source minter and handles the minting.
	/// @param message of type Client.Any2EVMMessage from Client.sol
	function _ccipReceive(
		Client.Any2EVMMessage memory message
	) internal override {
		(bool success, ) = address(abt).call(message.data);
		require(success);

		emit MintCallSuccessfull();
	}
}
