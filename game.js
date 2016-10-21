/**
 * 游戏类
 */
var Game = {
    myChoose: 1, //我选择的棋子编号(1 or 2)
    loop: 0, //轮流编号
    board: {
        x: 70, //棋盘左上角位置x
        y: 60, //棋盘左上角位置y
        width: 480, //长度能被3整除
        height: 480, //宽度能被3整除
        lineWidth: 12, //线宽为偶数
        lineColor: '#999', //棋盘线颜色
        bgColor: '#fffce4' //棋盘背景颜色
    },
    seed: {
        radius: 40, //棋子圆形半径
        data: [],  //棋子的二维数组数据(数组的值有 0 1 2，其中0表示该位置没有棋子，1 or 2表示玩家的棋子)
        colors: [['#666', '#000'], ['#eee', '#d8d8d8']], //棋子渐变颜色
        clickColors: [['#999', '#000'], ['#fcfcfc', '#d8d8d8']], //点击棋子后的渐变颜色
        possibleOpacity: [0.2, 0.4], //棋子可以移动的位置的透明度
        colorText: ['黑棋', '白棋']
    }
};

/**
 * 棋子类 绘制一个棋子
 * @param {Number} i 棋子在二维数组的横坐标
 * @param {Number} j 棋子在二维数组的纵坐标
 * @param {Number} color 棋子的颜色编号
 * @param {boolean} isSeed （可选）默认为true，表示是否显示玩家真实的棋子（opacity=1）
 * @returns {HTMLElement} seed 返回该棋子节点
 */
var Seed = function (i, j, color, isSeed) {
    if (arguments.length < 3) {
        throw new Error('Seed构造函数参数的个数不能少于为3位');
    }

    var radius = this.radius; //棋子半径
    var colors = this.colors; //棋子颜色数组
    var x_space = Game.board.width / 3; //棋子横向间隔
    var y_space = Game.board.height / 3; //棋子纵向间隔
    var x = Game.board.x + i * x_space; //计算圆心x坐标位置
    var y = Game.board.y + j * y_space; //计算圆心y坐标位置
    var color1 = colors[color - 1][0];
    var color2 = colors[color - 1][1];

    //创建棋子DOM
    var seed = document.createElement('canvas');
    seed.className = 'seed';
    seed.width = radius * 2;
    seed.height = radius * 2;
    seed.style.left = x - radius + 'px';
    seed.style.top = y - radius + 'px';
    seed.setAttribute('data-site', [i, j].toString());
    seed.setAttribute('data-color', color.toString());

    //判断棋子是真实棋子，还是将要移动到的位置
    if (isSeed === false) {
        seed.setAttribute('data-isSeed', 'false');
        seed.style.opacity = Game.seed.possibleOpacity[color - 1];
    }

    //绘制棋子canvas
    var c = seed.getContext('2d');
    var crg = c.createRadialGradient(radius, radius, radius / 2, radius, radius, radius - radius / 5);
    crg.addColorStop(0, color1);
    crg.addColorStop(1, color2);
    c.fillStyle = crg;
    c.strokeStyle = color2;
    c.lineWidth = 1;
    c.arc(radius, radius, radius, 0, 2 * Math.PI);
    c.fill();
    c.stroke();
    c.save();

    //添加到页面上
    document.getElementById('seeds').appendChild(seed);
    return seed;
};

//让棋子类继承Game.seed
Seed.prototype = Game.seed;

/**
 * 点击棋子显示可能移动到的位置
 * @param {Array} site 点击棋子的坐标
 */
Seed.getPossibleSites = function (site) {
    var i = site[0];
    var j = site[1];
    var up = [i, j - 1];
    var down = [i, j + 1];
    var left = [i - 1, j];
    var right = [i + 1, j];
    var sites = [];
    sites.push(up, down, left, right);

    //过滤 排除错误的点或已存在的点
    sites = sites.filter(function (s) {
        var i = s[0];
        var j = s[1];
        return s[0] >= 0 && s[0] <= 3 && s[1] >= 0 && s[1] <= 3 && this.prototype.data[i][j] === 0;
    }.bind(this));

    return sites;
};


window.onload = function () {
    Game.initBoard();
    Game.initSeedData();
    Game.drawSeeds();
};


/**
 * 初始化棋盘
 */
