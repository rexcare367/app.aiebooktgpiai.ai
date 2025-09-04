import { connect } from "react-redux";
import { handleReadingBook } from "../../store/actions";
import { withTranslation } from "react-i18next";
import BookCardItem from "./component";
import { stateType } from "../../store";

const mapStateToProps = (state: stateType) => {
  return {
    currentBook: state.book.currentBook,
  };
};
const actionCreator = {
  handleReadingBook,
};
export default connect(
  mapStateToProps,
  actionCreator
)(withTranslation()(BookCardItem as any) as any);
