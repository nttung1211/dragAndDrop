export interface ValidateObj {
  name: string,
  value: string,
  required?: boolean,
  minLength?: number,
  min?: number
}

export function validate(validateObj: ValidateObj) {
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