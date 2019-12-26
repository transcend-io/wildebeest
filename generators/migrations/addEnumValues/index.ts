/**
 * Add values to an existing enum
 */
export default {
  configure: ({ attributes, enumName }) => ({
    name: `add-enum-values-to-${enumName}`,
    comment: `Add the attributes: ${attributes
      .map((attr) => attr.name)
      .join(', ')} to ${enumName}`,
  }),
  description: 'Add values to an existing enum',
  attributesSuggestOnly: true, // TODO remove when enums can recursively detect
  type: 'changeEnumAttributes',
};
