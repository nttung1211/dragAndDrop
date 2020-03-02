import '../css/app.scss';


// autoBind decorator
function autoBind(_target: any, _method: String, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    }
  }

  return descriptor;
}

interface ValidateObj {
  name: string,
  value: string,
  required?: boolean,
  minLength?: number,
  min?: number
}

function validate(validateObj: ValidateObj) {
  let isValid = true;

  if (validateObj.required) {
    isValid = validateObj.value.trim().length !== 0 ? true : false;
  }

  if (validateObj.minLength !== undefined) {
    isValid = validateObj.minLength <= validateObj.value.trim().length ? true : false;
  }

  if (validateObj.min !== undefined && validateObj.min >= 0) {
    isValid = validateObj.min <= +validateObj.value ? true : false;
  }

  if (isValid) {
    return true;
  }

  alert(`${validateObj.name} is invalid!!!`);
}

class ProjectState {
  private listeners: any[] = [];

  private projects: any[] = [];

  private constructor() {};

  private static instance: ProjectState;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState;
    }
    
    return this.instance;
  }

  addListener(func: Function) {
    this.listeners.push(func);
  }

  addProject(title: string, desciption: string, people: number) {
    const newProject = {
      id: Math.ceil(Math.random() * 100),
      title,
      desciption,
      people
    }

    this.projects.push(newProject);

    this.listeners.forEach(listener => {
      listener(this.projects);
    });
  }

  showProjects() {
    console.log(this.projects);
  }
}

const projectState = ProjectState.getInstance();

class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLElement;
  projectsEl: HTMLElement;
  renderedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateEl = document.querySelector('#project-list') as HTMLTemplateElement;
    this.hostEl = document.querySelector('#app') as HTMLElement;
    this.renderedProjects = [];
    this.projectsEl = document.importNode(this.templateEl.content, true).firstElementChild as HTMLElement;
    this.projectsEl.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.renderedProjects = projects;
      this.renderProject();
    })

    this.renderContent();
    this.attach();
  }

  private renderProject() {
    this.renderedProjects.forEach(project => {
      (<HTMLElement>this.projectsEl.querySelector(`#${this.type}-projects-list`)).innerHTML += `<li>${project.title}</li>`;
    })
  }

  private renderContent() {
    (<HTMLElement>this.projectsEl.querySelector('ul')).id = `${this.type}-projects-list`;
    (<HTMLElement>this.projectsEl.querySelector('h2')).textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostEl.insertAdjacentElement('beforeend', this.projectsEl);
  }
}

class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLElement;
  formEl: HTMLElement;
  titleEl: HTMLInputElement;
  desciptionEl: HTMLInputElement;
  peopleEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.querySelector('#project-input') as HTMLTemplateElement;
    this.hostEl = document.querySelector('#app') as HTMLElement;
    this.formEl = document.importNode(this.templateEl.content, true).firstElementChild as HTMLElement;
    // this.renderedEl = this.templateEl.content.firstElementChild as HTMLElement;
    this.formEl.id = 'user-input';
    this.titleEl = this.formEl.querySelector('#title') as HTMLInputElement; // here must be formEl not document
    this.desciptionEl = this.formEl.querySelector('#description') as HTMLInputElement;
    this.peopleEl = this.formEl.querySelector('#people') as HTMLInputElement;
    this.configure();
    this.attach();
  }

  private configure() {
    this.formEl.addEventListener('submit', this.submitHandler);
  }

  private gatherInputs(): [string, string, number] | void {
    const title = this.titleEl.value;
    const description = this.desciptionEl.value;
    const people = this.peopleEl.value;

    if (validate({ name: 'title', value: title, required: true })
      && validate({ name: 'description', value: description, required: true, minLength: 4 })
      && validate({ name: 'people', value: people, required: true, min: 2 })) {
      return [title, description, +people];
    }
  }

  private clearFields() {
    this.titleEl.value = '';
    this.desciptionEl.value = '';
    this.peopleEl.value = '';
  }


  @autoBind
  private submitHandler(e: Event) {
    e.preventDefault();
    const inputs = this.gatherInputs();
    if (inputs) {
      const [title, desciption, people] = inputs;
      projectState.addProject(title, desciption, people);
      projectState.showProjects();
      this.clearFields();
    }
  }

  private attach() {
    this.hostEl.insertAdjacentElement('afterbegin', this.formEl)
  }
}

const newProjectInput = new ProjectInput();
const newActiveProjectList = new ProjectList('active');
const newFinishedProjectList = new ProjectList('finished');
