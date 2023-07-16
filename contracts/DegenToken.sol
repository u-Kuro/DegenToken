// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DegenToken is ERC20, Ownable {

    struct NFT {
        uint256 id;
        string name;
        uint256 amount;
    }

    NFT[] public NFTs;
    event NFTRedeemed(NFT nft);

    constructor() ERC20("Degen", "DGN") {
        NFTs.push(NFT(1, "Dragonfire Amulet", 100));
        NFTs.push(NFT(2, "Celestial Blade of Unity", 150));
        NFTs.push(NFT(3, "Enchanted Phoenix Feather", 200));
    }

    function mintTokens(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function transferTokens(address recipient, uint256 amount) external {
        _transfer(msg.sender, recipient, amount);
    }

    function showRedeemPrizes() external view returns (NFT[] memory) {
        return NFTs;
    }

    function redeemTokens(uint256 choice) external {
        require(choice>=1 && choice <= NFTs.length, "Invalid Choice");
        uint256 prizeAmount = NFTs[choice - 1].amount;
        _burn(msg.sender, prizeAmount);
        emit NFTRedeemed(NFTs[choice - 1]);
        delete NFTs[choice - 1];
    }

    function burnTokens(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function checkBalance() external view returns (uint256) {
        return balanceOf(msg.sender);
    }
}