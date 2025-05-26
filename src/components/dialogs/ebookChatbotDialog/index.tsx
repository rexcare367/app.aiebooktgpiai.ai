import { connect, ConnectedProps } from "react-redux";
import { handleSetting, handleAbout } from "../../../store/actions";
import { stateType } from "../../../store";
import EbookChatbotDialog from "./component";
import { withTranslation } from "react-i18next";
import { WithTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router-dom";

// Define the state props interface
interface StateProps {
  books: any[];
  notes: any[];
  deletedBooks: any[];
}

// Define the dispatch props interface
interface DispatchProps {
  handleSetting: () => void;
  handleAbout: () => void;
}

const mapStateToProps = (state: stateType) => ({
  books: state.manager.books,
  notes: state.reader.notes,
  deletedBooks: state.manager.deletedBooks,
});

const mapDispatchToProps = {
  handleSetting,
  handleAbout,
};

// Create connector with proper types
const connector = connect(mapStateToProps, mapDispatchToProps);

// Infer combined props type from connector
type PropsFromRedux = ConnectedProps<typeof connector>;

// Combine all props
type Props = PropsFromRedux & RouteComponentProps & WithTranslation;

// Export connected component with proper type annotations
export default connector(withTranslation()(EbookChatbotDialog as React.ComponentType<Props>));
