import React, { useCallback, useEffect, useState } from "react";
import {
  ExtensionSlotInfo,
  ExtensionInfo,
  extensionStore,
  ExtensionStore,
} from "@openmrs/esm-extensions";
import { createPortal } from "react-dom";
import { Provider, connect } from "unistore/react";
import { cloneDeep, set } from "lodash-es";
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
    const [
      extensionOverlayDomElements,
      setExtensionOverlayDomElements,
    ] = useState<Record<string, Record<string, Record<string, HTMLElement>>>>(
      {}
    );

    const [observers, setObservers] = useState<Array<MutationObserver>>([]);

    // Create the DOM nodes for the extension overlays to attach to
    const forceUpdateIfNoNode = useCallback(([extensionName, slotModuleName, slotName]) => {
        return function(mutationsList, observer) {
          for (let mutation of mutationsList) {
            console.log(mutation);
            if (mutation.removedNodes.length) {
              const extensionInstance = extensionStore.getState().extensions[extensionName]?.[slotModuleName]?.[slotName];
              console.log(extensionName, slotModuleName, slotName, mutation.removedNodes[0], extensionOverlayDomElements, extensionInstance);
              if (extensionInstance) {
                const newDomElement = document.createElement("div");
                const newObserver = new MutationObserver(forceUpdateIfNoNode([extensionName, slotModuleName, slotName]));
                newObserver.observe(newDomElement, { childList: true });
                setObservers(observers => [...observers, newObserver]);
                extensionInstance.domElement.parentElement?.appendChild(
                  newDomElement
                );
                set(
                  cloneDeep(extensionOverlayDomElements),
                  [extensionName, slotModuleName, slotName],
                  newDomElement
                );
              }
              observer.disconnect();
            } 
          }
        }
      }
    , [extensionOverlayDomElements]);

    useEffect(() => {
      function update({ extensions }: ExtensionStore) {
        const newExtensionOverlayDomElements = cloneDeep(
          extensionOverlayDomElements
        );
        for (let [extensionName, extensionInfo] of Object.entries(extensions)) {
          for (let [slotModuleName, bySlotName] of Object.entries(
            extensionInfo.instances
          )) {
            for (let [slotName, extensionInstance] of Object.entries(
              bySlotName
            )) {
              const newDomElement = document.createElement("div");
              const observer = new MutationObserver(forceUpdateIfNoNode([extensionName, slotModuleName, slotName]));
              observer.observe(newDomElement, { childList: true });
              observers.push(observer);
              extensionInstance.domElement.parentElement?.appendChild(
                newDomElement
              );
              set(
                newExtensionOverlayDomElements,
                [extensionName, slotModuleName, slotName],
                newDomElement
              );
            }
          }
        }
        setExtensionOverlayDomElements(newExtensionOverlayDomElements);
      }
      update(extensionStore.getState());
      extensionStore.subscribe(update);
      () => observers.forEach(o => o.disconnect());
    }, []);

    console.log(extensionOverlayDomElements);

    return (
      <>
        {slots ? Object.entries(slots).map(([slotName, slotInfo]) =>
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
        ) : null}
        {extensions ? Object.entries(extensions).map(([extensionName, extensionInfo]) =>
          Object.entries(extensionInfo.instances).map(
            ([slotModuleName, bySlotName]) =>
              Object.entries(bySlotName).map(
                ([slotName, extensionInstance]) => {
                  const overlayDomNode =
                    extensionOverlayDomElements[extensionName]?.[
                      slotModuleName
                    ]?.[slotName];
                  return overlayDomNode ? (
                    <Portal
                      key={`extension-overlay-${slotModuleName}-${slotName}-${extensionName}`}
                      el={overlayDomNode}
                    >
                      <ExtensionOverlay extensionId={extensionName} />
                    </Portal>
                  ) : null;
                }
              )
          )
        ) : null }
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

function ExtensionOverlay({ extensionId }) {
  return (
    <button className={styles.extensionOverlay}>
      <span className={styles.extensionTooltip}>{extensionId}</span>
    </button>
  );
}
