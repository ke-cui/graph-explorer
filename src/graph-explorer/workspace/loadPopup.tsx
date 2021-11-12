import Popup from "reactjs-popup";
import { URIForm } from "./inputForm";
import { CustomDropzone } from "./customDropzone";
import * as React from "react";

interface LoadPopupProps {
  onFetchDiagram(uri: string): void;
  onDropAccepted(file: File): void;
}

export function LoadPopup(props: LoadPopupProps) {

  return (
    <Popup trigger={
      <button type="button" className="saveDiagramButton graph-explorer-btn graph-explorer-btn-primary button">
        <span className="fa fa-upload" aria-hidden="true"/> Load file
      </button>} modal nested>
      <URIForm onSubmit={props.onFetchDiagram} />
      <CustomDropzone onDropAccepted={props.onDropAccepted} />
    </Popup>
  );

}
