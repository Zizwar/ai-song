"use client";

import AlbumList from "@/components/album-list";
import { useUserStore } from "@/store/user-store";
import Shell from "../../components/shell";

const Page = () => {
  const { playlists } = useUserStore();
  return (
    <Shell title="Playlists">
      <AlbumList musics={playlists} />
    </Shell>
  );
};

export default Page;
