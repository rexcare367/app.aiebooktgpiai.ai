import { connect } from "react-redux";
import { handleSetting, handleAbout } from "../../../store/actions";
import { stateType } from "../../../store";
import ChatbotDialog from "./component";
import { withTranslation } from "react-i18next";

const mapStateToProps = (state: stateType) => {
  return {
    books: state.manager.books,
    notes: state.reader.notes,
    deletedBooks: state.manager.deletedBooks,
  };
};
const actionCreator = {
  handleSetting,
  handleAbout,
};
export default connect(
  mapStateToProps,
  actionCreator
)(withTranslation()(ChatbotDialog as any) as any);
