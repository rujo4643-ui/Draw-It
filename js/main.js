const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d", {
    willReadFrequently: true,
});

const widthInput = document.querySelector("#width");
const colorInput = document.querySelector("#color");
const modeInput = document.querySelector("#mode");
const cursor = document.querySelector("#cursor *");
const undo = document.querySelector("#undo");
const redo = document.querySelector("#redo");

canvas.width = 800;
canvas.height = 525;
context.lineCap = "round";
context.lineJoin = "round";

let currentData = -1;
let mode = 0;
let width = 0;
let xPos = 0;
let yPos = 0;
let mouseDown = false;
let datas = [];

//---------------------- Width Input
document.addEventListener("keydown", (event) =>
    event.key == "Enter" ? widthInput.blur() : null
);

const setWidth = (value) => {
    width = Number(value);
    width = width && width > 0 ? width : 5;

    widthInput.value = cursor.style.width = cursor.style.height = `${width}px`;
    context.lineWidth = width;
};

setWidth();
widthInput.addEventListener("blur", () => setWidth(widthInput.value));
widthInput.addEventListener("focus", () => (widthInput.value = ""));

//---------------------- Mode Input
const switchMode = () =>
    (context.strokeStyle = mode === 2 ? "white" : colorInput.value);

colorInput.addEventListener("blur", switchMode);
modeInput.addEventListener("click", () => {
    mode = mode === 1 ? 2 : mode === 2 ? 3 : 1;
    modeInput.style.backgroundImage = `url("src/${mode}.png")`;
    switchMode();
});

//------------------------ Undo/Redo
const theSame = (a, b) => {
    for (let i = 0; i < a.data.length; i++) {
        if (a.data[i] !== b.data[i]) return false;
    }
    return true;
};

const updateButton = () => {
    undo.disabled = currentData <= 0;
    redo.disabled = currentData >= datas.length - 1;
};

const addData = () => {
    const newData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (datas.length > 0 && theSame(newData, datas[currentData])) return;

    datas = datas.slice(0, currentData + 1);
    datas.push(newData);
    currentData++;
    updateButton();
};

const setData = (value) => {
    if (value === 1 && currentData >= datas.length - 1) return;
    if (value === -1 && currentData <= 0) return;

    currentData += value;
    context.putImageData(datas[currentData], 0, 0);
    updateButton();
};

undo.addEventListener("click", () => setData(-1));
redo.addEventListener("click", () => setData(1));

//----------------------- Clear
const clear = () => {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    addData();
};

document.querySelector("#clear").addEventListener("click", clear);
clear();

//---------------------- Mouse Input
canvas.addEventListener("mousedown", () => {
    if (mode != 3) {
        context.beginPath();
    } else {
        context.fillStyle = colorInput.value;
        context.fillFlood(xPos, yPos);
    }

    mouseDown = true;
});

document.addEventListener("mouseup", () => {
    mouseDown = false;
    addData();
});

document.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    xPos = event.clientX - rect.left;
    yPos = event.clientY - rect.top;
});

//----------------------- Save
document.querySelector("#save").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "savedDraw";
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
});

//---------------------- Canvas Function
setInterval(() => {
    cursor.style.left = xPos - width / 2 + "px";
    cursor.style.top = yPos - width / 2 + "px";

    if (mode === 3 || !mouseDown) return;
    context.lineTo(xPos, yPos);
    context.stroke();
}, 1);

//----------------------- Add Function
document.querySelectorAll(".tools").forEach((set) => {
    set.querySelectorAll("button").forEach((tool) => {
        const p = document.createElement("p");
        p.innerText = tool.id.charAt(0).toUpperCase() + tool.id.slice(1);
        tool.appendChild(p);
    });
});
