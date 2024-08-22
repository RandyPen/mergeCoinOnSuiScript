import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";


const client = new SuiClient({
    url: getFullnodeUrl("mainnet"),
});

const mnemonics: string = process.env.MNEMONICS!;
const keypair = Ed25519Keypair.deriveKeypair(mnemonics);

// import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

// const secret_key = process.env.PRIVATE;
// const { secretKey, schema } = decodeSuiPrivateKey(secret_key);
// const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const address = keypair.getPublicKey().toSuiAddress();
// console.log(address);

interface Data {
    objectId: string;
    version: string;
    digest: string;
}

interface Item {
    data: Data;
}

const StructType =
    "0x2::coin::Coin<0x9cde6fd22c9518820644dd1350ac1595bb23751033d247465ff3c7572d9a7049::mine::MINE>";
const own_objects = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: StructType },
});

let items = own_objects.data;
items = items.filter(item => item !== null && item !== '');
let objectIds = items.map(item => item.data.objectId);


let firstCoinId = objectIds[0]; 
let remainingCoinIds = objectIds.slice(1);

const tx = new Transaction();
tx.mergeCoins(tx.object(firstCoinId), remainingCoinIds.map((item) => tx.object(item)) );
tx.setSender(address);

const result = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx });
console.log(result);
