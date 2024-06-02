// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 < 0.9.0;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";


contract SourceMinter is OwnerIsCreator {
    using SafeERC20 for IERC20;

    address public s_chain_router;
    // address public s_chain_link_address;
    IERC20 public s_chain_link_address;

    // Event that notifies when a message is sent
    event MessageSent(bytes32 messageId);

    error NotEnoughBalance(uint256 contractTokenBalance, uint256 fees);
    error NothingToWithdraw();
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Ether fails.

    // Constructor to set initial values for the router and LINK token address
    constructor(address router, address link) {
        s_chain_router = router;
        s_chain_link_address = IERC20(link);
        // // Approving the router to spend the maximum possible amount of LINK on behalf of this contract
        // LinkTokenInterface(s_chain_link_address).approve(s_chain_router, type(uint256).max);
    }

    // Fallback function to receive ether
    receive() external payable {}

    // Function to mint tokens on a different chain

    function mint(
        uint64 destinationChainSelector,  // Chain where tokens should be minted
        address receiver  // Receiver address on the destination chain
    ) external {
        // Creating a message for the EVN to Any chain communication

        bytes memory mintFunction = abi.encodeWithSignature("mint(address)", msg.sender);
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](0);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: mintFunction,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            feeToken: address(s_chain_link_address) // Setting the fee token
        });


        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(s_chain_router);

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(destinationChainSelector, message);
        if (fees > s_chain_link_address.balanceOf(address(this)))
            revert NotEnoughBalance(s_chain_link_address.balanceOf(address(this)), fees);

                // approve the Router to spend LINK and token on contract's behalf.
        s_chain_link_address.approve(address(router), fees);

        // Send the message through the router and store the returned message ID
        bytes32 messageId = router.ccipSend(destinationChainSelector, message);

        // Emitting the event to notofy that a message was sent
        emit MessageSent(messageId);
    }

    function withdraw(address _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        (bool sent, ) = _beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();
        IERC20(_token).safeTransfer(_beneficiary, amount);
    }

    function linkBalance() public view returns (uint256 link_balance){
        link_balance = s_chain_link_address.balanceOf(address(this));
    }

}
