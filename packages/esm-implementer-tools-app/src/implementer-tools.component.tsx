import React, { useEffect, useState } from "react";
import { Provider } from "unistore/react";
import { UserHasAccess } from "@openmrs/esm-react-utils";
import Popup from "./popup/popup.component";
import styles from "./implementer-tools.styles.css";
import "./backend-dependencies/openmrs-backend-dependencies";
import { getStore, useStore } from "./store";
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

function PopupHandler() {
  const [hasAlert, setHasAlert] = useState(false);
  const { isOpen, isUIEditorEnabled } = useStore([
    "isOpen",
    "isUIEditorEnabled",
  ]);

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
      {isUIEditorEnabled ? <UiEditor /> : null}
    </>
  );
}
