import React, { useEffect, useState } from "react";
import { connect, Provider } from "unistore/react";
import { getIsUIEditorEnabled } from "@openmrs/esm-extensions";
import { UserHasAccess } from "@openmrs/esm-react-utils";
import Popup from "./popup/popup.component";
import styles from "./implementer-tools.styles.css";
import "./backend-dependencies/openmrs-backend-dependencies";
import { getStore } from "./store";
import { UiEditor } from "./ui-editor/ui-editor";

export default function ImplementerTools() {
  const store = getStore();

  return (
    <UserHasAccess privilege="coreapps.systemAdministration">
      <Provider store={store}>
        <PopupHandler />
      </Provider>
    </UserHasAccess>
  );
}

const PopupHandler = connect("isOpen")(({ isOpen }) => {
  const [hasAlert, setHasAlert] = useState(false);
  const isUIEditorActive = getIsUIEditorEnabled();

  function togglePopup() {
    getStore().setState({ isOpen: !isOpen });
  }

  return (
    <>
      <button
        tabIndex={0}
        onClick={togglePopup}
        className={`${styles.popupTriggerButton} ${
          hasAlert ? styles.triggerButtonAlert : ""
        }`}
      />
      {isOpen ? <Popup close={togglePopup} setHasAlert={setHasAlert} /> : null}
      {isUIEditorActive ? <UiEditor /> : null}
    </>
  );
});
