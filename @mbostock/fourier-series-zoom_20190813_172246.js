// https://observablehq.com/@mbostock/fourier-series-zoom@815
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Fourier Series - Zoom
Inspired by [3Blue1Brown](https://www.youtube.com/watch?v=r6sGWTCMz2k). Portrait of Fourier by [Stuart Jantzen](https://twitter.com/Biocinematics/status/1143334994175283201).`
)});
 
main.variable(observer("viewof zoom")).define("viewof zoom", ["html"], function(html)
{
  const form = html`<form>
  <input name=i type=range min=0 max=10 step=any value=4 style="width:180px;">
  <output style="font-size:smaller;font-style:oblique;" name=o></output>
</form>`;
  form.i.oninput = () => form.o.value = `${(form.value = Math.pow(2, form.i.valueAsNumber)).toFixed(1)}× zoom`;
  form.i.oninput();
  return form;
}
); 

  main.variable(observer("zoom")).define("zoom", ["Generators", "viewof zoom"], (G, _) => G.input(_));
  main.variable(observer()).define(["DOM","width","height","viewof zoom","viewbox","q","M","add","mul","DFT","expim","K","abs","arrow"], function*(DOM,width,height,$0,viewbox,q,M,add,mul,DFT,expim,K,abs,arrow)
{
  const context = DOM.context2d(width, height);
  const R = [];
  context.lineCap = "round";
  context.lineJoin = "round";
  for (let t = 0; true; ++t) {
    const scale = $0.value *0.5* width / viewbox.width;
    const a = t * 2 / q * Math.PI;
    context.save();
    context.clearRect(0, 0, width, height);

    // Calculate the current point.
    let p = [0, 0];
    for (let i = 0; i < M; ++i) {
      p = add(p, mul(DFT[i], expim(a * K[i])));
    }
    // Zoom.
    context.translate(width / 2, height / 2);
    context.scale(scale, scale);
    context.translate(-p[0], -p[1]);

    // Draw circles.
    context.beginPath();
    for (let i = 0, p = [0, 0]; i < M; ++i) {
      const r = abs(DFT[i]);
      context.moveTo(p[0] + r, p[1]);
      context.arc(...p, r, 0, 2 * Math.PI);
      p = add(p, mul(DFT[i], expim(a * K[i])));
    }
    context.lineWidth = 0.5 / scale;
    context.strokeStyle = "#999";
    context.stroke();

    // Draw lines.
    context.beginPath();
    context.moveTo(0, 0);
    for (let i = 0, p = [0, 0]; i < M; ++i) {
      context.lineTo(...p = add(p, mul(DFT[i], expim(a * K[i]))));
    }
    context.lineWidth = 0.75 / scale;
    context.strokeStyle = "#333";
    context.stroke();

    // Draw arrowheads.
    context.beginPath();
    for (let i = 0, p = [0, 0]; i < M; ++i) {
      arrow(context, p, p = add(p, mul(DFT[i], expim(a * K[i]))), {size: 8 / scale});
    }
    context.fillStyle = "#333";
    context.fill();

    // Draw the path.
    if (R.length < q) R.push(p);
    context.beginPath();
    context.moveTo(...R[0]);
    for (let i = 1, n = R.length; i < n; ++i) {
      context.lineTo(...R[i]);
    }
    if (R.length >= q) context.closePath();
    context.lineWidth = 1.5 / scale;
    context.strokeStyle = "#f00";
    context.stroke();

    context.restore();
    yield context.canvas;
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Appendix`
)});
  main.variable(observer("arrow")).define("arrow", function(){return(
function arrow(context, [x0, y0], [x1, y1], {size = 1, delta = Math.PI / 6} = {}){
  const dx = x1 - x0;
  const dy = y1 - y0;
  size = Math.min(size, Math.hypot(dx, dy) / 2);
  const a = Math.atan2(dy, dx);
  const a0 = a - delta;
  const a1 = a + delta;
  context.moveTo(x1 - size * Math.cos(a0), y1 - size * Math.sin(a0));
  context.lineTo(x1, y1);
  context.lineTo(x1 - size * Math.cos(a1), y1 - size * Math.sin(a1));
}
)});
  main.variable(observer("svg")).define("svg", ["DOMParser"], function(DOMParser){return(
fetch("../Fourier/zg1.svg")
  .then(response => response.text())
  .then(text => (new DOMParser).parseFromString(text, "image/svg+xml"))
  .then(svg => svg.documentElement)
)});
  main.variable(observer("path")).define("path", ["svg"], function(svg){return(
svg.querySelector("path")
)});
  main.variable(observer("l")).define("l", ["path"], function(path){return(
path.getTotalLength()
)});
  main.variable(observer("P")).define("P", ["N","path","l","viewbox"], function(N,path,l,viewbox){return(
Array.from({length: N}, (_, i) => {
  const {x, y} = path.getPointAtLength(i / N * l);
  return [x - viewbox.width / 2, y - viewbox.height / 2];
})
)});
  main.variable(observer("K")).define("K", ["M"], function(M){return(
Int16Array.from({length: M}, (_, i) => (1 + i >> 1) * (i & 1 ? -1 : 1))
)});
  main.variable(observer("DFT")).define("DFT", ["K","P","add","mul","expim","N"], function(K,P,add,mul,expim,N){return(
Array.from(K, k => {
  let x = [0, 0];
  for (let i = 0, N = P.length; i < N; ++i) {
    x = add(x, mul(P[i], expim(k * i / N * 2 * -Math.PI)));
  }
  return [x[0] / N, x[1] / N];
})
)});
  main.variable(observer("N")).define("N", function(){return(
1600
)});
  main.variable(observer("M")).define("M", function(){return(
250
)});
  main.variable(observer("q")).define("q", function(){return(
5000
)});
  main.variable(observer("abs")).define("abs", function(){return(
function abs([re, im]) {
  return Math.hypot(re, im);
}
)});
  main.variable(observer("expim")).define("expim", function(){return(
function expim(im) {
  return [Math.cos(im), Math.sin(im)];
}
)});
  main.variable(observer("add")).define("add", function(){return(
function add([rea, ima], [reb, imb]) {
  return [rea + reb, ima + imb];
}
)});
  main.variable(observer("mul")).define("mul", function(){return(
function mul([rea, ima], [reb, imb]) {
  return [rea * reb - ima * imb, rea * imb + ima * reb];
}
)});
  main.variable(observer("viewbox")).define("viewbox", ["svg"], function(svg){return(
svg.viewBox.baseVal
)});
  main.variable(observer("height")).define("height", function(){return(
720
)});
  return main;
}

