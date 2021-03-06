var Transform = {
    rotate : (x, y, rotation) => {
        let rotationMatrix = [[Math.cos(rotation), -1 * Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]];
        let originPositionMatrix = [[x], [y], [1]];
    
        let newPosition = Matrix.multiply(rotationMatrix, originPositionMatrix);
    
        return newPosition;
    },
    
    select : () => {
        if(Mouse.isPressed && selectMode && !!Canvas.drawnShapes) {
            let mx = Mouse.pressedX;
            let my = Mouse.pressedY;
            let shapeFound = false;
    
            for(let i = parseInt(Canvas.drawnShapes.length) - 1; i > 0 && !shapeFound; --i) {
                let minX = Canvas.drawnShapes[i][2][0];
                let maxX = minX + Canvas.drawnShapes[i][2][2];
                let minY = Canvas.drawnShapes[i][2][1];
                let maxY = minY + Canvas.drawnShapes[i][2][2];
    
                [maxX, minX] = maxX < minX ? [minX, maxX] : [maxX, minX]; // swap values if necessary
    
                [maxY, minY] = maxY < minY ? [minY, maxY] : [maxY, minY]; // swap values if necessary
    
                let collision = mx >= minX && mx <= maxX && my >= minY && my <= maxY ? true : false;
    
                if(collision) {
                    shapeFound = true;
                    console.log(minX + " < " + mx + " < " + maxX);
                    console.log(minY + " < " + my + " < " + maxY);
                    console.log(Canvas.drawnShapes[i]);
                }
            }
        }
        // start at top of array...
        // if mouse is within boundaries of shape... 
        // select
        // *** need to separate select from the rest of the tools probably
    },

    translate : (x, y, translateX, translateY) => {
        let translationMatrix = [[1, 0, translateX], [0, 1, translateY], [0, 0, 1]];
        let positionMatrix = [[x], [y], [1]];
        let newPosition = Matrix.multiply(translationMatrix, positionMatrix);

        return newPosition;
    }
}

class Shape {
    constructor(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor) {
        this.originX = originX;
        this.originY = originY;
        this.width = width;
        this.height = height;
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this._shapeType = 'shap';
    }

    debug () {
        if(DEBUG == true) {
            // write shape to console
        }
    }

    draw (fill = true) {
        this.loadIntoContext();

        if(fill) {
            // change fill color
            context.fillStyle = this.fillColor;
            context.fill();
        }
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();

        this.debug();
    }

    edit (mouseOriginX, mouseOriginY, mouseMoveX, mouseMoveY) {
        let xDistance = mouseMoveX - mouseOriginX;
        let yDistance = mouseMoveY - mouseOriginY;

        this.mouseX += xDistance;
        this.mouseY += yDistance;

        // console.log("moved mouseX " + xDistance + " pixels to " + this.mouseX);
        // console.log("moved mouseY " + yDistance + " pixels to " + this.mouseY);

        this.transform();
    }

    load (shape) {
        let jsonShape = JSON.parse(shape);
        this.originX = jsonShape.originX;
        this.originY = jsonShape.originY;
        this.width = jsonShape.width;
        this.height = jsonShape.height;
        this.mouseX = jsonShape.mouseX;
        this.mouseY = jsonShape.mouseY;
        this.strokeColor = jsonShape.strokeColor;
        this.fillColor = jsonShape.fillColor;
    }

    loadIntoContext () {
        // transform shape
        // load shape into context
        // no stroke!
    }

    rotate () {
        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

        this._rotation = rota;
    }

    save () {
        if(!!Canvas.drawnShapes[0]) { // simplify null, undefined and false to false
            Canvas.drawnShapes.push([this._shapeType, currentTool, this.toString()]);
        } else {
            Canvas.drawnShapes[0] = [this._shapeType, currentTool, this.toString()];
        }
    }

    scale () {
        let tempEndX = Math.abs(this.mouseX - this.originX);
        let tempEndY = Math.abs(this.mouseY - this.originY);
        
        this.width = tempEndX;
        this.height = tempEndY;
    }

    toJSON () {
        return {
            originX: this.originX,
            originY: this.originY,
            width: this.width,
            height: this.height,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            strokeColor: this.strokeColor,
            fillColor: this.fillColor,
        }
    }

    toString () {
        let jsonRep = this.toJSON();
        return JSON.stringify(jsonRep);
    }

