var ShapeFunctions = {
    rotate : (x, y, width, height, rotation) => {
        let rotation_matrix = [[Math.cos(rotation), -1 * Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]];
        let origin_position_matrix = [[0], [0], [1]];
        let end_position_matrix = [[width-x], [height-y], [1]];
    
        let new_origin = matrix_mult(rotation_matrix, origin_position_matrix);
        let new_end = matrix_mult(rotation_matrix, end_position_matrix);
    
        return translation(new_origin[0][0] + width, new_origin[1][0] + height, new_end[0][0], new_end[1][0], 0, 0);
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

class Ellipse {
    constructor(x_origin = 0, y_origin = 0, radius_x = 1, radius_y, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        this.x_origin = x_origin;
        this.y_origin = y_origin;
        this.radius_x = radius_x;
        this.radius_y = radius_y;
        this.stroke_color = stroke_color;
        this.fill_color = fill_color;
        this.mouse_x = mouse_x; // used to store x_move
        this.mouse_y = mouse_y; // used to store y_move
        this._shape_type = 'elli';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + radius_x && mouseY >= this.y_origin && mouseY <= this.y_origin + radius_y;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);

                break;
            case 'scal':
                let temp_end_x = Math.abs(this.mouse_x - this.x_origin);
                let temp_end_y = Math.abs(this.mouse_y - this.y_origin);
                
                this.radius_x = temp_end_x;
                this.radius_y = temp_end_y;
                
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
        context.ellipse(this.x_origin, this.y_origin, this.radius_x, this.radius_y, 0, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.x_origin + ", y = " + this.y_origin + ", radius_x = " + this.radius_x + ", radius_y = " + this.radius_y + ")");
        }
    }

    load = (circ) => {
        let json_circ = JSON.parse(circ);
        this.x_origin = json_circ.x_origin;
        this.y_origin = json_circ.y_origin;
        this.radius_x = json_circ.radius_x;
        this.radius_y = json_circ.radius_y;
        this.mouse_x = json_circ.mouse_x;
        this.mouse_y = json_circ.mouse_y;
        this.stroke_color = json_circ.stroke_color;
        this.fill_color = json_circ.fill_color;
    }

    save = () => {
        if(!!drawn_shapes[0]) { // simplify null, undefined and false to false
            drawn_shapes.push([this._shape_type, this.toString()]);
        } else {
            drawn_shapes[0] = [this._shape_type, this.toString()];
        }
    }

    toJSON = () => {
        return {
            x_origin: this.x_origin,
            y_origin: this.y_origin,
            radius_x: this.radius_x,
            radius_y: this.radius_y,
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

class Circle extends Ellipse {
    constructor(x_origin = 0, y_origin = 0, radius = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, radius, radius, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'circ';
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);

                break;
            case 'scal':
                let temp_end = Math.abs(this.mouse_x - this.x_origin) > Math.abs(this.mouse_y - this.y_origin) ? Math.abs(this.mouse_x - this.x_origin) : Math.abs(this.mouse_y - this.y_origin);
                
                this.radius_x = temp_end;
                this.radius_y = temp_end;
                
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
        context.ellipse(this.x_origin, this.y_origin, this.radius_x, this.radius_y, 0, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.x_origin + ", y = " + this.y_origin + ", radius_x = " + this.radius_x + ", radius_y = " + this.radius_y + ")");
        }
    }
}

class Line {
    constructor(x_origin = 0, y_origin = 0, x_end = 1, y_end = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000') {
        this.x_origin = x_origin;
        this.y_origin = y_origin;
        this.x_end = x_end;
        this.y_end = y_end;
        this.stroke_color = stroke_color;
        this.mouse_x = mouse_x; // used to store x_move
        this.mouse_y = mouse_y; // used to store y_move
        this._shape_type = 'line';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + x_end && mouseY >= this.y_origin && mouseY <= this.y_origin + y_end;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);

                break;
            case 'scal':
                this.x_end = this.mouse_x;
                this.y_end = this.mouse_y;
                
                break;
            case 'sele':
                break;
            case 'tran':
                let x_distance = this.mouse_x - this.x_origin;
                let y_distance = this.mouse_y - this.y_origin;
                
                let tran_origin = ShapeFunctions.translate(this.x_origin, this.y_origin, x_distance, y_distance);
                let tran_end = ShapeFunctions.translate(this.x_end, this.y_end, x_distance, y_distance);
                
                [this.x_origin, this.y_origin] = [tran_origin[0][0], tran_origin[1][0]];
                [this.x_end, this.y_end] = [tran_end[0][0], tran_end[1][0]];
                
                break;
            default:
                // hits this when drawing previously drawn shape
                break;
        }

        // draw line
        context.beginPath();
        context.moveTo(this.x_origin, this.y_origin);
        context.lineTo(this.x_end, this.y_end);
        context.closePath();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("line(x = " + this.x_origin + ", y = " + this.y_origin + ", x_end = " + this.x_end + ", y_end = " + this.y_end + ")");
        }
    }

    load = (rect) => {
        let json_rect = JSON.parse(rect);
        this.x_origin = json_rect.x_origin;
        this.y_origin = json_rect.y_origin;
        this.x_end = json_rect.x_end;
        this.y_end = json_rect.y_end;
        this.mouse_x = json_rect.mouse_x;
        this.mouse_y = json_rect.mouse_y;
        this.stroke_color = json_rect.stroke_color;
    }

    save = () => {
        if(!!drawn_shapes[0]) { // simplify null, undefined and false to false
            drawn_shapes.push([this._shape_type, this.toString()]);
        } else {
            drawn_shapes[0] = [this._shape_type, this.toString()];
        }
    }

    toJSON = () => {
        return {
            x_origin: this.x_origin,
            y_origin: this.y_origin,
            x_end: this.x_end,
            y_end: this.y_end,
            mouse_x: this.mouse_x,
            mouse_y: this.mouse_y,
            stroke_color: this.stroke_color
        }
    }

    toString = () => {
        let jsonRep = this.toJSON();
        return JSON.stringify(jsonRep);
    }
}