Game.initBoard = function () {
    var x = this.board.x;
    var y = this.board.y;
    var width = this.board.width;
    var height = this.board.height;
    var lineWidth = this.board.lineWidth;
    var bgColor = this.board.bgColor;
    var lineColor = this.board.lineColor;
    var halfLineWidth = parseInt(lineWidth / 2);

    var c = document.getElementById('board').getContext('2d');

    //绘制棋盘外边框
    c.lineWidth = lineWidth;
    c.strokeStyle = lineColor;
    c.strokeRect(x, y, width, height);

    //绘制棋盘背景
    c.fillStyle = bgColor;
    c.fillRect(x + halfLineWidth, y + halfLineWidth, width - lineWidth, height - lineWidth);

    /**
     * 绘制棋盘线
     * @param x1:线开始位置x
     * @param y1:线开始位置y
     * @param x2:线结束位置x
     * @param y2:线结束位置y
     */
    var drawLine = function (x1, y1, x2, y2) {
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
    };
    drawLine(x, y + (height / 3), x + width, y + (height / 3));
    drawLine(x, y + (height * 2 / 3), x + width, y + (height * 2 / 3));
    drawLine(x + (width / 3), y, x + (width / 3), y + height);
    drawLine(x + (width * 2 / 3), y, x + (width * 2 / 3), y + height);
};

/**
 * 初始化棋子数据（初始化二维数组）
 */
Game.initSeedData = function () {
    var choose = this.myChoose;
    var opt = 3 - choose;

    var row1 = [opt, opt, choose, choose];
    var row2 = [opt, 0, 0, choose];
    var row3 = [opt, 0, 0, choose];
    var row4 = [opt, opt, choose, choose];
    this.seed.data.push(row1, row2, row3, row4);
    this.loop = 1;

    console.log(Game.seed.colorText[Game.loop - 1] + ' 获得了先手');

};

/**
 * 绘制棋子
 */
Game.drawSeeds = function () {
    //清空所有棋子
    var seeds = document.getElementById('seeds');
    seeds.innerHTML = '';

    //处理事件
    this.handleSeedClick();

    //绘制
    this.seed.data.forEach(function (data, i) {
        for (var j = 0; j < data.length; j++) {
            if (data[j] > 0) {
                new Seed(i, j, data[j], true);
            }
        }
    });
};

/**
 * 处理棋子的点击事件
 */
Game.handleSeedClick = function () {
    var clickSite = []; //用于保存点击的棋子位置
    var seedsNodes = document.getElementById('seeds');

    /**
     * 改变棋子样式
     * @param {HTMLElement} ele 棋子节点
     * @param {Array} colors 颜色数组
     * @param {Number} color 颜色编号
     * @param {Number} radius 半径
     */
    var changeStyle = function (ele, colors, color, radius) {
        var c = ele.getContext('2d');
        var color1 = colors[color - 1][0];
        var color2 = colors[color - 1][1];
        var crg = c.createRadialGradient(radius, radius, radius / 2, radius, radius, radius - radius / 5);
        crg.addColorStop(0, color1);
        crg.addColorStop(1, color2);
        c.fillStyle = crg;
        c.arc(radius, radius, radius, 0, 2 * Math.PI);
        c.fill();
    };

    //绑定事件
    seedsNodes.onclick = function (e) {
        var target = e.target ? e.target : e.srcElement;
        var site = target.getAttribute('data-site').split(',');
        site = [parseInt(site[0]), parseInt(site[1])];
        var color = target.getAttribute('data-color') - 0;
        var isSeed = target.getAttribute('data-isSeed') === 'false' ? false : true;

        if (isSeed) {
            if (color !== Game.loop) {
                //return;
            }

            //点击棋子
            if (Game.myChoose) {
                //先移除之前的显示可以移动点的位置
                seedsNodes.querySelectorAll('.seed[data-isSeed="false"]').forEach(function (data) {
                    seedsNodes.removeChild(data);
                });

                //清除之前点击样式
                if (clickSite.length === 2) {
                    var clickNode = seedsNodes.querySelector('.seed[data-site="' + clickSite[0] + ',' + clickSite[1] + '"]');
                    if (clickNode) {
                        var cl = clickNode.getAttribute('data-color') - 0;
                        changeStyle(clickNode, Game.seed.colors, cl, Game.seed.radius);
                    }
                }

                //保存点击的棋子位置
                clickSite = site;

                //绘制可以移动的点
                var sites = Seed.getPossibleSites(site);
                sites.forEach(function (data) {
                    new Seed(data[0], data[1], color, false);
                });
                changeStyle(target, Game.seed.clickColors, color, Game.seed.radius);
            }
        } else {
            //移动棋子
            Game.seed.data[clickSite[0]][clickSite[1]] = 0;
            Game.seed.data[site[0]][site[1]] = color;
            Game.loop = 3 - Game.loop;
            Game.drawSeeds();

            Game.checkRules(site, color);

            console.log('轮到：' + Game.seed.colorText[Game.loop - 1]);

        }
    }
};

Game.checkRules = function (site, color) {
    var i = site[0];
    var j = site[1];
    var up = [i, j - 1];
    var down = [i, j + 1];
    var left = [i - 1, j];
    var right = [i + 1, j];
    var around = [up, down, left, right];

    around = around.filter(function (s) {
        return s[0] >= 0 && s[0] <= 3 && s[1] >= 0 && s[1] <= 3 && this.seed.data
    }.bind(this));


    this.seed.data.forEach(function (data, i) {
        for (var j = 0; j < data.length; j++) {
        }
    });
};



