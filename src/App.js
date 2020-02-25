import React, { useState } from "react";
import "./styles.css";

import oldData from "./source.json";

import { cloneDeep } from "lodash";
import migrateOldData from "./migration";

export default () => {
  const [migrated, setMigrated] = useState(migrateOldData(cloneDeep(oldData)));

  const handleSourceChange = event => {
    const parsed = JSON.parse(event.target.innerHTML);
    setMigrated(migrateOldData(parsed));
  };

  return (
    <div className="App">
      <h1>Convert draft-js to slate raw data</h1>
      <p>
        This example converts raw data from the{" "}
        <code>draft-js-plugins-editor</code> into useable data for the{" "}
        <code>slate</code> RTE example.
      </p>
      <blockquote>
        Please note that I use a modified RTE example, this will not be 100%
        accurate for you!
      </blockquote>
      <table>
        <tbody>
          <tr>
            <td width="50%" valign="top">
              <pre
                contentEditable
                suppressContentEditableWarning
                onInput={handleSourceChange}
              >
                {JSON.stringify(oldData, null, 2)}
              </pre>
            </td>
            <td width="50%" valign="top">
              <pre>{JSON.stringify(migrated, null, 2)}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
