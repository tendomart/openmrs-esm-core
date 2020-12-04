import React, { useEffect, useState } from "react";
import {
  ExtensionSlotInfo,
  ExtensionInfo,
  extensionStore,
} from "@openmrs/esm-extensions";
import { createPortal } from "react-dom";
import { Provider, connect } from "unistore/react";
import styles from "./styles.css";

export function UiEditor() {
  return (
    <Provider store={extensionStore}>
      <Overlays />
    </Provider>
  );
}

const Overlays = connect(["slots", "extensions"])(
  ({
    slots,
    extensions,
  }: {
    slots: Record<string, ExtensionSlotInfo>;
    extensions: Record<string, ExtensionInfo>;
  }) => {
    return (
      <>
        {Object.entries(slots).map(([slotName, slotInfo]) =>
          Object.entries(slotInfo.instances).map(
            ([slotModuleName, slotInstance]) => (
              <Portal
                key={`slot-overlay-${slotModuleName}-${slotName}`}
                el={slotInstance.domElement}
              >
                <SlotOverlay slotName={slotName} />
              </Portal>
            )
          )
        )}
        {Object.entries(extensions).map(([extensionName, extensionInfo]) =>
          Object.entries(extensionInfo.instances).map(
            ([slotModuleName, bySlotName]) =>
              Object.entries(bySlotName).map(
                ([slotName, extensionInstance]) => (
                  <Portal
                    key={`extension-overlay-${slotModuleName}-${slotName}-${extensionName}`}
                    el={extensionInstance.domElement}
                  >
                    <ExtensionOverlay />
                  </Portal>
                )
              )
          )
        )}
      </>
    );
  }
);

export function Portal({ el, children }) {
  return el ? createPortal(children, el) : null;
}

export function SlotOverlay({ slotName }) {
  return (
    <>
      <div className={styles.slotOverlay}></div>
      <div className={styles.slotName}>{slotName}</div>
    </>
  );
}

function ExtensionOverlay() {
  return <div>You!</div>;
}
