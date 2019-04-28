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


// function closeBoxListeners(closeId, mazeId, svgId){
//     document.getElementById('x-close').addEventListener('mouseover', function (e) {
//         document.getElementById('x-close').classList.add('close-left');
//         document.getElementById('maze').classList.add('show');
//         //z index on svg is higher so this only gets called first time
//     })

//     var svgMaze = document.getElementById('mazeSVG');
//     svgMaze.addEventListener('load', function () {
//         console.log(svgMaze)

//         var svgLines = svgMaze.querySelectorAll('.circle-line')

//         svgLines.forEach(function (svgLine) {
//             svgLine.addEventListener('mouseover', function (e) {
//                 if (e.target && e.target.classList.contains('circle-line')) {
//                     console.log('hovered')
//                     console.log('failed')
//                     document.getElementById('x-close').classList.toggle('close-left');
//                     document.getElementById('maze').classList.toggle('maze-flipped')
//                 }

//             })
//         })

//         //TODO: currently not working if multiple mazes, need to add to all and let hovering target it's parent maze
//         svgMaze.querySelector('.circle-target').addEventListener('mouseover', function (e) {
//             if (e.target && e.target.classList.contains('circle-target')) {
//                 console.log('reached the end')
//                 console.log('made it')
//             }

//         })
//     })
// }

