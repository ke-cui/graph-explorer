import { ClassAttributes, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import {
  DBPediaSettings,
  SparqlDataProvider,
  SparqlQueryMethod,
  Workspace,
  WorkspaceProps,
} from '../src/graph-explorer';

import {onPageLoad, saveLayoutToLocalStorage, tryLoadLayoutFromLocalStorage,} from './common';

function onWorkspaceMounted(workspace: Workspace) {
  if (!workspace) {
    return;
  }

  const diagram = tryLoadLayoutFromLocalStorage();
  workspace.getModel().importLayout({
    diagram,
    validateLinks: true,
    dataProvider: new SparqlDataProvider(
      {
        endpointUrl: 'https://dbpedia.org/sparql',
        imagePropertyUris: [
          'http://xmlns.com/foaf/0.1/depiction',
          'http://xmlns.com/foaf/0.1/img',
        ],
        queryMethod: SparqlQueryMethod.GET,
      },
      {...DBPediaSettings,
      ...{
        classTreeQuery: `
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX owl:  <http://www.w3.org/2002/07/owl#>

          SELECT distinct ?class ?label ?parent WHERE {
            ?class a owl:Class.
            ?class rdfs:label ?label.
            OPTIONAL {?class rdfs:subClassOf ?parent}
          }`
        }
      }
    ),
  });
}

const props: WorkspaceProps & ClassAttributes<Workspace> = {
  ref: onWorkspaceMounted,
  onSaveDiagram: (workspace) => {
    const diagram = workspace.getModel().exportLayout();
    window.location.hash = saveLayoutToLocalStorage(diagram);
    window.location.reload();
  },
  viewOptions: {
    onIriClick: ({ iri }) => window.open(iri),
  },
};

onPageLoad((container) => {
  const root = createRoot(container!);
  root.render(createElement(Workspace, props));
});
