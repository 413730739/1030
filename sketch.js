let currentQuestion = -1;  // 初始為-1，表示在開始畫面
let score = 0;
let selectedOptions = new Array(10).fill(-1);  // 記錄每一題選中的選項
let backgroundObjects = [];
let questions = [
    {
        question: "第1題\n畫人物時，頭與身體的比例最常見的是哪一種？",
        options: ["A. 1:2", "B. 1:4", "C. 1:7", "D. 1:10"],
        correct: 2
    },
    {
        question: "第2題\n畫一隻貓時，下列哪個形狀最能代表牠的身體基本形？",
        options: ["A. 三角形", "B. 圓形", "C. 長橢圓", "D. 正方形"],
        correct: 2
    },
    {
        question: "第3題\n人臉的五官比例中，眼睛通常位於臉的哪個區域？",
        options: ["A. 上1/3", "B. 中間", "C. 下1/3", "D. 接近下巴"],
        correct: 1
    },
    {
        question: "第4題\n若要簡化魚的形狀，下列哪一種組合最合適？",
        options: ["A. 圓形＋三角形", "B. 正方形＋長方形", "C. 三角形＋三角形", "D. 橢圓形＋三角形"],
        correct: 3
    },
    {
        question: "第5題\n畫手時，如果手掌是長方形，手指的長度大約與手掌相比為？",
        options: ["A. 一半", "B. 相等", "C. 比手掌短", "D. 是手掌的兩倍"],
        correct: 1
    },
    {
        question: "第6題\n若要畫一棟房子，下列哪一個組合最能表現基本結構？",
        options: ["A. 圓形＋圓形", "B. 正方形＋三角形", "C. 長方形＋橢圓形", "D. 三角形＋三角形"],
        correct: 1
    },
    {
        question: "第7題\n耳朵在頭部的高度通常對齊哪兩個部位？",
        options: ["A. 眉毛與嘴巴", "B. 眼睛與鼻底", "C. 頭頂與下巴", "D. 鼻子與下巴"],
        correct: 1
    },
    {
        question: "第8題\n畫人物側面時，下列哪個比例是正確的？",
        options: ["A. 腿長比上半身短", "B. 上半身比腿長", "C. 腿略長於上半身", "D. 頭與腿等長"],
        correct: 2
    },
    {
        question: "第9題\n在觀察靜物時，若要強調立體感，應該先觀察什麼？",
        options: ["A. 顏色", "B. 陰影與光線", "C. 背景", "D. 質地"],
        correct: 1
    },
    {
        question: "第10題\n畫插畫角色時，如果頭太大、身體太小，整體效果會給人什麼感覺？",
        options: ["A. 嚴肅成熟", "B. 幽默可愛", "C. 緊張恐怖", "D. 冷酷帥氣"],
        correct: 1
    }
];

let particles = [];
let fireworks = [];
let gravity;
let showFireworks = false;
let stars = [];
let mouseTrailPoints = [];

// 用於響應式設計的基準尺寸和縮放比例
const baseWidth = 1920;
const baseHeight = 1080;
let scaleFactor;

function setup() {
    createCanvas(windowWidth, windowHeight);
    document.getElementById('start-btn').addEventListener('click', startQuiz);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    document.getElementById('submit-btn').addEventListener('click', showResult);
    gravity = createVector(0, 0.2);
    colorMode(HSB);

    // 計算初始縮放比例
    updateScale();
    
    // 創建星星效果
    for (let i = 0; i < 50; i++) {
        stars.push(new Star());
    }
}

function draw() {
    clear();
    background(255);
    
    // 繪製主要內容
    drawMainContent();
    
    // 最後繪製滑鼠星星效果，確保永遠在最上層
    drawMouseStars();
}

function drawMouseStars() {
    // 更新滑鼠軌跡點
    mouseTrailPoints.push({x: mouseX, y: mouseY});
    if (mouseTrailPoints.length > 20) {
        mouseTrailPoints.shift();
    }
    
    // 繪製滑鼠軌跡星星
    push();
    for (let i = 0; i < mouseTrailPoints.length; i++) {
        let point = mouseTrailPoints[i];
        let size = map(i, 0, mouseTrailPoints.length - 1, 2, 15);
        let alpha = map(i, 0, mouseTrailPoints.length - 1, 50, 255);
        fill(frameCount % 360, 100, 100, alpha);
        noStroke();
        drawStar(point.x, point.y, 5, size/2, size);
    }
    pop();
}