    translate () {
        let xDistance = this.mouseX - this.originX;
        let yDistance = this.mouseY - this.originY;

        let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
        
        this.originX = tran[0][0];
        this.originY = tran[1][0];
    }

    transform () {
        switch(currentTool) {
            case 'rota':
                this.rotate();
                break;
            case 'scal':
                this.scale();
                break;
            case 'tran':
                this.translate();
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }
    }
}

class Ellipse extends Shape {
    constructor(originX = 0, originY = 0, width = 1, height = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'elli';
        this._rotation = 0;
    }

    debug () {
        if(DEBUG == true) {
            console.log("circle(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    loadIntoContext () {
        this.transform();

        context.beginPath();
        context.ellipse(this.originX, this.originY, this.width, this.height, this._rotation, 0, 2 * Math.PI);
    }

    rotate () {
        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

        this._rotation = rota;
    }

    scale () {
        let tempEndX = Math.abs(this.mouseX - this.originX);
        let tempEndY = Math.abs(this.mouseY - this.originY);
        
        this.width = tempEndX;
        this.height = tempEndY;
    }

    translate () {
        let xDistance = this.mouseX - this.originX;
        let yDistance = this.mouseY - this.originY;

        let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
        
        this.originX = tran[0][0];
        this.originY = tran[1][0];
    }
}

class Circle extends Ellipse {
    constructor(originX = 0, originY = 0, radius = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, radius, radius, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'circ';
        this._rotation = 0;
    }

    debug() {
        if(DEBUG == true) {	
            console.log("circle(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");	
        }	
    }

    rotate () {
        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);	
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";	

        this._rotation = rota;
    }

    scale () {
        let tempEnd = Math.abs(this.mouseX - this.originX) > Math.abs(this.mouseY - this.originY) ? Math.abs(this.mouseX - this.originX) : Math.abs(this.mouseY - this.originY);	

        this.width = tempEnd;
        this.height = tempEnd;
    }

    translate () {
        let xDistance = this.mouseX - this.originX;	
        let yDistance = this.mouseY - this.originY;	

        let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);	

        this.originX = tran[0][0];	
        this.originY = tran[1][0];
    }
}

class Line extends Shape {
    constructor(originX = 0, originY = 0, width = 1, height = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        // width and height are actually endX / endY in this case
        super(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'line';
        this._calculatedWidth = 0; // needed to keep original width and height in tact since re-drawing after the rotation was calculating based on the rotated width and height
        this._calculatedHeight = 0;
        
        this._points = [
            [], // (originX, originY)
            [], // (endX, endY)
        ];
    }

    debug () {
        if(DEBUG == true) {
            console.log("line(x = " + this.originX + ", y = " + this.originY + ", width = " + this._calculatedWidth + ", height = " + this._calculatedHeight + ")");
        }
    }

    loadIntoContext () {
        this.savePoints();
        this.transform();

        context.beginPath();
        context.moveTo(this._points[0][0], this._points[0][1]);
        context.lineTo(this._points[1][0], this._points[1][1]);
    }

    rotate () {
        // might use this later to rotate around center of line
        // let midpointX = this.originX + Math.abs(this.width - this.originX) / 2;
        // let midpointY = this.originY + Math.abs(this.height - this.originY) / 2;

        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

        // rotate(length of line, length of line, rotation)
        let rotateAroundOrigin = Transform.rotate(this.width - this.originX, this.height - this.originY, rota);
        let translateBack = Transform.translate(rotateAroundOrigin[0][0], rotateAroundOrigin[1][0], this.originX, this.originY);

        this._points[1][0] = translateBack[0][0];
        this._points[1][1] = translateBack[1][0];
    }

    savePoints () {
        this._points = [
            [this.originX, this.originY], // (originX, originY)
            [this.width, this.height]  // (endX, endY)
        ];
    }

    scale () {
        this.width = this.mouseX;
        this.height = this.mouseY;

        this._points[1][0] = this.mouseX;
        this._points[1][1] = this.mouseY;
    }

    translate () {
        let xDistance = this.mouseX - this.originX;
        let yDistance = this.mouseY - this.originY;
        
        let translateOrigin = Transform.translate(this.originX, this.originY, xDistance, yDistance);
        let translateEnd = Transform.translate(this.width, this.height, xDistance, yDistance);
        
        [this._points[0][0], this._points[0][1]] = [translateOrigin[0][0], translateOrigin[1][0]];
        [this._points[1][0], this._points[1][1]] = [translateEnd[0][0], translateEnd[1][0]];
    }
}

class Curve extends Shape {
    constructor(originX, originY, width, height, mouseX, mouseY, strokeColor) {
        super(originX, originY, width, height, mouseX, mouseY, strokeColor);
        this._shapeType = 'curv';

        this._points = [
            [], // origin
            [], // control point 1
            [], // control point 2
            []  // end
        ];
    }

