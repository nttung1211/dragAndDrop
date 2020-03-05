import { Component } from './base-component';
import { validate } from '../util/validattion';
import { autoBind } from '../decorator/autoBind';
import { projectState } from '../states/project';


export class ProjectInput extends Component<HTMLElement, HTMLFormElement> {
  titleEl: HTMLInputElement;
  desciptionEl: HTMLInputElement;
  peopleEl: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    this.titleEl = this.element.querySelector('#title') as HTMLInputElement; // here must be formEl not document
    this.desciptionEl = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleEl = this.element.querySelector('#people') as HTMLInputElement;
    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() { }

  private gatherInputs(): [string, string, number] | void {
    const title = this.titleEl.value;
    const description = this.desciptionEl.value;
    const people = this.peopleEl.value;

    if (validate({ name: 'title', value: title, required: true })
      && validate({ name: 'description', value: description, required: true, minLength: 4 })
      && validate({ name: 'people', value: people, required: true, min: 1 })) {
      return [title, description, +people];
    }
  }

  private clearFields() {
    this.titleEl.value = '';
    this.desciptionEl.value = '';
    this.peopleEl.value = '';
    this.titleEl.focus();
  }

  @autoBind
  private submitHandler(e: Event) {
    e.preventDefault();
    const inputs = this.gatherInputs();

    if (inputs) {
      const [title, desciption, people] = inputs;
      projectState.addProject(title, desciption, people);
      this.clearFields();
    }
  }
}