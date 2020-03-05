import { Component } from './base-component';
import { DragTarget } from '../models/dragAndDropInterfaces';
import { autoBind } from '../decorator/autoBind';
import { projectState } from '../states/project';
import { Project, ProjectStatus } from '../models/project';
import { ProjectItem } from '../components/project-item';

export class ProjectList extends Component<HTMLElement, HTMLElement> implements DragTarget {
  renderedProjects: Project[];
  listEl: HTMLElement;

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.listEl = (<HTMLElement>this.element.querySelector(`ul`));
    this.listEl.id = `${this.type}-projects-list`;
    this.renderedProjects = [];
    this.configure();
    this.renderContent();
  }

  // DRAG METHODS
  @autoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault(); // by default js does not allow to drop
      this.listEl.classList.add('droppable');
    }
  }

  @autoBind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer?.getData('text/plain');
    if (projectId) {
      projectState.moveProject(projectId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    this.listEl.classList.remove('droppable');
  }

  @autoBind
  dragLeaveHandler(_event: DragEvent) {
    this.listEl.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
      this.renderedProjects = projects.filter(pro => {
        if (this.type === 'active') {
          return pro.status === ProjectStatus.Active;
        }

        return pro.status === ProjectStatus.Finished;
      });

      this.renderProject();
    })
  }

  renderContent() {
    (<HTMLElement>this.element.querySelector('h2')).textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProject() {
    this.listEl.innerHTML = '';

    this.renderedProjects.forEach(project => {
      new ProjectItem(this.listEl.id, project)
    })
  }
}