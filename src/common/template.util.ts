/**
 * Utility class for template manipulation and conversion
 */
export class TemplateUtil {
  /**
   * Extracts variable parameters from a string containing mustache-style templates
   * @param input - The string containing template variables
   * @returns Array of variable names found in the template
   * @example
   * // returns ['name', 'age']
   * getVariableParamsFromString('Hello {{name}}, you are {{age}} years old')
   */
  static getVariableParamsFromString = (input: string): string[] => {
    const regex = /{{(.*?)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      variables.push(match[1].trim());
    }

    return variables;
  };

  /**
   * Replaces template variables in a string with provided values
   * @param template - The string containing template variables
   * @param params - Key-value pairs for variable replacement
   * @returns String with variables replaced by their values
   * @example
   * // returns 'Hello John, you are 30 years old'
   * replaceVariablesInString('Hello {{name}}, you are {{age}} years old', {name: 'John', age: '30'})
   */
  static replaceVariablesInString = (template: string, params: Record<string, string>): string => {
    const regex = /{{(.*?)}}/g;
    return template.replace(regex, (_, variable) => {
      const trimmedVariable = variable.trim();
      return trimmedVariable in params ? params[trimmedVariable] : _;
    });
  };

  static replaceVariablesInStringNested = (template: string, params: Record<string, any>): string => {
    const regex = /{{(.*?)}}/g;
    const newData = template.replaceAll('globalVariables.', '');

    return newData.replace(regex, (_, variable) => {
      const trimmedVariable = variable.trim();
      const keys = trimmedVariable.split('.');
      let value: any = params;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return _;
        }
      }
      return value !== undefined ? String(value) : _;
    });
  };

  /**
   * Converts HTML content to WhatsApp message format
   * @param html - The HTML string to convert
   * @returns Formatted string compatible with WhatsApp message format
   * @example
   * // returns '*Hello* _world_ ~test~'
   * convertBodyToWhatsappFormat('<strong>Hello</strong> <em>world</em> <del>test</del>')
   */
  static convertBodyToWhatsappFormat(html: string): string {
    // Replace <strong> with * for bold
    html = html.replace(/<strong>(.*?)<\/strong>/g, '*$1*');

    // Replace <em> with _ for italics
    html = html.replace(/<em>(.*?)<\/em>/g, '_$1_');

    // Replace <del> with ~ for strikethrough
    html = html.replace(/<del>(.*?)<\/del>/g, ' ~$1~');

    // Replace <p> tags with line breaks only if they don't contain <br> or <p> with empty content
    html = html.replace(/<p[^>]*>(?!<br\s*\/?>)(.*?)<\/p>/g, '$1\n');

    // Replace <br/> tags with line breaks
    html = html.replace(/<br\s*\/?>/g, '\n');

    // Remove remaining HTML tags
    html = html.replace(/<[^>]*>/g, ''); // Remove all remaining HTML tags

    return html;
  }

  /**
   * Extracts mobile number and dialing code from a complete phone number string
   * @param value - The complete phone number string to process
   * @returns An object containing the mobile number (last 10 digits) and dialing code (remaining digits)
   * @example
   * // returns { mobile: '9876543210', dialing_code: '91' }
   * getDialingCodeFromMobile('919876543210')
   */
  static getDialingCodeFromMobile(value: string) {
    // Extract last 10 digits as mobile number
    const mobile = value?.slice(-10);

    // Extract remaining digits as dialing code
    const dialing_code = value?.slice(0, value.length - 10);

    return { mobile, dialing_code };
  }

  /**
   * Extracts variables and their example values as a simple key-value object
   * @param state - The current template state
   * @returns Object with variable names as keys and example values as values
   */
  static getVariableExamples(state: any): Record<string, string | undefined> {
    if (!state) return {};

    const variableMap = new Map<string, string | undefined>();

    // Process each component in the state
    state?.components?.forEach((component) => {
      if (component.type === 'HEADER') {
        const headerText = component.text || '';
        const headerVars = this.getVariableParamsFromString(headerText);

        // Check existing parameters in the state
        const existingHeaderParams = component.example?.header_text_named_params || [];
        const existingHeaderVarNames = existingHeaderParams.map((param) => param.param_name);

        // Combine variables from text and existing parameters
        const allHeaderVars = [...new Set([...headerVars, ...existingHeaderVarNames])];

        allHeaderVars.forEach((variableName) => {
          const existingParam = existingHeaderParams.find((param) => param.param_name === variableName);
          if (!variableMap.has(variableName)) {
            variableMap.set(variableName, existingParam?.example);
          }
        });
      }

      if (component.type === 'BODY') {
        const bodyText = component.text || '';
        const bodyVars = this.getVariableParamsFromString(bodyText);

        // Check existing parameters in the state
        const existingBodyParams = component.example?.body_text_named_params || [];
        const existingBodyVarNames = existingBodyParams.map((param) => param.param_name);

        // Combine variables from text and existing parameters
        const allBodyVars = [...new Set([...bodyVars, ...existingBodyVarNames])];

        allBodyVars.forEach((variableName) => {
          const existingParam = existingBodyParams.find((param) => param.param_name === variableName);
          if (!variableMap.has(variableName)) {
            variableMap.set(variableName, existingParam?.example);
          }
        });
      }
    });

    return Object.fromEntries(variableMap);
  }
}
