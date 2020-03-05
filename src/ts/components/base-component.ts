
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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