    debug () {
        if(DEBUG == true) {
            console.log("curve(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this._calculatedHeight + ")");
        }
    }

    loadIntoContext () {
        this.savePoints();
        this.transform();

        context.beginPath();
        context.moveTo(this._points[0][0], this._points[0][1]);
        context.bezierCurveTo(this._points[1][0], this._points[1][1], this._points[2][0], this._points[2][1], this._points[3][0], this._points[3][1]);
    }

    savePoints () {
        this._points = [
            [this.originX, this.originY], // (originX, originY)
            [0, 0],
            [0, 0],
            [this.width, this.height]  // (endX, endY)
        ];
    }

    rotate () {
        let controlPoint01X = 0;
        let controlPoint01Y = 0;
        let controlPoint02X = 0;
        let controlPoint02Y = 0;

        controlPoint01X = this.width * 2/5;
        controlPoint01Y = -1 * (this.height + (this.height * 3.6/5));
        controlPoint02X = this.width - (this.width * 2/5);
        controlPoint02Y = this.height + (this.height * 3.6/5);

        // rotation
        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

        // control point 1
        let rotateControlPoint01AroundOrigin = Transform.rotate(controlPoint01X, controlPoint01Y, rota);
        let translateBackControlPoint01 = Transform.translate(rotateControlPoint01AroundOrigin[0][0], rotateControlPoint01AroundOrigin[1][0], this.originX, this.originY);

        this._points[1][0] = translateBackControlPoint01[0][0];
        this._points[1][1] = translateBackControlPoint01[1][0];

        // control point 2
        let rotateControlPoint02AroundOrigin = Transform.rotate(controlPoint02X, controlPoint02Y, rota);
        let translateBackControlPoint02 = Transform.translate(rotateControlPoint02AroundOrigin[0][0], rotateControlPoint02AroundOrigin[1][0], this.originX, this.originY);

        this._points[2][0] = translateBackControlPoint02[0][0];
        this._points[2][1] = translateBackControlPoint02[1][0];
        
        // end
        let endX = this.width;
        let endY = this.height - (this.height * 3.6/5);

        let rotateEndAroundOrigin = Transform.rotate(endX, endY, rota);
        let translateBackEnd = Transform.translate(rotateEndAroundOrigin[0][0], rotateEndAroundOrigin[1][0], this.originX, this.originY);

        this._points[3][0] = translateBackEnd[0][0];
        this._points[3][1] = translateBackEnd[1][0];
    }

    scale () {
        let controlPoint01X = 0;
        let controlPoint01Y = 0;
        let controlPoint02X = 0;
        let controlPoint02Y = 0;
        let translateControlPoint01 = 0;
        let translateControlPoint02 = 0;
        let translateEnd = 0;
        let xDistance = 0;
        let yDistance = 0;
        
        xDistance = this.mouseX - this.originX;
        yDistance = this.mouseY - this.originY;

        this.width = xDistance;
        this.height = yDistance;

        controlPoint01X = this.width * 2/5;
        controlPoint01Y = this.height + (this.height * 3.6/5);
        controlPoint02X = this.width - (this.width * 2/5);
        controlPoint02Y = this.height + (this.height * 3.6/5);
        
        translateControlPoint01 = Transform.translate(this.originX + controlPoint01X, this.originY - controlPoint01Y, xDistance, yDistance);
        translateControlPoint02 = Transform.translate(this.originX + controlPoint02X, this.originY + controlPoint02Y, xDistance, yDistance);
        translateEnd = Transform.translate(this.originX + this.width, this.originY, xDistance, yDistance);
        
        [this._points[0][0], this._points[0][1]] = [this.originX, this.originY];
        [this._points[1][0], this._points[1][1]] = [translateControlPoint01[0][0], translateControlPoint01[1][0]];
        [this._points[2][0], this._points[2][1]] = [translateControlPoint02[0][0], translateControlPoint02[1][0]];
        [this._points[3][0], this._points[3][1]] = [translateEnd[0][0], this.originY];
    }

