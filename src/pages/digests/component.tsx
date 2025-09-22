import React, { useState, useEffect } from "react";
import "./digestList.css";
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

  console.log('notes', notes)

  return <Manager><div
  className="digest-list-container-parent h-[calc(100vh_-_78px)] rounded-xl"
  style={props.isCollapsed ? { width: "calc(100vw - 70px)", left: "70px" } : {}}
>
  <div className="note-tags">
    <NoteTag {...{ handleTag: handleTag }} />
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
