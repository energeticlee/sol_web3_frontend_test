import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMint,
  getMint,
  mintTo,
  createAssociatedTokenAccount,
  createSetAuthorityInstruction,
  AuthorityType,
  transfer,
} from "@solana/spl-token";

// Helper Function
const solToLamp = (sol: number) => sol * 10 ** 9;
const getConnection = () => new Connection(clusterApiUrl("devnet"));

const getMintInfo = async (mint: PublicKey) =>
  await getMint(getConnection(), mint);

const createTokenAccount = async (
  owner: Keypair,
  mintKey: PublicKey,
  newAccountOwner: PublicKey
) =>
  await createAssociatedTokenAccount(
    getConnection(),
    owner,
    mintKey,
    newAccountOwner
  );

const createNewAccount = async () => {
  // 1. Generate a random keypair
  const keypair = Keypair.generate();
  const connection = getConnection();

  console.log(`Account Created: ${keypair.publicKey}`);
  // 2. Airdrop 0.5 SOL to the new keypair’s public key
  const airdropSignature = await connection.requestAirdrop(
    keypair.publicKey,
    solToLamp(0.5)
  );
  await connection.confirmTransaction(airdropSignature);
  console.log(`Successfully Airdrop 0.5 Sol`);
  return keypair;
};

// 3. Create a token mint with 6 decimals using the keypair’s public key as the authority
const initializeNewMint = async (authority: Keypair) => {
  const mint = await createMint(
    getConnection(),
    authority,
    authority.publicKey,
    authority.publicKey,
    6
  );
  console.log(`New mint initialize: ${mint}`);
  return mint;
};

// 4. Mint 1,000,000 tokens to a token account owned by the keypair’s public key
const createAndMintAccount = async (
  owner: Keypair,
  mintKey: PublicKey,
  amount: number
) => {
  const tokenAccount = await createTokenAccount(
    owner,
    mintKey,
    owner.publicKey
  );
  await mintTo(getConnection(), owner, mintKey, tokenAccount, owner, amount);
  console.log(`Successfully minted ${amount} token!`);
  return tokenAccount;
};

// 5. Take out the ability to mint any more tokens (capping token supply to 1M tokens)
const disableMint = async (mintAccount: PublicKey, authority: Keypair) => {
  let transaction = new Transaction().add(
    createSetAuthorityInstruction(
      mintAccount,
      authority.publicKey,
      AuthorityType.MintTokens,
      null
    )
  );
  console.log("Sending Transaction");

  await sendAndConfirmTransaction(getConnection(), transaction, [authority]);
  console.log(`Token Account ${mintAccount} Disabled`);
};

// 6. Prove that minting is indeed disabled
const isDisabled = async (mintAccount: PublicKey) => {
  console.log("Getting mint info");
  const mintInfo = await getMintInfo(mintAccount);
  return mintInfo.mintAuthority ? false : true;
};

// 7. Prove that your token mint’s supply is set at exactly 1,000,000
const isOneMill = async (mintAccount: PublicKey) => {
  const mintInfo = await getMintInfo(mintAccount);
  return mintInfo.supply === BigInt(1e12);
};

//! *8. Bonus: Send 500,000 tokens to an associated token account owned by the keypair’s public key
const sendFundingToken = async (
  funder: Keypair,
  funderTokenAccount: PublicKey,
  fundeeTokenAccount: PublicKey,
  amount: number
) => {
  const connection = getConnection();
  console.log(
    `Sending ${amount} from ${funderTokenAccount} to ${fundeeTokenAccount}`
  );
  const signature = await transfer(
    connection,
    funder,
    funderTokenAccount,
    fundeeTokenAccount,
    funder.publicKey,
    amount,
    [funder]
  );
  await connection.confirmTransaction(signature);
  console.log(
    `Success! Check it out! https://explorer.solana.com/?cluster=devnet`
  );
};

(async () => {
  // 1. Generate a random keypair
  // 2. Airdrop 0.5 SOL to the new keypair’s public key
  const myAccount = await createNewAccount();

  // 3. Create a token mint with 6 decimals using the keypair’s public key as the authority
  const mintAccount = await initializeNewMint(myAccount);

  // 4. Mint 1,000,000 tokens to a token account owned by the keypair’s public key
  const tokenAccount = await createAndMintAccount(myAccount, mintAccount, 1e12);

  // 5. Take out the ability to mint any more tokens (capping token supply to 1M tokens)
  await disableMint(mintAccount, myAccount);

  // 6. Prove that minting is indeed disabled
  console.log(`Quick check! is disabled: ${await isDisabled(mintAccount)}`);

  // 7. Prove that your token mint’s supply is set at exactly 1,000,000
  console.log(
    `Quick check! 1,000,000 token supply: ${await isOneMill(mintAccount)}`
  );

  // 8. Bonus: Send 500,000 tokens to an associated token account owned by the keypair’s public key
  //? Both token account and associated token account owned by the same keypair?
  const newUserAccount = Keypair.generate();

  console.log(myAccount.secretKey.toString());
  console.log(tokenAccount.toString());
  console.log(mintAccount.toString());

  const fundeeTokenAccount = await createTokenAccount(
    myAccount,
    mintAccount,
    newUserAccount.publicKey
  );

  sendFundingToken(myAccount, tokenAccount, fundeeTokenAccount, 5000000);
})();
