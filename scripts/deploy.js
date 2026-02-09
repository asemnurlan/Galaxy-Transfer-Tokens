async function main() {
  console.log("Starting deployment (RPC approach)...");
  const hre = typeof globalThis.hre !== "undefined" ? globalThis.hre : (await import("hardhat")).default || (await import("hardhat"));
  const artifacts = hre.artifacts;
  const rpcUrl = 'http://127.0.0.1:8545';

  // providerRequest using fetch
  async function providerRequest(method, params) {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const j = await res.json();
    if (j.error) throw new Error(JSON.stringify(j.error));
    return j.result;
  }

  // get first unlocked account from the node
  const accounts = await providerRequest('eth_accounts', []);
  if (!accounts || accounts.length === 0) throw new Error('No accounts available from provider');
  const deployer = accounts[0];
  console.log("Deploying contracts with the account:", deployer);

  // helper: send tx and wait for receipt
  async function sendTx(tx) {
    const hash = await providerRequest('eth_sendTransaction', [tx]);
    for (let i = 0; i < 60; i++) {
      const receipt = await providerRequest('eth_getTransactionReceipt', [hash]);
      if (receipt) return receipt;
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error('Transaction not mined in time: ' + hash);
  }

  // deploy GalaxyRewardToken (assumes artifacts already compiled)
  const tokenArtifact = await artifacts.readArtifact('GalaxyRewardToken');
  const { abi: tokenAbi, bytecode: tokenBytecode } = tokenArtifact;
  const { encodeDeployData, encodeFunctionData } = await import('viem');
  const tokenDeployData = encodeDeployData({ abi: tokenAbi, bytecode: tokenBytecode, args: [deployer] });
  const estGasToken = await providerRequest('eth_estimateGas', [{ from: deployer, data: tokenDeployData }]);
  const tokenReceipt = await sendTx({ from: deployer, data: tokenDeployData, gas: estGasToken });
  const tokenAddress = tokenReceipt.contractAddress;
  console.log('GalaxyRewardToken deployed to:', tokenAddress);

  // deploy GalaxyCrowdfund
  const crowdfundArtifact = await artifacts.readArtifact('GalaxyCrowdfund');
  const { abi: crowdAbi, bytecode: crowdBytecode } = crowdfundArtifact;
  const INITIAL_REWARD_RATE = 1000;
  const crowdfundDeployData = encodeDeployData({ abi: crowdAbi, bytecode: crowdBytecode, args: [tokenAddress, INITIAL_REWARD_RATE] });
  const estGasCrowd = await providerRequest('eth_estimateGas', [{ from: deployer, data: crowdfundDeployData }]);
  const crowdReceipt = await sendTx({ from: deployer, data: crowdfundDeployData, gas: estGasCrowd });
  const crowdfundAddress = crowdReceipt.contractAddress;
  console.log('GalaxyCrowdfund deployed to:', crowdfundAddress);

  // call token.setMinter(crowdfundAddress)
  const setMinterData = encodeFunctionData({ abi: tokenAbi, functionName: 'setMinter', args: [crowdfundAddress] });
  const estGasSet = await providerRequest('eth_estimateGas', [{ from: deployer, to: tokenAddress, data: setMinterData }]);
  const setReceipt = await sendTx({ from: deployer, to: tokenAddress, data: setMinterData, gas: estGasSet });
  console.log('Set crowdfund as token minter:', crowdfundAddress);

  console.log('\nSuccess!');
  console.log('TOKEN_ADDRESS:', tokenAddress);
  console.log('CROWDFUND_ADDRESS:', crowdfundAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
