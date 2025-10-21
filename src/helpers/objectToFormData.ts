type ObjectType = {
  [key: string]: any;
};

export function objectToFormData(obj: ObjectType, formData = new FormData(), parentKey = '') {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      objectToFormData(item, formData, `${parentKey}[${index}]`);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach((key) => {
      const fullKey = parentKey ? `${parentKey}[${key}]` : key;
      objectToFormData(obj[key], formData, fullKey);
    });
  } else {
    formData.append(parentKey, obj);
  }

  return formData;
}
