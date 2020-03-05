import { Component } from './base-component';
import { Dragable } from '../models/dragAndDropInterfaces';
import { Project } from '../models/project';
import { autoBind } from '../decorator/autoBind';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Dragable {

  get getNumOfPeople() {
    if (this.project.people > 1) {
      return `${this.project.people} people`;
    }

    return '1 person'
  }

  constructor(hostId: string, private project: Project) {
    super('single-project', hostId, false, project.id);
    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @autoBind
  dragEndHandler(_event: DragEvent) {
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  };

  renderContent() {
    this.element.querySelector('h2')!.innerHTML = this.project.title;
    this.element.querySelector('h3')!.innerHTML = this.getNumOfPeople;
    this.element.querySelector('p')!.innerHTML = this.project.description;
  };
}