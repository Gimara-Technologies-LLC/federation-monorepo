// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 < 0.9.0;

// Import CCIPReceiver contract that allows the contract to receive messages from other chains
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
// Import Client Library which provides structures to interact with the CCIP,
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
// Import the custom ABT contract
import {ABT} from "./ABT.sol";

contract DestinationMinter is CCIPReceiver {

    // Declaring an instance of the ABT contract
    ABT public abt;

    // Event emitted when the mint call is successful
    event MintCallSuccessfull();

    // The constructor initializes the contract with the router's address and the ABT contract's address
    constructor(address router, address abtAddress) CCIPReceiver(router) {
        // Assign the ABT instance
        abt = ABT(abtAddress);
    }

    // Overriding the _ccipReceive func from CCIPReceiver to specify what happens when a message is sent
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        // Attempting to call the method of on the abt contract using the data provided in the message
        (bool success,) = address(abt).call(message.data);
        require(success);

        emit MintCallSuccessfull();
    }

}
