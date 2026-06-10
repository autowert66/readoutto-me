export function createOption(value: string, label: string) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  return option;
}
