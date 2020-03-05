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


interface Dragable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent):void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus { Active, Finished }

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<U> {
  protected listeners: Listener<U>[] = [];

  addListener(func: Listener<U>) {
    this.listeners.push(func);
  }
}


// ========== STATE ============
class ProjectState extends State<Project>{
  private projects: Project[] = [];

  private constructor() {
    super();
  };

  private static instance: ProjectState;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState;
    }
    
    return this.instance;
  }

  addProject(title: string, desciption: string, people: number) {
    const newProject = new Project (
      Math.ceil(Math.random() * 100).toString(),
      title,
      desciption,
      people,
      ProjectStatus.Active
    )

    this.projects.push(newProject);

    this.triggerListeners();
  }

  moveProject(id: string, newStatus: ProjectStatus) {
    this.projects.forEach(pro => {
      if (id === pro.id && pro.status !== newStatus) {
        pro.status = newStatus;
        this.triggerListeners();
      }
    })
  }
  
  private triggerListeners() {
    this.listeners.forEach(listener => {
      listener(this.projects);
    });
  }
}

const projectState = ProjectState.getInstance();


//========= COMPONENT ==========
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(templateId: string, hostId: string, insertAtStart: boolean, elementId?: string) {
    this.templateEl = document.getElementById(templateId) as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostId) as T;
    this.element = document.importNode(this.templateEl.content, true).firstElementChild as U;
    // this.element = this.templateEl.content.firstElementChild as HTMLElement;
    if (elementId) {
      this.element.id = elementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostEl.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}


//========== PROJECT ITEM ===========
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Dragable {
  
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

//========= PROJECT LIST ===========
class ProjectList extends Component<HTMLElement, HTMLElement> implements DragTarget{
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
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain' ) {
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

class ProjectInput extends Component<HTMLElement, HTMLFormElement> {
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

  renderContent() {}

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

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');
