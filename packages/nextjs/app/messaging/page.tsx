"use client";

import React, { useEffect, useState } from "react";
import { Subscribe } from "./Subscribe";
import { Client } from "@xmtp/xmtp-js";

const { ethers } = require("ethers");

// Replace with your Ethereum private key
const PRIVATE_KEY = "your-private-key-here";

const Messaging: NextPage = () => {
  // const [address, setAddress] = useState('');
  // const [message, setMessage] = useState('');
  // const [addresses, setAddresses] = useState([]);
  // const [xmtpClient, setXmtpClient] = useState(null);
  //
  // // Initialize XMTP client
  // const initializeXmtp = async () => {
  //   if (!xmtpClient) {
  //     const wallet = new ethers.Wallet(PRIVATE_KEY);
  //     const client = await Client.create(wallet);
  //     setXmtpClient(client);
  //   }
  // };
  //
  // // Subscribe function to add address to the list
  // const subscribeAddress = async (e) => {
  //   e.preventDefault();
  //   await initializeXmtp();
  //   setAddresses([...addresses, address]);
  //   setAddress('');
  // };
  //
  // // Broadcast message to all addresses
  // const broadcastMessage = async (e) => {
  //   e.preventDefault();
  //   await initializeXmtp();
  //   for (const recipientAddress of addresses) {
  //     try {
  //       const canMessage = await xmtpClient.canMessage(recipientAddress);
  //       if (!canMessage) {
  //         await xmtpClient.conversations.newConversation(recipientAddress);
  //       }
  //       const conversation = await xmtpClient.conversations.newConversation(recipientAddress);
  //       await conversation.send(message);
  //     } catch (error) {
  //       console.error(`Failed to send message to ${recipientAddress}:`, error);
  //     }
  //   }
  //   setMessage('');
  // };
  //
  // return (
  //   <div className="App">
  //     <h1>XMTP Subscription and Broadcast</h1>
  //     <form onSubmit={subscribeAddress}>
  //       <input
  //         type="text"
  //         value={address}
  //         onChange={(e) => setAddress(e.target.value)}
  //         placeholder="Enter Ethereum address"
  //       />
  //       <button type="submit">Subscribe</button>
  //     </form>
  //     <ul>
  //       {addresses.map((addr, index) => (
  //         <li key={index}>{addr}</li>
  //       ))}
  //     </ul>
  //     <form onSubmit={broadcastMessage}>
  //       <textarea
  //         value={message}
  //         onChange={(e) => setMessage(e.target.value)}
  //         placeholder="Enter your message"
  //       />
  //       <button type="submit">Broadcast</button>
  //     </form>
  //   </div>
  // );

  const [subscribeArray, setSubscribeArray] = useState([]);

  const styles = {
    homePageWrapper: {
      textAlign: "center",
      marginTop: "2rem",
    },
  };

  return (
    <div style={styles.homePageWrapper}>
      <Subscribe
        senderAddress="0x5740c82452fbaAb766cFf7A645A085D586C2326D"
        onSubscribe={(address, state) => {
          console.log("New subscriber: ", { address, state });
          setSubscribeArray(prevArray => [...prevArray, { address, state }]);
        }}
        onUnsubscribe={(address, state) => {
          console.log("Unsubscribed: ", { address, state });
          setSubscribeArray(prevArray => {
            const index = prevArray.findIndex(a => a.address === address);
            if (index !== -1) {
              const newArray = [...prevArray];
              newArray[index].state = state;
              return newArray;
            }
            return prevArray;
          });
        }}
        onError={error => console.log("Error subscribing: " + error)}
        env="production"
      />
    </div>
  );
};

export default Messaging;