function drawMainContent() {
    // 開始畫面
    if (currentQuestion === -1 && !showFireworks) {
        push();
        textAlign(CENTER, CENTER);
        textSize(48 * scaleFactor);
        fill(0);
        text("形狀與比例觀察測驗", width/2, height/2 - 100 * scaleFactor);
        
        textSize(24 * scaleFactor);
        fill(50);
        text("總共10題", width/2, height/2 - 40 * scaleFactor);
        pop();
        return;
    }
    
    if (showFireworks) {
        background(255);  // 白色背景
        
        // 更新和顯示背景動畫
        if (score <= 80) {  // 只在非滿分時顯示背景動畫
            for (let obj of backgroundObjects) {
                obj.update();
                obj.show();
            }
        } else {  // 滿分時顯示煙火
            // 更新和顯示所有煙火
            for (let i = fireworks.length - 1; i >= 0; i--) {
                fireworks[i].update();
                fireworks[i].show();
                if (fireworks[i].done()) {
                    fireworks.splice(i, 1);
                }
            }
            
            // 隨機產生新的煙火
            if (random(1) < 0.1) {
                fireworks.push(new Firework());
            }
        }
        
        // 顯示分數和回饋
        push();
        textAlign(CENTER, CENTER);
        
        // 分數顯示
        textSize(48 * scaleFactor);
        // 根據分數區間選擇固定文字顏色（HSB）
        let scoreColor;
        if (score <= 20) {
            // 深藍色
            scoreColor = color(220, 80, 40);
        } else if (score <= 40) {
            // 深紫色
            scoreColor = color(280, 80, 40);
        } else if (score <= 60) {
            // 橘黃色
            scoreColor = color(30, 90, 95);
        } else if (score <= 80) {
            // 彩色漸變（動態）
            scoreColor = color(frameCount % 360, 80, 100);
        } else {
            // 高分使用鮮豔綠色（或保留動態）
            scoreColor = color(140, 90, 90);
        }
    noStroke();
    fill(scoreColor);
    text(`得分：${score}分`, width/2, height/3);
        
        // 回饋文字
        let feedback;
        if (score <= 20) feedback = "再加油!";
        else if (score <= 40) feedback = "繼續努力";
        else if (score <= 60) feedback = "還不錯";
        else if (score <= 80) feedback = "很棒唷!";
        else feedback = "非常棒!你都學會了!";
        
    textSize(36 * scaleFactor);
    noStroke();
    fill(scoreColor);
    text(feedback, width/2, height/2);
        pop();
        return;
    }
    
    // 如果測驗正在進行中，顯示題目和選項
    if (currentQuestion >= 0) {
        push();
        background(255);
        // 白色背景

        // 顯示題目
        textSize(36 * scaleFactor);
        fill(0);
        textAlign(CENTER, TOP);
        text(questions[currentQuestion].question, width/2, height/2 - 180 * scaleFactor);
        
        // 顯示選項
        textSize(24 * scaleFactor);
        textAlign(CENTER, CENTER);
        let optionY = height/2 - 40 * scaleFactor;
        let optionWidth = 400 * scaleFactor;
        let optionHeight = 50 * scaleFactor;
        let optionSpacing = 70 * scaleFactor;

        questions[currentQuestion].options.forEach((option, index) => {
            let optionX = width/2;
            
            // 繪製選項按鈕背景
            rectMode(CENTER);
            if (selectedOptions[currentQuestion] === index) {
                // 選中時的顏色
                fill(144, 238, 144);
            } else {
                // 未選中時的顏色
                fill(176, 224, 230);
            }
            stroke(100);
            strokeWeight(1);
            rect(optionX, optionY + index * optionSpacing, optionWidth, optionHeight, 10 * scaleFactor);
            
            // 繪製選項文字
            noStroke();
            fill(0);
            text(option, optionX, optionY + index * optionSpacing);
        });
        pop();
    }
    
    // （已由上方 showFireworks 區段處理結果頁面）
    
    // 更新滑鼠軌跡點
    mouseTrailPoints.push({x: mouseX, y: mouseY});
    if (mouseTrailPoints.length > 20) {
        mouseTrailPoints.shift();
    }
    
    // 繪製滑鼠軌跡星星
    push();
    for (let i = 0; i < mouseTrailPoints.length; i++) {
        let point = mouseTrailPoints[i];
        let size = map(i, 0, mouseTrailPoints.length - 1, 2, 15);
        let alpha = map(i, 0, mouseTrailPoints.length - 1, 50, 255);
        fill(frameCount % 360, 100, 100, alpha);
        noStroke();
        drawStar(point.x, point.y, 5, size/2, size);
    }
    pop();
}