    translate () {
        // initial logic for drawing a sine wave found here: https://stackoverflow.com/questions/29917446/drawing-sine-wave-in-canvas#answer-53239508

        let controlPoint01X = 0;
        let controlPoint01Y = 0;
        let controlPoint02X = 0;
        let controlPoint02Y = 0;
        let translateOrigin = 0;
        let translateControlPoint01 = 0;
        let translateControlPoint02 = 0;
        let translateEnd = 0;
        let xDistance = 0;
        let yDistance = 0;

        xDistance = this.mouseX - this.originX;
        yDistance = this.mouseY - this.originY;

        controlPoint01X = this.width * 2/5;
        controlPoint01Y = -1 * (this.height + (this.height * 3.6/5)); // this makes the height roughly the same size as other shapes with the same height
        controlPoint02X = this.width - (this.width * 2/5);
        controlPoint02Y = this.height + (this.height * 3.6/5);
        
        translateOrigin = Transform.translate(this.originX, this.originY, xDistance, yDistance);
        translateControlPoint01 = Transform.translate(this.originX + controlPoint01X, this.originY + controlPoint01Y, xDistance, yDistance);
        translateControlPoint02 = Transform.translate(this.originX + controlPoint02X, this.originY + controlPoint02Y, xDistance, yDistance);
        translateEnd = Transform.translate(this.originX + this.width, this.originY, xDistance, yDistance);
        
        [this._points[0][0], this._points[0][1]] = [translateOrigin[0][0], translateOrigin[1][0]];
        [this._points[1][0], this._points[1][1]] = [translateControlPoint01[0][0], translateControlPoint01[1][0]];
        [this._points[2][0], this._points[2][1]] = [translateControlPoint02[0][0], translateControlPoint02[1][0]];
        [this._points[3][0], this._points[3][1]] = [translateEnd[0][0], translateEnd[1][0]];
    }
}

class Rectangle extends Shape {
    constructor(originX = 0, originY = 0, width = 1, height = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'rect';
        this._points = [
            [this.originX, this.originY], // top left
            [this.originX + this.width, this.originY], // top right
            [this.originX + this.width, this.originY + this.height], // bottom right
            [this.originX, this.originY + this.height], // bottom left
        ];
    }

