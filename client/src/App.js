import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Container, Row, Col, Button } from "react-bootstrap";
import abi from "./abi.json";
import "./app.css";

const tokenAddress = "0xA17694eFF7FF4A707f6bF3a41b2e8fB23c38365d";

function App() {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  useEffect(() => {
    async function setup() {
      try {
        if (window.ethereum) {
          await window.ethereum.enable();
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          setProvider(provider);
          setSigner(signer);

          const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
          const balance = await tokenContract.balanceOf(signer.getAddress());
          setTokenBalance(balance.toString());
          const name = await tokenContract.name();
          setTokenName(name);
          const symbol = await tokenContract.symbol();
          setTokenSymbol(symbol);

          console.log(tokenName);
        } else {
          console.log("Please install MetaMask to use this dApp.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    setup();
  }, [tokenName, tokenSymbol]);

  useEffect(() => {
    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        // Prompt the user to connect to MetaMask
        console.log("Please connect to MetaMask.");
      } else {
        // Reconnect to MetaMask and update the provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);
      }
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        // Cleanup: Remove the event listener
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const handleMintTokens = async () => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
      const tx = await tokenContract.mint(account, tokens);
      await tx.wait();
      const balance = await tokenContract.balanceOf(signer.getAddress());
      setTokenBalance(balance.toString());
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [account, setAccount] = useState("");

  const handleAccountChange = (e) => {
    e.preventDefault();
    setAccount(e.target.value);
  };

  const [tokens, setTokens] = useState("");
  const handleTokenChange = (e) => {
    e.preventDefault();
    setTokens(e.target.value);
  };

  const handleTransferTokens = async () => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
      const tx = await tokenContract.transfer(account1, tokens1);
      await tx.wait();
      const balance = await tokenContract.balanceOf(signer.getAddress());
      setTokenBalance(balance.toString());
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [account1, setAccount1] = useState("");
  const handleAccountChange1 = (e) => {
    e.preventDefault();
    setAccount1(e.target.value);
  };

  const [tokens1, setTokens1] = useState("");

  const handleTokenChange1 = (e) => {
    e.preventDefault();
    setTokens1(e.target.value);
  };

  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <h1>Cybermate DApp</h1>
          <h3>Token Balance: {tokenBalance}</h3>
          <h3>Token Name: {tokenName}</h3>
          <h3>Token symbol: {tokenSymbol}</h3>
          <br />

          <form>
            <h3>Mint Tokens:</h3>
            <input
              type="text"
              placeholder="enter wallet address"
              required
              name="account"
              value={account}
              onChange={handleAccountChange}
            ></input>
            <input
              type="text"
              placeholder="Tokens"
              required
              name="tokens"
              value={tokens}
              onChange={handleTokenChange}
            ></input>
            <Button onClick={handleMintTokens}>Mint Tokens</Button>
          </form>

          <br />
          <br />
          <form>
            <h3>Transfer Tokens:</h3>
            <input
              type="text"
              placeholder="enter wallet address"
              required
              name="account1"
              value={account1}
              onChange={handleAccountChange1}
            ></input>
            <input
              type="text"
              placeholder="Tokens"
              required
              name="tokens1"
              value={tokens1}
              onChange={handleTokenChange1}
            ></input>
            <Button onClick={handleTransferTokens}>Transfer</Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
