// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CyberMate.sol";

contract Escrow {
    address public platform;
    CyberMate public tokenContract;

    struct EscrowDetails {
        address seller;
        uint256 serviceAmount;
        bool serviceCompleted;
    }

    mapping(address => EscrowDetails) public escrows;

    event ServiceCreated(
        address indexed buyer,
        address indexed seller,
        uint256 serviceAmount
    );
    event ServiceCompleted(address indexed seller, uint256 sellerAmount);

    constructor(address _tokenContract) {
        platform = msg.sender;
        tokenContract = CyberMate(_tokenContract);
    }

    function createService(address _seller, uint256 _serviceAmount) external {
        require(_seller != address(0), "Invalid seller address");
        require(_serviceAmount > 0, "Service amount must be greater than zero");

        EscrowDetails storage escrow = escrows[msg.sender];
        require(
            escrow.seller == address(0),
            "Service already exists for the buyer"
        );

        escrow.seller = _seller;
        escrow.serviceAmount = _serviceAmount;
        escrow.serviceCompleted = false;

        tokenContract.approve(address(this), _serviceAmount);
        tokenContract.transferFrom(msg.sender, address(this), _serviceAmount);

        emit ServiceCreated(msg.sender, _seller, _serviceAmount);
    }

    function completeService() external {
        address buyer = msg.sender;
        EscrowDetails storage escrow = escrows[buyer];

        require(
            escrow.seller != address(0),
            "No service details found for the buyer"
        );
        require(!escrow.serviceCompleted, "Service has already been completed");

        escrow.serviceCompleted = true;

        uint256 sellerAmount = (escrow.serviceAmount * 95) / 100;
        uint256 platformFee = escrow.serviceAmount - sellerAmount;

        tokenContract.transfer(escrow.seller, sellerAmount);
        tokenContract.transfer(platform, platformFee);

        emit ServiceCompleted(escrow.seller, sellerAmount);

        delete escrows[buyer];
    }

    function cancelService() external {
        address buyer = msg.sender;
        EscrowDetails storage escrow = escrows[buyer];

        require(
            escrow.seller != address(0),
            "No service details found for the buyer"
        );
        require(!escrow.serviceCompleted, "Service has already been completed");

        uint256 refundAmount = escrow.serviceAmount;
        tokenContract.transfer(buyer, refundAmount);

        delete escrows[buyer];
    }
}
