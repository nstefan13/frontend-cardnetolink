type ObjectType = {
  [key: string]: any;
};

export function sanitizePayload(obj: ObjectType) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => sanitizePayload(item));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'cardId') {
          delete obj[key];
        } else {
          sanitizePayload(obj[key]);
        }
      }
    }
  }
}
