import React, { useState, useEffect } from "react";
import "./noteList.css";
import { NoteListProps } from "./interface";
import CardList from "../cardList";
import NoteTag from "../../../components/noteTag";
import Empty from "../../emptyPage";
import Manager from "../../../pages/manager";

import api from "../../../utils/axios";
import toast from "react-hot-toast";
import authService, { UserData } from "../../../utils/authService";

const NoteList: React.FC<NoteListProps> = (props) => {
  const userData: UserData | null = authService.getUserData();
  const userId = userData?.id;
  const userIc = userData?.ic_number;

  const [tag, setTag] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
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
    }
  };

  const handleTag = (newTag: string[]) => {
    setTag(newTag);
  };

  const noteListContent = (
    <div className="note-list-container-parent h-[calc(100vh_-_78px)] bg-white rounded-xl">
      <div className="note-tags">
        <NoteTag {...{ handleTag: handleTag }} />
      </div>
      {notes.length === 0 ? (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        >
          {tag.length === 0 && <Empty />}
        </div>
      ) : (
        <CardList {...{ cards: notes, mode: "note" }} />
      )}
    </div>
  );

  return <Manager>{noteListContent}</Manager>;
};

export default NoteList;
