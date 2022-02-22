<?php include 'db/db.php'; ?>
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>

    <title>FDG</title>
    <style>
        body{
            background-color: lightgray;
        }
        .box {
            width: 200px;
            background-color: white;
            border: 2px solid black;
            padding: 10px 50px 10px 20px;
            margin: 10px;
        }
        .box:hover{
            cursor: pointer;
        }
        .firstline{
            font-size: 10px;
            font-weight: bold;
        }
        .secondline{
            font-size: 10px;
            color: #50A7FF;
            font-weight: bold;
        }
        .date{
            color: red;
            font-size: 10px;
            font-weight: bold;
        }
        
        line {
          stroke: #000;
          stroke-width: 1.5px;
        }

        .hide{
            display: none;
        }
        
    </style>
</head>
<body>
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-drag@3"></script>
<script>
    const width = 2400,
    height = 1000,
    radius = 6;

    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)

    d3.json("data.json").then(function(json, error){
        if (error){
            console.log(error)
        }

        const simulation = d3.forceSimulation(json.nodes)                 
            .force("link", d3.forceLink(json.links).distance(900).strength(0.2))   
            .force("charge", d3.forceManyBody().strength(-120))         
            .force("center", d3.forceCenter(900, height / 2))
            .stop()
        
        for (var i = 0; i < 300; ++i) simulation.tick();

        const link = svg
            .selectAll("line")
            .data(json.links)
            .enter()
            .append("line")
            .attr('lid', data => data.index)
            .attr("x1", function(d){
                $.ajax({
                    async: false,
                    url: 'php/check.php', 
                    type: "POST",
                    data: ({id: d.source.id}),
                    success: function(data){
                        if(data == 0){
                            x1 = d.source.x + 150;
                        }else{
                            x1 = parseFloat(data.split(" ")[0])+150;
                        }
                    }
                })
                return x1
            })
            .attr("y1", function(d){
                $.ajax({
                    async: false,
                    url: 'php/check.php', 
                    type: "POST",
                    data: ({id: d.source.id}),
                    success: function(data){
                        if(data == 0){
                            y1 = d.source.y+100;
                        }else{
                            y1 = parseFloat(data.split(" ")[1]) + 100;
                        }
                    }
                })
                return y1
            })
            .attr("x2", function(d){
                $.ajax({
                    async: false,
                    url: 'php/check.php', 
                    type: "POST",
                    data: ({id: d.target.id}),
                    success: function(data){
                        if(data == 0){
                            x2 = d.target.x+150;
                        }else{
                            x2 = parseFloat(data.split(" ")[0]) + 150;
                        }
                    }
                })
                return x2
            })
            .attr("y2", function(d){
                $.ajax({
                    async: false,
                    url: 'php/check.php', 
                    type: "POST",
                    data: ({id: d.target.id}),
                    success: function(data){
                        if(data == 0){
                            y2 = d.target.y+100;
                        }else{
                            y2 = parseFloat(data.split(" ")[1]) + 100;
                        }
                    }
                })
                return y2
            })

        const node = svg
            .selectAll('foreignObject')
            .data(json.nodes)
            .enter()
            .append('foreignObject')
            .attr('bid', data => data.id)
            .attr('width', 300)
            .attr('height', 200)
            .html( function(data){
                return '<div class="box"><p class="firstline">' + data.snippet + '</p><a style="text-decoration: none" href="' + data.url + '" class="secondline">'+data.url+'</a><hr class="solid"><p class="date">' + data.year + '</p></div>';
            })
            .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            )
            .attr("x", function(d){
                $.ajax({
                    async: false,
                    url: 'php/check.php', 
                    type: "POST",
                    data: ({id: d.id}),
                    success: function(data){
                        if(data == 0){
                            xi = d.x
                        }else{
                            xi = data.split(" ")[0];
                            vxi = data.split(" ")[2];
                            d.vx = parseFloat(vxi)
                        }
                    }
                })
                d.x = parseFloat(xi)
                return xi;
            })
            .attr("y", function(d){
                $.ajax({
                    async: false,
                    url: 'php/check.php', 
                    type: "POST",
                    data: ({id: d.id}),
                    success: function(data){
                        if(data == 0){
                            yi = d.y
                        }else{
                            yi = data.split(" ")[1];
                            vyi = data.split(" ")[3];
                            d.vy = parseFloat(vyi)
                        }
                    }
                })
                d.y = parseFloat(yi)
                return yi;  
            })

        let id, x, y, vx, vy;
        function dragstarted(event, d) {
            d3.select(this)
                .attr("fx", d.x = event.x )
                .attr("fy", d.y = event.y )
            
           ticked()
        }

        function dragged(event, d) { 
            d3.select(this)
                .attr("fx", d.x = event.x )
                .attr("fy", d.y = event.y )
            
            ticked()
        }

        function dragended(event, d) {
            d3.select(this)
                .attr("fx", d.x = event.x )
                .attr("fy", d.y = event.y )
                .attr('lol', id = d.id, x=d.x, y=d.y, vx=d.vx, vy=d.vy )
            
            ticked()

            $.ajax({
                url: 'php/insertbox.php', 
                type: "POST",
                data: ({id: id, x: x, y: y, vx: vx, vy: vy}),
                success: function(data){
                }
            });  
        }

        function ticked() {
            link
                .attr("x1", d => d.source.x+150)
                .attr("x2", d => d.target.x+150)
                .attr("y1", d => d.source.y+100)
                .attr("y2", d => d.target.y+100)

            node
                .attr("x", d => d.x )   
                .attr("y", d => d.y )
        }
    })
</script>