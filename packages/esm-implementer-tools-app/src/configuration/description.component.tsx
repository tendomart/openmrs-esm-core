import React from "react";
import { useStore } from "../store";
import styles from "./description.styles.css";

export function Description() {
  const { activeItemDescription } = useStore("activeItemDescription");
  return (
    <div className={styles.container}>
      {activeItemDescription ? (
        <>
          <p className={styles.path}>
            {activeItemDescription.path.slice(1).join(" → ")}
          </p>
          <p className={styles.description}>
            {activeItemDescription.description}
          </p>
          <p className={styles.source}>
            {activeItemDescription.source ? <>Source:</> : null}{" "}
            {activeItemDescription.source}
          </p>
          <p className={styles.value}>
            {Array.isArray(activeItemDescription.value)
              ? activeItemDescription.value.map((v) => <p key={v}>{v}</p>)
              : activeItemDescription.value}
          </p>
        </>
      ) : null}
    </div>
  );
}
