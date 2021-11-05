/*
 * @Description:主要函数
 * @Version: 1.0
 * @Autor: ln
 */
var grids = new Array(); //记录格子的二维数组，0-空白、1-机身、2-机头
var opened = new Array(); //记录打开的格子，0-未打开、1-已打开
var planes = [
  [-1, -1],
  [-1, -1],
  [-1, -1],
]; //记录飞机的类型和旋转
var types = [
  [
    [0, 0, 2, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 0, 2, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 0, 0, 2, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0],
  ],
  [
    [0, 0, 2, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
  ],
]; //记录四种飞机的初始格子
var gameMain = document.getElementById("main"); //游戏区域
var step = document.getElementById("step"); //显示步数的区域
var steps = 0; //记录步数
var records = 0; //记录历史最快找到的步数
var finded = 0; //记录找到的个数
var row_len = 0; //记录游戏区域总行数
var col_len = 0; //记录游戏区域总列数
var num = 0; //记录飞机的总个数

//初始化，随机生成飞机
function init(row, col, n) {
  //row (int) : 行数。
  //col (int) : 列数。
  //n (int) : 飞机数量。

  let html = "";
  row_len = row;
  col_len = col;
  num = n;
  for (let i = 0; i < row; i++) {
    grids[i] = new Array();
    opened[i] = new Array();
    for (let j = 0; j < col; j++) {
      grids[i][j] = 0;
      opened[i][j] = 0;
    }
  }
  steps = 0;
  finded = 0;
  step.innerHTML = "步数：&ensp;" + steps;

  choosePlane();
  for (let index = 0; index < 3; index++) {
    placePlane(index);
  }

  for (let i = 0; i < row; i++) {
    html += "<tr>";
    for (let j = 0; j < col; j++) {
      html += '<td id="' + i + "," + j + '"></td>';
    }
    html += "</tr>";
  }
  gameMain.innerHTML = html;
  gameMain.style["background-color"] = "gray";
  gameMain.style["pointer-events"] = "initial";
  bindResponseToClick();

  //禁用右键菜单
  document.oncontextmenu = function () {
    return false;
  };
}

//生成[minNum,maxNum]的随机数
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}

//随机选三架飞机
function choosePlane() {
  let i = randomNum(1, 4);
  let r = randomNum(0, 3);
  let image = document.getElementById("arrange-1");
  image.src = "./img/type-" + i + ".png";
  planes[0] = [i - 1, r];
  i = randomNum(1, 4);
  r = randomNum(0, 3);
  image = document.getElementById("arrange-2");
  image.src = "./img/type-" + i + ".png";
  planes[1] = [i - 1, r];
  i = randomNum(1, 4);
  r = randomNum(0, 3);
  image = document.getElementById("arrange-3");
  image.src = "./img/type-" + i + ".png";
  planes[2] = [i - 1, r];
}

//顺时针旋转飞机90度一次
function rotate90Clockwise(arr) {
  //arr (Array): 待旋转的数组。

  let rotArray = new Array();
  let r_len = arr.length;
  let c_len = arr[0].length;
  for (let i = 0; i < r_len; i++) {
    for (let j = 0; j < c_len; j++) {
      if (!rotArray[j]) {
        rotArray[j] = new Array();
      }
      rotArray[j][r_len - 1 - i] = arr[i][j];
    }
  }
  return rotArray;
}

//是否有重叠
function isOverlap(array, row, col) {
  for (let i = row; i < row + array.length; i++) {
    for (let j = col; j < col + array[0].length; j++) {
      if ((grids[i][j] != 0) & (array[i - row][j - col] != 0)) {
        return true;
      }
    }
  }
  return false;
}

//在游戏区域随机放置飞机
function placePlane(index) {
  //index (int): 飞机的下标。

  let plane = types[planes[index][0]];
  for (let count = 0; count < planes[index][1]; count++) {
    plane = rotate90Clockwise(plane);
  }
  let rowStart = randomNum(0, row_len - plane.length);
  let colStart = randomNum(0, col_len - plane[0].length);
  while (isOverlap(plane, rowStart, colStart)) {
    rowStart = randomNum(0, row_len - plane.length);
    colStart = randomNum(0, col_len - plane[0].length);
  }
  for (let i = rowStart; i < rowStart + plane.length; i++) {
    for (let j = colStart; j < colStart + plane[0].length; j++) {
      if (plane[i - rowStart][j - colStart] != 0) {
        grids[i][j] = plane[i - rowStart][j - colStart];
      }
    }
  }
}

//鼠标事件的响应，左键打开格子
function bindResponseToClick() {
  for (let i = 0; i < row_len; i++) {
    for (let j = 0; j < col_len; j++) {
      let g = document.getElementById(i + "," + j);
      g.onmousedown = function (event) {
        var clickBtn = event.button;
        if (clickBtn == 0) {
          if (grids[i][j] == 2) {
            //找到机头
            g.innerHTML = '<img src="./img/head.png">';
            if (opened[i][j] == 0) {
              finded = finded + 1;
            }
          } else if (grids[i][j] == 1) {
            //找到机身
            g.innerHTML = '<img src="./img/body.png">';
          } else if (grids[i][j] == 0) {
            //没找到
            g.innerHTML = '<img src="./img/blank.png">';
          }
          if (opened[i][j] == 0) {
            opened[i][j] = 1;
            steps = steps + 1;
            step.innerHTML = "步数：&ensp;" + steps;
          }
          if (finded == num) {
            gameMain.style["pointer-events"] = "none";
            if (records == 0) {
              records = steps;
              let recArea = document.getElementById("record");
              recArea.innerHTML = "最快完成：&ensp;" + records;
            } else if (records > steps) {
              records = steps;
              let recArea = document.getElementById("record");
              recArea.innerHTML = "最快完成：&ensp;" + records;
            }
            //全部显示
            html = "";
            for (let i = 0; i < row_len; i++) {
              html += "<tr>";
              for (let j = 0; j < col_len; j++) {
                if (grids[i][j] == 2) {
                  tmp = "head";
                } else if (grids[i][j] == 1) {
                  tmp = "body";
                } else {
                  tmp = "blank";
                }
                if (opened[i][j] == 1) {
                  html +=
                    '<td id="' +
                    i +
                    "," +
                    j +
                    '" class="' +
                    tmp +
                    '"><img src="./img/mark.png"></td>';
                } else {
                  html +=
                    '<td id="' + i + "," + j + '" class="' + tmp + '"></td>';
                }
              }
              html += "</tr>";
            }
            gameMain.innerHTML = html;
            alert("您成功了！");
          }
        }
      };
    }
  }
}
