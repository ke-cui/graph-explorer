import { createElement, ClassAttributes } from 'react';
import {createRoot} from "react-dom/client";

import {
  Workspace,
  WorkspaceProps,
  SparqlDataProvider,
  WikidataSettings,
  SparqlQueryMethod,
  PropertySuggestionParams,
  PropertyScore,
} from '../src/graph-explorer';

import {
  onPageLoad,
  tryLoadLayoutFromLocalStorage,
  saveLayoutToLocalStorage,
} from './common';

const WIKIDATA_PREFIX = 'http://www.wikidata.org/prop/direct/';

let workspace: Workspace;

function getElementLabel(id: string): string {
  const model = workspace.getModel();
  const view = workspace.getDiagram();
  const element = model.getElement(id);
  return element
    ? view.formatLabel(element.data.label.values, element.iri)
    : '';
}

function wikidataSuggestProperties(params: PropertySuggestionParams) {
  const idMap: { [id: string]: string } = {};

  const properties = params.properties.map((id) => {
    let resultID;
    if (id.startsWith(WIKIDATA_PREFIX)) {
      resultID = id.substr(WIKIDATA_PREFIX.length, id.length);
    } else {
      resultID = id;
    }
    idMap[resultID] = id;
    return resultID;
  });
  const term = params.token.toLowerCase() || getElementLabel(params.elementId);
  const requestBody = {
    threshold: 0.1,
    term,
    // eslint-disable-next-line @typescript-eslint/camelcase
    instance_properties: properties,
  };
  return fetch('/wikidata-prop-suggest', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    credentials: 'same-origin',
    mode: 'cors',
    cache: 'default',
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        const error = new Error(response.statusText);
        (error as any).response = response;
        throw error;
      }
    })
    .then((json) => {
      const dictionary: { [id: string]: PropertyScore } = {};
      for (const scoredItem of json.data) {
        const propertyIri = idMap[scoredItem.id];
        const item = dictionary[propertyIri];

        if (item && item.score > scoredItem.value) {
          continue;
        }

        dictionary[propertyIri] = { propertyIri, score: scoredItem.value };
      }

      Object.keys(idMap).forEach((key) => {
        const propertyIri = idMap[key];

        if (dictionary[propertyIri]) {
          return;
        }

        dictionary[propertyIri] = { propertyIri, score: 0 };
      });

      return dictionary;
    });
}

function onWorkspaceMounted(wspace: Workspace) {
  if (!wspace) {
    return;
  }

  workspace = wspace;

  const diagram = tryLoadLayoutFromLocalStorage();
  const dataProvider = new SparqlDataProvider(
    {
      endpointUrl: 'https://query.wikidata.org/bigdata/namespace/wdq/sparql',
      imagePropertyUris: [
        'http://www.wikidata.org/prop/direct/P18',
        'http://www.wikidata.org/prop/direct/P154',
      ],
    },
    WikidataSettings
  );

  workspace
    .getModel()
    .importLayout({ diagram, dataProvider, validateLinks: true });
}

const props: WorkspaceProps & ClassAttributes<Workspace> = {
  ref: onWorkspaceMounted,
  onSaveDiagram: (self) => {
    const diagram = self.getModel().exportLayout();
    window.location.hash = saveLayoutToLocalStorage(diagram);
    window.location.reload();
  },
  viewOptions: {
    suggestProperties: wikidataSuggestProperties,
    onIriClick: ({ iri }) => window.open(iri),
  },
};

onPageLoad((container) => {
  const root = createRoot(container!);
  root.render(createElement(Workspace, props));
});
