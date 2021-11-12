import * as React from "react";
import { useState } from "react";

interface URIFormProps {
  onSubmit: (uri: string) => void;
}

export function URIForm(props: URIFormProps) {

  const [uri, setURI] = useState("");

  return (
    <form className="input-group mb-3" onSubmit={ (e) => {
      e.preventDefault();
      props.onSubmit(uri);
    }}>
      <span className="input-group-text" id="basic-addon1">URL</span>
      <input
        className="form-control"
        aria-label="Username"
        aria-describedby="basic-addon1"
        type="text"
        value={uri}
        onChange={(event => setURI(event.target.value))}
      />
      <input className="graph-explorer-btn graph-explorer-btn-primary" type="submit" value="Load remote file" />
    </form>
  );



}
