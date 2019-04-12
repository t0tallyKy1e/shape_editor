var ShapeFunctions = {
    rotate : (x, y, rotation) => {
        let rotation_matrix = [[Math.cos(rotation), -1 * Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]];
        let origin_position_matrix = [[x], [y], [1]];
    
        let new_position = matrix_mult(rotation_matrix, origin_position_matrix);
    
        return new_position;
    },
    
    select : () => {
        if(mouse_is_pressed && select_mode && !!drawn_shapes) {
            let mx = x_pressed;
            let my = y_pressed;
            let shape_found = false;
    
            for(let i = parseInt(drawn_shapes.length) - 1; i > 0 && !shape_found; --i) {
                let x_min = drawn_shapes[i][2][0];
                let x_max = x_min + drawn_shapes[i][2][2];
                let y_min = drawn_shapes[i][2][1];
                let y_max = y_min + drawn_shapes[i][2][2];
    
                [x_max, x_min] = x_max < x_min ? [x_min, x_max] : [x_max, x_min]; // swap values if necessary
    
                [y_max, y_min] = y_max < y_min ? [y_min, y_max] : [y_max, y_min]; // swap values if necessary
    
                let collision = mx >= x_min && mx <= x_max && my >= y_min && my <= y_max ? true : false;
    
                if(collision) {
                    shape_found = true;
                    console.log(x_min + " < " + mx + " < " + x_max);
                    console.log(y_min + " < " + my + " < " + y_max);
                    console.log(drawn_shapes[i]);
                }
            }
        }
        // start at top of array...
        // if mouse is within boundaries of shape... 
        // select
        // *** need to separate select from the rest of the tools probably
    },

    translate : (x, y, translate_x, translate_y) => {
        let translation_matrix = [[1, 0, translate_x], [0, 1, translate_y], [0, 0, 1]];
        let position_matrix = [[x], [y], [1]];
        let new_position = matrix_mult(translation_matrix, position_matrix);

        return new_position;
    }
}