class Rectangle {
    constructor(x_origin = 0, y_origin = 0, width = 1, height = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        this.x_origin = x_origin;
        this.y_origin = y_origin;
        this.width = width;
        this.height = height;
        this.stroke_color = stroke_color;
        this.fill_color = fill_color;
        this.mouse_x = mouse_x; // used to store x_move
        this.mouse_y = mouse_y; // used to store y_move
        this._shape_type = 'rect';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);

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

    load = (rect) => {
        let json_rect = JSON.parse(rect);
        this.x_origin = json_rect.x_origin;
        this.y_origin = json_rect.y_origin;
        this.width = json_rect.width;
        this.height = json_rect.height;
        this.mouse_x = json_rect.mouse_x;
        this.mouse_y = json_rect.mouse_y;
        this.stroke_color = json_rect.stroke_color;
        this.fill_color = json_rect.fill_color;
    }

    save = () => {
        if(!!drawn_shapes[0]) { // simplify null, undefined and false to false
            drawn_shapes.push([this._shape_type, this.toString()]);
        } else {
            drawn_shapes[0] = [this._shape_type, this.toString()];
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

class Square extends Rectangle {
    constructor(x_origin = 0, y_origin = 0, size = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        super(x_origin, y_origin, size, size, mouse_x, mouse_y, stroke_color, fill_color);
        this._shape_type = 'squa';
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);

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

class Triangle {
    constructor(x_origin = 0, y_origin = 0, width = 1, height = 1, mouse_x = 0, mouse_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        this.x_origin = x_origin;
        this.y_origin = y_origin;
        this.width = width;
        this.height = height;
        this.stroke_color = stroke_color;
        this.fill_color = fill_color;
        this.mouse_x = mouse_x; // used to store x_move
        this.mouse_y = mouse_y; // used to store y_move
        this._shape_type = 'tria';
    }

    checkCollision = (mouseX, mouseY) => {
        return mouseX >= this.x_origin && mouseX <= this.x_origin + width && mouseY >= this.y_origin && mouseY <= this.y_origin + height;
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':
                let rota = calculate_rotation(this.x_origin, this.y_origin, this.mouse_x, this.mouse_y);

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
        //context.rect(this.x_origin, this.y_origin, this.width, this.height);
    
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

    load = (rect) => {
        let json_rect = JSON.parse(rect);
        this.x_origin = json_rect.x_origin;
        this.y_origin = json_rect.y_origin;
        this.width = json_rect.width;
        this.height = json_rect.height;
        this.mouse_x = json_rect.mouse_x;
        this.mouse_y = json_rect.mouse_y;
        this.stroke_color = json_rect.stroke_color;
        this.fill_color = json_rect.fill_color;
    }

    save = () => {
        if(!!drawn_shapes[0]) { // simplify null, undefined and false to false
            drawn_shapes.push([this._shape_type, this.toString()]);
        } else {
            drawn_shapes[0] = [this._shape_type, this.toString()];
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