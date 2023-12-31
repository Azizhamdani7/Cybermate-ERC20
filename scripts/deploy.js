async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const token = await ethers.deployContract("CyberMate");

  console.log("Token address:", await token.getAddress());
  const tokenAddress = token.getAddress();

  //Deploy Escrow contract

  console.log("Deploying Escrow contract with the account:", deployer.address);
  const escrow = await ethers.deployContract("Escrow", [tokenAddress]);
  const escrowAddress = escrow.getAddress();
  console.log("escrow address:", await escrowAddress);

  console.log("Both the contracts have been deployed successfully. ");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
