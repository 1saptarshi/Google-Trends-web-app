// script.js
document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('chart').innerHTML = '';
  
    try {
      const data = await fetchGoogleTrendsData(query);
      renderChart(data);
    } catch (error) {
      document.getElementById('error').innerText = 'Error fetching data. Please try again.';
      document.getElementById('error').classList.remove('hidden');
    } finally {
      document.getElementById('loading').classList.add('hidden');
    }
  });
  
  async function fetchGoogleTrendsData(query) {
    const response = await fetch(`https://google-trends.p.rapidapi.com/trends/api/explore?hl=en-US&tz=-480&req=%7B%22comparisonItem%22:%5B%7B%22keyword%22:%22${query}%22,%22geo%22:%22US%22,%22time%22:%22today%2012-m%22%7D%5D,%22category%22:0,%22property%22:%22%22%7D&tz=360`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '6de8792afemshe065c436d055bffp18cf0fjsne28250d611df', // add actual RapidAPI key
        'X-RapidAPI-Host': 'google-trends8.p.rapidapi.com'
      }
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.default.timelineData.map(item => ({
      date: new Date(item.formattedTime),
      value: item.value[0]
    }));
  }
  
  function renderChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select('#chart').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height, 0]);
  
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')));
  
    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));
  
    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', 'blue');
  
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .text('Date');
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .text('Value');
  }
  
  function initWebGL() {
    const canvas = document.getElementById('webgl-container');
    canvas.width = 600;
    canvas.height = 400;
    const gl = canvas.getContext('webgl');
  
    if (!gl) {
      console.error('WebGL not supported, falling back on experimental-webgl');
      gl = canvas.getContext('experimental-webgl');
    }
  
    if (!gl) {
      alert('Your browser does not support WebGL');
    }
  
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Define vertices of a triangle
    const vertices = new Float32Array([
      0.0,  1.0,
      -1.0, -1.0,
      1.0, -1.0
    ]);
  
    // Create a buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
    // Vertex shader source code
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
  
    // Fragment shader source code
    const fragmentShaderSource = `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `;
  
    // Compile shaders and create a program
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
  
    // Use the program
    gl.useProgram(program);
  
    // Bind the buffer and set the attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  
    function compileShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
  
    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }
  }
  
  initWebGL();
  