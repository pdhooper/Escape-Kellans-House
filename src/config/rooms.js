export const rooms = {
  bedroom: {
    name: 'Bedroom',
    connections: ['hallway'],
    ambient: '#232323',
    furniture: [
      { type: 'bed', x: 0.25, y: 0.25, w: 0.25, h: 0.15 },
      { type: 'dresser', x: 0.7, y: 0.2, w: 0.1, h: 0.2 }
    ]
  },
  hallway: {
    name: 'Hallway',
    connections: ['bedroom', 'kitchen', 'bathroom', 'study', 'basement'],
    ambient: '#1a1a1a',
    furniture: [
      { type: 'plant', x: 0.1, y: 0.3, w: 0.05, h: 0.1 },
      { type: 'painting', x: 0.4, y: 0.1, w: 0.15, h: 0.08 }
    ]
  },
  kitchen: {
    name: 'Kitchen',
    connections: ['hallway', 'pantry'],
    ambient: '#202020',
    furniture: [
      { type: 'counter', x: 0.2, y: 0.2, w: 0.4, h: 0.1 },
      { type: 'fridge', x: 0.7, y: 0.15, w: 0.1, h: 0.25 },
      { type: 'island', x: 0.35, y: 0.5, w: 0.2, h: 0.15 }
    ]
  },
  bathroom: {
    name: 'Bathroom',
    connections: ['hallway'],
    ambient: '#1c1c1c',
    furniture: [
      { type: 'sink', x: 0.3, y: 0.2, w: 0.15, h: 0.1 },
      { type: 'shower', x: 0.6, y: 0.15, w: 0.15, h: 0.2 }
    ]
  },
  study: {
    name: 'Study',
    connections: ['hallway'],
    ambient: '#1e1e1e',
    furniture: [
      { type: 'desk', x: 0.3, y: 0.3, w: 0.25, h: 0.12 },
      { type: 'bookshelf', x: 0.1, y: 0.1, w: 0.1, h: 0.4 },
      { type: 'chair', x: 0.35, y: 0.45, w: 0.08, h: 0.08 }
    ]
  },
  basement: {
    name: 'Basement',
    connections: ['hallway'],
    ambient: '#151515',
    furniture: [
      { type: 'boxes', x: 0.15, y: 0.2, w: 0.2, h: 0.2 },
      { type: 'workbench', x: 0.5, y: 0.1, w: 0.3, h: 0.15 },
      { type: 'tools', x: 0.6, y: 0.4, w: 0.15, h: 0.1 }
    ]
  },
  pantry: {
    name: 'Pantry',
    connections: ['kitchen'],
    ambient: '#191919',
    furniture: [
      { type: 'shelves', x: 0.1, y: 0.1, w: 0.8, h: 0.1 },
      { type: 'shelves', x: 0.1, y: 0.3, w: 0.8, h: 0.1 },
      { type: 'shelves', x: 0.1, y: 0.5, w: 0.8, h: 0.1 }
    ]
  }
};