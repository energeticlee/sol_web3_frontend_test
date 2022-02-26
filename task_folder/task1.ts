import {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

// https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getAccountInfo
const getAcc = async (targetAccount: string) => {
  const account = new PublicKey(targetAccount);
  const network = clusterApiUrl("devnet");

  const connection = new Connection(network);
  try {
    const req = await connection.getAccountInfo(account);
    if (req == null) throw new Error("Fail to get account info");

    console.log("1. How much SOL does it hold?");
    console.log(
      `Q1: ${req.lamports} lamports, or ${req.lamports / 10 ** 9} SOL`
    );
    console.log("======================");

    console.log("2. What type of account is it?");
    console.log("This is a System owned accounts");
    console.log("======================");

    console.log("3. Which program owns the account?");
    console.log(`owner ${req.owner.toString()}, System Program`);
    console.log("======================");

    console.log(
      `4. How would you edit the data field of this account on-chain?`
    );
    console.log(
      `As this account is own by the system program, the private key is require to mutate this account. Else, you can only transfer SOL into this account.`
    );
    console.log("======================");

    console.log(req.owner.toString() === SystemProgram.programId.toString());
  } catch (error) {
    console.log(error);
  }
};
getAcc("Hp51VwJ2c9cHa2f6GEjxKN2CWQ5g523nZH7Yj5aQjxjA");
