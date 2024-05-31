// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 < 0.9.0;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";

contract SourceMinter is OwnerIsCreator {

    // Enum for fee payment
    enum PayFeesIn {
        Native,
        LINK
    }

    // Immutable addresses for router and LINK token
    address immutable i_router;
    address immutable i_link;

    // Event that notifies when a message is sent
    event MessageSent(bytes32 messageId);

    // Constructor to set initial values for the router and LINK token address
    constructor(address router, address link) {
        i_router = router;
        i_link = link;
        // Approving the router to spend the maximum possible amount of LINK on behalf of this contract
        LinkTokenInterface(i_link).approve(i_router, type(uint256).max);
    }

    // Fallback function to receive ether
    receive() external payable {}

    // Function to mint tokens on a different chain

    function mint(
        uint64 destinationChainSelector,  // Chain where tokens should be minted
        address receiver,  // Receiver address on the destination chain
        PayFeesIn payFeesIn // Specifies whether the fees are paid in native currency or LINK
    ) external {
        // Creating a message for the EVN to Any chain communication

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encodeWithSignature("mint(address", msg.sender),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 980_000})
            ),
            feeToken: payFeesIn == PayFeesIn.LINK ? i_link : address(0) // Setting the fee token
        });

        // Retrieving the fee required for the cross-chain communication.

        uint256 fee  = IRouterClient(i_router).getFee(
            destinationChainSelector,
            message
        );

        bytes32 messageId;

        // Based on the fee payment choice, sending the message across chains
        if(payFeesIn == PayFeesIn.LINK) {
            messageId = IRouterClient(i_router).ccipSend(
                destinationChainSelector,
                message
            );
        } else {
            // Paying in native currency
            messageId = IRouterClient(i_router).ccipSend{value: fee} (
                destinationChainSelector,
                message
            );
        }

        // Emitting the event to notofy that a message was sent
        emit MessageSent(messageId);

    }

}
