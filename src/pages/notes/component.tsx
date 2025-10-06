import React, { useState, useEffect } from "react";
import { NoteListProps } from "./interface";
import CardList from "../cardList";
  import NoteTag from "../../components/noteTag";
import Empty from "../emptyPage";
import Manager from "../../pages/manager";

import api from "../../utils/axios";
import toast from "react-hot-toast";
import authService, { UserData } from "../../utils/authService";
import NoteSkeleton from "../../components/skeletons/NoteSkeleton";
import { NotebookPen } from "lucide-react";

const NoteList: React.FC<NoteListProps> = (props) => {
  const userData: UserData | null = authService.getUserData();
  const userId = userData?.id;
  const userIc = userData?.ic_number;

  const [tag, setTag] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/highlights/list?user_id=${userIc}&notes=true&limit=100&orderby=created_at&order=desc`
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

  const handleTag = (newTag: string[]) => {
    setTag(newTag);
  };

  const noteListContent = (
    <div className="p-4 overflow-auto">
      {/* <div className="note-tags">
        <NoteTag {...{ handleTag: handleTag }} />
      </div> */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
              <NotebookPen className="h-7 w-7" />
            </div>
            Notes
          </h1>
        </div>
      {isLoading ? (
        <NoteSkeleton />
      ) : notes.length === 0 ? 
        <Empty />
       : (
        <CardList {...{ cards: notes, mode: "note" }} />
      )}
    </div>
  );

  return <Manager>{noteListContent}</Manager>;
};

export default NoteList;
