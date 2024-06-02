const { ethers } = require( "ethers");
const { Client } = require("@xmtp/xmtp-js");


// Function to send a broadcast message to a list of recipients
async function sendBroadcastMessage(recipients: string, message: string) {
  // In a real application, use the user's wallet
  const signer = ethers.Wallet.createRandom();
  const xmtp = await Client.create(signer);

  // Iterate over each recipient to send the message
  for (const recipient of recipients) {
    // Check if the recipient is activated on the XMTP network
    if (await xmtp.canMessage(recipient)) {
      const conversation = await xmtp.conversations.newConversation(recipient);
      await conversation.send(message);
      console.log(`Message successfully sent to ${recipient}`);
    } else {
      console.log(
        `Recipient ${recipient} is not activated on the network.`,
      );
    }
  }
}

const recipients: string[] = ["0x0eb0ab11e2c4c6D5e91E61C9D49FE0BA606d26B2","0x7e8624f0a4F454B6F09A658d598804380FE74976","0xb799cfB75B3D78c34eDc29189C5B35EC02da536c"];
const firstReceiptient = recipients[0]; 
const message = "Welcome to Federation Cloud!"; // Your broadcast message
sendBroadcastMessage(firstReceiptient , message);
