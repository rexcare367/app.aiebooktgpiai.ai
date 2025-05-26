import React from "react";
import { LibraryBig, Heart, Tags, Highlighter, Award, Trophy } from "lucide-react";
export const sideMenu = [
  {
    name: "Books",
    mode: "home",
    icon: <LibraryBig />,
  },
  {
    name: "Favorites",
    mode: "favorite",
    icon: <Heart />,
  },

  {
    name: "Notes",
    mode: "note",
    icon: <Tags />,
  },
  {
    name: "Highlights",
    icon: <Highlighter />,
    mode: "digest",
  },
  {
    name: "Achievements",
    mode: "achievement",
    icon: <Trophy />,
  },
  {
    name: "Rewards",
    mode: "reward",
    icon: <Award />,
  },
  // {
  //   name: "Deleted Books",
  //   icon: "trash-line",
  //   mode: "trash",
  // },
];
