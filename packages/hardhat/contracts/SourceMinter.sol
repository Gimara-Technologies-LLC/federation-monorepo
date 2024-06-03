// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { OwnerIsCreator } from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Source Minter Contract
/// @author Da...
/// @notice This contract is used to call the destination minter
/// funtion to mint tokens and more
/// @dev Alway remember to send some gas after deploying

contract SourceMinter is OwnerIsCreator {
	using SafeERC20 for IERC20;

	/// @notice Global variable for the source network router address
	address public s_chain_router;

	/// @notice Global variable for the link token address on network
	IERC20 public s_chain_link_address;

	/// @notice Event to log result of the transaction
	/// @param messageId This is the output of the ccipSend function
	event MessageSent(bytes32 messageId);

	// Logs when the balance of LINK is less than the fee
	error NotEnoughBalance(uint256 contractTokenBalance, uint256 fees);
	// Logs when the token balance in the contract is zero
	error NothingToWithdraw();
	// Logs when the withdrawal of Ether fails.
	error FailedToWithdrawEth(address owner, address target, uint256 value);

	// Constructor to set initial values for the router and LINK token address
	constructor(address router, address link) {
		s_chain_router = router;
		s_chain_link_address = IERC20(link);
	}

	// Fallback function to receive ether
	receive() external payable {}

	/// @notice This function is used to target the mint function
	/// @param destinationChainSelector Chain Indentifier where tokens should be minted
	/// @param receiver Address to which the ABT is sent after minting
	function mint(uint64 destinationChainSelector, address receiver) external {
		// Creating a message for the EVN to Any chain communication

		bytes memory mintFunction = abi.encodeWithSignature(
			"mint(address)",
			msg.sender
		);
		Client.EVMTokenAmount[]
			memory tokenAmounts = new Client.EVMTokenAmount[](0);

		Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
			receiver: abi.encode(receiver),
			data: mintFunction,
			tokenAmounts: tokenAmounts,
			extraArgs: Client._argsToBytes(
				Client.EVMExtraArgsV1({ gasLimit: 200_000 })
			),
			feeToken: address(s_chain_link_address)
		});

		// Initialize a router client instance to interact with cross-chain router
		IRouterClient router = IRouterClient(s_chain_router);

		// Get the fee required to send the CCIP message
		uint256 fees = router.getFee(destinationChainSelector, message);
		if (fees > s_chain_link_address.balanceOf(address(this)))
			revert NotEnoughBalance(
				s_chain_link_address.balanceOf(address(this)),
				fees
			);

		// Approves the Router to spend LINK and token on contract's behalf to handle the gas
		s_chain_link_address.approve(address(router), fees);

		// Send the message through the router and store the returned message ID
		bytes32 messageId = router.ccipSend(destinationChainSelector, message);

		// Emitting the event to notofy that a message was sent
		emit MessageSent(messageId);
	}

	/// @notice Withdraws the ERC20 tokens sent to the contract
	/// @dev This enables the owner of the contract to withdraw all the tokens sent to this contract
	/// @param _beneficiary This is any address that the contract owner adds to send the tokens to.
	/// @param _token This is the address of the token contained in the smart contract
	/// There is a check to make sure the contract saves gas by not trying to tranfer whats not there.
	function withdrawToken(
		address _beneficiary,
		address _token
	) public onlyOwner {
		uint256 amount = IERC20(_token).balanceOf(address(this));
		if (amount == 0) revert NothingToWithdraw();
		IERC20(_token).safeTransfer(_beneficiary, amount);
	}

	/// @notice Getter function to get token balance
	/// @dev It maskes sense having this function so we can always know whether we are out of
	/// LINK to pay for gas and helps reduce debug time.
	/// @return link_balance This the balance of link contrained in the contract as its the
	/// token being used to pay gas.
	function linkBalance() public view returns (uint256 link_balance) {
		link_balance = s_chain_link_address.balanceOf(address(this));
	}
}