    debug () {
        if(DEBUG == true) {
            console.log("rect(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    loadIntoContext () {
        this.transform();

        context.beginPath();
        context.moveTo(this.originX, this.originY);                 
        context.lineTo(this._points[1][0], this._points[1][1]);    // top
        context.lineTo(this._points[2][0], this._points[2][1]);    // right
        context.lineTo(this._points[3][0], this._points[3][1]);    // bottom
        context.lineTo(this._points[0][0], this._points[0][1]);    // left
    }

    rotate () {
        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

        this._points[0][0] = this.originX;
        this._points[0][1] = this.originY;

        // top right
        let rotateTopRightAroundOrigin = Transform.rotate(this.width, 0, rota);
        let translateBackTopRight = Transform.translate(rotateTopRightAroundOrigin[0][0], rotateTopRightAroundOrigin[1][0], this.originX, this.originY);

        this._points[1][0] = translateBackTopRight[0][0];
        this._points[1][1] = translateBackTopRight[1][0];

        // bottom right
        let rotateBottomRightAroundOrigin = Transform.rotate(this.width, this.height, rota);
        let translateBackBottomRight = Transform.translate(rotateBottomRightAroundOrigin[0][0], rotateBottomRightAroundOrigin[1][0], this.originX, this.originY);

        this._points[2][0] = translateBackBottomRight[0][0];
        this._points[2][1] = translateBackBottomRight[1][0];

        // bottom left
        let rotateBottomLeftAroundOrigin = Transform.rotate(0, this.height, rota);
        let translateBackBottomLeft = Transform.translate(rotateBottomLeftAroundOrigin[0][0], rotateBottomLeftAroundOrigin[1][0], this.originX, this.originY);

        this._points[3][0] = translateBackBottomLeft[0][0];
        this._points[3][1] = translateBackBottomLeft[1][0];
    }

    savePoints () {
        this._points = [
            [this.originX, this.originY], // top left
            [this.originX + this.width, this.originY], // top right
            [this.originX + this.width, this.originY + this.height], // bottom right
            [this.originX, this.originY + this.height], // bottom left
        ];
    }

    scale () {
        this.width = this.mouseX - this.originX;
        this.height = this.mouseY - this.originY;

        this.savePoints();
    }

    translate () {
        let xDistance = this.mouseX - this.originX;
        let yDistance = this.mouseY - this.originY;

        let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
        
        this.originX = tran[0][0];
        this.originY = tran[1][0];

        this.savePoints();
    }
}

class Square extends Rectangle {
    constructor(originX = 0, originY = 0, size = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, size, size, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'squa';
        this._points = [
            [this.originX, this.originY], // top left
            [this.originX + this.width, this.originY], // top right
            [this.originX + this.width, this.originY + this.height], // bottom right
            [this.originX, this.originY + this.height], // bottom left
        ];
    }

    debug () {
        if(DEBUG == true) {
            console.log("squa(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    scale () {
        let tempEnd = this.mouseX - this.originX > this.mouseY - this.originY ? this.mouseX - this.originX : this.mouseY - this.originY;

        this.width = tempEnd;
        this.height = tempEnd;

        this.savePoints();
    }
}

class Triangle extends Shape {
    constructor(originX = 0, originY = 0, width = 1, height = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'tria';
    }

    savePoints () {
        this._points = [
            [this.originX, this.originY], // top left
            [this.originX + this.width, this.originY + this.height], // bottom right
            [this.originX, this.originY + this.height], // bottom left
        ];
    }

    debug () {
        if(DEBUG == true) {
            console.log("triangle(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    loadIntoContext () {
        this.savePoints();
        this.transform();

        context.beginPath();
        context.moveTo(this._points[0][0], this._points[0][1]);
        context.lineTo(this._points[1][0], this._points[1][1]);
        context.lineTo(this._points[2][0], this._points[2][1]);
        context.lineTo(this._points[0][0], this._points[0][1]);
    }

    rotate () {
        let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
        document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

        this.savePoints();

        // bottom right
        let rotateBottomRightAroundOrigin = Transform.rotate(this.width, this.height, rota);
        let translateBackBottomRight = Transform.translate(rotateBottomRightAroundOrigin[0][0], rotateBottomRightAroundOrigin[1][0], this.originX, this.originY);

        this._points[1][0] = translateBackBottomRight[0][0];
        this._points[1][1] = translateBackBottomRight[1][0];

        // bottom left
        let rotateBottomLeftAroundOrigin = Transform.rotate(0, this.height, rota);
        let translateBackBottomLeft = Transform.translate(rotateBottomLeftAroundOrigin[0][0], rotateBottomLeftAroundOrigin[1][0], this.originX, this.originY);

        this._points[2][0] = translateBackBottomLeft[0][0];
        this._points[2][1] = translateBackBottomLeft[1][0];
    }

    scale () {
        this.width = this.mouseX - this.originX;
        this.height = this.mouseY - this.originY;

        this.savePoints();
    }

    translate () {
        let xDistance = this.mouseX - this.originX;
        let yDistance = this.mouseY - this.originY;

        let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
        
        this.originX = tran[0][0];
        this.originY = tran[1][0];

        this.savePoints();
    }
}

class Polyline {
    constructor(originX, originY, points = [], strokeColor) {
        this.originX = originX;
        this.originY = originY;
        this.strokeColor = strokeColor;

        this._shapeType = 'plin';
        this.points = points;
    }

    addLine (mousePressedX, mousePressedY) {
        this.points.push([mousePressedX, mousePressedY]);
    }

    calculateMidPoint () {
        let leftMost = 600; // start at 600 to guarantee a change
        let rightMost = 0;
        let topMost = 0;
        let bottomMost = 600;
        
        for(let i = 0; i < this.points.length; ++i) {
            if(this.points[i][0] > rightMost) {
                rightMost = this.points[i][0];
            } else if (this.points[i][0] < leftMost) {
                leftMost = this.points[i][0];
            }


            if(this.points[i][1] > topMost) {
                topMost = this.points[i][1];
            } else if (this.points[i][1] < bottomMost) {
                bottomMost = this.points[i][1];
            }
        }

        return [rightMost / 2, topMost / 2];
    }

    draw () {
        context.beginPath();
        context.moveTo(this.points[0][0], this.points[0][1]);
        
        for(let i = 1; i < this.points.length; ++i) {
            context.lineTo(this.points[i][0], this.points[i][1]);
        }

        context.strokeStyle = this.strokeColor;
        context.stroke();
    }

    drawTemp (mouseMoveX, mouseMoveY) {
        context.beginPath();
        context.moveTo(this.points[0][0], this.points[0][1]);
        
        for(let i = 1; i < this.points.length; ++i) {
            context.lineTo(this.points[i][0], this.points[i][1]);
        }

        context.lineTo(mouseMoveX, mouseMoveY);

        context.strokeStyle = '#cccccc';
        context.stroke();
    }

    edit (mouseOriginX, mouseOriginY, mouseMoveX, mouseMoveY) {
        let xDistance = mouseMoveX - mouseOriginX;
        let yDistance = mouseMoveY - mouseOriginY;
        let rotation = Trig.calculateRotation(mouseOriginX, mouseOriginY, mouseMoveX, mouseMoveY);

        this.transform(xDistance, yDistance, rotation);
    }

    load (shape) {
        let jsonShape = JSON.parse(shape);
        this.originX = jsonShape.originX;
        this.originY = jsonShape.originY;
        this.points = jsonShape.points;
        this.strokeColor = jsonShape.strokeColor;
    }

    loadIntoContext () {
        context.beginPath();
        context.moveTo(this.points[0][0], this.points[0][1]);
        
        for(let i = 1; i < this.points.length; ++i) {
            context.lineTo(this.points[i][0], this.points[i][1]);
        }
    }

    rotate (rot) {
        document.getElementById('rotation').innerHTML = parseFloat(rot * 180 / Math.PI).toFixed(2) + "°";
        
        for(let i = 0; i < this.points.length; ++i) {
            let rotateAroundOrigin = Transform.rotate(this.points[i][0], this.points[i][1], rot);

            let translateBack = Transform.translate(rotateAroundOrigin[0][0], rotateAroundOrigin[1][0], this.originX, this.originY);

            this.points[i][0] = translateBack[0][0];
            this.points[i][1] = translateBack[1][0];
        }
    }

    save () {
        if(!!Canvas.drawnShapes[0]) {
            Canvas.drawnShapes.push([this._shapeType, currentTool, this.toString()]);
        } else {
            Canvas.drawnShapes[0] = [this._shapeType, currentTool, this.toString()];
        }
    }

    scale (xDistance, yDistance) {
        let midpoint = this.calculateMidPoint();

        for(let i = 0; i < this.points.length; ++i) {
            if(this.points[i][0] < midpoint[0]) {
                this.points[i][0] -= xDistance;
            } else {
                this.points[i][0] += xDistance;
            }

            if(this.points[i][1] < midpoint[1]) {
                this.points[i][1] -= yDistance;
            } else {
                this.points[i][1] += yDistance;
            }
        }
    }

    startDraw () {
        this.points.push([this.originX, this.originY]);
    }

    toJSON () {
        return {
            originX: this.originX,
            originY: this.originY,
            points: this.points,
            strokeColor: this.strokeColor,
        }
    }

    toString () {
        let jsonRep = this.toJSON();
        return JSON.stringify(jsonRep);
    }

    transform (xDistance = 0, yDistance = 0, rotation = 0) {
        switch(currentTool) {
            case 'rota':
                this.rotate(rotation);
                break;
            case 'scal':
                this.scale(xDistance, yDistance);
                break;
            case 'tran':
                this.translate(xDistance, yDistance);
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }
    }
    
    translate (xDistance, yDistance) {
        for(let i = 0; i < this.points.length; ++i) {
            let translateBack = Transform.translate(this.points[i][0], this.points[i][1], xDistance, yDistance);

            this.points[i][0] = translateBack[0][0];
            this.points[i][1] = translateBack[1][0];
        }
    }
}

class Polygon extends Polyline {
    constructor(originX, originY, points = [], strokeColor, fillColor) {
        super(originX, originY, points, strokeColor);

        this.fillColor = fillColor;

        this._shapeType = 'pgon';
    }

    draw () {
        context.beginPath();
        context.moveTo(this.points[0][0], this.points[0][1]);
        
        for(let i = 1; i < this.points.length; ++i) {
            context.lineTo(this.points[i][0], this.points[i][1]);
        }

        context.closePath();

        context.strokeStyle = this.strokeColor;
        context.fillStyle = this.fillColor;
        context.stroke();
        context.fill();
    }

    load (shape) {
        let jsonShape = JSON.parse(shape);
        this.originX = jsonShape.originX;
        this.originY = jsonShape.originY;
        this.points = jsonShape.points;
        this.strokeColor = jsonShape.strokeColor;
        this.fillColor = jsonShape.fillColor;
    }

    toJSON () {
        return {
            originX: this.originX,
            originY: this.originY,
            points: this.points,
            strokeColor: this.strokeColor,
            fillColor: this.fillColor,
        }
    }
}