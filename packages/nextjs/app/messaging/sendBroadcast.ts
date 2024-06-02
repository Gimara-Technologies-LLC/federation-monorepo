import * as dotenv from "dotenv";
dotenv.config();
const { ethers } = require( "ethers");
const { Client } = require("@xmtp/xmtp-js");

const recipientAddresses: string[] = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x7e8624f0a4F454B6F09A658d598804380FE74976",
  ]
  
  function customMessage(recipientAddress: string) {
    return `Hello, user at ${recipientAddress}! This is a custom message. We ready`
  }
  
  async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  
    const xmtp =  await Client.create(wallet)
  
    for (const recipientAddress of recipientAddresses) {
      const messageContent = customMessage(recipientAddress)
  
      const convo = await xmtp.conversations.newConversation(recipientAddresses[0])
  
      await convo.send(messageContent)
      console.log(`Message sent to ${recipientAddress}`)
  
      //const concc = await xmtp.conversations.newConversation(recipientAddresses[1])
      //await concc.send(messageContent)
      //console.log(`Message sent to ${recipientAddress}`)
    }
  
  }
  main().catch((error) => {
    console.error(error);
    process.exit(1)
    
  })
  