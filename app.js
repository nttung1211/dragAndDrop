"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("src/scripts/app", ["require", "exports", "../css/app.scss"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App;
    (function (App) {
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
        let ProjectStatus;
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
        class State {
            constructor() {
                this.listeners = [];
            }
            addListener(func) {
                this.listeners.push(func);
            }
        }
        class ProjectState extends State {
            constructor() {
                super();
                this.projects = [];
            }
            ;
            static getInstance() {
                if (!this.instance) {
                    this.instance = new ProjectState;
                }
                return this.instance;
            }
            addProject(title, desciption, people) {
                const newProject = new Project(Math.ceil(Math.random() * 100).toString(), title, desciption, people, ProjectStatus.Active);
                this.projects.push(newProject);
                this.triggerListeners();
            }
            moveProject(id, newStatus) {
                this.projects.forEach(pro => {
                    if (id === pro.id && pro.status !== newStatus) {
                        pro.status = newStatus;
                        this.triggerListeners();
                    }
                });
            }
            triggerListeners() {
                this.listeners.forEach(listener => {
                    listener(this.projects);
                });
            }
        }
        const projectState = ProjectState.getInstance();
        class Component {
            constructor(templateId, hostId, insertAtStart, elementId) {
                this.templateEl = document.getElementById(templateId);
                this.hostEl = document.getElementById(hostId);
                this.element = document.importNode(this.templateEl.content, true).firstElementChild;
                if (elementId) {
                    this.element.id = elementId;
                }
                this.attach(insertAtStart);
            }
            attach(insertAtStart) {
                this.hostEl.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
            }
        }
        class ProjectItem extends Component {
            constructor(hostId, project) {
                super('single-project', hostId, false, project.id);
                this.project = project;
                this.configure();
                this.renderContent();
            }
            get getNumOfPeople() {
                if (this.project.people > 1) {
                    return `${this.project.people} people`;
                }
                return '1 person';
            }
            dragStartHandler(event) {
                event.dataTransfer.setData('text/plain', this.project.id);
                event.dataTransfer.effectAllowed = 'move';
            }
            dragEndHandler(_event) {
            }
            configure() {
                this.element.addEventListener('dragstart', this.dragStartHandler);
                this.element.addEventListener('dragend', this.dragEndHandler);
            }
            ;
            renderContent() {
                this.element.querySelector('h2').innerHTML = this.project.title;
                this.element.querySelector('h3').innerHTML = this.getNumOfPeople;
                this.element.querySelector('p').innerHTML = this.project.description;
            }
            ;
        }
        __decorate([
            autoBind
        ], ProjectItem.prototype, "dragStartHandler", null);
        __decorate([
            autoBind
        ], ProjectItem.prototype, "dragEndHandler", null);
        class ProjectList extends Component {
            constructor(type) {
                super('project-list', 'app', false, `${type}-projects`);
                this.type = type;
                this.listEl = this.element.querySelector(`ul`);
                this.listEl.id = `${this.type}-projects-list`;
                this.renderedProjects = [];
                this.configure();
                this.renderContent();
            }
            dragOverHandler(event) {
                if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                    event.preventDefault();
                    this.listEl.classList.add('droppable');
                }
            }
            dropHandler(event) {
                var _a;
                const projectId = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
                if (projectId) {
                    projectState.moveProject(projectId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
                }
                this.listEl.classList.remove('droppable');
            }
            dragLeaveHandler(_event) {
                this.listEl.classList.remove('droppable');
            }
            configure() {
                this.element.addEventListener('dragover', this.dragOverHandler);
                this.element.addEventListener('drop', this.dropHandler);
                this.element.addEventListener('dragleave', this.dragLeaveHandler);
                projectState.addListener((projects) => {
                    this.renderedProjects = projects.filter(pro => {
                        if (this.type === 'active') {
                            return pro.status === ProjectStatus.Active;
                        }
                        return pro.status === ProjectStatus.Finished;
                    });
                    this.renderProject();
                });
            }
            renderContent() {
                this.element.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
            }
            renderProject() {
                this.listEl.innerHTML = '';
                this.renderedProjects.forEach(project => {
                    new ProjectItem(this.listEl.id, project);
                });
            }
        }
        __decorate([
            autoBind
        ], ProjectList.prototype, "dragOverHandler", null);
        __decorate([
            autoBind
        ], ProjectList.prototype, "dropHandler", null);
        __decorate([
            autoBind
        ], ProjectList.prototype, "dragLeaveHandler", null);
        class ProjectInput extends Component {
            constructor() {
                super('project-input', 'app', true, 'user-input');
                this.titleEl = this.element.querySelector('#title');
                this.desciptionEl = this.element.querySelector('#description');
                this.peopleEl = this.element.querySelector('#people');
                this.configure();
            }
            configure() {
                this.element.addEventListener('submit', this.submitHandler);
            }
            renderContent() { }
            gatherInputs() {
                const title = this.titleEl.value;
                const description = this.desciptionEl.value;
                const people = this.peopleEl.value;
                if (validate({ name: 'title', value: title, required: true })
                    && validate({ name: 'description', value: description, required: true, minLength: 4 })
                    && validate({ name: 'people', value: people, required: true, min: 1 })) {
                    return [title, description, +people];
                }
            }
            clearFields() {
                this.titleEl.value = '';
                this.desciptionEl.value = '';
                this.peopleEl.value = '';
                this.titleEl.focus();
            }
            submitHandler(e) {
                e.preventDefault();
                const inputs = this.gatherInputs();
                if (inputs) {
                    const [title, desciption, people] = inputs;
                    projectState.addProject(title, desciption, people);
                    this.clearFields();
                }
            }
        }
        __decorate([
            autoBind
        ], ProjectInput.prototype, "submitHandler", null);
        new ProjectInput();
        new ProjectList('active');
        new ProjectList('finished');
    })(App || (App = {}));
});
