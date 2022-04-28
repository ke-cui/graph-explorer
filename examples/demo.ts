import { createElement, ClassAttributes } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Workspace,
  WorkspaceProps,
  DemoDataProvider,
} from '../src/graph-explorer';

import {
  onPageLoad,
  tryLoadLayoutFromLocalStorage,
  saveLayoutToLocalStorage,
} from './common';

const CLASSES = require('./resources/classes.json');
const LINK_TYPES = require('./resources/linkTypes.json');
const ELEMENTS = require('./resources/elements.json');
const LINKS = require('./resources/links.json');

function onWorkspaceMounted(workspace: Workspace) {
  if (!workspace) {
    return;
  }

  const diagram = tryLoadLayoutFromLocalStorage();
  workspace.getModel().importLayout({
    diagram,
    dataProvider: new DemoDataProvider(CLASSES, LINK_TYPES, ELEMENTS, LINKS),
    validateLinks: true,
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
