import React, { useState, useEffect } from "react";
import "./digestList.css";
import { DigestListProps, DigestListStates } from "./interface";
import CardList from "../cardList";
import NoteTag from "../../../components/noteTag";
import NoteModel from "../../../models/Note";
import Empty from "../../emptyPage";
import Manager from "../../../pages/manager";
import api from "../../../utils/axios";
import toast from "react-hot-toast";
import authService, { UserData } from "../../../utils/authService";

const DigestList: React.FC<DigestListProps> = (props) => {
  const userData: UserData | null = authService.getUserData();
  const user_ic = userData?.ic_number;

  const [tag, setTag] = useState<string[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchDigests();
  }, []);

  const fetchDigests = async () => {
    try {
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

  const filterTag = (digests: NoteModel[]) => {
    let temp: NoteModel[] = [];
    for (let i = 0; i < digests.length; i++) {
      let flag = false;
      for (let j = 0; j < tag.length; j++) {
        if (digests[i].tag && digests[i].tag.indexOf(tag[j]) > -1) {
          flag = true;
          break;
        }
      }
      if (flag) {
        temp.push(digests[i]);
      }
    }
    return temp;
  };

  return <Manager><div
  className="digest-list-container-parent h-[calc(100vh_-_78px)] rounded-xl"
  style={props.isCollapsed ? { width: "calc(100vw - 70px)", left: "70px" } : {}}
>
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
    <CardList {...{ cards: notes }} />
  )}
</div></Manager>;
};

export default DigestList;
