import React from "react";
import ReactDOM from "react-dom";
import "./assets/styles/reset.css";
import "./assets/styles/global.css";
import "./assets/styles/style.css";
import { Provider } from "react-redux";
import "./i18n";
import store from "./store";
import App from "./app";
// import Router from "./router"
import StyleUtil from "./utils/readUtils/styleUtil";
// import { dropdownList } from "./constants/dropdownList";
// import StorageUtil from "./utils/serviceUtils/storageUtil";
import "./index.css";
import { initSystemFont, initTheme } from "./utils/serviceUtils/launchUtil";
initTheme();
initSystemFont();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
StyleUtil.applyTheme();
