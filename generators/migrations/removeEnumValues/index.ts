/**
 * Remove values from an existing enum
 */
export default {
  configure: ({ enumName, attributes }) => ({
    name: `remove-enum-values-from-${enumName}`,
    comment: `Remove the attributes: ${attributes
      .map((attr) => attr.name)
      .join(', ')} from ${enumName}.`,
  }),
  description: 'Remove values from an existing enum',
  attributesSuggestOnly: true,
  type: 'changeEnumAttributes',
};
