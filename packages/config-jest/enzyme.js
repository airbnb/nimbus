const Enzyme = require('enzyme');
const { createSerializer } = require('enzyme-to-json');
const { stripHOCs } = require('@airbnb/nimbus-common');

function getAdapter() {
  try {
    return require('enzyme-adapter-react-16');
  } catch (error) {
    return require('enzyme-adapter-react-15');
  }
}

const Adapter = getAdapter();

Enzyme.configure({
  adapter: new Adapter(),
});

expect.addSnapshotSerializer(
  createSerializer({
    mode: 'shallow',
    map(element) {
      const props = { ...element.props };

      // Strip default props
      if (element.node.type && element.node.type.defaultProps) {
        Object.entries(element.node.type.defaultProps).forEach(([key, value]) => {
          if (key in props && props[key] === value) {
            delete props[key];
          }
        });
      }

      // Strip the react-with-styles `css` prop
      if (props.css && typeof props.css === 'function') {
        delete props.css;
      }

      // Strip the aesthetic `cx` prop
      if (props.cx && typeof props.cx === 'function') {
        delete props.cx;
      }

      return {
        ...element,
        props,
        type: stripHOCs(element.type),
      };
    },
  }),
);
