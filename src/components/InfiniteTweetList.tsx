import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import IconHoverEffect from "./IconHoverEffect";
import { api } from "~/utils/api";
import LoadingSpinner from "./LoadingSpinner";

type Tweet = {
  id: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};

type InfiniteTweetListProps = {
  tweets?: Tweet[];
  isLoading: boolean;
  isError: boolean;
  hasMore?: boolean;
  fetchNewTweets: () => Promise<unknown>;
};

type HeartButtonProps = {
  likedByMe: boolean;
  likesCount: number;
  isLoading: boolean;
  onClick: () => void;
};

const datetimeFormatter = Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

export default function InfiniteTweetList({
  tweets,
  isError,
  isLoading,
  fetchNewTweets,
  hasMore,
}: InfiniteTweetListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <h1>Error...</h1>;
  }

  if (tweets == null || tweets.length === 0) {
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
    );
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        hasMore={!!hasMore}
        loader={<LoadingSpinner />}
        next={fetchNewTweets}
      >
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} {...tweet} />
        ))}
      </InfiniteScroll>
    </ul>
  );
}
function TweetCard({
  id,
  user,
  content,
  createdAt,
  likesCount,
  likedByMe,
}: Tweet) {
  const trpcUtils = api.useContext();
  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedLike ? 1 : -1;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            tweets: page.tweets.map((tweet) => {
              if (tweet.id === id) {
                return {
                  ...tweet,
                  likesCount: tweet.likesCount + countModifier,
                  likedByMe: addedLike,
                };
              }

              return tweet;
            }),
          })),
        };
      };

      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.tweet.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
      trpcUtils.tweet.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData
      );
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {datetimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton
          likedByMe={likedByMe}
          likesCount={likesCount}
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
        />
      </div>
    </li>
  );
}

function HeartButton({
  likedByMe,
  likesCount,
  onClick,
  isLoading,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likesCount}</span>
      </div>
    );
  }
  return (
    <button
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-100 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
      onClick={onClick}
      disabled={isLoading}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? "filled-red-500"
              : "filled-gray-500 group-hover:filled-red-500 group-focus-visible:filled-red-500"
          }`}
        />
      </IconHoverEffect>

      <span>{likesCount}</span>
    </button>
  );
}
