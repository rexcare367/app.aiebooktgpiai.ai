import BookList from "../pages/books";
import NoteList from "../pages/notes";
import DigestList from "../pages/digests";
import ProfilePage from "../pages/profile";
import { AchievementPage } from "../pages/achievements/components";
import { RewardPage } from "../pages/rewards/components";

export const routes = [
  { path: "/manager/note", component: NoteList },
  { path: "/manager/digest", component: DigestList },
  { path: "/manager/home", component: BookList },
  { path: "/manager/favorite", component: BookList },
  { path: "/manager/profile", component: ProfilePage },
  { path: "/manager/achievement", component: AchievementPage },
  { path: "/manager/reward", component: RewardPage },
];
