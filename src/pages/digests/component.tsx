import React, { useState, useEffect } from "react";
import { DigestListProps, DigestListStates } from "./interface";
import CardList from "../cardList";
import NoteTag from "../../components/noteTag";
import NoteModel from "../../models/Note";
import Empty from "../emptyPage";
import Manager from "../manager";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import authService, { UserData } from "../../utils/authService";
import DigestSkeleton from "../../components/skeletons/DigestSkeleton";
import { Trophy } from "lucide-react";

const DigestList: React.FC<DigestListProps> = (props) => {
  const userData: UserData | null = authService.getUserData();
  const user_ic = userData?.ic_number;

  const [tag, setTag] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDigests();
  }, []);

  const fetchDigests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/highlights/list?user_id=${user_ic}&notes=false&limit=100&orderby=created_at&order=desc`
      );
      if (response.data && response.data.data) {
        console.log("response.data.data", response.data.data);
        setNotes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching digests:", error);
      toast.error("Failed to fetch digests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (items: any, arr: number[]) => {
    let itemArr: any[] = [];
    arr.forEach((item) => {
      items[item] && itemArr.push(items[item]);
    });
    return itemArr;
  };

  const handleTag = (newTag: string[]) => {
    setTag(newTag);
  };

  return <Manager><div
  className="w-full h-[calc(100vh_-_75px)] overflow-hidden rounded-xl p-4"
  style={props.isCollapsed ? { width: "calc(100vw - 70px)", left: "70px" } : {}}
>
  {/* <div className="note-tags">
    <NoteTag {...{ handleTag: handleTag }} />
  </div> */}
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Trophy className="h-7 w-7" />
            </div>
            Digests
          </h1>
        </div>
  {isLoading ? (
    <DigestSkeleton />
  ) : notes.length === 0 ? (
    <Empty />
  ) : (
    <CardList {...{ cards: notes }} />
  )}
</div></Manager>;
};

export default DigestList;
