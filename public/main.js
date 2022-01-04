var socket = io();
function getImageDimensions(image) {
  return new Promise((resolve, reject) => {
    image.onload = function (e) {
      const width = this.width;
      const height = this.height;
      resolve({ height, width });
    };
  });
}
function compressImage(image, scale, initalWidth, initalHeight) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");

    canvas.width = scale * initalWidth;
    canvas.height = scale * initalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    ctx.canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}
const imageInput = document.getElementById("files");
var img = null;

imageInput.addEventListener("change", async (ev) => {
  const uploadedImage = imageInput.files[0];
  if (!uploadedImage) {
    // if no file is uploaded, no need to do anything
    return;
  }

  // preview the inputted image
  const inputPreview = document.createElement("img");
  inputPreview.src = URL.createObjectURL(uploadedImage);

  //get the dimensions of the input image
  const { height, width } = await getImageDimensions(inputPreview);
  const MAX_WIDTH = 500; //if we resize by width, this is the max width of compressed image
  const MAX_HEIGHT = (height / width + 1) * MAX_WIDTH;
  const widthRatioBlob = await compressImage(
    inputPreview,
    MAX_WIDTH / width,
    width,
    height
  );
  const heightRatioBlob = await compressImage(
    inputPreview,
    MAX_HEIGHT / height,
    width,
    height
  );

  //pick the smaller blob between both
  const compressedBlob =
    widthRatioBlob.size > heightRatioBlob.size
      ? heightRatioBlob
      : widthRatioBlob;
  const optimalBlob =
    compressedBlob.size < uploadedImage.size ? compressedBlob : uploadedImage;
  img = URL.createObjectURL(optimalBlob);
});

socket.emit("joining msg", userName);

// $("#files").on("change", function (e) {
//   console.log("hello");
//   var data = e.originalEvent.target.files[0];
//   var reader = new FileReader();
//   reader.onload = function (evt) {
//     var msg = {};
//     msg.file = evt.target.result;
//     msg.fileName = data.name;
//     img = msg;
//     console.log(img);
//   };
//   reader.readAsDataURL(data);
// });
$("form").submit(function (e) {
  e.preventDefault();
  socket.emit("chat message", userName + ": " + $("#m").val());
  if (img !== null) {
    socket.emit("base64 file", img);
    $("#messages").append(
      `<div class="imag self-img"><img src=${img} alt="Red dot" /></div>`
    );
    img = null;
    document.getElementById("files").value = null;
  }
  //emit only sends to everyone
  $("#messages").append($('<div class = "msg self">').text($("#m").val()));
  $("#m").val("");
  window.scrollTo(0, 1000);
  return false;
});
socket.on("chat message", function (msg) {
  $("#messages").append($('<div class = "msg">').text(msg));
  window.scrollTo(0, 1000);
});
socket.on("chat message conn", function (msg) {
  $("#messages").append($('<div class = "conn msg">').text(msg));
  window.scrollTo(0, 1000);
});
// showing media to ui
socket.on("base64 image", (msg) => {
  console.log("as", msg);
  $("#messages").append(
    `<div class="imag"><img src=${msg}  alt="Red dot" /></div>`
  );
  window.scrollTo(0, 1000);
  //scrollToBottom();
});
