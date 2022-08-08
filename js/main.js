// Import our custom CSS
import '../scss/styles.scss'

import PointDefiner from "./point_definer.js";

$(document).ready(function(){
  const canvas = $("#main-canvas")[0];
  let warper = null;

  const holder = document.getElementById('drop-area');

  $('.allow-drag').each(function () {
    this.ondragstart = function (e) {
      e.dataTransfer.setData('text', this.src);
      console.log(e.dataTransfer.getData('text'));
      console.log(e);
    };
  });

  $('.redraw').change(function () {
    if (warper) {
      warper.redraw();
    }
  });

  holder.ondragover = function () { this.className = 'hover'; return false; };
  holder.ondragend = function () { this.className = ''; return false; };
  holder.ondrop = function (e) {
    this.className = '';
    e.stopPropagation();
    e.preventDefault();

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      // Prevent any non-image file type from being read.
      if(!file.type.match(/image.*/)){
          console.log("The dropped file is not an image: ", file.type);
          return;
      }
      reader.onload = function (event) {
        console.log(event.target);
        const img = render(event.target.result, function (imageData) {
          warper = new PointDefiner(canvas, img, imageData);
        });
      };
      reader.readAsDataURL(file);
    } else {
      const src = e.dataTransfer.getData('text');
      const img = render(src, function (imageData) {
        warper = new PointDefiner(canvas, img, imageData);
      });
    }
    return false;
  };
});

const MAX_HEIGHT = 500;

function render(src, callback){
  const image = new Image();
  image.onload = function(){
    const canvas = document.getElementById("myCanvas");
    if(image.height > MAX_HEIGHT) {
      image.width *= MAX_HEIGHT / image.height;
      image.height = MAX_HEIGHT;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    callback(ctx.getImageData(0, 0, image.width, image.height));
  };
  image.src = src;
  return image;
}
