import BookList from "../containers/lists/bookList";
import NoteList from "../containers/lists/noteList";
import DigestList from "../containers/lists/digestList";
import ProfilePage from "../containers/profilePage";
import { AchievementPage } from "../containers/achievementPage/components";
import { RewardPage } from "../containers/rewardPage/components";

export const routes = [
  { path: "/manager/note", component: NoteList },
  { path: "/manager/digest", component: DigestList },
  { path: "/manager/home", component: BookList },
  { path: "/manager/favorite", component: BookList },
  { path: "/manager/profile", component: ProfilePage },
  { path: "/manager/achievement", component: AchievementPage },
  { path: "/manager/reward", component: RewardPage },
];
