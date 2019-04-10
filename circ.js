draw_circ = () => {
    switch(current_tool) {
        case 'tran':
            translation = translation(x_pressed, y_pressed, current_size, current_size, x_move, y_move);

            x = translation[0][0][0];
            y = translation[0][1][0];
            radius = translation[1][0][0];

            break;
        
        default:
            console.log("ERROR -> draw_circ(): no tool selected.")
    }

    if(DEBUG == true) {
        console.log("circle(x = " + x + ", y = " + y + ", radius = " + radius + ")");
    }

    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);

    // change fill color
    context.fillStyle = current_fill;
    context.fill();

    // change stroke color
    context.strokeStyle = current_stroke;
    context.stroke();
}