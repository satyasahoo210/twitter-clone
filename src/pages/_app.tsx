import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import SideNav from "~/components/SideNav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        {/* HTML Meta Tags */}
        <title>Twitter</title>
        <meta name="description" content="Twitter Clone App by @satya210" />

        {/* Facebook Meta Tags */}
        <meta
          property="og:url"
          content="https://twitter-clone-satyasahoo210.vercel.app/"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Twitter" />
        <meta
          property="og:description"
          content="Twitter Clone App by @satya210"
        />
        <meta
          property="og:image"
          content="https://twitter-clone-satyasahoo210.vercel.app/logo.png"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="twitter-clone-satyasahoo210.vercel.app"
        />
        <meta
          property="twitter:url"
          content="https://twitter-clone-satyasahoo210.vercel.app/"
        />
        <meta name="twitter:title" content="Twitter" />
        <meta
          name="twitter:description"
          content="Twitter Clone App by @satya210"
        />
        <meta
          name="twitter:image"
          content="https://twitter-clone-satyasahoo210.vercel.app/logo.png"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto flex items-start sm:pr-4">
        <SideNav />
        <div className="min-h-screen flex-grow border-x">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
