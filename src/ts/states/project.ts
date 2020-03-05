import { Project, ProjectStatus } from '../models/project';


type Listener<T> = (items: T[]) => void;

class State<U> {
  protected listeners: Listener<U>[] = [];

  addListener(func: Listener<U>) {
    this.listeners.push(func);
  }
}


// ========== STATE ============
export class ProjectState extends State<Project>{
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
    const newProject = new Project(
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

export const projectState = ProjectState.getInstance();