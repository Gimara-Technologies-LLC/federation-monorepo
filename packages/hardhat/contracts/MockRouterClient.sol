// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract MockRouterClient {
	function getFee(uint64, bytes memory) external pure returns (uint256) {
		return 1 ether;
	}

	function ccipSend(uint64, bytes memory) external pure returns (bytes32) {
		return keccak256("mockMessageId");
	}
}