function startQuiz() {
    document.getElementById('start-btn').style.display = 'none';
    currentQuestion = 0;
    showQuestion();
}

function showQuestion() {
    document.getElementById('navigation-buttons').style.display = 'block';
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // 顯示/隱藏上一題按鈕
    prevBtn.style.display = currentQuestion > 0 ? 'inline-block' : 'none';
    
    // 顯示/隱藏下一題和交卷按鈕
    if (selectedOptions[currentQuestion] !== -1) {
        if (currentQuestion === questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    } else {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'none';
    }
}

function mousePressed() {
    if (currentQuestion >= 0 && !showFireworks) {
        let optionY = height/2 - 40 * scaleFactor;
        let optionX = width/2;
        let optionWidth = 400 * scaleFactor;
        let optionHeight = 50 * scaleFactor;
        let optionSpacing = 70 * scaleFactor;
        
        // 檢查是否點擊了任何選項
        questions[currentQuestion].options.forEach((option, index) => {
            let y = optionY + index * optionSpacing;
            if (mouseX > optionX - optionWidth/2 && mouseX < optionX + optionWidth/2 &&
                mouseY > y - optionHeight/2 && mouseY < y + optionHeight/2) {
                // 如果這是一個新的選擇（之前未選擇過）且答案正確
                if (selectedOptions[currentQuestion] === -1 && index === questions[currentQuestion].correct) {
                    score += 10;
                }
                // 如果之前選擇錯誤，現在選擇正確
                else if (selectedOptions[currentQuestion] !== questions[currentQuestion].correct && 
                         index === questions[currentQuestion].correct) {
                    score += 10;
                }
                // 如果之前選擇正確，現在選擇錯誤
                else if (selectedOptions[currentQuestion] === questions[currentQuestion].correct && 
                         index !== questions[currentQuestion].correct) {
                    score -= 10;
                }
                
                selectedOptions[currentQuestion] = index;
                showQuestion(); // 更新按鈕顯示狀態
            }
        });
    }
}

function nextQuestion() {
    currentQuestion++;
    showQuestion();
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

function showResult() {
    document.getElementById('navigation-buttons').style.display = 'none';
    showFireworks = true;
    currentQuestion = -1; // 設置為-1表示測驗結束
    
    // 清空現有的背景物件
    backgroundObjects = [];
    
    // 根據分數創建不同的背景動畫
    if (score <= 20) {
        // 深藍色泡泡
        for (let i = 0; i < 20; i++) {
            // hue 200-240 為藍色
            backgroundObjects.push(new Bubble(random(200, 240)));
        }
    } else if (score <= 40) {
        // 紫色正方形
        for (let i = 0; i < 20; i++) {
            // hue 270-300 為紫色
            let s = new Square();
            s.hue = random(270, 300);
            backgroundObjects.push(s);
        }
    } else if (score <= 60) {
        // 橘黃色三角形
        for (let i = 0; i < 20; i++) {
            // hue 20-40 為橘色
            let t = new Triangle();
            t.hue = random(20, 40);
            backgroundObjects.push(t);
        }
    } else if (score <= 80) {
        // 彩色星星
        for (let i = 0; i < 20; i++) {
            let a = new AnimatedStar();
            a.hue = random(0, 360);
            backgroundObjects.push(a);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateScale();
}

function updateScale() {
    let scaleX = windowWidth / baseWidth;
    let scaleY = windowHeight / baseHeight;
    scaleFactor = min(scaleX, scaleY);

    // 同步更新HTML按鈕的樣式以實現響應式
    const buttons = document.querySelectorAll('.button-container button');
    const baseFontSize = 18;
    const basePaddingY = 12;
    const basePaddingX = 24;
    const baseMargin = 10;

    buttons.forEach(button => {
        button.style.fontSize = `${baseFontSize * scaleFactor}px`;
        button.style.padding = `${basePaddingY * scaleFactor}px ${basePaddingX * scaleFactor}px`;
        button.style.margin = `0 ${baseMargin * scaleFactor}px`;
    });
}

class Firework {
    constructor() {
        this.hu = random(360);
        this.firework = new Particle(random(width), height, this.hu, true);
        this.exploded = false;
        this.particles = [];
    }

    done() {
        return this.exploded && this.particles.every(p => p.done());
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();

            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
        }
    }

    explode() {
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            const p = new Particle(
                this.firework.pos.x,
                this.firework.pos.y,
                this.hu,
                false
            );
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }

        for (let particle of this.particles) {
            particle.show();
        }
    }
}

class Particle {
    constructor(x, y, hu, firework) {
        this.pos = createVector(x, y);
        this.firework = firework;
        this.lifespan = 255;
        this.hu = hu;

        if (this.firework) {
            this.vel = createVector(0, random(-18, -12));
        } else {
            const angle = random(TWO_PI);
            const speed = random(2, 10);
            this.vel = createVector(cos(angle), sin(angle));
            this.vel.mult(random(4, 10));
        }

        this.acc = createVector(0, 0);
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
            this.vel.mult(0.95);
            this.lifespan -= 4;
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    done() {
        return this.lifespan < 0;
    }

    show() {
        colorMode(HSB);
        if (!this.firework) {
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan);
        } else {
            strokeWeight(4);
            stroke(this.hu, 255, 255);
        }
        point(this.pos.x, this.pos.y);
    }
}

class BackgroundObject {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(20, 60);
        this.speed = random(1, 3);
        this.angle = random(TWO_PI);
    }

    update() {
        this.y += this.speed;
        if (this.y > height + this.size) {
            this.y = -this.size;
            this.x = random(width);
        }
        this.angle += 0.02;
    }
}

class Bubble extends BackgroundObject {
    constructor(hue) {
        super();
        this.alpha = random(120, 200);
        this.hue = typeof hue !== 'undefined' ? hue : random(200, 240); // default blue hues
    }

    show() {
        noStroke();
        // HSB: hue, sat, bri, alpha
        fill(this.hue, 80, 90, this.alpha);
        ellipse(this.x, this.y, this.size);
    }
}

class Square extends BackgroundObject {
    constructor() {
        super();
        this.alpha = random(120, 200);
        this.hue = random(270, 300); // default purple
    }

    show() {
        push();
        noStroke();
        fill(this.hue, 60, 60, this.alpha);
        translate(this.x, this.y);
        rotate(this.angle);
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
        pop();
    }
}

class Triangle extends BackgroundObject {
    constructor() {
        super();
        this.alpha = random(120, 200);
        this.hue = random(20, 40); // default orange-ish
    }

    show() {
        push();
        noStroke();
        fill(this.hue, 85, 95, this.alpha);
        translate(this.x, this.y);
        rotate(this.angle);
        beginShape();
        let r = this.size / 2;
        for (let i = 0; i < 3; i++) {
            let ang = TWO_PI * i / 3;
            vertex(cos(ang) * r, sin(ang) * r);
        }
        endShape(CLOSE);
        pop();
    }
}

class AnimatedStar extends BackgroundObject {
    constructor() {
        super();
        this.hue = random(0, 360);
        this.points = 5;
    }

    show() {
        push();
        noStroke();
        fill(this.hue, 80, 100);
        translate(this.x, this.y);
        rotate(this.angle);
        drawStar(0, 0, this.points, this.size/3, this.size/2);
        pop();
    }
}

class Star {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(0.25, 2);
        this.t = random(TWO_PI);
    }

    update() {
        this.t += 0.1;
        this.brightness = map(sin(this.t), -1, 1, 0, 255);
    }

    show() {
        noStroke();
        fill(255, this.brightness);
        ellipse(this.x, this.y, this.size);
    }
}

function drawStar(x, y, points, innerRadius, outerRadius) {
    let angle = TWO_PI / points;
    let halfAngle = angle / 2.0;
    
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * outerRadius;
        let sy = y + sin(a) * outerRadius;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * innerRadius;
        sy = y + sin(a + halfAngle) * innerRadius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}
