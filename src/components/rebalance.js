// very lightly adapted from https://github.com/shuding/react-wrap-balancer/blob/main/src/index.tsx
const setBalance = (ratio, wrapper) => {
    const container = wrapper.parentElement
    const update = (width) => (wrapper.style.maxWidth = width + 'px')
  
    // Reset wrapper width
    wrapper.style.maxWidth = ''
  
    // Get the intial container size
    const width = container.clientWidth
    const height = container.clientHeight
  
    // Synchronously do binary search and calculate the layout
    let left = width / 2
    let right = width
    let middle
  
    if (width) {
      while (left + 1 < right) {
        middle = ~~((left + right) / 2)
        update(middle)
        if (container.clientHeight === height) {
          right = middle
        } else {
          left = middle
        }
      }
  
      // Update the wrapper width
      update(right * ratio + width * (1 - ratio))
    }
  }
  
  export function rebalance(node, props = { ratio: 1 }) {
  
      const resizer = new ResizeObserver(() => {
          setBalance(props.ratio, node);
      });
      const mutation = new MutationObserver(() => {
          setBalance(props.ratio, node);
      })
      mutation.observe(node, { childList: true, subtree: true, characterData: true})
      resizer.observe(node.parentElement);
      return {
          destroy() {
              resizer.unobserve(node.parentElement);
              mutation.unobserve(node);
          }
      }
  }