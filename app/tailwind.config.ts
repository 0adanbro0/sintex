module.exports = {
  theme: {
    extend: {
      keyframes: {
        edgeSlide: {
          'to': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      animation: {
        'edge-slide': 'edgeSlide 1s cubic-bezier(0.16, 1, 0.3, 1) both',
      }
    },
  },
}
