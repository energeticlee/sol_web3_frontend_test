import { Connection, clusterApiUrl } from "@solana/web3.js";

const getTran = async (targetAccount: string) => {
  const network = clusterApiUrl("devnet");

  const connection = new Connection(network);

  // Fetch a confirmed or finalized transaction from the cluster.

  try {
    const req = await connection.getTransaction(targetAccount);
    if (req == null) throw new Error("Fail to get account info");
    if (req.meta == null) throw new Error("No meta data");
    if (req.meta.err == true) throw new Error("Error in transaction");

    const post = req.meta.postTokenBalances;
    const pre = req.meta.preTokenBalances;
    if (pre == null || post == null) throw new Error("No token balance data");
    if (pre.length < 1 || post.length < 1) throw new Error("Only 1 account");

    const transferredAmount =
      +pre[1].uiTokenAmount.amount / (pre[1].uiTokenAmount.decimals * 10) -
      +post[1].uiTokenAmount.amount / (post[1].uiTokenAmount.decimals * 10);

    console.log("1. What is happening in this transaction?");
    console.log(
      `Q1: Account ${pre[1].owner} is transferring ${transferredAmount} to Account ${pre[0].owner}`
    );
    console.log("======================");

    console.log("2. How much SOL was consumed to validate this transaction?");
    console.log(
      `Q2: This transaction cost ${req.meta?.fee} lamports, or ${
        req.meta?.fee / 10 ** 9
      } SOL`
    );
    console.log("======================");

    console.log("3. Which token account was the recipient of the transfer?");
    console.log(`Q3: Recipient ${pre[0].owner}`);
    console.log("======================");

    console.log("4. Which token account was the source of the transfer?");
    console.log(`Q3: Source ${pre[1].owner}`);
    console.log("======================");

    console.log("5. What was the mint of the token transferred?");
    console.log(`Q5: ${pre[0].mint}`);
    console.log("======================");

    console.log("6. How much of the token was transferred?");
    console.log(`Q6: ${transferredAmount}`);
    console.log("======================");
  } catch (error) {
    console.log(error);
  }
};
getTran(
  "3aHvRYj2vTrSrCYh16aubq4VAoEURQKHQe3sHzTSE3jp3WigsVpAPBckag7VcBtY2TyJSqhsE5gPsiiKiRc4y7J8"
);
