import React, { useEffect } from "react";
import { Route, Switch, HashRouter } from "react-router-dom";
import AuthContainer from "../components/auth/AuthContainer";
import HtmlReader from "../pages/htmlReader";
import PDFReader from "../pages/pdfReader";
import _Redirect from "../pages/redirect";
import i18n from "../i18n";
import StorageUtil from "../utils/serviceUtils/storageUtil";
import { routes } from "./routes";
import { AuthGuard } from "../components/auth/AuthGuard";

const Router = () => {
  useEffect(() => {
    const lng = StorageUtil.getReaderConfig("lang");

    if (lng) {
      //Compatile with 1.6.0 and older
      if (lng === "zh") {
        i18n.changeLanguage("zhCN");
      } else if (lng === "cht") {
        i18n.changeLanguage("zhTW");
      } else {
        i18n.changeLanguage(lng);
      }
    } else {
      if (navigator.language === "zh-CN" || navigator.language === "zh-SG") {
        i18n.changeLanguage("zhCN");
        StorageUtil.setReaderConfig("lang", "zhCN");
      } else if (navigator.language === "zh-TW" || navigator.language === "zh-HK") {
        i18n.changeLanguage("zhTW");
        StorageUtil.setReaderConfig("lang", "zhTW");
      } else if (navigator.language === "zh-MO") {
        i18n.changeLanguage("zhMO");
        StorageUtil.setReaderConfig("lang", "zhMO");
      } else if (navigator.language.startsWith("ro")) {
        i18n.changeLanguage("ro");
        StorageUtil.setReaderConfig("lang", "ro");
      }  else if (navigator.language.startsWith("pl")) {
        i18n.changeLanguage("pl");
        StorageUtil.setReaderConfig("lang", "pl");
      } else {
        i18n.changeLanguage("en");
        StorageUtil.setReaderConfig("lang", "en");
      }
    }
  }, []);
  return (
    <HashRouter>
      <Switch>
        {/* Protected routes - require authentication */}
        {routes.map((ele) => (
          <AuthGuard component={ele.component} key={ele.path} path={`${ele.path}`} fallbackPath="/" />
        ))}

        {/* Public routes - no authentication required */}
        <Route path="/login" render={() => <AuthContainer initialView="login" />} />
        <Route path="/register" render={() => <AuthContainer initialView="signup" />} />
        <Route path="/forgot-password" render={() => <AuthContainer initialView="forgot" />} />
        <Route component={HtmlReader} path="/epub" />
        <Route component={HtmlReader} path="/mobi" />
        <Route component={HtmlReader} path="/cbr" />
        <Route component={HtmlReader} path="/cbt" />
        <Route component={HtmlReader} path="/cbz" />
        <Route component={HtmlReader} path="/cb7" />
        <Route component={HtmlReader} path="/azw3" />
        <Route component={HtmlReader} path="/azw" />
        <Route component={HtmlReader} path="/txt" />
        <Route component={HtmlReader} path="/docx" />
        <Route component={HtmlReader} path="/md" />
        <Route component={HtmlReader} path="/fb2" />
        <Route component={HtmlReader} path="/html" />
        <Route component={HtmlReader} path="/htm" />
        <Route component={HtmlReader} path="/xml" />
        <Route component={HtmlReader} path="/xhtml" />
        <Route component={HtmlReader} path="/mhtml" />
        <Route component={HtmlReader} path="/href" />
        <Route component={PDFReader} path="/pdf" />
        <Route component={_Redirect} path="/" />
      </Switch>
    </HashRouter>
  );
};

export default Router;
