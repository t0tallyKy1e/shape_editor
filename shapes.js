var Shape = {
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
    
    translate : (x, y, width, height, translate_x, translate_y) => {
        let translation_matrix = [[1, 0, translate_x], [0, 1, translate_y], [0, 0, 1]];
        let origin_position_matrix = [[x], [y], [1]];
        let end_position_matrix = [[width], [height], [1]];
    
        let new_origin = matrix_mult(translation_matrix, origin_position_matrix);
        let new_end = matrix_mult(translation_matrix, end_position_matrix);
    
        let matrix = [
            new_origin,
            new_end
        ]
    
        return matrix;
    },
}

class Circle {
    constructor(x_origin = 0, y_origin = 0, radius = 1, trans_x = 0, trans_y = 0, stroke_color = '#000000', fill_color = '#000000') {
        this.x_origin = x_origin;
        this.y_origin = y_origin;
        this.radius = radius;
        this.stroke_color = stroke_color;
        this.fill_color = fill_color;
        this.trans_x = trans_x; // used to store x_move
        this.trans_y = trans_y; // used to store y_move
    }

    draw = () => {
        switch(current_tool) {
            case 'rota':

                break;
            case 'scal':
                let temp_end = Math.abs(this.trans_x - this.x_origin) < Math.abs(this.trans_y - this.y_origin) ? Math.abs(this.trans_y - this.y_origin) : Math.abs(this.trans_x - this.x_origin);
                this.radius = temp_end;
                break;
            case 'sele':
                break;
            case 'tran':
                let tran = Shape.translate(this.x_origin, this.y_origin, this.radius, this.radius, this.trans_x, this.trans_y);
                
                this.x_origin = tran[1][0][0]; // since we're translating... use the coordinates from new_end
                this.y_origin = tran[1][1][0];
                
                break;
            default:
                console.log("Circle.draw() Error: No tool selected.")
                break;
        }

        // draw circle
        context.beginPath();
        context.arc(this.x_origin, this.y_origin, this.radius, 0, 2 * Math.PI);
    
        // change fill color
        context.fillStyle = this.fill_color;
        context.fill();
    
        // change stroke color
        context.strokeStyle = this.stroke_color;
        context.stroke();
    
        if(DEBUG == true) {
            console.log("circle(x = " + this.x_origin + ", y = " + this.y_origin + ", radius = " + this.radius + ")");
        }
    }

    load = (circ) => {
        let json_circ = JSON.parse(circ);
        this.x_origin = json_circ.x_origin;
        this.y_origin = json_circ.y_origin;
        this.radius = json_circ.radius;
        this.trans_x = json_circ.trans_x;
        this.trans_y = json_circ.trans_y;
        this.stroke_color = json_circ.stroke_color;
        this.fill_color = json_circ.fill_color;
    }

    save = () => {
        drawn_shapes.push(['circ', this.toString()]);
    }

    toJSON = () => {
        return {
            x_origin: this.x_origin,
            y_origin: this.y_origin,
            radius: this.radius,
            trans_x: this.trans_x,
            trans_y: this.trans_y,
            stroke_color: this.stroke_color,
            fill_color: this.fill_color,
        }
    }

    toString = () => {
        let jsonRep = this.toJSON();
        return JSON.stringify(jsonRep);
    }
}



rotation = (x, y, width, height, rotation) => {
    let rotation_matrix = [[Math.cos(rotation), -1 * Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]];
    let origin_position_matrix = [[0], [0], [1]];
    let end_position_matrix = [[width-x], [height-y], [1]];

    let new_origin = matrix_mult(rotation_matrix, origin_position_matrix);
    let new_end = matrix_mult(rotation_matrix, end_position_matrix);

    return translation(new_origin[0][0] + width, new_origin[1][0] + height, new_end[0][0], new_end[1][0], 0, 0);
}

translation = (x, y, width, height, translate_x, translate_y) => {
    let translation_matrix = [[1, 0, translate_x], [0, 1, translate_y], [0, 0, 1]];
    let origin_position_matrix = [[x], [y], [1]];
    let end_position_matrix = [[width], [height], [1]];

    let new_origin = matrix_mult(translation_matrix, origin_position_matrix);
    let new_end = matrix_mult(translation_matrix, end_position_matrix);

    let matrix = [
        new_origin,
        new_end
    ]

    return matrix;
}

select = () => {
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
}



// CIRCLE
draw_circ = (x, y, size, trans_x, trans_y) => {
    switch(current_tool) {
        case 'tran':
            tran = translation(trans_x, trans_y, size / 2, size / 2, 0, 0);

            x = tran[0][0][0];
            y = tran[0][1][0];
            radius = size / 2;

            break;
        
        case 'rota':
            let rot = calculate_rotation(x, y, trans_x, trans_y);

            break;

        case 'scal':
            let temp_end = Math.abs(trans_x - x) < Math.abs(trans_y - y) ? Math.abs(trans_y - y) : Math.abs(trans_x - x);
            radius = temp_end;
            break;

        case 'sele':
            break;

        default:
            console.log("ERROR -> draw_circ(): no tool selected.");
            break;
    }

    // draw circle
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();

    if(DEBUG == true) {
        console.log("circle(x = " + x + ", y = " + y + ", radius = " + radius + ")");
    }

    temp_shape = ['circ', current_tool, [x, y, size, trans_x, trans_y], current_fill, current_stroke];
}

