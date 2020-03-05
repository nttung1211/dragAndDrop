export function autoBind(_target: any, _method: String, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor = { 
    configurable: true,
    get() {
      return originalMethod.bind(this);
    }
  }

  return descriptor;
}