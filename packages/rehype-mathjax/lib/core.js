const visit = require('unist-util-visit')

module.exports = createPlugin

function createPlugin(displayName, createRenderer, chtml) {
  attacher.displayName = displayName

  return attacher

  function attacher(options) {
    if (chtml && (!options || !options.chtml || !options.chtml.fontURL)) {
      throw new Error(
        'rehype-mathjax: missing `fontURL` in CHTML options, which must be set to a URL to reach MathJaX fonts'
      )
    }

    transform.displayName = displayName + 'Transform'

    return transform

    function transform(tree) {
      const renderer = createRenderer(options)

      let context = tree
      let found = false

      visit(tree, 'element', onelement)

      if (found && renderer.styleSheet) {
        context.children.push(renderer.styleSheet())
      }

      function onelement(node) {
        const classes = node.properties.className || []
        const inline = classes.includes('math-inline')
        const display = classes.includes('math-display')

        if (node.tagName === 'head') {
          context = node
        }

        if (!inline && !display) {
          return
        }

        found = true
        renderer.render(node, {display: display})

        return visit.SKIP
      }
    }
  }
}
