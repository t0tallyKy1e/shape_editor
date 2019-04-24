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

    checkCollision (mouseX, mouseY) {
        return mouseX >= this.originX && mouseX <= this.originX + this.width && mouseY >= this.originY && mouseY <= this.originY + this.height;
    }

    draw () {
        switch(currentTool) {
            case 'rota':
                let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                break;
            case 'scal':
                this.width = this.mouseX - this.originX;
                this.height = this.mouseY - this.originY;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;

                let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                
                this.originX = tran[0][0];
                this.originY = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw rectangle
        context.beginPath();
        context.moveTo(this.originX, this.originY);
        context.lineTo(this.originX + this.width, this.originY);
        context.lineTo(this.originX + this.width, this.originY + this.height);
        context.lineTo(this.originX, this.originY +this.height);
        context.closePath();
        //context.rect(this.originX, this.originY, this.width, this.height);
    
        // change fill color
        context.fillStyle = this.fillColor;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("rect(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
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
        context.beginPath();
        context.moveTo(this.originX, this.originY);
        context.lineTo(this.originX + this.width, this.originY);
        context.lineTo(this.originX + this.width, this.originY + this.height);
        context.lineTo(this.originX, this.originY + this.height);
    }

    save () {
        if(!!Canvas.drawnShapes[0]) { // simplify null, undefined and false to false
            Canvas.drawnShapes.push([this._shapeType, currentTool, this.toString()]);
        } else {
            Canvas.drawnShapes[0] = [this._shapeType, currentTool, this.toString()];
        }
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
}

class Ellipse extends Shape {
    constructor(originX = 0, originY = 0, width = 1, height = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'elli';
        this._rotation = 0;
    }

    checkCollision (mouseX, mouseY) {
        return mouseX >= this.originX && mouseX <= this.originX + width && mouseY >= this.originY && mouseY <= this.originY + height;
    }

    draw () {
        switch(currentTool) {
            case 'rota':
                let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                this._rotation = rota;

                break;
            case 'scal':
                let tempEndX = Math.abs(this.mouseX - this.originX);
                let tempEndY = Math.abs(this.mouseY - this.originY);
                
                this.width = tempEndX;
                this.height = tempEndY;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;

                let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                
                this.originX = tran[0][0];
                this.originY = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw ellipse
        context.beginPath();
        context.ellipse(this.originX, this.originY, this.width, this.height, this._rotation, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fillColor;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }
}

class Circle extends Ellipse {
    constructor(originX = 0, originY = 0, radius = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, radius, radius, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'circ';
        this._rotation = 0;
    }

    draw () {
        switch(currentTool) {
            case 'rota':
                let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                this._rotation = rota;

                break;
            case 'scal':
                let tempEnd = Math.abs(this.mouseX - this.originX) > Math.abs(this.mouseY - this.originY) ? Math.abs(this.mouseX - this.originX) : Math.abs(this.mouseY - this.originY);
                
                this.width = tempEnd;
                this.height = tempEnd;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;

                let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                
                this.originX = tran[0][0];
                this.originY = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw circle
        context.beginPath();
        context.ellipse(this.originX, this.originY, this.width, this.height, this._rotation, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fillColor;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
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

    checkCollision (mouseX, mouseY) {
        return mouseX >= this.originX && mouseX <= this.originX + width && mouseY >= this.originY && mouseY <= this.originY + height;
    }

    draw () {
        this.savePoints();

        switch(currentTool) {
            case 'rota':
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

                break;
            case 'scal':
                this.width = this.mouseX;
                this.height = this.mouseY;

                this._points[1][0] = this.mouseX;
                this._points[1][1] = this.mouseY;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;
                
                let translateOrigin = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                let translateEnd = Transform.translate(this.width, this.height, xDistance, yDistance);
                
                [this._points[0][0], this._points[0][1]] = [translateOrigin[0][0], translateOrigin[1][0]];
                [this._points[1][0], this._points[1][1]] = [translateEnd[0][0], translateEnd[1][0]];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw line
        context.beginPath();
        context.moveTo(this._points[0][0], this._points[0][1]);
        context.lineTo(this._points[1][0], this._points[1][1]);
        context.closePath();
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("line(x = " + this.originX + ", y = " + this.originY + ", width = " + this._calculatedWidth + ", height = " + this._calculatedHeight + ")");
        }
    }

    savePoints () {
        this._points = [
            [this.originX, this.originY], // (originX, originY)
            [this.width, this.height]  // (endX, endY)
        ];
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

    draw () {
        this.savePoints();

        switch(currentTool) {
            case 'rota':

                break;
            case 'scal':
                
                break;
            case 'sele':
                break;
            case 'tran':
                // initial logic for drawing a sine wave found here: https://stackoverflow.com/questions/29917446/drawing-sine-wave-in-canvas#answer-53239508

                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;

                let controlPoint01X = this.width * 2/5;
                let controlPoint01Y = -1 * (this.height - (this.height * 2/5));
                let controlPoint02X = this.width - (this.width * 2/5);
                let controlPoint02Y = this.height - (this.height * 2/5);
                
                let translateOrigin = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                let translateControlPoint01 = Transform.translate(this.originX + controlPoint01X, this.originY + controlPoint01Y, xDistance, yDistance);
                let translateControlPoint02 = Transform.translate(this.originX + controlPoint02X, this.originY + controlPoint02Y, xDistance, yDistance);
                let translateEnd = Transform.translate(this.originX + this.width, this.originY, xDistance, yDistance);
                
                [this._points[0][0], this._points[0][1]] = [translateOrigin[0][0], translateOrigin[1][0]];
                [this._points[1][0], this._points[1][1]] = [translateControlPoint01[0][0], translateControlPoint01[1][0]];
                [this._points[2][0], this._points[2][1]] = [translateControlPoint02[0][0], translateControlPoint02[1][0]];
                [this._points[3][0], this._points[3][1]] = [translateEnd[0][0], translateEnd[1][0]];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw line
        context.beginPath();
        context.moveTo(this._points[0][0], this._points[0][1]);
        context.bezierCurveTo(this._points[1][0], this._points[1][1], this._points[2][0], this._points[2][1], this._points[3][0], this._points[3][1]);

        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();

        if(DEBUG == true) {
            console.log("curve(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this._calculatedHeight + ")");
        }
    }

    savePoints () {
        this._points = [
            [this.originX, this.originY], // (originX, originY)
            [0, 0],
            [0, 0],
            [this.width, this.height]  // (endX, endY)
        ];
    }
}

// i want to rewrite the below as n-gons where the number of sides is a new parameter... this will make polygons easier to work with later
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

    checkCollision (mouseX, mouseY) {
        return mouseX >= this.originX && mouseX <= this.originX + width && mouseY >= this.originY && mouseY <= this.originY + height;
    }

    draw () {
        switch(currentTool) {
            case 'rota':
                // might use this later to rotate around center of line
                // let midpointX = this.originX + Math.abs(this.width - this.originX) / 2;
                // let midpointY = this.originY + Math.abs(this.height - this.originY) / 2;

                let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

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

                break;
            case 'scal':
                this.width = this.mouseX - this.originX;
                this.height = this.mouseY - this.originY;

                this.recalculatePoints();
                
                break;
            case 'sele':
                break;
            case 'tran':
                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;

                let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                
                this.originX = tran[0][0];
                this.originY = tran[1][0];

                this.recalculatePoints();
                
                break;
            default:
                this.recalculatePoints();
                break;
        }

        // draw rectangle
        context.beginPath();
        context.moveTo(this.originX, this.originY);              // top left
        context.lineTo(this._points[1][0], this._points[1][1]);    // top right
        context.lineTo(this._points[2][0], this._points[2][1]);    // bottom right
        context.lineTo(this._points[3][0], this._points[3][1]);    // bottom left
        context.closePath();
    
        // change fill color
        context.fillStyle = this.fillColor;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("rect(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    recalculatePoints () {
        this._points = [
            [this.originX, this.originY], // top left
            [this.originX + this.width, this.originY], // top right
            [this.originX + this.width, this.originY + this.height], // bottom right
            [this.originX, this.originY + this.height], // bottom left
        ];
    }
}

class Square extends Rectangle {
    constructor(originX = 0, originY = 0, size = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, size, size, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'squa';
    }
}

class Triangle extends Shape {
    constructor(originX = 0, originY = 0, width = 1, height = 1, mouseX = 0, mouseY = 0, strokeColor = '#000000', fillColor = '#000000') {
        super(originX, originY, width, height, mouseX, mouseY, strokeColor, fillColor);
        this._shapeType = 'tria';
    }

    checkCollision (mouseX, mouseY) {
        return mouseX >= this.originX && mouseX <= this.originX + width && mouseY >= this.originY && mouseY <= this.originY + height;
    }

    draw () {
        switch(currentTool) {
            case 'rota':
                let rota = Trig.calculateRotation(this.originX, this.originY, this.mouseX, this.mouseY);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                this.calculatePoints();

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

                break;
            case 'scal':
                this.width = this.mouseX - this.originX;
                this.height = this.mouseY - this.originY;

                this.calculatePoints();
                
                break;
            case 'sele':
                break;
            case 'tran':
                let xDistance = this.mouseX - this.originX;
                let yDistance = this.mouseY - this.originY;

                let tran = Transform.translate(this.originX, this.originY, xDistance, yDistance);
                
                this.originX = tran[0][0];
                this.originY = tran[1][0];

                this.calculatePoints();
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw triangle
        context.beginPath();

        context.moveTo(this._points[0][0], this._points[0][1]);
        context.lineTo(this._points[1][0], this._points[1][1]);
        context.lineTo(this._points[2][0], this._points[2][1]);
        context.lineTo(this._points[0][0], this._points[0][1]);
        context.closePath();
    
        // change fill color
        context.fillStyle = this.fillColor;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.strokeColor;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("triangle(x = " + this.originX + ", y = " + this.originY + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    calculatePoints () {
        this._points = [
            [this.originX, this.originY], // top left
            [this.originX + this.width, this.originY + this.height], // bottom right
            [this.originX, this.originY + this.height], // bottom left
        ];
    }
}