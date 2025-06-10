import { connect } from "react-redux";
import { handleSetting, handleAbout } from "../../../store/actions";
import { stateType } from "../../../store";
import UserPanelDialog from "./component";
import { withTranslation } from "react-i18next";

const mapStateToProps = (state: stateType) => {
  return {
    books: state.manager.books,
    notes: state.reader.notes,
    deletedBooks: state.manager.deletedBooks,
    isNewWarning: state.manager.isNewWarning,
  };
};
const actionCreator = {
  handleSetting,
  handleAbout,
};
export default connect(mapStateToProps, actionCreator)(withTranslation()(UserPanelDialog as any) as any);
