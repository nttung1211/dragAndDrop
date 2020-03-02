"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../css/app.scss");
function autoBind(_target, _method, descriptor) {
    const originalMethod = descriptor.value;
    descriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return descriptor;
}
function validate(validateObj) {
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
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    ;
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProjectState;
        }
        return this.instance;
    }
    addListener(func) {
        this.listeners.push(func);
    }
    addProject(title, desciption, people) {
        const newProject = new Project(Math.ceil(Math.random() * 100).toString(), title, desciption, people, ProjectStatus.Active);
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
    constructor(type) {
        this.type = type;
        this.templateEl = document.querySelector('#project-list');
        this.hostEl = document.querySelector('#app');
        this.renderedProjects = [];
        this.projectsEl = document.importNode(this.templateEl.content, true).firstElementChild;
        this.projectsEl.id = `${this.type}-projects`;
        projectState.addListener((projects) => {
            this.renderedProjects = projects;
            this.renderProject();
        });
        this.renderContent();
        this.attach();
    }
    renderProject() {
        this.renderedProjects.forEach(project => {
            this.projectsEl.querySelector(`#${this.type}-projects-list`).innerHTML += `<li>${project.title}</li>`;
        });
    }
    renderContent() {
        this.projectsEl.querySelector('ul').id = `${this.type}-projects-list`;
        this.projectsEl.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    attach() {
        this.hostEl.insertAdjacentElement('beforeend', this.projectsEl);
    }
}
class ProjectInput {
    constructor() {
        this.templateEl = document.querySelector('#project-input');
        this.hostEl = document.querySelector('#app');
        this.formEl = document.importNode(this.templateEl.content, true).firstElementChild;
        this.formEl.id = 'user-input';
        this.titleEl = this.formEl.querySelector('#title');
        this.desciptionEl = this.formEl.querySelector('#description');
        this.peopleEl = this.formEl.querySelector('#people');
        this.configure();
        this.attach();
    }
    configure() {
        this.formEl.addEventListener('submit', this.submitHandler);
    }
    gatherInputs() {
        const title = this.titleEl.value;
        const description = this.desciptionEl.value;
        const people = this.peopleEl.value;
        if (validate({ name: 'title', value: title, required: true })
            && validate({ name: 'description', value: description, required: true, minLength: 4 })
            && validate({ name: 'people', value: people, required: true, min: 2 })) {
            return [title, description, +people];
        }
    }
    clearFields() {
        this.titleEl.value = '';
        this.desciptionEl.value = '';
        this.peopleEl.value = '';
    }
    submitHandler(e) {
        e.preventDefault();
        const inputs = this.gatherInputs();
        if (inputs) {
            const [title, desciption, people] = inputs;
            projectState.addProject(title, desciption, people);
            projectState.showProjects();
            this.clearFields();
        }
    }
    attach() {
        this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
    }
}
__decorate([
    autoBind
], ProjectInput.prototype, "submitHandler", null);
const newProjectInput = new ProjectInput();
const newActiveProjectList = new ProjectList('active');
const newFinishedProjectList = new ProjectList('finished');
