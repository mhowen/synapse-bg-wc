# synapse-bg: Web Component
A performant and configurable background element that generates a network of connected nodes over which subtle, dynamic signal traversal is simulated.

## Install

### Building
Clone repo and run `vite build` or `npm build`

### Registering Component
Include in your template or html:
```html
<script type="module" src="<build directory>/synapse-bg-wc.js"></script>
```
## Usage

### As Custom Element
Add `<synapse-bg></synapse-bg>` to your template or html, making sure to include the mandatory closing tag.

The element and its internal canvases will grow to fill the viewport or parent element, and automatically resize when size changes.

### Fill Viewport
If included as a direct descendant of the document body, the element will grow to fill the entire viewport and fix its position.

### Fill Container
If nested within any descendant of the document body, the element will take absolute position over the container and grow to fit it.

## Configuration

### Element Attributes
Optionally include any, all, or none of the configuration attributes:
```html
<synapse-bg
  color="hotpink"
  nodes="10"
  speed-scale="2"
  tracer-scale="6"
></synapse-bg>
```

### Attribute Functions
| Name | Type | Default | Function |
| ---- | ---- | ------- | -------- |
| color | String | 'black' | Defines base color of rendered entities. Can be any valid CSS \<color\> string in any common colorspace |
| nodes | Number | 5 | The integer number of nodes generated for each network |
| speed-scale | Number | 1 | Multiplies base traversal speed of signals. Base speed is one coordinate space unit per render cycle |
| tracer-scale | Number | 1 | Multiplies width at which tracers are rendered. Base width is one coordinate space unit
