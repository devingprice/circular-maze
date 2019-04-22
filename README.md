# Circular Maze

Create a circular maze that listens for wall touches and reaching the center

##  Usage

Basic setup with default values

```javascript

new CircleMaze({diameter: 500, numHallways: 3, parentId: 'maze-container'})

```

## Parameters

| Parameter       | Required | Type    | Description                                              |
| --------------- | -------- | ------- | -------------------------------------------------------- |
| `diameter`      | required | int     | width & height of svg in pixels                          |
| `numHallways`   | required | int     | number of hallways between outer circle and inner circle |
| `parentId`      | required | string  | id of parent element SVG should appear in                |
| `spinning`      | optional | boolean | if the maze should rotate                                |
| `doorway`       | optional | int     | limit size of gaps in the circles                        |
| `lineThickness` | optional | int     | stroke width of lines                                    |
| `lineColor`     | optional | string  | color of lines                                           |