// ELLIPSE
draw_elli = (x, y, size_x, size_y, trans_x, trans_y) => {
    switch(current_tool) {
        case 'rota':
            break;

        case 'scal':
            let temp_end_x = Math.abs(trans_x - x);
            let temp_end_y = Math.abs(trans_y - y);
            radius_x = temp_end_x;
            radius_y = temp_end_y;

            break;

        case 'sele':
            break;

        case 'tran':
            tran = translation(trans_x, trans_y, size_x / 2, size_y / 2, 0, 0);

            x = tran[0][0][0];
            y = tran[0][1][0];
            radius_x = size_x / 2;
            radius_y = size_y / 2;

            break;
        
        default:
            console.log("ERROR -> draw_elli(): no tool selected.");
            break;
    }

    // draw ellipse
    context.beginPath();
    context.ellipse(x, y, radius_x, radius_y, 0, 0, 2 * Math.PI);

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();

    if(DEBUG == true) {
        console.log("ellipse(x = " + x + ", y = " + y + ", radius_x = " + radius_x + ", radius_y = " + radius_y + ")");
    }

    temp_shape = ['elli', current_tool, [x, y, size_x, size_y, trans_x, trans_y], current_fill, current_stroke];
}

// LINE
draw_line = (x, y, size_x, size_y, end_x, end_y) => {
    switch(current_tool) {
        case 'tran':
            tran = translation(end_x, end_y, end_x + size_x, end_y + size_y, 0, 0);

            x = end_x;
            y = end_y;

            end_x = x + size_x;
            end_y = y + size_y;

            break;

        case 'rota':
            let rot = calculate_rotation(x, y, trans_x, trans_y);
            let rot_matrix = rotation(x, y, trans_x, trans_y, rot);

            console.log(rot_matrix);

            x = rot_matrix[0][0][0];
            y = rot_matrix[0][1][0];

            end_x = rot_matrix[1][0][0];
            end_y = rot_matrix[1][1][0];

            if(DEBUG) {
                console.log("rotation: " + radians_to_degrees(rot));
            }

            break;

        case 'scal':
            end_x = trans_x;
            end_y = trans_y;

            break;
        
        default:
            console.log("ERROR -> draw_line(): no tool selected.");
            break;
    }

    // draw line
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(end_x, end_y);
    context.closePath();

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();

    if(DEBUG == true) {
        console.log("line(x = " + x + ", y = " + y + ", end_x = " + end_x + ", end_y = " + end_y + ")");
    }

    temp_shape = ['line', current_tool, [x, y, size_x, size_y, end_x, end_y], current_fill, current_stroke];
}

// RECTANGLE
draw_rect = (x, y, width, height, trans_x, trans_y) => {
    switch(current_tool) {
        case 'rota':
            break;

        case 'scal':
            let temp_end_x = trans_x - x;
            let temp_end_y = trans_y - y;
            width = temp_end_x;
            height = temp_end_y;

            break;

        case 'sele':
            break;

        case 'tran':
            tran = translation(trans_x, trans_y, width, height, 0, 0);

            x = tran[0][0][0];
            y = tran[0][1][0];
            width = tran[1][0][0];
            height = tran[1][1][0];
            break;
        
        default:
            console.log("ERROR -> draw_rect(): no tool selected.");
            break;
    }

    // draw rectangle
    context.rect(x, y, width, height);

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();

    if(DEBUG == true) {
        console.log("rect(x = " + x + ", y = " + y + ", width = " + width + ", height = " + height + ")");
    }

    temp_shape = ['rect', current_tool, [x, y, width, height, trans_x, trans_y], current_fill, current_stroke];
}

// SQUARE
draw_squa = (x, y, size, trans_x, trans_y) => {
    switch(current_tool) {
        case 'rota':
            break;

        case 'scal':
            let temp_end = Math.abs(trans_x - x) < Math.abs(trans_y - y) ? trans_y - y : trans_x - x;

            size = temp_end;

            break;

        case 'sele':
            break;

        case 'tran':
            tran = translation(trans_x, trans_y, size, size, 0, 0);

            x = tran[0][0][0];
            y = tran[0][1][0];
            width = tran[1][0][0];
            height = tran[1][1][0];
            break;
        
        default:
            console.log("ERROR -> draw_squa(): no tool selected.");
            break;
    }

    // draw rectangle
    context.rect(x, y, size, size);

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();

    if(DEBUG == true) {
        console.log("squa(x = " + x + ", y = " + y + ", size = " + size + ")");
    }

    temp_shape = ['squa', current_tool, [x, y, size, trans_x, trans_y], current_fill, current_stroke];
}

// TRIANGLE
draw_tria = (x, y, size_x, size_y, trans_x, trans_y) => {
    switch(current_tool) {
        case 'rota':
            break;

        case 'scal':
            let temp_end = Math.abs(trans_x - x) < Math.abs(trans_y - y) ? trans_y - y : trans_x - x;

            size_x = trans_x - x;
            size_y = trans_y - y;

            break;

        case 'sele':
            break;

        case 'tran':
            tran = translation(trans_x, trans_y, size_x, size_y, 0, 0);

            x = tran[0][0][0];
            y = tran[0][1][0];
            break;
        
        default:
            console.log("ERROR -> draw_rect(): no tool selected.");
            break;
    }

    // draw triangle
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + size_x, y + size_y);
    context.lineTo(x, y + size_y);
    context.closePath();

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();

    if(DEBUG == true) {
        console.log("tria(x = " + x + ", y = " + y + ", size_x = " + size_x + ", size_y = " + size_y + ")");
    }

    temp_shape = ['tria', current_tool, [x, y, size_x, size_y, trans_x, trans_y], current_fill, current_stroke];
}