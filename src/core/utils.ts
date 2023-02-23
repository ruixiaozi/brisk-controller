export function parseBoolean(value: string) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

export function isValid(value: any) {
  return value !== null && value !== undefined && value !== '';
}

