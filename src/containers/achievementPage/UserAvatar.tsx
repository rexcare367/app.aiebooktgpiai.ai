import React from "react";

interface UserAvatarProps {
  rank: number;
  color: string;
}

export const UserAvatar = ({ rank, color }: UserAvatarProps) => {
  return (
    <div
      className={`h-12 w-12 rounded-full border-solid border border-1 ${color} flex items-center justify-center font-bold`}
    >
      {rank}
    </div>
  );
};
