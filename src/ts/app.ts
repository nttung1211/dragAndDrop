import '../css/app.scss'; 
import { ProjectInput } from './components/project-input';
import { ProjectList } from './components/project-list';

// <reference path = "interfaces.ts"/> 
//npm install @types/source-map@0.5.2 need to be done for namespace

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');
