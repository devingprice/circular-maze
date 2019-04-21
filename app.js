function maze(x, y) {
    var n = x * y - 1;
    if (n < 0) { alert("illegal maze dimensions"); return; }
    var horiz = []; for (var j = 0; j < x + 1; j++) horiz[j] = [],
        verti = []; for (var j = 0; j < x + 1; j++) verti[j] = [],
            here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)],
            path = [here],
            unvisited = [];
    for (var j = 0; j < x + 2; j++) {
        unvisited[j] = [];
        for (var k = 0; k < y + 1; k++)
            unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
    }
    console.log(horiz)
    console.log(verti)
    console.log(here)
    console.log(unvisited)
    while (0 < n) {
        var potential = [[here[0] + 1, here[1]], [here[0], here[1] + 1],
        [here[0] - 1, here[1]], [here[0], here[1] - 1]];
        var neighbors = [];
        for (var j = 0; j < 4; j++)

            if (unvisited[(potential[j][0] + 1) % (x + 2)][(potential[j][1] + 1) % (y + 1)])
                neighbors.push(potential[j]);
            else {
                //console.log(potential[j] + ' not a neighbor to ' + here)
            }
        if (neighbors.length) {
            n = n - 1;
            next = neighbors[Math.floor(Math.random() * neighbors.length)];
            unvisited[next[0] + 1][next[1] + 1] = false;
            if (next[0] == here[0])
                horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
            else
                verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
            path.push(here = next);
        } else
            here = path.pop();
    }
    console.log({ x: x, y: y, horiz: horiz, verti: verti })
    return { x: x, y: y, horiz: horiz, verti: verti };
}


