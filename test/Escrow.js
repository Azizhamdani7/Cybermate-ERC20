const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let Escrow;
  let escrow;
  let cyberMate;
  let owner;
  let seller;
  let buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    cyberMate = await ethers.deployContract("CyberMate");

    escrow = await ethers.deployContract("Escrow", [cyberMate.getAddress()]);
  });

  describe("balance of address", () => {
    it("should return the balance of the account", async function () {
      const [addr] = await ethers.getSigners();

      const balance = await cyberMate.balanceOf(addr.address);
      expect(await cyberMate.balanceOf(addr.address).to.equal(balance));
    });
  });

  describe("transfer tokens", () => {
    it("should transfer tokens from one account to anither account", async function () {
      const [addr1, addr2] = await ethers.getSigners();

      const transferAmount = ethers.utils.parseUnits("50", 18);

      await cyberMate.transfer(addr1.address, transferAmount);
      expect(await cyberMate.balanceOf(addr1.address)).to.equal(transferAmount);
    });
  });

  describe("createService", function () {
    it("should create a new service", async function () {
      const serviceAmount = 100;

      await cyberMate.connect(buyer).approve(escrow.address, serviceAmount);
      const createServiceTx = await escrow
        .connect(buyer)
        .createService(seller.address, serviceAmount);
      await createServiceTx.wait();

      const escrowDetails = await escrow.escrows(buyer.address);

      expect(escrowDetails.seller).to.equal(seller.address);
      expect(escrowDetails.serviceAmount).to.equal(serviceAmount);
      expect(escrowDetails.serviceCompleted).to.equal(false);
    });

    it("should revert if the seller address is invalid", async function () {
      const serviceAmount = 100;

      await expect(
        escrow
          .connect(buyer)
          .createService(ethers.constants.AddressZero, serviceAmount)
      ).to.be.revertedWith("Invalid seller address");
    });

    it("should revert if the service amount is zero", async function () {
      await expect(
        escrow.connect(buyer).createService(seller.address, 0)
      ).to.be.revertedWith("Service amount must be greater than zero");
    });

    it("should revert if the service already exists for the buyer", async function () {
      const serviceAmount = 100;

      await cyberMate.connect(buyer).approve(escrow.address, serviceAmount);
      await escrow.connect(buyer).createService(seller.address, serviceAmount);

      await expect(
        escrow.connect(buyer).createService(seller.address, serviceAmount)
      ).to.be.revertedWith("Service already exists for the buyer");
    });
  });

  describe("completeService", function () {
    it("should complete the service and transfer funds", async function () {
      const serviceAmount = ethers.utils.parseUnits("100", 18);
      const platformFee = serviceAmount.mul(5).div(100);
      const sellerAmount = serviceAmount.sub(platformFee);

      await cyberMate.connect(buyer).approve(escrow.address, serviceAmount);
      await escrow.connect(buyer).createService(seller.address, serviceAmount);

      await escrow.connect(seller).completeService();

      const escrowDetails = await escrow.escrows(buyer.address);
      expect(escrowDetails.serviceCompleted).to.equal(true);

      const sellerBalance = await cyberMate.balanceOf(seller.address);
      expect(sellerBalance).to.equal(sellerAmount);

      const platformBalance = await cyberMate.balanceOf(owner.address);
      expect(platformBalance).to.equal(platformFee);
    });

    it("should revert if no service details found for the buyer", async function () {
      await expect(escrow.connect(buyer).completeService()).to.be.revertedWith(
        "No service details found for the buyer"
      );
    });

    it("should revert if service has already been completed", async function () {
      const serviceAmount = 100;

      await cyberMate.connect(buyer).approve(escrow.address, serviceAmount);
      await escrow.connect(buyer).createService(seller.address, serviceAmount);
      await escrow.connect(seller).completeService();

      await expect(escrow.connect(seller).completeService()).to.be.revertedWith(
        "Service has already been completed"
      );
    });
  });

  describe("cancelService", function () {
    it("should cancel the service and refund the buyer", async function () {
      const serviceAmount = 100;

      await cyberMate.connect(buyer).approve(escrow.address, serviceAmount);
      await escrow.connect(buyer).createService(seller.address, serviceAmount);

      await escrow.connect(buyer).cancelService();

      const escrowDetails = await escrow.escrows(buyer.address);
      expect(escrowDetails.seller).to.equal(ethers.constants.AddressZero);

      const buyerBalance = await cyberMate.balanceOf(buyer.address);
      expect(buyerBalance).to.equal(serviceAmount);
    });

    it("should revert if no service details found for the buyer", async function () {
      await expect(escrow.connect(buyer).cancelService()).to.be.revertedWith(
        "No service details found for the buyer"
      );
    });

    it("should revert if service has already been completed", async function () {
      const serviceAmount = 100;

      await cyberMate.connect(buyer).approve(escrow.address, serviceAmount);
      await escrow.connect(buyer).createService(seller.address, serviceAmount);
      await escrow.connect(seller).completeService();

      await expect(escrow.connect(buyer).cancelService()).to.be.revertedWith(
        "Service has already been completed"
      );
    });
  });
});
