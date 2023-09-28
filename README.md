# synapse-bg: Web Component
A performant and configurable background element that generates a network of connected nodes over which subtle, dynamic signal traversal is simulated.

## Installation
### Building
1. Clone repo: `git clone https://github.com/mhowen/synapse-bg-wc.git`
2. cd into directory: `cd synapse-bg-wc/`
3. Install dependencies: `npm install`
4. Build: `npm run build` or `vite build`

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
Optionally include any, all, or none of the configuration attributes in the element tag. For example:
```html
<synapse-bg
  color="hotpink"
  nodes="10"
  speed-scale="2"
  tracer-scale="6"
></synapse-bg>
```

### Attribute Guide
`color`: Defines base color of rendered entities
- Can be any valid CSS \<color\> string in any common colorspace
- If omitted or invalid, defaults to black.

`nodes`: Defines number of nodes generated for each network
- Must be an integer greater than or equal to 2
- If omitted or invalid, defaults to 5 for a relatively subtle effect

`speed-scale`: Multiplies base traversal speed of network signals
- Base speed is one percent of one coordinate space unit per render cycle
- Must be a number greater than 0
- If omitted or invalid, defaults to 1

`tracer-scale`: Multiplies width at which tracers are drawn along network
- Base width is one coordinate space unit
- Must be a number greater than 0
- If omitted or invalid, defaults to 1