class CircleMaze {
    constructor(x, y, maze, hallwayThickness, outerCircleRadius) {
        //inputs
        this.x = x;
        this.y = y;
        this.innerCircleRadius = 100;
        this.outerCircleRadius = outerCircleRadius;//300;
        this.hallwayThickness = hallwayThickness;//100;
        this.spokeNum = 8;
        this.lineThickness = 10

        //calc'ed
        this.numHallways = (this.outerCircleRadius - this.innerCircleRadius) / this.hallwayThickness;

        this.grid = this.generateGrid();
        this.drawMaze(maze);
    }
    generateGrid() {
        var grid = [];
        for (var i = 0; i < this.numHallways; i++) {
            var hallway = [];
            for (var k = 0; k < this.spokeNum; k++) {
                hallway.push(new Cell(k, k, i));
            }
            grid.push(hallway);
        }
        return grid;
    }
    drawMaze(maze) {
        for (var i = 0; i < this.numHallways + 1; i++) {
            
            var vertical = undefined;
            if (i === 0) {
                vertical = [];
                vertical[0] = true;
            } else if ( i === this.numHallways ) {
                vertical = [];
                vertical[this.spokeNum-1] = true;
            } else  {
                vertical = maze.verti[ i -1 ]
            }
            //console.log(i, vertical);
            this.drawCircle(this.innerCircleRadius + i * this.hallwayThickness, vertical)
        }
        for (var i = 0; i < this.spokeNum; i++) {
            var radians = 2 * Math.PI * ((i + 1) / this.spokeNum);
            //console.log(radians)
            var edgePoint = this.calculateCircleEdge(this.outerCircleRadius, radians);
            var innerPoint = this.calculateCircleEdge(this.innerCircleRadius, radians);
            var horiz = [];
            for(var k =0; k< this.numHallways; k++){
                horiz.push( maze.horiz[k][i])
                
            }
            if( i === this.spokeNum -1){
                //horiz[i] = undefined;
                console.log(horiz)
                this.drawLine(innerPoint, edgePoint)

            } else {
                this.drawLine(innerPoint, edgePoint, horiz)
            }
            
            
        }

        draw.path("M" + this.x + " " + (this.y - this.innerCircleRadius) +
            " a " + this.innerCircleRadius + " " + this.innerCircleRadius + " 0 0 1 0 " + this.innerCircleRadius * 2 +
            " a " + this.innerCircleRadius + " " + this.innerCircleRadius + " 0 0 1 0 " + this.innerCircleRadius * -2)
            .attr({
                fill: 'transparent'
            })
            .addClass('circle-target')
    }
    calculateCircleEdge(radius, radians) {
        var x = radius * Math.sin(radians);
        var y = radius * Math.cos(radians);
        return [x, -y];
    }
    drawLine(point1, point2, horiz) {
        var line = draw.line(point1[0] + this.x, point1[1] + this.y,
            point2[0] + this.x, point2[1] + this.y)
            .attr({
                stroke: '#444',
                'stroke-width': 10
            })
            .addClass('circle-line')
        if( horiz !== undefined){
            this.calcLineStrokeDash(line, horiz);
        }
        
    }
    calcLineStrokeDash(line, horiz) {
        //return '' + hallwayThickness + ' ' + hallwayThickness + ' ' + hallwayThickness * 6;
        var stroke = '';
        var countConcat = concatSimilarWithCount(horiz);
        console.log(countConcat)
        for(var i =0; i < countConcat.length; i++){
            if( i === 0 && countConcat[i].type === true){
                line.attr('stroke-dashoffset', countConcat[i].number * this.hallwayThickness * -1)
            } else {
                stroke += countConcat[i].number * this.hallwayThickness + ' ';
            }
            
        }
        console.log( stroke )
        stroke += ' ' + this.hallwayThickness * this.numHallways;
        line.attr('stroke-dasharray', stroke)
    }
    drawCircle(radius, vertical) {
        var circle = draw.path("M" + this.x + " " + (this.y - radius) +
            " a " + radius + " " + radius + " 0 0 1 0 " + radius * 2 +
            " a " + radius + " " + radius + " 0 0 1 0 " + radius * -2)
            .attr({
                fill: 'none',
                stroke: '#444',
                'stroke-width': 10
            })
            .addClass('circle-line')
        if (vertical !== undefined) {
            var circum =(2 * Math.PI * radius) ;
            var gap = circum / this.spokeNum;
            this.calcCircleStrokeDash(circle, vertical, gap);
        }
    }
    calcCircleStrokeDash(circle, vertical, gap) {
        console.log(vertical)
        
        var stroke = '';
        var countConcat = concatSimilarWithCount(vertical);
        console.log(countConcat)
        for(var i =0; i < countConcat.length; i++){
            if( i === 0 && countConcat[i].type === true){
                circle.attr('stroke-dashoffset', countConcat[i].number * gap * -1)
            } else {
                stroke += countConcat[i].number * gap + ' ';
            }
            
        }
        console.log( stroke )
        stroke += ' ' + gap * this.spokeNum;
        circle.attr('stroke-dasharray', stroke)
    }

}
class Cell {
    constructor(x1, x2, y) {
        this.x1 = x1;
        this.x2 = x2;
        this.y = y;
    }
}

function concatSimilarWithCount(array){
    //takes [true, _, _ ,_, true, true]
    //returns [{true,1}, {_,3}, {true,2}]
    var result = [];
    var obj = { type: array[0], number: 1}
    if(array.length === 1){
        return [obj];
    }
    for(var i=1; i < array.length; i++){
        if( array[i] === obj.type ){
            obj.number++;
        } else {
            result.push(obj);
            obj = { type: array[i], number: 1}
        }
    }
    result.push(obj);
    return result;
}

function display(m) {
    var text = [];
    for (var j = 0; j < m.x * 2 + 1; j++) {
        var line = [];
        if (0 == j % 2)
            for (var k = 0; k < m.y * 4 + 1; k++)
                if (0 == k % 4)
                    line[k] = '+';
                else
                    if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)])
                        line[k] = ' ';
                    else
                        line[k] = '-';
        else
            for (var k = 0; k < m.y * 4 + 1; k++)
                if (0 == k % 4)
                    if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1])
                        line[k] = ' ';
                    else
                        line[k] = '|';
                else
                    line[k] = ' ';
        if (0 == j) line[1] = line[2] = line[3] = ' ';
        if (m.x * 2 - 1 == j) line[4 * m.y] = ' ';
        text.push(line.join('') + '\r\n');
    }

    return text.join('');
}

var genMaze = maze(3, 8);
console.log(display(genMaze))

console.log(new CircleMaze(500, 500, genMaze, 100, 400))