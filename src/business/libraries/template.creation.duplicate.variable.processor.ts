export class TemplateCreationDuplicateVariableProcessor {
  constructor() {}

  async process(raw_json: any) {
    if (!raw_json || !raw_json.components) {
      return raw_json;
    }

    const processedJson = JSON.parse(JSON.stringify(raw_json)); // Deep clone

    // Process each component
    for (const component of processedJson.components) {
      if (component.type === 'BODY' && component.text) {
        this.processBodyComponent(component);
      }
    }

    return processedJson;
  }

  private processBodyComponent(component: any) {
    const text = component.text;
    if (!text) return;

    // Track occurrences of each variable
    const variableOccurrences: Map<string, number> = new Map();
    const duplicateMappings: Map<string, string[]> = new Map(); // Store new names for duplicates

    // Process text and replace duplicates
    const regex = /{{(.*?)}}/g;
    let processedText = text.replace(regex, (fullMatch, variableName) => {
      const trimmedName = variableName.trim();
      const count = (variableOccurrences.get(trimmedName) || 0) + 1;
      variableOccurrences.set(trimmedName, count);

      if (count === 1) {
        // First occurrence, keep as is
        return fullMatch;
      } else {
        // Duplicate occurrence, rename it
        const newName = `${trimmedName}_dup${count - 1}`;

        // Store the mapping for example parameters
        if (!duplicateMappings.has(trimmedName)) {
          duplicateMappings.set(trimmedName, []);
        }
        duplicateMappings.get(trimmedName)!.push(newName);

        return `{{${newName}}}`;
      }
    });

    // Update the component text
    component.text = processedText;

    // Update example parameters
    if (component.example && component.example.body_text_named_params) {
      const exampleParams = component.example.body_text_named_params;
      const newExampleParams: any[] = [];

      // Create a map of original parameter names to their example values
      const exampleMap = new Map<string, string>();
      exampleParams.forEach((param: any) => {
        exampleMap.set(param.param_name, param.example);
      });

      // Add original parameters
      exampleParams.forEach((param: any) => {
        newExampleParams.push({ ...param });
      });

      // Add duplicate parameters with _dup1, _dup2, etc. suffixes
      duplicateMappings.forEach((newNames, originalName) => {
        if (exampleMap.has(originalName)) {
          const exampleValue = exampleMap.get(originalName);
          newNames.forEach((newName) => {
            newExampleParams.push({
              param_name: newName,
              example: exampleValue,
            });
          });
        }
      });

      component.example.body_text_named_params = newExampleParams;
    }
  }
}
