import * as dotenv from "dotenv";
dotenv.config();
const { ethers } = require( "ethers");
const { Client } = require("@xmtp/xmtp-js");

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  
    const xmtp = await Client.create(wallet)
  
    const address = wallet.address
  
    console.log(`Address ${address} is connected to the XMTP network`)
  
    const recipientAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    const messageContent = "Hello from XMTP new message"
    const conversation = await xmtp.conversations.newConversation(recipientAddress)
    await conversation.send(messageContent)
    console.log(`Message sent to ${recipientAddress}`)
  
    console.log(`Reading messages from ${recipientAddress}`)
    //const recipientConversation = await xmtp.conversations.newConversation(recipientAddress)
    const messages = await conversation.messages()
    messages.forEach((msg: { senderAddress: string; content: string; }, index: number) => {
      console.log(`Message ${index + 1} from ${msg.senderAddress}: ${msg.content}`)
    });
  
}
main().catch((error) => {
  console.error(error);
  process.exit(1)
  
})