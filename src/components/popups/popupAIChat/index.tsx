import { connect } from "react-redux";
import {
  handleOpenMenu,
  handleMenuMode,
  handleNoteKey,
  handleFetchNotes,
} from "../../../store/actions";
import { stateType } from "../../../store";
import { withTranslation } from "react-i18next";
import PopupAIChat from "./component";
const mapStateToProps = (state: stateType) => {
  return {
    currentBook: state.book.currentBook,
    color: state.reader.color,
    htmlBook: state.reader.htmlBook,
  };
};
const actionCreator = {
  handleOpenMenu,
  handleMenuMode,
  handleNoteKey,
  handleFetchNotes,
};
export default connect(
  mapStateToProps,
  actionCreator
)(withTranslation()(PopupAIChat as any) as any);