class Shape {
    constructor(x_origin, y_origin, width, height, mouse_x, mouse_y, stroke_color, fill_color) {
        this.x_origin = x_origin;
        this.y_origin = y_origin;
        this.width = width;
        this.height = height;
        this.stroke_color = stroke_color;
        this.fill_color = fill_color;
        this.mouse_x = mouse_x;
        this.mouse_y = mouse_y;
        this._shape_type = 'shap';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                break;
            case 'scal':
                this.width = this.mouse_x - this.x_origin;
                this.height = this.mouse_y - this.y_origin;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;

                let tran = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                
                this.x_origin = tran[0][0];
                this.y_origin = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw rectangle
        context.beginPath();
        context.moveTo(this.x_origin, this.y_origin);
        context.lineTo(this.x_origin + this.width, this.y_origin);
        context.lineTo(this.x_origin + this.width, this.y_origin + this.height);
        context.lineTo(this.x_origin, this.y_origin +this.height);
        context.closePath();
        //context.rect(this.x_origin, this.y_origin, this.width, this.height);
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("rect(x = " + this.x_origin + ", y = " + this.y_origin + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    load = (shape) => {
        let json_shape = JSON.parse(shape);
        this.x_origin = json_shape.x_origin;
        this.y_origin = json_shape.y_origin;
        this.width = json_shape.width;
        this.height = json_shape.height;
        this.mouse_x = json_shape.mouse_x;
        this.mouse_y = json_shape.mouse_y;
        this.stroke_color = json_shape.stroke_color;
        this.fill_color = json_shape.fill_color;
    }

    save = () => {
        if(!!drawn_shapes[0]) { // simplify null, undefined and false to false
            drawn_shapes.push([this._shape_type, current_tool, this.toString()]);
        } else {
            drawn_shapes[0] = [this._shape_type, current_tool, this.toString()];
        }
    }

    toJSON = () => {
        return {
            x_origin: this.x_origin,
            y_origin: this.y_origin,
            width: this.width,
            height: this.height,
            mouse_x: this.mouse_x,
            mouse_y: this.mouse_y,
            stroke_color: this.stroke_color,
            fill_color: this.fill_color,
        }
    }

    toString = () => {
        let jsonRep = this.toJSON();
        return JSON.stringify(jsonRep);
    }
}

class Ellipse extends Shape {
    constructor(x_origin = 0, y_origin = 0, width = 1, height = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, width, height, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'elli';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                break;
            case 'scal':
                let temp_end_x = Math.abs(this.mouse_x - this.x_origin);
                let temp_end_y = Math.abs(this.mouse_y - this.y_origin);
                
                this.width = temp_end_x;
                this.height = temp_end_y;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;

                let tran = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                
                this.x_origin = tran[0][0];
                this.y_origin = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw ellipse
        context.beginPath();
        context.ellipse(this.x_origin, this.y_origin, this.width, this.height, 0, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.x_origin + ", y = " + this.y_origin + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }
}

class Circle extends Ellipse {
    constructor(x_origin = 0, y_origin = 0, radius = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, radius, radius, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'circ';
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                break;
            case 'scal':
                let temp_end = Math.abs(this.mouse_x - this.x_origin) > Math.abs(this.mouse_y - this.y_origin) ? Math.abs(this.mouse_x - this.x_origin) : Math.abs(this.mouse_y - this.y_origin);
                
                this.width = temp_end;
                this.height = temp_end;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;

                let tran = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                
                this.x_origin = tran[0][0];
                this.y_origin = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw circle
        context.beginPath();
        context.ellipse(this.x_origin, this.y_origin, this.width, this.height, 0, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.x_origin + ", y = " + this.y_origin + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }
}

class Line extends Shape {
    constructor(x_origin = 0, y_origin = 0, width = 1, height = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, width, height, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'line';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                // might use this later to rotate around center of line
                // let midpoint_x = this.x_origin + Math.abs(this.width - this.x_origin) / 2;
                // let midpoint_y = this.y_origin + Math.abs(this.height - this.y_origin) / 2;

                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                // rotate(length of line, length of line, rotation)
                let rotate_around_origin = ShapeFunctions.rotate(this.width - this.x_origin, this.height - this.y_origin, rota);
                let tran_back = ShapeFunctions.translate(rotate_around_origin[0][0], rotate_around_origin[1][0], this.x_origin, this.y_origin);

                this.width = tran_back[0][0];
                this.height = tran_back[1][0];

                break;
            case 'scal':
                this.width = this.mouse_x;
                this.height = this.mouse_y;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;
                
                let tran_origin = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                let tran_end = ShapeFunctions.translate(this.width, this.height, x_distance, y_distance);
                
                [this.x_origin, this.y_origin] = [tran_origin[0][0], tran_origin[1][0]];
                [this.width, this.height] = [tran_end[0][0], tran_end[1][0]];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw line
        context.beginPath();
        context.moveTo(this.x_origin, this.y_origin);
        context.lineTo(this.width, this.height);
        context.closePath();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("line(x = " + this.x_origin + ", y = " + this.y_origin + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }
}

class Rectangle extends Shape {
    constructor(x_origin = 0, y_origin = 0, width = 1, height = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, width, height, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'rect';
        this._points = [
            [this.x_origin, this.y_origin], // top left
            [this.x_origin + this.width, this.y_origin], // top right
            [this.x_origin + this.width, this.y_origin + this.height], // bottom right
            [this.x_origin, this.y_origin + this.height], // bottom left
        ];
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                // might use this later to rotate around center of line
                // let midpoint_x = this.x_origin + Math.abs(this.width - this.x_origin) / 2;
                // let midpoint_y = this.y_origin + Math.abs(this.height - this.y_origin) / 2;

                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                // top right
                let rotate_top_right_around_origin = ShapeFunctions.rotate(this.width, 0, rota);
                let tran_back_top_right = ShapeFunctions.translate(rotate_top_right_around_origin[0][0], rotate_top_right_around_origin[1][0], this.x_origin, this.y_origin);

                this._points[1][0] = tran_back_top_right[0][0];
                this._points[1][1] = tran_back_top_right[1][0];

                // bottom right
                let rotate_bottom_right_around_origin = ShapeFunctions.rotate(this.width, this.height, rota);
                let tran_back_bottom_right = ShapeFunctions.translate(rotate_bottom_right_around_origin[0][0], rotate_bottom_right_around_origin[1][0], this.x_origin, this.y_origin);

                this._points[2][0] = tran_back_bottom_right[0][0];
                this._points[2][1] = tran_back_bottom_right[1][0];

                // bottom left
                let rotate_bottom_left_around_origin = ShapeFunctions.rotate(0, this.height, rota);
                let tran_back_bottom_left = ShapeFunctions.translate(rotate_bottom_left_around_origin[0][0], rotate_bottom_left_around_origin[1][0], this.x_origin, this.y_origin);

                this._points[3][0] = tran_back_bottom_left[0][0];
                this._points[3][1] = tran_back_bottom_left[1][0];

                break;
            case 'scal':
                this.width = this.mouse_x - this.x_origin;
                this.height = this.mouse_y - this.y_origin;

                this.recalculatePoints();
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;

                let tran = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                
                this.x_origin = tran[0][0];
                this.y_origin = tran[1][0];

                this.recalculatePoints();
                
                break;
            default:
                this.recalculatePoints();
                break;
        }

        // draw rectangle
        context.beginPath();
        context.moveTo(this.x_origin, this.y_origin);              // top left
        context.lineTo(this._points[1][0], this._points[1][1]);    // top right
        context.lineTo(this._points[2][0], this._points[2][1]);    // bottom right
        context.lineTo(this._points[3][0], this._points[3][1]);    // bottom left
        context.closePath();
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("rect(x = " + this.x_origin + ", y = " + this.y_origin + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }

    recalculatePoints = () => {
        this._points = [
            [this.x_origin, this.y_origin], // top left
            [this.x_origin + this.width, this.y_origin], // top right
            [this.x_origin + this.width, this.y_origin + this.height], // bottom right
            [this.x_origin, this.y_origin + this.height], // bottom left
        ];
    }
}

class Square extends Rectangle {
    constructor(x_origin = 0, y_origin = 0, size = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, size, size, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'squa';
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                break;
            case 'scal':
                this.width = this.mouse_x - this.x_origin > this.mouse_y - this.y_origin ? this.mouse_x - this.x_origin : this.mouse_y - this.y_origin;
                this.height = this.width;

                if(this.mouse_x > this.x_origin && this.mouse_y < this.y_origin) {
                    this.height *= -1;
                } else if(this.mouse_x < this.x_origin && this.mouse_y > this.y_origin) {
                    this.width *= -1;
                }
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;

                let tran = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                
                this.x_origin = tran[0][0];
                this.y_origin = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw square
        context.beginPath();
        context.moveTo(this.x_origin, this.y_origin);
        context.lineTo(this.x_origin + this.width, this.y_origin);
        context.lineTo(this.x_origin + this.width, this.y_origin + this.height);
        context.lineTo(this.x_origin, this.y_origin + this.height);
        context.closePath();
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("square(x = " + this.x_origin + ", y = " + this.y_origin + ", size = " + this.width + ")");
        }
    }
}

class Triangle extends Shape {
    constructor(x_origin = 0, y_origin = 0, width = 1, height = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, width, height, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'tria';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);
                document.getElementById('rotation').innerHTML = parseFloat(rota * 180 / Math.PI).toFixed(2) + "°";

                break;
            case 'scal':
                this.width = this.mouse_x - this.x_origin;
                this.height = this.mouse_y - this.y_origin;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;

                let tran = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                
                this.x_origin = tran[0][0];
                this.y_origin = tran[1][0];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw triangle
        context.beginPath();
        context.moveTo(this.x_origin, this.y_origin);
        context.lineTo(this.x_origin + this.width, this.y_origin + this.height);
        context.lineTo(this.x_origin, this.y_origin + this.height);
        context.lineTo(this.x_origin, this.y_origin);
        context.closePath();
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("triangle(x = " + this.x_origin + ", y = " + this.y_origin + ", width = " + this.width + ", height = " + this.height + ")");
        }
    }
}