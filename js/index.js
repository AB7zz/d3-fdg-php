const timeline = document.getElementById('timeline');

const svg = d3.select("body").append("svg")
    .attr("width", 5000)
    .attr("height", 5000)



d3.json("./json/data.json").then(function(json, error){
    if (error){
        console.log(error)
    }
    
    // console.log(json)

    const simulation = d3.forceSimulation(json.nodes)                 
        .force("link", d3.forceLink(json.links).distance(900).strength(0.2))   
        .force("charge", d3.forceManyBody().strength(-120))         
        .force("center", d3.forceCenter(900, 2500))
        .stop()
    
    for (var i = 0; i < 300; ++i) simulation.tick();
    svg.append("svg:defs").append("svg:marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr('refX', -300)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
    const link = svg
        .selectAll("line")
        .data(json.links)
        .enter()
        // .append("line")
        .append("path")
        .style( "stroke", "#000" )
        .attr('marker-start', (d) => "url(#arrow)")//attach the arrow from defs
        .style( "stroke-width", 1.5 );

    function bottomYear(x, y, year){
        svg
            .append('text')
            .text(year)
            .attr('fill', 'red')
            .attr('font-size', '25px')
            .attr('font-weight', 'bold')
            .attr('x', x+120)
            .attr('y', y+200)
    }
    
    const yAxis = []
    const xAxis = []
    const timelineset = []
    let maxyear = 2022
    const node = svg
        .selectAll('foreignObject')
        .data(json.nodes)
        .enter()
        .append('foreignObject')
        // .attr('backusp', d => console.log(d))
        // .attr('source', data => data.source.i)
        .attr('id', data => `${data.id}`)
        .attr('width', 300)
        .attr('height', 205)
        .html( function(data){
            if(data.type == "claim"){
                return '<div class="claimbox tri-right btm-left-in border sb3"><p class="firstline">' + data.snippet + '</p><p class="claimsecondline">'+data.claimer +'</p><hr class="solid"><p class="claimdate">' + data.year + '</p></div>';
            }else if(data.type == "idk2"){
                return '<div class="idk2box tri-right2 btm-left-in2 border2 sb32"><p class="firstline">' + data.snippet + '</p><p class="claimsecondline">'+data.claimer +'</p><hr class="solid"><p class="claimdate">' + data.year + '</p></div>';
            }else if(data.type == "idk"){
                return '<div class="idkbox"><p class="firstline">' + data.snippet + '</p><p class="idksecondline">'+data.claimer +'</p><p class="idkthirdline">Truth value: '+data.claimer +'</p><hr class="solid"><p class="date">' + data.year + '</p></div>';
            }
            else{
                return '<div class="box"><p class="firstline">' + data.snippet + '</p><a style="text-decoration: none" href="' + data.url + '" class="secondline">'+data.url+'</a><hr class="solid"><p class="date">' + data.year + '</p></div>';
            }
        })
        .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
        )
        .attr("x", function(d){
            let xi, month = 0
            $.ajax({
                async: false,
                url: 'php/check.php', 
                type: "POST",
                data: ({id: d.id}),
                success: function(data){
                    if(data == 0){
                        if(d.year == "UNKNOWN"){
                            xi = ((maxyear-2019)*600)+150
                        }else if(d.date){
                            month = parseFloat(d.date.split("-")[1])
                            // console.log(month)
                            xi = ((maxyear-d.year)*600)+150
                        }else{
                            xi = ((maxyear-d.year)*600)+150
                        }
                        xAxis.push(xi)
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
            let i, yi
            $.ajax({
                async: false,
                url: 'php/check.php', 
                type: "POST",
                data: ({id: d.id}),
                success: function(data){
                    if(data == 0){
                        i = 0
                        while(json.nodes[i].id!=d.id){
                            i++
                        }
                        if(d.year == "UNKNOWN"){
                            d.year = 2019
                        }
                        if(!yAxis[maxyear-d.year]){
                            yAxis[maxyear-d.year] = 200
                        }
                        else{
                            yAxis[maxyear-d.year] += 200
                        }
                        yi = yAxis[maxyear-d.year]
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
        .attr('set', function(d) {
            $.ajax({
                url: 'php/insertbox.php', 
                type: "POST",
                data: ({id: d.id, x: d.x, y: d.y, vx: d.vx, vy: d.vy})
            });  
        })
        .attr('timeline', (d) => {
            let ymax=json.nodes[0].y, xmax=json.nodes[0].x
            if(d.year == "UNKNOWN"){
                d.year = 2019
            }
            // $.ajax({
            //     async: false,
            //     url: 'php/check.php', 
            //     type: "POST",
            //     data: ({id: d.id}),
            //     success: function(data){
            //         if(data == 0){
            //             ymax = yAxis.reduce(function(a, b) {
            //                 return Math.max(a, b);
            //             }, -Infinity);
            //             xmax = xAxis.reduce(function(a, b) {
            //                 return Math.max(a, b);
            //             }, -Infinity);
            //         }else{
            //             for(let k = 0; k < json.nodes.length-1; k++){
            //                 for(let l = k+1; l < json.nodes.length; l++){
            //                     if(json.nodes[l].y >= ymax){
            //                         ymax = json.nodes[l].y
            //                     }
            //                     if(json.nodes[l].x >= xmax){
            //                         xmax = json.nodes[l].x
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // })
            for(let l = 1; l < json.nodes.length; l++){
                if(json.nodes[l].y >= ymax){
                    ymax = json.nodes[l].y
                }
                if(json.nodes[l].x >= xmax){
                    xmax = json.nodes[l].x
                }
            }
            if(!timelineset[d.year]){
                bottomYear(d.x, ymax, d.year)
                timelineset[d.year] = true
            }
            svg
                .attr("height", ymax+1000)
                .attr("width", xmax+1000)
        })
    

    let lid;

    link
        // .attr('id', d => `l${d.source.id}${d.index}`)
        // .attr('backup', data => console.log(data))
        .attr("xx1", function(d){
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
        .attr("xy1", function(d){
            $.ajax({
                async: false,
                url: 'php/check.php', 
                type: "POST",
                data: ({id: d.source.id}),
                success: function(data){
                    if(data == 0){
                        y1 = d.source.y+75;
                    }else{
                        y1 = parseFloat(data.split(" ")[1]) + 75;
                    }
                }
            })
            return y1
        })
        .attr("xx2", function(d){
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
        .attr("xy2", function(d){
            $.ajax({
                async: false,
                url: 'php/check.php', 
                type: "POST",
                data: ({id: d.target.id}),
                success: function(data){
                    if(data == 0){
                        y2 = d.target.y+75;
                    }else{
                        y2 = parseFloat(data.split(" ")[1]) + 75;
                    }
                }
            })
            return y2
        })
        .attr( "d", function(d){
            $.ajax({
                async: false,
                url: 'php/check.php', 
                type: "POST",
                data: ({id: d.source.id}),
                success: function(data){
                    if(data == 0){
                        x1 = d.source.x + 150;
                        y1 = d.source.y+75;
                    }else{
                        x1 = parseFloat(data.split(" ")[0])+150;
                        y1 = parseFloat(data.split(" ")[1]) + 75;
                    }
                }
            }),
            $.ajax({
                async: false,
                url: 'php/check.php', 
                type: "POST",
                data: ({id: d.target.id}),
                success: function(data){
                    if(data == 0){
                        x2 = d.target.x+150;
                        y2 = d.target.y+75;
                    }else{
                        x2 = parseFloat(data.split(" ")[0]) + 150;
                        y2 = parseFloat(data.split(" ")[1]) + 75;
                    }
                }
            })
            return "M" + x1 + "," + y1 + ", " + x2 + "," + y2
        })
    link.each(function(d){
        this.classList.add(`l${d.source.id}`)
        this.classList.add(`l${d.target.id}`)
    })
    
    // node
    //     .on('mouseenter', function(){
    //         // console.log(this.id)
    //         let lines = document.getElementsByClassName(`l${this.id}`)
    //         for(let i=0; i<lines.length; i++){
    //             lines[i].style.stroke = 'red'
    //             lines[i].style.strokeWidth = '3'
    //         }
    //     })
    //     .on('mouseleave', function(){
    //         // console.log(this.id)
    //         let lines = document.getElementsByClassName(`l${this.id}`)
    //         for(let i=0; i<lines.length; i++){
    //             lines[i].style.stroke = 'black'
    //             lines[i].style.strokeWidth = '1'
    //         }
    //     })

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
            .attr("xx1", d => d.source.x+150)
            .attr("xx2", d => d.target.x+150)
            .attr("xy1", d => d.source.y+75)
            .attr("xy2", d => d.target.y+75)
            .attr( "d", d => "M" + (d.source.x+150) + "," + (d.source.y+75) + ", " + (d.target.x+150) + "," + (d.target.y+75))

        node
            .attr("x", d => d.x )   
            .attr("y", d => d.y )
    }
})