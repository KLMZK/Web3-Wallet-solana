import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Xpectre Wallet</title>
        <meta name="description" content="Xpectre Labs — Solana Web3 Wallet Dashboard" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