var draw; //TODO move to inside class
class NewCircleMaze {
    constructor(args) {
        //constants based off viewport size
        this.x = 500;
        this.y = 500;


        this.hallwayThickness = 100;
        this.innerCircleRadius = 100;
        this.outerCircleRadius = 400;
        this.spokeNum = 8;
        this.lineThickness = args.lineThickness || 10;
        this.lineColor = args.lineColor || '#444';

        this.numHallways = (this.outerCircleRadius - this.innerCircleRadius) / this.hallwayThickness;

        this.doorway = args.doorway || undefined;


        this.maze = this.createMaze(3,8);
        this.logMaze();

        draw = this.createSVG('maze', args.diameter, args.diameter);
        if( args.spinning !== undefined ){
            document.getElementById('mazeSVG').classList.add('spinning')
        }
        //svg lines
        this.drawMaze(this.maze);
        
        this.closeBoxListeners();
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
                // console.log(horiz)
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
                stroke: this.lineColor,
                'stroke-width': this.lineThickness
            })
            .addClass('circle-line')
        if( horiz !== undefined){
            this.calcLineStrokeDash(line, horiz);
        }
        
    }
    calcLineStrokeDash(line, horiz) {
        var stroke = '';
        var countConcat = concatSimilarWithCount(horiz);
        for(var i =0; i < countConcat.length; i++){
            if( i === 0 && countConcat[i].type === true){
                line.attr('stroke-dashoffset', countConcat[i].number * this.hallwayThickness * -1)
            } else {
                stroke += countConcat[i].number * this.hallwayThickness + ' ';
            }
            
        }
        stroke += ' ' + this.hallwayThickness * this.numHallways;
        line.attr('stroke-dasharray', stroke)
    }
    drawCircle(radius, vertical) {
        var circle = draw.path("M" + this.x + " " + (this.y - radius) +
            " a " + radius + " " + radius + " 0 0 1 0 " + radius * 2 +
            " a " + radius + " " + radius + " 0 0 1 0 " + radius * -2)
            .attr({
                fill: 'none',
                stroke: this.lineColor,
                'stroke-width': this.lineThickness
            })
            .addClass('circle-line')
        if (vertical !== undefined) {
            var circum =(2 * Math.PI * radius) ;
            var gap = circum / this.spokeNum;
            this.calcCircleStrokeDash(circle, vertical, gap);
        }
    }
    calcCircleStrokeDash(circle, vertical, gap) {
        var emptySpace = this.doorway;
        if (emptySpace !== undefined && gap > emptySpace){ //if doorway value given and circle's gap isn't already small enough
            var stroke = '';
            var countConcat = concatSimilarWithCount(vertical);
            
            for(var i =0; i < countConcat.length; i++){
                
                var add = 0;
                if( countConcat[i].type === true){
                    if( i === 0){ stroke += ((gap - emptySpace)/2) + ' '; } // add a black start if first is true

                    if( countConcat[i].number > 1){ //if multiple true then needs to have spacing
                        var array = new Array(countConcat[i].number).fill( emptySpace )
                        stroke += array.join(' '+ (gap-emptySpace) +' ');
                        stroke += ' '; //join doesnt add spacing
                    } else {
                        stroke += emptySpace + ' ';
                    }
                    
                } else {
                    if( i > 0) { add += (gap-emptySpace) / 2 } //add part from last empty
                    if(i < (countConcat.length -1) ){ add += (gap - emptySpace)/ 2 } //add first part of next empty
                    add += (countConcat[i].number * gap);
                    
                    stroke += add +  ' ';
                }
                    
                // OLD Func, removed repeating code 
                // if( i === 0 && countConcat[i].type === true){ //first being true needs small line at beginning
                //     stroke += ((gap - emptySpace)/2) + ' '; //start line
                    
                //     if( countConcat[i].number > 1){ //if multiple true then needs to have spacing
                //         var array = new Array(countConcat[i].number).fill( emptySpace )
                //         stroke += array.join(' '+ (gap-emptySpace) +' ');
                //         stroke += ' '; //join doesnt add spacing
                //     } else {
                //         stroke += emptySpace + ' ';
                //     }

                // } else {
                //     var add = 0;
                //     if( countConcat[i].type === true){
                //         if( countConcat[i].number > 1){ //if multiple true then needs to have spacing
                //             var array = new Array(countConcat[i].number).fill( emptySpace )
                //             stroke += array.join(' '+ (gap-emptySpace) +' ');
                //             stroke += ' '; //join doesnt add spacing
                //         } else {
                //             stroke += emptySpace + ' ';
                //         }
                        
                //         //if(i === (countConcat.length -1) ){ stroke += (gap - emptySpace)/ 2 } dont add this becaue then blank space afterwards is blank
                //     } else {
                //         if( i > 0) { add += (gap-emptySpace) / 2 } //add part from last empty
                //         if(i < (countConcat.length -1) ){ add += (gap - emptySpace)/ 2 } //add first part of next empty
                //         add += (countConcat[i].number * gap);
                        
                //         stroke += add +  ' ';
                //     }
                    
                // }
                
            }
            
            stroke += ' ' + gap * this.spokeNum;
            circle.attr('stroke-dasharray', stroke)
            return;
        };

        
        var stroke = '';
        var countConcat = concatSimilarWithCount(vertical);
        for(var i =0; i < countConcat.length; i++){
            if( i === 0 && countConcat[i].type === true){
                circle.attr('stroke-dashoffset', countConcat[i].number * gap * -1)
            } else {
                stroke += countConcat[i].number * gap + ' ';
            }
            
        }
        stroke += ' ' + gap * this.spokeNum;
        circle.attr('stroke-dasharray', stroke)
    }

    createSVG(targetId, width, height){
        return SVG(targetId)
            .attr('id', 'mazeSVG')
            .size(width, height)
            .viewbox(0, 0, 1000, 1000);
    }
    
    createMaze(x, y) {
        var n = x * y - 1;
        if (n < 0) { 
            alert("illegal maze dimensions"); 
            return; 
        }
        var horiz = []; 
        for (var j = 0; j < x + 1; j++) {
            horiz[j] = []
        }
        var verti = []; 
        for (var j = 0; j < x + 1; j++) {
            verti[j] = []
        }
        var here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)]
        var path = [here];
        var unvisited = [];
        for (var j = 0; j < x + 2; j++) {
            unvisited[j] = [];
            for (var k = 0; k < y + 1; k++){
                unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
            }
        }
        var next;
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
        //console.log({ x: x, y: y, horiz: horiz, verti: verti })
        return { x: x, y: y, horiz: horiz, verti: verti };
    }
    logMaze() {
        var m = this.maze;
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
    
        //return text.join('');
        console.log( text.join('') );
    }
    fail() {
        console.log('failure')
        this.maze = this.createMaze(3,8);
        draw.clear();
        this.drawMaze(this.maze);
        this.closeBoxListeners();
    }
    closeBoxListeners(closeId, mazeId, svgId){
        document.getElementById('x-close').addEventListener('mouseover', function (e) {
            document.getElementById('x-close').classList.add('close-left');
            document.getElementById('maze').classList.add('show');
            //z index on svg is higher so this only gets called first time
        })
    
        var circleMazeRef = this;
        var svgMaze = document.getElementById('mazeSVG');
        setTimeout(function(){
            var svgLines = svgMaze.querySelectorAll('.circle-line')
    
            svgLines.forEach(function (svgLine) {
                svgLine.addEventListener('mouseover', function (e) {
                    if (e.target && e.target.classList.contains('circle-line')) {
                        circleMazeRef.fail();
                        document.getElementById('x-close').classList.toggle('close-left');
                        document.getElementById('maze').classList.toggle('maze-flipped')
                    }
    
                })
            })
    
            //TODO: currently not working if multiple mazes, need to add to all and let hovering target it's parent maze
            svgMaze.querySelector('.circle-target').addEventListener('mouseover', function (e) {
                if (e.target && e.target.classList.contains('circle-target')) {
                    console.log('reached the end')
                }
    
            })
        }, 200)
    }
}

//new NewCircleMaze({width: 500, height: 500, lineThickness: 20, lineColor: 'black', doorway: 50, spinning: true})
//, doorway: 50
new NewCircleMaze({diameter: 500, lineThickness: 20, lineColor: 'black', spinning: true})